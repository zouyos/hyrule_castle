import { Char } from '../lib/types';

export function updateChars(chars: Char[], multiplier: number) {
  return chars.map((char) => Object.fromEntries(
    Object.entries(char).map(([key, val]) => [
      key,
      typeof val === 'number' ? Math.floor(val * multiplier) : val,
    ]),
  ) as Char);
}

export function pickRandomChar(chars: Char[]) {
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

export function pickRandomEnemies(arr: Char[], multiplier: number) {
  const pickedEnemies: Char[] = [];
  for (let i = 0; i < multiplier; i += 1) {
    pickedEnemies.push(pickRandomChar(arr));
  }
  return pickedEnemies;
}

export function pickRandomBosses(arr: Char[], multiplier: number) {
  const pickedBosses: Char[] = [];
  for (let i = 1; i <= multiplier; i += 1) {
    i % 10 === 0 && pickedBosses.push(pickRandomChar(arr));
  }
  return pickedBosses;
}
