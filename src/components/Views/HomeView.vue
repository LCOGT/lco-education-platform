<script setup>
import { defineEmits } from 'vue'
import calendar from '../../assets/Icons/Calendar.png'
import remote from '../../assets/Icons/Remote.png'


const emit = defineEmits(['close'])

function hideView() {
  emit('close')
}
</script>
<template>
    <div class="columns" >
        <router-link to="/realtime" class="route">
        <section>
            <div class="column">
                <img :src="remote"/>
                <p>Remote control a telescope</p>
            </div>
        </section>
    </router-link>
        <section>
            <div class="column">
                <img :src="calendar"/>
                <p>Schedule an observation</p>
            </div>
        </section>
        <button class="close-button" @click="hideView">x</button>
    </div>
</template>

<style scoped>
section {
    margin: 1.25em;
    padding: 1.25em;
    background-color: #f0f0f0;
    border-radius: 0.3125em;
    height: 15vh;
    cursor: grab;
}
.columns {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 20%));
    gap: 10em;
    grid-auto-rows: minmax(0, 1fr);
    justify-content: center;
}
.route {
    text-decoration: none !important;
}
img {
    max-width: 20%
}
.column {
    margin: 0 0.625em;
    background-color: #f0f0f0;
    border-radius: 0.3125em;
}
.close-button {
    background-color: transparent;
    font-size: 1.5em;
    position: absolute;
    top: 0;
    right: 15%;
}
@media (max-width: 1200px) {
    .columns {
    grid-template-columns: repeat(2, minmax(0, 40%));
    gap: 6em;
}
.close-button {
    right: 5%;
}
}
@media (max-width: 900px) {
    .columns {
    grid-template-columns: repeat(2, minmax(0, 45%));
    gap: 2em;
}
.close-button {
    right: 2%;
}
}
</style>
