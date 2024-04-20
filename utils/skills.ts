export const skills = ["farming", "mining", "foraging", "fishing", "combat"] as const;
export type Skill = (typeof skills)[number];

export const skillXPValues = [
    0, 100, 380, 770, 1300, 2150, 3300, 4800, 6900, 10000, 15000, 9999999,
] as const;
