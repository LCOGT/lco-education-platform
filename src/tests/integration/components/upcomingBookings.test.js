import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import UpcomingBookings from '../../../components/Dashboard/UpcomingBookings.vue'
import { useSessionsStore } from '../../../stores/sessions'
import { fetchApiCall } from '../../../utils/api.js'

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
  let sessionsStore

  beforeEach(async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    // Instantiate the sessions store
    sessionsStore = useSessionsStore()

    // Mock the fetchApiCall function to simulate API response
    fetchApiCall.mockImplementation(({ successCallback }) => {
      successCallback({
        results: [
          { id: 'session1', start: startTime },
          { id: 'session2', start: startTime2 }
        ]
      })
    })

    wrapper = mount(UpcomingBookings, {
      global: {
        plugins: [pinia]
      }
    })

    await wrapper.vm.$nextTick()
  })

  it('fetches sessions on mount', async () => {
    expect(fetchApiCall).toHaveBeenCalled()
    expect(sessionsStore.sessions.results.length).toBe(2)

    await wrapper.vm.$nextTick()

    // Checking if the DOM has been updated with the correct text
    const h3Text = wrapper.find('h3').text()
    expect(h3Text).toBe('Upcoming Bookings')
  })

  it('deletes a session when delete button is clicked', async () => {
    fetchApiCall
      .mockImplementationOnce(() => Promise.resolve({
        results: [
          { id: 'session1', start: '2024-08-01T12:00:00Z' },
          { id: 'session2', start: '2024-08-01T12:30:00Z' }
        ]
      }))
      .mockImplementationOnce(() => Promise.resolve())

    // Find the delete button for the first session and click it
    const deleteButton = wrapper.findAll('button.deleteButton').at(0)
    await deleteButton.trigger('click')

    expect(sessionsStore.sessions.results.length).toBe(1)
    expect(sessionsStore.sessions.results[0].id).toBe('session2')

    // Ensure the DELETE fetchApiCall was made with the correct URL
    expect(fetchApiCall).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'realtime/session1/',
        method: 'DELETE'
      })
    )

    // Ensure the DOM reflects the session removal
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).not.toContain(startTime)
  })

  it('handles API failure gracefully', async () => {
    fetchApiCall.mockImplementation(({ failCallback }) => {
      failCallback(new Error('API call failed'))
    })

    const h3Text = wrapper.find('h3').text()
    console.log('h3Text', h3Text)
    const deleteButton = wrapper.findAll('button.deleteButton')
    console.log('deleteButton', deleteButton)
    await deleteButton.trigger('click')

    // Ensure the session was not removed due to API failure
    const sessionsStore = useSessionsStore()
    expect(sessionsStore.sessions.results.length).toBe(2)

    // Ensure the DOM still contains the session
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toContain('2024-08-01T12:00:00Z')
  })
})
