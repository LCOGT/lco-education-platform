export function calcAltAz (ra, dec, lat, lon) {
// Convert hour angle, declination of an astronomical source and the latitude of the observer to azimuth and
// altitude (in degs)
  const lst = calculate_lst(lon)

  const ra_decimal_hours = 24 * ra / 360.0
  const dec_rad = dec * Math.PI / 180.0
  const lat_rad = lat * Math.PI / 180.0
  const h_rad = Math.PI * (lst - ra_decimal_hours) / 12
  const sin_alt = Math.sin(dec_rad) * Math.sin(lat_rad) + Math.cos(dec_rad) * Math.cos(lat_rad) * Math.cos(h_rad)
  const alt_rad = Math.asin(sin_alt)
  const cos_az = (Math.sin(dec_rad) - Math.sin(lat_rad) * sin_alt) / (Math.cos(lat_rad) * Math.cos(alt_rad))
  // Az, Alt
  return [Math.acos(cos_az) * 180.0 / Math.PI, alt_rad * 180.0 / Math.PI]
}

function sign (x) { return x ? x < 0 ? -1 : 1 : 0 }

function decimalhours (now) {
  return (((now.getSeconds() / 60) + now.getUTCMinutes()) / 60) + now.getUTCHours()
}

function juliandate (now) {
  let y = now.getUTCFullYear()
  let m = now.getUTCMonth() + 1
  const d = now.getUTCDate()
  if ((m == 1) || (m == 2)) {
    y = y - 1
    m = m + 12
  }
  const A = Math.floor(y / 100)
  const B = 2 - A + Math.floor(A / 4)
  const C = Math.floor(365.25 * y)
  const D = Math.floor(30.6001 * (m + 1))
  return (B + C + D + d + 1720994.5)
}

function gst (jd, dechours) {
  const S = jd - 2451545
  const T = S / 36525
  let T0 = 6.697374558 + (2400.051336 * T) + (0.000025862 * Math.pow(T, 2))
  if (sign(T0) == -1) {
    T0 = (T0 + (24 * Math.abs(Math.floor(T0 / 24))))
  } else {
    T0 = (T0 - (24 * Math.abs(Math.floor(T0 / 24))))
  }
  T0 = T0 + (dechours * 1.002737909)
  if (T0 < 0) { T0 = T0 + 24 }
  if (T0 > 24) { T0 = T0 - 24 }
  const h = Math.floor(T0)
  const m1 = T0 - h
  const m = Math.floor((T0 - h) * 60)
  const s = Math.floor((((T0 - h) * 60) - m) * 60)
  return T0
}

function lst (gstime, lon) {
  let lstime
  const utcdiff = Math.abs(lon) / 15
  if (sign(lon) == -1) {
    lstime = gstime - utcdiff
  } else {
    lstime = gstime + utcdiff
  }
  if (lstime > 24) { lstime = lstime - 24 }
  if (lstime < 0) { lstime = lstime + 24 }
  return lstime
}

function calculate_lst (lon) {
  const now = new Date()
  const nowjd = juliandate(now)
  const nowdechours = decimalhours(now)
  return lst(gst(nowjd, nowdechours), lon)
}

export function calculateVisibleTargets (targets, lat, lon) {
  const now = new Date()
  let visible_targets = {}
  const nebulae = []
  const galaxies = []
  const supernovae = []
  const clusters = []
  const other = []
  /* RESET THE LENGTH TO targets.length */
  for (let i = 0; i < targets.length; i++) {
    const ra = targets[i].ra
    const dec = targets[i].dec
    const altaz = calcAltAz(ra, dec, lat, lon)
    const alt = altaz[1]
    const az = altaz[0]
    if (alt > 30) {
      const target = {
        'id': i,
        'name': targets[i].name,
        'ra': ra,
        'dec': dec,
        'alt': alt,
        'az': az,
        'filters': targets[i].filters,
        'avmcode': targets[i].avmcode,
        'desc': targets[i].desc
      }
      if (targets[i].avmcode.startsWith('5')) {
        galaxies.push(target)
      } else if (targets[i].avmcode.startsWith('4.1.4')) {
        supernovae.push(target)
      } else if (targets[i].avmcode.startsWith('4')) {
        nebulae.push(target)
      } else if (targets[i].avmcode.startsWith('3.6')) {
        clusters.push(target)
      } else {
        other.push(target)
      }
    }
  }
  visible_targets = {
    'nebulae': nebulae,
    'galaxies': galaxies,
    'supernovae': supernovae,
    'clusters': clusters,
    'other': other
  }
  return visible_targets
}

