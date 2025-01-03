<script setup>
import { ref, defineEmits, computed, onMounted } from 'vue'
import { useUserDataStore } from '../../stores/userData'

const emit = defineEmits(['selectionsComplete'])

const userDataStore = useUserDataStore()
const proposals = userDataStore.profile.proposals
const activeProposals = proposals.filter(proposal => proposal.current === true)

const selectedProposal = ref()

onMounted(() => {
  if (activeProposals.length) {
    console.log('activeProposals:', activeProposals)
  }
})

</script>

<template>
  <template v-if="proposals.length">
    <div>
      <label for="proposalSelect">Select a proposal:</label>
      <select
      id="proposalSelect"
      class="proposal-select"
      v-model="selectedProposal"
      @change="emit('selectionsComplete', selectedProposal)"
      >
        <option v-for="proposal in activeProposals" :key="proposal.id" :value="proposal.id">
          {{ proposal.title }}
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

<style scoped>
.proposal-select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
