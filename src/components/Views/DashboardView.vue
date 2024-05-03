<script setup>
import MyGallery from '../Images/MyGallery.vue'
import UpcomingBookings from '../Dashboard/UpcomingBookings.vue'

</script>

<template>
    <div class="dashboard-container">
        <MyGallery class="my-gallery"/>
        <UpcomingBookings class="upcoming-bookings"/>
    </div>
</template>

<style scoped>
.dashboard-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
}

.my-gallery, .upcoming-bookings {
    /* flex-basis: 48%; */
    width: 48%;
}

@media (max-width: 900px) {
    .my-gallery, .upcoming-bookings {
        flex-basis: 100%;
        width: 100%;
    }
}
</style>
