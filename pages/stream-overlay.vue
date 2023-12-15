<template>
    <main>
        <div class="icon-frame">
            <img
                src="/stardew-perfection-randomizer/_nuxt/assets/null-goal-icon.png"
                ref="goalIcon"
            />
        </div>
        <div class="goal-name-wrapper">
            <div class="goal-name-background">
                <div id="goal-name" ref="goalName">(open dashboard to load)</div>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
definePageMeta({
    layout: false,
});

const channel = new BroadcastChannel("sdvpr:stream_overlay");

const goalIcon = ref<HTMLImageElement | null>(null);
const goalName = ref<HTMLDivElement | null>(null);

channel.addEventListener("message", (ev) => {
    console.log(ev.data);
    if (goalIcon.value && goalName.value) {
        goalIcon.value.src = ev.data.imageURL;

        if (ev.data.imageURL === null) {
            goalIcon.value?.classList.add("invisible");
        } else {
            goalIcon.value?.classList.remove("invisible");
        }

        goalName.value.textContent = ev.data.name;
    }
});
</script>

<style lang="scss">
body {
    background-color: rgb(100, 20, 0);
    padding: 0;
    margin: 0;

    image-rendering: pixelated;
}

main {
    border: 1px solid red;
    background-color: #00ff00;
    color: black;

    display: flex;
    flex-flow: row nowrap;
    align-items: center;

    height: 98px;
    width: 500px;
    overflow: hidden;
}

.invisible {
    visibility: hidden;
}

@font-face {
    font-family: "Stardew Valley";
    src: url("~/assets/stream-overlay/stardew-item-font.ttf");
}

.icon-frame {
    border-image-slice: 16 16 16 16;
    border-image-width: 16px 16px 16px 16px;
    border-image-outset: 0px 0px 0px 0px;
    border-image-repeat: stretch stretch;
    border-image-source: url("~/assets/stream-overlay/icon-box.png");

    width: 96px;
    height: 96px;
    padding: 16px;

    display: grid;
    place-items: center;
}

.icon-frame img {
    width: 100%;
    height: 100%;
    padding: 2px;
    object-fit: contain;

    background-color: #ffd284;
}

.goal-name-wrapper {
    border-image-slice: 28 24 28 8;
    border-image-width: 28px 24px 28px 12px;
    border-image-outset: 0px 0px 0px 0px;
    border-image-repeat: repeat repeat;
    border-image-source: url("~/assets/stream-overlay/goal-name-box.png");

    padding: 24px 24px 24px 4px;

    min-width: 250px;
    height: 88px;

    display: grid;
    place-items: center;
}

.goal-name-background {
    background-color: #ffd284;
    width: 100%;
    height: 100%;

    display: grid;
    place-items: center;
}

#goal-name {
    font-family: "Stardew Valley";
    font-size: 25px;
    text-align: center;

    padding: 0 4px;

    position: relative;
    top: 5px;

    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
