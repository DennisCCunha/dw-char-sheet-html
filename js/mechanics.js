import dungeonworld from "../data/dungeonworld.json" with { type: "json" };

export class Bond {
    static create(id = 0, nome ="", template="", alvo= "", finalizado = false) {
        return {
            id: id,
            nome: nome,
            template: template,
            finalizado: finalizado,
            alvo: alvo,
        };
    }

    static getBondList() {
        return dungeonworld.lista_bonds;
    }

    static getBondListByClass(classe) {
        return dungeonworld.lista_bonds.filter(bond => bond.classe === classe);
    }

    static define(){
    }

    static end(bond) {
        bond.finalizado = true;
    }

    static render(bond) {
        return `<div class="bond" id="bond-${bond.id}">

        <label class="bond-template">${bond.template}</label> 
        <label class="bond-name">${bond.alvo}</label>
        <button id="btn-end-bond" class="bond-end">END</button>
        </div>`;
    }

    static renderBondTemplate(bond){
        return `<div class="bond-template"> 
        <input id="bond-name" class="bond-name" value="${bond.nome}" />
        <p>${bond.template}</p>
        <button id="btn-add-bond" class="addBond">ADD</button>
        </div>`;
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
    static #parsing(movement) {
            let texto = movement.descricao;
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
            const regexCriterio = /(?:Em um|Com|Num)?\s*(\d+[\+\-](?:\d+)?)/i;
            const regexEfeito = /(?:•|-|\*|\d+\.)\s+(.+)/;
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

            for (let i = 0; i < linhas.length; i++) {

                let linha = linhas[i].trim();

                if (!linha)
                    continue;

                const criterio = linha.match(regexCriterio);

                if (criterio) {

                    criterioAtual = {
                        criterio: criterio[1],
                        efeito: "",
                        conteudo: []
                    };

                    resultado.criteriosRolagem.push(criterioAtual);

                    // Extrai tudo até o próximo critério
                    let proximoCriterio = -1;
                    for (let j = i + 1; j < linhas.length; j++) {
                        if (linhas[j].trim().match(regexCriterio)) {
                            proximoCriterio = j;
                            break;
                        }
                    }

                    const fimIntervalo = proximoCriterio >= 0 ? proximoCriterio : linhas.length;
                    for (let j = i + 1; j < fimIntervalo; j++) {
                        const conteudoLinha = linhas[j].trim();
                        if (conteudoLinha) {
                            criterioAtual.conteudo.push(conteudoLinha);
                        }
                    }

                    continue;
                }

                //--------------------------------------------------
                // Lista
                //--------------------------------------------------

                const item = linha.match(/^(?:•|-|\*|\d+\.)\s+(.+)/);

                if (item) {

                    if (criterioAtual) {
                        criterioAtual.efeito += (criterioAtual.efeito ? "\n" : "") + item[1];
                    } else {
                        resultado.efeitos.push(item[1]);
                    }

                    continue;
                }

                //--------------------------------------------------
                // Texto solto
                //--------------------------------------------------

                if (criterioAtual) {
                    criterioAtual.efeito += (criterioAtual.efeito ? "\n" : "") + linha;
                } else {

                    resultado.textoFinal =
                        (resultado.textoFinal ?? "") +
                        (resultado.textoFinal ? "\n" : "") +
                        linha;
                }
            }

            return resultado;
        
    }

    static create(id = 0, nome ="", descricao="", tags = []) {
        return {
            id: id,
            nome: nome,
            descricao: descricao,
            tags: tags
        };
    }

    static getMovementList(){
        return dungeonworld.lista_movimentos;
    }

    static getMovementListByClass(classe) {
        return dungeonworld.lista_movimentos.filter(movement => movement.classe === classe);
    }

    static getBasicMovements() {
        return dungeonworld.lista_movimentos.filter(movement => movement.classe === "basico").sort((a, b) => a.nome.localeCompare(b.nome));;
    }

    // WIP - Retorna o html do design do Card, segundo imagem na Issue #5
    static renderCard(movement) {
        let icon = "basico";
        if (movement.tipo.includes("Especial")) {
            icon = "especial";
        }
        else if (movement.tipo.includes("Avançado 2-5")) {
            icon = "avançado";
        }
        else if (movement.tipo.includes("Avançado 6-10")) {
            icon = "avançado2";
        }

        return `<div class="movement-card">
                    <div class="movement-card-header">
                        <div class="movement-card-title">
                            <img class="movement-card-icon" src="../assets/icons/${icon}.png" alt="${icon}" />
                            <h2>${movement.nome}</h2>
                        </div>
                        <div class="movement-card-roll">
                            ${movement.rolagem ? `<div class="movement-card-roll-detail"> 
                                <img class="movement-card-roll-detail-icon" src="../assets/icons/dados.png" alt="roll" />
                                <span>${movement.rolagem}</span>
                                </div>` : ''}
                        </div>
                    </div>

                    <section class="movement-card-description">
                        <p>${movement.descricao}</p>
                    </section>

                    <section class="movement-card-result">
                    </section>

                    <div class="movement-card-footer">
                        <strong>MOVIMENTO</strong>
                        <strong>${movement.tipo.toUpperCase()}</strong>
                    </div>
                </div>`;
    }

