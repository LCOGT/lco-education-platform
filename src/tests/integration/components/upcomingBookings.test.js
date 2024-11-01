import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import UpcomingBookings from '../../../components/Dashboard/UpcomingBookings.vue'
import { fetchApiCall } from '../../../utils/api.js'
import { createTestStores } from '../../../utils/testUtils.js'

// Mock the fetchApiCall function
vi.mock('../../../utils/api.js', () => ({
  fetchApiCall: vi.fn()
}))

// Mock the useRouter
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

const now = new Date().getTime()
const startTime = new Date(now + 30 * 60000).toISOString()
const startTime2 = new Date(now + 45 * 60000).toISOString()

describe('UpcomingBookings.vue', () => {
  let wrapper
  let obsPortalDataStore

  beforeEach(() => {
    vi.resetAllMocks()
    const { pinia, obsPortalDataStore: store } = createTestStores()
    obsPortalDataStore = store

    // Mock the correct store property, `upcomingRealTimeSessions`
    obsPortalDataStore.upcomingRealTimeSessions = [
      { id: 'session1', start: startTime },
      { id: 'session2', start: startTime2 }
    ]

    wrapper = mount(UpcomingBookings, {
      global: {
        plugins: [pinia]
      }
    })
  })

  it('fetches sessions on mount', async () => {
    expect(fetchApiCall).toHaveBeenCalled()
    expect(obsPortalDataStore.upcomingRealTimeSessions.length).toBe(2)

    await wrapper.vm.$nextTick()

    const h3Text = wrapper.find('h3').text()
    expect(h3Text).toBe('Upcoming Bookings')
  })

  it('deletes a session on click', async () => {
    fetchApiCall.mockImplementation(({ url }) => {
      if (url.includes('session1')) {
        obsPortalDataStore.upcomingRealTimeSessions = obsPortalDataStore.upcomingRealTimeSessions.filter(session => session.id !== 'session1')
      }
    })

    const deleteButtons = wrapper.findAll('.deleteButton')
    expect(deleteButtons.length).toBe(2)
    await deleteButtons.at(0).trigger('click')
    expect(fetchApiCall).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://mock-api.com/realtime/session1/',
        method: 'DELETE'
      })
    )
    expect(obsPortalDataStore.upcomingRealTimeSessions.length).toBe(1)
  })
})
