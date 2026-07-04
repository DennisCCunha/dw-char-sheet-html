export default class Utils {
// Canonicalização: remove acentos e normaliza para lower-case
    static canonical(text) {
        return (text || '')
            .toString()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .trim()
            .toLowerCase();
    }
    static capitalize(s) {
    if (!s) return s;
        return s[0].toUpperCase() + s.slice(1).toLowerCase();
    }
}