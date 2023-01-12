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
}