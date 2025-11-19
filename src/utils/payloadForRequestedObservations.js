/* eslint-disable object-shorthand */
import { formatToUTC } from './formatTime.js'

function createInstrumentConfigs (exposures) {
  const exposuresArray = Array.isArray(exposures) ? exposures : [exposures]
  return exposuresArray.map(exposure => ({
    exposure_count: exposure.count || 1,
    exposure_time: exposure.exposureTime,
    mode: 'central30x30',
    rotator_mode: '',
    extra_params: {
      offset_ra: 0,
      offset_dec: 0,
      defocus: 0
    },
    optical_elements: {
      filter: exposure.filter
    }
  }))
}

function createBasePayload (exposures, startDate, endDate, cadenceObj = null) {
  const payload = {
    acceptability_threshold: 90,
    configuration_repeats: 1,
    optimization_type: 'TIME',
    configurations: [{
      type: 'EXPOSE',
      instrument_type: '0M4-SCICAM-QHY600',
      instrument_configs: createInstrumentConfigs(exposures),
      acquisition_config: {
        mode: 'OFF',
        extra_params: {}
      },
      guiding_config: {
        mode: 'ON',
        optional: true,
        extra_params: {}
      },
      constraints: {
        max_airmass: 1.6,
        min_lunar_distance: 30,
        max_lunar_phase: 1
      }
    }],
    windows: cadenceObj
      ? []
      : [{
          start: formatToUTC(startDate),
          end: formatToUTC(endDate)
        }],
    location: {
      telescope_class: '0m4'
    }
  }

  if (cadenceObj) {
    payload.cadence = { ...cadenceObj }
  }

  return payload
}

function createSiderealTarget (target) {
  return {
    name: target.name,
    type: 'ICRS',
    ra: Number(target.ra),
    dec: Number(target.dec),
    proper_motion_ra: null,
    proper_motion_dec: null,
    epoch: 2000,
    parallax: null,
    extra_params: {}
  }
}

function createNonSiderealTarget (simbadResponse, schemeRequest) {
  const epochJd = Number(simbadResponse.epoch_jd)
  const julianDateMJDOffset = 2400000.5
  const epochJulianDate = epochJd - julianDateMJDOffset

  const baseTarget = {
    name: simbadResponse.name,
    type: 'ORBITAL_ELEMENTS',
    ra: null,
    dec: null,
    proper_motion_ra: null,
    proper_motion_dec: null,
    parallax: null,
    extra_params: {},
    scheme: schemeRequest,
    orbinc: simbadResponse.inclination,
    longascnode: simbadResponse.ascending_node,
    argofperih: simbadResponse.argument_of_perihelion,
    eccentricity: simbadResponse.eccentricity,
    meandist: simbadResponse.semimajor_axis,
    meananom: simbadResponse.mean_anomaly,
    perihdist: null,
    epochofel: epochJulianDate
  }

  if (schemeRequest === 'JPL_MAJOR_PLANET') {
    baseTarget.dailymot = simbadResponse.mean_daily_motion
  } else if (schemeRequest === 'MPC_MINOR_PLANET') {
    baseTarget.epochofperih = null
    baseTarget.dailymot = null
  }

  return baseTarget
}

export function createPayloadForSiderealRequests (target, exposures, startDate, endDate, cadenceObj = null) {
  const payload = createBasePayload(exposures, startDate, endDate, cadenceObj)
  payload.configurations[0].target = createSiderealTarget(target)
  return payload
}

export function createTargetPayloadForNonSiderealRequest (simbadResponse, schemeRequest, exposures, startDate, endDate, cadenceObj = null) {
  const payload = createBasePayload(exposures, startDate, endDate, cadenceObj)
  payload.configurations[0].target = createNonSiderealTarget(simbadResponse, schemeRequest)
  return payload
}
