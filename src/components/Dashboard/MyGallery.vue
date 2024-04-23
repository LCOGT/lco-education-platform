<script setup>
import thumbnail from '../../assets/TemporaryImages/thumbnail.png'

</script>

<template>
    <div class="my-gallery">
        <!-- define what recent means - ask Edward -->
        <h3 class="my-gallery-text">My Recent Real Time Images</h3>
    </div>
    <div class="gallery">
        <img :src="thumbnail" alt="Gallery thumbnail" class="thumbnail" />
        <img :src="thumbnail" alt="Gallery thumbnail" class="thumbnail" />
        <img :src="thumbnail" alt="Gallery thumbnail" class="thumbnail" />
        <img :src="thumbnail" alt="Gallery thumbnail" class="thumbnail" />
        <img :src="thumbnail" alt="Gallery thumbnail" class="thumbnail" />
        <img :src="thumbnail" alt="Gallery thumbnail" class="thumbnail" />
        <img :src="thumbnail" alt="Gallery thumbnail" class="thumbnail" />
        <img :src="thumbnail" alt="Gallery thumbnail" class="thumbnail" />
        <img :src="thumbnail" alt="Gallery thumbnail" class="thumbnail" />
        <img :src="thumbnail" alt="Gallery thumbnail" class="thumbnail" />
        <img :src="thumbnail" alt="Gallery thumbnail" class="thumbnail" />
        <img :src="thumbnail" alt="Gallery thumbnail" class="thumbnail" />
    </div>
</template>

<style scoped>
.my-gallery {
    display: flex;
    justify-content: flex-start;
    margin-left: 1em;
    margin-top: 1em;
}
.gallery {
    margin: 2em 0 1em 1em;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: auto;
    gap: 10px;
    grid-auto-flow: dense;
    width: 50vw;
}
.thumbnail {
    max-width: 12em;
}

</style>
