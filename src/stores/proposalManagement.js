import { defineStore } from 'pinia'
import { fetchApiCall } from '../utils/api'
import { useConfigurationStore } from './configuration'

export const useProposalStore = defineStore('proposalManagement', {
  state () {
    return {
      proposalsWithRealTimeAllocation: [],
      proposalsWithNormalTimeAllocation: [],
      allActiveProposals: []
    }
  },
  persist: true,
  getters: {
    getProposalsWithRealTimeAllocation () {
      return this.proposalsWithRealTimeAllocation
    },
    getAllActiveProposals () {
      return this.allActiveProposals
    }
  },
  actions: {
    sortProposals (proposals) {
      this.allActiveProposals = []
      this.proposalsWithRealTimeAllocation = []
      this.proposalsWithNormalTimeAllocation = []

      const activeProposals = proposals.filter(proposal => proposal.current === true)
      this.allActiveProposals = activeProposals
      for (const proposal of activeProposals) {
        // Check if the proposal has any realtime allocation with available credit
        const hasRealTimeAllocation = proposal.time_allocations.some(time => {
          const realTimeAllocation = time.realtime_allocation
          const realTimeUsed = time.realtime_time_used
          return realTimeAllocation - realTimeUsed > 0
        })
        const hasNormalTimeAllocation = proposal.time_allocations.some(time => {
          const normalTimeAllocation = time.std_allocation
          const normalTimeUsed = time.std_time_used
          return normalTimeAllocation - normalTimeUsed > 0
        })
        if (hasRealTimeAllocation) {
          this.proposalsWithRealTimeAllocation.push(proposal)
        }
        if (hasNormalTimeAllocation) {
          this.proposalsWithNormalTimeAllocation.push(proposal)
        }
      }
    },
    async fetchProposals () {
      const configurationStore = useConfigurationStore()
      await fetchApiCall({
        url: `${configurationStore.observationPortalUrl}profile/?include_current_time_allocations`,
        method: 'GET',
        successCallback: (response) => {
          this.sortProposals(response.proposals)
        }
      })
    }
  }
})
