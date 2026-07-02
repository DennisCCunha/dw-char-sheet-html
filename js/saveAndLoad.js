export class SaveAndLoad {

    static applyState(state) {
    allInputs.forEach((input) => {
        if (state[input.id] !== undefined) {
            if (input.type === 'checkbox') input.checked = state[input.id] === '1';
            else input.value = state[input.id];
        }
    });
    circles.forEach((circle) => {
        if (state[circle.id] === '1') circle.classList.add('active');
        else circle.classList.remove('active');
    });
    }

// Cifra XOR com TextEncoder (suporte a UTF-8 e caracteres acentuados)
    static encodeState(state) {
        const key = 'DungeonWorld2024';
        const bytes = new TextEncoder().encode(JSON.stringify(state));
        const keyBytes = new TextEncoder().encode(key);
        const xored = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            xored[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
        }
        let binary = '';
        for (let i = 0; i < xored.length; i++) binary += String.fromCharCode(xored[i]);
        return btoa(binary);
    }

    static decodeState(code) {
        const key = 'DungeonWorld2024';
        const keyBytes = new TextEncoder().encode(key);
        const binary = atob(code);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const xored = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) xored[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
        return JSON.parse(new TextDecoder().decode(xored));
    }

    static autoSave() {
        try {
            localStorage.setItem('dw_sheet_code', SaveAndLoad.encodeState(collectState()));
        } catch (e) { console.error('Falha ao salvar ficha:', e); }
    }

    static autoLoad() {
        const saved = localStorage.getItem('dw_sheet_code');
        if (!saved) return;
        try {
            SaveAndLoad.applyState(SaveAndLoad.decodeState(saved));
        } catch (e) { console.warn('Falha ao restaurar ficha:', e); }
    }

    static listCharacters() {
        const characters = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('dw_sheet_code_')) {
                const name = key.substring('dw_sheet_code_'.length);
                characters.push(name);
            }
        }
        return characters;
    }

}