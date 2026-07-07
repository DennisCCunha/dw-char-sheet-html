import dungeonworld from "../data/dungeonworld.json" with { type: "json" };


export class Bond {
    static create(nome ="", descricao="", finalizado = false) {
        return {
            id:0,
            nome: nome,
            template: descricao,
            finalizado: finalizado           
        };
    }

    static define(){

    }

    static end(bond) {
        bond.finalizado = true;
    }

    static render(bond) {
        return `<div class="bond"> <input type="checkbox" title="Finalizado" class="gold_filling"/> <label class="bond-name" value="${bond.nome}"/> </div>`;
    }
    static bondListByClass(classe) {
        return dungeonworld.lista_bonds.filter(bond => bond.classe === classe);
    }
}

export class Consumable {
    static create(id = 0, nome = "", descricao = "", usos = 0, peso = 0, tags = [], notes = "") {
        return {
            nome: nome,
            descricao: descricao,
            peso: peso,
            usos: usos,
            tags: tags
        };
    }
    static consume(consumable) {
        if (consumable.usos > 0) {
            consumable.usos--;
        }
    }
    static render(consumable) {
        return "<div class='list-item'>" +
        "<input class='spell-name' type='text' placeholder='Nome do consumível' style='flex:2' />" +
        "<input class='spell-name' type='number' placeholder='Peso' min='0' style='width:60px' />" +
        "<div class='use-boxes' style='display:flex;gap:4px;flex-wrap:wrap;align-items:center'></div>" +
        "<button onclick=\"addConsumableUse(this.closest('.list-item'))\" class='addConsumable'>&#x2b</button>" +
        "<button onclick=\"this.closest('.list-item').remove()\" class='removeIcon'>&#215</button>" +
        "</div>";
    }
}

export class Equipment {

    static create(id = 0, nome = "", descricao = "", usos = 0, peso = 0, tags = [], notes = "") {
        return {
            nome: nome,
            descricao: descricao,
            peso: peso,
            tags: tags
        };
    }
    static render(equipment = {nome: "", descricao: "", peso: 0, tags: [], notes: ""}) {
        let eqp = `<div class='list-item equipment-item'>"
            "<input class='spell-name' type='text' placeholder='Nome do equipamento' style='flex:2' />"
            "<input class='spell-name' type='number' placeholder='Peso' min='0' style='width:60px' />"
            "<input class='spell-name' type='text' placeholder='Descrição' style='flex:3' />"
            "<input class='spell-name' type='text' placeholder='Notas' style='flex:3' />"
        "<select multiple></select>`;
        for (let i = 0; i < 5; i++) {
            eqp += "<option value='" + i + "'>Tag " + (i + 1) + "</option>";
        }

        eqp += "<button class='addItem'>&#215</button>" +
        "</div>";
        return eqp;
    }
}

export class Movement {
    static create(id = 0, nome ="", descricao="", tags = []) {
        return {
            id: id,
            nome: nome,
            descricao: descricao,
            tags: tags
        };
    }


    static getMovementListByClass(classe) {
        return dungeonworld.lista_movimentos.filter(movement => movement.classe === classe);
    }

    // WIP - Retorna o html do design do Card, segundo imagem na Issue #5
    static renderCard(movement) {
        let icon = "basico";
        if (movement.tipo.includes("Especial")) {
            icon = "especial";
        }
        else if (movement.tipo.includes("Avançado")) {
            icon = "avançado";
        }

        return `<div class="movement-card">
                    <div class="movement-card-header">
                        <div class="movement-card-title">
                            <img class="movement-card-icon" src="../assets/icons/${icon}.png" alt="${icon}" />
                            <h2>${movement.nome}</h2>
                        </div>
                        <div class="movement-card-roll">
                            ${movement.rolagem ? `<div class="movement-card-roll-detail"> 
                                <span class="movement-card-icon">&#9860 &#9861</span>
                                <span>${movement.rolagem}</span>
                                </div>` : ''}
                        </div>
                    </div>

                    <section class="movement-card-description">
                        <blockquote>
                            <p>${movement.descricao}</p>
                        </blockquote>
                    </section>

                    <section class="movement-card-results">
                    </section>

                    <div class="movement-card-footer">
                        <strong>MOVIMENTO</strong>
                        <strong>${icon.toUpperCase()}</strong>
                    </div>
                </div>`;
    }

    static renderPanel(movement, selectable = false) {
        return `<div class="movement-panel">
                    <div class="movement-panel-header">
                        <div class="movement-panel-title">
                            ${selectable ? `<input id="selectable-movement-${movement.id}" type="checkbox" class="movement-select"/>` : ''}
                            <h3>${movement.nome}</h3>
                        </div>
                        <div class="movement-panel-info">
                            ${movement.tipo ? `<span class="movement-panel-type">Tipo: ${movement.tipo}</span>` : ''}
                        </div>
                    </div>
                    <div class="movement-panel-details">
                        ${movement.rolagem ? `<span class="movement-panel-roll">Rolagem: <strong>${movement.rolagem}</strong></span>` : ''}
                    </div>
                    <div class="movement-panel-description">
                        <p class="">${movement.descricao}</p>
                    </div>
                </div>`;
    }

    static render(movement, format, selectable = false) {
        if (format === "card") {
            return Movement.renderCard(movement);
        }
        return Movement.renderPanel(movement, selectable);
    }

    static selectableMovementsByClass(movement, format = "card") {
        return Movement.render(movement, format, true);
    }

