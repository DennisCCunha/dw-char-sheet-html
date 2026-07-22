import dungeonworld from "../data/dungeonworld.json" with { type: "json" };
import SaveAndLoad from './saveAndLoad.js';
import Mechanics from './mechanics.js';
import Character from './character.js';
import Utils from './utils.js';

// Maps each attribute's element IDs to its Character model property key.
// Used to drive events, modifier updates, and strikethrough logic from a single source of truth.
const ATTR_MAP = [
    { val: 'valFor', mod: 'modFor', deb: 'debFor', key: 'forca'        },
    { val: 'valDes', mod: 'modDes', deb: 'debDes', key: 'destreza'     },
    { val: 'valCon', mod: 'modCon', deb: 'debCon', key: 'constituicao' },
    { val: 'valInt', mod: 'modInt', deb: 'debInt', key: 'inteligencia' },
    { val: 'valSab', mod: 'modSab', deb: 'debSab', key: 'sabedoria'    },
    { val: 'valCar', mod: 'modCar', deb: 'debCar', key: 'carisma'      },
];

class CharacterSheet {

    constructor() {
        document.addEventListener('DOMContentLoaded', () => this.#init());
    }

    // ─── Initialisation ───────────────────────────────────────────────────────

    #init() {
        this.circles    = Array.from(document.querySelectorAll('.circle'));
        this.allInputs  = Array.from(document.querySelectorAll('input, select, textarea'));
        this.charRace   = document.getElementById('charRace');
        this.charClass  = document.getElementById('charClass');
        this.quill      = new Quill(document.getElementById('charNotes'), { theme: 'snow' });
        this.character  = new Character();

        this.classDetails       = dungeonworld.classes || [];
        this.movementListFormat = 'card';
        this.spellListFormat    = 'card';
        this.showClassMoves     = false; // false = movimentos básicos, true = movimentos de classe

        this.#assignMissingIds();
        this.#registerEvents();
        this.#startup();
    }

