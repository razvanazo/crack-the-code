<script setup lang="ts">

</script>

<template>
    <div class="dots">
        <span></span>
        <span></span>
        <span></span>
    </div>
</template>

<style scoped>
.dots {
    display: flex;
    gap: 6px;

    span {
        width: 8px;
        height: 8px;
        background: #333;
        border-radius: 50%;
        display: inline-block;
        animation: bounce 0.6s infinite alternate;
    }
}
/* Stagger each dot */
.dots span:nth-child(1) { animation-delay: 0s; }
.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
    0%   { transform: translateY(0); }
    50%  { transform: translateY(-10px); }
    100% { transform: translateY(0); }
}
</style>
