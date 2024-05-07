<script setup>
import { ref, defineEmits, computed, watch } from 'vue'
import AladinSkyMap from './AladinSkyMap.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const emits = defineEmits(['update:renderGallery'])

const exposureTime = ref('')
const exposureCount = ref('')
const selectedFilter = ref('')

const aladinRef = ref(null)

// TO DO: add more conditions where we check for ranges and valid values
const allFieldsFilled = computed(() => {
  const filled = exposureTime.value.trim() !== '' && exposureCount.value.trim() !== '' && selectedFilter.value.trim() !== ''
  emits('update:renderGallery', filled)
  return filled
})

function changeFov (fov) {
  if (aladinRef.value && aladinRef.value.setFov) {
    aladinRef.value.setFov(fov)
  }
}

watch([exposureTime, exposureCount, selectedFilter], () => {
  emits('update:renderGallery', allFieldsFilled.value)
})

</script>

<template>
    <div class="columns">
        <div class="column is-half">
            <AladinSkyMap ref="aladinRef" />
            <div class="mosaic-wrapper">
                <p class="mosaic"> Mosaic </p>
                <div class="text-wrapper">
                    <FontAwesomeIcon icon="fa-solid fa-square" @click="changeFov(1.0)" />
                    <p class="mosaic">Single shot</p>
                </div>
                <div class="text-wrapper">
                    <FontAwesomeIcon icon="fa-solid fa-th-large" @click="changeFov(2.0)"  />
                    <p class="mosaic">2 x 2 mosaic</p>
                </div>
            </div>
        </div>
        <div class="column">
            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label class="label">Exposure Time</label>
                </div>
                <div class="field-body">
                    <div class="field">
                    <p class="control is-expanded">
                        <input id="exposureTime" type="text" class="input" v-model="exposureTime">
                    </p>
                    </div>
                </div>
            </div>
            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label class="label">Exposure Count</label>
                </div>
                <div class="field-body">
                    <div class="field">
                    <p class="control is-expanded">
                        <input id="exposureCount" type="text" class="input" v-model="exposureCount">
                    </p>
                    </div>
                </div>
            </div>

            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label class="label">Filter</label>
                </div>
                <div class="field-body">
                    <div class="field is-narrow">
                    <div class="control">
                        <div class="select is-fullwidth">
                            <select id="filter" v-model="selectedFilter">
                                <option disabled value="">Choose a filter</option>
                                <option value="RGB">RGB color</option>
                                <option value="Blue">Blue</option>
                                <option value="Green (V)">Green (V)</option>
                                <option value="Red">Red</option>
                                <option value="H-Alpha">H-Alpha</option>
                            </select>
                        </div>
                    </div>
                    </div>
                </div>
                </div>

        </div>
    </div>
</template>

<style scoped>

p.mosaic {
    cursor: default;
    font-size: 1.5em;
}
.icon {
    font-size: 2.5em;
    cursor: pointer;
}

</style>
