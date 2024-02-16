<template>
    <AppDialog :title="`Edit ${goal?.id}`" :open="goal != null" @close="goal = null">
        <form @submit.prevent="test" v-if="goal">
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
            <div class="xp">
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
                <!-- TODO: adding XP requirements -->
            </div>
            <!-- TODO: prerequisites -->

            <AppButton icon="save">Save</AppButton>
        </form>
    </AppDialog>
</template>

<script setup lang="ts">
import type { Directive } from "vue";

defineExpose({ setBaseGoal });

const props = defineProps<{
    template: Template;
}>();

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

.xp ul {
    margin: 0;
}

.xp-entry {
    & > * {
        vertical-align: middle;
    }
}
</style>
