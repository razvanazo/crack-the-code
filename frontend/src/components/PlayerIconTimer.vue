<script setup>
import RadialTimer from "@/components/RadialTimer.vue";
import {ref} from "vue";
import defaultIcon from '@/components/icons/logo.svg';

const timerRef = ref(null);

const props = defineProps({
    myClass: {type: String, required: true},
    icon: {type: String, default: defaultIcon}, // Added icon prop with a default
    duration: {type: String, default: 30},
})

function start(seconds = props.duration) {
    timerRef.value.start(seconds);
}

function stop() {
    timerRef.value.stop();
}

defineExpose(
    {
        start,
        stop
    }
)
</script>

<template>
    <div class="timer-container">
        <img :src="props.icon" class="main-image"/>
        <div class="radial-timer-container">
            <RadialTimer ref="timerRef" :duration="props.duration" @finished="done" :my-class="props.myClass"/>
        </div>
    </div>
</template>

<style scoped>
.timer-container {
    position: relative;
    display: inline-block;
    width:8vw;
    height:8vw;
    margin: 5px;
}

@media screen and (max-width: 724px) {
    .timer-container {
        width: 20vw;
        height: 20vw;
    }
}

.main-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
    position: relative;
    border-radius:20%;
}

.radial-timer-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;

}
</style>
