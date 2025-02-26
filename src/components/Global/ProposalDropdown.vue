<script setup>
import { ref, defineEmits, onMounted, computed } from 'vue'
import { useProposalStore } from '../../stores/proposalManagement.js'

const emit = defineEmits(['selectionsComplete'])
const proposalStore = useProposalStore()
const selectedProposal = ref()
const moreThanOneProposalWithRealTimeAllocation = computed(() => proposalStore.proposalsWithRealTimeAllocation)
const allActiveProposals = computed(() => proposalStore.allActiveProposals)

onMounted(() => {
  console.log('all active proposals', allActiveProposals.value)
})
</script>

<template>
  <template v-if="moreThanOneProposalWithRealTimeAllocation || allActiveProposals.length > 0">
    <div class="field">
      <label for="proposalSelect">Select the project you would like to use</label>
        <div class="control">
        <div class="select">
          <select
            id="proposalSelect"
            v-model="selectedProposal"
            @change="emit('selectionsComplete', selectedProposal)"
            >
            <option v-for="proposal in allActiveProposals" :key="proposal.id" :value="proposal.id">
                {{ proposal.title }}
            </option>
        </select>
        </div>
      </div>
    </div>
  </template>
  <template v-else-if="!allActiveProposals">
    <div>
      <p>No proposals found. Please create a proposal <a href="https://observe.lco.global/apply">here</a></p>
    </div>
  </template>
</template>
