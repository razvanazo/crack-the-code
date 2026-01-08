<script setup>
const props = defineProps({
    icons: {
        type: Array,
        required: true
    }
});
const emit = defineEmits(['icon-selected']);

const selectIcon = (icon) => {
    emit('icon-selected', icon);
};
</script>

<template>
    <div class="icon-picker-grid">
        <div v-for="(icon, index) in icons" :key="index" class="icon-wrapper" @click="selectIcon(icon)">
            <img :src="icon" alt="Icon" class="icon-image" />
        </div>
    </div>
</template>

<style scoped>
.icon-picker-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 10px;
    max-height: 200px; /* or any height you prefer */
    overflow-y: auto;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 8px;
}

.icon-wrapper {
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.3s;
}

.icon-wrapper:hover {
    border-color: #4CAF50;
}

.icon-image {
    width: 100%;
    height: 80px; /* same as minmax in grid-template-columns */
    object-fit: cover;
    display: block;
}
</style>