    static renderPanel(movement, selectable = false) {
        let inicial = '';
        if (movement.tipo === "Inicial" || movement.tipo === "Basico" || movement.tipo === "Especial") {
            inicial =  `<input id="selectable-movement-${movement.id}" type="checkbox" class="movement-select" checked disabled />`;
        }
        if(movement.tipo.includes("Avançado") && selectable){
            inicial =  `<input id="selectable-movement-${movement.id}" type="checkbox" class="movement-select" />`;
        }
        if(movement.exclusivo && selectable){
            inicial =  `<input id="selectable-movement-${movement.id}" type="checkbox" class="movement-select" />`;
        }

        return `<div class="movement-panel">
                    <div class="movement-panel-header">
                        <div class="movement-panel-title">
                            ${inicial}
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
        
        let parsedMovement = Movement.#parsing(movement);
        movement.parsedMovement = parsedMovement;

        if (format === "card") {
            return Movement.renderCard(movement);
            // return Movement.renderFormattedCard(movement);
            
        }
        return Movement.renderPanel(movement, selectable);
    }

    static selectableMovementsByClass(movement, format = "card") {
        return Movement.render(movement, format, true);
    }


    static renderFormattedCard(movement) {
        console.log(movement);

        let criteirios = movement.parsedMovement.criteriosRolagem.map(criterio => `<span>${criterio.criterio}</span>`).join('');
  
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
                                <img class="movement-card-roll-detail-icon" src="../assets/icons/dados.png" alt="roll" />
                                <span>${movement.rolagem}</span>
                                </div>` : ''}
                        </div>
                    </div>

                    <section class="movement-card-description">
                        <p>${movement.parsedMovement.descricaoInicial}</p>
                        ${movement.parsedMovement.criteriosRolagem.map(criterio => `<span class="badge">${criterio.criterio}</span><p>${criterio.efeito}</p>`)}
                        <p>${movement.parsedMovement.textoFinal}</p>
                    </section>

                    <section >
                                
                    </section>

                    <div class="movement-card-footer">
                        <strong>MOVIMENTO</strong>
                        <strong>${movement.tipo.toUpperCase()}</strong>
                    </div>
                </div>`;
    }

}

export class ClassAndRace{
    static getClasses() {
        return dungeonworld.classes;
    }

    static getClassList(){
        return dungeonworld.classes.map(clas => (clas.nome));
    }
    static getRacesList(){
        let races = [];
        dungeonworld.classes.forEach(clas => {
            if (clas.racas) {
                races = [...new Set(races.concat(clas.racas))];
            }
        });
        return races;
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

    static getSpellList() {
        return dungeonworld.spells;
    }

    static getSpellListByClassAndLevel(classe, nivel=null) {
        const spells = dungeonworld.lista_spells.filter(spell => {
            for (const c of spell.classe) {
                if (c === classe) {
                    if (nivel === null || spell.nivel === nivel) {
                        return true;
                    }
                }
            }
            return false;
        });
        return spells;
    }

    static render(spell, format) {
        if (format === "card") {
            return Spell.renderSpellCard(spell);
        }
        return Spell.renderSpell(spell, format);
    }

    static renderSpellList(spells, format) {
        spellListContainer.innerHTML = '';
        spells.forEach(spell => {
            const spellElement = document.createElement('div');
            spellElement.classList.add(`spell ${format}`);
            spellElement.innerHTML = Spell.render(spell, format);
            spellListContainer.appendChild(spellElement);
        });

    }

    static renderSpellCard(spell) {
        return `<div class="spell-card">
                    <div class="spell-card-header">
                        <div class="spell-card-title">
                            <img class="movement-card-icon" src="../assets/icons/spell.png" alt="spell" />
                            <h2>${spell.nome}</h2>
                        </div>
                        <div class="spell-card-school">
                            <span>${spell.nivel > 0 ? 'Nível ' + spell.nivel +',': ''} ${spell.school} ${spell.continuo ? ', Contínuo' : ''}</span>
                        </div>
                    </div>

                    <section class="spell-card-description">
                        <p>${spell.descricao}</p>
                    </section>

                    <section class="spell-card-result">
                    </section>

                    <div class="spell-card-footer">
                        <strong>FEITIÇO</strong>
                        <strong>${spell.classe}</strong>
                    </div>
                </div>`;
    }

    static renderSpell(spell, format) {
        return `<div id="spell-${spell.id}" class="spell">
            <input type="checkbox" title="No grimório" class="gold_filling" />
            <input type="checkbox" title="Preparada" class="blue_filling"/>
            <input class="spell-name" value="${spell.nome}" />
        </div>`;
    }

    static renderSpellGroupbyLevel(lista_spells, nivel, format="card") {
        

        const groupedSpells = [];
        for (const spell of lista_spells) {
            if (!groupedSpells[spell.nivel]) {
                groupedSpells[spell.nivel] = [];
            }
            groupedSpells[spell.nivel].push(spell);
        }

        const spellGroupContainer = document.createElement('div');

        for (const [nivel, spells] of Object.entries(groupedSpells)) {

            //Crei o Spell-Group para conter as magias de Cada Nivel
            const containerA = document.createElement('div');
            containerA.classList.add('spell-card-group');
            containerA.id = `spell-group-${nivel}`;
            
            //Cabeçalhos das Magias
            const header = document.createElement('h3');
            header.textContent = nivel > 0 ? `Nível ${nivel}` : 'Truques';
            header.id = `spell-group-header-${nivel}`;
            containerA.appendChild(header);
            
            //Container para dos Cards de Magias
            const spellCardContainer = document.createElement('div');
            spellCardContainer.classList.add('spell-card-container');
            spellCardContainer.id = `spell-card-container-${nivel}`;
            
            spells.forEach(spell => {
                spellCardContainer.innerHTML += Spell.render(spell, format);
            });

            containerA.appendChild(spellCardContainer);

            spellGroupContainer.appendChild(containerA);
        }
        return spellGroupContainer.innerHTML;
    }

}

export default { Bond, ClassAndRace, Consumable, Equipment, Movement, Spell };
