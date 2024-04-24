<script setup>
import { ref } from 'vue';
import MyGallery from '../Dashboard/MyGallery.vue';
import UpcomingBookings from '../Dashboard/UpcomingBookings.vue';

const activeTab = ref('dashboard');

</script>

<template>
    <div>
        <div class="tabs">
            <button class="tab" :class="{ active: activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">Dashboard</button>
            <button class="tab" :class="{ active: activeTab === 'realtime' }" @click="activeTab = 'realtime'">Real Time</button>
            <button class="tab" :class="{ active: activeTab === 'schedule' }" @click="activeTab = 'schedule'">Schedule</button>
            <button class="tab" :class="{ active: activeTab === 'images' }" @click="activeTab = 'images'">Images</button>
        </div>

        <div class="tab-content">
            <div v-if="activeTab === 'dashboard'" class="dashboard-container">
                <MyGallery />
                <UpcomingBookings />
            </div>
            <div v-if="activeTab === 'realtime'">
                <!-- Real Time content goes here -->
            </div>
            <div v-if="activeTab === 'schedule'">
                <!-- Schedule content goes here -->
            </div>
            <div v-if="activeTab === 'images'">
                <!-- Images content goes here -->
            </div>
        </div>
    </div>
</template>

<style>
.tabs {
    display: flex;
    justify-content: space-between;
}

.tab {
    padding: 10px;
    background-color: #f0f0f0;
    border: none;
    cursor: pointer;
    margin: 1em 1em 0 1em;
    width: 50vw;
}

.tab.active {
    background-color: #ccc;
}
.dashboard-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
}
</style>
