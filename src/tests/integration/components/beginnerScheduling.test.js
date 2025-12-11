import { mount } from '@vue/test-utils'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import BeginnerScheduling from '../../../components/Scheduling/BeginnerScheduling.vue'
import { calculateSchedulableTargets } from '../../../utils/visibility.js'
import { createTestStores } from '../../../utils/testUtils'

// Mock the calculateSchedulableTargets util
vi.mock('../../../utils/visibility.js', () => ({
  calculateSchedulableTargets: vi.fn()
}))

describe('BeginnerScheduling.vue', () => {
  let wrapper

  beforeEach(() => {
    calculateSchedulableTargets.mockClear()
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

  it('calls calculateSchedulableTargets when date range is updated', async () => {
    const mockSchedulableTargets = {
      nebulae: [
        {
          id: 2,
          name: 'Nebula Target',
          ra: 150.0,
          dec: -30.0,
          filters: [{ name: 'Filter Nebula', exposure: 200, count: 3 }],
          avmcode: '4N',
          desc: 'A nebula target'
        }
      ],
      galaxies: [
        {
          id: 1,
          name: 'Galaxy Target',
          ra: 187.25,
          dec: -11.56,
          filters: [{ name: 'Filter 1', exposure: 300, count: 5 }],
          avmcode: '5A',
          desc: 'A cool target'
        }
      ],
      supernovae: [
        {
          id: 3,
          name: 'Supernova Target',
          ra: 200.0,
          dec: -20.0,
          filters: [{ name: 'Filter SN', exposure: 400, count: 4 }],
          avmcode: '4.1.4B',
          desc: 'A supernova target'
        }
      ],
      clusters: [
        {
          id: 4,
          name: 'Cluster Target',
          ra: 120.0,
          dec: 10.0,
          filters: [{ name: 'Filter Cluster', exposure: 350, count: 2 }],
          avmcode: '3.6C',
          desc: 'A cluster target'
        }
      ],
      other: []
    }
    calculateSchedulableTargets.mockReturnValue(mockSchedulableTargets)

    // Set a selected proposal to allow date range processing
    wrapper.vm.selectedProposal = 'TestProposal'

    // Create a new date range
    const startDate = new Date('2025-03-18T00:00:00')
    const endDate = new Date('2025-03-19T00:00:00')
    const newDateRange = { start: startDate, end: endDate }

    await wrapper.vm.handleDateRangeUpdate(newDateRange)

    // Expect calculateSchedulableTargets to have been called with the imported targets, start and end dates
    expect(calculateSchedulableTargets).toHaveBeenCalledWith(
      expect.any(Array),
      startDate,
      endDate
    )

    expect(wrapper.vm.targetList).toEqual(mockSchedulableTargets)
  })

  it('emits selectionsComplete with selectedProposal and other values', async () => {
    wrapper.vm.targetSelection = { name: 'Target 1' }
    wrapper.vm.exposureSettings = [{ filter: 'Filter 1', exposureTime: 300 }]
    wrapper.vm.defaultSettings = [{ filter: 'Filter 1', exposureTime: 300 }]
    wrapper.vm.startDate = '2024-11-18T00:00:00'
    wrapper.vm.endDate = '2024-11-19T00:00:00'
    wrapper.vm.selectedProposal = 'TestProposal'
    wrapper.vm.selectedCategory = 'Galaxy'
    wrapper.vm.currentStep = 5
    wrapper.vm.targetSelected = true

    await wrapper.vm.$nextTick()

    const okDefaultsButton = wrapper.findAll('button').find(btn => btn.text() === "I'm OK with Defaults")
    expect(okDefaultsButton).toBeTruthy()
    await okDefaultsButton.trigger('click')

    wrapper.vm.emitSelections()

    expect(wrapper.emitted().selectionsComplete).toBeTruthy()
    expect(wrapper.emitted().selectionsComplete[0][0]).toEqual({
      targets: [{ name: 'Target 1' }],
      settings: [{ filter: 'Filter 1', exposureTime: 300 }],
      startDate: '2024-11-18T00:00:00',
      endDate: '2024-11-19T00:00:00',
      proposal: 'TestProposal',
      isSidereal: true,
      scheme: null,
      complete: true
    })
  })
})
