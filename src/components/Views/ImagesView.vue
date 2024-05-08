<script setup>
import MyGallery from '../Images/MyGallery.vue'

// TO DO: Add actual download functionality
// Store images in store key is project name and value is an array of images
// Change image archive to actual redirection
</script>

<template>
  <section>
    <div class="container">
    <div class="gallery-header">
        <h2>Photon Ranch Gallery</h2>
        <v-btn color="indigo" class="archive-button"><a href="https://archive.photonranch.org/" target="_blank" class="ptr-archive">Image Archive</a></v-btn>
    </div>
    <div class="gallery-content">
        <MyGallery class="my-gallery"/>
        <div class="button-wrapper">
            <v-btn class="button blue-bg">Load more</v-btn>
            <v-btn class="button blue-bg">Download</v-btn>
            <v-btn class="button blue-bg">Open in DataLab</v-btn>
        </div>
    </div>
  </div>
  </section>

</template>
