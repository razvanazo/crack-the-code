<script setup>
import DefaultButton from '@/components/DefaultButton.vue'
import {getCurrentInstance, reactive, ref, onMounted, nextTick, watch} from 'vue'
import router from "@/router/index.js";
import ErrorPopup from "@/components/ErrorPopup.vue";
import IconPicker from "@/components/IconPicker.vue";
import GenericPopup from "@/components/GenericPopup.vue"; // Import GenericPopup
import { getAvailableIcons } from "@/mock-server.js";
import defaultIcon from '@/components/icons/logo.svg';

const { appContext } = getCurrentInstance();
const socket = appContext.config.globalProperties.$socket;
const error = ref(false);

const user = reactive({
  'name': '',
  'icon': defaultIcon
})

const nameInputRef = ref(null);
const roomInputRef = ref(null);
const selectedIcon = ref(defaultIcon);
const availableIcons = ref([]);
const showIconPicker = ref(false); // To control the popup

onMounted(() => {
    const cachedUser = sessionStorage.getItem('user');
    if (cachedUser) {
        const parsedUser = JSON.parse(cachedUser);
        Object.assign(user, parsedUser);
        if (parsedUser.icon) {
            selectedIcon.value = parsedUser.icon;
        }
    }

    availableIcons.value = getAvailableIcons(user.name);

    nextTick(() => {
        if (!user.name) {
            if (nameInputRef.value) {
                nameInputRef.value.focus();
            }
        }
        else if (!user.room) {
            if (roomInputRef.value) {
                roomInputRef.value.focus();
            }
        }
        else {
             if (roomInputRef.value) {
                roomInputRef.value.focus();
            }
        }
    });
});

watch(() => user.name, (newName) => {
    availableIcons.value = getAvailableIcons(newName);
});

const onIconSelected = (icon) => {
    selectedIcon.value = icon;
    user.icon = icon;
    showIconPicker.value = false; // Close the popup
};

const onSubmit = async () => {
    let sessionUser = { ...user };
    delete sessionUser.room;
    sessionStorage.setItem('user', JSON.stringify(sessionUser));

    socket.emit('join-room', user, (joined) => {
        if (joined) {
            router.push({name: 'game'})
        } else {
            error.value = true
        }
    })
}

</script>

<template>
    <header>
        <div class="app title">Crack the code</div>
    </header>
    <main>
        <ErrorPopup v-model="error" message="Room is full"/>
        <img alt="Vue logo" class="logo" src="@/components/icons/logo.svg" width="125" height="125" />

        <div class="name-and-icon">
            <img :src="selectedIcon" alt="User Icon" class="user-icon" @click="showIconPicker = true" />
            <input id="name" ref="nameInputRef" type="text" placeholder="Enter your name" v-model="user.name"/>
        </div>

        <input id="room" ref="roomInputRef" type="text" @keyup.enter="onSubmit" placeholder="Enter your room" v-model="user.room"/>
        <div>
            <DefaultButton @click="onSubmit">Start</DefaultButton>
        </div>

        <GenericPopup v-model="showIconPicker" :canClose="true">
            <IconPicker :icons="availableIcons" @icon-selected="onIconSelected" />
        </GenericPopup>
    </main>
</template>

<style scoped>
 @import '@/assets/css/home.css';

.name-and-icon {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.user-icon {
    border-radius: 50%;
    width: 40px; /* Adjust size as needed */
    height: 40px;
    object-fit: cover;
    border: 2px solid #ccc;
    cursor: pointer;
    margin-right: 10px;
}

#name {
    flex-grow: 1;
    height: 40px; /* Match icon height */
    box-sizing: border-box; /* Include padding and border in the element's total width and height */
}
</style>
