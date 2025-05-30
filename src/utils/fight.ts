import { type Char, Item, Spell } from '../lib/types';
import * as inventoryFromJson from '../../data/inventory.json';
const items: Item[] = [...inventoryFromJson];

const rl = require('readline-sync');

export function displayGauges(char: Char) {
  const hpArray: string[] = Array(char.hpMax).fill('I');
  const mpArray: string[] = Array(char.mpMax).fill('I');

  hpArray.forEach((hp, i) => {
    if (char.hpMax !== char.hp && i + 1 > char.hp) {
      hpArray[i] = '.';
    }
  });

  mpArray.forEach((mp, i) => {
    if (char.mpMax !== char.mp && i + 1 > char.mp) {
      mpArray[i] = '.';
    }
  });

  console.log(`${char.name}:`);
  console.log(`${char.isPlayer ? '\u001b[32m' : '\u001b[31m'}HP: [${hpArray.join('')}] ${char.hp >= 0 ? char.hp : '0'}/${char.hpMax}\u001b[37m`);
  console.log(`\u001b[34mMP: [${mpArray.join('')}] ${char.mp >= 0 ? char.mp : '0'}/${char.mpMax}\u001b[37m\n`);
}

export function calcDodge(player: Char, enemy: Char): boolean {
  const enemyFirst = enemy.spd > player.spd;
  const dodgeChance = enemyFirst ? enemy.spd - player.spd : player.spd - enemy.spd;
  const dodge = Math.random() < dodgeChance / 100;
  return dodge;
}

export function calcCrit(char: Char) {
  const crit = Math.random() < char.luck / 100;
  return crit;
}

export function playerTurn(player: Char, enemy: Char) {
  console.log(`\nYou attack \u001b[31m${enemy.name}\u001b[37m!\n`);
  const dodge: boolean = calcDodge(player, enemy);
  const crit: boolean = calcCrit(player);
  if (dodge) {
    console.log(`\u001b[31m${enemy.name}\u001b[37m dodges your hit!\n`);
  } else {
    const playerBaseDamage = player.str;
    const calcPlayerDamage = Math.floor(playerBaseDamage - (playerBaseDamage * (enemy.def / 100)));
    const calcPlayerCritDamage = calcPlayerDamage * 2;
    if (crit) {
      console.log(`CRITICAL HIT! \u001b[31m${enemy.name}\u001b[37m loses ${enemy.hp >= calcPlayerCritDamage ? calcPlayerCritDamage : enemy.hp} HP.\n`);
      enemy.hp - calcPlayerCritDamage >= 0 ? enemy.hp -= calcPlayerCritDamage : enemy.hp = 0;
    } else {
      console.log(`\u001b[31m${enemy.name}\u001b[37m loses ${enemy.hp >= calcPlayerDamage ? calcPlayerDamage : enemy.hp} HP.\n`);
      enemy.hp - calcPlayerDamage >= 0 ? enemy.hp -= calcPlayerDamage : enemy.hp = 0;
    }
  }
}

export function displayInventory(inventory: Item[]): string {
  console.log('\n==== Inventory: ====\n');

  const filteredInventory = inventory.filter(item => item.quantity > 0);

  let displayedItems: string = '';
  filteredInventory.forEach((item, i) => {
      displayedItems += `[${i + 1}] \u001b[1m${item.name}\u001b[0m\n${item.effect}\u001b[0m\u001b[37m x${item.quantity}\u001b[0m\u001b[37m\n\n`;
  });

  displayedItems += '[0] \u001b[1mBack\u001b[0m\u001b[37m\n';

  let itemChoice: string = rl.question(`${displayedItems}\n`);
  const choicesArr: string[] = ['0'];

  filteredInventory.forEach((_, i) => {
    choicesArr.push((i + 1).toString());
  });

  while (!choicesArr.includes(itemChoice)) {
    console.log('\nPlease type a valid entree.\n');
    itemChoice = rl.question(`${displayedItems}\n`);
  }

  return itemChoice;
}


