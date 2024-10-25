import { Char } from "../lib/types";

export function displayHp(char: Char) {
  const hpArray: string[] = Array(char.hpMax).fill('I');
  hpArray.forEach((hp, i) => {
    if (char.hpMax !== char.hp && i + 1 > char.hp) {
      hpArray[i] = '.';
    }
  });
  console.log(`${char.isPlayer ? '\u001b[32m' : '\u001b[31m'}${char.name}'s HP: [${hpArray.join('')}] ${char.hp >= 0 ? char.hp : '0'}/${char.hpMax}\u001b[37m\n`);
}

export function pickChar(chars: Char[]) {
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

export function pickChars(arr: Char[]) {
  const pickedChars: Char[] = [];
  for (let i = 0; i < 9; i += 1) {
    pickedChars.push(pickChar(arr));
  }
  return pickedChars;
}