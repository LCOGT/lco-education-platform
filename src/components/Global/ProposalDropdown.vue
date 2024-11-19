<script setup>
import { ref, watch, defineEmits } from 'vue'
import { useUserDataStore } from '../../stores/userData'

const emit = defineEmits(['selectionsComplete'])

const userDataStore = useUserDataStore()
const proposals = userDataStore.profile.proposals
const activeProposals = proposals.filter(proposal => proposal.current === true)

const selectedProposal = ref()

watch(selectedProposal, (newValue) => {
  emit('selectionsComplete', newValue)
})

</script>

<template>
  <template v-if="proposals.length">
    <div>
      <label for="proposalSelect">Select a proposal:</label>
      <select id="proposalSelect" v-model="selectedProposal">
        <option v-for="proposal in activeProposals" :key="proposal.id" :value="proposal.id">
          {{ proposal.id }}
        </option>
      </select>
    </div>
  </template>
  <template v-else>
    <div>
      <p>No proposals found. Please create a proposal <a href="https://observe.lco.global/apply">here</a></p>
    </div>
  </template>
</template>
