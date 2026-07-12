import dungeonworld from "../data/dungeonworld.json" with { type: "json" };
import SaveAndLoad from './saveAndLoad.js';
import Mechanics from './mechanics.js';
import Character from './character.js';
import Utils from './utils.js';

class CharacterSheet {

    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            // Garantir ids únicos para todos os inputs/checkboxes/circles e usar esses ids ao salvar/carregar
            this.circles = Array.from(document.querySelectorAll('.circle'));
            this.allInputs = Array.from(document.querySelectorAll('input, select, textarea'));
            this.charRace = document.getElementById('charRace');
            this.charClass = document.getElementById('charClass');
            this.quill = new Quill(document.getElementById('charNotes'), { theme: 'snow' });
            this.character = new Character();

            this.initialAttributes = {
                stat: [16, 15, 13, 12, 9, 8],
                mod: [2, 1, 1, 0, 0, -1]
            }
            this.attrPairs = [
                { val: 'valFor', mod: 'modFor', deb: 'debFor' },
                { val: 'valDes', mod: 'modDes', deb: 'debDes' },
                { val: 'valCon', mod: 'modCon', deb: 'debCon' },
                { val: 'valInt', mod: 'modInt', deb: 'debInt' },
                { val: 'valSab', mod: 'modSab', deb: 'debSab' },
                { val: 'valCar', mod: 'modCar', deb: 'debCar' },
            ]
            this.classDetails = dungeonworld.classses || [];

            this.movementListFormat = 'card'; // ou 'list'

