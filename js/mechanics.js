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
        let eqp = "<div class='list-item equipment-item'>" +
        "<input class='spell-name' type='text' placeholder='Nome do equipamento' style='flex:2' />" +
        "<input class='spell-name' type='number' placeholder='Peso' min='0' style='width:60px' />" +
        "<input class='spell-name' type='text' placeholder='Descrição' style='flex:3' />" +
        "<input class='spell-name' type='text' placeholder='Notas' style='flex:3' />" +
        "<select multiple></select>"

        for (let i = 0; i < 5; i++) {
            eqp += "<option value='" + i + "'>Tag " + (i + 1) + "</option>";
        }

        eqp += "<button onclick=\"this.closest('.list-item').remove()\" class='removeIcon'>&#215</button>" +
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

    static renderCard(movement) {
        let icon = "basico";
        if (movement.tipo.includes("Especial")) {
            icon = "especial";
        }
        else if (movement.tipo.includes("Avançado")) {
            icon = "avançado";
        }


        return `<div class="movement-card">
                    <header class="movement-card-header">
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
                    </header>

                    <section class="movement-card-description">
                        <blockquote>
                            <p>${movement.descricao}</p>
                        </blockquote>
                    </section>

                    <section class="movement-card-results">
                    </section>

                    <footer class="movement-card-footer">
                        <small>MOVIMENTO</small>
                        <strong>${icon.toUpperCase()}</strong>
                    </footer>
                </div>`;
    }
    static renderPanel(movement) {
        return `<div class="movement-panel">
                    <h3>${movement.nome}</h3>
                    <div>
                        ${movement.tipo ? `<span class="movement-type">Tipo: ${movement.tipo}</span>` : ''}
                        ${movement.rolagem ? `<span class="movement-roll">Rolagem: ${movement.rolagem}</span>` : ''}
                    </div>
                    <div class="movement-panel-description">
                        <p class="">${movement.descricao}</p>
                    </div>
                </div>`;
    }

    static render(movement, format) {
        if (format === "card") {
            return Movement.renderCard(movement);
        }
        return Movement.renderPanel(movement);
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
}

export default { Bond, Consumable, Equipment, Movement, Spell };
