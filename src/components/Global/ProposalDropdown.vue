<script setup>
import { ref, defineEmits, onMounted } from 'vue'
import { useUserDataStore } from '../../stores/userData'
import { fetchSemesterData, currentSemesterId } from '@/utils/calendarUtils'

const emit = defineEmits(['selectionsComplete'])

const userDataStore = useUserDataStore()
const proposals = userDataStore.profile.proposals
const activeProposals = proposals.filter(proposal => proposal.current === true)
const selectedProposal = ref()
const currentSemester = ref()

const checkProposalsLength = () => {
  // If there is only one proposal, automatically select it
  if (activeProposals.length === 1) {
    emit('selectionsComplete', proposals[0].id)
  }
}

onMounted(() => {
  checkProposalsLength()
  fetchSemesterData().then(() => {
    currentSemester.value = currentSemesterId
    userDataStore.fetchRealTimeAllocations(currentSemester.value)
  })
})
</script>

<template>
  <!-- If there is more than one proposal, show the dropdown -->
  <template v-if="proposals.length && proposals.length > 1">
    <div class="field">
      <label for="proposalSelect">Select the project you would like to use</label>
        <div class="control">
        <div class="select">
          <select
            id="proposalSelect"
            v-model="selectedProposal"
            @change="emit('selectionsComplete', selectedProposal)"
            >
            <option v-for="proposal in activeProposals" :key="proposal.id" :value="proposal.id">
                {{ proposal.title }}
              </option>
        </select>
        </div>
      </div>
    </div>
  </template>
  <!-- If there is less than one proposal, redirect user to creating a proposal -->
  <template v-else-if="proposals.length < 1">
    <div>
      <p>No proposals found. Please create a proposal <a href="https://observe.lco.global/apply">here</a></p>
    </div>
  </template>
</template>
