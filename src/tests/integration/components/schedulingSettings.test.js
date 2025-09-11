import { mount } from '@vue/test-utils'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import SchedulingSettings from '../../../components/Scheduling/SchedulingSettings.vue'
import { fetchApiCall } from '../../../utils/api.js'
import { createTestStores } from '../../../utils/testUtils'
import flushPromises from 'flush-promises'

vi.mock('@/utils/api.js', () => ({
  fetchApiCall: vi.fn()
}))

describe('SchedulingSettings.vue --> Sidereal Flow', () => {
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
          objectType: 'sidereal',
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
    await wrapper.vm.fetchSiderealTargetDetails('TestTarget')

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
    await wrapper.vm.fetchSiderealTargetDetails('InvalidTarget')

    await flushPromises()

    expect(wrapper.vm.targetError).toBe('Target not found, try another target.')
  })
})

describe('SchedulingSettings.vue --> Non-Sidereal Flow', () => {
  let wrapper

  beforeEach(() => {
    fetchApiCall.mockClear()
    const { pinia } = createTestStores()

    wrapper = mount(SchedulingSettings, {
      global: {
        plugins: [pinia]
      },
      props: {
        showProjectField: true,
        showTitleField: true,
        objectType: 'nonsidereal',
        startDate: '2025-09-08',
        endDate: '2025-09-11'
      }
    })
  })

  it('fetches ephemeris, checks availability, fetches simbad, and confirms target', async () => {
    const mockEphemerisResponse = {
      Jupiter: [
        {
          'date': 'Thu, 11 Sep 2025 00:00:00 GMT',
          'dec_deg': 22.041666666666668,
          'elong': '100',
          'ra_deg': 110.81554166666668
        }
      ]
    }

    const mockSimbadResponse = {
      'argument_of_perihelion': 273.675560180757,
      'ascending_node': 100.5313644889547,
      'eccentricity': 0.04847073928792924,
      'epoch_jd': 2460181.5,
      'inclination': 1.303440438605707,
      'mean_anomaly': 17.7766219416819,
      'mean_daily_motion': 0.08307449251445106,
      'name': 'Jupiter',
      'semimajor_axis': 5.20350181513235
    }

    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback(mockEphemerisResponse)
      return Promise.resolve()
    })

    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback(mockSimbadResponse)
      return Promise.resolve()
    })

    wrapper.vm.targetInput.name = 'Jupiter'
    await wrapper.vm.fetchNonSiderealTargetDetails('Jupiter')
    await flushPromises()

    expect(wrapper.vm.targetList[wrapper.vm.activeTargetIndex].simbadResponse).toEqual(mockSimbadResponse)
    expect(wrapper.vm.isTargetConfirmed).toBe(true)
    expect(wrapper.vm.targetError).toBe('')
  })

  it('shows error if non-sidereal target is not schedulable', async () => {
    const mockEphemerisResponse = {
      Jupiter: [
        {
          'date': 'Thu, 11 Sep 2025 00:00:00 GMT',
          'dec_deg': 22.041666666666668,
          'elong': '50',
          'ra_deg': 110.81554166666668
        }
      ]
    }

    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback(mockEphemerisResponse)
      return Promise.resolve()
    })

    wrapper.vm.targetInput.name = 'Jupiter'
    await wrapper.vm.fetchNonSiderealTargetDetails('Jupiter')
    await flushPromises()

    expect(wrapper.vm.isTargetConfirmed).toBe(false)
    expect(wrapper.vm.targetError).toMatch(/not schedulable/i)
  })

  it('adds an exposure after confirming a non-sidereal target', async () => {
    const mockEphemerisResponse = {
      Jupiter: [
        {
          'date': 'Thu, 11 Sep 2025 00:00:00 GMT',
          'dec_deg': 22.041666666666668,
          'elong': '100',
          'ra_deg': 110.81554166666668
        }
      ]
    }

    const mockSimbadResponse = {
      'argument_of_perihelion': 273.675560180757,
      'ascending_node': 100.5313644889547,
      'eccentricity': 0.04847073928792924,
      'epoch_jd': 2460181.5,
      'inclination': 1.303440438605707,
      'mean_anomaly': 17.7766219416819,
      'mean_daily_motion': 0.08307449251445106,
      'name': 'Jupiter',
      'semimajor_axis': 5.20350181513235
    }

    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback(mockEphemerisResponse)
      return Promise.resolve()
    })
    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback(mockSimbadResponse)
      return Promise.resolve()
    })

    wrapper.vm.targetInput.name = 'Jupiter'
    await wrapper.vm.fetchNonSiderealTargetDetails('Jupiter')
    await flushPromises()

    wrapper.vm.settings.filter = 'gp'
    wrapper.vm.settings.exposureTime = '100'
    wrapper.vm.settings.count = '1'
    await wrapper.vm.addExposure()

    expect(wrapper.vm.targetList[wrapper.vm.activeTargetIndex].exposures.length).toBe(1)
    expect(wrapper.vm.targetList[wrapper.vm.activeTargetIndex].exposures[0]).toMatchObject({
      filter: 'gp',
      exposureTime: '100',
      count: '1'
    })
  })
})
