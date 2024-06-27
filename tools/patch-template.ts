/// <reference lib="deno.ns" />
/// <reference lib="dom" />

import type { Prerequisite, PrerequisiteGroup, Template, TemplateGoal } from "../utils/goals.ts";
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
                { any: [{ goal: "craft_a_tapper" }, { goal: "craft_a_heavy_tapper" }] },
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
        // Cook a Survival Burger: overridden later,
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
        // Cats can give fish for recipes now!
        cook_baked_fish: {},
        // Cook a Strange Bun: overridden later
        cook_carp_surprise: {},
        // Cook Salmon Dinner: overridden later
        cook_a_fish_taco: {
            all: [
                {
                    goal: "befriend_linus",
                },
                {
                    goal: "craft_a_mayonnaise_machine",
                },
            ],
        },
        cook_a_crispy_bass: {
            all: [{ goal: "befriend_kent" }],
        },
        cook_tom_kha_soup: {
            all: [{ goal: "befriend_sandy" }],
        },
        cook_trout_soup: {},
        // Cook Fish Stew: overridden later
        // Cook Escargot: overridden later
        cook_lobster_bisque: {},
        // Cook Shrimp Cocktail: overridden later
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

// Completing any of these goals allows for building a Junimo Hut.
const VOID_MAYO_OBTAINABLE: Prerequisite[] = [
    { goal: "#tutorial_fish" },
    { goal: "befriend_krobus" },
    { goal: "craft_a_mayonnaise_machine" },
];
const VOID_MAYO_PREREQUISITE = { any: VOID_MAYO_OBTAINABLE };
const VOID_MAYO_OR_CAROLINE = { any: [...VOID_MAYO_OBTAINABLE, { goal: "befriend_caroline" }] };

