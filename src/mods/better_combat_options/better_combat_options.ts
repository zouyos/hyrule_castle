import * as playersFromJson from '../../../data/players.json';
import * as enemiesFromJson from '../../../data/enemies.json';
import * as bossesFromJson from '../../../data/bosses.json';
import { type Char } from '../../lib/types';
import {
  updateChars, pickRandomChar, pickRandomEnemies, pickRandomBosses,
} from './utils/chars';
import {
  displayHp, playerTurn, heal, enemyTurn,
} from './utils/fight';

const rl = require('readline-sync');

const players: Char[] = [...playersFromJson].map((player) => ({
  ...player,
  isPlayer: true,
  hpMax: player.hp,
  coins: 12,
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

function fight(player: Char, enemy: Char) {
  let escape = false;
  console.log(`You encounter ${enemy.isBoss ? `\u001b[35m${enemy.name}\u001b[37m` : `a \u001b[31m${enemy.name}\u001b[37m`}, prepare to fight!\n`);
  if (enemy.spd > player.spd) {
    enemyTurn(player, enemy, false);
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
      escape = true;
    }
    if (move === '1') {
      playerTurn(player, enemy);
    }
    if (move === '3') {
      heal(player);
    }
    if (enemy.hp > 0) {
      if (move !== '2') {
        enemyTurn(player, enemy, false);
      } else {
        enemyTurn(player, enemy, true);
      }
    }
  }
  if (enemy.hp <= 0) {
    displayHp(enemy);
    console.log(`${enemy.name} DEFEATED!\n`);
    player.coins && (player.coins += 1);
    console.log(`You earned 1 coin, you have now ${player.coins} coins.\n`);
  }
  if (escape) {
    console.log('\nYou escaped to the next floor.\n');
    player.coins && (player.coins -= 1);
    console.log(`You lose 1 coin, you have now ${player.coins} coins.\n`);
  }
  if (player.hp <= 0) {
    displayHp(player);
    console.log('GAME OVER\n');
    process.exit();
  }
}

function game() {
  const player: Char = pickRandomChar(players);
  let nbFights: number | string = 10;
  console.log('\n\u001b[37m==== Welcome to Hyrule Castle Game ====\n');
  let newGame = rl.question('[1] New Game\n[2] Quit\n\n');
  while (!['1', '2'].includes(newGame)) {
    console.log('\nPlease type a valid entree\n');
    newGame = rl.question('[1] New Game\n[2] Quit\n\n');
  }
  if (newGame === '1') {
    console.log('\nPlease select a number of fights:\n');
    nbFights = rl.question('[10]\n[20]\n[50]\n[100]\n\n');
    while (!['10', '20', '50', '100'].includes(nbFights.toString())) {
      console.log('\nPlease type a valid entree\n');
      nbFights = rl.question('[10]\n[20]\n[50]\n[100]\n\n');
    }
    nbFights = Number(nbFights);
    enemies = pickRandomEnemies(enemies, nbFights);
    bosses = pickRandomBosses(bosses, nbFights);
    console.log('\nPlease select a difficulty:\n');
    let difficulty = rl.question('[1] Normal\n[2] Difficult\n[3] Insane\n\n');
    while (!['1', '2', '3'].includes(difficulty)) {
      console.log('\nPlease type a valid entree\n');
      difficulty = rl.question('[1] Normal\n[2] Difficult\n[3] Insane\n\n');
    }
    if (difficulty === '2') {
      enemies = updateChars(enemies, 1.5);
      bosses = updateChars(bosses, 1.5);
    } else if (difficulty === '3') {
      enemies = updateChars(enemies, 2);
      bosses = updateChars(bosses, 2);
    }
    console.log('\n==== You enter Hyrule Castle ====\n');
    for (let i = 1; i <= nbFights; i += 1) {
      if (!(i % 10 === 0)) {
        console.log(`\u001b[33m==== FLOOR ${i} ====\u001b[37m\n`);
        fight(player, enemies[i]);
      } else {
        console.log('\u001b[35m==== BOSS FLOOR ====\u001b[37m\n');
        fight(player, bosses[(i / 10) - 1]);
      }
    }
    console.log('Congratulations, you saved Hyrule from Evil.\n');
  } else if (newGame === '2') {
    process.exit();
  }
}

game();
