import { shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import flushPromises from 'flush-promises'
import PolledThumbnails from '../../../components/RealTimeInterface/PolledThumbnails.vue'
import { fetchApiCall } from '../../../utils/api'
import { createTestStores } from '../../../utils/testUtils'

vi.mock('../../../utils/api', () => ({
  fetchApiCall: vi.fn()
}))

describe('PolledThumbnails.vue', () => {
  let wrapper
  let response

  const makeThumbnail = (key, suffix, size = 'e91') => ({
    key,
    url: `https://archive.example/${suffix}-${size}-large_thumbnail.jpg`
  })

  beforeEach(async () => {
    vi.useFakeTimers()
    response = { results: [makeThumbnail('key-1', 'first')] }
    fetchApiCall.mockImplementation(({ successCallback }) => {
      successCallback(response)
      return Promise.resolve(response)
    })

    const { pinia, realTimeSessionsStore, configurationStore, obsPortalDataStore } = createTestStores()
    const session = { id: 123 }
    obsPortalDataStore.upcomingRealTimeSessions = { [session.id]: session }
    realTimeSessionsStore.currentSessionId = session.id
    configurationStore.demo = false

    wrapper = shallowMount(PolledThumbnails, {
      global: { plugins: [pinia] }
    })
    await flushPromises()
  })

  afterEach(() => {
    wrapper.unmount()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders the latest URL when the thumbnail key changes', async () => {
    expect(wrapper.find('img').attributes('src')).toBe('https://archive.example/first-e91-large_thumbnail.jpg')

    response = { results: [makeThumbnail('key-2', 'second')] }
    vi.advanceTimersByTime(1000)
    await flushPromises()

    expect(wrapper.find('img').attributes('src')).toBe('https://archive.example/second-e91-large_thumbnail.jpg')
    expect(wrapper.emitted('thumbnailsFetched')).toEqual([[1]])
  })

  it('updates repeatedly when the key changes again without emitting a new count', async () => {
    response = { results: [makeThumbnail('key-2', 'second')] }
    vi.advanceTimersByTime(1000)
    await flushPromises()

    response = { results: [makeThumbnail('key-3', 'third')] }
    vi.advanceTimersByTime(1000)
    await flushPromises()

    expect(wrapper.find('img').attributes('src')).toBe('https://archive.example/third-e91-large_thumbnail.jpg')
    expect(wrapper.emitted('thumbnailsFetched')).toEqual([[1]])
  })

  it('uses the best available thumbnail for each requested image', async () => {
    response = {
      results: [
        makeThumbnail('e45-key-1', 'first', 'e45'),
        makeThumbnail('e45-key-2', 'second', 'e45'),
        makeThumbnail('e45-key-3', 'third', 'e45')
      ]
    }
    vi.advanceTimersByTime(1000)
    await flushPromises()

    expect(wrapper.emitted('thumbnailsFetched')).toEqual([[1], [3]])
    expect(wrapper.find('img').attributes('src')).toBe('https://archive.example/third-e45-large_thumbnail.jpg')

    response = {
      results: [
        makeThumbnail('e45-key-1', 'first', 'e45'),
        makeThumbnail('e45-key-2', 'second', 'e45'),
        makeThumbnail('e45-key-3', 'third', 'e45'),
        makeThumbnail('e91-key-1', 'new')
      ]
    }
    vi.advanceTimersByTime(1000)
    await flushPromises()

    expect(wrapper.emitted('thumbnailsFetched')).toEqual([[1], [3]])
    expect(wrapper.find('img').attributes('src')).toBe('https://archive.example/third-e45-large_thumbnail.jpg')

    response = {
      results: [
        makeThumbnail('e45-key-1', 'first', 'e45'),
        makeThumbnail('e45-key-2', 'second', 'e45'),
        makeThumbnail('e45-key-3', 'third', 'e45'),
        makeThumbnail('e91-key-1', 'new'),
        makeThumbnail('e91-key-2', 'newer')
      ]
    }
    vi.advanceTimersByTime(1000)
    await flushPromises()

    expect(wrapper.find('img').attributes('src')).toBe('https://archive.example/third-e45-large_thumbnail.jpg')

    response = {
      results: [
        makeThumbnail('e45-key-1', 'first', 'e45'),
        makeThumbnail('e45-key-2', 'second', 'e45'),
        makeThumbnail('e45-key-3', 'third', 'e45'),
        makeThumbnail('e91-key-1', 'new'),
        makeThumbnail('e91-key-2', 'newer'),
        makeThumbnail('e91-key-3', 'newest')
      ]
    }
    vi.advanceTimersByTime(1000)
    await flushPromises()

    expect(wrapper.find('img').attributes('src')).toBe('https://archive.example/newest-e91-large_thumbnail.jpg')
  })

  it('clears polling when unmounted', async () => {
    const callsBeforeUnmount = fetchApiCall.mock.calls.length
    wrapper.unmount()
    vi.advanceTimersByTime(2000)

    expect(fetchApiCall).toHaveBeenCalledTimes(callsBeforeUnmount)
  })
})
