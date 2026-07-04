export class Bond {
    static create(nome ="", descricao="", finalizado = false) {
        return {
            nome: nome,
            descricao: descricao,
            finalizado: finalizado
        };
    }
    static end(bond) {
        bond.finalizado = true;
    }
    static render(bond) {
        return `<div class="bond"> <input type="checkbox" title="Finalizado" class="gold_filling"/> <label class="bond-name" value="${bond.nome}"/> </div>`;
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
    static render(movement) {
        return `<div class="card">
                    <header class="card-header">
                        <div class="icon">
                            <img src="icone.png" alt="Ícone">
                        </div>

                        <h2>${movement.nome}</h2>

                        <div class="attribute">
                            🎲 +FOR
                        </div>
                    </header>

                    <section class="card-description">
                        <blockquote>
                            Quando atacar um adversário em combate corpo a corpo...
                        </blockquote>
                    </section>

                    <section class="card-results">

                        <div class="result">
                            <span class="roll">10+</span>

                            <div class="text">
                                Cause dano ao adversário e evite seu ataque.
                                Opcionalmente, você pode causar +1d6 de dano,
                                expondo-se a contra ataque.
                            </div>
                        </div>

                        <div class="result">
                            <span class="roll">7-9</span>

                            <div class="text">
                                Cause dano ao adversário, e ele fará um ataque contra você.
                            </div>
                        </div>

                    </section>

                    <footer class="card-footer">
                        <small>MOVIMENTO</small>
                        <strong>BÁSICO</strong>
                    </footer>
                </div>`;
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
        return `<div class="spell"> 
        <input type="checkbox" title="Preparada" class="gold_filling"/> 
        <input class="spell-name" value="${spell.nome}"/><label>${spell.continuo? "Contínuo" : ""}</label><label>${spell.school}</label><label>${spell.nivel}</label>
        </div>`;
    }
}

export default { Bond, Consumable, Equipment, Movement, Spell };