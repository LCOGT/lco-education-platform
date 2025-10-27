import { shallowMount } from '@vue/test-utils'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import SchedulingView from '../../../components/Views/SchedulingView.vue'
import { fetchApiCall } from '../../../utils/api.js'
import { createTestStores } from '../../../utils/testUtils'
import flushPromises from 'flush-promises'

vi.mock('../../../utils/api.js', () => ({
  fetchApiCall: vi.fn()
}))

const mockRouter = { push: vi.fn() }
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

describe('SchedulingView.vue', () => {
  let wrapper

  beforeEach(() => {
    fetchApiCall.mockClear()
    const { pinia } = createTestStores()

    wrapper = shallowMount(SchedulingView, {
      global: {
        plugins: [pinia],
        provide: {
          router: mockRouter
        }
      }
    })
  })

  it('calls fetchApiCall to schedule observation', async () => {
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 3600 * 1000)

    const formatISOWithoutMilliseconds = (date) =>
      date.toISOString().replace(/\.\d{3}Z$/, 'Z')

    const mockObservationData = {
      target: {
        name: 'Test Target',
        ra: 12.0,
        dec: -20.0,
        exposures: [{ filter: 'F1', exposureTime: 300, count: 1 }]
      },
      settings: [{ filter: 'F1', exposureTime: 300, count: 1 }],
      startDate: formatISOWithoutMilliseconds(now),
      endDate: formatISOWithoutMilliseconds(oneHourLater),
      proposal: 'Test Proposal',
      isSidereal: true
    }
    const mockRequestList = [
      {
        acceptability_threshold: 90,
        configuration_repeats: 1,
        optimization_type: 'TIME',
        configurations: [
          {
            type: 'EXPOSE',
            instrument_type: '0M4-SCICAM-QHY600',
            instrument_configs: [
              {
                exposure_count: 1,
                exposure_time: 300,
                mode: 'central30x30',
                rotator_mode: '',
                extra_params: {
                  offset_ra: 0,
                  offset_dec: 0,
                  defocus: 0
                },
                optical_elements: {
                  filter: 'F1'
                }
              }
            ],
            acquisition_config: {
              mode: 'OFF',
              extra_params: {}
            },
            guiding_config: {
              mode: 'ON',
              optional: true,
              extra_params: {}
            },
            target: {
              name: 'Test Target',
              type: 'ICRS',
              ra: 12.0,
              dec: -20.0,
              proper_motion_ra: null,
              proper_motion_dec: null,
              epoch: 2000,
              parallax: null,
              extra_params: {}
            },
            constraints: {
              max_airmass: 1.6,
              min_lunar_distance: 30,
              max_lunar_phase: 1
            }
          }
        ],
        windows: [
          {
            start: mockObservationData.startDate,
            end: mockObservationData.endDate
          }
        ],
        location: {
          telescope_class: '0m4'
        }
      }
    ]

    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback()
    })

    wrapper.vm.observationData = mockObservationData

    await wrapper.vm.sendObservationRequestOrBuildCadencePayload()
    await flushPromises()
    const YYYYMMDD = new Date().toISOString().split('T')[0]
    expect(fetchApiCall).toHaveBeenCalledWith({
      url: 'http://mock-api.com/requestgroups/',
      method: 'POST',
      body: {
        name: `Test Target_${YYYYMMDD}`,
        proposal: 'Test Proposal',
        ipp_value: 1.0,
        operator: 'SINGLE',
        observation_type: 'NORMAL',
        requests: mockRequestList
      },
      successCallback: expect.any(Function),
      failCallback: expect.any(Function)
    })

    expect(wrapper.vm.showScheduled).toBe(true)
  })
  it('calls fetchApiCall with cadence payload when cadence is selected and valid', async () => {
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 3600 * 1000)
    const formatISOWithoutMilliseconds = (date) =>
      date.toISOString().replace(/\.\d{3}Z$/, 'Z')

    const mockObservationData = {
      targets: [{
        name: 'Test Target',
        ra: 12.0,
        dec: -20.0,
        exposures: [{ filter: 'F1', exposureTime: 300, count: 1 }]
      }],
      startDate: formatISOWithoutMilliseconds(now),
      endDate: formatISOWithoutMilliseconds(oneHourLater),
      proposal: 'Test Proposal',
      objectType: 'sidereal',
      cadence: {
        start: formatISOWithoutMilliseconds(now),
        end: formatISOWithoutMilliseconds(oneHourLater),
        period: 24,
        jitter: 1
      },
      isCadenceRequest: true
    }

    const mockRequestList = [
      {
        acceptability_threshold: 90,
        configuration_repeats: 1,
        optimization_type: 'TIME',
        configurations: [
          {
            type: 'EXPOSE',
            instrument_type: '0M4-SCICAM-QHY600',
            instrument_configs: [
              {
                exposure_count: 1,
                exposure_time: 300,
                mode: 'central30x30',
                rotator_mode: '',
                extra_params: {
                  offset_ra: 0,
                  offset_dec: 0,
                  defocus: 0
                },
                optical_elements: {
                  filter: 'F1'
                }
              }
            ],
            acquisition_config: {
              mode: 'OFF',
              extra_params: {}
            },
            guiding_config: {
              mode: 'ON',
              optional: true,
              extra_params: {}
            },
            target: {
              name: 'Test Target',
              type: 'ICRS',
              ra: 12.0,
              dec: -20.0,
              proper_motion_ra: null,
              proper_motion_dec: null,
              epoch: 2000,
              parallax: null,
              extra_params: {}
            },
            constraints: {
              max_airmass: 1.6,
              min_lunar_distance: 30,
              max_lunar_phase: 1
            }
          }
        ],
        windows: [],
        location: {
          telescope_class: '0m4'
        },
        cadence: {
          start: formatISOWithoutMilliseconds(now),
          end: formatISOWithoutMilliseconds(oneHourLater),
          period: 24,
          jitter: 1
        }
      }
    ]

    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback({ cadence: 'mockCadenceResponse' })
    })

    wrapper.vm.observationData = mockObservationData
    wrapper.vm.showGenerateCadence = true
    wrapper.vm.cadenceSelection = 'simple-period'
    wrapper.vm.isCadenceValid = true

    await wrapper.vm.sendObservationRequestOrBuildCadencePayload()
    await flushPromises()

    const YYYYMMDD = new Date().toISOString().split('T')[0]
    expect(fetchApiCall).toHaveBeenCalledWith({
      url: 'http://mock-api.com/requestgroups/cadence/',
      method: 'POST',
      body: {
        name: `Test Target_${YYYYMMDD}`,
        proposal: 'Test Proposal',
        ipp_value: 1.0,
        operator: 'SINGLE',
        observation_type: 'NORMAL',
        requests: mockRequestList
      },
      successCallback: expect.any(Function),
      failCallback: expect.any(Function)
    })
  })

  it('calls fetchApiCall with normal payload after switching cadence back to none', async () => {
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 3600 * 1000)
    const formatISOWithoutMilliseconds = (date) =>
      date.toISOString().replace(/\.\d{3}Z$/, 'Z')

    const mockObservationData = {
      targets: [{
        name: 'Test Target',
        ra: 12.0,
        dec: -20.0,
        exposures: [{ filter: 'F1', exposureTime: 300, count: 1 }]
      }],
      startDate: formatISOWithoutMilliseconds(now),
      endDate: formatISOWithoutMilliseconds(oneHourLater),
      proposal: 'Test Proposal',
      objectType: 'sidereal',
      isCadenceRequest: false
    }

    const mockRequestList = [
      {
        acceptability_threshold: 90,
        configuration_repeats: 1,
        optimization_type: 'TIME',
        configurations: [
          {
            type: 'EXPOSE',
            instrument_type: '0M4-SCICAM-QHY600',
            instrument_configs: [
              {
                exposure_count: 1,
                exposure_time: 300,
                mode: 'central30x30',
                rotator_mode: '',
                extra_params: {
                  offset_ra: 0,
                  offset_dec: 0,
                  defocus: 0
                },
                optical_elements: {
                  filter: 'F1'
                }
              }
            ],
            acquisition_config: {
              mode: 'OFF',
              extra_params: {}
            },
            guiding_config: {
              mode: 'ON',
              optional: true,
              extra_params: {}
            },
            target: {
              name: 'Test Target',
              type: 'ICRS',
              ra: 12.0,
              dec: -20.0,
              proper_motion_ra: null,
              proper_motion_dec: null,
              epoch: 2000,
              parallax: null,
              extra_params: {}
            },
            constraints: {
              max_airmass: 1.6,
              min_lunar_distance: 30,
              max_lunar_phase: 1
            }
          }
        ],
        windows: [
          {
            start: mockObservationData.startDate,
            end: mockObservationData.endDate
          }
        ],
        location: {
          telescope_class: '0m4'
        }
      }
    ]

    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback()
    })

    wrapper.vm.observationData = mockObservationData
    wrapper.vm.showGenerateCadence = false
    wrapper.vm.cadenceSelection = 'none'
    wrapper.vm.isCadenceValid = false

    await wrapper.vm.sendObservationRequestOrBuildCadencePayload()
    await flushPromises()
    const YYYYMMDD = new Date().toISOString().split('T')[0]
    expect(fetchApiCall).toHaveBeenCalledWith({
      url: 'http://mock-api.com/requestgroups/',
      method: 'POST',
      body: {
        name: `Test Target_${YYYYMMDD}`,
        proposal: 'Test Proposal',
        ipp_value: 1.0,
        operator: 'SINGLE',
        observation_type: 'NORMAL',
        requests: mockRequestList
      },
      successCallback: expect.any(Function),
      failCallback: expect.any(Function)
    })
  })
})
