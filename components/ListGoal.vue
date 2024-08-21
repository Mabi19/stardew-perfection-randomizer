<template>
    <div class="goal">
        <ListGoalStatus :goal="goal" :key="goal.id"></ListGoalStatus>
        <div class="goal-list-name">
            <label :for="`goal:${goal.id}`"><Goal :goal="goal" /></label>
        </div>
        <div class="info goal-list-action">
            <PlainIconButton @click="openDialog" icon="more_horiz" />
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    goal: Goal;
}>();

const emit = defineEmits<{
    infoClick: [goal: Goal];
}>();

// we want the list items to be as light as possible, so defer opening the dialog box to the parent
function openDialog() {
    emit("infoClick", props.goal);
}
</script>

<style scoped lang="scss">
.info {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
}

.goal {
    // needs to be set in pixels for virtual scroller
    // 1em = 16px
    height: 30px;

    display: flex;
    flex-flow: row nowrap;
    align-items: center;

    * {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
}
</style>
