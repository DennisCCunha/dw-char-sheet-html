export default class Character {
    constructor() {
        this.nome = "";
        this.raca = {value: "", index: 0};
        this.classe = {value: "", index: 0};

        this.xp = {
            xp_0 : 0,
            xp_1 : 0,
            xp_2 : 0,
            xp_3 : 0,
            xp_4 : 0,
            xp_5 : 0,
            xp_6 : 0,
            xp_7 : 0,
            xp_8 : 0,
            xp_9 : 0,
            xp_10 : 0,
            xp_11 : 0,
            xp_12 : 0,
            xp_13 : 0,
            xp_14 : 0,
            xp_15 : 0,
            xp_16 : 0,
            xp_17 : 0,
        };

        this.nivel = 1;
        this.pv_max = 0;
        this.pv_current = 0;
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
        this.bonds = [];// Preferencialmente um Array de Bonds
        this.finishedBonds = []; // Preferencialmente um Array de Bonds
        this.notas = [{id:"", conteudo: ""}]; 
    }

    static fromState(state) {
        const char = new Character();
        char.nome = state.charName;
        char.raca = state.charRace.value;
        char.classe = state.charClass.value;

        char.xp = {
            xp_0 : state.xp_0,
            xp_1 : state.xp_1,
            xp_2 : state.xp_2,
            xp_3 : state.xp_3,
            xp_4 : state.xp_4,
            xp_5 : state.xp_5,
            xp_6 : state.xp_6,
            xp_7 : state.xp_7,
            xp_8 : state.xp_8,
            xp_9 : state.xp_9,
            xp_10 : state.xp_10,
            xp_11 : state.xp_11,
            xp_12 : state.xp_12,
            xp_13 : state.xp_13,
            xp_14 : state.xp_14,
            xp_15 : state.xp_15,
            xp_16 : state.xp_16,
            xp_17 : state.xp_17,
        };
        char.nivel = parseInt(state.charLevel, 10);
        char.pv_max = parseInt(state.charPV, 10);
        char.pv_current = parseInt(state.curPV, 10);
        char.carga = parseInt(state.charLoad, 10);
        char.armadura = parseInt(state.charDef, 10);

        char.atributos = {
            forca: parseInt(state.valStr, 10),
            destreza: parseInt(state.valDes, 10),
            constituicao: parseInt(state.valCon, 10),
            inteligencia: parseInt(state.valInt, 10),
            sabedoria: parseInt(state.valSab, 10),
            carisma: parseInt(state.valCar, 10)
        };

        char.debilidade = {
            forca: state.debFor === 'on' ? true : false,
            destreza: state.debDes === 'on' ? true : false,
            constituicao: state.debCon === 'on' ? true : false,
            inteligencia: state.debInt === 'on' ? true : false,
            sabedoria: state.debSab === 'on' ? true : false,
            carisma: state.debCar === 'on' ? true : false
        };

        char.movimentos = [];
        char.equipamentos = [];
        char.consumiveis = [];

        char.spells = [];
        char.bonds = state.charBonds ? JSON.parse(state.charBonds) : [];
        char.finishedBonds = [];
        char.notas = state.charNotes ? JSON.parse(state.charNotes) : [];
        return char;
    }

    static toState(char) {
        const state = {};
        state.charName = char.nome;
        state.charRace = char.raca;
        state.charClass = char.classe;

        state.xp_0 = char.xp.xp_0;
        state.xp_1 = char.xp.xp_1;
        state.xp_2 = char.xp.xp_2;
        state.xp_3 = char.xp.xp_3;
        state.xp_4 = char.xp.xp_4;
        state.xp_5 = char.xp.xp_5;
        state.xp_6 = char.xp.xp_6;
        state.xp_7 = char.xp.xp_7;
        state.xp_8 = char.xp.xp_8;
        state.xp_9 = char.xp.xp_9;
        state.xp_10 = char.xp.xp_10;
        state.xp_11 = char.xp.xp_11;
        state.xp_12 = char.xp.xp_12;
        state.xp_13 = char.xp.xp_13;
        state.xp_14 = char.xp.xp_14;
        state.xp_15 = char.xp.xp_15;
        state.xp_16 = char.xp.xp_16;
        state.xp_17 = char.xp.xp_17;
        state.charLevel = char.nivel;
        state.charPV = char.pv_max;
        state.curPV = char.pv_current;
        state.charLoad = char.carga;
        state.charDef = char.armadura;

        state.valStr = char.atributos.forca;
        state.valDes = char.atributos.destreza;
        state.valCon = char.atributos.constituicao;
        state.valInt = char.atributos.inteligencia;
        state.valSab = char.atributos.sabedoria;
        state.valCar = char.atributos.carisma;

  
        char.debilidade.forca ? state.debFor = 'on' : state.debFor = 'off';
        char.debilidade.destreza ? state.debDes = 'on' : state.debDes = 'off';
        char.debilidade.constituicao ? state.debCon = 'on' : state.debCon = 'off';
        char.debilidade.inteligencia ? state.debInt = 'on' : state.debInt = 'off';
        char.debilidade.sabedoria ? state.debSab = 'on' : state.debSab = 'off';
        char.debilidade.carisma ? state.debCar = 'on' : state.debCar = 'off';



        state.movimentos = [];
        state.equipamentos = [];
        state.consumiveis = [];

        state.spells = [];
        state.charBonds = state.charBonds ? JSON.parse(state.charBonds) : [];
        state.finishedBonds = [];
        state.charNotes = state.charNotes ? JSON.parse(state.charNotes) : [];
        return state;
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