            this.registryEvents();
            this.start();
        })
    }

    registryEvents() {
        document.getElementById('valFor').addEventListener('input', (e) => { this.character.atributos.forca = e.target.value; this.updateModifiers(); });
        document.getElementById('valDes').addEventListener('input', (e) => { this.character.atributos.destreza = e.target.value; this.updateModifiers(); });
        document.getElementById('valCon').addEventListener('input', (e) => { this.character.atributos.constituicao = e.target.value; this.updateModifiers(); });
        document.getElementById('valInt').addEventListener('input', (e) => { this.character.atributos.inteligencia = e.target.value; this.updateModifiers(); });
        document.getElementById('valSab').addEventListener('input', (e) => { this.character.atributos.sabedoria = e.target.value; this.updateModifiers(); });
        document.getElementById('valCar').addEventListener('input', (e) => { this.character.atributos.carisma = e.target.value; this.updateModifiers(); });

        document.getElementById('debFor').addEventListener('change', (e) => { this.character.debilidade.forca = e.target.checked ? -1 : 0; this.updateModifiers(); });
        document.getElementById('debDes').addEventListener('change', (e) => { this.character.debilidade.destreza = e.target.checked ? -1 : 0; this.updateModifiers(); });
        document.getElementById('debCon').addEventListener('change', (e) => { this.character.debilidade.constituicao = e.target.checked ? -1 : 0; this.updateModifiers(); });
        document.getElementById('debInt').addEventListener('change', (e) => { this.character.debilidade.inteligencia = e.target.checked ? -1 : 0; this.updateModifiers(); });
        document.getElementById('debSab').addEventListener('change', (e) => { this.character.debilidade.sabedoria = e.target.checked ? -1 : 0; this.updateModifiers(); });
        document.getElementById('debCar').addEventListener('change', (e) => { this.character.debilidade.carisma = e.target.checked ? -1 : 0; this.updateModifiers(); });

        // === Eventos dos botões de código ===
        document.getElementById('btnGerarCodigo').addEventListener('click', () => {
            document.getElementById('codeModalText').value = SaveAndLoad.encodeState(SaveAndLoad.collectState([this.allInputs, this.circles]));
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
            console.warn('Restaurando código:', code);
            try {
                SaveAndLoad.applyState([this.allInputs, this.circles], SaveAndLoad.decodeState(code));
                this.save();
                this.classSelector();
                this.updateModifiers();
                this.updateStrikethrough();
                this.renderClassMoves();
                this.updateAlignmentOptions();
                document.getElementById('restoreModal').style.display = 'none';
            } catch (e) {
                console.error('Erro ao restaurar código:', e);
                document.getElementById('restoreError').style.display = 'block';
            }
        });

        document.getElementById('btnCancelarRestaurar').addEventListener('click', () => {
            document.getElementById('restoreModal').style.display = 'none';
        });

        document.getElementById('addConsumable')?.addEventListener('click', () => {
            this.addConsumableToList('consumablesContainer');
        });

        document.getElementById('addEquipment')?.addEventListener('click', () => {
            this.addEquipmentToList('equipmentContainer');
        });

        document.getElementById('btnLimpar').addEventListener('click', () => {
            if (confirm('Tem certeza que deseja limpar a ficha? Esta ação não pode ser desfeita.')) {
               this.clearSheet();
            }
        });

        //Vinculos
        document.getElementById('btnAddBond').addEventListener('click', () => {
            this.addBondToActiveList(document.getElementById('charBonds').value.trim());
        });


        this.charRace.addEventListener('change', () => {
            this.character.raca = this.charRace.value !== "Raça" ? this.charRace.value : "";
            this.updateRaceOptions();
            this.applyClassEffects();
            this.updateClassOptions();
            this.save()
            this.renderClassMoves();
        });

        this.charClass.addEventListener('change', () => {
            this.character.classe = this.charClass.value !== "Classe" ? this.charClass.value : "";
            const opt = this.charClass.selectedOptions[0];
            if (opt && opt.disabled) this.charClass.value = '';
            this.updateRaceOptions();
            this.applyClassEffects();
            this.save();
            this.renderClassMoves();
            this.updateAlignmentOptions();
        });


        this.btnMoveCardView = document.getElementById('btnMoveCardView').addEventListener('click', () => {
            this.movementListFormat = 'card';
            this.btnMoveCardView = document.getElementById('btnMoveCardView').classList.add('selected');
            this.btnMoveListView = document.getElementById('btnMoveListView').classList.remove('selected');
            this.renderClassMoves();
        });

        this.btnMoveListView = document.getElementById('btnMoveListView').addEventListener('click', () => {
            this.movementListFormat = 'list';
            this.btnMoveCardView = document.getElementById('btnMoveCardView').classList.remove('selected');
            this.btnMoveListView = document.getElementById('btnMoveListView').classList.add('selected');
            this.renderClassMoves();
        });

         document.getElementById('toggleMovementType').addEventListener('change', (e) => {
            this.toggleMovementType = e.target.checked ? true : false;
            document.getElementById('toggleLabel').textContent = e.target.checked ? 'Movimentos Classe' : 'Movimentos Básicos';
            this.renderClassMoves();
        });

        // Fechar modais clicando no fundo escuro
        ['codeModal', 'restoreModal', 'clearModal'].forEach((id) => {
            document.getElementById(id).addEventListener('click', (e) => {
                if (e.target.id === id) document.getElementById(id).style.display = 'none';
            });
        });
    }

    start() {
        // Atribui ids automáticos quando ausentes, preservando ids existentes
        this.allInputs.forEach((input, index) => {
            if (!input.id) {
                input.id = input.type === 'checkbox' ? `cb_auto_${index}` : `input_auto_${index}`;
            }
        });

        this.circles.forEach((circle, index) => {
            if (!circle.id) circle.id = `xp_${index}`;
        });

        this.circles.forEach((circle, index) => {
            circle.addEventListener('click', () => {
                const isActive = circle.classList.contains('active');
                if (!isActive) {
                    for (let i = 0; i <= index; i++) this.circles[i].classList.add('active');
                } else {
                    for (let i = index; i < this.circles.length; i++) this.circles[i].classList.remove('active');
                }
                this.save();
            });
        });

        this.allInputs.forEach((input) => {
            input.addEventListener('input', () => this.save());
            input.addEventListener('change', () => this.save());
        });

        // Recalcula modificadores e risca atributos iniciais usados ao editar valor
        this.attrPairs.forEach(({ val }) => {
            const el = document.getElementById(val);
            if (el) el.addEventListener('input', () => {
                this.updateModifiers();
                this.updateStrikethrough();
                this.applyClassEffects();
                this.updateAlignmentOptions();
                this.save();
            });
        });

        this.clearInputs();
        this.load();
        this.classSelector();
        this.updateModifiers();
        this.updateStrikethrough();
        this.updateAlignmentOptions();
        this.renderClassMoves();
    }

    save(){
        SaveAndLoad.autoSave([this.allInputs, this.circles]);
    }

    load(){
        SaveAndLoad.autoLoad([this.allInputs, this.circles]);
    }

    // Tabela de modificadores Dungeon World
    clearInputs() {
        // Limpar todos os inputs
        this.allInputs.forEach((input) => {
            if (input.type === 'checkbox'){ 
                input.checked = false;
            }
            if (input.type === 'select-one') {
                input.selectedIndex = 0; 
                input.value = '';
            }
            else input.value = '';
        });

        // Limpar todos os círculos de XP
        this.circles.forEach((circle) => {
            circle.classList.remove('active');
        });
    }

    // Renderiza movimentos e informações da classe selecionada dentro do elemento #classMoves
    renderClassMoves() {
        const container = document.getElementById('classMovesList');
        if (this.charClass.value === "Classe" || !this.charClass.value) {
            container.innerHTML = '<div class="movement-list"><em>Selecione uma classe para ver os movimentos.</em></div>';
            return;
        }
        container.innerHTML = '';
        let movementList = [];
        movementList = this.toggleMovementType ? Mechanics.Movement.getMovementListByClass(this.charClass.value) : Mechanics.Movement.getBasicMovements();



        // Precisa ter uma forma mais eficiente de filtrar movimentos raciais, mas por enquanto, vamos fazer isso aqui:
        for (const movement of movementList) {
            if (this.charClass.value.toLowerCase() !== "bárbaro") {
                if (this.charRace.value && movement.tipo === "Racial" && movement.nome !== this.charRace.value) {
                    movementList.splice(movementList.indexOf(movement), 1);
                }
            }
        }
        if(this.movementListFormat === 'card') {
            let cardbox = document.createElement('div');
            cardbox.classList.add('movement-cardbox');
            for (const movement of movementList) {   
                cardbox.innerHTML += Mechanics.Movement.render(movement, this.movementListFormat, true);
            }
            container.appendChild(cardbox);
        } else if(this.movementListFormat === 'list') {
            let panelBox = document.createElement('div');
            panelBox.classList.add('movement-list');
            for (const movement of movementList) {
                panelBox.innerHTML += Mechanics.Movement.render(movement, this.movementListFormat, true);
            }
            container.appendChild(panelBox);
        }
            return;
    }

    // === Funções de classe/atributo (escopo de módulo) ===
    findClassByName(name) {
        if (!name) return null;
        const normalized = Utils.canonical(name);
        return this.classDetails.find((cd) => Utils.canonical(cd.nome) === normalized) || null;
    }

    updateClassSpellsVisibility() {
        const classSelect = document.getElementById('charClass');
        const classSpells = document.getElementById('classSpells');
        if (!classSpells || !classSelect) return;
        const sel = Utils.canonical(classSelect.value);
        classSpells.style.display = (sel === 'mago' || sel === 'clerigo') ? '' : 'none';
    }

    applyClassEffects() {
        const classSelect = document.getElementById('charClass');
        const selectedName = classSelect ? classSelect.value : '';
        const cls = this.findClassByName(selectedName);
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
        this.updateClassSpellsVisibility();
    }

    // Funções para adicionar itens, magias e movimentos à ficha
    addEquipmentToList(listId) {
        const listEl = document.getElementById(listId);
        if (!listEl) return;
        const item = "<div class='list-item'>" +
            "<input class='spell-name' type='text' placeholder='Nome do equipamento' style='flex:2' />" +
            "<input class='spell-name' type='number' placeholder='Peso' min='0' style='width:60px' />" +
            "<button onclick=\"this.closest('.list-item').remove()\" class='removeIcon'>&#215</button>" +
            "</div>";
        listEl.insertAdjacentHTML('beforeend', item);
    }

    addConsumableToList(listId) {
        const listEl = document.getElementById(listId);
        if (!listEl) return;
        const item = "<div class='list-item'>" +
            "<input class='spell-name' type='text' placeholder='Nome do consumível' style='flex:2' />" +
            "<input class='spell-name' type='number' placeholder='Peso' min='0' style='width:60px' />" +
            "<div class='use-boxes' style='display:flex;gap:4px;flex-wrap:wrap;align-items:center'></div>" +
            "<button onclick=\"addConsumableUse(this.closest('.list-item'))\" class='addConsumable'>&#x2b</button>" +
            "<button onclick=\"this.closest('.list-item').remove()\" class='removeIcon'>&#215</button>" +
            "</div>";
        listEl.insertAdjacentHTML('beforeend', item);
    }

    addConsumableUse(itemEl) {
        const useBoxes = itemEl.querySelector('.use-boxes');
        if (!useBoxes) return;
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'gold_filling';
        useBoxes.appendChild(cb);
    }

    addSpellToList(listId, spellName) {

    }

    addBondToActiveList(bondName) {
        const listEl = document.getElementById("bondsArea");
        if (!listEl || !bondName) return;
        this.character.bonds.push(Mechanics.Bond.create("custom", bondName, false));
        this.updatedBondsList();
    }

    updatedBondsList() {
        const listEl = document.getElementById("bondsArea");
        if (!listEl) return;
        if (this.character.bonds.length === 0) {
            listEl.innerHTML = "<em>Não há vínculos ativos.</em>";
            return;
        }
        listEl.innerHTML = "";
        for (const bond of this.character.bonds) {
            listEl.insertAdjacentHTML('beforeend', Mechanics.Bond.render(bond));
        }
    }

    updateModifiers() { 
        this.attrPairs.forEach(({ val, mod, deb }) => {
            const valEl = document.getElementById(val);
            const modEl = document.getElementById(mod);
            const debEl = document.getElementById(deb);
            const debValue = debEl ? (debEl.checked ? -1 : 0) : 0;
            if (valEl && modEl) {
                let modificador = this.character.abilityModifier(valEl.value, debValue);
                modEl.value = modificador >= 0 ? `+${modificador}` : `${modificador}`;
            } else {
                modEl.value = "invalido";
            }
        });
    }

    updateStrikethrough() {
        const used = new Set();
        this.attrPairs.forEach(({ val }) => {
            const v = parseInt(document.getElementById(val)?.value, 10);
            if (Number.isFinite(v) && v > 0) used.add(v);
        });
        document.querySelectorAll('.init-val').forEach((span) => {
            if (used.has(parseInt(span.dataset.val, 10))) span.classList.add('used');
            else span.classList.remove('used');
        });
    }

    updateAlignmentOptions() {
        const charAlignment = document.getElementById('charAlignment');
        charAlignment.innerHTML = '<option value="">Selecione</option>';
        const cls = this.findClassByName(this.charClass.value);
        const alinhamentosDisponiveis = cls && cls.alinhamento ? cls.alinhamento : null;
        for (const alignment of alinhamentosDisponiveis || []) {
            let option = document.createElement("option");
            option.value = alignment.id;
            option.textContent = (alignment.nome ? `${alignment.nome}` : '') + (alignment.descricao ? ` - ${alignment.descricao}` : '');
            charAlignment.appendChild(option);
        }

    }

    findAllowedClasses(race) {
            if (!race) return null;
            const normalized = Utils.canonical(race);
            const allowed = this.classDetails
                .filter((cd) => (cd.racas || []).some((r) => Utils.canonical(r) === normalized))
                .map((cd) => cd.nome);
            return allowed.length ? allowed : null;
    }

    findAllowedRaces(className) {
            if (!className) return null;
            const normalized = Utils.canonical(className);
            const cls = this.classDetails.find((cd) => Utils.canonical(cd.nome) === normalized);
            return (cls && cls.racas && cls.racas.length) ? cls.racas : null;
    }

    updateClassOptions(){
        const race = this.charRace.value;
        const allowed = this.findAllowedClasses(race);
        const allowedSet = allowed ? new Set(allowed.map((a) => Utils.canonical(a))) : null;
        Array.from(this.charClass.options).forEach((option) => {
            if (!option.value) return;
            const optCan = Utils.canonical(option.value);
            const isDisabled = allowedSet === null ? false : !allowedSet.has(optCan);
            option.disabled = isDisabled;
            if (isDisabled) option.classList.add('disabled-by-race');
            else option.classList.remove('disabled-by-race');
        });
        const selected = this.charClass.value;
        if (selected && this.charClass.querySelector(`option[value="${selected}"]`).disabled) {
            this.charClass.value = '';
        }
        this.applyClassEffects();
    }

    updateRaceOptions() {
        const className = this.charClass.value;
        const allowedRaces = this.findAllowedRaces(className);
        const allowedSet = allowedRaces ? new Set(allowedRaces.map((r) => Utils.canonical(r))) : null;
        Array.from(this.charRace.options).forEach((option) => {
            if (!option.value) return;
            const optCan = Utils.canonical(option.value);
            const isDisabled = allowedSet === null ? false : !allowedSet.has(optCan);
            option.disabled = isDisabled;
            if (isDisabled) option.classList.add('disabled-by-race');
            else option.classList.remove('disabled-by-race');
        });
        const selectedRace = this.charRace.value;
        if (selectedRace && this.charRace.querySelector(`option[value="${selectedRace}"]`).disabled) {
            this.charRace.value = '';
        }
    }

    // Aplica restrições cruzadas entre `charRace` e `charClass`.
    classSelector() {
        const raceInput = this.charRace;
        const classSelect = this.charClass;

        this.updateClassOptions();
        this.updateRaceOptions();
    }

    // Método para limpar a ficha (retornar ao estado 0)
    clearSheet() {
        // Limpar  localStorage e sessionStorage
        SaveAndLoad.clearState();
        this.clearInputs();

        document.getElementById("classMovesList").innerHTML = '';
        document.getElementById("spells_available").innerHTML = '';

        // Resetar selectboxes
        document.getElementById("charRace").selectedIndex = 0;
        document.getElementById("charClass").selectedIndex = 0;
        this.character.classe = "";
        this.character.raca = "";

        // Atualizar modifiers e strikes
        this.updateModifiers();
        this.updateAlignmentOptions();
        this.updateStrikethrough();
        this.applyClassEffects();
        this.renderClassMoves();
    }
}

const sheet = new CharacterSheet();
