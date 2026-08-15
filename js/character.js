export default class Character {

    static get XP_MAX() { return 18; }

    constructor() {
        this.nome        = '';
        this.raca        = '';
        this.classe      = '';
        this.nivel       = 1;
        this.pv_max      = 0;
        this.pv_atual    = 0;
        this.carga       = 0;
        this.armadura    = 0;
        this.dado_dano   = '';
        this.alinhamento = '';
        this.notas       = '';

        // xp: array of booleans, one per circle
        this.xp = Array(Character.XP_MAX).fill(false);

        this.atributos = {
            forca: 0, destreza: 0, constituicao: 0,
            inteligencia: 0, sabedoria: 0, carisma: 0,
        };

        // Se os atributos forem desvinculados o modificador é considerado desse objeto;
        this.modificadores = {
            forca: {vinculado:true, valor:0}, destreza: {vinculado:true, valor:0}, constituicao: {vinculado:true, valor:0},
            inteligencia: {vinculado:true, valor:0}, sabedoria: {vinculado:true, valor:0}, carisma: {vinculado:true, valor:0},
        };

        this.debilidade = {
            forca: false, destreza: false, constituicao: false,
            inteligencia: false, sabedoria: false, carisma: false,
        };

        this.movimentos    = [];
        this.equipamentos  = [];
        this.consumiveis   = [];
        this.spells        = [];
        this.bonds         = [];
        this.finishedBonds = [];
    }

    // ─── Serialisation ────────────────────────────────────────────────────────
    // Keys in fromState/toState intentionally match the DOM element IDs so that
    // Character is the single bridge between the UI and persistent storage.

    static fromState(state) {
        const c = new Character();
        c.nome        = state.charName      ?? '';
        c.raca        = state.charRace      ?? '';
        c.classe      = state.charClass     ?? '';
        c.nivel       = parseInt(state.charLevel, 10)  || 1;
        c.pv_max      = parseInt(state.charPV,    10)  || 0;
        c.pv_atual    = parseInt(state.curPV,     10)  || 0;
        c.carga       = parseInt(state.charLoad,  10)  || 0;
        c.armadura    = parseInt(state.charDef,   10)  || 0;
        c.dado_dano   = state.charDmg       ?? '';
        c.alinhamento = state.charAlignment ?? '';
        c.notas       = state.charNotes     ?? '';

        c.atributos = {
            forca:        parseInt(state.valFor, 10) || 0,
            destreza:     parseInt(state.valDes, 10) || 0,
            constituicao: parseInt(state.valCon, 10) || 0,
            inteligencia: parseInt(state.valInt, 10) || 0,
            sabedoria:    parseInt(state.valSab, 10) || 0,
            carisma:      parseInt(state.valCar, 10) || 0,
        };
        c.debilidade = {
            forca:        state.debFor === '1',
            destreza:     state.debDes === '1',
            constituicao: state.debCon === '1',
            inteligencia: state.debInt === '1',
            sabedoria:    state.debSab === '1',
            carisma:      state.debCar === '1',
        };

        c.xp    = Array.from({ length: Character.XP_MAX }, (_, i) => state[`xp_${i}`] === '1');
        c.bonds = state.charBonds ? JSON.parse(state.charBonds) : [];
        return c;
    }

    static toState(c) {
        const state = {
            charName:      c.nome,
            charRace:      c.raca,
            charClass:     c.classe,
            charLevel:     c.nivel,
            charPV:        c.pv_max,
            curPV:         c.pv_atual,
            charLoad:      c.carga,
            charDef:       c.armadura,
            charDmg:       c.dado_dano,
            charAlignment: c.alinhamento,
            charNotes:     c.notas,
            valFor: c.atributos.forca,
            valDes: c.atributos.destreza,
            valCon: c.atributos.constituicao,
            valInt: c.atributos.inteligencia,
            valSab: c.atributos.sabedoria,
            valCar: c.atributos.carisma,
            debFor: c.debilidade.forca        ? '1' : '0',
            debDes: c.debilidade.destreza      ? '1' : '0',
            debCon: c.debilidade.constituicao  ? '1' : '0',
            debInt: c.debilidade.inteligencia  ? '1' : '0',
            debSab: c.debilidade.sabedoria     ? '1' : '0',
            debCar: c.debilidade.carisma       ? '1' : '0',
            charBonds: JSON.stringify(c.bonds),
        };
        c.xp.forEach((active, i) => { state[`xp_${i}`] = active ? '1' : '0'; });
        return state;
    }

    static fromJSON(json) {
        const c = new Character();
        Object.assign(c, json);
        return c;
    }

    static toJSON(char) {
        return JSON.stringify(char);
    }
    // ─── Ability modifier ────────────────────────────────────────────────────

    /** Returns the DW modifier for a given attribute value, applying -1 if debilitated. */
    abilityModifier(atributo, debilitado = false) { 
        const m = this.calculateModificador(atributo);
        return debilitado ? m - 1 : m;
    }

    vincularModificador(atributo) {
        this.modificadores[atributo].vinculado = !this.modificadores[atributo].vinculado;
    }

    calculateModificador(value) {
        const v = parseInt(value, 10);
        if (isNaN(v)) return "X";
        let m;
        if      (v <= 3)  m = -3;
        else if (v <= 5)  m = -2;
        else if (v <= 8)  m = -1;
        else if (v <= 12) m =  0;
        else if (v <= 15) m =  1;
        else if (v <  18) m =  2;
        else              m =  3;
        return m;
    }

    // ─── Bonds ───────────────────────────────────────────────────────────────

    addBond(bond)    { this.bonds.push(bond); }
    removeBond(bond) { this.bonds.splice(this.bonds.indexOf(bond), 1); }
    endBond(bond)    { this.removeBond(bond); this.finishedBonds.push({ ...bond, finalizado: true }); }

    // ─── Inventory ───────────────────────────────────────────────────────────

    addMovement(movement)    { this.movimentos.push(movement); }
    removeMovement(movement) { this.movimentos.splice(this.movimentos.indexOf(movement), 1); }
    clearMovement() { this.movimentos = []; }

    addEquipment(equipment)    { this.equipamentos.push(equipment); }
    removeEquipment(equipment) { this.equipamentos.splice(this.equipamentos.indexOf(equipment), 1); }
    clearEquipment() { this.equipamentos = []; }

    addConsumable(consumable)    { this.consumiveis.push(consumable); }
    removeConsumable(consumable) { this.consumiveis.splice(this.consumiveis.indexOf(consumable), 1); }

    addSpell(spell) { this.spells.push(spell); }



}
