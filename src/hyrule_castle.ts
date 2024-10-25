import * as playersFromJson from '../data/players.json';
import * as enemiesFromJson from '../data/enemies.json';
import * as bossesFromJson from '../data/bosses.json';
import { type Char } from './lib/types';
import { displayHp, pickChar, pickChars } from './utils/functions';

const rl = require('readline-sync');

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

function fight(player: Char, enemy: Char) {
  console.log(`You encounter ${enemy.isBoss ? enemy.name : `a \u001b[31m${enemy.name}\u001b[37m`}, prepare to fight!\n`);
  while (!(enemy.hp <= 0 || player.hp <= 0)) {
    displayHp(player);
    displayHp(enemy);
    let move = rl.question('==== Options:  [1] Attack  [2] Heal  ====\n\n');
    while (!['1', '2'].includes(move)) {
      console.log('\nPlease type a valid entree.\n');
      move = rl.question('==== Options:  [1] Attack  [2] Heal  ====\n\n');
    }
    if (move === '1') {
      enemy.hp -= player.str;
      console.log(`\nYou attack \u001b[31m${enemy.name}\u001b[37m!\n`);
      console.log(`${enemy.name} loses ${player.str} HP.\n`);
    } else if (move === '2') {
      if (player.hp + Math.floor(player.hpMax / 2) <= player.hpMax) {
        console.log(`\n\u001b[34mYou recover ${Math.floor(player.hpMax / 2)} HP.\u001b[37m\n`);
        player.hp += Math.floor(player.hpMax / 2);
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
  }
  if (player.hp <= 0) {
    displayHp(player);
    console.log('GAME OVER\n');
    process.exit();
  }
}

function game(player: Char, monsters: Char[], boss: Char) {
  console.log('\n\u001b[37m==== You enter Hyrule Castle ====\n');
  for (let i = 0; i < monsters.length; i += 1) {
    console.log(`\u001b[33m==== FLOOR ${i + 1} ====\u001b[37m\n`);
    fight(player, monsters[i]);
  }
  console.log('\u001b[35m==== BOSS FLOOR ====\u001b[37m\n');
  fight(player, boss);
  console.log('Congratulations, you saved Hyrule from Evil\n');
}

const player = pickChar(players);

const monsters = pickChars(enemies);

const boss = pickChar(bosses);

game(player, monsters, boss);
