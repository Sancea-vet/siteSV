/**
 * Endpoint public d'envoi des formulaires (contact + référé).
 *
 * IMPORTANT — pourquoi ce fichier existe :
 * une application Cloudflare Access protège `/api/*` (console de gestion,
 * `/api/data`, `/api/freepbx`...). Cette protection attrapait aussi
 * `/api/contact` : le POST du navigateur était redirigé (302) vers la page de
 * login Access, qui ne renvoie aucun en-tête CORS. Le `fetch()` échouait donc
 * avant d'atteindre la fonction, et aucun message n'était jamais envoyé.
 *
 * Les formulaires publics postent maintenant sur `/form/contact`, hors du
 * périmètre d'Access. La logique reste dans functions/api/contact.js, qui est
 * conservé pour compatibilité.
 */
export { onRequestPost, onRequestOptions } from '../api/contact.js';
