export type Char = {
  name: string,
  hp: number,
  hpMax: number,
  mp: number,
  mpMax: number,
  str: number,
  int: number,
  def: number,
  res: number,
  spd: number,
  luck: number,
  race: number,
  class: number,
  rarity: number,
  isPlayer?: boolean,
  isBoss?: boolean,
  coins?: number,
  spells?: Spell[],
  inventory?: Item[]
};

export type Spell = {
  id: number,
  name: string,
  cost: number,
  dmg?: number,
  heal?: number | string,
  restore?: number | string,
  effect: string,
  cooldown: number,
  race: string[],
  rarity: number
};

export type Item = {
  id: number,
  name: string,
  effect: string,
  hpBoost?: number,
  hpMaxBoost?: number,
  mpBoost?: number,
  mpMaxBoost?: number,
  strBoost: number,
  intBoost: number,
  defBoost: number,
  resBoost: number,
  spdBoost: number,
  luckBoost: number,
  race: string[],
  class: string[],
  rarity: number,
  usable?: boolean,
  equipable?: boolean
};
