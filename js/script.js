import dungeonworld from "../data/dungeonworld.json" with { type: "json" };
import SaveAndLoad from './saveAndLoad.js';
import Mechanics from './mechanics.js';
import Character from './character.js';
import Utils from './utils.js';

// Maps each attribute's element IDs to its Character model property key.
// Used to drive events, modifier updates, and strikethrough logic from a single source of truth.
const ATTR_MAP = [
    { val: 'valFor', mod: 'modFor', deb: 'debFor', key: 'forca', label: 'Força', abreviatura: 'FOR', debilidadeLabel: 'Fraco' },
    { val: 'valDes', mod: 'modDes', deb: 'debDes', key: 'destreza', label: 'Destreza', abreviatura: 'DES', debilidadeLabel: 'Trêmulo' },
    { val: 'valCon', mod: 'modCon', deb: 'debCon', key: 'constituicao', label: 'Constituição', abreviatura: 'CON', debilidadeLabel: 'Doente' },
    { val: 'valInt', mod: 'modInt', deb: 'debInt', key: 'inteligencia', label: 'Inteligência', abreviatura: 'INT', debilidadeLabel: 'Atordoado' },
    { val: 'valSab', mod: 'modSab', deb: 'debSab', key: 'sabedoria', label: 'Sabedoria', abreviatura: 'SAB', debilidadeLabel: 'Confuso' },
    { val: 'valCar', mod: 'modCar', deb: 'debCar', key: 'carisma', label: 'Carisma', abreviatura: 'CAR', debilidadeLabel: 'Marcado' },
];

