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
