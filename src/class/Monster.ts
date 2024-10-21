export class Monster {
  name: string;
  HP: number;
  HPMax: number;
  STR: number;

  constructor(name: string, HP: number, HPMax: number, STR: number) {
    this.name = name;
    this.HP = HP;
    this.HPMax = HPMax;
    this.STR = STR;
  }

  attack(hero: any) {
    console.log(`${this.name} attacks!`);
    hero.HP -= this.STR
    console.log(`You lose ${this.STR} HP.`);
  }
}