<template>
    <AppDialog :title="`Edit ${goal?.id}`" :open="goal != null" @close="goal = null">
        <form @submit.prevent="test" v-if="goal" ref="form">
            <div class="row">
                <span>Name:</span>
                <input type="text" v-model="goal.name" required minlength="3" />
            </div>
            <div class="row">
                <span>Image URL:</span>
                <input type="url" v-model="goal.imageURL" placeholder="<none>" />
            </div>
            <div class="image-preview indent">
                <em>preview:</em>
                <img :src="goal.imageURL" alt="Icon preview" />
            </div>
            <div class="row">
                <span>Multiplicity:</span>
                <input type="number" v-model="goal.multiplicity" placeholder="1" min="1" max="99" />
            </div>
        </form>
        <!-- Outside the form to prevent automatic validation -->
        <!-- TODO: hide this in a -->
        <div class="xp" v-if="goal">
            <div>
                Implied XP:
                <template v-if="Object.keys(goal.xp).length == 0">&lt;none&gt;</template>
            </div>
            <ul>
                <li v-for="(amount, skill) in goal.xp" class="xp-entry">
                    <span>{{ skill }}: {{ amount }}</span>
                    <PlainIconButton icon="delete" @click="deleteXPRequirement(skill)" />
                </li>
            </ul>

            <details>
                <summary>Create XP requirement</summary>
                <fieldset>
                    <div class="row">
                        <label for="new-xp-skill">Skill:</label>
                        <select id="new-xp-skill">
                            <option :value="null">Choose a skill</option>
                            <option :value="skill" v-for="skill in skills">{{ skill }}</option>
                        </select>
                    </div>
                    <div class="row">
                        <label for="new-xp-multiplicity">Level:</label>
                        <input
                            id="new-xp-multiplicity"
                            type="number"
                            v-model="newXPMultiplicity"
                            placeholder="1"
                            min="1"
                            max="99"
                            class="amount"
                        />
                    </div>
                    <AppButton icon="add" type="positive" small>Add</AppButton>
                </fieldset>
            </details>
        </div>
        <!-- TODO: prerequisites -->
        <AppButton icon="save" @click="form?.requestSubmit()">Save</AppButton>
    </AppDialog>
</template>

<script setup lang="ts">
import type { Directive } from "vue";
import { debounce } from "lodash-es";

defineExpose({ setBaseGoal });

const props = defineProps<{
    template: Template;
}>();

// get the form
const form = ref<HTMLFormElement | null>(null);

// template-derived helpers
const skills = computed(() =>
    props.template.goals
        .filter((goal) => goal.id.startsWith("level:"))
        .map((goal) => goal.id.slice("level:".length)),
);

const vInvalid: Directive<HTMLInputElement, string | boolean> = (el, binding) => {
    if (typeof binding.value === "boolean") {
        el.setCustomValidity(binding.value ? "Value is invalid" : "");
    } else {
        el.setCustomValidity(binding.value);
    }

    el.reportValidity();
};

const goal = ref<Goal | null>(null);
const debouncedImageURL = ref("");
watch(
    () => goal.value?.imageURL,
    debounce(() => (debouncedImageURL.value = goal.value?.imageURL ?? ""), undefined, {}),
);

function setBaseGoal(newGoal: Goal) {
    // deep clone
    goal.value = JSON.parse(JSON.stringify(newGoal));
}

// editing actions

const newXPGoalID = ref("");
const newXPMultiplicity = ref<number | string>("");
function deleteXPRequirement(skill: string) {
    delete goal.value!.xp[skill];
}

function test() {
    alert("test called");
}
</script>

<style scoped lang="scss">
.row input {
    width: 20em;
}

.row input[type="number"] {
    width: 4em;
}

.indent {
    margin-left: 0.75em;
}

.image-preview {
    * {
        vertical-align: middle;
    }
    img {
        margin-left: 0.5em;
        height: 1.5em;
    }
}

.xp {
    margin: 0.5rem 0;

    ul {
        margin: 0;
    }
}

.xp-entry {
    & > * {
        vertical-align: middle;
    }
}
</style>
