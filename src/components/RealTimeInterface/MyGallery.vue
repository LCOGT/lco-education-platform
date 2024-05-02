<script setup>
import thumbnail from '../../assets/TemporaryImages/thumbnail.png'

const numberOfThumbnails = 10
</script>

<template>
    <div class="image-wrapper">
        <img v-for="n in numberOfThumbnails" :key="n" :src="thumbnail" class="thumbnail" />
    </div>
</template>

<style scoped>
.thumbnail {
    width: 12em;
}
@media (max-width: 1200px) {
.thumbnail {
    width: 8em;
}
}
</style>
