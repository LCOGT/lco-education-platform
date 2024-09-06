import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import SessionStarted from '../../../components/RealTimeInterface/SessionStarted.vue'
import { createTestStores } from '../../../utils/testUtils'
import { fetchApiCall } from '../../../utils/api'
import { calcAltAz } from '../../../utils/visibility'

vi.mock('@fortawesome/vue-fontawesome', () => ({
  FontAwesomeIcon: { template: '<div />' }
}))

vi.mock('../../../utils/api', () => ({
  fetchApiCall: vi.fn() // Mock the fetchApiCall method
}))

vi.mock('lottie-web-vue', () => ({
  LottieAnimation: { template: '<div />' }
}))

vi.mock('../../../utils/visibility.js', () => ({
  calcAltAz: vi.fn(() => [0, 40])
}))

vi.mock('../../../utils/sites.JSON', () => ({
  default: {
    'cpt': { lat: -33.9258, lon: 18.4232 },
    'elp': { lat: 31.8072, lon: -106.3776 }
  }
}))

vi.mock('d3', () => ({
  select: vi.fn(),
  geoPath: vi.fn(),
  geoProjection: vi.fn(),
  geoAzimuthalEqualArea: vi.fn()
}))

vi.mock('d3-celestial', () => ({
  default: {
    Celestial: vi.fn(() => ({
      configure: vi.fn(),
      display: vi.fn(),
      redraw: vi.fn(),
      date: vi.fn(),
      location: vi.fn(),
      resize: vi.fn()
    }))
  }
}))

vi.mock('../../../components/RealTimeInterface/AladinSkyMap.vue', () => ({
  default: {
    template: '<div />',
    methods: {
      goToRaDec: vi.fn()
    }
  }
}))

// describe('SessionStarted.vue', () => {
//   let wrapper
//   let sessionsStore
//   let configurationStore

//   beforeEach(() => {
//     const { pinia, sessionsStore: store, configurationStore: configStore } = createTestStores()
//     sessionsStore = store
//     configurationStore = configStore

//     sessionsStore.sessions = {
//       results: [
//         {
//           site: 'cpt',
//           id: 'session1',
//           proposal: 'mock-proposal',
//           request_group_id: 'mock-group',
//           request: { id: 'mock-request' }
//         }
//       ]
//     }

//     sessionsStore.currentSessionId = 'session1'

//     wrapper = mount(SessionStarted, {
//       global: {
//         plugins: [pinia]
//       }
//     })
//   })

describe('SessionStarted.vue', () => {
  let wrapper
  let sessionsStore

  beforeEach(() => {
    const { pinia, sessionsStore: store } = createTestStores()
    sessionsStore = store

    sessionsStore.sessions = {
      results: [
        {
          site: 'cpt',
          id: 'session1',
          proposal: 'mock-proposal',
          request_group_id: 'mock-group',
          request: { id: 'mock-request' }
        }
      ]
    }
    sessionsStore.currentSessionId = 'session1'

    wrapper = mount(SessionStarted, {
      global: {
        plugins: [pinia]
      }
    })
  })

  it('should call goToLocation on successful target lookup', async () => {
    // Mock a successful fetchApiCall response with RA and Dec
    fetchApiCall.mockImplementationOnce((options) => {
      options.successCallback({
        ra_d: '15.123',
        dec_d: '-30.456',
        name: 'NGC891'
      })
    })

    const mockGoToLocation = vi.spyOn(wrapper.vm, 'goToLocation')

    // Set target name and call the method
    wrapper.vm.targetName = 'NGC891'
    await wrapper.vm.getRaDecFromTargetName()

    // Wait for Vue's reactivity system to update
    await wrapper.vm.$nextTick()

    // Verify that RA and Dec are correctly set (check `.value` since they're `ref`s)
    expect(wrapper.vm.ra).toBe('15.123')
    expect(wrapper.vm.dec).toBe('-30.456')

    // Verify goToLocation is called
    expect(mockGoToLocation).toHaveBeenCalled()

    // Cleanup spy
    mockGoToLocation.mockRestore()
  })
})
