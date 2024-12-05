import { vi, describe, it, expect, beforeEach } from 'vitest'
import { fetchApiCall } from '../../../utils/api.js'
import { createTestStores } from '../../../utils/testUtils'
import { getThumbnails } from '../../../utils/thumbnailsUtils.js'

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

  describe('getThumbnails', () => {
    it('fetches thumbnails for a given queryValue', async () => {
      const mockResponse = {
        results: [
          { url: 'http://mock-api.com/thumbnails/1' },
          { url: 'http://mock-api.com/thumbnails/2' }
        ]
      }

      fetchApiCall.mockImplementationOnce(({ successCallback }) => {
        successCallback(mockResponse)
      })

      const thumbnails = await getThumbnails('paramSample', 1234)

      expect(fetchApiCall).toHaveBeenCalledTimes(1)
      expect(fetchApiCall).toHaveBeenCalledWith({
        url: 'http://mock-api.com/thumbnails/?paramSample=1234&size=small',
        method: 'GET',
        successCallback: expect.any(Function),
        failCallback: expect.any(Function)
      })

      expect(thumbnails).toEqual(['http://mock-api.com/thumbnails/1', 'http://mock-api.com/thumbnails/2'])
    })
  })
})
