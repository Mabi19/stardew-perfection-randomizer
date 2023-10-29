<template>
    <Dialog title="Create a Profile" :open="open" @close="passEvent">
        <form @submit.prevent="submitForm">
            <ol class="task-list">
                <li>
                    <label for="template">Select the template</label>
                    <select id="template" v-model="template" autofocus>
                        <option value="standard">Standard Mode</option>
                        <option value="hardcore">Hardcore Mode</option>
                    </select>
                </li>
                <li>
                    <label for="profile-name">Name your profile</label>
                    <input
                        id="profile-name"
                        :placeholder="defaultProfileName"
                        maxlength="32"
                        v-model="profileName"
                        ref="nameInput"
                    />
                </li>
            </ol>
            <AppButton icon="add">Create</AppButton>
        </form>
    </Dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
    open: boolean;
    inProtectedArea: boolean;
}>();

const emit = defineEmits<{
    (event: "close"): void;
}>();

function passEvent() {
    emit("close");
}

const store = props.inProtectedArea ? useRandomizerStore() : null;

const template = ref("standard");
const profileName = ref("");

const defaultProfileName = computed(() => {
    const templateNames = {
        standard: "Standard",
        hardcore: "Hardcore",
    };

    // TODO: check current profiles to uniquify
    return `${
        templateNames[template.value as keyof typeof templateNames] || "<unknown>"
    } Randomizer`;
});

const nameInput = ref<HTMLInputElement | null>(null);

watch(profileName, () => {
    // TODO: check validity
    if (false) {
        nameInput.value?.setCustomValidity("Test invalid");
    } else {
        nameInput.value?.setCustomValidity("");
    }
});

function submitForm() {
    createProfile(store, {
        template: template.value,
        profileName: profileName.value || defaultProfileName.value,
    });
}
</script>

<style scoped lang="scss">
.task-list {
    padding-left: 0;
    margin-top: 0;

    display: flex;
    flex-flow: column nowrap;
    gap: 0.75rem;

    li {
        list-style-type: decimal;
        list-style-position: inside;

        select,
        input {
            margin-top: 0.2rem;
            display: block;
            width: 100%;
        }
    }
}
</style>
