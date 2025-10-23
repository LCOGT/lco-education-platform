<script setup>
import { ref, watch, defineProps } from 'vue'

const cadenceSelection = ref('none')
const period = ref('')
const jitter = ref('')

const props = defineProps({
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['buildCadencePayload'])

watch([period, jitter], ([newPeriod, newJitter]) => {
  if (cadenceSelection.value === 'simple-period') {
    emit('buildCadencePayload', {
      start: props.startDate,
      end: props.endDate,
      period: newPeriod,
      jitter: newJitter
    })
  }
})

</script>

<template>
    <div>
        <h3>Cadence Settings</h3>
        <div class="field">
            <div class="control">
            <div class="select">
            <select
                id="cadence-select"
                v-model="cadenceSelection"
                >
                <option value="none">None</option>
                <option value="simple-period">Simple Period</option>
            </select>
            </div>
            </div>
        </div>
        <div v-if="cadenceSelection === 'simple-period'">
            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label class="label">Period in decimal hours
                    </label>
                </div>
                <div class="field-body">
                    <div class="field">
                        <div class="control">
                            <input v-model="period" class="input" type="number" min="0"/>
                        </div>
                    </div>
                </div>
            </div>
            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label class="label">Jitter in decimal hours</label>
                </div>
            <div class="field-body">
                <div class="field">
                    <div class="control">
                        <input v-model="jitter" class="input" type="number" min="0"/>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.input {
  padding: 0.5em;
  box-sizing: border-box;
  max-width: 10vw;
}
.field-label {
    display: flex;
    align-items: flex-start;
}
.cadence-btn {
    margin-bottom: 1em;
}
</style>
