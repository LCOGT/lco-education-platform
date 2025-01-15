import { vi, describe, it, expect, beforeEach } from 'vitest'
import { getFilterList } from '../../../utils/populateInstrumentsUtils.js'
import { fetchApiCall } from '../../../utils/api.js'
import { createTestStores } from '../../../utils/testUtils'

vi.mock('@/utils/api.js', () => ({
  fetchApiCall: vi.fn()
}))

describe('thumbnailsUtils.js', () => {
  let configurationStore

  beforeEach(() => {
    const { configurationStore: store } = createTestStores()
    configurationStore = store
    fetchApiCall.mockClear()
  })

  describe('getFilterList', () => {
    beforeEach(() => {
      fetchApiCall.mockClear()
    })

    it('fetches instruments and returns schedulable filters', async () => {
    // Mock API response
      fetchApiCall.mockResolvedValueOnce({
        '0M4-SCICAM-QHY600': {
          class: '0m4',
          optical_elements: {
            filters: [
              { name: 'Filter A', code: 'FA', schedulable: true },
              { name: 'Filter B', code: 'FB', schedulable: false }
            ]
          }
        },
        '0M4-SCICAM-FLI': {
          class: '0m4',
          optical_elements: {
            filters: [
              { name: 'Filter D', code: 'FD', schedulable: true },
              { name: 'Filter E', code: 'FE', schedulable: true }
            ]
          }
        },
        // This instrument should be ignored
        '1M0-SCICAM': {
          class: '1m0',
          optical_elements: {
            filters: [
              { name: 'Filter X', code: 'FX', schedulable: true }
            ]
          }
        }
      })

      const result = await getFilterList()

      expect(result).toEqual([
        { name: 'Filter A', code: 'FA' },
        { name: 'Filter D', code: 'FD' },
        { name: 'Filter E', code: 'FE' }
      ])

      expect(fetchApiCall).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('instruments'),
          method: 'GET'
        })
      )
    })

    it('returns an empty array if no schedulable filters are found', async () => {
      fetchApiCall.mockResolvedValueOnce({
        '0M4-SCICAM-QHY600': {
          class: '0m4',
          optical_elements: {
            filters: [
              { name: 'Filter A', code: 'FA', schedulable: false }
            ]
          }
        }
      })

      const result = await getFilterList()

      expect(result).toEqual([])
    })
  })
})
