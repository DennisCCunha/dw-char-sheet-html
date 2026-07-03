import dungeonworld from "../data/dungeonworld.json" with { type: "json" };

// Garantir ids únicos para todos os inputs/checkboxes/circles e usar esses ids ao salvar/carregar
const circles = Array.from(document.querySelectorAll('.circle'));
const allInputs = Array.from(document.querySelectorAll('input, select, textarea'));

const intitialAttributesCheck = 73 // Soma de 16+15+13+12+9+8
const initialAttributes = {
    stat: [16, 15, 13, 12, 9, 8],
    mod: [2, 1, 1, 0, 0, -1]
}

const classDetails = dungeonworld.classses || [];

// Atribui ids automáticos quando ausentes, preservando ids existentes
allInputs.forEach((input, index) => {
    if (!input.id) {
        input.id = input.type === 'checkbox' ? `cb_auto_${index}` : `input_auto_${index}`;
    }
});

circles.forEach((circle, index) => {
    if (!circle.id) circle.id = `xp_${index}`;
});

// === Sistema de código de ficha ===

function collectState() {
    const state = {};
    allInputs.forEach((input) => {
        if (input.type === 'checkbox') state[input.id] = input.checked ? '1' : '0';
        else state[input.id] = input.value;
    });
    circles.forEach((circle) => {
        state[circle.id] = circle.classList.contains('active') ? '1' : '0';
    });
    return state;
}

