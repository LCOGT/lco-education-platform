import { shallowMount } from '@vue/test-utils'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import flushPromises from 'flush-promises'
import SessionStarted from '../../../components/RealTimeInterface/SessionStarted.vue'
import { fetchApiCall } from '../../../utils/api'
import { createTestStores } from '../../../utils/testUtils'

vi.mock('../../../utils/api', () => ({
  fetchApiCall: vi.fn()
}))

vi.mock('../../../utils/populateInstrumentsUtils', () => ({
  getFilterList: vi.fn(() => Promise.resolve([{ name: 'r prime', code: 'rp' }]))
}))

vi.mock('../../../utils/sites.JSON', () => ({
  default: {
    coj: {
      name: 'Siding Spring, Australia',
      lat: -31.273333,
      lon: 149.071111
    }
  }
}))

vi.mock('../../../components/RealTimeInterface/CelestialMap/SkyChart.vue', () => ({
  default: {
    template: '<div />'
  }
}))

vi.mock('../../../components/RealTimeInterface/AladinSkyMap.vue', () => ({
  default: {
    template: '<div />'
  }
}))

vi.mock('../../../components/RealTimeInterface/SessionImageCapture.vue', () => ({
  default: {
    template: '<div />'
  }
}))

vi.mock('@emailjs/browser', () => ({
  default: {
    send: vi.fn()
  }
}))

