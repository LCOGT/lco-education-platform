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

    wrapper.vm.targetInput.name = 'TestTarget'
    await wrapper.vm.getRaDecFromTargetName()

    await flushPromises()

    // Verify the RA and Dec were updated to degrees
    expect(wrapper.vm.targetList[wrapper.vm.activeTargetIndex].ra).toBe(10.685)
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
    wrapper.vm.targetInput.name = 'InvalidTarget'
    await wrapper.vm.getRaDecFromTargetName()

    await flushPromises()

    expect(wrapper.vm.targetError).toBe('Target not found, try another target.')
  })
})
