<script setup>
import { ref, defineEmits, computed, defineProps, onMounted } from 'vue'
import { useProposalStore } from '../../stores/proposalManagement.js'

const emit = defineEmits(['selectionsComplete'])

const props = defineProps({
  isItRealTime: {
    type: Boolean,
    required: true
  }
})

const proposalStore = useProposalStore()
const selectedProposal = ref()
const proposals = ref([])
const allActiveProposals = computed(() => { return proposalStore.allActiveProposals })

// If the user is requesting a real-time observation, only show proposals with real-time allocations
// If the user is requesting a normal-time observation, only show proposals with normal time allocations
const sortProposalDropdownSelection = () => {
  if (props.isItRealTime) {
    proposals.value = proposalStore.allActiveProposals
  } else if (!props.isItRealTime) {
    proposals.value = proposalStore.proposalsWithNormalTimeAllocation
  }
}

onMounted(() => {
  sortProposalDropdownSelection()
})

</script>

<template>
  <template v-if="allActiveProposals">
    <div class="field">
      <label for="proposalSelect">Select the project you would like to use</label>
        <div class="control">
        <div class="select">
          <select
            id="proposalSelect"
            v-model="selectedProposal"
            @change="emit('selectionsComplete', selectedProposal)"
            >
            <option v-for="proposal of proposals" :key="proposal.id" :value="proposal.id">
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
