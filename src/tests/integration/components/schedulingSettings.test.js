import { mount } from '@vue/test-utils'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import SchedulingSettings from '../../../components/Scheduling/SchedulingSettings.vue'
import { fetchApiCall } from '../../../utils/api.js'
import { createTestStores } from '../../../utils/testUtils'
import flushPromises from 'flush-promises'

vi.mock('@/utils/api.js', () => ({
  fetchApiCall: vi.fn()
}))

describe('SchedulingSettings.vue', () => {
  let wrapper

  beforeEach(() => {
    fetchApiCall.mockClear()
    const { pinia } = createTestStores()

    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      if (successCallback) {
        successCallback({
          optical_elements: [
            { name: 'Filter 1', code: 'F1', schedulable: true },
            { name: 'Filter 2', code: 'F2', schedulable: true },
            { name: 'Filter 3', code: 'F3', schedulable: false }
          ]
        })
      }
    })

    wrapper = mount(SchedulingSettings, {
      global: {
        plugins: [pinia],
        props: {
          showProjectField: true,
          showTitleField: true,
          target: 'Test Target'
        }
      }
    })
  })

  it('calls fetchApiCall to get filter list on mount', async () => {
    expect(fetchApiCall).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://mock-api.com/opticalelementgroups/128/',
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: expect.any(String)
        }),
        successCallback: expect.any(Function),
        failCallback: expect.any(Function)
      })
    )

    await flushPromises()

    // filters through the non-schedulable filters
    expect(wrapper.vm.filterList).toEqual([
      { name: 'Filter 1', code: 'F1' },
      { name: 'Filter 2', code: 'F2' }
    ])

    expect(fetchApiCall).toHaveBeenCalledTimes(1)
  })

  it('fetches RA and Dec based on the target name and updates state correctly', async () => {
    const mockRaDecResponse = {
      'dec': '+41 16 07.50',
      'dec_d': 41.26875,
      'ra': '00 42 44.330',
      'ra_d': 10.684708
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockRaDecResponse)
      })
    )

    wrapper.vm.targetList[wrapper.vm.activeTargetIndex].name = 'Test Target'
    await wrapper.vm.getRaDecFromTargetName()

    await flushPromises()

    // Verify the RA and Dec were updated to degrees
    expect(wrapper.vm.targetList[wrapper.vm.activeTargetIndex].ra).toBe(0.7123333333333334)
    expect(wrapper.vm.targetList[wrapper.vm.activeTargetIndex].dec).toBe(41.269)

    expect(wrapper.vm.isTargetConfirmed).toBe(true)
  })

  it('displays an error if target name is invalid', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({})
      })
    )

    // Simulate entering an invalid target name and triggering the blur event
    wrapper.vm.targetList[wrapper.vm.activeTargetIndex].name = 'Invalid Target'
    await wrapper.vm.getRaDecFromTargetName()

    await flushPromises()

    expect(wrapper.vm.targetError).toBe('Target not found, try another target.')
  })

  it('emits exposuresUpdated when exposures are added', async () => {
    const mockFilterList = {
      optical_elements: [
        { name: 'Filter 1', code: 'F1', schedulable: true }
      ]
    }

    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback(mockFilterList)
    })

    await flushPromises()

    // Simulate adding an exposure
    wrapper.vm.settings.filter = 'F2'
    wrapper.vm.settings.exposureTime = '30'
    wrapper.vm.settings.count = '15'
    await wrapper.vm.addExposure()

    // Check if exposuresUpdated was emitted with the correct payload
    expect(wrapper.emitted().exposuresUpdated).toBeTruthy()
    expect(wrapper.emitted().exposuresUpdated[0][0]).toEqual([
      {
        filter: 'F2',
        filterName: 'Filter 2',
        exposureTime: '30',
        count: '15'
      }
    ])
  })
})
