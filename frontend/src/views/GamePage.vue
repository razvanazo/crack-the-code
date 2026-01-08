<script setup>
import DefaultButton from '@/components/DefaultButton.vue'
import {ref, nextTick, onUnmounted, watch, onMounted} from 'vue' // Added onMounted
import socket from "@/socket.js";
import ErrorPopup from "@/components/ErrorPopup.vue";
import GenericPopup from "@/components/GenericPopup.vue";
import LoadingDots from "@/components/LoadingDots.vue";
import PlayerIconTimer from "@/components/PlayerIconTimer.vue";
import defaultIcon from '@/components/icons/logo.svg'; // Import default icon

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
const showMessagePopup = ref(false);
const showMessagePopupRef = ref(null);
const myIcon = ref(defaultIcon); // Reactive variable for the user's icon
const opponentIcon = ref(defaultIcon); // Reactive variable for the opponent's icon

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
})

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

socket.on('validate-code', (res) => {
    console.log(typeof res);
    if (res === String(code.value)) {
        socket.emit('code-valid')
        showError("You lost!")
        resetGame()
    } else {
        let correctDigits = 0,
          codeAsArray = String(code.value).split(''),
          resArray = res.split('');

        for (let i = 0; i < 4; i++) {
          if (codeAsArray[i] === resArray[i]) {
            correctDigits++;
          }
        }
        player2trying.value.push(res);
        let message = `${correctDigits} in the correct position`;
        socket.emit('wrong', res, message)
        // guess.value = ''
        playerRef.value.start()
        opponentRef.value.stop()
  }
    disableGuess.value = false
})

socket.on('correct-code', () => {
    showError('You won!')
    resetGame()
})

socket.on('wrong-code', (code, message) => {
    trying.value.push({code: code, message: message})
})

const guessCode = async () => {
    if (!validateCode(guess.value)) {
        return
    }
    if (disableGuess.value) return;

    socket.emit('guess-code', String(guess.value));
    guess.value = ''

    nextTick().then(() => {
        document.querySelector('#guess_input').focus();
        disableGuess.value = true;
        playerRef.value.stop();
        opponentRef.value.start();
    })
}

const validateCode = (code) => {
    if (!code || !/^\d{4}$/.test(String(code))) {
        showError('Code must be 4 digits')
        return false
    }

    return true
}

socket.on('opponent-leaved', () => {
    showError('You won!')
    resetGame()
})

socket.on('player-starts', (player) => {
    if (socket.id !== player) {
        disableGuess.value = true
        opponentRef.value.start();
    } else {
        playerRef.value.start();
    }
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
            <div class="opponent">
                <PlayerIconTimer ref="opponentRef" my-class="opponent" :icon="opponentIcon"/>
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
            <div class="player">
                <PlayerIconTimer ref="playerRef" my-class="player" :icon="myIcon"/>
            </div>
            <div class="message-container">
                <img :src="myIcon" style="width: 10px; height: 10px" @click="showMessagePopup = !showMessagePopup">
                <GenericPopup ref="showMessagePopupRef" v-model="showMessagePopup">
                    <div class="waiting-opponent">
                        <p>Waiting for opponent</p>
                        <LoadingDots/>
                        <button @click="showMessagePopupRef.close()">Buton</button>
                    </div>
                </GenericPopup>
            </div>
        </div>

        <div class="set-code" v-if="!isSetCode">
            <input id="input-code" ref="inputCodeRef" @keyup.enter="startGame" type="text" inputmode="numeric" @beforeinput="digitsOnly" v-model="code" placeholder="Enter your code" />
            <DefaultButton @click="startGame">Set code</DefaultButton>
        </div>
    </div>
</template>

<style scoped>
  @import '@/assets/css/game.css';
</style>
