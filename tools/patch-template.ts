/// <reference lib="deno.ns" />
/// <reference lib="dom" />

import type { PrerequisiteGroup, Template, TemplateGoal } from "../utils/goals.ts";
import { validateTemplate } from "../utils/validate.ts";
import { convertNameToID } from "./utils.ts";

if (Deno.args.length < 2) {
    console.log("Usage: patch-template <input template> <output path>");
}

const inPath = Deno.args[0];
const outPath = Deno.args[1];

const data: Template = JSON.parse(await Deno.readTextFile(inPath));

function findGoalIndex(template: Template, id: string) {
    const idx = template.goals.findIndex((goal) => goal.id == id);
    if (idx == -1) {
        throw new Error(`Can't find goal ${id}`);
    }
    return idx;
}

function insertGoalsAfter(template: Template, after: string, newGoals: TemplateGoal[]) {
    const idx = findGoalIndex(template, after) + 1;
    template.goals.splice(idx, 0, ...newGoals);
}

// Prevent XP and XP-related goals from being added to standard templates.
function guardXP<T, U = Record<string | number | symbol, never>>(
    template: Template,
    data: T,
    nonXP: U = {} as U,
): T | U {
    if (template.ruleset == "hardcore") {
        return data;
    } else {
        return nonXP;
    }
}

// new tag
const tutorialFish = [
    "catch_a_pufferfish",
    "catch_an_anchovy",
    "catch_a_tuna",
    "catch_a_sardine",
    "catch_a_bream",
    "catch_a_largemouth_bass",
    "catch_a_smallmouth_bass",
    "catch_a_rainbow_trout",
    "catch_a_salmon",
    "catch_a_walleye",
    "catch_a_perch",
    "catch_a_carp",
    "catch_a_catfish",
    "catch_a_pike",
    "catch_a_sunfish",
    "catch_a_red_mullet",
    "catch_a_herring",
    "catch_an_eel",
    "catch_an_octopus",
    "catch_a_red_snapper",
    "catch_a_squid",
    // These fish do not participate in the tutorial, but can dismiss it
    // So they're functionally the same as all the above fish
    "catch_a_clam",
    "catch_a_lobster",
    "catch_a_crayfish",
    "catch_a_crab",
    "catch_a_cockle",
    "catch_a_mussel",
    "catch_a_shrimp",
    "catch_a_snail",
    "catch_a_periwinkle",
    "catch_an_oyster",
];

const nonTutorialFish = new Set([
    "catch_a_sea_cucumber",
    "catch_a_super_cucumber",
    "catch_a_ghostfish",
    "catch_a_stonefish",
    "catch_an_ice_pip",
    "catch_a_lava_eel",
    "catch_a_sandfish",
    "catch_a_scorpion_carp",
    "catch_a_flounder",
    "catch_a_midnight_carp",
    "catch_a_sturgeon",
    "catch_a_tiger_trout",
    "catch_a_bullhead",
    "catch_a_tilapia",
    "catch_a_chub",
    "catch_a_dorado",
    "catch_an_albacore",
    "catch_a_shad",
    "catch_a_lingcod",
    "catch_a_halibut",
    "catch_a_woodskip",
    "catch_a_void_salmon",
    "catch_a_slimejack",
    "catch_a_stingray",
    "catch_a_lionfish",
    "catch_a_blue_discus",
    "catch_a_midnight_squid",
    "catch_a_spook_fish",
    "catch_a_blobfish",
    "catch_the_crimsonfish",
    "catch_the_angler",
    "catch_the_legend",
    "catch_the_glacierfish",
    "catch_the_mutant_carp",
    "catch_a_goby",

    "catch_seaweed",
    "catch_green_algae",
    "catch_white_algae",
    "catch_sea_jelly",
    "catch_river_jelly",
    "catch_cave_jelly",
]);

data.tags["tutorial_fish"] = tutorialFish;

