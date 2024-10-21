export class Hero {
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

  attack(mob: any) {
    mob.HP -= this.STR
    console.log(`You attack ${mob.name}!`);
    console.log(`${mob.name} loses ${this.STR} HP.`);
  }

  heal() {
    if (this.HP + Math.ceil(this.HPMax / 2) <= this.HPMax) {
      console.log(`You recover ${Math.ceil(this.HPMax / 2)} HP`);
      this.HP += Math.ceil(this.HPMax / 2)
    } else {
      console.log(`You recover ${this.HPMax - this.HP} HP`);
      this.HP = this.HPMax
    }
  }
}