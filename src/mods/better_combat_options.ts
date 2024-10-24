import * as playersFromJson from '../../data/players.json';
import * as enemiesFromJson from '../../data/enemies.json';
import * as bossesFromJson from '../../data/bosses.json';

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

let players: Char[] = [...playersFromJson].map((player) => ({
  ...player,
  isPlayer: true,
  hpMax: player.hp,
  coins: 12
}));

let enemies: Char[] = [...enemiesFromJson].map((enemy) => ({
  ...enemy,
  hpMax: enemy.hp,
}));

let bosses: Char[] = [...bossesFromJson].map((boss) => ({
  ...boss,
  isBoss: true,
  hpMax: boss.hp,
}));

function updateChars(chars: Char[], multiplier: number) {
  return chars.map((char) => {
    return Object.fromEntries(
      Object.entries(char).map(([key, val]) => [
        key,
        typeof val === 'number' ? Math.floor(val * multiplier) : val,
      ])
    ) as Char;
  });
}

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

function displayHp(char: Char) {
  const hpArray: string[] = Array(char.hpMax).fill('I');
  hpArray.forEach((hp, i) => {
    if (char.hpMax !== char.hp && i + 1 > char.hp) {
      hpArray[i] = '.';
    }
  });
  console.log(`${char.isPlayer ? '\u001b[32m' : '\u001b[31m'}${char.name}'s HP: [${hpArray.join('')}] ${char.hp >= 0 ? char.hp : '0'}/${char.hpMax}\u001b[37m\n`);
}

function calcDodge(player: Char, enemy: Char): boolean {
  const enemyFirst = enemy.spd > player.spd
  const dodgeChance = enemyFirst ? enemy.spd - player.spd : player.spd - enemy.spd
  const dodge = Math.random() < dodgeChance / 100
  return dodge
}

function calcCrit(char: Char) {
  const crit = Math.random() < char.luck / 100
  return crit
}

function playerTurn(player: Char, enemy: Char) {
  console.log(`\n\u001b[32mYou\u001b[31m attack \u001b[31m${enemy.name}\u001b[37m!\n`);
  const dodge: boolean = calcDodge(player, enemy)
  const crit: boolean = calcCrit(player)
  if (dodge) {
    console.log(`\u001b[31m${enemy.name}\u001b[37m dodges your hit!\n`);
  } else {
    let playerBaseDamage = player.str
    let calcPlayerDamage = Math.floor(playerBaseDamage - (playerBaseDamage * (enemy.def / 100)))
    if (crit) {
      enemy.hp -= calcPlayerDamage * 2;
      console.log(`CRITICAL HIT! \u001b[31m${enemy.name}\u001b[37m loses ${calcPlayerDamage * 2} HP.\n`);
    } else {
      enemy.hp -= calcPlayerDamage;
      console.log(`\u001b[31m${enemy.name}\u001b[37m loses ${calcPlayerDamage} HP.\n`);
    }
  }
}

function heal(player: Char) {
  if (player.hp + Math.floor(player.hpMax / 2) <= player.hpMax) {
    console.log(`\n\u001b[36mYou recover ${Math.floor(player.hpMax / 2)} HP.\u001b[37m\n`);
    player.hp += Math.floor(player.hpMax / 2);
  } else {
    console.log(`\n\u001b[36mYou recover ${player.hpMax - player.hp} HP.\u001b[37m\n`);
    player.hp = player.hpMax;
  }
}

function enemyTurn(player: Char, enemy: Char, protect: boolean) {
  console.log(`\u001b[31m${enemy.name}\u001b[37m attacks!\n`);
  const dodge: boolean = calcDodge(player, enemy)
  const crit: boolean = calcCrit(enemy)
  if (dodge) {
    console.log(`You dodge your opponent's hit!\n`);
  } else {
    let enemyBaseDamage = enemy.str
    let calcEnemyDamage = Math.floor(enemyBaseDamage - (enemyBaseDamage * (player.def / 100)))
    if (!protect) {
      if (crit) {
        player.hp -= calcEnemyDamage * 2;
        console.log(`CRITICAL HIT! You lose ${calcEnemyDamage * 2} HP.\n`);
      } else {
        player.hp -= calcEnemyDamage;
        console.log(`You lose ${calcEnemyDamage} HP.\n`);
      }
    } else {
      console.log('\n\u001b[34mYou protect yourself.\u001b[37m\n');
      if (crit) {
        player.hp -= calcEnemyDamage;
        console.log(`CRITICAL HIT! You lose ${calcEnemyDamage} HP.\n`);
      } else {
        player.hp -= Math.floor(calcEnemyDamage / 2);
        console.log(`You lose ${Math.floor(calcEnemyDamage / 2)} HP.\n`);
      }
    }
  }
}

