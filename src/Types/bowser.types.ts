/*
* Interface used to define the type of the Bowser object
*
* @interface Bowser
* @property {number} maxHP - The maximum HP of Bowser
* @property {number} hp - The current HP of Bowser
* @property {number} heals - The number of heals Bowser has left, max 3
* @property {boolean} shielded - Whether Bowser is currently shielded (Star shield)
* @property {number} turnsSinceShockwave - The number of turns since Bowser last used Shockwave
* @property {number} turnsSinceFireBreath - The number of turns since Bowser last used Fire Breath
* @property {number} turnsSinceHeal - The number of turns since Bowser last used Heal
* @property {number} turnsSinceShield - The number of turns since Bowser last used Shield
* @property {string} action - The action Bowser is currently performing
* @property {BowserActionsI} actions - The actions Bowser can perform and their probabilities
* */
import BowserActionsI from "./bowserActions.types";
import BowserTurnsI from "./BowserTurns.types";

export default interface BowserI {
    maxHP: number;
    hp: number;
    heals: number;
    shield: boolean;
    action: string;
    turnsInfo: BowserTurnsI;
    actionChances: BowserActionsI;
}