function applyState(state) {
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
function encodeState(state) {
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

function decodeState(code) {
    const key = 'DungeonWorld2024';
    const keyBytes = new TextEncoder().encode(key);
    const binary = atob(code);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const xored = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) xored[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
    return JSON.parse(new TextDecoder().decode(xored));
}

function autoSave() {
    try {
        localStorage.setItem('dw_sheet_code', encodeState(collectState()));
    } catch (e) { /* silent */ }
}

function autoLoad() {
    const saved = localStorage.getItem('dw_sheet_code');
    if (!saved) return;
    try {
        applyState(decodeState(saved));
    } catch (e) {
        console.warn('Falha ao restaurar ficha:', e);
    }
}

// Alias para manter compatibilidade com todas as chamadas existentes
const saveStateToURL = autoSave;

// Renderiza movimentos e informações da classe selecionada dentro do elemento #classMoves
function renderClassMoves() {
    const container = document.getElementById('classMoves');
    if (!container) return;
    const classSelect = document.getElementById('charClass');
    const raceSelect = document.getElementById('charRace');
    const className = classSelect ? classSelect.value : '';
    const race = raceSelect ? raceSelect.value : '';

    let html = '';
    if (!className) {
        html = '<div style="padding:12px"><em>Selecione uma classe para ver os movimentos.</em></div>';
        container.innerHTML = html;
        return;
    }

    const cls = classDetails.find((cd) => canonical(cd.nome) === canonical(className));
    if (!cls) {
        container.innerHTML = '<div style="padding:12px"><em>Classe não encontrada em classDetails.</em></div>';
        return;
    }

    // Cabeçalho com info básica
    html += `<div style="padding:12px"><h2>${cls.nome}</h2>`;
    html += `<p><strong>HP base:</strong> ${cls.hp_base ?? '-'} &nbsp; <strong>Dado de dano:</strong> ${cls.dado_dano ?? '-'} &nbsp; <strong>Carga base:</strong> ${cls.carga_base ?? '-'}</p>`;

    function renderList(title, arr) {
        if (!arr || !arr.length) return '';
        let s = `<h3>${title}</h3><ul>`;
        arr.forEach((it) => { s += `<li>${it?.nome ?? it}</li>`; });
        s += '</ul>';
        return s;
    }

    html += renderList('Movimentos iniciais', cls.movimentos_iniciais || []);

    // movimentos raciais específicos para a raça selecionada
    if (cls.movimentos_raciais && race) {
        const keys = Object.keys(cls.movimentos_raciais || {});
        const found = keys.find((k) => canonical(k) === canonical(race));
        const mr = found ? cls.movimentos_raciais[found] : null;
        if (mr && mr.length) html += renderList(`Movimentos raciais: ${race}`, mr);
    }

    html += renderList('Escolhas iniciais', cls.escolha_inicial || []);
    html += renderList('Movimentos (níveis 2-5)', cls.movimentos_avancados_2_5 || []);
    html += renderList('Movimentos (níveis 6-10)', cls.movimentos_avancados_6_10 || []);
    if (cls.movimentos_substituidos) {
        let s = '<h3>Movimentos substituídos</h3><ul>';
        Object.entries(cls.movimentos_substituidos).forEach(([k, v]) => { s += `<li>${k} → ${v}</li>`; });
        s += '</ul>';
        html += s;
    }

    html += '</div>';
    container.innerHTML = html;
}

// Canonicalização: remove acentos e normaliza para lower-case
function canonical(text) {
    return (text || '')
        .toString()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .trim()
        .toLowerCase();
}

function capitalize(s) {
    if (!s) return s;
    return s[0].toUpperCase() + s.slice(1).toLowerCase();
}

// === Funções de classe/atributo (escopo de módulo) ===
function findClassByName(name) {
    if (!name) return null;
    const normalized = canonical(name);
    return classDetails.find((cd) => canonical(cd.nome) === normalized) || null;
}

function updateClassSpellsVisibility() {
    const classSelect = document.getElementById('charClass');
    const classSpells = document.getElementById('classSpells');
    if (!classSpells || !classSelect) return;
    const sel = canonical(classSelect.value);
    classSpells.style.display = (sel === 'mago' || sel === 'clerigo') ? '' : 'none';
}

function applyClassEffects() {
    const classSelect = document.getElementById('charClass');
    const selectedName = classSelect ? classSelect.value : '';
    const cls = findClassByName(selectedName);
    const charDmgInput = document.getElementById('charDmg');
    const charPVInput = document.getElementById('charPV');
    const conVal = parseInt((document.getElementById('valCon') || { value: '' }).value, 10);
    const conNum = Number.isFinite(conVal) ? conVal : 0;

    if (cls) {
        if (charDmgInput) charDmgInput.value = cls.dado_dano;
        if (charPVInput) charPVInput.value = (cls.hp_base || 0) + conNum;
        const charLoadInput = document.getElementById('charLoad');
        const modForEl = document.getElementById('modFor');
        let modForNum = 0;
        if (modForEl && modForEl.value) {
            const parsed = parseInt(modForEl.value.replace(/[^0-9-]/g, ''), 10);
            if (!Number.isNaN(parsed)) modForNum = parsed;
        } else {
            const valFor = parseInt((document.getElementById('valFor') || { value: '' }).value, 10);
            if (Number.isFinite(valFor)) modForNum = Math.floor((valFor - 10) / 2);
        }
        if (charLoadInput) charLoadInput.value = (cls.carga_base || 0) + modForNum;
    } else {
        if (charDmgInput) charDmgInput.value = '';
        if (charPVInput) charPVInput.value = '';
        const charLoadInput = document.getElementById('charLoad');
        if (charLoadInput) charLoadInput.value = '';
    }
    updateClassSpellsVisibility();
}


// Funções para adicionar itens, magias e movimentos à ficha
function addEquipmentToList(listId) {
    const listEl = document.getElementById(listId);
    if (!listEl) return;
    const item = "<div class='list-item' style='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px;'>" +
        "<input class='spell-name' type='text' placeholder='Nome do equipamento' style='flex:2' />" +
        "<input class='spell-name' type='number' placeholder='Peso' min='0' style='width:60px' />" +
        "<button onclick=\"this.closest('.list-item').remove()\" class='removeIcon'>&#215</button>" +
        "</div>";
    listEl.insertAdjacentHTML('beforeend', item);
}


function addConsumableToList(listId) {
    const listEl = document.getElementById(listId);
    if (!listEl) return;
    const item = "<div class='list-item' style='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px;'>" +
        "<input class='spell-name' type='text' placeholder='Nome do consumível' style='flex:2' />" +
        "<input class='spell-name' type='number' placeholder='Peso' min='0' style='width:60px' />" +
        "<div class='use-boxes' style='display:flex;gap:4px;flex-wrap:wrap;align-items:center'></div>" +
        "<button onclick=\"addConsumableUse(this.closest('.list-item'))\" class='addConsumable'>&#x2b</button>" +
        "<button onclick=\"this.closest('.list-item').remove()\" class='removeIcon'>&#215</button>" +

        "</div>";
    listEl.insertAdjacentHTML('beforeend', item);
}

function addConsumableUse(itemEl) {
    const useBoxes = itemEl.querySelector('.use-boxes');
    if (!useBoxes) return;
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'gold_filling';
    useBoxes.appendChild(cb);
}

function addSpellToList(listId, spellName) {

}

// Tabela de modificadores Dungeon World
function computeModifier(val) {
    const v = parseInt(val, 10);
    if (!Number.isFinite(v)) return '';
    if (v <= 3) return '-3';
    if (v <= 5) return '-2';
    if (v <= 8) return '-1';
    if (v <= 11) return '+0';
    if (v <= 15) return '+1';
    if (v <= 17) return '+2';
    return '+3';
}

const attrPairs = [
    { val: 'valFor', mod: 'modFor' },
    { val: 'valDes', mod: 'modDes' },
    { val: 'valCon', mod: 'modCon' },
    { val: 'valInt', mod: 'modInt' },
    { val: 'valSab', mod: 'modSab' },
    { val: 'valCar', mod: 'modCar' },
];

function updateModifiers() {
    attrPairs.forEach(({ val, mod }) => {
        const valEl = document.getElementById(val);
        const modEl = document.getElementById(mod);
        if (valEl && modEl) modEl.value = computeModifier(valEl.value);
    });
}

function updateStrikethrough() {
    const used = new Set();
    attrPairs.forEach(({ val }) => {
        const v = parseInt(document.getElementById(val)?.value, 10);
        if (Number.isFinite(v) && v > 0) used.add(v);
    });
    document.querySelectorAll('.init-val').forEach((span) => {
        if (used.has(parseInt(span.dataset.val, 10))) span.classList.add('used');
        else span.classList.remove('used');
    });
}

// Aplica restrições cruzadas entre `charRace` e `charClass`.
function ClassSelector() {
    const raceInput = document.getElementById('charRace');
    const classSelect = document.getElementById('charClass');

    function findAllowedClasses(race) {
        if (!race) return null;
        const normalized = canonical(race);
        const allowed = classDetails
            .filter((cd) => (cd.racas || []).some((r) => canonical(r) === normalized))
            .map((cd) => cd.nome);
        return allowed.length ? allowed : null;
    }

    function findAllowedRaces(className) {
        if (!className) return null;
        const normalized = canonical(className);
        const cls = classDetails.find((cd) => canonical(cd.nome) === normalized);
        return (cls && cls.racas && cls.racas.length) ? cls.racas : null;
    }

    function updateClassOptions() {
        const race = raceInput.value;
        const allowed = findAllowedClasses(race);
        const allowedSet = allowed ? new Set(allowed.map((a) => canonical(a))) : null;
        Array.from(classSelect.options).forEach((option) => {
            if (!option.value) return;
            const optCan = canonical(option.value);
            const isDisabled = allowedSet === null ? false : !allowedSet.has(optCan);
            option.disabled = isDisabled;
            if (isDisabled) option.classList.add('disabled-by-race');
            else option.classList.remove('disabled-by-race');
        });
        const selected = classSelect.value;
        if (selected && classSelect.querySelector(`option[value="${selected}"]`).disabled) {
            classSelect.value = '';
        }
        applyClassEffects();
    }

    function updateRaceOptions() {
        const className = classSelect.value;
        const allowedRaces = findAllowedRaces(className);
        const allowedSet = allowedRaces ? new Set(allowedRaces.map((r) => canonical(r))) : null;
        Array.from(raceInput.options).forEach((option) => {
            if (!option.value) return;
            const optCan = canonical(option.value);
            const isDisabled = allowedSet === null ? false : !allowedSet.has(optCan);
            option.disabled = isDisabled;
            if (isDisabled) option.classList.add('disabled-by-race');
            else option.classList.remove('disabled-by-race');
        });
        const selectedRace = raceInput.value;
        if (selectedRace && raceInput.querySelector(`option[value="${selectedRace}"]`).disabled) {
            raceInput.value = '';
        }
    }

    raceInput.addEventListener('change', () => {
        updateClassOptions();
        saveStateToURL();
        renderClassMoves();
    });

    classSelect.addEventListener('change', () => {
        const opt = classSelect.selectedOptions[0];
        if (opt && opt.disabled) classSelect.value = '';
        updateRaceOptions();
        applyClassEffects();
        saveStateToURL();
        renderClassMoves();
    });

    updateClassOptions();
    updateRaceOptions();
}

circles.forEach((circle, index) => {
    circle.addEventListener('click', () => {
        const isActive = circle.classList.contains('active');
        if (!isActive) {
            for (let i = 0; i <= index; i++) circles[i].classList.add('active');
        } else {
            for (let i = index; i < circles.length; i++) circles[i].classList.remove('active');
        }
        saveStateToURL();
    });
});

allInputs.forEach((input) => {
    input.addEventListener('input', saveStateToURL);
    input.addEventListener('change', saveStateToURL);
});

// Recalcula modificadores e risca atributos iniciais usados ao editar valor
attrPairs.forEach(({ val }) => {
    const el = document.getElementById(val);
    if (el) el.addEventListener('input', () => {
        updateModifiers();
        updateStrikethrough();
        applyClassEffects();
        autoSave();
    });
});

autoLoad();
ClassSelector();
updateModifiers();
updateStrikethrough();
// Renderiza movimentos iniciais de acordo com seleção atual
renderClassMoves();

// === Eventos dos botões de código ===
document.getElementById('btnGerarCodigo').addEventListener('click', () => {
    document.getElementById('codeModalText').value = encodeState(collectState());
    document.getElementById('codeModal').style.display = 'flex';
});

document.getElementById('btnFecharModal').addEventListener('click', () => {
    document.getElementById('codeModal').style.display = 'none';
});

document.getElementById('btnCopiarCodigo').addEventListener('click', () => {
    const ta = document.getElementById('codeModalText');
    ta.select();
    try {
        navigator.clipboard.writeText(ta.value);
    } catch (e) {
        document.execCommand('copy');
    }
    const btn = document.getElementById('btnCopiarCodigo');
    btn.textContent = '\u2705 Copiado!';
    setTimeout(() => { btn.textContent = '\uD83D\uDCCB Copiar'; }, 2000);
});

document.getElementById('btnRestaurar').addEventListener('click', () => {
    document.getElementById('restoreCodeInput').value = '';
    document.getElementById('restoreError').style.display = 'none';
    document.getElementById('restoreModal').style.display = 'flex';
});

document.getElementById('btnConfirmarRestaurar').addEventListener('click', () => {
    const code = document.getElementById('restoreCodeInput').value.trim();
    try {
        applyState(decodeState(code));
        autoSave();
        ClassSelector();
        updateModifiers();
        updateStrikethrough();
        renderClassMoves();
        document.getElementById('restoreModal').style.display = 'none';
    } catch (e) {
        document.getElementById('restoreError').style.display = 'block';
    }
});

document.getElementById('btnCancelarRestaurar').addEventListener('click', () => {
    document.getElementById('restoreModal').style.display = 'none';
});


document.getElementById('addConsumable')?.addEventListener('click', () => {
    addConsumableToList('consumablesContainer');
});

document.getElementById('addEquipment')?.addEventListener('click', () => {
    addEquipmentToList('equipmentContainer');
});


// Método para limpar a ficha (retornar ao estado 0)
function clearSheet() {
    // Limpar localStorage
    try {
        localStorage.removeItem('dw_sheet_code');
    } catch (e) { /* silent */ }

    // Limpar sessionStorage
    try {
        sessionStorage.removeItem('dw_sheet_code');
    } catch (e) { /* silent */ }

    // Limpar todos os inputs
    allInputs.forEach((input) => {
        if (input.type === 'checkbox') input.checked = false;
        else input.value = '';
    });

    // Limpar todos os círculos de XP
    circles.forEach((circle) => {
        circle.classList.remove('active');
    });

    // Resetar selectboxes
    document.getElementById('charRace').value = '';
    document.getElementById('charClass').value = '';

    // Atualizar modifiers e strikes
    updateModifiers();
    updateStrikethrough();
    applyClassEffects();
    renderClassMoves();
}

document.getElementById('btnLimpar').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar a ficha? Esta ação não pode ser desfeita.')) {
        clearSheet();
    }
});

// Fechar modais clicando no fundo escuro
['codeModal', 'restoreModal', 'clearModal'].forEach((id) => {
    document.getElementById(id).addEventListener('click', (e) => {
        if (e.target.id === id) document.getElementById(id).style.display = 'none';
    });
});