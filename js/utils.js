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

    static carousel(cardsItens) {
        return `<div id="carouselExample" class="carousel slide">
                <div class="carousel-inner">
                    <div class="carousel-item active">
                    <img src="..." class="d-block w-100" alt="...">
                    </div>
                    
                    
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                </button>
                </div>`
    }

    static carouselItem(card){
        return `<div class="carousel-item">
                    ${card}
                </div>`
    }
}