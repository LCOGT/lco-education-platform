import { vi, describe, it, expect, beforeEach } from 'vitest'
import { fetchApiCall } from '../../../utils/api.js'
import { fetchSemesterData, currentSemesterEnd, currentSemesterStart } from '../../../utils/calendarUtils.js'
import { createTestStores } from '../../../utils/testUtils'

vi.mock('@/utils/api.js', () => ({
  fetchApiCall: vi.fn()
}))

describe('calendarUtils.js', () => {
  let configurationStore

  beforeEach(() => {
    const { configurationStore: store } = createTestStores()
    configurationStore = store
    fetchApiCall.mockClear()
  })

  describe('fetchSemesterData', () => {
    it('sets currentSemesterStart and currentSemesterEnd after making the fetchApiCall', async () => {
      const mockResponse = {
        results: [
          { start: '2024-01-01', end: '2024-06-30' },
          { start: '2024-07-01', end: '2024-12-31' }
        ]
      }

      // Mocking today's date to ensure the correct semester is selected
      const today = new Date('2024-08-15')
      // This sets the system time to the provided date
      vi.setSystemTime(today)

      fetchApiCall.mockImplementationOnce(({ successCallback }) => {
        successCallback(mockResponse)
      })

      await fetchSemesterData()

      expect(fetchApiCall).toHaveBeenCalledTimes(1)
      expect(fetchApiCall).toHaveBeenCalledWith({
        url: 'http://mock-api.com/semesters/',
        method: 'GET',
        successCallback: expect.any(Function)
      })

      expect(currentSemesterStart).toBe('2024-07-01')
      expect(currentSemesterEnd).toBe('2024-12-31')
    })
  })
})
