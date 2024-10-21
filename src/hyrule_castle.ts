import * as playersFromJson from '../data/players.json';
import * as enemiesFromJson from '../data/enemies.json';
import * as bossesFromJson from '../data/bosses.json';

const rl = require('readline-sync');

type Char = {
  name: string,
  hp: number,
  hpMax: number,
  mp: number,
  str: number,
  int: number,
  def: number,
  res: number,
  spd: number,
  luck: number,
  race: number,
  class: number,
  rarity: number,
  isPlayer: boolean,
  isBoss: boolean
};

const players: Char[] = [...playersFromJson].map((player) => ({
  ...player,
  isPlayer: true,
  isBoss: false,
  hpMax: player.hp,
}));

const enemies: Char[] = [...enemiesFromJson].map((enemy) => ({
  ...enemy,
  isPlayer: false,
  isBoss: false,
  hpMax: enemy.hp,
}));

const bosses: Char[] = [...bossesFromJson].map((boss) => ({
  ...boss,
  isPlayer: false,
  isBoss: true,
  hpMax: boss.hp,
}));

function displayHp(char: Char) {
  const hpArray: string[] = Array(char.hpMax).fill('I');
  hpArray.forEach((hp, i) => {
    if (char.hpMax !== char.hp && i + 1 > char.hp) {
      hpArray[i] = '.';
    }
  });
  console.log(`${char.isPlayer ? '\u001b[32m' : '\u001b[31m'}${char.name}'s hp: [${hpArray.join('')}] ${char.hp >= 0 ? char.hp : '0'}/${char.hpMax}\u001b[37m`);
}

function fight(player: Char, enemy: Char) {
  console.log(`You encounter ${enemy.isBoss ? enemy.name : `a ${enemy.name}`}, prepare to fight!`);
  while (!(enemy.hp <= 0 || player.hp <= 0)) {
    displayHp(player);
    displayHp(enemy);
    const move = rl.question('--- Options:  1.Attack  2.Heal  ---\n');
    if (move === '1') {
      enemy.hp -= player.str;
      console.log(`You attack ${enemy.name}!`);
      console.log(`${enemy.name} loses ${player.str} HP.`);
    } else if (move === '2') {
      if (player.hp + Math.ceil(player.hpMax / 2) <= player.hpMax) {
        console.log(`You recover ${Math.ceil(player.hpMax / 2)} HP`);
        player.hp += Math.ceil(player.hpMax / 2);
      } else {
        console.log(`You recover ${player.hpMax - player.hp} HP`);
        player.hp = player.hpMax;
      }
    }
    if (enemy.hp !== 0) {
      console.log(`${enemy.name} attacks!`);
      player.hp -= enemy.str;
      console.log(`You lose ${enemy.str} HP.`);
    }
  }
  if (enemy.hp <= 0) {
    displayHp(enemy);
    console.log(`${enemy.name} defeated!`);
  }
  if (player.hp <= 0) {
    displayHp(player);
    console.log('GAME OVER');
    process.exit();
  }
}

function game(player: Char, enemies: Char[], boss: Char) {
  console.log('You enter Hyrule Castle');
  for (let i = 0; i < enemies.length; i += 1) {
    console.log(`You are in floor ${i + 1}`);
    fight(player, enemies[i]);
  }
  console.log('You are in floor 10, Ganon\'s room');
  fight(player, boss);
  console.log('Congratulations, you saved Hyrule from Evil');
}

const link = players[0];

const enemiesArr: Char[] = [];
for (let i = 0; i < 9; i += 1) {
  enemiesArr.push({ ...enemies[11], name: `${enemies[11].name}` });
}

const ganon = bosses[0];

game(link, enemiesArr, ganon);
