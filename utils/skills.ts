export const skills = [
    "farming",
    "mining",
    "foraging",
    "fishing",
    "combat",
] as const;
export type Skill = (typeof skills)[number];