    // WIP - Formatar o texto para se conformar ao design do Card, segundo imagem na Issue #5
    static formatToMovementCard(texto) {
        // Normaliza quebras de linha
        texto = texto.replace(/\r\n/g, "\n").trim();

        const resultado = {
            descricaoInicial: null,
            rolagem: null,
            criteriosRolagem: [],
            efeitos: [],
            textoFinal: null
        };

        // Regex sugeridos
        const regexRolagem = /Role(?:\s+com)?\s*[\+\-]?\s*[\wÁÉÍÓÚÂÊÔÃÕÇ]+/i;
        const regexCriterio = /(?:Em um|Com|Num)?\s*(10\+|7-9|6-)/i;
        const regexItemLista = /^\s*(?:•|-|\*|\d+\.)\s+(.+)$/gm;

        //--------------------------------------------------
        // 1. Descrição inicial
        //--------------------------------------------------

        const primeiroMarcador = [
            texto.search(regexRolagem),
            texto.search(regexCriterio),
            texto.search(/^\s*(?:•|-|\*|\d+\.)/m)
        ]
            .filter(i => i >= 0)
            .sort((a, b) => a - b)[0];

        if (primeiroMarcador !== undefined) {
            resultado.descricaoInicial = texto
                .substring(0, primeiroMarcador)
                .trim();

            texto = texto.substring(primeiroMarcador).trim();
        } else {
            resultado.descricaoInicial = texto;
            return resultado;
        }

        //--------------------------------------------------
        // 2. Rolagem
        //--------------------------------------------------

        const matchRolagem = texto.match(regexRolagem);

        if (matchRolagem) {
            resultado.rolagem = matchRolagem[0].trim();

            texto = texto.replace(matchRolagem[0], "").trim();
        }

        //--------------------------------------------------
        // 3. Critérios (10+, 7-9, 6-)
        //--------------------------------------------------

        let linhas = texto.split("\n");

        let criterioAtual = null;

        for (let linha of linhas) {

            linha = linha.trim();

            if (!linha)
                continue;

            const criterio = linha.match(regexCriterio);

            if (criterio) {

                criterioAtual = {
                    criterio: criterio[1],
                    efeitos: []
                };

                resultado.criteriosRolagem.push(criterioAtual);

                continue;
            }

            //--------------------------------------------------
            // Lista
            //--------------------------------------------------

            const item = linha.match(/^(?:•|-|\*|\d+\.)\s+(.+)/);

            if (item) {

                if (criterioAtual) {
                    criterioAtual.efeitos.push(item[1]);
                } else {
                    resultado.efeitos.push(item[1]);
                }

                continue;
            }

            //--------------------------------------------------
            // Texto solto
            //--------------------------------------------------

            if (criterioAtual) {
                criterioAtual.efeitos.push(linha);
            } else {

                resultado.textoFinal =
                    (resultado.textoFinal ?? "") +
                    (resultado.textoFinal ? "\n" : "") +
                    linha;
            }
        }

        return resultado;
    }

}

export class Spell {
    static create(id = 90000, classe = [], nome ="", nivel = 0, school = "", continuo = false, descricao="", tags = []) {
        return {
            id: id,
            classe: classe,
            nome: nome,
            nivel: nivel,
            school: school,
            continuo: continuo,
            descricao: descricao,
            tags: tags
        };
    }
    static render(spell) {
        return `<div class="spell"> <input type="checkbox" title="Preparada" class="gold_filling"/> <input class="spell-name" value="${spell.nome}"/> <label>${spell.nivel}</label></div>`;
    }

    static getSpellListByClassAndLevel(classe, nivel=0) {
        const spells = dungeonworld.spells.filter(spell => spell.classe.includes(classe));
        if (nivel > 0) {
            return spells.filter(spell => spell.nivel === nivel);
        }
        else {
            return spells;
        }
    }

    static renderSpellList(container, spells) {
        if (!container || !spells) {
            console.error("Container or spells list is undefined.");
            return "Container or spells list is undefined.";
        }
        const spellListContainer = document.getElementById(container);
        spellListContainer.innerHTML = '';
        spells.forEach(spell => {
            const spellElement = document.createElement('div');
            spellElement.classList.add('spell');
            spellElement.innerHTML = Spell.render(spell);
            spellListContainer.appendChild(spellElement);
        });

    }

    static renderSpell(spell, format) {
        if (format === "card") {
            return `<div class="spell-card">
                        <h2>${spell.nome}</h2>
                        <p>${spell.descricao}</p>
                    </div>`;
        }
        else{
            return `<div id="spell-${spell.id}" class="spell">
                <input type="checkbox" title="No grimório" class="gold_filling" />
                <input type="checkbox" title="Preparada" class="blue_filling"/>
                <input class="spell-name" value="${spell.nome}" />
            </div>`;
        }
    }

    static renderSpellGroupbyClass(classe) {
        const spells = Spell.getSpellListByClassAndLevel(classe);
        const spellGroupContainer = document.getElementById("spells_available");
        spellGroupContainer.appendChild(document.createElement('h3'))
            .appendChild(document.createElement("input")).type = "text"
            .appendChild(document.createElement("input")).value = "${spell.nivel > 0 ? 'Nível ' + spell.nivel : 'Truques'}";
        
        // "<div class="spell-group"><h3><input value="Truques" /></h3>"
    }

}

export default { Bond, Consumable, Equipment, Movement, Spell };
