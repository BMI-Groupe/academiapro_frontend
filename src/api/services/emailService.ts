import emailjs from '@emailjs/browser';

// Configuration EmailJS
const EMAILJS_PUBLIC_KEY = 'g4RdXCsT6TzxIlR87';
const EMAILJS_SERVICE_ID = 'service_8z70hup';
const EMAILJS_TEMPLATE_ID = 'template_uc6s9g7';

// Initialiser EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface EmailParams extends Record<string, unknown> {
    email: string;
    object: string;
    message: string;
}

/**
 * Envoie un email via EmailJS
 */
export const sendEmail = async (params: EmailParams): Promise<{ success: boolean; error?: string }> => {
    try {
        // console.log('Envoi d\'email avec EmailJS:', params);

        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            params,
            EMAILJS_PUBLIC_KEY
        );

        // console.log('Email envoyé avec succès:', response);
        return { success: true };
    } catch (error: any) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        return {
            success: false,
            error: error.text || error.message || 'Erreur inconnue lors de l\'envoi de l\'email'
        };
    }
};

/**
 * Envoie les identifiants du directeur par email
 */
export const sendDirectorCredentials = async (
    email: string,
    phone: string,
    password: string,
    schoolName: string
): Promise<{ success: boolean; error?: string }> => {
    const message = `Bienvenue sur AcademiaPro !

Votre école "${schoolName}" a été créée avec succès.

Vos identifiants de connexion :
- Numéro de téléphone : ${phone}
- Mot de passe : ${password}

Veuillez vous connecter et changer votre mot de passe dès votre première connexion.

Cordialement,
L'équipe AcademiaPro`;

    return sendEmail({
        email,
        object: `Bienvenue sur AcademiaPro - Identifiants de connexion`,
        message
    });
};

/**
 * Envoie les identifiants de l'enseignant par email
 */
export const sendTeacherCredentials = async (
    email: string,
    phone: string,
    password: string,
    teacherName: string
): Promise<{ success: boolean; error?: string }> => {
    const message = `
Bonjour ${teacherName},

Votre compte enseignant a été créé avec succès.

Vos identifiants de connexion :
- Numéro de téléphone : ${phone || 'Non renseigné'}
- Email : ${email}
- Mot de passe : ${password}

Veuillez vous connecter et changer votre mot de passe dès votre première connexion.

Cordialement,
L'équipe AcademiaPro`;

    return sendEmail({
        email,
        object: `Bienvenue sur AcademiaPro - Compte Enseignant`,
        message
    });
};

/**
 * Envoie les identifiants d'un utilisateur système par email
 */
export const sendUserCredentials = async (
    email: string,
    phone: string,
    password: string,
    userName: string,
    role: string
): Promise<{ success: boolean; error?: string }> => {
    const message = `
Bonjour ${userName},

Votre compte utilisateur (${role}) a été créé avec succès sur AcademiaPro.

Vos identifiants de connexion :
- Email : ${email}
- Numéro de téléphone : ${phone || 'Non renseigné'}
- Mot de passe : ${password}

Veuillez vous connecter et changer votre mot de passe dès votre première connexion.

Cordialement,
L'équipe AcademiaPro`;

    return sendEmail({
        email,
        object: `Bienvenue sur AcademiaPro - Vos identifiants`,
        message
    });
};

/**
 * Envoie le code de réinitialisation de mot de passe par email
 */
export const sendPasswordResetOtp = async (
    email: string,
    otp: string,
    name: string
): Promise<{ success: boolean; error?: string }> => {
    const message = `
Bonjour ${name},

Vous avez demandé la réinitialisation de votre mot de passe sur AcademiaPro.

Voici votre code de vérification : ${otp}

Ce code est valable pendant 60 minutes.

Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.

Cordialement,
L'équipe AcademiaPro`;

    return sendEmail({
        email,
        object: `Réinitialisation de mot de passe - Code de vérification`,
        message
    });
};

export default {
    sendEmail,
    sendDirectorCredentials,
    sendTeacherCredentials,
    sendUserCredentials,
    sendPasswordResetOtp
};
