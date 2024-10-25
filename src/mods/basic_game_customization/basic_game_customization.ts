import * as playersFromJson from '../../../data/players.json';
import * as enemiesFromJson from '../../../data/enemies.json';
import * as bossesFromJson from '../../../data/bosses.json';

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
  isPlayer?: boolean,
  isBoss?: boolean,
  coins?: number
};

const players: Char[] = [...playersFromJson].map((player) => ({
  ...player,
  isPlayer: true,
  isBoss: false,
  hpMax: player.hp,
  coins: 12,
}));

const enemies: Char[] = [...enemiesFromJson].map((enemy) => ({
  ...enemy,
  hpMax: enemy.hp,
}));

const bosses: Char[] = [...bossesFromJson].map((boss) => ({
  ...boss,
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
  console.log(`${char.isPlayer ? '\u001b[32m' : '\u001b[31m'}${char.name}'s HP: [${hpArray.join('')}] ${char.hp >= 0 ? char.hp : '0'}/${char.hpMax}\u001b[37m\n`);
}

function updateChars(chars: Char[], multiplier: number) {
  return chars.map((char) => Object.fromEntries(
    Object.entries(char).map(([key, val]) => [
      key,
      typeof val === 'number' ? Math.round(val * multiplier) : val,
    ]),
  ) as Char);
}

// function updateChar(char: Char, multiplier: number) {
//   return Object.fromEntries(
//     Object.entries(char).map(([key, val]) => [
//       key,
//       typeof val === 'number' ? Math.round(val * multiplier) : val,
//     ]),
//   ) as Char;
// }

function pickChar(chars: Char[]) {
  const rarities = [
    { idx: 1, pct: 50 },
    { idx: 2, pct: 30 },
    { idx: 3, pct: 15 },
    { idx: 4, pct: 4 },
    { idx: 5, pct: 1 },
  ];
  const randomNumber = Math.floor(Math.random() * 100) + 1;

  let result: number | undefined;
  let acc = 0;

  rarities.forEach((rarity) => {
    if (result === undefined && randomNumber > 100 - rarity.pct - acc) result = rarity.idx;
    acc += rarity.pct;
  });

  const pickableChars: Char[] = [];

  for (const char of chars) {
    if (char.rarity === result) {
      pickableChars.push({ ...char });
    }
  }

  return pickableChars[Math.floor(Math.random() * pickableChars.length)];
}

function pickEnemies(arr: Char[], multiplier: number) {
  const pickedEnemies: Char[] = [];
  for (let i = 0; i < multiplier; i += 1) {
    pickedEnemies.push(pickChar(arr));
  }
  return pickedEnemies;
}

function pickBosses(arr: Char[], multiplier: number) {
  const pickedBosses: Char[] = [];
  for (let i = 1; i <= multiplier; i += 1) {
    i % 10 === 0 && pickedBosses.push(pickChar(arr));
  }
  return pickedBosses;
}

function fight(player: Char, enemy: Char) {
  console.log(`You encounter ${enemy.isBoss ? enemy.name : `a \u001b[31m${enemy.name}\u001b[37m`}, prepare to fight!\n`);
  while (!(enemy.hp <= 0 || player.hp <= 0)) {
    displayHp(player);
    displayHp(enemy);
    let move = rl.question('==== Options:  [1] Attack  [2] Heal  ====\n\n');
    while (!['1', '2'].includes(move)) {
      console.log('Please type a valid entree.');
      move = rl.question('==== Options:  [1] Attack  [2] Heal  ====\n\n');
    }
    if (move === '1') {
      enemy.hp -= player.str;
      console.log(`\nYou attack \u001b[31m${enemy.name}\u001b[37m!\n`);
      console.log(`${enemy.name} loses ${player.str} HP.\n`);
    } else if (move === '2') {
      if (player.hp + Math.round(player.hpMax / 2) <= player.hpMax) {
        console.log(`\n\u001b[34mYou recover ${Math.round(player.hpMax / 2)} HP.\u001b[37m\n`);
        player.hp += Math.round(player.hpMax / 2);
      } else {
        console.log(`\n\u001b[34mYou recover ${player.hpMax - player.hp} HP.\u001b[37m\n`);
        player.hp = player.hpMax;
      }
    }
    if (enemy.hp > 0) {
      console.log(`${enemy.name} attacks!\n`);
      player.hp -= enemy.str;
      console.log(`You lose ${enemy.str} HP.\n`);
    }
  }
  if (enemy.hp <= 0) {
    displayHp(enemy);
    console.log(`${enemy.name} DEFEATED!\n`);
    player.coins && (player.coins += 1);
  }
  if (player.hp <= 0) {
    displayHp(player);
    console.log('GAME OVER\n');
    process.exit();
  }
}

function game() {
  const player: Char = pickChar(players);
  let updatedEnemies: Char[] = enemies;
  let updatedBosses: Char[] = bosses;
  let nbFights: number = 10;
  console.log('\n\u001b[37m==== Welcome to Hyrule Castle Game ====\n\n');
  let newGame = rl.question('[1] New Game\n[2] Quit\n\n');
  while (!['1', '2'].includes(newGame)) {
    console.log('\nPlease type a valid entree\n');
    newGame = rl.question('[1] New Game\n[2] Quit\n\n');
  }
  if (newGame === '1') {
    console.log('\nPlease select a number of fights:\n');
    let rlNbFights = rl.question('[1] 10\n[2] 20\n[3] 50\n[4] 100\n\n');
    while (!['1', '2', '3', '4'].includes(rlNbFights)) {
      console.log('\nPlease type a valid entree\n');
      rlNbFights = rl.question('[1] 10\n[2] 20\n[3] 50\n[4] 100\n\n');
    }
    switch (rlNbFights) {
      case '1':
        nbFights = 10;
        break;
      case '2':
        nbFights = 20;
        break;
      case '3':
        nbFights = 50;
        break;
      case '4':
        nbFights = 100;
        break;
      default:
        nbFights = 10;
        break;
    }
    updatedEnemies = pickEnemies(updatedEnemies, nbFights);
    updatedBosses = pickBosses(updatedBosses, nbFights);
    console.log('\nPlease select a difficulty:\n');
    let difficulty = rl.question('[1] Normal\n[2] Difficult\n[3] Insane\n\n');
    while (!['1', '2', '3'].includes(difficulty)) {
      console.log('\nPlease type a valid entree\n');
      difficulty = rl.question('[1] Normal\n[2] Difficult\n[3] Insane\n\n');
    }
    if (difficulty === '2') {
      updatedEnemies = updateChars(updatedEnemies, 1.5);
      updatedBosses = updateChars(updatedBosses, 1.5);
    } else if (difficulty === '3') {
      updatedEnemies = updateChars(updatedEnemies, 1.5);
      updatedBosses = updateChars(updatedBosses, 1.5);
    }
    console.log('\n==== You enter Hyrule Castle ====\n');
    for (let i = 1; i <= nbFights; i += 1) {
      if (!(i % 10 === 0)) {
        console.log(`\u001b[33m==== FLOOR ${i} ====\u001b[37m\n`);
        fight(player, updatedEnemies[i]);
        console.log(`You earned 1 coin, you have now ${player.coins} coins.\n`);
      } else {
        console.log('\u001b[35m==== BOSS FLOOR ====\u001b[37m\n');
        fight(player, updatedBosses[(i / 10) - 1]);
      }
    }
    console.log('Congratulations, you saved Hyrule from Evil.\n');
  } else if (newGame === '2') {
    process.exit();
  }
}

game();
