<template>
    <div class="wrapper">
        <div v-for="(option, index) in options">
            <input
                :id="`tab-${id}-${index}`"
                type="radio"
                :name="`tab-${id}`"
                :value="option"
                v-model="currentOption"
                class="radio-input"
            />
            <label :for="`tab-${id}-${index}`" class="label">{{ option }}</label>
        </div>
    </div>
</template>

<script setup lang="ts">
const _props = defineProps<{
    options: string[];
}>();

const id = Math.floor(Math.random() * 36 ** 5).toString(36);

const currentOption = defineModel<string>({ required: true });
</script>

<style scoped lang="scss">
@use "~/assets/base";

.wrapper {
    background-color: var(--background-light);
    border-radius: 1rem;
    padding: 0.75rem;

    display: flex;
    flex-flow: row wrap;
    gap: 0.5rem;
}

.radio-input {
    display: none;
}

.label {
    padding: 0.5rem 0.75rem;
    border-radius: 1rem;
    cursor: pointer;
}

.radio-input:checked + .label {
    background-color: base.$accent;
    color: whitesmoke;
}

.label:hover {
    background-color: var(--background-lighter);
}
</style>
