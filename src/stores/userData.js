import { defineStore } from 'pinia'
import { fetchApiCall } from '../utils/api'
import { useConfigurationStore } from './configuration'

export const useUserDataStore = defineStore('userData', {
  state () {
    return {
      username: '',
      authToken: '',
      profile: {},
      proposalIds: '',
      cachedResponse: {},
      cacheTimestamp: 0
    }
  },
  persist: true,
  getters: {
    userIsAuthenticated: (state) => {
      if (state.authToken) return true
      else return false
    },
    getProposalIds: (state) => {
      return state.proposalIds
    }
  },
  actions: {
    // Appending proposal ids to state so that the API call can be made with multiple ids if the user
    // has multiple active proposals
    appendProposalIds () {
      const proposals = this.profile.proposals
      const activeProposals = proposals.filter(proposal => proposal.current === true)
      for (const activeProposal of activeProposals) {
        let proposalId = activeProposal.id
        // Replacing space with %20 since the API call requires it
        proposalId = proposalId.replace(/ /g, '%20')
        // Checking if the exact proposal id is already in the string
        if (this.proposalIds.split('&id=').some(string => string === proposalId)) return
        this.proposalIds += `&id=${proposalId}`
      }
    },
    // Checking if the user and proposal has real time allocated for the current semester
    async fetchRealTimeAllocations (currentSemesterId) {
      this.appendProposalIds()
      const configurationStore = useConfigurationStore()
      const proposals = this.getProposalIds
      const response = await fetchApiCall({
        url: configurationStore.observationPortalUrl + `proposals/?semester=${currentSemesterId}${proposals}`,
        method: 'GET'
      })
      console.log('response', response)
      // Cache the response
      this.cachedResponse = response
      this.cacheTimestamp = Date.now()
    },
    // Function to check cache and fetch if necessary
    async fetchRealTimeAllocationsWithCache (currentSemesterId) {
      const fifteenMinutes = 15 * 60 * 1000
      const now = Date.now()
      if (this.cachedResponse && (now - this.cacheTimestamp < fifteenMinutes)) {
        console.log('Using cached response')
        return this.cachedResponse
      } else {
        await this.fetchRealTimeAllocations(currentSemesterId)
        return this.cachedResponse
      }
    },
    // Function to start the interval
    startFetchInterval (currentSemesterId) {
      this.fetchRealTimeAllocationsWithCache(currentSemesterId)
      setInterval(() => {
        this.fetchRealTimeAllocationsWithCache(currentSemesterId)
      }, 15 * 60 * 1000)
    }
  }
})
