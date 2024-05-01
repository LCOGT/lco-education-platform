<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
  { id: 7 },
  { id: 8 },
  { id: 9 }
])
</script>

<template>
    <div class="container">
        <!-- define what recent means - ask Edward -->
        <h3 class="my-gallery-text">My Recent Real Time Images</h3>
        <div class="columns is-multiline">
                <div class="column is-one-quarter" v-for="({id}) in items" :key="id">
                    <figure class="image">
                        <img class="{{id}}" src="https://placehold.co/200x200" title="Real Time Image"/>
                    </figure>
                </div>
        </div>
        <button class="button red-bg">Real Time Gallery </button>
    </div>
</template>
