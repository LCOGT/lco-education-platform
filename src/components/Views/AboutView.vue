require('@/assets/ptr_main.scss')
<script setup>
import { defineEmits } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const emit = defineEmits(['observeClicked'])

function emitObserve () {
  emit('observeClicked')
}
</script>

<template>
<section class="hero highlight">
    <div class="container">
        <div class="hero-body">
            <div class="columns">
                    <div class="column">
                        <div class="card">
                            <div class="card-content highlight-box">
                                <FontAwesomeIcon icon="fa-solid fa-book" class="red icon-highlight" />
                                <h3>Learn Astronomy</h3>
                                <p>Use Photon Ranch in Real Time or schedule observations</p>
                            </div>
                        </div>
                    </div>

                    <div class="column" @click="emitObserve">
                        <div class="card">
                            <div class="card-content highlight-box is-clickable">
                                <FontAwesomeIcon icon="fa-solid fa-star" class="blue icon-highlight" />

                        <h3>Observe</h3>
                        <p>Explore astronomy with our activities linked to observing</p>
                        </div>
                        </div>
                    </div>
                    <div class="column">
                        <div class="card">
                            <div class="card-content highlight-box">
                                <FontAwesomeIcon icon="fa-solid fa-chart-line" class="green icon-highlight" />

                        <h3>Data Lab</h3>
                        <p>Analyze your data using browser based tools</p>
                        </div>
                        </div>
                    </div>
            </div>
        </div>
    </div>
</section>
<section>
    <div class="container">
        <h2>About Photon Ranch</h2>
        <div class="columns">
            <div class="column is-one-third">
                <figure class="image is-16by9">
                <iframe class="has-ratio" width="560" height="315" src="https://www.youtube.com/embed/wupToqz1e2g" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                </figure>
            </div>
            <div class="column">
                <p>Ponam in culpa idiota aliis pravitatis. Principium ponere culpam in se justum praeceptum. Neque improperes et aliis qui non perfecte ipse docuit. Quod Enchiridion Epictetus stoici scripsit. Rodrigo Abela et Technologiae apud Massachusetts instituta Opera collectio. Ex anglicus latine translata sunt.</p>
            </div>
        </div>
    </div>
</section>
</template>