    /** Ensures every input and XP circle has a stable ID for save/load. */
    #assignMissingIds() {
        this.allInputs.forEach((input, i) => {
            if (!input.id) input.id = input.type === 'checkbox' ? `cb_auto_${i}` : `input_auto_${i}`;
        });
        this.circles.forEach((circle, i) => {
            if (!circle.id) circle.id = `xp_${i}`;
        });
    }

    /** Runs once after the DOM is ready and all events are wired. */
    #startup() {
        this.clearInputs();
        this.load();
        this.#syncClassRaceSelectors();
        this.updateModifiers();
        this.updateStrikethrough();
        this.updateAlignmentOptions();
        this.renderClassMoves();
        this.renderClassSpells();
        this.applyClassEffects();
        console.log('Ficha iniciada com sucesso.');
    }

    // ─── Event registration ───────────────────────────────────────────────────

    #registerEvents() {
        this.#registerAttrEvents();
        this.#registerSimpleFieldEvents();
        this.#registerCircleEvents();
        this.#registerAutoSaveEvents();
        this.#registerModalEvents();
        this.#registerClassRaceEvents();
        this.#registerViewToggleEvents();
        this.#registerInventoryEvents();
        this.#registerBondEvents();
        this.#registerMovementTypeToggle();
        this.#registerSearchEvents();
    }

    /** Attribute value inputs update the character model, modifiers, and derived fields. */
    #registerAttrEvents() {
        ATTR_MAP.forEach(({ val, key }) => {
            document.getElementById(val).addEventListener('input', (e) => {
                this.character.atributos[key] = parseInt(e.target.value, 10) || 0;
                this.updateModifiers();
                this.updateStrikethrough();
                this.applyClassEffects();
                this.updateAlignmentOptions();
                this.save();
            });
        });

        ATTR_MAP.forEach(({ deb, key }) => {
            document.getElementById(deb).addEventListener('change', (e) => {
                this.character.debilidade[key] = e.target.checked;
                this.updateModifiers();
                this.save();
            });
        });
    }

    /**
     * Wires all remaining named inputs to their corresponding Character fields.
     * Any input listed here is owned by Character and round-trips through it on save/load.
     */
    #registerSimpleFieldEvents() {
        const FIELD_MAP = [
            { id: 'charName',      set: (v) => { this.character.nome        = v; } },
            { id: 'charLevel',     set: (v) => { this.character.nivel       = parseInt(v, 10) || 1; } },
            { id: 'curPV',         set: (v) => { this.character.pv_atual    = parseInt(v, 10) || 0; } },
            { id: 'charPV',        set: (v) => { this.character.pv_max      = parseInt(v, 10) || 0; } },
            { id: 'charLoad',      set: (v) => { this.character.carga       = parseInt(v, 10) || 0; } },
            { id: 'charDef',       set: (v) => { this.character.armadura    = parseInt(v, 10) || 0; } },
            { id: 'charDmg',       set: (v) => { this.character.dado_dano   = v; } },
            { id: 'charAlignment', set: (v) => { this.character.alinhamento = v; } },
        ];
        FIELD_MAP.forEach(({ id, set }) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('input',  (e) => { set(e.target.value); this.save(); });
            el.addEventListener('change', (e) => { set(e.target.value); this.save(); });
        });

        // Quill notes — serialise the full Delta so formatting is preserved
        this.quill.on('text-change', () => {
            this.character.notas = JSON.stringify(this.quill.getContents());
            this.save();
        });
    }

    /** XP circles fill/clear all circles up to or from the clicked index. */
    #registerCircleEvents() {
        this.circles.forEach((circle, index) => {
            circle.addEventListener('click', () => {
                const filling = !circle.classList.contains('active');
                if (filling) {
                    for (let i = 0; i <= index; i++) {
                        this.circles[i].classList.add('active');
                        this.character.xp[i] = true;
                    }
                } else {
                    for (let i = index; i < this.circles.length; i++) {
                        this.circles[i].classList.remove('active');
                        this.character.xp[i] = false;
                    }
                }
                this.save();
            });
        });
    }

    /** Every input and select auto-saves on change. */
    #registerAutoSaveEvents() {
        this.allInputs.forEach((input) => {
            input.addEventListener('input',  () => this.save());
            input.addEventListener('change', () => this.save());
        });
    }

    #registerModalEvents() {
        // Generate code — always reflects the current Character model
        document.getElementById('btnGerarCodigo').addEventListener('click', () => {
            document.getElementById('codeModalText').value = SaveAndLoad.encodeState(
                Character.toState(this.character)
            );
            this.#openModal('codeModal');
        });
        document.getElementById('btnFecharModal').addEventListener('click',
            () => this.#closeModal('codeModal'));

        document.getElementById('btnCopiarCodigo').addEventListener('click', () => {
            const ta  = document.getElementById('codeModalText');
            const btn = document.getElementById('btnCopiarCodigo');
            ta.select();
            navigator.clipboard.writeText(ta.value).catch(() => document.execCommand('copy'));
            btn.textContent = '✅ Copiado!';
            setTimeout(() => { btn.textContent = '📋 Copiar'; }, 2000);
        });

        // Restore from code
        document.getElementById('btnRestaurar').addEventListener('click', () => {
            document.getElementById('restoreCodeInput').value = '';
            document.getElementById('restoreError').style.display = 'none';
            this.#openModal('restoreModal');
        });
        document.getElementById('btnConfirmarRestaurar').addEventListener('click', () => {
            const code = document.getElementById('restoreCodeInput').value.trim();
            try {
                this.character = Character.fromState(SaveAndLoad.decodeState(code));
                this.populateDOM(this.character);
                this.save();
                this.#syncClassRaceSelectors();
                this.updateModifiers();
                this.updateStrikethrough();
                this.renderClassMoves();
                this.#closeModal('restoreModal');
            } catch (e) {
                console.error('Erro ao restaurar código:', e);
                document.getElementById('restoreError').style.display = 'block';
            }
        });
        document.getElementById('btnCancelarRestaurar').addEventListener('click',
            () => this.#closeModal('restoreModal'));

        // Clear sheet
        document.getElementById('btnLimpar').addEventListener('click', () => {
            if (confirm('Tem certeza que deseja limpar a ficha? Esta ação não pode ser desfeita.')) {
                this.clearSheet();
            }
        });

        // Close any modal by clicking its dark backdrop
        ['codeModal', 'restoreModal', 'clearModal'].forEach((id) => {
            document.getElementById(id)?.addEventListener('click', (e) => {
                if (e.target.id === id) this.#closeModal(id);
            });
        });
    }

    #registerClassRaceEvents() {
        this.charRace.addEventListener('change', () => {
            this.character.raca = this.charRace.value !== 'Raça' ? this.charRace.value : '';
            this.#syncClassRaceSelectors();
            this.applyClassEffects();
            this.renderClassMoves();
            this.save();
        });

        this.charClass.addEventListener('change', () => {
            this.character.classe = this.charClass.value !== 'Classe' ? this.charClass.value : '';
            if (this.charClass.selectedOptions[0]?.disabled) this.charClass.value = '';
            this.#syncClassRaceSelectors();
            this.applyClassEffects();
            this.renderClassMoves();
            this.updateAlignmentOptions();
            this.save();
        });
    }

    /** Wires the card/list toggle buttons for both moves and spells. */
    #registerViewToggleEvents() {
        this.#addViewToggle('btnMoveCardView', 'btnMoveListView', (fmt) => {
            this.movementListFormat = fmt;
            this.renderClassMoves();
        });
        this.#addViewToggle('btnSpellCardView', 'btnSpellListView', (fmt) => {
            this.spellListFormat = fmt;
            this.renderClassSpells();
        });
    }

    #registerSearchEvents() {
        document.getElementById('movementSearch')?.addEventListener('input', (e) => {
            this.renderClassMoves(e.target.value);
        });
        document.getElementById('spellSearch')?.addEventListener('input', (e) => {
            this.renderClassSpells(e.target.value);
        });
    }

    /**
     * Wires a card/list toggle button pair.
     * Calls onChange('card') or onChange('list') whenever the active format changes.
     */
    #addViewToggle(cardBtnId, listBtnId, onChange) {
        const cardBtn = document.getElementById(cardBtnId);
        const listBtn = document.getElementById(listBtnId);
        cardBtn.classList.add('selected'); // card is the default

        cardBtn.addEventListener('click', () => {
            cardBtn.classList.add('selected');
            listBtn.classList.remove('selected');
            onChange('card');
        });
        listBtn.addEventListener('click', () => {
            listBtn.classList.add('selected');
            cardBtn.classList.remove('selected');
            onChange('list');
        });
    }

    #registerInventoryEvents() {
        document.getElementById('addEquipment')?.addEventListener('click',
            () => this.addEquipmentToList('equipmentContainer'));
        document.getElementById('addConsumable')?.addEventListener('click',
            () => this.addConsumableToList('consumablesContainer'));
        document.getElementById('btnAddMovement')?.addEventListener('click',
            () => this.character.addMovement());
    }

    #registerBondEvents() {
        document.getElementById('btnAddBond').addEventListener('click', () => {
            this.addBondToActiveList(document.getElementById('charBonds').value.trim());
        });
    }

    #registerMovementTypeToggle() {
        document.getElementById('toggleMovementType').addEventListener('change', (e) => {
            this.showClassMoves = e.target.checked;
            Array.from(document.getElementsByClassName('toggleLabel')).forEach((el) => {
                el.textContent = e.target.checked ? 'Movimentos de Classe' : 'Movimentos Básicos';
            });
            this.renderClassMoves();
        });
    }

    // ─── Modal helpers ────────────────────────────────────────────────────────

    #openModal(id)  { document.getElementById(id).style.display = 'flex'; }
    #closeModal(id) { document.getElementById(id).style.display = 'none'; }

    // ─── Persistence ─────────────────────────────────────────────────────────

    save() { SaveAndLoad.autoSave(this.character); }

    load() {
        const saved = SaveAndLoad.autoLoad();
        if (saved) {
            this.character = saved;
            this.populateDOM(this.character);
        }
    }

    // ─── DOM population ───────────────────────────────────────────────────────

    /**
     * Writes all Character fields back to their corresponding DOM elements.
     * Call this after loading or restoring a character.
     */
    populateDOM(character) {
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val ?? '';
        };

        setVal('charName',  character.nome);
        setVal('charLevel', character.nivel);
        setVal('charPV',    character.pv_max);
        setVal('curPV',     character.pv_atual);
        setVal('charLoad',  character.carga);
        setVal('charDef',   character.armadura);
        setVal('charDmg',   character.dado_dano);

        this.charRace.value  = character.raca;
        this.charClass.value = character.classe;

        // Alignment options depend on class, so refresh them before setting the value
        this.updateAlignmentOptions();
        setVal('charAlignment', character.alinhamento);

        ATTR_MAP.forEach(({ val, deb, key }) => {
            setVal(val, character.atributos[key] || '');
            const debEl = document.getElementById(deb);
            if (debEl) debEl.checked = character.debilidade[key];
        });

        character.xp.forEach((active, i) => {
            this.circles[i]?.classList.toggle('active', active);
        });

        if (this.quill && character.notas) {
            try   { this.quill.setContents(JSON.parse(character.notas)); }
            catch { this.quill.setText(character.notas); }
        }
    }

    // ─── Rendering ───────────────────────────────────────────────────────────

    renderClassMoves(searchQuery = '') {

        const container = document.getElementById('classMoves');
        container.innerHTML = '';

        let movementList = this.showClassMoves
            ? Mechanics.Movement.getMovementListByClass(this.charClass.value)
            : Mechanics.Movement.getBasicMovements();

        if (!movementList.length) {
            container.innerHTML = '<div class="movement-list"><em>Não há movimentos disponíveis para esta classe.</em></div>';
            return;
        }

        // Bárbaro keeps all racial moves; every other class shows only the move matching the selected race.
        if (Utils.canonical(this.charClass.value) !== 'barbaro' && this.charRace.value) {
            movementList = movementList.filter(
                (m) => m.tipo !== 'Racial' || m.nome === this.charRace.value
            );
        }

        if (searchQuery) {
            movementList = this.searchItems(movementList, searchQuery);
        }

        const box = document.createElement('div');
        box.classList.add(this.movementListFormat === 'card' ? 'movement-cardbox' : 'movement-list');
        for (const movement of movementList) {
            box.innerHTML += Mechanics.Movement.render(movement, this.movementListFormat, true);
        }
        container.appendChild(box);
    }

    renderClassSpells(searchQuery = '') {
        if (!this.charClass.value) return;
        const container = document.getElementById('classSpells');
        container.innerHTML = '';

        const box = document.createElement('div');
        box.classList.add(this.spellListFormat === 'card' ? 'spell-cardbox' : 'spell-list');

        let lista_spells = Mechanics.Spell.getSpellListByClassAndLevel(this.charClass.value);

        if (searchQuery) {
            lista_spells = this.searchItems(lista_spells, searchQuery);
        }

        box.innerHTML = Mechanics.Spell.renderSpellGroupbyLevel(lista_spells);
        container.appendChild(box);
    }

    // Search Movements and Spells
    searchItems(items, query) {
    const terms = query
        .toLowerCase()
        .trim()
        .split(/\s+/);

    return items.filter(item =>
        terms.every(term => Utils.searchFilter(item, term))
    );
}



    // ─── Attributes & modifiers ───────────────────────────────────────────────

    updateModifiers() {
        ATTR_MAP.forEach(({ val, mod, deb }) => {
            const valEl = document.getElementById(val);
            const modEl = document.getElementById(mod);
            const debEl = document.getElementById(deb);
            if (!valEl || !modEl) return;
            const debValue = debEl?.checked ? -1 : 0;
            const modifier = this.character.abilityModifier(valEl.value, debValue);
            modEl.value = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        });
    }

    /** Strikes through initial attribute values that have already been assigned. */
    updateStrikethrough() {
        const usedValues = new Set();
        ATTR_MAP.forEach(({ val }) => {
            const v = parseInt(document.getElementById(val)?.value, 10);
            if (Number.isFinite(v) && v > 0) usedValues.add(v);
        });
        document.querySelectorAll('.init-val').forEach((span) => {
            span.classList.toggle('used', usedValues.has(parseInt(span.dataset.val, 10)));
        });
    }

    // ─── Class / race selectors ───────────────────────────────────────────────

    /** Refreshes both dropdowns so they reflect each other's current selection. */
    #syncClassRaceSelectors() {
        this.#updateClassOptions();
        this.#updateRaceOptions();
    }

    #findClassByName(name) {
        if (!name) return null;
        const normalized = Utils.canonical(name);
        return this.classDetails.find((cd) => Utils.canonical(cd.nome) === normalized) ?? null;
    }

    #findAllowedClasses(race) {
        if (!race) return null;
        const normalized = Utils.canonical(race);
        const allowed = this.classDetails
            .filter((cd) => (cd.racas || []).some((r) => Utils.canonical(r) === normalized))
            .map((cd) => cd.nome);
        return allowed.length ? allowed : null;
    }

    #findAllowedRaces(className) {
        if (!className) return null;
        const cls = this.classDetails.find((cd) => Utils.canonical(cd.nome) === Utils.canonical(className));
        return cls?.racas?.length ? cls.racas : null;
    }

    /** Disables class options incompatible with the currently selected race. */
    #updateClassOptions() {
        const allowed    = this.#findAllowedClasses(this.charRace.value);
        const allowedSet = allowed ? new Set(allowed.map(Utils.canonical)) : null;

        Array.from(this.charClass.options).forEach((option) => {
            if (!option.value) return;
            const disabled = allowedSet !== null && !allowedSet.has(Utils.canonical(option.value));
            option.disabled = disabled;
            option.classList.toggle('disabled-by-race', disabled);
        });

        const selected = this.charClass.value;
        if (selected && this.charClass.querySelector(`option[value="${selected}"]`)?.disabled) {
            this.charClass.value = '';
        }
        this.applyClassEffects();
    }

    /** Disables race options incompatible with the currently selected class. */
    #updateRaceOptions() {
        const allowed    = this.#findAllowedRaces(this.charClass.value);
        const allowedSet = allowed ? new Set(allowed.map(Utils.canonical)) : null;

        Array.from(this.charRace.options).forEach((option) => {
            if (!option.value) return;
            const disabled = allowedSet !== null && !allowedSet.has(Utils.canonical(option.value));
            option.disabled = disabled;
            option.classList.toggle('disabled-by-race', disabled);
        });

        const selected = this.charRace.value;
        if (selected && this.charRace.querySelector(`option[value="${selected}"]`)?.disabled) {
            this.charRace.value = '';
        }
    }

    updateAlignmentOptions() {
        const charAlignment = document.getElementById('charAlignment');
        charAlignment.innerHTML = '<option value="">Selecione</option>';
        const cls = this.#findClassByName(this.charClass.value);
        for (const alignment of cls?.alinhamento || []) {
            const option = document.createElement('option');
            option.value       = alignment.id;
            option.textContent = [alignment.nome, alignment.descricao].filter(Boolean).join(' - ');
            charAlignment.appendChild(option);
        }
    }

    /** Updates damage, HP, and carry capacity fields based on the selected class. */
    applyClassEffects() {
        const cls      = this.#findClassByName(this.charClass.value);
        const charDmg  = document.getElementById('charDmg');
        const charPV   = document.getElementById('charPV');
        const charLoad = document.getElementById('charLoad');

        if (!cls) {
            if (charDmg)  charDmg.value  = '';
            if (charPV)   charPV.value   = '';
            if (charLoad) charLoad.value = '';
            this.renderClassSpells();
            return;
        }

        const dmg = cls.dado_dano;
        if (charDmg) { charDmg.value = dmg; this.character.dado_dano = dmg; }

        const conVal = parseInt(document.getElementById('valCon')?.value, 10);
        const newPV  = (cls.hp_base || 0) + (Number.isFinite(conVal) ? conVal : 0);
        if (charPV)  { charPV.value  = newPV;  this.character.pv_max = newPV; }

        // Prefer the already-computed modifier display; fall back to raw calculation.
        let modFor   = 0;
        const modForEl = document.getElementById('modFor');
        if (modForEl?.value) {
            const parsed = parseInt(modForEl.value.replace(/[^0-9-]/g, ''), 10);
            if (!Number.isNaN(parsed)) modFor = parsed;
        } else {
            const valFor = parseInt(document.getElementById('valFor')?.value, 10);
            if (Number.isFinite(valFor)) modFor = Math.floor((valFor - 10) / 2);
        }
        const newLoad = (cls.carga_base || 0) + modFor;
        if (charLoad) { charLoad.value = newLoad; this.character.carga = newLoad; }

        this.renderClassSpells();
    }

    // ─── Inventory ───────────────────────────────────────────────────────────

    addEquipmentToList(listId) {
        const listEl = document.getElementById(listId);
        if (!listEl) return;
        listEl.insertAdjacentHTML('beforeend', `
            <div class='list-item'>
                <input class='spell-name' type='text'   placeholder='Nome do equipamento' style='flex:2' />
                <input class='spell-name' type='number' placeholder='Peso' min='0' style='width:60px' />
                <button onclick="this.closest('.list-item').remove()" class='removeIcon'>&#215;</button>
            </div>`
        );
    }

    addConsumableToList(listId) {
        const listEl = document.getElementById(listId);
        if (!listEl) return;
        listEl.insertAdjacentHTML('beforeend', `
            <div class='list-item'>
                <input class='spell-name' type='text'   placeholder='Nome do consumível' style='flex:2' />
                <input class='spell-name' type='number' placeholder='Peso' min='0' style='width:60px' />
                <div class='use-boxes' style='display:flex;gap:4px;flex-wrap:wrap;align-items:center'></div>
                <button class='addConsumable' onclick="
                    const cb = document.createElement('input');
                    cb.type = 'checkbox';
                    cb.className = 'gold_filling';
                    this.closest('.list-item').querySelector('.use-boxes').appendChild(cb);
                ">&#x2b;</button>
                <button onclick="this.closest('.list-item').remove()" class='removeIcon'>&#215;</button>
            </div>`
        );
    }

    // ─── Bonds ───────────────────────────────────────────────────────────────

    addBondToActiveList(bondName) {
        if (!bondName) return;
        this.character.bonds.push(Mechanics.Bond.create('custom', bondName, false));
        this.#renderBondsList();
    }

    #renderBondsList() {
        const listEl = document.getElementById('bondsArea');
        if (!listEl) return;
        listEl.innerHTML = this.character.bonds.length
            ? this.character.bonds.map(Mechanics.Bond.render).join('')
            : '<em>Não há vínculos ativos.</em>';
    }

    // ─── Sheet lifecycle ──────────────────────────────────────────────────────

    clearInputs() {
        this.allInputs.forEach((input) => {
            if      (input.type === 'checkbox')   input.checked = false;
            else if (input.type === 'select-one') { input.selectedIndex = 0; input.value = ''; }
            else                                  input.value = '';
        });
        this.circles.forEach((circle) => circle.classList.remove('active'));
    }

    clearSheet() {
        SaveAndLoad.clearState();
        this.character = new Character(); // reset model first
        this.clearInputs();
        this.#syncClassRaceSelectors(); // re-enable any previously disabled options

        this.updateModifiers();
        this.updateAlignmentOptions();
        this.updateStrikethrough();
        this.applyClassEffects();
        this.renderClassMoves();
        this.renderClassSpells();
    }
}

const sheet = new CharacterSheet();
