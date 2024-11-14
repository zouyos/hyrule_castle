import { type Char, Spell } from '../../../lib/types';

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

export function displaySpells(player: Char, spells: Spell[]): string {
  console.log('\n==== Spells: ====\n');
  let displayedSpells: string = '';
  spells.forEach((spell, i) => {
    displayedSpells += `[${i + 1}] \u001b[1m${spell.name}\u001b[0m\n${spell.effect}\u001b[0m\u001b[37m\n`;
    i === spells.length - 1 && (displayedSpells += '[0] \u001b[1mBack\u001b[0m\u001b[37m\n');
  });
  const possibleChoices: string[] = ['0'];
  spells.forEach((spell) => {
    possibleChoices.push(spell.id.toString());
  });
  let spellIdStr: string = rl.question(`${displayedSpells}\n`);
  let chosenSpell: Spell = spells[Number(spellIdStr) - 1]
  let notEnoughMp: boolean = player.mp < chosenSpell.cost
  let isHpAtMax: boolean = chosenSpell.heal !== undefined && player.hp === player.hpMax
  let isMpAtMax: boolean = chosenSpell.restore !== undefined && player.mp === player.mpMax
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
    chosenSpell = spells[Number(spellIdStr) - 1]
    notEnoughMp = player.mp < chosenSpell.cost
    isHpAtMax = chosenSpell.heal !== undefined && player.hp === player.hpMax
    isMpAtMax = chosenSpell.restore !== undefined && player.mp === player.mpMax
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
      if (crit) {
        enemy.hp -= calcPlayerDamage * 2;
        player.mp -= spell.cost;
        console.log(`CRITICAL HIT! \u001b[31m${enemy.name}\u001b[37m loses ${calcPlayerDamage * 2} HP.\n`);
      } else {
        enemy.hp -= calcPlayerDamage;
        player.mp -= spell.cost;
        console.log(`\u001b[31m${enemy.name}\u001b[37m loses ${calcPlayerDamage} HP.\n`);
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
  if (spell.restore) {
    console.log(`\n\u001b[34mYou recover ${player.mpMax - player.mp} MP.\u001b[37m\n`);
    player.mp = player.mpMax;
    // player.mp -= spell.cost;
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
    } else {
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
