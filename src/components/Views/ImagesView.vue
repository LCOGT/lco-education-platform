<script setup>
import MyGallery from '../Images/MyGallery.vue'

</script>

<template>
  <div class="gallery-container">
    <div class="gallery-header">
        <h2>Photon Ranch Gallery</h2>
        <v-btn color="indigo" class="archive-button"><a href="https://archive.photonranch.org/" target="_blank" class="ptr-archive">Image Archive</a></v-btn>
    </div>
    <div class="gallery-content">
        <MyGallery class="my-gallery"/>
        <div class="button-wrapper">
            <v-btn color="indigo" class="button">Load more</v-btn>
            <v-btn color="indigo" class="button">Download</v-btn>
            <v-btn color="indigo" class="button">Open in DataLab</v-btn>
        </div>
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
  margin: 1em;
}
.archive-button {
  display: flex;
  margin-left: 1em;
}
.ptr-archive {
  text-decoration: none;
  color:white;
}
.gallery-content {
  display: flex;
  width: 100%;
}
.my-gallery {
  width: 50%;
}
.button-wrapper {
  display: flex;
  flex-direction: column;
  width: 50%;
}
.button {
    width: 20%;
    margin: 1em;
    cursor: pointer;
}
</style>
