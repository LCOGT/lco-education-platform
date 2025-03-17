import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { fetchApiCall } from '../../../utils/api.js'
import { createTestStores } from '../../../utils/testUtils.js'

vi.mock('@/utils/api', () => ({
  fetchApiCall: vi.fn()
}))

describe('proposalManagementStore', () => {
  let proposalManagementStore

  beforeEach(() => {
    fetchApiCall.mockClear()
    const { proposalManagementStore: store } = createTestStores()
    proposalManagementStore = store
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('fetches proposals and updates store state correctly', async () => {
    const mockProposals = {
      proposals: [
        {
          id: 'RealTimeTest1',
          title: 'Has real time',
          current: true,
          time_limit: -1,
          time_used: 0,
          time_allocations: [
            {
              std_allocation: 0.0,
              std_time_used: 0.0,
              realtime_allocation: 100.0,
              realtime_time_used: 5
            }
          ]
        },
        {
          id: 'RealTimeTest2',
          title: 'Does not have real time',
          current: true,
          time_limit: -1,
          time_used: 0,
          time_allocations: [
            {
              std_allocation: 0.0,
              std_time_used: 0.0,
              realtime_allocation: 0.0,
              realtime_time_used: 0.0
            }
          ]
        },
        {
          id: 'NormalTimeTest1',
          title: 'Has normal time',
          current: true,
          time_limit: -1,
          time_used: 0,
          time_allocations: [
            {
              std_allocation: 100.0,
              std_time_used: 5,
              realtime_allocation: 0.0,
              realtime_time_used: 0.0
            }
          ]
        },
        {
          id: 'NormalTimeTest2',
          title: 'Does not have normal time',
          current: true,
          time_limit: -1,
          time_used: 0,
          time_allocations: [
            {
              std_allocation: 0.0,
              std_time_used: 0.0,
              realtime_allocation: 0.0,
              realtime_time_used: 0.0
            }
          ]
        },
        {
          id: 'HasBothTest1',
          title: 'Has both real time and normal time',
          current: true,
          time_limit: -1,
          time_used: 0,
          time_allocations: [
            {
              std_allocation: 100.0,
              std_time_used: 5,
              realtime_allocation: 100.0,
              realtime_time_used: 5
            }
          ]
        },
        {
          id: 'NotCurrent',
          title: 'Is not current',
          current: false,
          time_limit: -1,
          time_used: 0,
          time_allocations: [
            {
              std_allocation: 100.0,
              std_time_used: 5,
              realtime_allocation: 100.0,
              realtime_time_used: 5
            }
          ]
        }
      ]
    }

    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback({ proposals: mockProposals.proposals })
    })

    await proposalManagementStore.fetchProposals()
    expect(fetchApiCall).toHaveBeenCalledTimes(1)

    // Filtering proposals to only get the active ones
    const onlyActiveProposals = mockProposals.proposals.filter(proposal => proposal.current)
    expect(proposalManagementStore.allActiveProposals).toEqual(onlyActiveProposals)

    // realtime_allocation - realtime_time_used > 0.
    expect(proposalManagementStore.proposalsWithRealTimeAllocation).toEqual([
      // RealTimeTest1 and HasBothTest1
      mockProposals.proposals[0],
      mockProposals.proposals[4]
    ])

    // std_allocation - std_time_used > 0.
    expect(proposalManagementStore.proposalsWithNormalTimeAllocation).toEqual([
      // NormalTimeTest1 and HasBothTest1
      mockProposals.proposals[2],
      mockProposals.proposals[4]
    ])
  })
})
