export default interface BowserI {
    maxHP: number;
    hp: number;
    heals: number;
    shield: boolean;
    turnsSinceShockwave: number;
    turnsSinceHeal: number;
    turnsSinceStarRod: number;
    buffed: boolean;
}