<template>
  <div v-if="isVisible" :class="['speech-bubble-popup', direction]" :style="bubbleStyle">
    <div class="speech-bubble-content">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits, watch } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true,
    default: 'This is a popup!'
  },
  duration: {
    type: Number,
    default: 10000 // 10 seconds
  },
  direction: {
    type: String,
    default: 'down',
    validator: (value) => ['up', 'down'].includes(value)
  }
});

const emit = defineEmits(['close']);

const isVisible = ref(true);
const bubbleStyle = ref({
  'min-width': '0px',
  'max-width': '50vw'
});

const calculateWidth = () => {
  const temp = document.createElement('span');
  document.body.appendChild(temp);
  temp.style.fontSize = '16px'; // from CSS
  temp.style.fontFamily = 'sans-serif'; // from CSS
  temp.style.visibility = 'hidden';
  temp.style.whiteSpace = 'nowrap';
  temp.innerHTML = props.message;
  const textWidth = temp.offsetWidth;
  document.body.removeChild(temp);

  const maxWidth = window.innerWidth * 0.5;
  const newWidth = Math.min(textWidth + 20, maxWidth); // 30 for padding

  bubbleStyle.value['min-width'] = `${newWidth}px`;
};

onMounted(() => {
  calculateWidth();
});

watch(() => props.message, () => {
  calculateWidth();
});

onMounted(() => {
  setTimeout(() => {
    isVisible.value = false;
    emit('close');
  }, props.duration);
});
</script>

<style scoped>
.speech-bubble-popup {
  position: relative;
  background-color: #f0f0f0;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-family: sans-serif;
  color: #333;
}

.speech-bubble-popup::after {
  content: '';
  position: absolute;
  left: 20px;
  height: 0;
  width: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
}

/* Tail pointing DOWN (for bubbles appearing above the speaker) */
.speech-bubble-popup.down::after {
  top: 100%; /* Position below the bubble body */
  border-top: 15px solid #f0f0f0;
}

/* Tail pointing UP (for bubbles appearing below the speaker) */
.speech-bubble-popup.up::after {
  bottom: 100%; /* Position above the bubble body */
  border-bottom: 15px solid #f0f0f0;
    right: 15%;
    left: unset;
}

.speech-bubble-content {
    font-size: 16px;
    line-height: 1.4;
    text-align: center;
}
</style>
