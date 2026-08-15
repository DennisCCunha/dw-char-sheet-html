import dungeonworld from "../data/dungeonworld.json" with { type: "json" };
import Utils from "./utils.js";

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

    static getEquipmentList() {
        return dungeonworld.lista_itens;
    }

    static getTagsList() {
        return dungeonworld.lista_tags;
    }

    static create(id = 0, nome = "", descricao = "", usos = 0, peso = 0, moedas = 0, tags = [], notes = "") {
        return {
            nome: nome,
            descricao: descricao,
            peso: peso,
            moedas: moedas,
            tags: tags
        };
    }

    static render(equipment = {nome: "", descricao: "", peso: 0, moedas: 0, tags: [], notes: ""}) {
        let eqp = `<div class='list-item equipment-item'>
            <input class='spell-name' type='text' placeholder='Nome do equipamento' style='flex:2' />
            <input class='spell-name' type='number' placeholder='Peso' min='0' style='width:60px' />
            <input class='spell-name' type='text' placeholder='Descrição' style='flex:3' />
            <div class="multiselect">
                <div id="selected-tags" class="tags"></div>
                <input id="search" type="text" placeholder="Search..."/>
                <div id="results" class="results"></div>
            </div>
                <input class='spell-name' type='text' placeholder='Notas' style='flex:3' />
            </div>`;
        return eqp;
    }

    static renderTag(tag) {
        if (!tag) return '';
        let tagElement = document.createElement('div');
        tagElement.classList.add('tag');


        let titulo = document.createElement('span');
        titulo.classList.add('tag-title');
        titulo.textContent = tag.nome;
        tagElement.appendChild(titulo);

        let descricao = document.createElement('span');
        descricao.classList.add('tag-description');
        descricao.textContent = tag.descricao;
        tagElement.appendChild(descricao);
            
        return tagElement;
    }

    static renderEquipmentOptions(equipSelectCombo) {
        
        Equipment.getEquipmentList().forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.nome;
            equipSelectCombo.appendChild(option);
        });

        return equipSelectCombo;
    }


    static getEquipmentById(id) {
        return Equipment.getEquipmentList().find(item => item.id === id);
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

    static renderCard(movement) {   
        let icon = "basico";
        let cardColor = Utils.canonical(movement.classe);
        let footerText = (movement.classe === "basico") ? `MOVIMENTO ${movement.tipo.toUpperCase()}` : `Movimento ${movement.tipo.toUpperCase()} do ${movement.classe.toUpperCase()}`;

        if (movement.tipo.includes("Especial")) {
            icon = "especial";
        }
        else if (movement.tipo.includes("Avançado 6-10")) {
            icon = "avançado2";
        }
        else if (movement.tipo.includes("Racial") || movement.tipo.includes("Inicial")) {
            icon = "avançado";
        }
        else if (movement.tipo.includes("Avançado 2-5")) {
            icon = "avançado";
        }

        // Create the card element
        let card = document.createElement('div');
        card.classList.add('movement-card', cardColor);

        card.id = `movement-card-${movement.id}`;
        card.dataset.search = movement.nome + " " + movement.descricao + " " + movement.tipo;

        // Create the card header
        let cardHeader = document.createElement('div');
        cardHeader.classList.add('movement-card-header');
        card.appendChild(cardHeader);

        // header elements
        let cardTitle = document.createElement('div');
        cardTitle.classList.add('movement-card-title');

        let cardIcon = document.createElement('img');
        cardIcon.classList.add('movement-card-icon');
        cardIcon.src = `../assets/icons/${icon}.png`;
        cardIcon.alt = icon;
        cardTitle.appendChild(cardIcon);
    
        let cardName = document.createElement('h3');
        cardName.textContent = movement.nome;
        cardTitle.appendChild(cardName);

        cardHeader.appendChild(cardTitle);

        let cardRoll = document.createElement('div');
        cardRoll.classList.add('movement-card-roll');
        if (movement.hasOwnProperty("rolagem")) {
            console.log("roll" + movement.nome);
            let cardRollDetail = document.createElement('div');
            cardRollDetail.classList.add('movement-card-roll-detail');
            let cardRollIcon = document.createElement('img');
            cardRollIcon.classList.add('movement-card-roll-detail-icon');
            cardRollIcon.src = `../assets/icons/dados.png`;
            cardRollIcon.alt = "roll";
            cardRollDetail.appendChild(cardRollIcon);
            let cardRollText = document.createElement('span');
            cardRollText.textContent = movement.rolagem;
            cardRollDetail.appendChild(cardRollText);

            cardRoll.appendChild(cardRollDetail);
        }
        cardHeader.appendChild(cardRoll);
        // -- END HEADER

        // Create the card description
        let cardDescription = document.createElement('section');
        cardDescription.classList.add('movement-card-description');
    
        if (movement.hasOwnProperty("requer") || movement.hasOwnProperty("substitui") || movement.hasOwnProperty("multiclasse") || movement.hasOwnProperty("exclusivo")) {
            let cardDescriptionRequirements = document.createElement('div');
            cardDescriptionRequirements.classList.add('movement-card-requirements');
            cardDescriptionRequirements.innerHTML = `
                ${movement.requer ? `<span class="badge-requirement"><em>Requer:</em> ${movement.requer}</span>` : ''}
                ${movement.substitui ? `<span class="badge-requirement"><em>Substitui:</em> ${movement.substitui}</span>` : ''}
                ${movement.multiclasse ? `<span class="badge-requirement"><em>Multiclasse:</em> ${movement.multiclasse}</span>` : ''}
                ${movement.exclusivo ? `<span class="badge-requirement"><em>Exclusivo:</em> ${movement.exclusivo}</span>` : ''}
            `;
            cardDescription.appendChild(cardDescriptionRequirements);
        }

        let cardDescriptionText = document.createElement('p');
        cardDescriptionText.innerHTML = movement.descricao;
        cardDescription.appendChild(cardDescriptionText);
        
        card.appendChild(cardDescription);

        // Create the card result section
        let cardResult = document.createElement('section');
        cardResult.classList.add('movement-card-result');
        
        card.appendChild(cardResult);

        // Create the card footer
        let cardFooter = document.createElement('div');
        cardFooter.classList.add('movement-card-footer');

        let cardFooterClass = document.createElement('strong');
        cardFooterClass.textContent = footerText;
        cardFooter.appendChild(cardFooterClass);

        card.appendChild(cardFooter);

        return card;
    }

    static renderPanel(movement, selectable = false) {

        // Create the checkbox input for selectable movements
        let inicial =  document.createElement('input');
        inicial.id = `selectable-movement-${movement.id}`;
        inicial.type = "checkbox";
        inicial.classList.add("movement-select");


        if (movement.tipo === "Inicial" || movement.tipo === "Basico" || movement.tipo === "Especial") {
            inicial.checked = true;
            inicial.disabled = true;
        }

        if (movement.exclusivo && selectable) {
            inicial.checked = false;
            inicial.disabled = true;
        }

        const movementPanel = document.createElement('div');
        movementPanel.classList.add('movement-panel');

        const movementPanelHeader = document.createElement('div');
        movementPanelHeader.classList.add('movement-panel-header');
        movementPanel.appendChild(movementPanelHeader);

        const movementPanelTitle = document.createElement('div');
        movementPanelTitle.classList.add('movement-panel-title');

        movementPanelHeader.appendChild(movementPanelTitle);
        movementPanelTitle.appendChild(inicial);

        const movementName = document.createElement('h3');
        movementName.textContent = movement.nome;
        movementPanelTitle.appendChild(movementName);

        const movementPanelInfo = document.createElement('div');
        movementPanelInfo.classList.add('movement-panel-info');
        movementPanelHeader.appendChild(movementPanelInfo);

        if (movement.tipo) {
            const movementType = document.createElement('span');
            movementType.classList.add('movement-panel-type');
            movementType.textContent = `Tipo: ${movement.tipo}`;
            movementPanelInfo.appendChild(movementType);
        }

        const movementPanelDetails = document.createElement('div');
        movementPanelDetails.classList.add('movement-panel-details');
        movementPanel.appendChild(movementPanelDetails);

        if (movement.rolagem) {
            const movementRoll = document.createElement('span');
            movementRoll.classList.add('movement-panel-roll');
            movementRoll.innerHTML = `Rolagem: <strong>${movement.rolagem}</strong>`;
            movementPanelDetails.appendChild(movementRoll);
        }

        const movementPanelDescription = document.createElement('div');
        movementPanelDescription.classList.add('movement-panel-description');
        movementPanel.appendChild(movementPanelDescription);

        const movementDescription = document.createElement('p');
        movementDescription.innerHTML = movement.descricao;
        movementPanelDescription.appendChild(movementDescription);

        return movementPanel;

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

    static movementRooster (character) {
        let roostersizer = character.movimentos.length;
        if(character.classe.value){
            getMovementListByClass(character.classe.value).forEach(movement => {
                if(!character.movimentos.some(m => m.id === movement.id)){
                     if(movement.tipo.includes("Inicial")){
                        if(!movement.exclusivo){
                            character.movimentos.push(movement);
                        }
                    }
                }
            });
        }
    }

    // WIP - Seleciona um movimento de outra classe,
    // TargetClass: classe de onde o movimento será selecionado Se vazio listará todos os movimentos de todas as classes.
    static selectFromOtherClass(targetClass = "", character) {

    }

    // WIP - Seleciona um movimento exclusivo, removendo outros movimentos exclusivos do personagem
    static selectExclusiveMovement(movement, character) {
        if (movement.exclusivo) {
            character.movimentos = character.movimentos.filter(m => m.id !== movement.id);
            character.movimentos.push(movement);
        }
    }
    
    static selectReplacementMovement(movement, character) {
    }

    // WIP - Seleciona um feitiço de outra classe,
    static selectSpellFromOtherClass(targetClass = "", character) {

    }

    static conditionalMovementList(classe, race){
        let movementList = this.getMovementListByClass(classe);

        // Bárbaro keeps all racial moves; every other class shows only the move matching the selected race.
        if (Utils.canonical(classe) !== 'barbaro' && classe) {
            movementList = movementList.filter(
                (m) => m.tipo !== 'Racial' || m.nome === race
            );
        }

        return movementList;
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

    static renderclassOptions() {
        const classSelect = document.getElementById(containerId);
        ClassAndRace.getClasses().forEach(clas => {
            const option = document.createElement('option');
            option.id = `class-option-${clas.nome}`;
            option.value = clas.nome;
            option.textContent = clas.nome;
            classSelect.appendChild(option);
        });
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

    static renderSpellCard(spell, cardColorOverride = null) {
        let classe = spell.classe[0].toLowerCase();

        if (cardColorOverride) {
            document.documentElement.style.setProperty('--cardColor', cardColorOverride);
        }

        let spellCard = document.createElement('div');
        spellCard.classList.add('spell-card', `${classe}-spell-card`);

        if (cardColorOverride) {
            spellCard.style.setProperty('--cardColor', cardColorOverride);
        }

        spellCard.id = `spell-card-${spell.id}`;
        spellCard.dataset.search = spell.nome + " " + spell.descricao + " " + spell.school;

        let spellHeader = document.createElement('div');
        spellHeader.classList.add('spell-card-header');

        let spellTitle = document.createElement('div');
        spellTitle.classList.add('spell-card-title');
        
        let spellIcon = document.createElement('img');
        spellIcon.classList.add('spell-card-icon');
        spellIcon.src = `../assets/icons/spell.png`;
        spellIcon.alt = classe;
        spellTitle.appendChild(spellIcon);

        spellTitle.appendChild(document.createElement('h3')).textContent = spell.nome;

        spellHeader.appendChild(spellTitle);

        let spellSchool = document.createElement('div');
        spellSchool.classList.add('spell-card-school');
        spellSchool.appendChild(document.createElement('span')).textContent = `${spell.nivel > 0 ? 'Nível ' + spell.nivel +',': ''} ${spell.school ? spell.school : ''} ${spell.continuo ? 'Contínuo' : ''}`;
        spellHeader.appendChild(spellSchool);

        spellCard.appendChild(spellHeader);

        let spellDescription = document.createElement('section');
        spellDescription.classList.add('spell-card-description');
        spellDescription.appendChild(document.createElement('p')).innerHTML = spell.descricao;
        spellCard.appendChild(spellDescription);

        let spellResult = document.createElement('section');
        spellResult.classList.add('spell-card-result');
        // Alguma coisa deveria entrar aqui, mas não está claro o que. Talvez seja necessário adicionar conteúdo dinâmico baseado em rolagens ou efeitos do feitiço.
        spellCard.appendChild(spellResult);

        let spellFooter = document.createElement('div');
        spellFooter.classList.add('spell-card-footer');
        spellFooter.appendChild(document.createElement('strong')).textContent = "FEITIÇO ";
        spellFooter.appendChild(document.createElement('strong')).textContent = spell.classe;
        spellCard.appendChild(spellFooter);

        return spellCard;
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
                spellCardContainer.appendChild(Spell.render(spell, format));
            });

            containerA.appendChild(spellCardContainer);

            spellGroupContainer.appendChild(containerA);
        }
        return spellGroupContainer;
    }

}

export default { Bond, ClassAndRace, Consumable, Equipment, Movement, Spell };
