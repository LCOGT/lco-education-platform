import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia, defineStore } from 'pinia'
import flushPromises from 'flush-promises'
import MyGallery from '../../../components/Images/MyGallery.vue'
import { fetchApiCall } from '../../../utils/api.js'
import { formatDate } from '../../../utils/formatTime.js'

// Mock the fetchApiCall function
vi.mock('../../../utils/api.js', () => ({
  fetchApiCall: vi.fn()
}))

describe('MyGallery.vue', () => {
  let wrapper
  let pinia
  let useSessionsStore
  let useUserDataStore
  let useConfigurationStore

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    // Define and initialize Pinia stores
    useSessionsStore = defineStore('sessions', {
      state: () => ({
        sessions: {
          results: [
            { id: 'session1', start: '2024-08-01T12:00:00Z' },
            { id: 'session2', start: '2024-08-01T12:30:00Z' }
          ]
        }
      })
    })

    useUserDataStore = defineStore('userData', {
      state: () => ({
        authToken: 'mock-token'
      })
    })

    useConfigurationStore = defineStore('configuration', {
      state: () => ({
        thumbnailArchiveUrl: 'http://mock-api.com/'
      })
    })

    // Initialize the stores
    const sessionsStore = useSessionsStore()
    const userDataStore = useUserDataStore()
    const configurationStore = useConfigurationStore()

    // Reset fetchApiCall mock
    fetchApiCall.mockClear()

    // Mount the component with the Pinia stores provided
    wrapper = mount(MyGallery, {
      global: {
        plugins: [pinia]
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks() // Clear all mocks after each test to avoid shared state issues
  })

  it('renders a loading indicator on mounted', () => {
    console.log('Initial loading state:', wrapper.find('.loading').exists())
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

    // Waits for component to update
    await wrapper.vm.$nextTick()

    console.log('API Call Count:', fetchApiCall.mock.calls.length)

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
      console.log('URL HERE:', url)
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
        console.log('Returning data for session2')
        successCallback({
          results: [{ url: 'http://mock-image.com/image2.jpg' }]
        })
      }
    })

    // Ensure promises are resolved before continuing
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Log the internal state of the component
    console.log('Thumbnails Map:', wrapper.vm.thumbnailsMap)
    console.log('Filtered Sessions:', wrapper.vm.filteredSessions)
    console.log('Sessions with Thumbnails:', wrapper.vm.sessionsWithThumbnails)

    const sessionElements = wrapper.findAll('h3.startTime')
    console.log('Session Elements:', sessionElements)

    expect(sessionElements.length).toBe(2)

    const mostRecentSession = sessionElements[0]
    const earlierSession = sessionElements[1]

    expect(mostRecentSession.text()).toContain(formatDate('2024-08-01T12:30:00Z'))
    expect(earlierSession.text()).toContain(formatDate('2024-08-01T12:00:00Z'))
  })

  it('does not render sessions without thumbnails', async () => {
    // Mock API response for one session with no thumbnails
    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback({ results: [] })
    })
    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback({ results: [{ url: 'http://mock-image.com/image1.jpg' }] })
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    const thumbnails = wrapper.findAll('.thumbnail')
    expect(thumbnails.length).toBe(2)
    expect(thumbnails[0].attributes('src')).toBe('http://mock-image.com/image2.jpg')
  })
})
