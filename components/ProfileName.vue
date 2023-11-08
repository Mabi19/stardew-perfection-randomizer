<template>
    <div class="profile-name">
        <span>{{ profile.name }}</span>
        <span class="badge" :class="badgeColor">{{ profile.template }}</span>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    profile: Profile;
}>();

const badgeColors: Record<string, string> = {
    standard: "green",
    hardcore: "red",
    custom: "blue",
};

const badgeColor = computed(() => badgeColors[props.profile.template]);
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
