"""Script de refatoração de sheetFunction.js"""
import re

FILE = r"c:\Users\denni\OneDrive\Documentos\Projetos\dw-char-sheet\sheetFunction.js"

with open(FILE, encoding="utf-8") as f:
    lines = f.readlines()

# classDetails inicia na linha 21 (1-indexed) => índice 20
# conteúdo da lista está nas linhas 22-549 (1-indexed) => índice 21-548
# fechamento ]; está na linha 550 => índice 549
CLASS_DATA_LINES = lines[21:549]  # conteúdo interno (sem a linha "const classDetails = [" e o "];")

SECTION = "      // {0}\n"
SEP     = "      // " + "─" * 70 + "\n"

def sec(title):
    return SEP + SECTION.format(title) + SEP

# ── CABEÇALHO (antes de classDetails) ────────────────────────────────────────
HEADER = """\
{constants_sec}
      const XOR_KEY            = 'DungeonWorld2024';
      const INITIAL_ATTR_SUM   = 73; // 16 + 15 + 13 + 12 + 9 + 8
      const INITIAL_ATTRIBUTES = {{ stat: [16, 15, 13, 12, 9, 8], mod: [2, 1, 1, 0, 0, -1] }};
      const ATTR_PAIRS = [
        {{ val: 'valFor', mod: 'modFor' }},
        {{ val: 'valDes', mod: 'modDes' }},
        {{ val: 'valCon', mod: 'modCon' }},
        {{ val: 'valInt', mod: 'modInt' }},
        {{ val: 'valSab', mod: 'modSab' }},
        {{ val: 'valCar', mod: 'modCar' }},
      ];

{class_data_sec}
      const classDetails = [
""".format(
    constants_sec=sec("CONSTANTS"),
    class_data_sec=sec("CLASS DATA"),
)

