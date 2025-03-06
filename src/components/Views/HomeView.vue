<script setup>
import { defineEmits } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const emit = defineEmits(['close'])

function hideView () {
  emit('close')
}
</script>
<template>
<section class="hero highlight">
    <button class="delete" aria-label="delete" @click="hideView"></button>
    <div class="container">
        <div class="hero-body">
            <div class="columns">
                <div class="column">
                    <router-link to="/book/realtime" class="route">
                        <div class="card highlight-box">
                            <div class="card-content is-clickable">
                                <FontAwesomeIcon icon="fa-solid fa-gamepad" class="blue icon-highlight" />
                                <div class="highlight-title">Remote control a telescope</div>
                            </div>
                        </div>
                    </router-link>
                </div>
                <div class="column">
                    <router-link to="/schedule" class="route">
                    <div class="card">
                        <div class="card-content highlight-box">
                            <FontAwesomeIcon icon="fa-solid fa-calendar-days" class="green icon-highlight" />
                            <div class="highlight-title">Schedule an observation</div>
                        </div>
                    </div>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
    </section>
</template>

<style scoped>

.close-button {
    background-color: transparent;
    font-size: 1.5em;
    position: absolute;
    top: 1%;
    right: 2%;
}
@media (max-width: 1200px) {

.close-button {
    right: 5%;
}
}
@media (max-width: 900px) {
.close-button {
    right: 2%;
}
}
</style>
