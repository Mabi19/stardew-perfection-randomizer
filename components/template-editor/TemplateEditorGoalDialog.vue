<template>
    <AppDialog :title="`Edit ${goal?.id}`" :open="goal != null" @close="goal = null">
        <form @submit.prevent="test">
            <div class="row">
                <span>Test value</span>
                <input v-model="testValue" minlength="3" required />
            </div>
            <AppButton icon="save">Save</AppButton>
        </form>
    </AppDialog>
</template>

<script setup lang="ts">
import type { Directive } from "vue";

const props = defineProps<{
    template: Template;
}>();

defineExpose({ setBaseGoal });

const vInvalid: Directive<HTMLInputElement, string | boolean> = (el, binding) => {
    if (typeof binding.value === "boolean") {
        el.setCustomValidity(binding.value ? "Value is invalid" : "");
    } else {
        el.setCustomValidity(binding.value);
    }

    el.reportValidity();
};

const goal = ref<Goal | null>(null);
// This ID does not count for collisions
const initialID = ref("");

function setBaseGoal(newGoal: Goal) {
    goal.value = newGoal;
    initialID.value = newGoal.id;
}

const testValue = ref("");

function test() {
    alert("test called");
}
</script>
