<template>
    <p>
        The Randomizer is a Stardew Valley challenge, originally created by
        <NuxtLink to="https://www.youtube.com/@ArgonMatrix">ArgonMatrix</NuxtLink>, where the goal
        is to complete Perfection - one goal at a time, in a randomly decided order!
    </p>
    <p>
        There are two rulesets: Standard and Hardcore. In both rulesets, you must adhere to the
        order the Randomizer gives you (that is, not do goals out of order).
        <NuxtLink
            to="https://docs.google.com/document/d/1eu1PWh9xQ46SOiqoCPrO1E9AzS56V-u0KHSYXiY568s"
        >
            You can find the rules described in more detail here.
        </NuxtLink>
    </p>
    <table class="comparison">
        <thead>
            <tr>
                <th>Standard Mode</th>
                <th>Hardcore Mode</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>A more casual experience</td>
                <td>Requires extensive game knowledge</td>
            </tr>
            <tr>
                <td>Minimizes excessive grinds</td>
                <td>Will take a very long time</td>
            </tr>
            <tr>
                <td>Strictly Perfection (481 total goals)</td>
                <td>Perfection + extra tasks (564 total goals)</td>
            </tr>
            <tr>
                <td>Gain skill levels and upgrade your tools freely</td>
                <td>Gaining skills and upgrading tools is restricted by goals</td>
            </tr>
        </tbody>
    </table>
    <p>Ready to take the challenge?</p>
    <div class="start">
        <AppButton @click="showCreateDialog" icon="start">Start your adventure!</AppButton>
        <AppButton @click="showImportDialog" icon="file_upload">Import data</AppButton>
    </div>

    <ProfileCreateDialog :open="createDialogOpen" @close="createDialogOpen = false" />
    <DataImportDialog :open="importDialogOpen" @close="importDialogOpen = false" />
</template>

<script setup lang="ts">
definePageMeta({
    layout: "homepage",
});

const createDialogOpen = ref(false);
const importDialogOpen = ref(false);

function showCreateDialog() {
    createDialogOpen.value = true;
}

function showImportDialog() {
    importDialogOpen.value = true;
}
</script>

<style scoped lang="scss">
.comparison {
    margin: auto;

    // border: 1px solid black;
    outline: 1px solid black;
    border-collapse: collapse;

    max-width: 100%;

    th {
        padding: 0.5rem;
        background-color: rgb(195, 152, 231);
        text-align: center;
    }

    th:not(:last-child) {
        border-right: 1px solid black;
    }

    td {
        padding: 0.5rem;
        text-align: center;
        border: 1px solid rgb(150, 150, 150);
    }

    tr:nth-child(2n) {
        background-color: rgb(191, 236, 191);
    }

    tr:nth-child(2n + 1) {
        background-color: rgb(207, 245, 207);
    }
}

.dark-theme {
    .comparison {
        outline: 1px solid whitesmoke;

        th {
            background-color: rgb(112, 86, 134);
        }

        th:not(:last-child) {
            border-right-color: whitesmoke;
        }

        tr:nth-child(2n) {
            background-color: rgb(52, 58, 52);
        }

        tr:nth-child(2n + 1) {
            background-color: rgb(68, 78, 68);
        }
    }
}

.start {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    gap: 0.5rem;
}
</style>
