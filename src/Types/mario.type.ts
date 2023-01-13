/*
* Interface used to define the type of the Mario object
*
* @interface Mario
* @property {number} maxHP - The maximum HP of Mario
* @property {number} hp - The current HP of Mario
* @property {number} maxFP - The maximum FP of Mario
* @property {number} fp - The current FP of Mario
* @property {string} boots - The boots Mario is currently wearing
* @property {string} hammer - The hammer Mario is currently using
* @property {boolean} buffed - Whether Mario is currently buffed
* @property {array} items - The items Mario currently has
* @property {array} badges - The badges Mario currently has
* @property {string} action - The action Mario is currently performing
* @property {number} damage - The damage Mario is currently dealing
* */
export default interface MarioI {
    maxHP: number;
    maxFP: number;
    hp: number;
    fp: number;
    boots: string;
    hammer: string;
    items: Array<string>|null;
    badges: Array<string>|null;
    buffed: boolean;
    action: string;
    damage: number;
}