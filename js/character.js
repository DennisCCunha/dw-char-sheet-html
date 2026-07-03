export class Character {
    constructor() {
        this.name = "";
        this.race = "";
        this.class = "";

        this.xp = 0;
        this.level = 1;
        this.max_hp = 0;
        this.load = 0;
        this.armor = 0;

        this.stats = {
            str: 0,
            dex: 0,
            con: 0,
            int: 0,
            wis: 0,
            cha: 0
        };

        this.movements = [];
        this.equipment = [];
        this.consumables = [];
        this.spells = [];
        this.bonds = [];
        this.finishedBonds = [];
        this.notes = "";
    }

    applyDebility(debility) {
        this.abilityModifier(debility, this.stats[debility]);       
    }

    abilityModifier(stat, val=0) {
        const v = parseInt(stat, 10);
        let m = 3;
        if (!Number.isFinite(v)) return '';
        if (v < 16) m = 1; 
        if (v < 8) m = 0;  
        if (v < 18) m = 2; 
        if (v < 12) m = -1;
        if (v < 6) m = -2;
        if (v < 4) m = -3;
        
        return v + m;
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