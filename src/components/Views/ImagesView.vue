<script setup>
import MyGallery from '../Images/MyGallery.vue'

</script>

<template>
  <div class="gallery-container">
    <div class="gallery-header">
        <h2>Photon Ranch Gallery</h2>
        <v-btn color="indigo"><a href="https://archive.photonranch.org/" target="_blank" class="ptr-archive">Image Archive</a></v-btn>
    </div>
    <div class="gallery-content">
      <MyGallery />
    </div>
  </div>
</template>

<style scoped>
.gallery-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.gallery-header {
  margin-bottom: 1em;
}
.ptr-archive {
  text-decoration: none;
  color:white;
}
.gallery-content {
  display: flex;
  width: 50%;
}
</style>