const voidMayoPatches: Record<string, PrerequisiteGroup> = {
    // non-quest void mayo is considered missable
    ship_void_mayonnaise: {
        any: [{ goal: "befriend_krobus" }, { goal: "craft_a_mayonnaise_machine" }],
    },
    cook_a_strange_bun: {
        all: [
            { goal: "befriend_shane" },
            { any: [{ goal: "befriend_krobus" }, { goal: "craft_a_mayonnaise_machine" }] },
        ],
    }, // Would be satisfied by Periwinkle, but (a) non-quest void mayo is considered missable, and (b) periwinkles are obtainable through cats

    ship_a_parsnip: VOID_MAYO_OR_CAROLINE,
    // Cook Parsnip Soup already requires Befriend Caroline, which is enough
    cook_a_farmers_lunch: {
        all: [{ goal: "level:farming", multiplicity: 3 }, VOID_MAYO_OR_CAROLINE],
    }, // Requires Parsnip
    ship_a_green_bean: VOID_MAYO_PREREQUISITE,
    cook_bean_hotpot: { all: [{ goal: "befriend_clint" }, VOID_MAYO_PREREQUISITE] }, // Requires Green Bean
    // Ship a Cauliflower: none (from Giant Crop)
    // Cook Cheese Cauliflower already requires Befriend Pam, which is enough
    ship_a_potato: VOID_MAYO_OR_CAROLINE,
    cook_hashbrowns: VOID_MAYO_OR_CAROLINE, // Requires Potato
    ship_garlic: VOID_MAYO_PREREQUISITE,
    cook_fiddlehead_risotto: VOID_MAYO_PREREQUISITE, // Requires Garlic
    cook_escargot: { all: [{ goal: "befriend_willy" }, VOID_MAYO_PREREQUISITE] }, // Requires Garlic. Would be satisfied by Snail, but those are obtainable through cats
    ship_kale: VOID_MAYO_PREREQUISITE,
    cook_stir_fry: VOID_MAYO_PREREQUISITE, // Requires Kale
    ship_rhubarb: VOID_MAYO_PREREQUISITE,
    cook_a_rhubarb_pie: { all: [{ goal: "befriend_marnie" }, VOID_MAYO_PREREQUISITE] }, // Requires Rhubarb
    // Ship a Melon: none (from Giant Crop)
    ship_a_tomato: VOID_MAYO_PREREQUISITE,
    cook_spaghetti: { all: [{ goal: "befriend_lewis" }, VOID_MAYO_PREREQUISITE] }, // Requires Tomato
    cook_a_pizza: VOID_MAYO_PREREQUISITE, // Requires Tomato
    cook_bruschetta: VOID_MAYO_PREREQUISITE, // Requires Tomato
    cook_fish_stew: { all: [{ goal: "befriend_willy" }, VOID_MAYO_PREREQUISITE] }, // Requires Tomato. Would be satisfied by Crayfish & Periwinkle, but those are obtainable through pets
    cook_squid_ink_ravioli: {
        all: [{ goal: "level:combat", multiplicity: 9 }, VOID_MAYO_PREREQUISITE],
    }, // Requires Tomato
    cook_shrimp_cocktail: VOID_MAYO_PREREQUISITE, // Requires Tomato. Would be satisfied by Shrimp, but those are obtainable through turtles
    ship_a_blueberry: VOID_MAYO_PREREQUISITE,
    cook_a_blueberry_tart: { all: [{ goal: "befriend_pierre" }, VOID_MAYO_PREREQUISITE] }, // Requires Blueberry
    cook_a_fruit_salad: VOID_MAYO_PREREQUISITE, // Requires Blueberry
    ship_a_hot_pepper: VOID_MAYO_PREREQUISITE,
    cook_pepper_poppers: { all: [{ goal: "befriend_shane" }, VOID_MAYO_PREREQUISITE] }, // Requires Hot Pepper
    // Cook a Spicy Eel: Requires Hot Pepper, satisfied by Eel
    ship_wheat: VOID_MAYO_PREREQUISITE,
    ship_a_radish: VOID_MAYO_PREREQUISITE,
    ship_a_red_cabbage: VOID_MAYO_PREREQUISITE,
    // Cook Coleslaw: Requires Red Cabbage, satisfied by Mayo
    // Cook a Fish Taco: Requires Red Cabbage, satisfied by Mayo
    cook_a_red_plate: { all: [{ goal: "befriend_emily" }, VOID_MAYO_PREREQUISITE] }, // Requires Red Cabbage & Radish
    // Ship a Starfruit: none (buy from Luau)
    ship_corn: VOID_MAYO_PREREQUISITE,
    cook_a_tortilla: VOID_MAYO_PREREQUISITE, // Requires Corn
    ship_unmilled_rice: VOID_MAYO_PREREQUISITE,
    ship_an_eggplant: VOID_MAYO_PREREQUISITE,
    cook_eggplant_parmesan: { all: [{ goal: "befriend_lewis" }, VOID_MAYO_PREREQUISITE] }, // Requires Eggplant & Tomato
    cook_a_survival_burger: {
        all: [{ goal: "level:foraging", multiplicity: 8 }, VOID_MAYO_PREREQUISITE],
    }, // Requires Eggplant
    ship_an_artichoke: VOID_MAYO_PREREQUISITE,
    cook_artichoke_dip: VOID_MAYO_PREREQUISITE, // Requires Artichoke
    ship_bok_choy: VOID_MAYO_PREREQUISITE,
    // Ship a Pumpkin: none (from Giant Crop)
    // Cook Autumn's Bounty: Pumpkin from Giant Crop, Yam from Duggy (10 XP)
    // Pumpkin Soup: Pumpkin from Giant Crop
    // Pumpkin Pie: Pumpkin from Giant Crop
    // Jack-o-Lantern: Pumpkin from Giant Crop
    // Ship a Yam: none (but 10 Combat XP)
    // Cook Glazed Yams: none (but 10 Combat XP)
    ship_cranberries: VOID_MAYO_PREREQUISITE,
    cook_a_super_meal: { all: [{ goal: "befriend_kent" }, VOID_MAYO_PREREQUISITE] }, // Requires Bok Choy, Cranberries & Artichoke
    cook_cranberry_sauce: { all: [{ goal: "befriend_gus" }, VOID_MAYO_PREREQUISITE] }, // Requires Cranberries
    cook_stuffing: { all: [{ goal: "befriend_pam" }, VOID_MAYO_PREREQUISITE] }, // Requires Cranberries
    cook_cranberry_candy: VOID_MAYO_PREREQUISITE, // Requires Cranberries
    ship_a_beet: VOID_MAYO_PREREQUISITE,
    cook_vegetable_medley: { all: [{ goal: "befriend_caroline" }, VOID_MAYO_PREREQUISITE] }, // Requires Tomato & Beet
    ship_amaranth: VOID_MAYO_PREREQUISITE,
    cook_a_salmon_dinner: { all: [{ goal: "befriend_gus" }, VOID_MAYO_PREREQUISITE] }, // Requires Amaranth & Kale. Would be satisfied by Salmon, but salmon is obtainable through cats
    ship_hops: VOID_MAYO_PREREQUISITE,
    ship_a_pale_ale: VOID_MAYO_PREREQUISITE, // Requires Hops
    ship_a_poppy: VOID_MAYO_PREREQUISITE,
    cook_a_poppyseed_muffin: VOID_MAYO_PREREQUISITE, // Requires Poppy
    ship_a_strawberry: VOID_MAYO_PREREQUISITE,
    ship_a_sweet_gem_berry: VOID_MAYO_PREREQUISITE,
    acquire_old_master_cannolis_stardrop: VOID_MAYO_PREREQUISITE, // Requires Sweet Gem Berry
    ship_a_sunflower: VOID_MAYO_PREREQUISITE,
    // Ship a Coffee Bean: none (but 2 Combat XP)
    ship_an_ancient_fruit: VOID_MAYO_PREREQUISITE,
    ship_a_tulip: VOID_MAYO_PREREQUISITE,
    ship_a_summer_spangle: VOID_MAYO_PREREQUISITE,
    ship_a_fairy_rose: VOID_MAYO_PREREQUISITE,
    ship_a_blue_jazz: VOID_MAYO_PREREQUISITE,
    // Cook a Lucky Lunch already requires Catch a Sea Cucumber, which is enough
    ship_a_carrot: VOID_MAYO_PREREQUISITE,
    ship_a_summer_squash: VOID_MAYO_PREREQUISITE,
    ship_broccoli: VOID_MAYO_PREREQUISITE,
    // Ship a Powdermelon: none (from Giant Crop)

    // Junimo Huts are required to get to Ginger Island.
    enter_the_walnut_room: VOID_MAYO_PREREQUISITE,
    // Finish Golden Walnuts: satisfied by Walnut Room
    ship_a_banana: VOID_MAYO_PREREQUISITE,
    ship_an_ostrich_egg: VOID_MAYO_PREREQUISITE,
    ship_ginger: VOID_MAYO_PREREQUISITE,
    ship_a_taro_root: VOID_MAYO_PREREQUISITE,
    ship_a_pineapple: VOID_MAYO_PREREQUISITE,
    ship_a_mango: VOID_MAYO_PREREQUISITE,
    ship_a_cinder_shard: VOID_MAYO_PREREQUISITE,
    build_an_island_obelisk: VOID_MAYO_PREREQUISITE,
    slay_150_magma_sprites: VOID_MAYO_PREREQUISITE,
    befriend_leo: VOID_MAYO_PREREQUISITE,
    cook_ginger_ale: VOID_MAYO_PREREQUISITE,
    cook_banana_pudding: VOID_MAYO_PREREQUISITE,
    // Cook Poi: satisfied by Befriend Leo
    // Cook Mango Sticky Rice: satisfied by Befriend Leo
    cook_tropical_curry: VOID_MAYO_PREREQUISITE,
    // Craft Deluxe Fertilizer: satisfied by Walnut Room
    // Craft Hyper Speed-Gro: satisfied by Walnut Room
    craft_deluxe_retaining_soil: VOID_MAYO_PREREQUISITE,
    // Craft a Blue Grass Starter: satisfied by Walnut Room
    // Craft Magic Bait: satisfied by Walnut Room
    craft_fairy_dust: VOID_MAYO_PREREQUISITE,
    craft_an_island_warp_totem: VOID_MAYO_PREREQUISITE,
    // Craft a Solar Panel: satisfied by its individual crops
    craft_an_ostrich_incubator: VOID_MAYO_PREREQUISITE,
    // Craft a Heavy Tappper: satisfied by Walnut Room
    // Craft a Hopper: satisfied by Walnut Room
    // Obtain a Horse Flute: satisfied by Walnut Room
    // Obtain the Key to the Town: satisfied by Walnut Room
    // Obtain Pierre's Missing Stocklist: satisfied by Walnut Room
    // Forge an Infinity Weapon: satisfied by Walnut Room
    read_the_diamond_hunter: VOID_MAYO_PREREQUISITE,
};

