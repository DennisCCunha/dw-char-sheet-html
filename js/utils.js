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

    static searchFilter(obj, search) {
        search = Utils.canonical(search);
        return Utils.walk(obj, search);
    }

    static walk(obj, search) {
        if (typeof obj === 'string') {
            return Utils.canonical(obj).includes(search);
        } else if (Array.isArray(obj)) {
            return obj.some(item => Utils.walk(item, search));
        } else if (typeof obj === 'object' && obj !== null) {
            return Object.values(obj).some(value => Utils.walk(value, search));
        }
        return false;
    }


    static combobox(comboId, optionsList, selectedOptions = [], placeholder = "Select options...") {

        return `
            <div class="combobox-wrapper">
                <div class="combobox-container" id="${comboId}">
                    <div class="pill-list" id="${comboId}_pillList">
                        <input type="text" id="${comboId}_searchInput" placeholder="${placeholder}" autocomplete="off" />
                    </div>
                    <span class="arrow" id="${comboId}_dropdownArrow">▼</span>
                </div>
                <ul class="dropdown-menu" id="${comboId}_dropdownMenu">
                    
                </ul>
            </div>
    `;
    }
}