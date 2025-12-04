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

  it('calls submitRequest directly when cadence is not selected', async () => {
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
      settings: [{ filter: 'F1', exposureTime: 300, count: 1 }],
      startDate: formatISOWithoutMilliseconds(now),
      endDate: formatISOWithoutMilliseconds(oneHourLater),
      proposal: 'Test Proposal',
      isSidereal: true
    }

    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback()
    })

    wrapper.vm.observationData = mockObservationData

    await wrapper.vm.onSubmit()
    await flushPromises()

    expect(fetchApiCall).toHaveBeenCalledTimes(1)
    expect(fetchApiCall).toHaveBeenCalledWith(expect.objectContaining({
      url: expect.stringContaining('/requestgroups/'),
      method: 'POST',
      body: expect.objectContaining({
        name: expect.stringContaining('Test Target'),
        proposal: 'Test Proposal',
        ipp_value: 1.0,
        operator: 'SINGLE',
        observation_type: 'NORMAL',
        requests: expect.any(Array)
      }),
      successCallback: expect.any(Function),
      failCallback: expect.any(Function)
    }))
    expect(wrapper.vm.showScheduled).toBe(true)
  })

  it('calls fetchApiCall for cadence endpoint and then for submitRequest', async () => {
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

    // First call: cadence endpoint. Second call: submitRequest
    fetchApiCall
      .mockImplementationOnce(({ successCallback }) => {
        successCallback({ cadence: 'mockCadenceResponse', requests: [{ foo: 'bar' }] })
      })
      .mockImplementationOnce(({ successCallback }) => {
        successCallback()
      })

    wrapper.vm.observationData = mockObservationData
    wrapper.vm.showGenerateCadence = true
    wrapper.vm.cadenceSelection = 'simple-period'
    wrapper.vm.isCadenceValid = true

    await wrapper.vm.onSubmit()
    await flushPromises()

    expect(fetchApiCall).toHaveBeenNthCalledWith(1, expect.objectContaining({
      url: expect.stringContaining('/requestgroups/cadence/'),
      method: 'POST',
      body: expect.objectContaining({
        name: expect.stringContaining('Test Target'),
        proposal: 'Test Proposal',
        ipp_value: 1.0,
        operator: 'SINGLE',
        observation_type: 'NORMAL',
        requests: expect.any(Array)
      }),
      successCallback: expect.any(Function),
      failCallback: expect.any(Function)
    }))
    // Second call: submitRequest with cadence response as payload
    expect(fetchApiCall).toHaveBeenNthCalledWith(2, expect.objectContaining({
      url: expect.stringContaining('/requestgroups/'),
      method: 'POST',
      body: expect.objectContaining({
        cadence: 'mockCadenceResponse',
        requests: [{ foo: 'bar' }]
      }),
      successCallback: expect.any(Function),
      failCallback: expect.any(Function)
    }))
  })

  it('calls submitRequest with normal payload after switching cadence back to none', async () => {
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

    fetchApiCall.mockImplementationOnce(({ successCallback }) => {
      successCallback()
    })

    wrapper.vm.observationData = mockObservationData
    wrapper.vm.showGenerateCadence = false
    wrapper.vm.cadenceSelection = 'none'
    wrapper.vm.isCadenceValid = false

    await wrapper.vm.onSubmit()
    await flushPromises()

    expect(fetchApiCall).toHaveBeenCalledTimes(1)
    expect(fetchApiCall).toHaveBeenCalledWith(expect.objectContaining({
      url: expect.stringContaining('/requestgroups/'),
      method: 'POST',
      body: expect.objectContaining({
        name: expect.stringContaining('Test Target'),
        proposal: 'Test Proposal',
        ipp_value: 1.0,
        operator: 'SINGLE',
        observation_type: 'NORMAL',
        requests: expect.any(Array)
      }),
      successCallback: expect.any(Function),
      failCallback: expect.any(Function)
    }))
  })
})
