<script setup>
import thumbnail from '../../assets/TemporaryImages/thumbnail.png'

</script>

<template>
<div class="wrapper">
        <!-- define what recent means - ask Edward -->
        <h3 class="my-gallery-text">My Recent Real Time Images</h3>
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
</div>
</template>

<style scoped>
.wrapper {
    display: flex;
    flex-direction: column;
}
.my-gallery-text {
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
