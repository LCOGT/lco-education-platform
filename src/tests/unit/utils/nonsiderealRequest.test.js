import { vi, describe, it, expect, beforeEach } from 'vitest'
import { fetchApiCall } from '../../../utils/api.js'
import {
  createRealTimeNonSiderealPointing,
  getVisibleRealTimeNonSiderealTargets,
  getNonSiderealRequestBodyDetails,
  nonSiderealSolarSystemTargets
} from '../../../utils/nonsiderealRequest.js'

vi.mock('../../../utils/api.js', () => ({
  fetchApiCall: vi.fn()
}))

describe('nonsiderealRequest utils', () => {
  beforeEach(() => {
    fetchApiCall.mockClear()
  })

  it('fetches non-sidereal request body details from simbad2k', async () => {
    const successCallback = vi.fn()
    const failCallback = vi.fn()

    await getNonSiderealRequestBodyDetails('Mars', 'JPL_MAJOR_PLANET', successCallback, failCallback)

    expect(fetchApiCall).toHaveBeenCalledWith({
      url: 'https://simbad2k.lco.global/Mars?target_type=NON_SIDEREAL&scheme=JPL_MAJOR_PLANET',
      method: 'GET',
      successCallback,
      failCallback
    })
  })

  it('creates RTI orbital elements from a minor-planet simbad response', () => {
    const pointing = createRealTimeNonSiderealPointing({
      argument_of_perihelion: 4.5,
      ascending_node: 2.3,
      eccentricity: 0.1,
      epoch_jd: 2460676.5,
      inclination: 1.2,
      mean_anomaly: 6.7,
      semimajor_axis: 2.1
    }, 'MPC_MINOR_PLANET')

    expect(pointing).toEqual({
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
    })
  })

  it('includes daily motion for major planets when simbad returns it', () => {
    const pointing = createRealTimeNonSiderealPointing({
      argument_of_perihelion: 273.675,
      ascending_node: 100.531,
      eccentricity: 0.048,
      epoch_jd: 2460181.5,
      inclination: 1.303,
      mean_anomaly: 17.776,
      mean_daily_motion: 0.083,
      semimajor_axis: 5.203
    }, 'JPL_MAJOR_PLANET')

    expect(pointing.orbitalElements.dailymot).toEqual({ value: 0.083, units: 'deg/day' })
    expect(pointing.orbitalElements).not.toHaveProperty('nonsiderealFraction')
  })

  it('exports fixed Solar System targets with schemes and filters', () => {
    expect(nonSiderealSolarSystemTargets).toEqual(expect.arrayContaining([
      expect.objectContaining({
        name: 'Mars',
        scheme: 'JPL_MAJOR_PLANET',
        filters: expect.any(Array)
      }),
      expect.objectContaining({
        name: 'Vesta',
        scheme: 'MPC_MINOR_PLANET',
        filters: expect.any(Array)
      })
    ]))
  })

  it('builds non-sidereal targets and asks the bridge for visible real-time targets', async () => {
    const simbadResponse = {
      argument_of_perihelion: 4.5,
      ascending_node: 2.3,
      eccentricity: 0.1,
      epoch_jd: 2460676.5,
      inclination: 1.2,
      mean_anomaly: 6.7,
      semimajor_axis: 2.1
    }
    const successCallback = vi.fn()
    const failCallback = vi.fn()

    fetchApiCall.mockImplementation(({ url, successCallback: callback }) => {
      if (url.includes('simbad2k')) {
        return Promise.resolve(simbadResponse)
      }
      if (url.endsWith('nonsidereal/visible-targets')) {
        const response = { visibleTargets: [], rejectedTargets: {} }
        callback(response)
        return Promise.resolve(response)
      }
      return Promise.resolve({})
    })

    await getVisibleRealTimeNonSiderealTargets({
      bridgeUrl: 'https://bridge.example/',
      token: 'Token test',
      targets: [
        { name: 'Vesta', type: 'asteroid', scheme: 'MPC_MINOR_PLANET', filters: [{ exposure: 10, name: 'V' }] }
      ],
      successCallback,
      failCallback
    })

    const bridgeCall = fetchApiCall.mock.calls.find(([call]) => call.url.endsWith('nonsidereal/visible-targets'))[0]
    expect(bridgeCall).toMatchObject({
      url: 'https://bridge.example/nonsidereal/visible-targets',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Token test'
      },
      body: {
        targets: [
          expect.objectContaining({
            name: 'Vesta',
            scheme: 'MPC_MINOR_PLANET',
            nonSiderealPointing: {
              orbitalElements: expect.objectContaining({
                scheme: 'MPC_MINOR_PLANET',
                epochofel: { value: 60676, units: 'MJD' }
              })
            }
          })
        ]
      }
    })
    expect(successCallback).toHaveBeenCalledWith({ visibleTargets: [], rejectedTargets: {} })
    expect(failCallback).not.toHaveBeenCalled()
  })
})
