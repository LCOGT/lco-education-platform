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
          '0M4-SCICAM-QHY600': {
            'class': '0m4',
            'optical_elements': {
              'filters': [
                { name: 'Filter A', code: 'FA', schedulable: true },
                { name: 'Filter B', code: 'FB', schedulable: false }
              ]
            }
          },
          '0M4-SCICAM-FLI': {
            'class': '0m4',
            'optical_elements': {
              'filters': [
                { name: 'Filter D', code: 'FD', schedulable: true },
                { name: 'Filter E', code: 'FE', schedulable: true }
              ]
            }
          }
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
        url: 'http://mock-api.com/instruments',
        method: 'GET',
        successCallback: expect.any(Function),
        failCallback: expect.any(Function)
      })
    )

    await flushPromises()

    // filters through the non-schedulable filters
    expect(wrapper.vm.filterList).toEqual([
      { name: 'Filter A', code: 'FA' },
      { name: 'Filter D', code: 'FD' },
      { name: 'Filter E', code: 'FE' }
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
    // Checks that filterList has been populated correctly
    expect(wrapper.vm.filterList).toEqual([
      { name: 'Filter A', code: 'FA' },
      { name: 'Filter D', code: 'FD' },
      { name: 'Filter E', code: 'FE' }
    ])

    // Simulates selecting a filter from the dropdown
    wrapper.vm.settings.filter = 'FA'
    wrapper.vm.settings.filterName = 'Filter A'
    wrapper.vm.settings.exposureTime = '30'
    wrapper.vm.settings.count = '15'

    await wrapper.vm.addExposure()

    // Check that the event is emitted with the expected payload
    expect(wrapper.emitted().exposuresUpdated).toBeTruthy()
    expect(wrapper.emitted().exposuresUpdated[0][0]).toEqual([
      {
        filter: 'FA',
        filterName: 'Filter A',
        exposureTime: '30',
        count: '15'
      }
    ])
  })
})
