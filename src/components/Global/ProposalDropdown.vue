<script setup>
import { ref, defineEmits } from 'vue'
import { useUserDataStore } from '../../stores/userData'
const emit = defineEmits(['selectionsComplete'])
const userDataStore = useUserDataStore()
const proposals = userDataStore.profile.proposals
const activeProposals = proposals.filter(proposal => proposal.current === true)
const selectedProposal = ref()
</script>

<template>
  <template v-if="proposals.length">
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
  <template v-else>
    <div>
      <p>No proposals found. Please create a proposal <a href="https://observe.lco.global/apply">here</a></p>
    </div>
  </template>
</template>
