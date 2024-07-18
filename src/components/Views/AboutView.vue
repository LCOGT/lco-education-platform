<script setup>
import { defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import LogIn from '../LogIn/LogIn.vue'

const emit = defineEmits(['observeClicked'])
const router = useRouter()

function emitObserve () {
  emit('observeClicked')
  router.push('/dashboard')
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
              <div class="highlight-title">Learn</div>
              <p>Explore astronomy with our activities linked to observing</p>
            </div>
          </div>
        </div>
        <div class="column" @click="emitObserve">
          <div class="card">
            <div class="card-content highlight-box is-clickable">
              <FontAwesomeIcon icon="fa-solid fa-star" class="blue icon-highlight" />
              <div class="highlight-title">Observe</div>
              <p>Use Photon Ranch for live or scheduled observations</p>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="card">
            <div class="card-content highlight-box">
              <FontAwesomeIcon icon="fa-solid fa-chart-line" class="green icon-highlight" />
              <div class="highlight-title">Data Lab</div>
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
    <div class="columns">
      <div class="column is-one-third">
        <figure class="image is-16by9">
          <iframe class="has-ratio" width="560" height="315" src="https://www.youtube.com/embed/5UUUTEdJ_ms?si=ATABX1KnR072O1Uh" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </figure>
      </div>
      <div class="column">
        <h2>About Photon Ranch</h2>
        <p>Ponam in culpa idiota aliis pravitatis. Principium ponere culpam in se justum praeceptum. Neque improperes et aliis qui non perfecte ipse docuit. Quod Enchiridion Epictetus stoici scripsit. Rodrigo Abela et Technologiae apud Massachusetts instituta Opera collectio. Ex anglicus latine translata sunt.</p>
      </div>
    </div>
  </div>
</section>
</template>
