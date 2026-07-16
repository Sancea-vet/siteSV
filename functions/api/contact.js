export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    const formData = await request.json();

    // Vérification Cloudflare Turnstile
    const turnstileToken = formData.turnstileToken;
    if (!turnstileToken) {
      return new Response(JSON.stringify({ error: 'Vérification humaine requise' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (!env.TURNSTILE_SECRET) {
      return new Response(JSON.stringify({ error: 'TURNSTILE_SECRET manquant' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: turnstileToken }).toString()
    });

    const verifyJson = await verifyRes.json();
    if (!verifyJson.success) {
      return new Response(JSON.stringify({ error: 'Échec de la vérification Turnstile', details: verifyJson['error-codes'] || null }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Honeypot anti-spam
    if (formData.website && String(formData.website).trim() !== '') {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (!env.RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY manquante' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const isReferral = formData.formType === 'referral';

    const toEmail = isReferral
      ? (env.REFERRAL_TO_EMAIL || 'aleleuch@icloud.com')
      : (env.TO_EMAIL || 'adrien.leleuch.envt@gmail.com');

    const fromEmail = env.FROM_EMAIL || 'contact@sanceavet.fr';

    let subject, htmlBody;

    if (isReferral) {
      if (
        !formData.vetName ||
        !formData.vetEmail ||
        !formData.clinicName ||
        !formData.ownerName ||
        !formData.patientName ||
        !formData.patientSpecies ||
        !formData.referralReason ||
        !formData.clinicalHistory
      ) {
        return new Response(JSON.stringify({ error: 'Champs requis manquants' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      subject = `Référer un patient — ${formData.patientName} (Dr ${formData.vetName})`;

      const careTypeLabels = {
        'prise-en-charge-globale': 'Prise en charge globale',
        'examen-complementaire-isole': 'Examen complémentaire isolé'
      };
      const careTypeLabel = careTypeLabels[formData.careType] || formData.careType || 'Non renseigné';

      const followUpLabels = {
        'veterinaire-traitant': 'Le vétérinaire traitant assure lui-même les suivis',
        'sancea-vet': 'Les suivis sont réalisés par Sancéa Vet'
      };
      const followUpLabel = followUpLabels[formData.followUp] || formData.followUp || 'Non renseigné';

      htmlBody = `
<h3>Référer un patient</h3>

<b>Vétérinaire:</b> ${escapeHtml(formData.vetName)}<br>
<b>Email:</b> ${escapeHtml(formData.vetEmail)}<br>
<b>Téléphone:</b> ${escapeHtml(formData.vetPhone || 'Non renseigné')}<br>
<b>Clinique:</b> ${escapeHtml(formData.clinicName)}<br>

<h4>Patient</h4>
Nom: ${escapeHtml(formData.patientName)}<br>
Espèce: ${escapeHtml(formData.patientSpecies)}<br>

<h4>Motif</h4>
${escapeHtml(formData.referralReason)}<br>
<b>Type de prise en charge souhaité:</b> ${escapeHtml(careTypeLabel)}<br>
<b>Suivi (hors suivi spécialisé):</b> ${escapeHtml(followUpLabel)}

<h4>Historique</h4>
${escapeHtml(formData.clinicalHistory).replace(/\n/g, '<br>')}
`;
    } else {
      if (!formData.name || !formData.email || !formData.message) {
        return new Response(JSON.stringify({ error: 'Champs requis manquants' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      subject = `Nouveau message de ${formData.name}`;

      htmlBody = `
<h3>Nouveau message</h3>

Nom: ${escapeHtml(formData.name)}<br>
Email: ${escapeHtml(formData.email)}<br>

Message:<br>
${escapeHtml(formData.message).replace(/\n/g, '<br>')}
`;
    }

    const resendPayload = {
      from: fromEmail,
      to: [toEmail],
      reply_to: isReferral ? formData.vetEmail : formData.email,
      subject,
      html: htmlBody
    };

    // Ajouter les pièces jointes si présentes (avec validation)
    if (isReferral && formData.attachments && Array.isArray(formData.attachments) && formData.attachments.length > 0) {
      const attachments = formData.attachments;
      const MAX_FILES = 5;
      const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 Mo
      const allowedExt = ['.pdf', '.jpg', '.jpeg', '.png'];

      if (attachments.length > MAX_FILES) {
        return new Response(JSON.stringify({ error: `Maximum ${MAX_FILES} fichiers autorisés` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      function base64ByteSize(b64) {
        if (!b64 || typeof b64 !== 'string') return 0;
        const len = b64.length;
        const padding = b64.endsWith('==') ? 2 : (b64.endsWith('=') ? 1 : 0);
        return Math.floor((len * 3) / 4) - padding;
      }

      for (const att of attachments) {
        if (!att || !att.filename || !att.content || typeof att.content !== 'string') {
          return new Response(JSON.stringify({ error: 'Fichier invalide : nom ou contenu manquant' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const name = String(att.filename).toLowerCase();
        const ext = name.includes('.') ? name.substring(name.lastIndexOf('.')) : '';
        if (!allowedExt.includes(ext)) {
          return new Response(JSON.stringify({ error: `Type de fichier non autorisé: ${ext}` }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const size = base64ByteSize(att.content);
        if (size > MAX_FILE_BYTES) {
          return new Response(JSON.stringify({ error: `Fichier trop volumineux: ${att.filename} (${Math.ceil(size / (1024 * 1024))} Mo)` }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // Le client envoie `content` encodé en base64. On forwarde avec le flag d'encodage.
      resendPayload.attachments = attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        encoding: 'base64'
      }));
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resendPayload)
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: err }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const data = await res.json();

    return new Response(JSON.stringify({
      success: true,
      id: data.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}