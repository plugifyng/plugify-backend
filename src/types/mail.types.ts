/**
 * `EmailOption` is an object with a `recipients` property that can be a single email address or an
 * array of email addresses, and it can optionally have a `from`, `subject`, `templateId`, and
 * `substitutions` property.
 * @property {any | any[]} recipients - The email address(es) of the recipient(s).
 * @property {string} from - The email address of the sender.
 * @property {string} subject - The subject of the email.
 * @property {string} templateId - The ID of the template you want to use.
 * @property {any} substitutions - This is a key-value pair of the variables you want to replace in
 * your template.
 */
export interface EmailOption {
    recipients: string | string[];
    from?: string;
    subject?: string;
    templateName: string; // Specify the template file (e.g., 'email_confirmation')
    replacements: { [key: string]: string }; // Data to inject into the template
}
