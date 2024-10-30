<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import { useObsPortalDataStore } from '../../stores/sessions'
import { fetchApiCall } from '../../utils/api'
import { useConfigurationStore } from '../../stores/configuration'
import { useUserDataStore } from '../../stores/userData'

const obsPortalDataStore = useObsPortalDataStore()
const currentSession = obsPortalDataStore.currentSession
const userDataStore = useUserDataStore()
const configurationStore = useConfigurationStore()

const sessionId = currentSession.id

const emits = defineEmits(['thumbnailsFetched'])

// make this into a carousel (future)
const thumbnails = ref([])
let pollingInterval = null

const getThumbnails = async () => {
  const token = userDataStore.authToken
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Token ${token}`
  }
  await fetchApiCall({
    url: configurationStore.thumbnailArchiveUrl + `thumbnails/?observation_id=${sessionId}&size=large`,
    method: 'GET',
    header: headers,
    successCallback: (data) => {
      thumbnails.value = data.results.map(result => result.url)
      if (thumbnails.value.length > 0) {
        emits('thumbnailsFetched', true)
      }
    },
    failCallback: console.error
  })
}

onMounted(() => {
  getThumbnails()
  pollingInterval = setInterval(getThumbnails, 3000)
})

</script>

<template>
    <div>
      <img :src="thumbnails[0]" />
    </div>
</template>
