/* ------------------------------------------------------------------
   Activation / désactivation temporaire des formulaires du site.

   POUR RÉACTIVER LES FORMULAIRES : passer `disabled` à false ci-dessous
   (une seule ligne à modifier), puis publier. Rien d'autre à toucher.
   ------------------------------------------------------------------ */
window.SANCEA_FORMS = {
    disabled: false,
    message: "Les formulaires seront activés à l'ouverture de la clinique."
};

(function () {
    const config = window.SANCEA_FORMS;
    if (!config || !config.disabled) return;

    const FORM_IDS = ['contactForm', 'referralForm'];

    const injectStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            .forms-disabled-notice {
                background: #fff8e6;
                border: 1px solid #f0c674;
                border-left: 4px solid #e0a800;
                border-radius: 12px;
                padding: 1rem 1.25rem;
                margin-bottom: 1.5rem;
                color: #6b5200;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            .form-disabled-wrapper {
                opacity: 0.55;
                pointer-events: none;
                filter: grayscale(0.4);
            }
        `;
        document.head.appendChild(style);
    };

    const disableForm = (form) => {
        // Bloque l'envoi même si un autre script a déjà posé son handler
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            alert(config.message);
        }, true);

        form.querySelectorAll('input, select, textarea, button').forEach((el) => {
            el.disabled = true;
        });
        form.classList.add('form-disabled-wrapper');

        const notice = document.createElement('div');
        notice.className = 'forms-disabled-notice';
        notice.innerHTML = '<span aria-hidden="true">⏳</span><span></span>';
        notice.lastElementChild.textContent = config.message;
        form.parentNode.insertBefore(notice, form);
    };

    const apply = () => {
        FORM_IDS.forEach((id) => {
            const form = document.getElementById(id);
            if (form) disableForm(form);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { injectStyles(); apply(); });
    } else {
        injectStyles();
        apply();
    }
})();
