<script setup>
import {defineProps, defineEmits, computed} from "vue";

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    canClose: {
        type: Boolean,
        default: true,
    }
});

const emits = defineEmits(["update:modelValue"]);

const visible = computed({
    get: () => props.modelValue,
    set: (val) => emits("update:modelValue", val),
});

const close = () => {
    if (props.canClose) {
        visible.value = false;
    }
};

defineExpose({
    close
})
</script>

<template>
    <div
        v-if="visible"
        class="popup-overlay"
        @click.self="close"
    >
        <div
            class="popup-box"
            @click.stop
        >
            <!-- Slot for custom content -->
            <div>
                <slot />
            </div>

            <!-- Optional footer slot -->
            <div v-if="$slots.footer" class="mt-4">
                <slot name="footer" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.popup-overlay {
    position: fixed;         /* fixed */
    top: 0;                  /* inset-0 */
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;           /* flex */
    align-items: center;     /* items-center */
    justify-content: center; /* justify-center */
    z-index: 50;             /* z-50 */
    background-color: rgba(0, 0, 0, 0.5); /* bg-black/50 */
}
.popup-box {
    background-color: #ffffff; /* bg-white */
    border-radius: 1rem;       /* rounded-xl */
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1),
    0 4px 6px rgba(0, 0, 0, 0.05); /* shadow-lg */
    padding: 1.5rem;           /* p-6 */
    max-width: 28rem;           /* max-w-md ≈ 448px */
    width: 70%;               /* w-full */
    position: relative;        /* relative */
}
</style>
