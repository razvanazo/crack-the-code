<script setup>
import DefaultButton from '@/components/DefaultButton.vue'
import {ref, nextTick, onUnmounted, watch, onMounted} from 'vue' // Added onMounted
import socket from "@/socket.js";
import ErrorPopup from "@/components/ErrorPopup.vue";
import GenericPopup from "@/components/GenericPopup.vue";
import LoadingDots from "@/components/LoadingDots.vue";
import PlayerIconTimer from "@/components/PlayerIconTimer.vue";
import defaultIcon from '@/components/icons/logo.svg';
import ChatPopup from "@/components/ChatPopup.vue";
import SpeechBubblePopup from "@/components/SpeechBubblePopup.vue"; // Import default icon

const code = ref('')
const isSetCode = ref(false)
const guess = ref('')
const trying = ref([])
const player2trying = ref([])
const showPopup = ref(false);
const popupText = ref('');
const gameStarted = ref(false);
const waitingPopup = ref(false);
const opponentRef = ref(null);
const playerRef = ref(null);
const disableGuess = ref(false);
const inputCodeRef = ref(null); // Added ref for input-code
const myIcon = ref(defaultIcon); // Reactive variable for the user's icon
const opponentIcon = ref(defaultIcon); // Reactive variable for the opponent's icon

// Player Speech Bubble
const showPlayerBubble = ref(false);
const playerBubbleMessage = ref("");

// Opponent Speech Bubble
const showOpponentBubble = ref(false);
const opponentBubbleMessage = ref("");

onMounted(() => {
    // Load user icon from sessionStorage
    const cachedUser = sessionStorage.getItem('user');
    if (cachedUser) {
        const parsedUser = JSON.parse(cachedUser);
        if (parsedUser.icon) {
            myIcon.value = parsedUser.icon;
        }
    }

    if (!isSetCode.value) {
        nextTick(() => {
            if (inputCodeRef.value) {
                inputCodeRef.value.focus();
            }
        });
    }
});

const handlePlayerBubbleClose = () => {
    showPlayerBubble.value = false;
};

const handleOpponentBubbleClose = () => {
    showOpponentBubble.value = false;
};

const handleNewChatMessage = (message) => {
    playerBubbleMessage.value = message;
    showPlayerBubble.value = true;
};

const handleMessageReceived = (message) => {
    opponentBubbleMessage.value = message;
    showOpponentBubble.value = true;
}

socket.on('opponent-joined', (opponent) => {
    if (opponent && opponent.icon) {
        opponentIcon.value = opponent.icon;
    }
});

watch([isSetCode, gameStarted], ([isSetCode, gameStarted]) => {
    if (isSetCode && !gameStarted) {
        waitingPopup.value = true;
    } else {
        waitingPopup.value = false;
    }
});

watch(isSetCode, (newValue) => {
    if (!newValue) { // When isSetCode becomes false, the input should be visible
        nextTick(() => {
            if (inputCodeRef.value) {
                inputCodeRef.value.focus();
            }
        });
    }
});

onUnmounted(() => {
    socket.emit('leave-room');
    socket.removeAllListeners();
    sessionStorage.removeItem('messages');
    sessionStorage.removeItem('trying');
    sessionStorage.removeItem('player2trying');
})

function startMyTimer(time = null) {
    opponentRef.value?.stop();
    time ? playerRef.value?.start(time) : playerRef.value?.start();
    disableGuess.value = false;
}

function startOpponentTimer(time = null) {
    playerRef.value?.stop();

    time ? opponentRef.value?.start(time) : opponentRef.value.start();
    disableGuess.value = true;
}

const digitsOnly = (e) => {
    if (!e.data) return;
    if (/\D/.test(e.data)) {
        e.preventDefault();
    }

    if (e.target.value.length > 3) e.preventDefault()
}

const resetGame = () => {
    isSetCode.value = false
    trying.value = []
    guess.value = ''
    code.value = ''
    player2trying.value = []
    gameStarted.value = false
    disableGuess.value = false
}

const startGame = () => {
    if (showPopup.value) {
        return;
    }

    if (!validateCode(code.value)) return;

    isSetCode.value = true;
    socket.emit('set-code', String(code.value));
}

const showError = async (message) => {
    popupText.value = message;
    await nextTick();
    showPopup.value = true;
}

socket.on('game-start', function (res) {
  gameStarted.value = res;
})

