<script setup>
import MyGallery from '../Dashboard/MyGallery.vue';
import UpcomingBookings from '../Dashboard/UpcomingBookings.vue';

</script>

<template>
    <div class="dashboard-container">
        <MyGallery />
        <UpcomingBookings />
    </div>
</template>

<style scoped>
.dashboard-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
}
</style>