export function useItem(player: Char, item: Item) {
  if (item.usable) {
    const hpBoost: boolean = !!item.hpBoost && (item.hpBoost > 0);
    if (hpBoost) {
      if (player.hp === player.hpMax) {
        console.log('\nYour HP are already at maximum.\n');
        return false;
      }
    } else if (player.mp === player.mpMax) {
      console.log('\nYour MP are already at maximum.\n');
      return false;
    }
    const baseBoost: number = item.hpBoost && item.hpBoost > 0 ? item.hpBoost : item.mpBoost ?? 0;
    console.log(`\nYou use a ${item.name}.\n`);
    if (hpBoost) {
      if (player.hp + baseBoost <= player.hpMax) {
        player.hp += baseBoost;
        item.quantity -= 1
        console.log(`\n\u001b[36mYou recover ${baseBoost} HP.\u001b[37m\n`);
      } else {
        console.log(`\n\u001b[36mYou recover ${player.hpMax - player.hp} HP.\u001b[37m\n`);
        player.hp = player.hpMax;
        item.quantity -= 1
      }
    } else if (player.mp + baseBoost <= player.mpMax) {
      player.mp += baseBoost;
      item.quantity -= 1
      console.log(`\n\u001b[34mYou recover ${baseBoost} MP.\u001b[37m\n`);
    } else {
      console.log(`\n\u001b[34mYou recover ${player.mpMax - player.mp} MP.\u001b[37m\n`);
      player.mp = player.mpMax;
      item.quantity -= 1
    }
  }

  if (item.equipable) {
    console.log();
    Object.entries(item).forEach(([iKey, iVal]) => {
      if (typeof iVal === 'number' && iKey.includes('Boost') && iVal > 0) {
        Object.entries(player).forEach(([pKey, pVal]) => {
          if (typeof pVal === 'number' && iKey.includes(pKey)) {
            console.log(`${pKey} +${iVal}`);
            player[pKey] += iVal;
          }
        });
      }
    });
    console.log();
  }
}

export function displaySpells(player: Char, spells: Spell[]): string {
  console.log('\n==== Magic Spells: ====\n');
  let displayedSpells: string = '';
  spells.forEach((spell, i) => {
    displayedSpells += `[${i + 1}] \u001b[1m${spell.name}\u001b[0m\n${spell.effect}\u001b[0m\u001b[37m\n\n`;
    i === spells.length - 1 && (displayedSpells += '[0] \u001b[1mBack\u001b[0m\u001b[37m\n');
  });
  const possibleChoices: string[] = ['0'];
  spells.forEach((spell, i) => {
    possibleChoices.push((i + 1).toString());
  });
  let spellIdStr: string = rl.question(`${displayedSpells}\n`);
  if (spellIdStr === '0') {
    return '0';
  }
  let chosenSpell: Spell = spells[Number(spellIdStr) - 1];
  let notEnoughMp: boolean = player.mp < chosenSpell.cost;
  let isHpAtMax: boolean = chosenSpell.heal !== undefined && player.hp === player.hpMax;
  let isMpAtMax: boolean = chosenSpell.restore !== undefined && player.mp === player.mpMax;
  while (!possibleChoices.includes(spellIdStr) || notEnoughMp || isHpAtMax || isMpAtMax) {
    if (!possibleChoices.includes(spellIdStr)) {
      console.log('Please type a valid entree.');
    } else if (notEnoughMp) {
      console.log(`\nYou have ${player.mp} MP and this spell costs ${chosenSpell.cost}. You cannot cast it.\n`);
    } else if (isHpAtMax) {
      console.log('\nYour HP are already at maximum.\n');
    } else if (isMpAtMax) {
      console.log('\nYour MP are already at maximum.\n');
    }
    spellIdStr = rl.question(`${displayedSpells}\n`);
    if (spellIdStr === '0') {
      return '0';
    }
    chosenSpell = spells[Number(spellIdStr) - 1];
    notEnoughMp = player.mp < chosenSpell.cost;
    isHpAtMax = chosenSpell.heal !== undefined && player.hp === player.hpMax;
    isMpAtMax = chosenSpell.restore !== undefined && player.mp === player.mpMax;
  }
  return spellIdStr;
}

