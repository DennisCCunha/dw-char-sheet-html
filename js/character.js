export default class Character {
    constructor() {
        this.nome = "";
        this.raca = "";
        this.classe = "";

        this.xp = 0;
        this.nivel = 1;
        this.pv_max = 0;
        this.carga = 0;
        this.armadura = 0;

        this.atributos = {
            forca: 0,
            destreza: 0,
            constituicao: 0,
            inteligencia: 0,
            sabedoria: 0,
            carisma: 0
        };

        this.debilidade = {
            forca: false,
            destreza: false,
            constituicao: false,
            inteligencia: false,
            sabedoria: false,
            carisma: false
        };

        this.movimentos = [];
        this.equipamentos = [];
        this.consumiveis = [];

        this.spells = [];
        this.bonds = [];
        this.finishedBonds = [];
        this.notas = "";
    }

    abilityModifier(atributo, debility=0) {
        const v = parseInt(atributo, 10);
        if (isNaN(v)) {
            return 0;
        }
        let m = 0;
            if (v > 0 && v <= 3) m = -3;
            else if (v > 3 && v <= 5) m = -2;
            else if (v > 5 && v <= 8) m = -1;
            else if (v > 8 && v <= 12) m = 0;
            else if (v > 12 && v <= 15) m = 1;
            else if (v > 15 && v < 18) m = 2;
            else if (v >= 18) m = 3;
        return m + debility;
    }

    updateModifiers() {
        for (const atributo in this.atributos) {
            
            this.atributos[atributo + "_mod"] = this.abilityModifier(this.atributos[atributo], debility);
        }
    }

    addMovement(movement) {
        this.movements.push(movement);
    }

    removeMovement(movement) {
        const index = this.movements.indexOf(movement);
        if (index > -1) {
            this.movements.splice(index, 1);
        }
    }

    addEquipment(equipment) {
        this.equipment.push(equipment);
    }

    removeEquipment(equipment) {
        const index = this.equipment.indexOf(equipment);
        if (index > -1) {
            this.equipment.splice(index, 1);
        }
    }

    addConsumable(consumable) {
        this.consumables.push(consumable);
    }

    consumeConsumable(consumable) {
        const index = this.consumables.indexOf(consumable);
        Consumable.consume(this.consumables[index]);
    }

    removeConsumable(consumable) {
        const index = this.consumables.indexOf(consumable);
        if (index > -1) {
            this.consumables.splice(index, 1);
        }
    }

    addSpell(spell) {
        this.spells.push(spell);
    }

    addBond(bond) {
        this.bonds.push(bond);
    }

    removeBond(bond) {
        const index = this.bonds.indexOf(bond);
        if (index > -1) {
            this.bonds.splice(index, 1);
        }
    }

    endBond(bond) {
        const index = this.bonds.indexOf(bond);
        if (index > -1) {
            this.bonds.splice(index, 1);
            this.finishedBonds.push(bond);
        }
    }

    removeItemAll(arr, value) {
        var i = 0;
        while (i < arr.length) {
        if (arr[i] === value) {
            arr.splice(i, 1);
            } else {
            ++i;
            }
        }
        return arr;
    }
}