const guessCode = async () => {
    if (!validateCode(guess.value)) {
        return
    }
    if (disableGuess.value) return;

    socket.emit('guess-code', String(guess.value), response => {
        if (response.value) {
            showError('You won!')
            resetGame()
        } else {
            let message = `${response.correctDigits} in the correct position`;
            trying.value.push({code: guess.value, message: message})
            guess.value = ''
            sessionStorage.setItem('trying', JSON.stringify(trying.value));
        }
    });

    nextTick().then(() => {
        document.querySelector('#guess_input').focus();
        startOpponentTimer();
    })
}

const validateCode = (code) => {
    if (!code || !/^\d{4}$/.test(String(code))) {
        showError('Code must be 4 digits')
        return false
    }

    return true
}

socket.on('opponent-guess', (code) => {
    if (code !== 'timeout') {
        player2trying.value.push(code);
        sessionStorage.setItem('player2trying', JSON.stringify(player2trying.value));
    }
    startMyTimer();
})

socket.on('opponent-win', () => {
    showError('You lost!')
    resetGame()
})

socket.on('opponent-leaved', () => {
    showError('You won!')
    resetGame()
    sessionStorage.removeItem('messages');
    sessionStorage.removeItem('trying');
    sessionStorage.removeItem('player2trying');
})

socket.on('reenter', (time, myTurn) => {
    isSetCode.value = true
    gameStarted.value = true
    sessionStorage.getItem('trying') ? trying.value = JSON.parse(sessionStorage.getItem('trying')) : [];
    sessionStorage.getItem('player2trying') ? player2trying.value = JSON.parse(sessionStorage.getItem('player2trying')) : [];
    nextTick(() => {
        myTurn ? startMyTimer(time) : startOpponentTimer(time);
    })
})

socket.on('player-starts', (player) => {
    socket.auth.playerId !== player ? startOpponentTimer() : startMyTimer();
})

</script>

<template>
    <ErrorPopup v-model="showPopup" :message="popupText" />

    <div class="nav">
        <h1>Game</h1>
        <DefaultButton link="/">Home</DefaultButton>
    </div>

    <GenericPopup v-model="waitingPopup" :canClose=false>
        <div class="waiting-opponent">
            <p>Waiting for opponent</p>
            <LoadingDots/>
        </div>
    </GenericPopup>
    <div class="game">
        <div class="active-game" v-if="gameStarted">
            <div class="opponent-area">
                <PlayerIconTimer ref="opponentRef" my-class="opponent" :icon="opponentIcon"/>
                <SpeechBubblePopup
                    v-if="showOpponentBubble"
                    :message="opponentBubbleMessage"
                    direction="up"
                    @close="handleOpponentBubbleClose"
                    class="opponent-speech-bubble"
                />
            </div>
            <div class="trying">
                <p>Your guesses</p>
                <ul>
                    <li v-for="item in trying" :key="item">
                        {{ item.code }}
                        <br>
                        <span>{{ item.message }}</span>
                    </li>
                </ul>
                <p>Opponent guesses</p>
                <ul>
                    <li v-for="(item, index) in player2trying" :key="index">
                        {{item}}
                    </li>
                </ul>
            </div>
            <div class="guess">
                <input id="guess_input" type="text" inputmode="numeric" v-model="guess" @beforeinput="digitsOnly" @keyup.enter="guessCode" placeholder="Enter your guess" />
                <DefaultButton @click="guessCode" :is-disabled="disableGuess">Guess</DefaultButton>
            </div>
            <div class="player-area">
                <PlayerIconTimer ref="playerRef" my-class="player" :icon="myIcon"/>
                <SpeechBubblePopup
                    v-if="showPlayerBubble"
                    :message="playerBubbleMessage"
                    direction="down"
                    @close="handlePlayerBubbleClose"
                    class="player-speech-bubble"
                />
            </div>
        </div>

        <div class="set-code" v-if="!isSetCode">
            <input id="input-code" ref="inputCodeRef" @keyup.enter="startGame" type="text" inputmode="numeric" @beforeinput="digitsOnly" v-model="code" placeholder="Enter your code" />
            <DefaultButton @click="startGame">Set code</DefaultButton>
        </div>
    </div>
    <ChatPopup @newMessageSent="handleNewChatMessage" @messageReceived="handleMessageReceived"/>
</template>

<style scoped>
  @import '@/assets/css/game.css';
</style>
