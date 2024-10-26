import { type Char } from '../../../lib/types';

export function displayHp(char: Char) {
  const hpArray: string[] = Array(char.hpMax).fill('I');
  hpArray.forEach((hp, i) => {
    if (char.hpMax !== char.hp && i + 1 > char.hp) {
      hpArray[i] = '.';
    }
  });
  console.log(`${char.isPlayer ? '\u001b[32m' : '\u001b[31m'}${char.name}'s HP: [${hpArray.join('')}] ${char.hp >= 0 ? char.hp : '0'}/${char.hpMax}\u001b[37m\n`);
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
  console.log(`\n\u001b[32mYou\u001b[31m attack \u001b[31m${enemy.name}\u001b[37m!\n`);
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

export function heal(player: Char) {
  if (player.hp + Math.floor(player.hpMax / 2) <= player.hpMax) {
    console.log(`\n\u001b[36mYou recover ${Math.floor(player.hpMax / 2)} HP.\u001b[37m\n`);
    player.hp += Math.floor(player.hpMax / 2);
  } else {
    console.log(`\n\u001b[36mYou recover ${player.hpMax - player.hp} HP.\u001b[37m\n`);
    player.hp = player.hpMax;
  }
}

export function enemyTurn(player: Char, enemy: Char, protect: boolean) {
  console.log(`\n\u001b[31m${enemy.name}\u001b[37m attacks!\n`);
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
      console.log('\u001b[34mYou protect yourself.\u001b[37m\n');
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
