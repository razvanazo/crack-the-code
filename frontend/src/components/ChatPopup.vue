<template>
    <div>
        <!-- Buton chat -->
        <button class="chat-toggle" @click="toggleChat">💬</button>

        <!-- Popup chat -->
        <div v-if="isOpen" class="chat-overlay" @click.self="close">
            <div class="chat-popup" @click.stop>
                <!-- Header fix -->
                <div class="chat-header">
                    <span>Chat</span>
                    <button class="close-btn" @click="close">✖</button>
                </div>

                <!-- Mesaje scrollabile -->
                <div class="chat-messages" ref="messagesContainer">
                    <div
                        v-for="(msg, index) in messages"
                        :key="index"
                        :class="['message', msg.from]"
                    >
                        {{ msg.text }}
                    </div>
                </div>

                <!-- Input + buton trimite -->
                <div class="chat-input">
                    <input
                        v-model="newMessage"
                        @keyup.enter="sendMessage"
                        type="text"
                        placeholder="Scrie un mesaj..."
                    />
                    <button class="send-btn" @click="sendMessage">Trimite</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import socket from "@/socket.js";

const isOpen = ref(false);
const messages = ref([]);
const newMessage = ref('');
const messagesContainer = ref(null);

if (sessionStorage.getItem('messages')) {
    const stored = JSON.parse(sessionStorage.getItem('messages'));
    messages.value = Array.isArray(stored) ? stored : [];
}

function toggleChat() {
    isOpen.value = !isOpen.value;
    scrollToBottom();
}

function close() {
    isOpen.value = false;
}

function sendMessage() {
    const text = newMessage.value.trim();
    if (!text) return;

    messages.value.push({ text: text, from: 'self' });

    socket.emit("sendMessage", text)

    newMessage.value = '';
    scrollToBottom();
    console.log(messages.value);
    sessionStorage.setItem('messages', JSON.stringify(messages.value));
}

socket.on("newMessage", message => {
    messages.value.push({ text: message, from: 'other' });
    sessionStorage.setItem('messages', JSON.stringify(messages.value));
})

socket.on('opponent-leaved', () => {
    close();
})

function scrollToBottom() {
    setTimeout(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    }, 50);
}
</script>

<style scoped>
    @import '@/assets/css/chat.css';
</style>
