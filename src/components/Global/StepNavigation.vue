<script setup>
import { defineProps, watch } from 'vue'

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
  <div class="step-btns">
    <v-btn
      color="indigo"
      @click="$emit('previous')"
      v-if="props.showPrevious"
    >
      Previous step
    </v-btn>
    <v-btn
      color="indigo"
      class="nextstep"
      :disabled="props.disableNextStepBtn"
      @click="$emit('next')"
      v-if="props.showNext"
    >
      Next step
    </v-btn>
  </div>
</template>

<style scoped>
.step-btns {
  display: flex;
  gap: 1em;
  margin-top: 2em;
}
</style>
