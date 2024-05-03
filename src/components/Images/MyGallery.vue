<script setup>
import thumbnail from '../../assets/TemporaryImages/thumbnail.png'

// TO DO: get images from api and sort them by
const numberOfThumbnails = 10
</script>

<template>
    <div class="image-wrapper">
        <img v-for="n in numberOfThumbnails" :key="n" :src="thumbnail" class="thumbnail" />
    </div>
</template>

<style scoped>
.image-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    padding: 1em;
    box-sizing: border-box;
}

.thumbnail {
    flex: 1 1 12em;
    max-width: 12em;
    height: auto;
}

@media (max-width: 1200px) {
    .thumbnail {
        max-width: 9em;
    }
}

@media (max-width: 900px) {
    .thumbnail {
        max-width: 8em;
    }
}
</style>
