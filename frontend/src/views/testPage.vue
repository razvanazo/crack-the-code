<script setup>
import PlayerIconTimer from "@/components/PlayerIconTimer.vue";
import {onMounted, ref} from 'vue'
import defaultIcon from '@/components/icons/logo.svg';
import SpeechBubblePopup from '@/components/SpeechBubblePopup.vue'; // Import the new component


const opponentRef = ref(null);
const playerRef = ref(null);
const myIcon = ref(defaultIcon);
const opponentIcon = ref(defaultIcon);

// Player Speech Bubble
const showPlayerBubble = ref(false);
const playerBubbleMessage = ref("I!");

// Opponent Speech Bubble
const showOpponentBubble = ref(false);
const opponentBubbleMessage = ref("You'll never beat me!");

const triggerSpeechBubbles = () => {
  // Reset bubbles if they are already visible to restart timers
  showPlayerBubble.value = false;
  showOpponentBubble.value = false;

  // Use nextTick to ensure bubbles are removed before being re-added
  import('vue').then(vue => {
    vue.nextTick(() => {
      showPlayerBubble.value = true;
      showOpponentBubble.value = true;
    });
  });
};

const handlePlayerBubbleClose = () => {
  showPlayerBubble.value = false;
};

const handleOpponentBubbleClose = () => {
  showOpponentBubble.value = false;
};

onMounted(() => {
    opponentRef.value.start(2)
})
</script>

<template>
  <div class="game-container">
    <div class="opponent-area">
        <PlayerIconTimer ref="opponentRef" my-class="opponent" :icon="opponentIcon"/>
        <!-- Opponent's Speech Bubble -->
        <SpeechBubblePopup
          v-if="showOpponentBubble"
          :message="opponentBubbleMessage"
          direction="up"
          @close="handleOpponentBubbleClose"
          class="opponent-speech-bubble"
        />
    </div>
    <div class="player-area">
        <PlayerIconTimer ref="playerRef" my-class="player" :icon="myIcon"/>
        <!-- Player's Speech Bubble -->
        <SpeechBubblePopup
          v-if="showPlayerBubble"
          :message="playerBubbleMessage"
          direction="down"
          @close="handlePlayerBubbleClose"
          class="player-speech-bubble"
        />
    </div>
    <!-- Button to trigger both speech bubbles -->
    <button @click="triggerSpeechBubbles" class="trigger-button">Test Bubbles</button>
  </div>
</template>

<style scoped>
    @import "@/assets/css/game.css";

    .game-container {
        position: relative;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }

    .opponent-area {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 100;
        /* Container for relative positioning of bubble */
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }

    .player-area {
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 100;
        /* Container for relative positioning of bubble */
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .player-speech-bubble {
      position: absolute;
      bottom: 100%;
      left: 0;
      margin-bottom: 15px; /* Space for the tail */
      z-index: 1000;
    }

    .opponent-speech-bubble {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 15px; /* Space for the tail */
      z-index: 1000;
    }

    .trigger-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 15px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      z-index: 1001;
    }
</style>
