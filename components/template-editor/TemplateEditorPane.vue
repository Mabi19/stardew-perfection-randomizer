<template>
    <div class="pane">
        <div class="header" v-if="goal">
            Editing <code>{{ goal.id }}</code>
        </div>
        <div class="pane-content" v-if="goal">
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
            <div class="xp" v-if="goal">
                <div class="pad-edges">
                    <span>
                        Implied XP:
                        <template v-if="Object.keys(goal.xp).length == 0">&lt;none&gt;</template>
                    </span>
                    <PlainIconButton
                        icon="add"
                        title="Add an XP requirement"
                        @click="newXPVisible = !newXPVisible"
                    />
                </div>
                <form
                    @submit.prevent="addXPRequirement"
                    class="sub-form"
                    v-if="newXPVisible"
                    ref="newXPForm"
                >
                    <div class="row">
                        <label for="new-xp-skill">Skill:</label>
                        <select id="new-xp-skill" v-model="newXPSkill" required>
                            <option value="">No skill selected!</option>
                            <option :value="skill" v-for="skill in newXPEligibleSkills">
                                {{ skill }}
                            </option>
                        </select>
                    </div>
                    <div class="row">
                        <label for="new-xp-amount">Points of XP:</label>
                        <input
                            id="new-xp-amount"
                            type="text"
                            inputmode="numeric"
                            v-model.number="newXPAmount"
                            pattern="[1-9][0-9]*"
                            class="xp-amount"
                            required
                        />
                    </div>
                    <div class="row">
                        <AppButton icon="add" type="positive" small>Add</AppButton>
                        <AppButton icon="block" type="destructive" small @click="cancelXPForm"
                            >Cancel</AppButton
                        >
                    </div>
                </form>
                <ul>
                    <li v-for="(amount, skill) in goal.xp" class="xp-entry">
                        <span>{{ skill }}: {{ amount }}</span>
                        <PlainIconButton
                            icon="delete"
                            @click="deleteXPRequirement(skill)"
                            title="Delete XP requirement"
                        />
                    </li>
                </ul>
            </div>
        </div>
        <div class="pane-content centered" v-else>Nothing selected</div>
        <!-- TODO: prerequisites -->
    </div>
</template>

<script setup lang="ts">
import type { Directive } from "vue";
import { debounce } from "lodash-es";

// TODO: make this all reactive and auto-save

defineExpose({ setBaseGoal });

const props = defineProps<{
    template: Template;
}>();

// get the form
const form = ref<HTMLFormElement | null>(null);

// template-derived helpers
const skills = computed(() => {
    const result: Record<string, { goalIndex: number }> = {};
    for (let i = 0; i < props.template.goals.length; i++) {
        const goal = props.template.goals[i];
        if (goal.id.startsWith("level:")) {
            result[goal.id.slice("level:".length)] = { goalIndex: i };
        }
    }
    return result;
});

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

const newXPVisible = ref(false);
const newXPForm = ref<HTMLFormElement | null>(null);
const newXPSkill = ref<string>("");
const newXPAmount = ref<number | string>("");
const newXPEligibleSkills = computed(() => {
    if (!goal.value) {
        return skills.value;
    } else {
        return Object.keys(skills.value).filter((skill) => !(skill in goal.value!.xp));
    }
});
function deleteXPRequirement(skill: string) {
    delete goal.value!.xp[skill];
}
function addXPRequirement() {
    if (!goal.value || !newXPSkill.value || typeof newXPAmount.value == "string") {
        return;
    }

    goal.value.xp[newXPSkill.value] = newXPAmount.value;

    newXPSkill.value = "";
    newXPAmount.value = "";
    newXPVisible.value = false;
}
function cancelXPForm() {
    newXPSkill.value = "";
    newXPAmount.value = "";
    newXPVisible.value = false;
}
</script>

<style scoped lang="scss">
@use "~/assets/base";

// TODO: mobile slide-out and stuff i think

.pane {
    width: 400px;

    background-color: var(--background-light);
    border-left: 2px solid var(--text-light);
}

.pane-content {
    padding: 1rem;
}

.centered {
    text-align: center;
}

.pad-edges {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
}

.header {
    padding: 1rem;
    background-color: base.$accent;
}

.row input {
    width: 20em;
}

.row input[type="number"],
.row .xp-amount {
    width: 5em;
}

.indent {
    margin-left: 0.75em;
}

.sub-form {
    border: 2px dashed var(--text);
    border-radius: 4px;
    padding: 0.5rem;
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
