import { mount } from '@vue/test-utils'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import BeginnerScheduling from '../../../components/Scheduling/BeginnerScheduling.vue'
import { fetchApiCall } from '../../../utils/api.js'
import { createTestStores } from '../../../utils/testUtils'
import flushPromises from 'flush-promises'

vi.mock('@/utils/api.js', () => ({
  fetchApiCall: vi.fn()
}))

describe('BeginnerScheduling.vue', () => {
  let wrapper

  beforeEach(() => {
    fetchApiCall.mockClear()
    const { pinia } = createTestStores()

    wrapper = mount(BeginnerScheduling, {
      global: {
        plugins: [pinia]
      }
    })
  })

  it('calls fetchApiCall when date range is updated', async () => {
    const mockResponse = {
      targets: [
        {
          name: 'Target 1',
          ra: 187.25,
          dec: -11.56,
          avmdesc: 'Galaxy',
          desc: 'A cool target',
          filters: [{ name: 'Filter 1', exposure: 300, count: 5 }]
        }
      ]
    }

    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback(mockResponse)
    })

    // Simulate selecting a date range (which triggers fetchTargets)
    const newDateRange = [new Date(2024, 10, 10), new Date(2024, 10, 15)]
    await wrapper.vm.handleDateRangeUpdate(newDateRange)

    expect(fetchApiCall).toHaveBeenCalledTimes(1)
    expect(fetchApiCall).toHaveBeenCalledWith({
      url: 'https://whatsup.lco.global/range/?start=2024-11-10T22:00:00&end=2024-11-15T22:00:00&aperture=0m4&mode=full',
      method: 'GET',
      successCallback: expect.any(Function),
      failCallback: expect.any(Function)
    })

    await flushPromises()

    expect(wrapper.vm.selectedTargets.length).toBe(1)
    expect(wrapper.vm.selectedTargets[0].name).toBe('Target 1')
    expect(wrapper.vm.selectedTargets[0].ra).toBe(187.25)
    expect(wrapper.vm.selectedTargets[0].dec).toBe(-11.56)
    expect(wrapper.vm.selectedTargets[0].filters[0].name).toBe('Filter 1')
    expect(wrapper.vm.selectedTargets[0].filters[0].exposure).toBe(300)
    expect(wrapper.vm.selectedTargets[0].filters[0].count).toBe(5)
  })
})