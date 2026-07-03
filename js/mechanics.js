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

    }
}
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
export class Spell {
    static create(id = 0, classe = [], nome ="", nivel = 0, school = "", continuo = false, descricao="", tags = []) {
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