// masteries
insertGoalsAfter(
    data,
    "catch_white_algae",
    ["Farming", "Mining", "Foraging", "Fishing", "Combat"].map((skill) => ({
        id: `achieve_${skill.toLowerCase()}_mastery`,
        name: `Achieve ${skill} Mastery`,
        prerequisites: guardXP(data, {
            all: [
                { goal: "level:farming", multiplicity: 10 },
                { goal: "level:mining", multiplicity: 10 },
                { goal: "level:foraging", multiplicity: 10 },
                { goal: "level:fishing", multiplicity: 10 },
                { goal: "level:combat", multiplicity: 10 },
            ],
        }),
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/d/df/Mastery_Icon.png",
        multiplicity: 1,
        xp: {},
    })),
);

// add new fish
insertGoalsAfter(data, "catch_the_mutant_carp", [
    {
        id: "catch_a_clam",
        name: "Catch a Clam",
        prerequisites: guardXP(data, { all: [{ goal: "level:fishing", multiplicity: 3 }] }),
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/e/ed/Clam.png",
        multiplicity: 1,
        xp: guardXP(data, { fishing: 5 }),
    },
]);
insertGoalsAfter(data, "catch_a_blobfish", [
    {
        id: "catch_a_goby",
        name: "Catch a Goby",
        prerequisites: {},
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/6/67/Goby.png",
        multiplicity: 1,
        xp: guardXP(data, { fishing: 33 }),
    },
]);
insertGoalsAfter(data, "catch_white_algae", [
    {
        id: "catch_sea_jelly",
        name: "Catch Sea Jelly",
        prerequisites: {},
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/d/d5/Sea_Jelly.png",
        multiplicity: 1,
        xp: guardXP(data, { fishing: 3 }),
    },
    {
        id: "catch_river_jelly",
        name: "Catch River Jelly",
        prerequisites: {},
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/8/80/River_Jelly.png",
        multiplicity: 1,
        xp: guardXP(data, { fishing: 3 }),
    },
    {
        id: "catch_cave_jelly",
        name: "Catch Cave Jelly",
        prerequisites: {},
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/0/0a/Cave_Jelly.png",
        multiplicity: 1,
        xp: guardXP(data, { fishing: 3 }),
    },
]);

// remove "Ship a Clam"
data.goals.splice(findGoalIndex(data, "ship_a_clam"), 1);

// craftables
insertGoalsAfter(data, "craft_magic_bait", [
    {
        id: "craft_deluxe_bait",
        name: "Craft Deluxe Bait",
        prerequisites: guardXP(data, {
            all: [{ goal: "level:fishing", multiplicity: 4 }],
        }),
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/4/43/Deluxe_Bait.png",
        multiplicity: 1,
        xp: {},
    },
    {
        id: "craft_challenge_bait",
        name: "Craft Challenge Bait",
        prerequisites: { all: [{ goal: "achieve_fishing_mastery" }] },
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/9/96/Challenge_Bait.png",
        multiplicity: 1,
        xp: {},
    },
]);
insertGoalsAfter(data, "craft_a_worm_bin", [
    {
        id: "craft_a_deluxe_worm_bin",
        name: "Craft a Deluxe Worm Bin",
        prerequisites: guardXP(
            data,
            {
                all: [{ goal: "craft_a_worm_bin" }, { goal: "level:fishing", multiplicity: 8 }],
            },
            { all: [{ goal: "craft_a_worm_bin" }] },
        ),
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/e/ea/Deluxe_Worm_Bin.png",
        multiplicity: 1,
        xp: {},
    },
    {
        id: "craft_a_bait_maker",
        name: "Craft a Bait Maker",
        prerequisites: guardXP(data, {
            all: [{ goal: "level:fishing", multiplicity: 6 }],
        }),
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/c/c0/Bait_Maker.png",
        multiplicity: 1,
        xp: {},
    },
]);

insertGoalsAfter(data, "craft_a_stone_chest", [
    {
        id: "craft_a_big_chest",
        name: "Craft a Big Chest",
        prerequisites: {},
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/8/89/Big_Chest.png",
        multiplicity: 1,
        xp: {},
    },
    {
        id: "craft_a_big_stone_chest",
        name: "Craft a Big Stone Chest",
        prerequisites: {},
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/a/a6/Big_Stone_Chest.png",
        multiplicity: 1,
        xp: {},
    },
]);

