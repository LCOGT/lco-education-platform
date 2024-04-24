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
    flex: 1 1 50%;
    max-width: 50%;
    box-sizing: border-box;
}
.my-gallery-text {
    margin-top: 2em;
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
@media (max-width: 1200px) {
    .thumbnail {
        max-width: 11em;
    }
}
@media (max-width: 900px) {
    .thumbnail {
        max-width: 8em;
    }
}
</style>
