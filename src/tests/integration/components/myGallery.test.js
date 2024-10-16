import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import flushPromises from 'flush-promises'
import MyGallery from '../../../components/Images/MyGallery.vue'
import { fetchApiCall } from '../../../utils/api.js'
import { formatDate } from '../../../utils/formatTime.js'
import { createTestStores } from '../../../utils/testUtils.js'

// Mock the fetchApiCall function
vi.mock('../../../utils/api.js', () => ({
  fetchApiCall: vi.fn()
}))

// Creates a fresh component instance so that each test is isolated
// Avoids cross-test pollution and ensures a clean slate for each test
function createComponent () {
  // Initialize the stores using the shared utility
  const { pinia, sessionsStore } = createTestStores()

  // Set up initial state for the sessions store
  sessionsStore.fulfilledRequests = {
    results: [
      { id: 'session1', start: '2024-08-01T12:00:00Z' },
      { id: 'session2', start: '2024-08-01T12:30:00Z' }
    ]
  }

  // Mount the component with the pinia stores provided
  return mount(MyGallery, {
    global: {
      plugins: [pinia]
    }
  })
}

describe('MyGallery.vue', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()
  })

  it('renders a loading indicator on mounted', () => {
    const wrapper = createComponent()
    expect(wrapper.find('.loading').exists()).toBe(true)
  })

  it('fetches thumbnails for each session on mount', async () => {
    fetchApiCall.mockImplementation(({ url, successCallback }) => {
      if (url.includes('session1')) {
        successCallback({
          results: [{ url: 'http://mock-image.com/image1.jpg' }]
        })
      } else if (url.includes('session2')) {
        successCallback({
          results: [{ url: 'http://mock-image.com/image2.jpg' }]
        })
      }
    })

    const wrapper = createComponent()
    await wrapper.vm.$nextTick()

    // Two API calls are made - one for each session ID - to fetch images for both sessions
    expect(fetchApiCall).toHaveBeenCalledTimes(2)
    expect(fetchApiCall).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://mock-api.com/thumbnails/?observation_id=session1&size=large'
      })
    )
    expect(fetchApiCall).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://mock-api.com/thumbnails/?observation_id=session2&size=large'
      })
    )
  })

  it('renders sessions with thumbnails after loading', async () => {
    fetchApiCall.mockImplementation(({ url, successCallback }) => {
      if (url.includes('session1')) {
        successCallback({
          results: [{ url: 'http://mock-image.com/image1.jpg' }]
        })
      } else if (url.includes('session2')) {
        successCallback({
          results: [{ url: 'http://mock-image.com/image2.jpg' }]
        })
      }
    })

    const wrapper = createComponent()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.loading').exists()).toBe(false)

    const allSessionThumbnails = wrapper.findAll('.thumbnail')
    expect(allSessionThumbnails.length).toBe(2)
    expect(allSessionThumbnails[0].attributes('src')).toBe('http://mock-image.com/image2.jpg')
    expect(allSessionThumbnails[1].attributes('src')).toBe('http://mock-image.com/image1.jpg')
  })

  it('renders sessions in the correct descending order', async () => {
    fetchApiCall.mockImplementation(({ url, successCallback }) => {
      if (url.includes('session1')) {
        successCallback({
          results: [{ url: 'http://mock-image.com/image1.jpg' }]
        })
      } else if (url.includes('session2')) {
        successCallback({
          results: [{ url: 'http://mock-image.com/image2.jpg' }]
        })
      }
    })

    const wrapper = createComponent()
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 100))

    const sessionElements = wrapper.findAll('h3.startTime')
    expect(sessionElements.length).toBe(2)

    const mostRecentSession = sessionElements[0]
    const earlierSession = sessionElements[1]

    expect(mostRecentSession.text()).toContain(formatDate('2024-08-01T12:30:00Z'))
    expect(earlierSession.text()).toContain(formatDate('2024-08-01T12:00:00Z'))
  })

  it('does not render sessions without thumbnails', async () => {
    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback({ results: [] })
    })

    const wrapper = createComponent()
    await flushPromises()

    const thumbnails = wrapper.findAll('.thumbnail')
    expect(thumbnails.length).toBe(0)
  })
})
