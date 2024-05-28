<template>
    <AppDialog :open @close="passFinishEvent" title="Update XP predictions">
        <p class="explanation">
            To update the XP predictions, select the file that looks like "FarmName_123456789" or
            "SaveGameInfo" from your
            <a href="https://stardewvalleywiki.com/Saves#Find_your_save_files">save folder</a>.
        </p>
        <form @submit.prevent="submitForm">
            <FileInput @change="updateFile">Choose a Stardew Valley save file...</FileInput>
            <div v-if="error" class="parse-output">{{ error }}</div>
            <div v-if="parsedData" class="parse-output">
                <div v-if="parsedData.length == 1">
                    Parsed data for <strong>{{ parsedData[0]!.name }}</strong
                    >!
                </div>
                <div v-else>
                    This save file contains multiple farmhands. Choose whose XP to import:
                    <select v-model="chosenFarmhandIndex">
                        <option :value="null">Select a farmhand...</option>
                        <option :value="idx" v-for="(data, idx) of parsedData">
                            {{ data.name }}
                        </option>
                    </select>
                </div>
            </div>
            <AppButton
                icon="done"
                :disabled="!parsedData || (parsedData.length > 1 && chosenFarmhandIndex == null)"
                >Confirm</AppButton
            >
        </form>
    </AppDialog>
</template>

<script setup lang="ts">
const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits<{
    finish: [];
}>();

const randomizer = useRandomizerStore();

const file = ref<File | null>(null);
const fileContents = ref<string | null>(null);
async function updateFile(newFile: File | null) {
    file.value = newFile;
    fileContents.value = (await file.value?.text()) ?? null;
}

interface FarmerEntry {
    name: string;
    xp: Record<string, number>;
}

const parsedData = ref<FarmerEntry[] | null>(null);
const error = ref<string | null>(null);
const chosenFarmhandIndex = ref<number | null>(null);

function passFinishEvent() {
    emit("finish");
}

watch(
    () => props.open,
    () => {
        parsedData.value = null;
        error.value = null;
        chosenFarmhandIndex.value = null;
    },
);

watch(parsedData, () => {
    chosenFarmhandIndex.value = null;
});

watch(fileContents, () => {
    if (!fileContents.value) {
        return;
    }

    error.value = null;

    function parseFarmer(farmerNode: ParentNode) {
        const name = farmerNode.querySelector("name")!.textContent;
        if (!name) {
            throw new Error("Couldn't parse Farmer object");
        }

        const xpTag = farmerNode.querySelector("experiencePoints");
        if (!xpTag) throw new Error("Can't find XP data");
        const xpValues = Array.from(xpTag.children).map((node) =>
            parseInt(node.textContent ?? throwError(new Error("Can't find XP data"))),
        );
        // includes unused "Luck" skill
        if (xpValues.length != 6) {
            throw new Error("Bad amount of skills");
        }
        const skillNames = ["farming", "fishing", "foraging", "mining", "combat", "luck"];
        const xp: Record<string, number> = {};
        for (let i = 0; i < xpValues.length; i++) {
            if (xpValues[i]) {
                xp[skillNames[i]!] = xpValues[i]!;
            }
        }
        return { name, xp };
    }

    function walkElementChain(
        elem: Element,
        chain: { name: string; attributes?: { ns: string; name: string; value: string }[] }[],
    ): Element | null {
        for (const part of chain) {
            let found = false;
            for (const child of elem.children) {
                if (child.nodeName != part.name) {
                    continue;
                }

                let failed = false;
                if (part.attributes) {
                    for (const testAttr of part.attributes) {
                        if (child.getAttributeNS(testAttr.ns, testAttr.name) != testAttr.value) {
                            failed = true;
                        }
                    }
                }

                if (failed) {
                    continue;
                }

                // success!
                elem = child;
                found = true;
                break;
            }

            if (!found) {
                return null;
            }
        }

        return elem;
    }

    const xsiNS = "http://www.w3.org/2001/XMLSchema-instance";

    // for SaveGameInfo: top level Farmer tag has <experiencePoints>
    // FarmName_123456789: top level <player> tag has <experiencePoints>, farmhands are stored in cabins
    // (locations > GameLocation[xsi:type="Farm"] > buildings > Building > indoors[xsi:type="Cabin"] > farmhand)
    try {
        const parser = new DOMParser();
        console.time("parsing XML");
        const doc = parser.parseFromString(fileContents.value, "application/xml");
        console.timeEnd("parsing XML");

        if (doc.documentElement.nodeName == "Farmer") {
            console.log("SaveGameInfo");
            parsedData.value = [parseFarmer(doc.documentElement)];
        } else {
            console.log("regular save data");
            const mainFarmer = doc.querySelector("SaveGame > player");
            if (!mainFarmer) {
                throw new Error("Couldn't parse save file");
            }

            const buildings = walkElementChain(doc.documentElement, [
                { name: "locations" },
                {
                    name: "GameLocation",
                    attributes: [
                        {
                            ns: xsiNS,
                            name: "type",
                            value: "Farm",
                        },
                    ],
                },
                { name: "buildings" },
            ]);

            if (!buildings) {
                return parseFarmer(mainFarmer);
            }

            const cabins = Array.from(buildings.children).filter(
                (building) =>
                    building.querySelector("indoors")?.getAttributeNS(xsiNS, "type") == "Cabin" &&
                    building.querySelector("indoors > farmhand"),
            );

            const parsedFarmhands = Array.from(cabins).map((cabin) =>
                parseFarmer(cabin.querySelector("indoors > farmhand")!),
            );

            parsedData.value = [parseFarmer(mainFarmer), ...parsedFarmhands];
        }
    } catch (e) {
        parsedData.value = null;
        error.value = e instanceof Error ? e.message : "An error occurred";
        console.log(e);
    }
});

function submitForm() {
    const newXPValues =
        parsedData.value?.[chosenFarmhandIndex.value ?? 0]?.xp ??
        throwError(new Error("New XP prediction is null"));

    randomizer.predictedSkillXP = newXPValues;

    for (const [skill, xp] of Object.entries(newXPValues)) {
        if (`level:${skill}` in randomizer.completion) {
            randomizer.completion[`level:${skill}`] = skillXPToLevel(xp).level;
        }
    }

    passFinishEvent();
}
</script>

<style scoped lang="scss">
.explanation {
    margin-top: 0;
}

.parse-output {
    margin: 0.5rem 0;
}
</style>
