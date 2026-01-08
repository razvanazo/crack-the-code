<script setup>
import { RouterLink } from 'vue-router'

const props = defineProps({
    link: {
        type: String,
        default: ''
    },
    name: {
        type: String,
    },
    type: {
        type: String,
        default: 'primary'
    },
    isDisabled: {
        type: Boolean,
        default: false
    }
})
</script>

<template>
    <RouterLink v-if="props.link !== ''" :to="props.link">
        <button :class="props.type">
            <slot></slot>
        </button>
    </RouterLink>
    <button v-else :class="props.type" :disabled="isDisabled">
        <slot></slot>
    </button>
</template>