class CharacterSheet {

    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this.#init();
        });
    }

    // ─── Initialisation ───────────────────────────────────────────────────────

    #init() {
        this.renderAtributes('attributesContainer');
        this.circles = Array.from(document.querySelectorAll('.circle'));
        this.allInputs = Array.from(document.querySelectorAll('input, select, textarea'));
        this.charRace = document.getElementById('charRace');
        this.charClass = document.getElementById('charClass');
        this.quill = new Quill(document.getElementById('charNotes'), { theme: 'snow' });
        this.character = new Character();

        this.classDetails = dungeonworld.classes || [];
        this.movementListFormat = 'card';
        this.spellListFormat = 'card';
        this.showClassMoves = false; // false = movimentos básicos, true = movimentos de classe

        this.bondInput = document.getElementById('charBonds');
        this.bondOption = null;



        this.tagList = Mechanics.Equipment.getTagsList();

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
            circle.style.setProperty('--idx', i + 1);
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
        this.renderMovements();
        this.renderClassSpells();
        this.applyClassEffects();
        this.updateBondOptions();
        this.#initTagCombo(document.getElementById('custom-equip-tags'));

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
        this.#registerMovementEvents();
        this.#registerSpellEvents();
        this.#registerCarouselEvents();
        this.#updateName();
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
            { id: 'charName', set: (v) => { this.character.nome = v; } },
            { id: 'charLevel', set: (v) => { this.character.nivel = parseInt(v, 10) || 1; } },
            { id: 'curPV', set: (v) => { this.character.pv_atual = parseInt(v, 10) || 0; } },
            { id: 'charPV', set: (v) => { this.character.pv_max = parseInt(v, 10) || 0; } },
            { id: 'charLoad', set: (v) => { this.character.carga = parseInt(v, 10) || 0; } },
            { id: 'charDef', set: (v) => { this.character.armadura = parseInt(v, 10) || 0; } },
            { id: 'charDmg', set: (v) => { this.character.dado_dano = v; } },
            { id: 'charAlignment', set: (v) => { this.character.alinhamento = v; } },
        ];
        FIELD_MAP.forEach(({ id, set }) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('input', (e) => { set(e.target.value); this.save(); });
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
            input.addEventListener('input', () => this.save());
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
            const ta = document.getElementById('codeModalText');
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
                this.renderMovements();
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
            this.renderMovements();
            this.updateBondOptions();
            this.updateAlignmentOptions();
            this.save();
        });

        this.charClass.addEventListener('change', () => {
            this.character.classe = this.charClass.value !== 'Classe' ? this.charClass.value : '';
            if (this.charClass.selectedOptions[0]?.disabled) this.charClass.value = '';
            this.#syncClassRaceSelectors();
            this.applyClassEffects();
            this.renderMovements();
            this.updateBondOptions();
            this.updateAlignmentOptions();
            this.save();
        });
    }

    /** Wires the card/list toggle buttons for both moves and spells. */
    #registerViewToggleEvents() {
        this.#addViewToggle('btnMoveCardView', 'btnMoveListView', (fmt) => {
            this.movementListFormat = fmt;
            this.renderMovements();
        });
        this.#addViewToggle('btnSpellCardView', 'btnSpellListView', (fmt) => {
            this.spellListFormat = fmt;
            this.renderClassSpells();
        });
    }

    #registerSearchEvents() {
        document.getElementById('movementSearch')?.addEventListener('input', (e) => {
            this.renderMovements(e.target.value);
            this.filterMovementsBySearch(e.target.value);
        });
        document.getElementById('spellSearch')?.addEventListener('input', (e) => {
            this.renderClassSpells(e.target.value);
        });
    }

    #registerBondEvents() {
        document.getElementById('btnAddBond').addEventListener('click', (e) => {
            this.addBondToActiveList(
                document.getElementById('bondTemplate').id > 0 ? document.getElementById('bondTemplate').id : null, //ID
                document.getElementById('bondTemplate').value ? this.charClass.value : "custom", // bond Name
                document.getElementById('bondTemplate').value || document.getElementById('charBonds').value.trim(), // Bond Template
                document.getElementById('bondTarget').value.trim() // Bond Target
            )
            document.getElementById('bondTarget').value = '';
            document.getElementById('bondTemplate').selectedIndex = 0;
            document.getElementById('charBonds').value = '';
            e.preventDefault();
        });

        document.getElementById('bondTemplate').addEventListener('change', (e) => {
            this.bondOption = e.target.value || null;
        });
    }

    #registerMovementEvents() {
        document.querySelectorAll('.movement-card-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                console.log('Movement card icon clicked:', e.target);
            });
        });
    }

    #registerSpellEvents() {
        //TODO: Implement spell events if needed
    }

    #registerCarouselEvents() {
        document.querySelectorAll('.carousel').forEach((carousel, index) => {
            const anchorName = `--carousel-${index + 1}`;
            carousel.style.setProperty('--carousel-anchor', anchorName);
            carousel.style.setProperty('anchor-name', anchorName);
        });
    }

    /** Populates and wires the tag combobox inside a newly created equipment item. */
    #initTagCombo(item) {
        const toggleBtn = item.querySelector('.combobox-toggle');
        const dropdown = item.querySelector('.combobox-dropdown');
        const searchInput = item.querySelector('.tag-search');
        const resultsDiv = item.querySelector('.results');
        const tagsDiv = item.querySelector('.selected-tags');
        const allTags = this.tagList;
        const selected = new Set();

        const reposition = () => {
            const rect = toggleBtn.getBoundingClientRect();
            dropdown.style.top = `${rect.bottom + 4}px`;
            dropdown.style.left = `${rect.left}px`;
            dropdown.style.width = `${Math.max(rect.width, 240)}px`;
        };
        const openDropdown = () => {
            reposition();
            dropdown.classList.add('open');
            searchInput.focus();
            renderResults();
        };
        const closeDropdown = () => { dropdown.classList.remove('open'); searchInput.value = ''; };

        // reposition on any scroll in the tree so the dropdown follows the button
        window.addEventListener('scroll', () => { if (dropdown.classList.contains('open')) reposition(); }, true);

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.contains('open') ? closeDropdown() : openDropdown();
        });

        // close when clicking outside this combobox
        document.addEventListener('click', (e) => {
            if (!item.querySelector('.combobox').contains(e.target)) closeDropdown();
        });

        const renderResults = () => {
            const filter = searchInput.value.toLowerCase();
            resultsDiv.replaceChildren();
            allTags
                .filter(t => !selected.has(t.nome) && t.nome.toLowerCase().includes(filter))
                .forEach(tag => {
                    const el = Mechanics.Equipment.renderTag(tag);
                    el.addEventListener('click', () => {
                        selected.add(tag.nome);
                        searchInput.value = '';
                        renderResults();
                        renderSelected();
                    });
                    resultsDiv.append(el);
                });
        };

        const renderSelected = () => {
            tagsDiv.replaceChildren();
            selected.forEach(nome => {
                const pill = document.createElement('span');
                pill.className = 'tag-pill';
                pill.textContent = nome;
                const btn = document.createElement('button');
                btn.textContent = '\u00d7';
                btn.setAttribute('aria-label', `Remover ${nome}`);
                btn.addEventListener('click', () => { selected.delete(nome); renderSelected(); renderResults(); });
                pill.append(btn);
                tagsDiv.append(pill);
            });
        };

        searchInput.addEventListener('input', renderResults);
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
            () => this.character.addEquipment());
        
        document.getElementById('equipSelectCombo')?.addEventListener('change', (e) => {
            console.log(`Selected value: ${e.target.value}`);
            this.character.addEquipment(e.target.value);
            console.log(this.character.equipamentos);
        });

    }

    #registerMovementTypeToggle() {
        document.getElementById('toggleMovementType').addEventListener('change', (e) => {
            this.showClassMoves = e.target.checked;
            Array.from(document.getElementsByClassName('toggleLabel')).forEach((el) => {
                el.textContent = e.target.checked ? 'Movimentos de Classe' : 'Movimentos Básicos';
            });
            this.renderMovements();
        });
    }


     /** Refreshes both dropdowns so they reflect each other's current selection. */
    #syncClassRaceSelectors() {
        console.log('Sincronizando seletores de classe e raça...');
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
        const allowed = this.#findAllowedClasses(this.charRace.value);
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
        const allowed = this.#findAllowedRaces(this.charClass.value);
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

    #renderBondsList() {
        const listEl = document.getElementById('bondsArea');
        if (!listEl) return;
        listEl.innerHTML = this.character.bonds.length
            ? this.character.bonds.map(Mechanics.Bond.render).join('')
            : '<em>Não há vínculos ativos.</em>';
    }

    #updateName(){
        document.getElementById('charName').addEventListener('change', (e) => {
            if(this.character.nome != ""){
                document.getElementById('pageTitle').textContent = `${this.character.nome}`;
            }
            else{
                document.getElementById('pageTitle').textContent = `Dungeon World - Ficha de personagem`;
            }
        });
    }


    // ─── Modal helpers ────────────────────────────────────────────────────────

    #openModal(id) { document.getElementById(id).style.display = 'flex'; }
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

        setVal('charName', character.nome);
        setVal('charLevel', character.nivel);
        setVal('charPV', character.pv_max);
        setVal('curPV', character.pv_atual);
        setVal('charLoad', character.carga);
        setVal('charDef', character.armadura);
        setVal('charDmg', character.dado_dano);

        this.charRace.value = character.raca;
        this.charClass.value = character.classe;

        // Alignment options depend on class, so refresh them before setting the value
        this.updateAlignmentOptions();
        setVal('charAlignment', character.alinhamento);
        this.updateBondOptions();

        ATTR_MAP.forEach(({ val, deb, key }) => {
            setVal(val, character.atributos[key] || '');
            const debEl = document.getElementById(deb);
            if (debEl) debEl.checked = character.debilidade[key];
        });

        character.xp.forEach((active, i) => {
            this.circles[i]?.classList.toggle('active', active);
        });

        const equipSelectCombo = document.getElementById('equipSelectCombo');
        Mechanics.Equipment.renderEquipmentOptions(equipSelectCombo);

        if (this.quill && character.notas) {
            try { this.quill.setContents(JSON.parse(character.notas)); }
            catch { this.quill.setText(character.notas); }
        }

        this.#renderBondsList(); // show bonds that were loaded from storage
    }

    // ─── Rendering ───────────────────────────────────────────────────────────

    renderMovements(searchQuery = '') {
        let movementList = this.showClassMoves ? Mechanics.Movement.conditionalMovementList(this.charClass.value, this.charRace.value) : Mechanics.Movement.getBasicMovements(this.charClass.value);
        let movementContainer = document.getElementById('movementContainer');
        movementContainer.innerHTML = '';

        if (searchQuery) {
            movementList = this.searchItems(movementList, searchQuery);
        }

        if(this.movementListFormat === 'list'){
            const listContainer = document.createElement('div');
            listContainer.classList.add('movement-list');
            for (const move of movementList) {
                listContainer.appendChild(Mechanics.Movement.render(move, this.movementListFormat, true));
            }
            movementContainer.appendChild(listContainer);
        }
        else {
            this.renderMovementCard(movementList, movementContainer, this.movementListFormat);
        }
    }


    renderMovementList(movementList, container, searchQuery = '') {
        const listContainer = document.createElement('div');
        listContainer.classList.add('movement-list');
        
        for (const move of movementList) {
            listContainer.appendChild(Mechanics.Movement.render(move, this.movementListFormat, true));
        }

        container.appendChild(listContainer);
    }

    renderMovementCard(movementList, container, searchQuery = '') {
        const carouselContainer = document.createElement('div');
        carouselContainer.classList.add('carousel-container');

        const carousel = document.createElement('div');
        carousel.id = `carousel-${Math.random().toString(36).substr(2, 9)}`;
        carousel.classList.add('carousel');

        if(carousel){
            if (!movementList.length) {
                carousel.innerHTML = '<div class="movement-list"><em>Não há movimentos disponíveis para esta classe.</em></div>';
            return;
            }

            const scroll_group = document.createElement('div');
            scroll_group.classList.add('scroll-group');

            for (const move of movementList) {
                scroll_group.appendChild(Mechanics.Movement.render(move, this.movementListFormat, true));
            }

            carousel.appendChild(scroll_group);
        }

        carouselContainer.appendChild(carousel);
        container.appendChild(carouselContainer);
    }

    filterMovementsBySearch(movementList, searchQuery) {
        if (!searchQuery) {
            document.querySelectorAll('.movement-card').forEach(card => {
                const match = card.textContent.includes(searchQuery);
                card.hidden = !match;
            });
        }
        document.querySelectorAll('.movement-card').forEach(card => {
            const match = card.textContent.includes(searchQuery);
            card.hidden = !match;
        });
    }

    renderClassSpells(searchQuery) {
        if (!this.charClass.value) return;

        const cls = this.#findClassByName(this.charClass.value);

        if (cls.spellcaster) {
            document.getElementById('classSpells').style.display = '';
            document.getElementById('spellContainer').style.display = '';

            const container = document.getElementById('classSpells');
            container.innerHTML = '';

            const box = document.createElement('div');
            box.classList.add(this.spellListFormat === 'card' ? 'spell-cardbox' : 'spell-list');

            let lista_spells = Mechanics.Spell.getSpellListByClassAndLevel(this.charClass.value);

            if (searchQuery) {
                lista_spells = this.searchItems(lista_spells, searchQuery);
            }

            box.appendChild(Mechanics.Spell.renderSpellGroupbyLevel(lista_spells));

            container.appendChild(box);
        }
        else {
            document.getElementById('classSpells').style.display = 'none';
            document.getElementById('spellContainer').style.display = 'none';
        }


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
    updateAlignmentOptions() {
        const charAlignment = document.getElementById('charAlignment');
        charAlignment.innerHTML = '<option value="">Selecione</option>';
        const cls = this.#findClassByName(this.charClass.value);
        for (const alignment of cls?.alinhamento || []) {
            const option = document.createElement('option');
            option.value = alignment.id;
            option.textContent = [alignment.nome, alignment.descricao].filter(Boolean).join(' - ');
            charAlignment.appendChild(option);
        }

    }

    /** Updates damage, HP, and carry capacity fields based on the selected class. */
    applyClassEffects() {
        const cls = this.#findClassByName(this.charClass.value);
        const charDmg = document.getElementById('charDmg');
        const charPV = document.getElementById('charPV');
        const charLoad = document.getElementById('charLoad');

        if (!cls) {
            if (charDmg) charDmg.value = '';
            if (charPV) charPV.value = '';
            if (charLoad) charLoad.value = '';
            this.renderClassSpells();
            return;
        }

        const dmg = cls.dado_dano;
        if (charDmg) { charDmg.value = dmg; this.character.dado_dano = dmg; }

        const conVal = parseInt(document.getElementById('valCon')?.value, 10);
        const newPV = (cls.hp_base || 0) + (Number.isFinite(conVal) ? conVal : 0);
        if (charPV) { charPV.value = newPV; this.character.pv_max = newPV; }

        // Prefer the already-computed modifier display; fall back to raw calculation.
        let modFor = 0;
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

    // ─── Movements ───────────────────────────────────────────────────────────
    addMovement(movement) {
        if (!movement) return;
        this.character.addMovement(movement);
        this.renderMovements();
        this.save();
    }

    // ─── Inventory ───────────────────────────────────────────────────────────
    addItemToCharacter(id) {
        const item = Mechanics.Equipment.getEquipmentById(id);
        if (!item) return;
        this.character.addItem(item);
        this.save();
    }

    addEquipmentToList(listId) {
        const listEl = document.getElementById(listId);
        if (!listEl) return;
        listEl.insertAdjacentHTML('beforeend', `
            <div class='list-item' id="equi-${Math.floor(Math.random() * 101000)}">
                <select>
                    <option id="equipSelectCombo" class="options">
                        ${Mechanics.Equipment.getEquipmentList().map((item, i) => `<option value='${i}'>${item.nome}</option>`).join('')} 
                    </option>
                </select>
                <label>Nome do equipamento</label>
                <input class='spell-name' type='text' placeholder='Nome do equipamento'/>
                <label>Peso</label>
                <input class='spell-name' type='number' placeholder='Peso' min='0' max='999'/>
                <label>Tags</label>
                <div class="combobox">
                    <div class="selected-tags"></div>
                    <button class="combobox-toggle" type="button">&#x2b; Tag</button>
                    <div class="combobox-dropdown">
                        <input class="tag-search" type="text" placeholder="Buscar tag..." autocomplete="off"/>
                        <div class="results"></div>
                    </div>
                </div>
                <label>Moeda</label><input class='spell-name' type='number' placeholder='Moeda' value="" min="0"/>
                <label>Quantidade</label><input class='spell-name' type='text' placeholder='Quantidade' value=""/>
                <button onclick="this.closest('.list-item').remove()" class='removeIcon'>&#215;</button>
            </div>`
        );
        this.#initTagCombo(listEl.lastElementChild);
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
    addBondToActiveList(id, origin, bondName, bondTarget) {
        if (!bondName || !bondTarget) return;
        let bondId = id || this.character.bonds.length;
        this.character.bonds.push(Mechanics.Bond.create(bondId, origin, bondName, bondTarget, false));
        this.#renderBondsList();
        this.save();
    }

    updateBondOptions() {
        const bonds = Mechanics.Bond.getBondListByClass(this.charClass.value);
        const bondTemplateSelect = document.getElementById("bondTemplate");
        bondTemplateSelect.innerHTML = '<option value="">Selecione</option>';
        bonds.forEach(item => {
            const option = document.createElement("option");
            option.value = item.template;
            option.textContent = item.template;
            option.id = item.id;
            bondTemplateSelect.appendChild(option);
        });
    }

    // ─── Sheet lifecycle ──────────────────────────────────────────────────────
    clearInputs() {
        this.allInputs.forEach((input) => {
            if (input.type === 'checkbox') input.checked = false;
            else if (input.type === 'select-one') { input.selectedIndex = 0; input.value = ''; }
            else input.value = '';
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
        this.updateBondOptions();
        this.updateStrikethrough();
        this.applyClassEffects();
        this.renderMovements();
        this.renderClassSpells();
    }

    renderAtributes(containerId = 'attributesContainer') {
        const container = document.getElementById(containerId);

        for (const atribKey in ATTR_MAP) {
            const atrib = ATTR_MAP[atribKey];
            const card = document.createElement('div');
            card.id = `atrib-card-${atrib.key}`;
            card.className = 'atrib-card';

            const header = document.createElement('div');
            header.className = 'atrib-card-header';
            const h6 = document.createElement('span');
            h6.textContent = atrib.label;
            header.appendChild(h6);
            card.appendChild(header);

            const valueDiv = document.createElement('div');
            valueDiv.className = 'atrib-card-value';
            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.id = `${atrib.val}`;
            valueInput.value = '';
            valueInput.placeholder = '0';
            valueDiv.appendChild(valueInput);
            card.appendChild(valueDiv);

            const modDiv = document.createElement('div');
            modDiv.className = 'atrib-card-mod';
            const modInput = document.createElement('input');
            modInput.type = 'text';
            modInput.id = `${atrib.mod}`;
            modInput.value = '';
            modInput.placeholder = '+0';
            modDiv.appendChild(modInput);
            card.appendChild(modDiv);

            const debDiv = document.createElement('div');
            debDiv.className = 'atrib-card-deb';
            const debInput = document.createElement('input');
            debInput.type = 'checkbox';
            debInput.id = `${atrib.deb}`;
            debInput.className = 'red_filling';

            const debLabel = document.createElement('label');
            const em = document.createElement('em');
            em.className = 'debilidade';
            em.textContent = `${atrib.debilidadeLabel} -1`;
            debLabel.appendChild(em);
            debDiv.appendChild(debInput);
            debDiv.appendChild(debLabel);
            card.appendChild(debDiv);

            container.appendChild(card);
        }
    }

}


function devIcon() {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        const favicon = document.querySelector("link[rel='icon']");
        if (favicon) {
            favicon.setAttribute("href", "./assets/dev-favicon.png");
            console.log("Dev icon set for localhost.");
        }
    }
}

devIcon();

const sheet = new CharacterSheet();
