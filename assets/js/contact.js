// Contact form handler - Resend via Cloudflare Pages Function

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

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('Message envoyé avec succès ! Nous vous contacterons rapidement.');
                form.reset();
            } else {
                alert('Erreur : ' + (result.error || "Une erreur est survenue lors de l'envoi."));
            }
        } catch (err) {
            alert('Erreur de connexion. Veuillez vérifier votre connexion et réessayer.');
        } finally {
            // Le token Turnstile est à usage unique et déjà consommé par siteverify :
            // il faut regénérer le widget pour permettre un nouvel envoi.
            setTurnstileToken('');
            if (window.turnstile) window.turnstile.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});
