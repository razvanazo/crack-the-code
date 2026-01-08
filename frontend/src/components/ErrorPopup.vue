<script setup lang="ts">
  import GenericPopup from "@/components/GenericPopup.vue";
  import {computed, defineEmits} from "vue";
  const props = defineProps({
      modelValue: {
          type: Boolean,
          default: false
      },
      message: {
          type: String,
          default: 'An error occurred',
      },
  });
  const emits = defineEmits(['update:modelValue']);

  const visible = computed({
      get: () => props.modelValue,
      set: (val) => emits("update:modelValue", val),
  });

  const close = () => {
      visible.value = false;
  };
</script>

<template>
   <GenericPopup v-model="visible">
       <p>
           {{props.message}}
       </p>
       <template #footer>
           <div class="popup-footer">
               <button
                   class="popup-close"
                   @click="close"
               >
                   Close
               </button>
           </div>
       </template>
   </GenericPopup>
</template>

<style scoped>
.popup-close {
    padding: 0.5rem 1.5rem;
    background-color: #4f46e5; /* blue button */
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
}

.popup-close:hover {
    background-color: #4338ca;            /* text-gray-800 */
}
.popup-footer {
    margin-top: 1.5rem; /* Tailwind mt-4 */
    display: flex;
    justify-content: center;
}
</style>