const voidMayoXPReqs: Record<string, Record<string, number>> = {
    ship_a_yam: { combat: 10 },
    cook_glazed_yams: { combat: 10 },
    cook_autumns_bounty: { combat: 10 },
    ship_a_coffee_bean: { combat: 2 },
};

const unappliedPrerequisitePatches = new Set(Object.keys(prerequisitePatches));
const unappliedVoidMayoPatches = new Set(Object.keys(voidMayoPatches));

const intersection = unappliedPrerequisitePatches.intersection(unappliedVoidMayoPatches);
if (intersection.size > 0) {
    console.warn("Patches overlap:", intersection);
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
        unappliedPrerequisitePatches.delete(goal.id);
    }

    if (data.ruleset == "hardcore") {
        if (goal.id in voidMayoPatches) {
            if (Object.keys(goal.prerequisites).length > 0) {
                console.warn(
                    `overriding for goal ${goal.id}:`,
                    goal.prerequisites,
                    "->",
                    voidMayoPatches[goal.id],
                );
            }
            unappliedVoidMayoPatches.delete(goal.id);
            goal.prerequisites = voidMayoPatches[goal.id];
        }
        if (goal.id in voidMayoXPReqs) {
            goal.xp = voidMayoXPReqs[goal.id];
        }
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

if (unappliedPrerequisitePatches.size > 0) {
    console.warn("Unapplied prerequisite patches:", unappliedPrerequisitePatches);
}

if (data.ruleset == "hardcore" && unappliedVoidMayoPatches.size > 0) {
    console.warn("Unapplied void mayo patches:", unappliedVoidMayoPatches);
}

// test if it validates
if (!validateTemplate(data)) {
    console.warn("Warning: Patched template does not validate");
}

await Deno.writeTextFile(outPath, JSON.stringify(data, undefined, 4));
