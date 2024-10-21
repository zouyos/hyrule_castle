import { Hero } from './class/Hero';
import { Monster } from './class/Monster';

const rl = require('readline-sync');

type Char = Hero | Monster

function displayHP(char: Char) {
  const HPArray: string[] = Array(char.HPMax).fill('I');
  HPArray.forEach((hp, i) => {
    if (char.HPMax !== char.HP && i + 1 > char.HP) {
      HPArray[i] = '.';
    }
  });
  console.log(`${char instanceof Hero ? '\u001b[32m' : '\u001b[31m'}${char.name}'s HP: [${HPArray.join('')}] ${char.HP}/${char.HPMax}\u001b[37m`);
}

function fight(player: Hero, monster: Monster) {
  console.log(`You encounter ${monster.name}, prepare to fight!`);
  while (!(monster.HP === 0 || player.HP === 0)) {
    displayHP(player);
    displayHP(monster);
    const move = rl.question('---- Options: 1.Attack 2.Heal ----\n');
    if (move === '1') {
      player.attack(monster);
      displayHP(monster);
    } else if (move === '2') {
      player.heal();
      displayHP(player);
    }
    if (monster.HP !== 0) {
      monster.attack(player);
    }
  }
  if (monster.HP === 0) {
    displayHP(monster);
    console.log(`${monster.name} defeated!`);
  } else {
    console.log('GAME OVER');
    process.exit();
  }
}

function game(player: Hero, mobs: Monster[], boss: Monster) {
  console.log('Tamer');
  console.log('You enter Hyrule Castle');
  for (let i = 0; i < mobs.length; i += 1) {
    console.log(`You are in floor ${i + 1}`);
    fight(player, mobs[i]);
  }
  console.log('You are in floor 10, Ganon\'s room');
  fight(player, boss);
  console.log('Congratulations, you saved Hyrule from Evil');
}

const Link = new Hero('Link', 60, 60, 15);

const mobs: Monster[] = [];
for (let i = 0; i < 9; i += 1) {
  mobs.push(new Monster(`Bokoblin ${i + 1}`, 30, 30, 5));
}

const Ganon = new Monster('Ganon', 150, 150, 20);

game(Link, mobs, Ganon);
