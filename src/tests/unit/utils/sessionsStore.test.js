import { vi, describe, it, expect, beforeEach } from 'vitest'
import { fetchApiCall } from '../../../utils/api.js'
import { createTestStores } from '../../../utils/testUtils'
import flushPromises from 'flush-promises'

vi.mock('@/utils/api', () => ({
  fetchApiCall: vi.fn()
}))

describe('Sessions Store', () => {
  let sessionsStore

  beforeEach(() => {
    const { sessionsStore: store } = createTestStores()
    sessionsStore = store
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
    await sessionsStore.fetchSessions()
    // Verify that the API was called correctly
    expect(fetchApiCall).toHaveBeenCalledTimes(1)

    // Check that fulfilledRequests contains the COMPLETED NORMAL and past REAL_TIME observations
    expect(sessionsStore.fulfilledRequests).toEqual([mockResponse.results[0], mockResponse.results[2]])

    // Check that upcomingRealTimeSessions contains only the future REAL_TIME observation
    expect(sessionsStore.upcomingRealTimeSessions).toEqual([mockResponse.results[1]])
  })

  it('fetches session token correctly', async () => {
    const mockTokenResponse = { token: 'mockedToken' }
    const mockSession = {
      id: 1,
      state: 'PENDING',
      observation_type: 'REAL_TIME'
    }

    // Set current session for testing
    sessionsStore.currentSessionId = mockSession.id
    sessionsStore.upcomingRealTimeSessions = [mockSession]

    // Mock the API call for token fetching
    fetchApiCall.mockResolvedValueOnce(mockTokenResponse)

    await sessionsStore.fetchSessionToken()

    // Check if token was saved in sessionTokens
    expect(sessionsStore.sessionTokens[mockSession.id]).toBe('mockedToken')
  })

  it('starts polling and updates session status correctly', async () => {
    const mockSessionStatusResponse = { session_status: 'ACTIVE' }
    const mockTokenResponse = { token: 'mockToken' }

    const mockSession = {
      id: 1,
      state: 'PENDING',
      observation_type: 'REAL_TIME'
    }
    sessionsStore.currentSessionId = mockSession.id
    sessionsStore.upcomingRealTimeSessions = [mockSession]

    fetchApiCall
      // First API call (fetch token)
      .mockResolvedValueOnce(mockTokenResponse)
      // Second API call (fetch session status)
      .mockResolvedValueOnce(mockSessionStatusResponse)

    vi.useFakeTimers()

    // Third API call (fetch session status)
    // Fourth API call (fetch session token)
    sessionsStore.startPolling()

    // Fast forward the timer to simulate 10 seconds passing for polling
    vi.advanceTimersByTime(10000)

    await flushPromises()

    expect(sessionsStore.currentStatus).toBe('ACTIVE')
    expect(fetchApiCall).toHaveBeenCalledTimes(4)

    // Restore real timers at the end of the test
    vi.useRealTimers()
  }, 10000)
})
