import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { fetchApiCall } from '../../../utils/api.js'
import { createTestStores } from '../../../utils/testUtils'

// Make sure the API mock path matches your project structure
vi.mock('@/utils/api', () => ({
  fetchApiCall: vi.fn()
}))

describe('Observation Portal Data Store', () => {
  let obsPortalDataStore

  beforeEach(() => {
    fetchApiCall.mockClear()
    const { obsPortalDataStore: store } = createTestStores()
    obsPortalDataStore = store
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('fetches upcoming REAL_TIME sessions observations', async () => {
    const now = new Date().getTime()

    // --- Upcoming REAL_TIME sessions ---
    const mockUpcomingRealTimeSessionsResponse = {
      results: [
        {
          id: 123,
          // 15 minutes from now
          start: new Date(now + 15 * 60 * 1000).toISOString(),
          // 30 minutes from now
          end: new Date(now + 30 * 60 * 1000).toISOString(),
          state: 'PENDING',
          observation_type: 'REAL_TIME'
        }
      ]
    }

    // --- Test fetchUpcomingRealTimeSessions ---
    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback(mockUpcomingRealTimeSessionsResponse)
    })
    await obsPortalDataStore.fetchUpcomingRealTimeSessions()
    expect(fetchApiCall).toHaveBeenCalledTimes(1)
    expect(obsPortalDataStore.upcomingRealTimeSessions).toEqual({
      123: mockUpcomingRealTimeSessionsResponse.results[0]
    })
  })

  it('fetches PENDING NORMAL observation requests', async () => {
    // --- Upcoming NORMAL sessions ---
    const mockPendingScheduledObservationsResponse = {
      results: [{
        request:
        {
          id: 456,
          // start and end are not relevant for PENDING NORMAL observations
          state: 'PENDING',
          observation_type: 'NORMAL'
        }
      }]
    }

    // --- Test fetchPendingScheduledObservations ---
    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback(mockPendingScheduledObservationsResponse)
    })
    await obsPortalDataStore.fetchPendingScheduledObservations()
    expect(fetchApiCall).toHaveBeenCalledTimes(1)
    expect(obsPortalDataStore.pendingScheduledObservations).toEqual({
      456: mockPendingScheduledObservationsResponse.results[0]
    })
  })

  it('fetches all completed observations', async () => {
    const now = new Date().getTime()
    const mockAllCompletedObservationsResponse = {
      results: [
        {
          id: 789,
          // 1 hour ago
          end: new Date(now - 60 * 60 * 1000).toISOString(),
          state: 'COMPLETED',
          observation_type: 'NORMAL',
          request: {
            id: 10101010,
            state: 'COMPLETED'
          }
        },
        {
          id: 101112,
          // 2 hours ago
          end: new Date(now - 120 * 60 * 1000).toISOString(),
          state: 'COMPLETED',
          observation_type: 'REAL_TIME',
          request: {
            id: 9999999,
            state: 'COMPLETED'
          }
        }
      ]
    }
    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback(mockAllCompletedObservationsResponse)
    })
    await obsPortalDataStore.fetchCompletedObservations()
    expect(fetchApiCall).toHaveBeenCalledTimes(1)
    expect(obsPortalDataStore.completedObservations).toEqual([
      mockAllCompletedObservationsResponse.results[0],
      mockAllCompletedObservationsResponse.results[1]
    ])
  })
})
