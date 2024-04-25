<script setup>
import { defineEmits } from 'vue'

const emit = defineEmits(['observeClicked'])

function emitObserve() {
  emit('observeClicked')
}
</script>

<template>
<div class="columns">
    <section>
        <div class="column">
            <h3>Learn Astronomy</h3>
            <p>Use Photon Ranch in Real Time or schedule observations</p>
        </div>
    </section>
    <section @click="emitObserve">
        <div class="column">
            <h3>Observe</h3>
            <p>Explore astronomy with our activities linked to observing</p>
        </div>
    </section>
    <section>
        <div class="column">
            <h3>Data Lab</h3>
            <p>Analyze your data using browser based tools</p>
        </div>
    </section>
</div>
<section class="about">
    <h2>About Photon Ranch</h2>
    <div class="about-ptr">
        <iframe width="560" height="315" src="https://www.youtube.com/embed/wupToqz1e2g" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        <p class="about-ptr-section">Ponam in culpa idiota aliis pravitatis. Principium ponere culpam in se justum praeceptum. Neque improperes et aliis qui non perfecte ipse docuit. Quod Enchiridion Epictetus stoici scripsit. Rodrigo Abela et Technologiae apud Massachusetts instituta Opera collectio. Ex anglicus latine translata sunt.</p>
    </div>
</section>
</template>

<style scoped>
section {
    margin: 1.25em;
    padding: 1.25em;
    background-color: #f0f0f0;
    border-radius: 0.3125em;
}
h2 {
    margin-bottom: 0.625em;
}
p {
    line-height: 1.5;
}
.columns {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.625em;
}
.column {
    margin: 0 0.625em;
    padding: 1em;
    background-color: #f0f0f0;
    border-radius: 0.3125em;
    cursor: pointer;
}
.about {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    margin-top: 1em;
    margin-bottom: 1em;
}
.about-ptr {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    margin-top: 1em;
    margin-bottom: 1em;
}
.about-ptr-section {
    text-align: left;
    margin-left: 1em;
}
</style>