function fight(player: Char, enemy: Char) {
  let escape = false
  console.log(`You encounter ${enemy.isBoss ? `\u001b[35m${enemy.name}\u001b[37m` : `a \u001b[31m${enemy.name}\u001b[37m`}, prepare to fight!\n`);
  if (enemy.spd > player.spd) {
    enemyTurn(player, enemy, false)
  }
  while (!(enemy.hp <= 0 || player.hp <= 0 || escape)) {
    displayHp(player);
    displayHp(enemy);
    console.log('==== Options: ====\n');
    let move = rl.question('[1] Attack\n[2] Protect\n[3] Heal\n[4] Escape\n\n');
    while (!['1', '2', '3', '4'].includes(move)) {
      console.log('Please type a valid entree.');
      move = rl.question('[1] Attack\n[2] Protect\n[3] Heal\n[4] Escape\n\n');
    }
    if (move === '4') {
      escape = true
    }
    if (move === '1') {
      playerTurn(player, enemy)
    }
    if (move === '3') {
      heal(player)
    }
    if (enemy.hp > 0 && move !== '4') {
      if (move !== '2') {
        enemyTurn(player, enemy, false)
      } else {
        enemyTurn(player, enemy, true)
      }
    }
  }
  if (enemy.hp <= 0) {
    displayHp(enemy);
    console.log(`${enemy.name} DEFEATED!\n`);
    player.coins && (player.coins += 1)
    console.log(`You earned 1 coin, you have now ${player.coins} coins.\n`);
  }
  if (escape) {
    console.log('\n\u001b[32mYou\u001b[31m escaped to the next floor.\n');
    player.coins && (player.coins -= 1)
    console.log(`You lose 1 coin, you have now ${player.coins} coins.\n`);
  }
  if (player.hp <= 0) {
    displayHp(player);
    console.log('GAME OVER\n');
    process.exit();
  }
}

function game() {
  const player: Char = pickChar(players)
  let nbFights: number = 10
  console.log('\n\u001b[37m==== Welcome to Hyrule Castle Game ====\n');
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
        nbFights = 10
        break;
      case '2':
        nbFights = 20
        break;
      case '3':
        nbFights = 50
        break;
      case '4':
        nbFights = 100
        break;
      default:
        nbFights = 10
        break;
    }
    enemies = pickEnemies(enemies, nbFights)
    bosses = pickBosses(bosses, nbFights)
    console.log('\nPlease select a difficulty:\n');
    let difficulty = rl.question('[1] Normal\n[2] Difficult\n[3] Insane\n\n');
    while (!['1', '2', '3'].includes(difficulty)) {
      console.log('\nPlease type a valid entree\n');
      difficulty = rl.question('[1] Normal\n[2] Difficult\n[3] Insane\n\n');
    }
    if (difficulty === '2') {
      enemies = updateChars(enemies, 1.5)
      bosses = updateChars(bosses, 1.5)
    } else if (difficulty === '3') {
      enemies = updateChars(enemies, 1.5)
      bosses = updateChars(bosses, 1.5)
    }
    console.log('\n==== You enter Hyrule Castle ====\n');
    for (let i = 1; i <= nbFights; i += 1) {
      if (!(i % 10 === 0)) {
        console.log(`\u001b[33m==== FLOOR ${i} ====\u001b[37m\n`)
        fight(player, enemies[i]);
      } else {
        console.log('\u001b[35m==== BOSS FLOOR ====\u001b[37m\n')
        fight(player, bosses[(i / 10) - 1]);
      }
    }
    console.log('Congratulations, you saved Hyrule from Evil.\n');
  } else if (newGame === '2') {
    process.exit()
  }
}

game();