insertGoalsAfter(data, "craft_a_dark_sign", [
    {
        id: "craft_a_text_sign",
        name: "Craft a Text Sign",
        prerequisites: {},
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/9/93/Text_Sign.png",
        multiplicity: 1,
        xp: {},
    },
]);

insertGoalsAfter(data, "craft_a_heavy_tapper", [
    {
        id: "craft_a_mushroom_log",
        name: "Craft a Mushroom Log",
        prerequisites: guardXP(data, { all: [{ goal: "level:foraging", multiplicity: 4 }] }),
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/3/39/Mushroom_Log.png",
        multiplicity: 1,
        xp: {},
    },
]);

insertGoalsAfter(data, "craft_a_cookout_kit", [
    {
        id: "craft_a_tent_kit",
        name: "Craft a Tent Kit",
        prerequisites: guardXP(data, { all: [{ goal: "level:foraging", multiplicity: 8 }] }),
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/0/05/Tent_Kit.png",
        multiplicity: 1,
        xp: {},
    },
]);

insertGoalsAfter(data, "craft_a_barbed_hook", [
    {
        id: "craft_a_sonar_bobber",
        name: "Craft a Sonar Bobber",
        prerequisites: guardXP(data, { all: [{ goal: "level:fishing", multiplicity: 6 }] }),
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/3/33/Sonar_Bobber.png",
        multiplicity: 1,
        xp: {},
    },
]);

insertGoalsAfter(data, "craft_a_cask", [
    {
        id: "craft_a_fish_smoker",
        name: "Craft a Fish Smoker",
        prerequisites:
            // Hardcore only: get the jellies through pet gifts
            // BUT: Getting the River Jelly from a cat is horrifically jank, and is not possible on some save files without catching fish.
            // Turtles are not subject to this weakness.
            data.ruleset == "hardcore"
                ? {
                      all: [{ goal: "catch_river_jelly" }],
                  }
                : {
                      all: [
                          { goal: "catch_sea_jelly" },
                          { goal: "catch_river_jelly" },
                          { goal: "catch_cave_jelly" },
                      ],
                  },
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/7/79/Fish_Smoker.png",
        multiplicity: 1,
        xp: {},
    },
    {
        id: "craft_a_dehydrator",
        name: "Craft a Dehydrator",
        prerequisites: {},
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/0/02/Dehydrator.png",
        multiplicity: 1,
        xp: {},
    },
]);

// mastery craftables
insertGoalsAfter(data, "craft_a_tent_kit", [
    {
        id: "craft_an_anvil",
        name: "Craft an Anvil",
        prerequisites: { all: [{ goal: "achieve_combat_mastery" }] },
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/d/dd/Anvil.png",
        multiplicity: 1,
        xp: {},
    },
    {
        id: "craft_a_miniforge",
        name: "Craft a Mini-Forge",
        prerequisites:
            data.ruleset == "hardcore"
                ? { all: [{ goal: "achieve_combat_mastery" }] }
                : {
                      all: [
                          { goal: "achieve_combat_mastery" },
                          { goal: "complete_the_community_center" },
                      ],
                  },
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/6/6c/Mini-Forge.png",
        multiplicity: 1,
        xp: {},
    },
    {
        id: "craft_a_statue_of_blessings",
        name: "Craft a Statue of Blessings",
        prerequisites: { all: [{ goal: "achieve_farming_mastery" }] },
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/e/e9/Statue_Of_Blessings.png",
        multiplicity: 1,
        xp: {},
    },
    {
        id: "craft_a_statue_of_the_dwarf_king",
        name: "Craft a Statue of the Dwarf King",
        prerequisites: { all: [{ goal: "achieve_mining_mastery" }] },
        imageURL:
            "https://stardewvalleywiki.com/mediawiki/images/e/e4/Statue_Of_The_Dwarf_King.png",
        multiplicity: 1,
        xp: {},
    },
]);

