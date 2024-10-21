const rl = require('readline-sync');

// const answer = rl.keyInYN('test?')

const player = {
  name: 'Link',
  HP: 60,
  HPMax: 60,
  STR: 15,
}

type mob = {
  name: string,
  HP: number,
  HPMax: number,
  STR: number,
}

const playerHP: string[] = []
for (let i = 0; i < player.HP; i += 1) {
  playerHP.push('I')
}

const mobs: any[] = []
for (let i = 0; i < 9; i += 1) {
  mobs.push({ id: i + 1, name: `Bokoblin ${i + 1}`, HP: 30, HPMax: 30, STR: 5 })
}

function displayHP(char: any) {
  const HPArray: string[] = Array(char.HPMax).fill('I')
  HPArray.map((hp, i) => {
    if (char.HPMax !== char.HP && i + 1 > char.HP) {
      return HPArray[i] = '.'
    }
  })
  console.log(`${char.name}'s HP: [${HPArray.join('')}] ${char.HP}/${char.HPMax}`);
}

function game() {
  console.log('You enter Hyrule Castle');
  // mob fights
  for (let i = 0; i < 9; i += 1) {
    console.log(`You are in floor ${i + 1}`);

    console.log(`You encounter ${mobs[i].name}, prepare to fight!`);
    while (mobs[i].HP > 0) {
      displayHP(player)
      displayHP(mobs[i])
      const move = rl.question('1. Attack --- 2. Heal\n')
      if (move === '1') {
        mobs[i].HP -= player.STR
        console.log(`You attack ${mobs[i].name}!`);
        console.log(`${mobs[i].name} loses ${player.STR} HP.`);
        displayHP(mobs[i])
      }
      console.log(`${mobs[i].name} attacks!`);
      player.HP -= mobs[i].STR
      console.log(`You lose ${mobs[i].STR} HP.`);
    }
    displayHP(mobs[i])
    console.log(`${mobs[i].name} defeated!`);
  }
  console.log('You are in floor 10, Ganon\'s room');

}

game()