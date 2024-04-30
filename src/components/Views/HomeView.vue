<script setup>
import { defineEmits } from 'vue'
import calendar from '../../assets/Icons/Calendar.png'

const emit = defineEmits(['close'])

function hideView () {
  emit('close')
}
</script>
<template>
<section class="hero highlight">
    <div class="container">
        <div class="hero-body">
            <div class="columns">
                <div class="column">
                    <router-link to="/realtime" class="route">
                        <div class="card">
                            <div class="card-content is-clickable">
                                <FontAwesomeIcon icon={faPhone} />
                                <p>Remote control a telescope</p>
                            </div>
                        </div>
                    </router-link>
                </div>
                <div class="column">
                    <div class="card">
                        <div class="card-content">
                            <img :src="calendar"/>
                            <p>Schedule an observation</p>
                        </div>
                    </div>
                </div>
        <button class="close-button" @click="hideView">x</button>
            </div>
        </div>
    </div>
    </section>
</template>

<style scoped>

.route {
    text-decoration: none !important;
}
.route:link, .route:visited {
    color: #000;
    text-decoration: none;
}
img {
    max-width: 20%
}

.close-button {
    background-color: transparent;
    font-size: 1.5em;
    position: absolute;
    top: 0;
    right: 15%;
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
