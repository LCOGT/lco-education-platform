<script setup>
import { ref } from 'vue'
import { useUserDataStore } from '../../stores/userData'

const userDataStore = useUserDataStore()
const proposals = userDataStore.profile.proposals

const selectedProposal = ref()

</script>
<template>
    <div>
    <label for="proposalSelect">Select a prosposal:</label>
    <select id="proposalSelect" v-model="selectedProposal">
      <option v-for="proposal in proposals" :key="proposal.id" :value="proposal.id">
        {{ proposal.id }}
      </option>
    </select>
  </div>
</template>
