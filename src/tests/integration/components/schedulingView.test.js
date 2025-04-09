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

    // Strip milliseconds
    const formatISOWithoutMilliseconds = (date) =>
      date.toISOString().replace(/\.\d{3}Z$/, 'Z')

    const mockObservationData = {
      target: { name: 'Test Target', ra: 12.0, dec: -20.0 },
      settings: [{ filter: 'F1', exposureTime: 300, count: 1 }],
      startDate: formatISOWithoutMilliseconds(now),
      endDate: formatISOWithoutMilliseconds(oneHourLater),
      proposal: 'Test Proposal'
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

    await wrapper.vm.sendObservationRequest()
    await flushPromises()
    const YYYYMMDD = new Date().toISOString().split('T')[0]
    expect(fetchApiCall).toHaveBeenCalledWith({
      url: 'https://observe.lco.global/api/requestgroups/',
      method: 'POST',
      body: {
        name: `Test Target_${YYYYMMDD}`,
        proposal: 'Test Proposal',
        ipp_value: 1.05,
        operator: 'SINGLE',
        observation_type: 'NORMAL',
        requests: mockRequestList
      },
      successCallback: expect.any(Function),
      failCallback: expect.any(Function)
    })

    expect(wrapper.vm.showScheduled).toBe(true)
  })
})