insertGoalsAfter(data, "craft_an_island_warp_totem", [
    {
        id: "craft_a_treasure_totem",
        name: "Craft a Treasure Totem",
        prerequisites: { all: [{ goal: "craft_a_mystic_tree_seed" }, { goal: "craft_a_tapper" }] },
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/0/06/Treasure_Totem.png",
        multiplicity: 1,
        xp: {},
    },
]);

insertGoalsAfter(data, "craft_a_furnace", [
    {
        id: "craft_a_heavy_furnace",
        name: "Craft a Heavy Furnace",
        prerequisites: { all: [{ goal: "achieve_mining_mastery" }, { goal: "craft_a_furnace" }] },
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/a/a9/Heavy_Furnace.png",
        multiplicity: 1,
        xp: {},
    },
]);

insertGoalsAfter(data, "craft_fiber_seeds", [
    {
        id: "craft_a_mystic_tree_seed",
        name: "Craft a Mystic Tree Seed",
        prerequisites: { all: [{ goal: "achieve_foraging_mastery" }] },
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/f/ff/Mystic_Tree_Seed.png",
        multiplicity: 1,
        xp: {},
    },
]);

// the singular new walnut room item
insertGoalsAfter(data, "craft_a_grass_starter", [
    {
        id: "craft_a_blue_grass_starter",
        name: "Craft a Blue Grass Starter",
        prerequisites: {
            all: [
                { goal: "enter_the_walnut_room" },
                { goal: "craft_a_mystic_tree_seed" },
                { goal: "craft_a_tapper" },
            ],
        },
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/1/18/Blue_Grass_Starter.png",
        multiplicity: 1,
        xp: {},
    },
]);

// the singular cooking recipe
insertGoalsAfter(data, "cook_squid_ink_ravioli", [
    {
        id: "cook_moss_soup",
        name: "Cook Moss Soup",
        prerequisites: guardXP(data, { all: [{ goal: "level:foraging", multiplicity: 3 }] }),
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/d/df/Moss_Soup.png",
        multiplicity: 1,
        xp: {},
    },
]);

// shippables
// all the new ones are at the end of the shipping collection
insertGoalsAfter(data, "ship_a_radioactive_bar", [
    {
        id: "ship_smoked_fish",
        name: "Ship Smoked Fish",
        prerequisites: { all: [{ goal: "craft_a_fish_smoker" }] },
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/4/4c/Smoked_Fish.png",
        multiplicity: 1,
        xp: {},
    },
    {
        id: "ship_moss",
        name: "Ship Moss",
        prerequisites: {},
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/6/64/Moss.png",
        multiplicity: 1,
        xp: {},
    },
    {
        id: "ship_mystic_syrup",
        name: "Ship Mystic Syrup",
        prerequisites: { all: [{ goal: "craft_a_tapper" }, { goal: "craft_a_mystic_tree_seed" }] },
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/5/5a/Mystic_Syrup.png",
        multiplicity: 1,
        xp: {},
    },
    {
        id: "ship_raisins",
        name: "Ship Raisins",
        prerequisites: { all: [{ goal: "craft_a_dehydrator" }] },
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/0/06/Raisins.png",
        multiplicity: 1,
        xp: {},
    },
    {
        id: "ship_dried_fruit",
        name: "Ship Dried Fruit",
        prerequisites: { all: [{ goal: "craft_a_dehydrator" }] },
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/6/66/Dried_Fruit.png",
        multiplicity: 1,
        xp: {},
    },
    {
        id: "ship_dried_mushrooms",
        name: "Ship Dried Mushrooms",
        prerequisites: { all: [{ goal: "craft_a_dehydrator" }] },
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/1/1a/Dried_Mushrooms.png",
        multiplicity: 1,
        xp: {},
    },
    {
        id: "ship_a_carrot",
        name: "Ship a Carrot",
        prerequisites: {},
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/c/c3/Carrot.png",
        multiplicity: 1,
        xp: {},
    },
    {
        id: "ship_a_summer_squash",
        name: "Ship a Summer Squash",
        prerequisites: {},
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/4/43/Summer_Squash.png",
        multiplicity: 1,
        xp: {},
    },
    {
        id: "ship_broccoli",
        name: "Ship Broccoli",
        prerequisites: {},
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/f/f1/Broccoli.png",
        multiplicity: 1,
        xp: {},
    },
    {
        id: "ship_a_powdermelon",
        name: "Ship a Powdermelon",
        prerequisites: {},
        imageURL: "https://stardewvalleywiki.com/mediawiki/images/a/aa/Powdermelon.png",
        multiplicity: 1,
        xp: {},
    },
]);