describe('SessionStarted.vue', () => {
  let wrapper
  let realTimeSessionsStore
  let consoleInfoSpy

  const session = {
    id: 123,
    site: 'coj',
    telescope: '0m4a',
    enclosure: 'clma',
    proposal: 'LCOEPO1234',
    request_group_id: 1234,
    request: {
      id: 5678
    }
  }

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    fetchApiCall.mockReset()
    fetchApiCall.mockImplementation(({ url, successCallback }) => {
      if (url.includes('simbad2k')) {
        return Promise.resolve({
          argument_of_perihelion: 4.5,
          ascending_node: 2.3,
          eccentricity: 0.1,
          epoch_jd: 2460676.5,
          inclination: 1.2,
          mean_anomaly: 6.7,
          semimajor_axis: 2.1
        })
      }
      if (url.endsWith('nonsidereal/visible-targets')) {
        const response = { visibleTargets: [], rejectedTargets: {} }
        successCallback?.(response)
        return Promise.resolve(response)
      }
      return Promise.resolve({})
    })
    const { pinia, obsPortalDataStore, realTimeSessionsStore: store, configurationStore } = createTestStores()
    realTimeSessionsStore = store
    obsPortalDataStore.upcomingRealTimeSessions = { [session.id]: session }
    realTimeSessionsStore.currentSessionId = session.id
    realTimeSessionsStore.sessionTokens[session.id] = 'Token test'
    realTimeSessionsStore.fetchObservationParams = vi.fn(() => Promise.resolve())
    realTimeSessionsStore.fetchTelescopeStatus = vi.fn(() => Promise.resolve())
    configurationStore.demo = false

    wrapper = shallowMount(SessionStarted, {
      global: {
        plugins: [pinia],
        stubs: {
          'FontAwesomeIcon': true,
          'AladinSkyMap': true,
          'SkyChart': true,
          'SessionImageCapture': true,
          'v-btn': true,
          'v-progress-circular': true
        }
      }
    })
  })

  afterEach(() => {
    consoleInfoSpy.mockRestore()
  })

  it('submits a real-time non-sidereal request with orbital elements', async () => {
    const nonSiderealPointing = {
      orbitalElements: {
        scheme: 'MPC_MINOR_PLANET',
        epochofel: { value: 60676, units: 'MJD' },
        orbinc: { value: 1.2, units: 'deg' },
        longascnode: { value: 2.3, units: 'deg' },
        argofperih: { value: 4.5, units: 'deg' },
        meandist: { value: 2.1, units: 'AU' },
        eccentricity: 0.1,
        meananom: { value: 6.7, units: 'deg' },
        nonsiderealFraction: 1.0
      }
    }

    fetchApiCall.mockImplementation(({ url, successCallback }) => {
      if (url.includes('thumbnails')) {
        return Promise.resolve({ results: [] })
      }
      if (url.endsWith('command/go')) {
        successCallback()
        return Promise.resolve({})
      }
      return Promise.resolve({})
    })

    await wrapper.vm.setNonSiderealTarget({
      name: 'Vesta',
      scheme: 'MPC_MINOR_PLANET',
      filters: [{ exposure: 30, name: 'rp' }],
      nonSiderealPointing
    })
    await flushPromises()

    await wrapper.vm.sendGoCommand()
    await flushPromises()

    const goCall = fetchApiCall.mock.calls.find(([call]) => call.url.endsWith('command/go'))[0]
    expect(goCall.body).toMatchObject({
      name: 'Vesta',
      expFilter: ['rp'],
      expTime: [30],
      proposalId: 'LCOEPO1234',
      requestGroupId: 1234,
      requestId: 5678,
      observationId: 123,
      nonSiderealPointing: {
        orbitalElements: {
          scheme: 'MPC_MINOR_PLANET',
          epochofel: { value: 60676, units: 'MJD' },
          orbinc: { value: 1.2, units: 'deg' },
          longascnode: { value: 2.3, units: 'deg' },
          argofperih: { value: 4.5, units: 'deg' },
          meandist: { value: 2.1, units: 'AU' },
          eccentricity: 0.1,
          meananom: { value: 6.7, units: 'deg' },
          nonsiderealFraction: 1.0
        }
      }
    })
    expect(goCall.body).not.toHaveProperty('ra')
    expect(goCall.body).not.toHaveProperty('dec')
  })

  it('keeps the existing sidereal go payload shape', async () => {
    fetchApiCall.mockImplementation(({ url, successCallback }) => {
      if (url.includes('thumbnails')) {
        return Promise.resolve({ results: [] })
      }
      if (url.endsWith('command/go')) {
        successCallback()
        return Promise.resolve({})
      }
      return Promise.resolve({})
    })

    wrapper.vm.suggestionOrManual = 'manual'
    wrapper.vm.targetName = 'M42'
    wrapper.vm.ra = 150
    wrapper.vm.dec = -20
    wrapper.vm.validTarget = true
    wrapper.vm.selectedFilter = 'rp'
    wrapper.vm.exposureTime = 30
    wrapper.vm.exposureCount = 1

    await wrapper.vm.sendGoCommand()
    await flushPromises()

    const goCall = fetchApiCall.mock.calls.find(([call]) => call.url.endsWith('command/go'))[0]
    expect(goCall.body).toMatchObject({
      name: 'M42',
      expFilter: ['rp'],
      expTime: [30],
      ra: 10,
      dec: -20,
      proposalId: 'LCOEPO1234',
      requestGroupId: 1234,
      requestId: 5678,
      observationId: 123
    })
    expect(goCall.body).not.toHaveProperty('nonSiderealPointing')
  })

  it('logs non-sidereal rejection diagnostics when no Solar System targets are visible', async () => {
    const rejectedTargets = {
      Jupiter: ['Target is not visible'],
      Mars: ['missing required orbitalElements: dailymot']
    }
    const diagnostics = {
      Jupiter: {
        riseSet: {
          visible: false,
          observableIntervals: []
        }
      },
      Mars: {
        errors: ['missing required orbitalElements: dailymot']
      }
    }

    fetchApiCall.mockImplementation(({ url, successCallback }) => {
      if (url.includes('simbad2k')) {
        return Promise.resolve({
          argument_of_perihelion: 4.5,
          ascending_node: 2.3,
          eccentricity: 0.1,
          epoch_jd: 2460676.5,
          inclination: 1.2,
          mean_anomaly: 6.7,
          semimajor_axis: 2.1
        })
      }
      if (url.endsWith('nonsidereal/visible-targets')) {
        const response = { visibleTargets: [], rejectedTargets, diagnostics }
        successCallback?.(response)
        return Promise.resolve(response)
      }
      return Promise.resolve({})
    })

    await wrapper.vm.refreshVisibleNonSiderealTargets()
    await flushPromises()

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      '[RTI non-sidereal diagnostics] No visible Solar System targets',
      { rejectedTargets, diagnostics }
    )
  })
})
