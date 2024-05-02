<template>
    <div class="profile-name">
        <span>{{ profile.name }}</span>
        <span class="badge" :class="badgeColor">{{ templateNames[profile.template] }}</span>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    profile: Profile;
}>();

const badgeColors = {
    standard: "green",
    hardcore: "red",
    custom: "blue",
} as const;

const badgeColor = computed(() => {
    const templateID = props.profile.template;
    const ruleset = templateID == "custom" ? "custom" : templateRulesets[templateID];
    return badgeColors[ruleset];
});
</script>

<style scoped lang="scss">
.profile-name {
    display: flex;
    flex-flow: row wrap;
    align-items: baseline;
    gap: 0.5rem;
}

.badge {
    text-transform: uppercase;
}
</style>
