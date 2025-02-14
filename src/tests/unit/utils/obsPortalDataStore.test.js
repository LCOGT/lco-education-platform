import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { fetchApiCall } from '../../../utils/api.js'
import { createTestStores } from '../../../utils/testUtils'

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

  it('fetches real time observations and normal observations and sorts them correctly in the store', async () => {
    const now = new Date().getTime()

    const mockResponse = {
      results: [
        {
          id: 1,
          // 2 hours ago (past session, REAL_TIME, should be fulfilled)
          end: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
          state: 'PENDING',
          observation_type: 'REAL_TIME'
        },
        {
          id: 2,
          // 30 minutes from now (upcoming session, REAL_TIME, should be in upcoming)
          end: new Date(now + 30 * 60 * 1000).toISOString(),
          state: 'PENDING',
          observation_type: 'REAL_TIME'
        },
        {
          id: 3,
          // 1 hour ago (past session, COMPLETED NORMAL, should be fulfilled)
          end: new Date(now - 60 * 60 * 1000).toISOString(),
          state: 'COMPLETED',
          observation_type: 'NORMAL'
        }
      ]
    }

    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback(mockResponse)
    })
    await obsPortalDataStore.fetchCompleteObservationsAndUpcomingRTSessions()
    expect(fetchApiCall).toHaveBeenCalledTimes(1)

    // Check that completedObservations contains the COMPLETED NORMAL and past REAL_TIME observations
    expect(obsPortalDataStore.completedObservations).toEqual({
      1: mockResponse.results[0],
      3: mockResponse.results[2]
    })

    // Check that upcomingRealTimeSessions contains the future REAL_TIME observation as an object
    expect(obsPortalDataStore.upcomingRealTimeSessions).toEqual({
      2: mockResponse.results[1]
    })
  })

  it('fetches pending requests (/requestgroups) and updates pendingSchduledObservations correctly', async () => {
    const mockPendingRequestsResults = {
      results: [
        { id: 1, state: 'PENDING' },
        { id: 2, state: 'PENDING' }
      ]
    }

    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback(mockPendingRequestsResults)
    })

    await obsPortalDataStore.fetchPendingScheduledObservations()

    expect(fetchApiCall).toHaveBeenCalledTimes(1)
    expect(obsPortalDataStore.pendingSchduledObservations).toEqual(mockPendingRequestsResults.results)
  })
})
