import { fetchApiCall } from './api.js'

const nonSiderealTargetType = 'NON_SIDEREAL'
const simbadBaseUrl = 'https://simbad2k.lco.global'
const julianDateMJDOffset = 2400000.5

export const nonSiderealSolarSystemTargets = [
  { name: 'Mars', type: 'planet', scheme: 'JPL_MAJOR_PLANET', command: '499', filters: [{ exposure: 1, name: 'rp' }] },
  { name: 'Jupiter', type: 'planet', scheme: 'JPL_MAJOR_PLANET', command: '599', filters: [{ exposure: 0.2, name: 'up' }] },
  { name: 'Saturn', type: 'planet', scheme: 'JPL_MAJOR_PLANET', command: '699', filters: [{ exposure: 0.5, name: 'up' }] },
  { name: 'Uranus', type: 'planet', scheme: 'JPL_MAJOR_PLANET', command: '799', filters: [{ exposure: 5, name: 'rp' }] },
  { name: 'Neptune', type: 'planet', scheme: 'JPL_MAJOR_PLANET', command: '899', filters: [{ exposure: 5, name: 'rp' }] },
  { name: 'Pluto', type: 'dwarf', scheme: 'MPC_MINOR_PLANET', command: '999', filters: [{ exposure: 5, name: 'rp' }] },
  { name: 'Ceres', type: 'dwarf', scheme: 'MPC_MINOR_PLANET', command: '134340', filters: [{ exposure: 1, name: 'V' }] },
  { name: 'Pallas', type: 'asteroid', scheme: 'MPC_MINOR_PLANET', command: 'pallas', filters: [{ exposure: 10, name: 'V' }] },
  { name: 'Vesta', type: 'asteroid', scheme: 'MPC_MINOR_PLANET', command: 'vesta', filters: [{ exposure: 10, name: 'V' }] },
  { name: 'Hygiea', type: 'asteroid', scheme: 'MPC_MINOR_PLANET', command: 'hygiea', filters: [{ exposure: 1, name: 'V' }] }
]

export const getNonSiderealRequestBodyDetails = async (name, scheme, successCallback, failCallback = null) => {
  await fetchApiCall({
    url: `${simbadBaseUrl}/${name}?target_type=${nonSiderealTargetType}&scheme=${scheme}`,
    method: 'GET',
    successCallback,
    failCallback
  })
}

export const getVisibleRealTimeNonSiderealTargets = async ({
  bridgeUrl,
  token,
  targets,
  successCallback,
  failCallback = null
}) => {
  const visibleTargetsUrl = `${bridgeUrl}nonsidereal/visible-targets`

  const targetResults = await Promise.allSettled(
    targets.map(async target => {
      const simbadResponse = await fetchApiCall({
        url: `${simbadBaseUrl}/${target.name}?target_type=${nonSiderealTargetType}&scheme=${target.scheme}`,
        method: 'GET'
      })

      if (!simbadResponse) {
        throw new Error(`No non-sidereal details returned for ${target.name}`)
      }

      return {
        ...target,
        nonSiderealPointing: createRealTimeNonSiderealPointing(simbadResponse, target.scheme)
      }
    })
  )

  const requestTargets = targetResults
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value)

  return fetchApiCall({
    url: visibleTargetsUrl,
    method: 'POST',
    body: { targets: requestTargets },
    header: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token
    },
    successCallback,
    failCallback
  })
}

const withUnits = (value, units) => ({
  value: Number(value),
  units
})

export const createRealTimeNonSiderealPointing = (simbadResponse, scheme) => {
  const orbitalElements = {
    scheme,
    epochofel: withUnits(Number(simbadResponse.epoch_jd) - julianDateMJDOffset, 'MJD'),
    orbinc: withUnits(simbadResponse.inclination, 'deg'),
    longascnode: withUnits(simbadResponse.ascending_node, 'deg'),
    argofperih: withUnits(simbadResponse.argument_of_perihelion, 'deg'),
    meandist: withUnits(simbadResponse.semimajor_axis, 'AU'),
    eccentricity: Number(simbadResponse.eccentricity),
    meananom: withUnits(simbadResponse.mean_anomaly, 'deg')
  }

  if (scheme === 'JPL_MAJOR_PLANET' && simbadResponse.mean_daily_motion) {
    orbitalElements.dailymot = withUnits(simbadResponse.mean_daily_motion, 'deg')
  } else {
    orbitalElements.nonsiderealFraction = 1.0
  }

  return {
    orbitalElements
  }
}
