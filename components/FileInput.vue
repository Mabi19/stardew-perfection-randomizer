<template>
    <label
        for="file-input"
        class="file-input"
        :class="{ dragging: isDragging || file }"
        @drop.prevent="handleFileDrop"
        @dragover.prevent="isDragging = true"
        @dragenter="isDragging = true"
        @dragleave="isDragging = false"
    >
        <span v-if="file">{{ file.name }}</span
        ><span v-else><slot /></span>
    </label>
    <input
        type="file"
        id="file-input"
        class="file-input-internal"
        :accept
        @change="updateFileInput"
        ref="fileInput"
    />
</template>

<script setup lang="ts">
const props = defineProps<{
    accept?: string;
}>();

const emit = defineEmits<{
    change: [file: File | null];
}>();

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const file = ref<File | null>(null);

async function updateFileInput() {
    file.value = fileInput.value?.files?.item(0) ?? null;
}

async function handleFileDrop(event: DragEvent) {
    file.value = event.dataTransfer?.items?.[0]?.getAsFile() ?? null;
}

watch(file, () => {
    emit("change", file.value);
});
</script>

<style scoped lang="scss">
@use "~/assets/base";

.file-input-internal {
    opacity: 0;
    position: absolute;
    left: -9999px;
    top: -9999px;
}

.file-input {
    margin: auto;

    display: flex;
    flex-flow: column nowrap;
    justify-content: center;

    width: min(90vw, 30rem);
    background-color: #333;

    padding: 1rem;
    border: 4px dashed var(--text);
    border-radius: 0.75rem;

    cursor: pointer;

    text-align: center;

    &::before {
        font-family: "Material Icons";
        content: "file_upload";
        font-size: 3rem;
    }

    &.dragging {
        border-color: base.$secondary-green;
    }
}
</style>
