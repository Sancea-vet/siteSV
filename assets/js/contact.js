// Contact form handler - Resend via Cloudflare Pages Function
//
// L'endpoint est `/form/contact` et non `/api/contact` : `/api/*` est protégé
// par Cloudflare Access, qui redirigeait le POST (302) vers sa page de login.
// Cette page ne renvoie pas d'en-tête CORS, le fetch échouait donc avant même
// d'atteindre la fonction et aucun message n'était envoyé.
const FORM_ENDPOINT = '/form/contact';
const SUBMIT_TIMEOUT_MS = 60000;

// Fill the Turnstile token when the widget validates
const setTurnstileToken = (value) => {
    const t = document.getElementById('turnstileToken');
    if (t) t.value = value;
};

window.onTurnstileSuccess = (token) => setTurnstileToken(token);
window.onTurnstileExpired = () => setTurnstileToken('');
window.onTurnstileError = (code) => {
    setTurnstileToken('');
    console.error('Turnstile error', code);
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Envoi en cours...';
        submitBtn.disabled = true;

        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            animal: document.getElementById('animal').value,
            message: document.getElementById('message').value.trim(),
            website: document.getElementById('website').value, // honeypot anti-spam
            turnstileToken: (document.getElementById('turnstileToken') || {}).value || ''
        };

        // block submit if no Turnstile token (helps when widget failed to load)
        if (!formData.turnstileToken) {
            alert("Veuillez compléter la vérification anti-spam avant d'envoyer le message. Si elle ne s'affiche pas, rechargez la page ou écrivez-nous à contact@sanceavet.fr.");
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        // Sans garde-fou, une requête qui n'aboutit jamais laisse le bouton
        // bloqué sur « Envoi en cours... » : on borne l'attente.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

        try {
            const response = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                signal: controller.signal
            });

            let result = {};
            try {
                result = await response.json();
            } catch (parseErr) {
                alert('Erreur : réponse inattendue du serveur (code ' + response.status + '). Réessayez ou écrivez-nous à contact@sanceavet.fr.');
                return;
            }

            if (response.ok && result.success) {
                alert('Message envoyé avec succès ! Nous vous contacterons rapidement.');
                form.reset();
            } else {
                alert('Erreur : ' + (result.error || "Une erreur est survenue lors de l'envoi."));
            }
        } catch (err) {
            if (err && err.name === 'AbortError') {
                alert("L'envoi a pris trop de temps et a été interrompu. Réessayez ou écrivez-nous à contact@sanceavet.fr.");
            } else {
                alert('Erreur de connexion. Veuillez vérifier votre connexion et réessayer.');
            }
        } finally {
            clearTimeout(timeoutId);
            // Le token Turnstile est à usage unique et déjà consommé par siteverify :
            // il faut regénérer le widget pour permettre un nouvel envoi.
            setTurnstileToken('');
            if (window.turnstile) window.turnstile.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});
