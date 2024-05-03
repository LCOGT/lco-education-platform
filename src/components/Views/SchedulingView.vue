<script setup>
import { ref } from 'vue'

// TO DO (near future): Save this value in the store
// TO DO (future): Get level depending on course completion
const level = ref('')

</script>

<template>
    <div v-if="!level" class="level-buttons-wrapper">
        <p>What level are you?</p>
        <v-btn @click="level = 'beginner'" color="indigo" class="level-btns">Beginner</v-btn>
        <v-btn @click="level = 'expert'" color="indigo" class="level-btns">Expert</v-btn>
    </div>
    <div v-else-if="level === 'beginner'">
        <p>Beginner level</p>
    </div>
    <div v-else-if="level === 'expert'">
        <p>Expert Mode</p>
    </div>
</template>

<style scoped>
.level-buttons-wrapper {
    margin: 1em;
    gap: 1em;
}
.level-btns {
    margin: 1em;
}
</style>
