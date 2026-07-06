import dungeonworld from "../data/dungeonworld.json" with { type: "json" };
import SaveAndLoad from './saveAndLoad.js';
import Mechanics from './mechanics.js';
import Utils from './utils.js';

class CharacterSheet {

    constructor() {
        // Garantir ids únicos para todos os inputs/checkboxes/circles e usar esses ids ao salvar/carregar
        this.circles = Array.from(document.querySelectorAll('.circle'));
        this.allInputs = Array.from(document.querySelectorAll('input, select, textarea'));
        this.quill = new Quill(document.getElementById('charNotes'), { theme: 'snow' });

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

        this.start();
        this.registryEvents();
    }

    registryEvents() {
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
            console.log('Restaurando código:', code);
            try {
                SaveAndLoad.applyState([this.allInputs, this.circles], SaveAndLoad.decodeState(code));
                this.save();
                this.classSelector();
                this.updateModifiers();
                this.updateStrikethrough();
                this.renderClassMoves();
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
                this.clearInputs();
                SaveAndLoad.clearState();
            }
        });

        // Fechar modais clicando no fundo escuro
        ['codeModal', 'restoreModal', 'clearModal'].forEach((id) => {
            document.getElementById(id).addEventListener('click', (e) => {
                if (e.target.id === id) document.getElementById(id).style.display = 'none';
            });
        });

        document.getElementById('btnAddMovement').addEventListener('click', (e) => {
                let movement = e;
                this.character.addMovement()
            })
        };


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
                this.save();
            });
        });

        this.load();
        this.classSelector();
        this.updateModifiers();
        this.updateStrikethrough();
        this.renderClassMoves();
    }

    save(){
        SaveAndLoad.autoSave([this.allInputs, this.circles]);
    }
    load(){
        SaveAndLoad.autoLoad([this.allInputs, this.circles]);
    }

    // Tabela de modificadores Dungeon World
    computeModifier(val) {
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

    clearInputs() {
        // Limpar todos os inputs
        this.allInputs.forEach((input) => {
            if (input.type === 'checkbox') input.checked = false;
            else input.value = '';
        });

        // Limpar todos os círculos de XP
        this.circles.forEach((circle) => {
            circle.classList.remove('active');
        });
    }

    // Renderiza movimentos e informações da classe selecionada dentro do elemento #classMoves
    renderClassMoves() {
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

        const cls = this.classDetails.find((cd) => Utils.canonical(cd.nome) === Utils.canonical(className));
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
            const found = keys.find((k) => Utils.canonical(k) === Utils.canonical(race));
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

    updateModifiers() {
        this.attrPairs.forEach(({ val, mod }) => {
            const valEl = document.getElementById(val);
            const modEl = document.getElementById(mod);
            if (valEl && modEl) modEl.value = this.computeModifier(valEl.value);
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

    // Aplica restrições cruzadas entre `charRace` e `charClass`.
    classSelector() {
        const raceInput = document.getElementById('charRace');
        const classSelect = document.getElementById('charClass');

        const findAllowedClasses = (race) => {
            if (!race) return null;
            const normalized = Utils.canonical(race);
            const allowed = this.classDetails
                .filter((cd) => (cd.racas || []).some((r) => Utils.canonical(r) === normalized))
                .map((cd) => cd.nome);
            return allowed.length ? allowed : null;
        }

        const findAllowedRaces = (className) => {
            if (!className) return null;
            const normalized = Utils.canonical(className);
            const cls = this.classDetails.find((cd) => Utils.canonical(cd.nome) === normalized);
            return (cls && cls.racas && cls.racas.length) ? cls.racas : null;
        }

        const updateClassOptions = () => {
            const race = raceInput.value;
            const allowed = findAllowedClasses(race);
            const allowedSet = allowed ? new Set(allowed.map((a) => Utils.canonical(a))) : null;
            Array.from(classSelect.options).forEach((option) => {
                if (!option.value) return;
                const optCan = Utils.canonical(option.value);
                const isDisabled = allowedSet === null ? false : !allowedSet.has(optCan);
                option.disabled = isDisabled;
                if (isDisabled) option.classList.add('disabled-by-race');
                else option.classList.remove('disabled-by-race');
            });
            const selected = classSelect.value;
            if (selected && classSelect.querySelector(`option[value="${selected}"]`).disabled) {
                classSelect.value = '';
            }
            this.applyClassEffects();
        }

        const updateRaceOptions = () => {
            const className = classSelect.value;
            const allowedRaces = findAllowedRaces(className);
            const allowedSet = allowedRaces ? new Set(allowedRaces.map((r) => Utils.canonical(r))) : null;
            Array.from(raceInput.options).forEach((option) => {
                if (!option.value) return;
                const optCan = Utils.canonical(option.value);
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
            this.save()
            this.renderClassMoves();
        });

        classSelect.addEventListener('change', () => {
            const opt = classSelect.selectedOptions[0];
            if (opt && opt.disabled) classSelect.value = '';
            updateRaceOptions();
            this.applyClassEffects();
            this.save();
            this.renderClassMoves();
        });

        updateClassOptions();
        updateRaceOptions();
    }

    // Método para limpar a ficha (retornar ao estado 0)
    clearSheet() {
        // Limpar  localStorage e sessionStorage
        SaveAndLoad.clearState();
        this.clearInputs();

        // Resetar selectboxes
        document.getElementById('charRace').value = '';
        document.getElementById('charClass').value = '';

        // Atualizar modifiers e strikes
        this.updateModifiers();
        this.updateStrikethrough();
        this.applyClassEffects();
        this.renderClassMoves();
    }

}

new CharacterSheet();