import { type Char, Item } from '../lib/types';

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
    if (crit) {
      enemy.hp -= calcPlayerDamage * 2;
      console.log(`CRITICAL HIT! \u001b[31m${enemy.name}\u001b[37m loses ${calcPlayerDamage * 2} HP.\n`);
    } else {
      enemy.hp -= calcPlayerDamage;
      console.log(`\u001b[31m${enemy.name}\u001b[37m loses ${calcPlayerDamage} HP.\n`);
    }
  }
}

export function displayInventory(inventory: Item[]): string {
  console.log('\n==== Inventory: ====\n');
  let displayedItems: string = '';
  inventory.forEach((item, i) => {
    displayedItems += `[${i + 1}] \u001b[1m${item.name}\u001b[0m\n${item.effect}\u001b[0m\u001b[37m\n`;
    i === inventory.length - 1 && (displayedItems += '[0] \u001b[1mBack\u001b[0m\u001b[37m\n');
  });
  let itemChoice: string = rl.question(`${displayedItems}\n`);
  const choicesArr: string[] = ['0'];
  inventory.forEach((item) => {
    choicesArr.push(item.id.toString());
  });
  while (!choicesArr.includes(itemChoice)) {
    console.log('Please type a valid entree.');
    itemChoice = rl.question(`${displayedItems}`);
  }
  return itemChoice;
}

export function useItem(player: Char, item: Item) {
  if (item.usable) {
    const hpBoost: boolean = item.hpBoost > 0
    if (hpBoost) {
      if (player.hp === player.hpMax) {
        console.log('\nYour HP are already at maximum.\n');
        return false
      }
    } else {
      if (player.mp === player.mpMax) {
        console.log('\nYour MP are already at maximum.\n');
        return false
      }
    }
    const baseBoost: number = item.hpBoost > 0 ? item.hpBoost : item.mpBoost;
    console.log(`\nYou use a ${item.name}.\n`);
    if (hpBoost) {
      if (player.hp + baseBoost <= player.hpMax) {
        player.hp += baseBoost;
        // item - 1
        console.log(`\n\u001b[36mYou recover ${baseBoost} HP.\u001b[37m\n`);
      } else {
        console.log(`\n\u001b[36mYou recover ${player.hpMax - player.hp} HP.\u001b[37m\n`);
        player.hp = player.hpMax;
        // item - 1
      }
    } else {
      if (player.mp + baseBoost <= player.mpMax) {
        player.mp += baseBoost;
        // item - 1
        console.log(`\n\u001b[34mYou recover ${baseBoost} MP.\u001b[37m\n`);
      } else {
        console.log(`\n\u001b[34mYou recover ${player.mpMax - player.mp} MP.\u001b[37m\n`);
        player.hp = player.hpMax;
        // item - 1
      }
    }
  }

  if (item.equipable) {
    const boostLines = []
    Object.entries(item).forEach(([iKey, iVal]) => {
      if (typeof iVal === 'number' && iKey.includes('Boost') && iVal > 0) {
        Object.entries(player).forEach(([pKey, pVal]) => {
          if (typeof pVal === 'number' && iKey.includes(pKey)) {
            console.log(`${pKey} + ${iVal}`);
            player[pKey] += iVal
          }
        })
      }
    })
  }
}

export function enemyTurn(player: Char, enemy: Char, protect: boolean) {
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
    } else {
      console.log('You protect yourself.\n');
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
