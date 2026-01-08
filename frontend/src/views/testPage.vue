<script setup>

import PlayerIconTimer from "@/components/PlayerIconTimer.vue";
import {ref} from "vue";

const opponentRef = ref(null);
const playerRef = ref(null);

function done() {
    opponentRef.value.start();
}
</script>

<template>
    <PlayerIconTimer ref="opponentRef" myClass="opponent"/>
    <PlayerIconTimer ref="playerRef" myClass="player"/>
    <button @click="done"></button>
</template>

<style scoped>

</style>