function calculateSunPosition (date) {
  const rad = Math.PI / 180
  const eclipticLongitude = (280.46646 + 0.9856474 * (juliandate(date) - 2451545)) % 360
  const meanAnomaly = (357.52911 + 0.98560028 * (juliandate(date) - 2451545)) % 360
  const sunEqOfCenter = 1.914602 * Math.sin(meanAnomaly * rad) + 0.019993 * Math.sin(2 * meanAnomaly * rad) + 0.000289 * Math.sin(3 * meanAnomaly * rad)
  const trueLongitude = eclipticLongitude + sunEqOfCenter
  const obliquityOfEcliptic = 23.439 - 0.00000036 * (juliandate(date) - 2451545)
  const ra = Math.atan2(Math.cos(obliquityOfEcliptic * rad) * Math.sin(trueLongitude * rad), Math.cos(trueLongitude * rad)) / rad
  const dec = Math.asin(Math.sin(obliquityOfEcliptic * rad) * Math.sin(trueLongitude * rad)) / rad
  return { ra: (ra + 360) % 360, dec }
}

export function calculateMoonPosition (date) {
  const rad = Math.PI / 180
  const eclipticLongitude = (218.32 + 481267.881 * (juliandate(date) - 2451553)) % 360
  const meanAnomaly = (134.9 + 477198.85 * (juliandate(date) - 2451553)) % 360
  const moonEqOfCenter = 1.4979 * Math.sin(meanAnomaly * rad) + 0.0753 * Math.sin(2 * meanAnomaly * rad) + 0.0032 * Math.sin(3 * meanAnomaly * rad)
  const trueLongitude = eclipticLongitude + moonEqOfCenter
  const obliquityOfEcliptic = 23.439 - 0.00000036 * (juliandate(date) - 2451545)
  const ra = Math.atan2(Math.cos(obliquityOfEcliptic * rad) * Math.sin(trueLongitude * rad), Math.cos(trueLongitude * rad)) / rad
  const dec = Math.asin(Math.sin(obliquityOfEcliptic * rad) * Math.sin(trueLongitude * rad)) / rad
  return { ra: (ra + 360) % 360, dec }
}

function isSunOutOfRange (lng, sun) {
  const distance = Math.abs(lng - sun)
  if ((distance < 60) || (distance > 300)) {
    return false
  } else {
    return true
  }
}

export function calculateSchedulableTargets (targets, start, end) {
  let visible_targets = {}
  const nebulae = []
  const galaxies = []
  const supernovae = []
  const clusters = []
  const other = []

  const ra_sun_start = calculateSunPosition(start)
  const starttargets = targets.filter(target => isSunOutOfRange(target.ra, ra_sun_start.ra))
  const ra_sun_end = calculateSunPosition(end)
  const endtargets = targets.filter(target => isSunOutOfRange(target.ra, ra_sun_end.ra))

  const commonTargets = starttargets.filter(target =>
    endtargets.some(endTarget => endTarget.id === target.id)
  )
  /* RESET THE LENGTH TO targets.length */
  for (let i = 0; i < commonTargets.length; i++) {
    if (targets[i].avmcode.startsWith('5')) {
      galaxies.push(targets[i])
    } else if (targets[i].avmcode.startsWith('4.1.4')) {
      supernovae.push(targets[i])
    } else if (targets[i].avmcode.startsWith('4')) {
      nebulae.push(targets[i])
    } else if (targets[i].avmcode.startsWith('3.6')) {
      clusters.push(targets[i])
    } else {
      other.push(targets[i])
    }
  }
  visible_targets = {
    'nebulae': nebulae,
    'galaxies': galaxies,
    'supernovae': supernovae,
    'clusters': clusters,
    'other': other
  }
  return visible_targets
}