// Hardcore only goals
if (data.ruleset == "hardcore") {
    insertGoalsAfter(
        data,
        "forge_an_infinity_weapon",
        [
            {
                name: "Price Catalogue",
                image: "https://stardewvalleywiki.com/mediawiki/images/d/d5/Price_Catalogue.png",
            },
            {
                name: "Mapping Cave Systems",
                image: "https://stardewvalleywiki.com/mediawiki/images/6/6e/Mapping_Cave_Systems.png",
            },
            {
                name: "Way of the Wind pt. 1",
                image: "https://stardewvalleywiki.com/mediawiki/images/8/87/Way_Of_The_Wind_pt._1.png",
            },
            {
                name: "Way of the Wind pt. 2",
                image: "https://stardewvalleywiki.com/mediawiki/images/c/c7/Way_Of_The_Wind_pt._2.png",
            },
            {
                name: "Monster Compendium",
                image: "https://stardewvalleywiki.com/mediawiki/images/1/15/Monster_Compendium.png",
            },
            {
                name: "Friendship 101",
                image: "https://stardewvalleywiki.com/mediawiki/images/b/b7/Friendship_101.png",
            },
            {
                name: "Jack Be Nimble, Jack Be Thick",
                image: "https://stardewvalleywiki.com/mediawiki/images/c/c2/Jack_Be_Nimble%2C_Jack_Be_Thick.png",
            },
            {
                name: "Woody's Secret",
                image: "https://stardewvalleywiki.com/mediawiki/images/8/8b/Woody%27s_Secret.png",
            },
            {
                name: "Raccoon Journal",
                image: "https://stardewvalleywiki.com/mediawiki/images/1/1b/Ways_Of_The_Wild.png",
            },
            {
                name: "Jewels of the Sea",
                image: "https://stardewvalleywiki.com/mediawiki/images/7/7d/Jewels_Of_The_Sea.png",
            },
            {
                name: "Dwarvish Safety Manual",
                image: "https://stardewvalleywiki.com/mediawiki/images/a/a7/Dwarvish_Safety_Manual.png",
            },
            {
                name: "The Art o' Crabbing",
                image: "https://stardewvalleywiki.com/mediawiki/images/c/c6/The_Art_O%27_Crabbing.png",
            },
            {
                name: "The Alleyway Buffet",
                image: "https://stardewvalleywiki.com/mediawiki/images/3/3a/The_Alleyway_Buffet.png",
            },
            {
                name: "The Diamond Hunter",
                image: "https://stardewvalleywiki.com/mediawiki/images/a/a7/The_Diamond_Hunter.png",
            },
            {
                name: "Book of Mysteries",
                image: "https://stardewvalleywiki.com/mediawiki/images/d/df/Book_of_Mysteries.png",
            },
            {
                name: "Horse: The Book",
                image: "https://stardewvalleywiki.com/mediawiki/images/4/45/Horse_The_Book.png",
            },
            {
                name: "Treasure Appraisal Guide",
                image: "https://stardewvalleywiki.com/mediawiki/images/0/02/Treasure_Appraisal_Guide.png",
            },
            {
                name: "Ol' Slitherlegs",
                image: "https://stardewvalleywiki.com/mediawiki/images/0/02/Ol%27_Slitherlegs.png",
            },
            {
                name: "Animal Catalogue",
                image: "https://stardewvalleywiki.com/mediawiki/images/d/df/Animal_Catalogue.png",
            },
        ].map((book) => {
            const isWOTW2 = book.name == "Way of the Wind pt. 2";
            const prerequisites = isWOTW2 ? { all: [{ goal: "read_way_of_the_wind_pt_1" }] } : {};
            return {
                id: `read_${convertNameToID(book.name)}`,
                name: `Read ${book.name}`,
                prerequisites,
                imageURL: book.image,
                multiplicity: 1,
                xp: {},
            };
        }),
    );

    insertGoalsAfter(data, "forge_an_infinity_weapon", [
        {
            id: "obtain_meowmere",
            name: "Obtain Meowmere",
            prerequisites: {},
            imageURL: "https://stardewvalleywiki.com/mediawiki/images/6/63/Meowmere.png",
            multiplicity: 1,
            xp: {},
        },
    ]);

    insertGoalsAfter(data, "upgrade_the_trash_can", [
        {
            id: "upgrade_the_pan",
            name: "Upgrade the Pan",
            prerequisites: {},
            imageURL: "https://stardewvalleywiki.com/mediawiki/images/7/71/Copper_Pan.png",
            multiplicity: 3,
            xp: {},
        },
    ]);
}

