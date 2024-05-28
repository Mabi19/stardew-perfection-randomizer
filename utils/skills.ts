export const skills = ["farming", "mining", "foraging", "fishing", "combat"] as const;
export type Skill = (typeof skills)[number];

export const skillXPValues = [
    0, 100, 380, 770, 1300, 2150, 3300, 4800, 6900, 10000, 15000, 999999999,
] as const;

export function skillXPToLevel(xp: number) {
    let level = 0;
    while ((skillXPValues[level] ?? 15000) <= xp) {
        level++;
    }
    level--;
    level = Math.min(level, 10);
    let remaining = null;
    if (level < 10) {
        remaining = skillXPValues[level + 1]! - xp;
    }
    return { level, remaining };
}
