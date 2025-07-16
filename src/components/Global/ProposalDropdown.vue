<script setup>
import { ref, onMounted, computed } from 'vue'
import { useProposalStore } from '../../stores/proposalManagement.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

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
// const proposalsComputed = computed(() => { return proposals.value })

// If the user is requesting a real-time observation, only show proposals with real-time allocations
// If the user is requesting a normal-time observation, only show proposals with normal time allocations
const setProposalDropdownSelection = () => {
  if (props.isItRealTime) {
    proposals.value = proposalStore.proposalsWithRealTimeAllocation
  } else if (!props.isItRealTime) {
    proposals.value = proposalStore.proposalsWithNormalTimeAllocation
  }
}

onMounted(() => {
  setProposalDropdownSelection()
})

</script>

<template>
  <!-- Only rendering if there is more than one proposal, otherwise it's automatically selected -->
  <template v-if="proposals.length > 1">
    <h3>Select your project</h3>
    <div class="field">
      <label for="proposalSelect">We have found multiple projects on your account. Please select the one to use for these observations.</label>
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
  <template v-else-if="!proposals.length">
      <div class="notification is-warning">
        <div class="icon-text">
        <span class="icon">
          <font-awesome-icon icon="fa-solid fa-exclamation-triangle" />
        </span>
        <span>You are not a member of any projects.</span>
      </div>
    </div>
  </template>
</template>