let prerequisitePatches: Record<string, PrerequisiteGroup>;
if (data.ruleset == "hardcore") {
    prerequisitePatches = {
        // 1.6 rebalances
        craft_a_charcoal_kiln: { all: [{ goal: "level:foraging", multiplicity: 2 }] },
        craft_a_cookout_kit: { all: [{ goal: "level:foraging", multiplicity: 3 }] },
        cook_a_survival_burger: { all: [{ goal: "level:foraging", multiplicity: 8 }] },
        craft_a_tapper: { all: [{ goal: "level:foraging", multiplicity: 4 }] },
        craft_a_worm_bin: { all: [{ goal: "level:fishing", multiplicity: 4 }] },
        // goals requiring Slay 80 Cave Insects, whose ID changed because there are less cave insects to kill
        craft_a_quality_bobber: {
            all: [{ goal: "slay_80_cave_insects" }],
        },
        craft_a_geode_crusher: {
            any: [
                {
                    goal: "slay_200_bats",
                },
                {
                    goal: "slay_500_dust_sprites",
                },
                {
                    goal: "slay_50_skeletons",
                },
                {
                    goal: "slay_80_cave_insects",
                },
            ],
        },
    };
} else {
    prerequisitePatches = {
        craft_a_quality_bobber: {
            all: [{ goal: "slay_80_cave_insects" }, { goal: "craft_a_furnace" }],
        },
        craft_a_geode_crusher: {
            all: [
                { goal: "craft_a_furnace" },
                {
                    any: [
                        {
                            goal: "slay_200_bats",
                        },
                        {
                            goal: "slay_500_dust_sprites",
                        },
                        {
                            goal: "slay_50_skeletons",
                        },
                        {
                            goal: "slay_80_cave_insects",
                        },
                    ],
                },
            ],
        },
    };
}

for (const goal of data.goals) {
    if (nonTutorialFish.has(goal.id)) {
        // add #tutorial_fish to prerequisites
        if (Object.keys(goal.prerequisites).length > 0) {
            if ("all" in goal.prerequisites) {
                goal.prerequisites.all?.push({ any: [{ goal: "#tutorial_fish" }] });
            } else {
                console.warn(
                    "Goal",
                    goal.id,
                    "has non-patchable prerequisites",
                    goal.prerequisites,
                );
            }
        } else {
            goal.prerequisites = { any: [{ goal: "#tutorial_fish" }] };
        }
    }

    // apply prerequisite patches
    if (goal.id in prerequisitePatches) {
        goal.prerequisites = prerequisitePatches[goal.id];
    }

    if (goal.id == "slay_125_cave_insects") {
        // ID change!
        goal.id = "slay_80_cave_insects";
        goal.name = "Slay 80 Cave Insects";
        if (data.ruleset == "hardcore") {
            goal.xp = { combat: 800 };
        }
    }

    if (goal.id == "craft_a_quality_bobber") {
        if (data.ruleset == "hardcore") {
            goal.xp = { combat: 200 };
        }
    }
}

// test if it validates
if (!validateTemplate(data)) {
    console.warn("Warning: Patched template does not validate");
}

await Deno.writeTextFile(outPath, JSON.stringify(data, undefined, 4));
