import * as playersFromJson from '../data/players.json';
import * as enemiesFromJson from '../data/enemies.json';
import * as bossesFromJson from '../data/bosses.json';
import * as inventoryFromJson from '../data/inventory.json';
import * as spellsFromJson from '../data/spells.json';
import { type Char, Item, Spell } from './lib/types';
import {
  updateChars, pickRandomChar, pickRandomEnemies, pickRandomBosses,
} from './utils/chars';
import {
  displayGauges, playerTurn, enemyTurn,
  displayInventory,
  useItem,
  castSpell,
  displaySpells,
  dropRandomItem,
} from './utils/fight';

const rl = require('readline-sync');

const items: Item[] = [...inventoryFromJson];

const spells: Spell[] = [...spellsFromJson];

const players: Char[] = [...playersFromJson].map((player) => ({
  ...player,
  isPlayer: true,
  hpMax: player.hp,
  mpMax: player.mp,
  coins: 12,
  inventory: [items[0], items[1]] as Item[],
  spells,
}));

let enemies: Char[] = [...enemiesFromJson].map((enemy) => ({
  ...enemy,
  hpMax: enemy.hp,
  mpMax: enemy.mp,
}));

let bosses: Char[] = [...bossesFromJson].map((boss) => ({
  ...boss,
  isBoss: true,
  hpMax: boss.hp,
  mpMax: boss.mp,
}));

function fight(player: Char, enemy: Char) {
  let escape = false;
  console.log(`You encounter ${enemy.isBoss ? `\u001b[35m${enemy.name}\u001b[37m` : `a \u001b[31m${enemy.name}\u001b[37m`}, prepare to fight!\n`);
  if (enemy.spd > player.spd) {
    enemyTurn(player, enemy, false);
  }
  while (!(enemy.hp <= 0 || player.hp <= 0 || escape)) {
    displayGauges(player);
    displayGauges(enemy);
    console.log('==== Options: ====\n');
    let move = rl.question('[1] Attack\n[2] Protect\n[3] Inventory\n[4] Magic Spells\n[5] Escape\n\n');
    while (!['1', '2', '3', '4', '5'].includes(move)) {
      console.log('Please type a valid entree.');
      move = rl.question('[1] Attack\n[2] Protect\n[3] Inventory\n[4] Magic Spells\n[5] Escape\n\n');
    }
    if (move === '5') {
      escape = true;
    } else if (move === '1') {
      playerTurn(player, enemy);
    } else if (move === '3' && player.inventory) {
      const itemChoice = displayInventory(player.inventory);
      if (itemChoice === '0') {
        console.log('');
        continue;
      }
      player.inventory && useItem(player, player.inventory[Number(itemChoice) - 1]);
    } else if (move === '4') {
      const spellChoice = displaySpells(player, spells);
      if (spellChoice === '0') {
        console.log('');
        continue;
      }
      castSpell(player, spells[Number(spellChoice) - 1], enemy);
    }
    if (enemy.hp > 0 && move !== '5') {
      if (move !== '2') {
        enemyTurn(player, enemy, false);
      } else {
        enemyTurn(player, enemy, true);
      }
    }
  }
  if (enemy.hp <= 0) {
    console.log(`${enemy.name} DEFEATED!\n`);
    player.coins && (player.coins += 1);
    console.log(`You earned \u001b[33m1\u001b[37m coin, you have now \u001b[33m${player.coins}\u001b[37m coins.\n`);
    const droppedItem = dropRandomItem(items, { inventory: player.inventory ?? [] });

    const existingItem = player.inventory?.find(item => item.name === droppedItem.name);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      droppedItem.quantity = 1;
      player.inventory?.push(droppedItem);
    }

    console.log(`You looted a ${droppedItem.name}, you can check its stats using inventory menu.\n`);
  }
  if (escape) {
    console.log('\nYou escaped to the next floor.\n');
    player.coins && (player.coins -= 1);
    console.log(`You lost \u001b[33m1\u001b[37m coin, you have now \u001b[33m${player.coins}\u001b[37m coins.\n`);
  }
  if (player.hp <= 0) {
    console.log('GAME OVER\n');
    process.exit();
  }
}

function game() {
  const player: Char = pickRandomChar(players);
  let nbFights: number = 10;
  console.log('\n\u001b[37m==== Welcome to Hyrule Castle Game ====\n');
  let newGame = rl.question('[1] New Game\n[2] Quit\n\n');
  while (!['1', '2'].includes(newGame)) {
    console.log('\nPlease type a valid entree\n');
    newGame = rl.question('[1] New Game\n[2] Quit\n\n');
  }
  if (newGame === '1') {
    console.log('\nPlease select a number of fights:\n');
    let userInputNbFights: string = rl.question('[1] 10\n[2] 20\n[3] 50\n[4] 100\n\n');
    while (!['1', '2', '3', '4'].includes(userInputNbFights)) {
      console.log('\nPlease type a valid entree\n');
      userInputNbFights = rl.question('[1] 10\n[2] 20\n[3] 50\n[4] 100\n\n');
    }
    switch (userInputNbFights) {
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
    enemies = pickRandomEnemies(enemies, nbFights);
    bosses = pickRandomBosses(bosses, nbFights);
    console.log('\nPlease select a difficulty:\n');
    let difficulty = rl.question('[1] Normal\n[2] Difficult\n[3] Asian\n\n');
    while (!['1', '2', '3'].includes(difficulty)) {
      console.log('\nPlease type a valid entree\n');
      difficulty = rl.question('[1] Normal\n[2] Difficult\n[3] Asian\n\n');
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

// TODO
// si un item donne un malus, s'arrêter à 0
// quand on equipe un objet, perdre les stats de l'ancien objet du même type (ex: changement de bouclier)
// bug: quand on perd un item usable (arrivé à 0) la ref reste