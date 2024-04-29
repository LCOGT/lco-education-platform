require('@/assets/ptr_main.scss')
<script setup>
import { defineEmits } from 'vue'

const emit = defineEmits(['observeClicked'])

function emitObserve () {
  emit('observeClicked')
}
</script>

<template>
<section>
    <div class="columns">
            <div class="column">
                <article class="message is-dark">
                    <div class="message-header">
                        <p>Dark</p>
                        <button class="delete" aria-label="delete"></button>
                    </div>
                    <div class="message-body">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        <strong>Pellentesque risus mi</strong>, tempus quis placerat ut, porta nec
                        nulla. Vestibulum rhoncus ac ex sit amet fringilla. Nullam gravida purus
                        diam, et dictum <a>felis venenatis</a> efficitur. Aenean ac
                        <em>eleifend lacus</em>, in mollis lectus. Donec sodales, arcu et
                        sollicitudin porttitor, tortor urna tempor ligula, id porttitor mi magna a
                        neque. Donec dui urna, vehicula et sem eget, facilisis sodales sem.
                    </div>
                    </article>
                <h3>Learn Astronomy</h3>
                <p>Use Photon Ranch in Real Time or schedule observations</p>
            </div>

            <div class="column" @click="emitObserve">
                <h3>Observe</h3>
                <p>Explore astronomy with our activities linked to observing</p>
            </div>
            <div class="column">
                <h3>Data Lab</h3>
                <p>Analyze your data using browser based tools</p>
            </div>
    </div>
</section>
<section>
    <div class="container">
        <h2>About Photon Ranch</h2>
        <div class="about-ptr">
            <iframe width="560" height="315" src="https://www.youtube.com/embed/wupToqz1e2g" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            <p class="about-ptr-section">Ponam in culpa idiota aliis pravitatis. Principium ponere culpam in se justum praeceptum. Neque improperes et aliis qui non perfecte ipse docuit. Quod Enchiridion Epictetus stoici scripsit. Rodrigo Abela et Technologiae apud Massachusetts instituta Opera collectio. Ex anglicus latine translata sunt.</p>
        </div>
    </div>
</section>
</template>

<style scoped>

h2 {
    margin-bottom: 0.625em;
}
p {
    line-height: 1.5;
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