export function castSpell(player: Char, spell: Spell, enemy: Char) {
  if (spell.dmg) {
    console.log(`\nYou cast a ${spell.name} on \u001b[31m${enemy.name}\u001b[37m!\n`);
    const dodge: boolean = calcDodge(player, enemy);
    const crit: boolean = calcCrit(player);
    if (dodge) {
      console.log(`\u001b[31m${enemy.name}\u001b[37m dodges your hit!\n`);
      player.mp -= spell.cost;
    } else {
      const baseDamage: number = spell.dmg;
      const calcPlayerDamage: number = Math.floor(baseDamage - (baseDamage * (enemy.res / 100)));
      const calcPlayerCritDamage = calcPlayerDamage * 2;
      if (crit) {
        player.mp -= spell.cost;
        console.log(`CRITICAL HIT! \u001b[31m${enemy.name}\u001b[37m loses ${enemy.hp >= calcPlayerCritDamage ? calcPlayerCritDamage : enemy.hp} HP.\n`);
        enemy.hp - calcPlayerCritDamage >= 0 ? enemy.hp -= calcPlayerCritDamage : enemy.hp = 0;
      } else {
        player.mp -= spell.cost;
        console.log(`\u001b[31m${enemy.name}\u001b[37m loses ${enemy.hp >= calcPlayerDamage ? calcPlayerDamage : enemy.hp} HP.\n`);
        enemy.hp - calcPlayerDamage >= 0 ? enemy.hp -= calcPlayerDamage : enemy.hp = 0;
      }
    }
  }
  if (spell.heal) {
    if (typeof spell.heal === 'number' && player.hp + spell.heal <= player.hpMax) {
      player.hp += spell.heal;
      player.mp -= spell.cost;
      console.log('\n\u001b[36mYou recover 20 HP.\u001b[37m\n');
    } else {
      console.log(`\n\u001b[36mYou recover ${player.hpMax - player.hp} HP.\u001b[37m\n`);
      player.hp = player.hpMax;
      player.mp -= spell.cost;
    }
  }
}

export function enemyTurn(player: Char, enemy: Char, protect: boolean) {
  protect && console.log('\nYou protect yourself.\n');
  console.log(`\u001b[31m${enemy.name}\u001b[37m attacks!\n`);
  const dodge: boolean = calcDodge(player, enemy);
  const crit: boolean = calcCrit(enemy);
  if (dodge) {
    console.log('You dodge your opponent\'s hit!\n');
  } else {
    const enemyBaseDamage = enemy.str;
    const calcEnemyDamage = Math.floor(enemyBaseDamage - (enemyBaseDamage * (player.def / 100)));
    if (!protect) {
      if (crit) {
        player.hp -= calcEnemyDamage * 2;
        console.log(`CRITICAL HIT! You lose ${calcEnemyDamage * 2} HP.\n`);
      } else {
        player.hp -= calcEnemyDamage;
        console.log(`You lose ${calcEnemyDamage} HP.\n`);
      }
    } else if (crit) {
      player.hp -= calcEnemyDamage;
      console.log(`CRITICAL HIT! You lose ${calcEnemyDamage} HP.\n`);
    } else {
      player.hp -= Math.floor(calcEnemyDamage / 2);
      console.log(`You lose ${Math.floor(calcEnemyDamage / 2)} HP.\n`);
    }
  }
}

export function dropRandomItem(items: Item[]) {
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

  const dropableItems: Item[] = [];

  for (const item of items) {
    if (item.rarity === result) {
      dropableItems.push({ ...item });
    }
  }
  const randomIndex = Math.floor(Math.random() * items.length);
  const itemCopy = { ...items[randomIndex] };
  itemCopy.quantity = 1;
  return itemCopy;
}
