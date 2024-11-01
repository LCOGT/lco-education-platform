import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { fetchApiCall } from '../../../utils/api.js'
import { createTestStores } from '../../../utils/testUtils'
import flushPromises from 'flush-promises'
import { useObsPortalDataStore } from '../../../stores/obsPortalData' // Adjust the import path if necessary

vi.mock('@/utils/api', () => ({
  fetchApiCall: vi.fn()
}))

describe('Real Time Sessions Store', () => {
  let realTimeSessionsStore
  let obsPortalDataStore

  beforeEach(() => {
    fetchApiCall.mockClear()
    const { realTimeSessionsStore: store } = createTestStores()
    realTimeSessionsStore = store

    // Set up the mock for useObsPortalDataStore
    obsPortalDataStore = useObsPortalDataStore()
    obsPortalDataStore.upcomingRealTimeSessions = {
      1: {
        id: 1,
        state: 'PENDING',
        observation_type: 'REAL_TIME',
        start: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
        end: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
      }
    }
  })

  afterEach(() => {
    realTimeSessionsStore.stopPolling()
    vi.clearAllMocks()
  })

  it('fetches session token correctly', async () => {
    const mockTokenResponse = { token: 'mockedToken' }

    realTimeSessionsStore.currentSessionId = 1
    fetchApiCall.mockResolvedValueOnce(mockTokenResponse)

    await realTimeSessionsStore.fetchSessionToken()
    expect(realTimeSessionsStore.sessionTokens[1]).toBe('mockedToken')
  })

  it('starts polling and updates session status correctly', async () => {
    const mockSessionStatusResponse = { session_status: 'ACTIVE' }
    const mockTokenResponse = { token: 'mockToken' }

    realTimeSessionsStore.currentSessionId = 1

    fetchApiCall
      // First API call (fetch token)
      .mockResolvedValueOnce(mockTokenResponse)
      // Second API call (first poll)
      .mockResolvedValueOnce(mockSessionStatusResponse)
      // Subsequent polls
      .mockResolvedValue(mockSessionStatusResponse)

    vi.useFakeTimers()

    realTimeSessionsStore.startPolling()

    // Fast forward the timer to simulate polling (10 seconds)
    vi.advanceTimersByTime(10000)
    await flushPromises()

    expect(realTimeSessionsStore.currentStatus).toBe('ACTIVE')
    // Token + first status fetch
    expect(fetchApiCall).toHaveBeenCalledTimes(2)

    // Fast-forward more time for the next polling iteration (1 second)
    vi.advanceTimersByTime(1000)
    await flushPromises()
    // Token + two status fetches
    expect(fetchApiCall).toHaveBeenCalledTimes(3)
    vi.advanceTimersByTime(1000)
    await flushPromises()
    // Token + three status fetches
    expect(fetchApiCall).toHaveBeenCalledTimes(4)

    vi.useRealTimers()
  }, 10000)
})
