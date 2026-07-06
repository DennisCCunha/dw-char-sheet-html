import dungeonworld from "../data/dungeonworld.json" with { type: "json" };


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

    static create(id = 0, nome ="", descricao="", tags = []) {
        return {
            id: id,
            nome: nome,
            descricao: descricao,
            tags: tags
        };
    }
    static render(movement) {
        return `<div class="card" id="movement-${movement.id}">
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
                            ${movement.descricao}
                        </blockquote>
                    </section>

                    <section class="card-results">

                        <div class="result">
                            <span class="roll">10+</span>

                            <div class="text">
                                ${movement.descricao}
                            </div>
                        </div>

                        <div class="result">
                            <span class="roll">7-9</span>

                            <div class="text">
                                ${movement.descricao}
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
        return `<div class="spell"> <input type="checkbox" title="Preparada" class="gold_filling"/> <input class="spell-name" value="${spell.nome}"/> <label>${spell.nivel}</label></div>`;
    }
}

export default { Bond, Consumable, Equipment, Movement, Spell };
