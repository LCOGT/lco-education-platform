<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  disableNextStepBtn: {
    type: Boolean,
    default: false,
    required: true
  },
  showPrevious: {
    type: Boolean,
    default: false,
    required: true
  },
  showNext: {
    type: Boolean,
    default: false,
    required: true
  }
})

</script>

<template>
  <div class="step-btns footer-left">
    <v-btn
      color="indigo"
      @click="$emit('previous')"
      v-if="props.showPrevious"
    >
      Previous step
    </v-btn>
    <v-btn
      v-if="props.showNext"
      color="indigo"
      :disabled="props.disableNextStepBtn"
      @click="$emit('next')"
    >
      Next step
    </v-btn>
  </div>
</template>

<style scoped>
.step-btns {
  display: flex;
  gap: 1em;
  flex-wrap: wrap;
}
.footer-left {
  position: fixed;
  left: clamp(1.5rem, 4vw, 3rem);
  bottom: clamp(1.5rem, 5vh, 3.5rem);
  z-index: 100;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  background: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .footer-left {
    left: 1rem;
    bottom: 1rem;
  }
}

</style>