# ── RODAPÉ (depois do conteúdo de classDetails) ───────────────────────────────
FOOTER = """\
      ];

{dom_sec}
      const circles   = Array.from(document.querySelectorAll('.circle'));
      const allInputs = Array.from(document.querySelectorAll('input, select, textarea'));

{utility_sec}

      // Remove acentos e normaliza para lower-case (comparações tolerantes)
      function canonical(text) {{
        return (text || '')
          .toString()
          .normalize('NFD')
          .replace(/\\p{{Diacritic}}/gu, '')
          .trim()
          .toLowerCase();
      }}

      // Tabela de modificadores do Dungeon World
      function computeModifier(val) {{
        const v = parseInt(val, 10);
        if (!Number.isFinite(v)) return '';
        if (v <= 3)  return '-3';
        if (v <= 5)  return '-2';
        if (v <= 8)  return '-1';
        if (v <= 11) return '+0';
        if (v <= 15) return '+1';
        if (v <= 17) return '+2';
        return '+3';
      }}

{state_sec}

      function collectState() {{
        const state = {{}};
        allInputs.forEach((input) => {{
          if (input.type === 'checkbox') state[input.id] = input.checked ? '1' : '0';
          else state[input.id] = input.value;
        }});
        circles.forEach((circle) => {{
          state[circle.id] = circle.classList.contains('active') ? '1' : '0';
        }});
        return state;
      }}

      function applyState(state) {{
        allInputs.forEach((input) => {{
          if (state[input.id] === undefined) return;
          if (input.type === 'checkbox') input.checked = state[input.id] === '1';
          else input.value = state[input.id];
        }});
        circles.forEach((circle) => {{
          circle.classList.toggle('active', state[circle.id] === '1');
        }});
      }}

      // Cifra XOR com suporte a UTF-8 / caracteres acentuados
      function encodeState(state) {{
        const keyBytes = new TextEncoder().encode(XOR_KEY);
        const bytes    = new TextEncoder().encode(JSON.stringify(state));
        const xored    = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) xored[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
        let binary = '';
        for (let i = 0; i < xored.length; i++) binary += String.fromCharCode(xored[i]);
        return btoa(binary);
      }}

      function decodeState(code) {{
        const keyBytes = new TextEncoder().encode(XOR_KEY);
        const binary   = atob(code);
        const bytes    = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const xored = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) xored[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
        return JSON.parse(new TextDecoder().decode(xored));
      }}

      function autoSave() {{
        try {{
          localStorage.setItem('dw_sheet_code', encodeState(collectState()));
        }} catch (e) {{ /* silent */ }}
      }}

      function autoLoad() {{
        const saved = localStorage.getItem('dw_sheet_code');
        if (!saved) return;
        try {{
          applyState(decodeState(saved));
        }} catch (e) {{
          console.warn('Falha ao restaurar ficha:', e);
        }}
      }}

{attr_sec}

      function updateModifiers() {{
        ATTR_PAIRS.forEach(({{ val, mod }}) => {{
          const valEl = document.getElementById(val);
          const modEl = document.getElementById(mod);
          if (valEl && modEl) modEl.value = computeModifier(valEl.value);
        }});
      }}

      function updateStrikethrough() {{
        const used = new Set();
        ATTR_PAIRS.forEach(({{ val }}) => {{
          const v = parseInt(document.getElementById(val)?.value, 10);
          if (Number.isFinite(v) && v > 0) used.add(v);
        }});
        document.querySelectorAll('.init-val').forEach((span) => {{
          span.classList.toggle('used', used.has(parseInt(span.dataset.val, 10)));
        }});
      }}

{class_sec}

      function findClassByName(name) {{
        if (!name) return null;
        return classDetails.find((cd) => canonical(cd.nome) === canonical(name)) || null;
      }}

      function updateClassSpellsVisibility() {{
        const classSelect = document.getElementById('charClass');
        const classSpells = document.getElementById('classSpells');
        if (!classSpells || !classSelect) return;
        const sel = canonical(classSelect.value);
        classSpells.style.display = (sel === 'mago' || sel === 'clerigo') ? '' : 'none';
      }}

      function applyClassEffects() {{
        const classSelect  = document.getElementById('charClass');
        const selectedName = classSelect ? classSelect.value : '';
        const cls          = findClassByName(selectedName);
        const charDmgInput = document.getElementById('charDmg');
        const charPVInput  = document.getElementById('charPV');
        const conVal       = parseInt((document.getElementById('valCon') || {{ value: '' }}).value, 10);
        const conNum       = Number.isFinite(conVal) ? conVal : 0;

        if (cls) {{
          if (charDmgInput) charDmgInput.value = cls.dado_dano;
          if (charPVInput)  charPVInput.value  = (cls.hp_base || 0) + conNum;
          const charLoadInput = document.getElementById('charLoad');
          const modForEl      = document.getElementById('modFor');
          let modForNum = 0;
          if (modForEl && modForEl.value) {{
            const parsed = parseInt(modForEl.value.replace(/[^0-9-]/g, ''), 10);
            if (!Number.isNaN(parsed)) modForNum = parsed;
          }} else {{
            const valFor = parseInt((document.getElementById('valFor') || {{ value: '' }}).value, 10);
            if (Number.isFinite(valFor)) modForNum = Math.floor((valFor - 10) / 2);
          }}
          if (charLoadInput) charLoadInput.value = (cls.carga_base || 0) + modForNum;
        }} else {{
          if (charDmgInput) charDmgInput.value = '';
          if (charPVInput)  charPVInput.value  = '';
          const charLoadInput = document.getElementById('charLoad');
          if (charLoadInput) charLoadInput.value = '';
        }}
        updateClassSpellsVisibility();
      }}

{render_sec}

      function renderList(title, arr) {{
        if (!arr || !arr.length) return '';
        let s = `<h3>${{title}}</h3><div class="list-container">`;
        arr.forEach((it) => {{
          s += `<div class="move-item"><h4>${{it?.nome ?? ''}}</h4><p>${{it?.descricao ?? ''}}</p></div>`;
        }});
        s += '</div>';
        return s;
      }}

      function renderClassMoves() {{
        const container   = document.getElementById('classMovesList');
        if (!container) return;
        const classSelect = document.getElementById('charClass');
        const raceSelect  = document.getElementById('charRace');
        const className   = classSelect ? classSelect.value : '';
        const race        = raceSelect  ? raceSelect.value  : '';

        if (!className) {{
          container.innerHTML = '<div style="padding:12px"><em>Selecione uma classe para ver os movimentos.</em></div>';
          return;
        }}

        const cls = classDetails.find((cd) => canonical(cd.nome) === canonical(className));
        if (!cls) {{
          container.innerHTML = '<div style="padding:12px"><em>Classe não encontrada em classDetails.</em></div>';
          return;
        }}

        let html = '';
        if (cls.movimentos_raciais && race) {{
          const keys  = Object.keys(cls.movimentos_raciais || {{}});
          const found = keys.find((k) => canonical(k) === canonical(race));
          const mr    = found ? cls.movimentos_raciais[found] : null;
          if (mr && mr.length) html += renderList(`Movimentos raciais: ${{race}}`, mr);
        }}
        html += renderList('Movimentos iniciais',      cls.movimentos_iniciais      || []);
        html += renderList('Escolhas iniciais',        cls.escolha_inicial          || []);
        html += renderList('Movimentos (níveis 2-5)',  cls.movimentos_avancados_2_5 || []);
        html += renderList('Movimentos (níveis 6-10)', cls.movimentos_avancados_6_10 || []);

        if (cls.movimentos_substituidos) {{
          let s = '<h3>Movimentos substituídos</h3><ul>';
          Object.entries(cls.movimentos_substituidos).forEach(([k, v]) => {{ s += `<li>${{k}} → ${{v}}</li>`; }});
          s += '</ul>';
          html += s;
        }}

        container.innerHTML = html;
      }}

{list_sec}

      function addEquipmentToList(listId) {{
        const listEl = document.getElementById(listId);
        if (!listEl) return;
        const item =
          "<div class='list-item' style='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px;'>" +
          "<input class='spell-name' type='text' placeholder='Nome do equipamento' style='flex:2' />" +
          "<input class='spell-name' type='number' placeholder='Peso' min='0' style='width:60px' />" +
          "<button onclick=\\"this.closest('.list-item').remove()\\" class='removeIcon'>&#215</button>" +
          "</div>";
        listEl.insertAdjacentHTML('beforeend', item);
      }}

      function addConsumableToList(listId) {{
        const listEl = document.getElementById(listId);
        if (!listEl) return;
        const item =
          "<div class='list-item' style='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px;'>" +
          "<input class='spell-name' type='text' placeholder='Nome do consumível' style='flex:2' />" +
          "<input class='spell-name' type='number' placeholder='Peso' min='0' style='width:60px' />" +
          "<div class='use-boxes' style='display:flex;gap:4px;flex-wrap:wrap;align-items:center'></div>" +
          "<button onclick=\\"addConsumableUse(this.closest('.list-item'))\\" class='addConsumable'>&#x2b</button>" +
          "<button onclick=\\"this.closest('.list-item').remove()\\" class='removeIcon'>&#215</button>" +
          "</div>";
        listEl.insertAdjacentHTML('beforeend', item);
      }}

      function addConsumableUse(itemEl) {{
        const useBoxes = itemEl.querySelector('.use-boxes');
        if (!useBoxes) return;
        const cb = document.createElement('input');
        cb.type  = 'checkbox';
        useBoxes.appendChild(cb);
      }}

      // TODO: implementar adição de magias à ficha
      function addSpellToList(listId, spellName) {{}}

      function addBond() {{
        const bond      = document.getElementById('charBonds');
        const bondsArea = document.getElementById('bondsArea');
        if (!bond || !bondsArea || !bond.value.trim()) return;
        const item =
          "<div class='list-item'>" +
          "<label class='spell-name'>" + bond.value + "</label>" +
          "<button onclick=\\"removeBond(this)\\" class='removeIcon'>&#215</button>" +
          "</div>";
        bondsArea.insertAdjacentHTML('beforeend', item);
        bond.value = '';
      }}

      function removeBond(button) {{
        button.closest('.list-item')?.remove();
      }}

      function completeBond(button) {{
        const label = button.closest('.list-item')?.querySelector('label');
        if (label) label.style.textDecoration = 'line-through';
      }}

{sheet_sec}

      function clearSheet() {{
        try {{ localStorage.removeItem('dw_sheet_code');   }} catch (e) {{ /* silent */ }}
        try {{ sessionStorage.removeItem('dw_sheet_code'); }} catch (e) {{ /* silent */ }}
        allInputs.forEach((input) => {{
          if (input.type === 'checkbox') input.checked = false;
          else input.value = '';
        }});
        circles.forEach((circle) => circle.classList.remove('active'));
        document.getElementById('charRace').value  = '';
        document.getElementById('charClass').value = '';
        updateModifiers();
        updateStrikethrough();
        applyClassEffects();
        renderClassMoves();
      }}

{init_sec}

      // Assign stable IDs to inputs/circles that lack one (must run before autoLoad)
      allInputs.forEach((input, index) => {{
        if (!input.id) {{
          input.id = input.type === 'checkbox' ? `cb_auto_${{index}}` : `input_auto_${{index}}`;
        }}
      }});
      circles.forEach((circle, index) => {{
        if (!circle.id) circle.id = `xp_${{index}}`;
      }});

      // XP circles: fill up to / clear from the clicked position
      circles.forEach((circle, index) => {{
        circle.addEventListener('click', () => {{
          if (!circle.classList.contains('active')) {{
            for (let i = 0; i <= index; i++) circles[i].classList.add('active');
          }} else {{
            for (let i = index; i < circles.length; i++) circles[i].classList.remove('active');
          }}
          autoSave();
        }});
      }});

      // Persist state on any form change
      allInputs.forEach((input) => {{
        input.addEventListener('input', autoSave);
        input.addEventListener('change', autoSave);
      }});

      // Recalculate modifiers and strikethroughs on attribute change
      ATTR_PAIRS.forEach(({{ val }}) => {{
        const el = document.getElementById(val);
        if (el) el.addEventListener('input', () => {{
          updateModifiers();
          updateStrikethrough();
          applyClassEffects();
          autoSave();
        }});
      }});

      // Class / race cross-filtering
      (function initClassRaceSelector() {{
        const raceInput   = document.getElementById('charRace');
        const classSelect = document.getElementById('charClass');

        function findAllowedClasses(race) {{
          if (!race) return null;
          const allowed = classDetails
            .filter((cd) => (cd.racas || []).some((r) => canonical(r) === canonical(race)))
            .map((cd) => cd.nome);
          return allowed.length ? allowed : null;
        }}

        function findAllowedRaces(className) {{
          if (!className) return null;
          const cls = classDetails.find((cd) => canonical(cd.nome) === canonical(className));
          return (cls && cls.racas && cls.racas.length) ? cls.racas : null;
        }}

        function updateClassOptions() {{
          const allowed    = findAllowedClasses(raceInput.value);
          const allowedSet = allowed ? new Set(allowed.map((a) => canonical(a))) : null;
          Array.from(classSelect.options).forEach((option) => {{
            if (!option.value) return;
            const isDisabled = allowedSet !== null && !allowedSet.has(canonical(option.value));
            option.disabled  = isDisabled;
            option.classList.toggle('disabled-by-race', isDisabled);
          }});
          if (classSelect.value && classSelect.querySelector(`option[value="${{classSelect.value}}"]`)?.disabled) {{
            classSelect.value = '';
          }}
          applyClassEffects();
        }}

        function updateRaceOptions() {{
          const allowedRaces = findAllowedRaces(classSelect.value);
          const allowedSet   = allowedRaces ? new Set(allowedRaces.map((r) => canonical(r))) : null;
          Array.from(raceInput.options).forEach((option) => {{
            if (!option.value) return;
            const isDisabled = allowedSet !== null && !allowedSet.has(canonical(option.value));
            option.disabled  = isDisabled;
            option.classList.toggle('disabled-by-race', isDisabled);
          }});
          if (raceInput.value && raceInput.querySelector(`option[value="${{raceInput.value}}"]`)?.disabled) {{
            raceInput.value = '';
          }}
        }}

        raceInput.addEventListener('change', () => {{
          updateClassOptions();
          autoSave();
          renderClassMoves();
        }});

        classSelect.addEventListener('change', () => {{
          if (classSelect.selectedOptions[0]?.disabled) classSelect.value = '';
          updateRaceOptions();
          applyClassEffects();
          autoSave();
          renderClassMoves();
        }});

        updateClassOptions();
        updateRaceOptions();
      }})();

      autoLoad();
      updateModifiers();
      updateStrikethrough();
      renderClassMoves();

{modal_sec}

      document.getElementById('btnGerarCodigo').addEventListener('click', () => {{
        document.getElementById('codeModalText').value = encodeState(collectState());
        document.getElementById('codeModal').style.display = 'flex';
      }});

      document.getElementById('btnFecharModal').addEventListener('click', () => {{
        document.getElementById('codeModal').style.display = 'none';
      }});

      document.getElementById('btnCopiarCodigo').addEventListener('click', () => {{
        const ta  = document.getElementById('codeModalText');
        const btn = document.getElementById('btnCopiarCodigo');
        ta.select();
        try {{ navigator.clipboard.writeText(ta.value); }}
        catch (e) {{ document.execCommand('copy'); }}
        btn.textContent = '\\u2705 Copiado!';
        setTimeout(() => {{ btn.textContent = '\\uD83D\\uDCCB Copiar'; }}, 2000);
      }});

      document.getElementById('btnRestaurar').addEventListener('click', () => {{
        document.getElementById('restoreCodeInput').value    = '';
        document.getElementById('restoreError').style.display = 'none';
        document.getElementById('restoreModal').style.display = 'flex';
      }});

      document.getElementById('btnConfirmarRestaurar').addEventListener('click', () => {{
        const code = document.getElementById('restoreCodeInput').value.trim();
        try {{
          applyState(decodeState(code));
          autoSave();
          updateModifiers();
          updateStrikethrough();
          renderClassMoves();
          document.getElementById('restoreModal').style.display = 'none';
        }} catch (e) {{
          document.getElementById('restoreError').style.display = 'block';
        }}
      }});

      document.getElementById('btnCancelarRestaurar').addEventListener('click', () => {{
        document.getElementById('restoreModal').style.display = 'none';
      }});

      // Close modals when clicking the backdrop
      ['codeModal', 'restoreModal', 'clearModal'].forEach((id) => {{
        document.getElementById(id).addEventListener('click', (e) => {{
          if (e.target.id === id) document.getElementById(id).style.display = 'none';
        }});
      }});

{btn_sec}

      document.getElementById('addConsumable')?.addEventListener('click', () => {{
        addConsumableToList('consumablesContainer');
      }});

      document.getElementById('addEquipment')?.addEventListener('click', () => {{
        addEquipmentToList('equipmentContainer');
      }});

      document.getElementById('addBond')?.addEventListener('click', addBond);

      document.getElementById('btnLimpar').addEventListener('click', () => {{
        if (confirm('Tem certeza que deseja limpar a ficha? Esta ação não pode ser desfeita.')) {{
          clearSheet();
        }}
      }});
""".format(
    dom_sec=sec("DOM REFERENCES"),
    utility_sec=sec("UTILITY FUNCTIONS"),
    state_sec=sec("STATE MANAGEMENT"),
    attr_sec=sec("ATTRIBUTE FUNCTIONS"),
    class_sec=sec("CLASS & RACE FUNCTIONS"),
    render_sec=sec("RENDER FUNCTIONS"),
    list_sec=sec("LIST MANAGEMENT"),
    sheet_sec=sec("SHEET MANAGEMENT"),
    init_sec=sec("INITIALIZATION"),
    modal_sec=sec("MODAL EVENT LISTENERS"),
    btn_sec=sec("BUTTON EVENT LISTENERS"),
)

# Montar conteúdo final
content = HEADER + "".join(CLASS_DATA_LINES) + FOOTER

with open(FILE, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print(f"Arquivo refatorado com sucesso! ({len(content.splitlines())} linhas)")
