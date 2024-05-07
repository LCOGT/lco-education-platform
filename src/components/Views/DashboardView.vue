<script setup>
import MyGallery from '../Images/MyGallery.vue'
import UpcomingBookings from '../Dashboard/UpcomingBookings.vue'

</script>

<template>
    <div class="container">
        <div class="columns">
            <div class="column is-three-fifths">
                <MyGallery />
            </div>
            <div class="column">
                <UpcomingBookings />
            </div>
        </div>
    </div>
</template>

