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
    it('fetches thumbnails for a given queryValue and returns only reduced thumbnails', async () => {
      const mockResponse = {
        results: [
          {
            'id': 123,
            'frame': 789,
            'size': 'small',
            'basename': 'mockbasename-e91-1-small_thumbnail',
            'extension': '.jpg',
            'key': 'secret1',
            'url': 'http://mock-api.com/thumbnails/1'
          },
          {
            'id': 456,
            'frame': 321,
            'size': 'small',
            'basename': 'mockbasename-notreduced-2-small_thumbnail',
            'extension': '.jpg',
            'key': 'secret2',
            'url': 'http://mock-api.com/thumbnails/2'
          }
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

      expect(thumbnails).toEqual([
        {
          'id': 123,
          'frame': 789,
          'size': 'small',
          'basename': 'mockbasename-e91-1-small_thumbnail',
          'extension': '.jpg',
          'key': 'secret1',
          'url': 'http://mock-api.com/thumbnails/1'
        }
      ])
    })
  })
})
