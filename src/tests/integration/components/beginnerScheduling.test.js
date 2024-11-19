import { mount } from '@vue/test-utils'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import BeginnerScheduling from '../../../components/Scheduling/BeginnerScheduling.vue'
import { fetchApiCall } from '../../../utils/api.js'
import { createTestStores } from '../../../utils/testUtils'
import flushPromises from 'flush-promises'

vi.mock('../../../utils/api.js', () => ({
  fetchApiCall: vi.fn()
}))

describe('BeginnerScheduling.vue', () => {
  let wrapper

  beforeEach(() => {
    fetchApiCall.mockClear()
    const { pinia } = createTestStores()

    wrapper = mount(BeginnerScheduling, {
      global: {
        plugins: [pinia],
        stubs: {
          // Mock ProposalDropdown to control selectedProposal behavior
          ProposalDropdown: {
            template: '<div></div>',
            methods: {
              selectionsComplete: vi.fn()
            }
          }
        }
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

    // Simulate setting a selected proposal
    wrapper.vm.selectedProposal = 'TestProposal'

    // Simulate selecting a date range (which triggers fetchTargets)
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(startDate.getDate() + 15)
    const newDateRange = {
      start: startDate,
      end: endDate
    }
    await wrapper.vm.handleDateRangeUpdate(newDateRange)

    expect(fetchApiCall).toHaveBeenCalledTimes(1)
    expect(fetchApiCall).toHaveBeenCalledWith({
      url: `https://whatsup.lco.global/range/?start=${newDateRange.start.toISOString().split('.')[0]}&end=${newDateRange.end.toISOString().split('.')[0]}&aperture=0m4&mode=full`,
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

  it('emits selectionsComplete with selectedProposal and other values', async () => {
    // Simulate setting selected values
    wrapper.vm.targetSelection = { name: 'Target 1' }
    wrapper.vm.exposureSettings = [{ filter: 'Filter 1', exposureTime: 300 }]
    wrapper.vm.startDate = '2024-11-18T00:00:00'
    wrapper.vm.endDate = '2024-11-19T00:00:00'
    wrapper.vm.selectedProposal = 'TestProposal'

    // Call emitSelections
    wrapper.vm.emitSelections()

    // Check if the selectionsComplete event was emitted with the correct data
    expect(wrapper.emitted().selectionsComplete).toBeTruthy()
    expect(wrapper.emitted().selectionsComplete[0][0]).toEqual({
      target: { name: 'Target 1' },
      settings: [{ filter: 'Filter 1', exposureTime: 300 }],
      startDate: '2024-11-18T00:00:00',
      endDate: '2024-11-19T00:00:00',
      proposal: 'TestProposal'
    })
  })
})
