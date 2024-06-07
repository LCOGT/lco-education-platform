export function calcAltAz (ra, dec, lat, lon) {
// Convert hour angle, declination of an astronomical source and the latitude of the observer to azimuth and
// altitude (in degs)
  var lst = calculate_lst(lon)

  var ra_decimal_hours = 24 * ra / 360.0
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
  var y = now.getUTCFullYear()
  var m = now.getUTCMonth() + 1
  var d = now.getUTCDate()
  if ((m == 1) || (m == 2)) {
    y = y - 1
    m = m + 12
  }
  var A = Math.floor(y / 100)
  var B = 2 - A + Math.floor(A / 4)
  var C = Math.floor(365.25 * y)
  var D = Math.floor(30.6001 * (m + 1))
  return (B + C + D + d + 1720994.5)
}

function gst (jd, dechours) {
  var S = jd - 2451545
  var T = S / 36525
  var T0 = 6.697374558 + (2400.051336 * T) + (0.000025862 * Math.pow(T, 2))
  if (sign(T0) == -1) {
    T0 = (T0 + (24 * Math.abs(Math.floor(T0 / 24))))
  } else {
    T0 = (T0 - (24 * Math.abs(Math.floor(T0 / 24))))
  }
  T0 = T0 + (dechours * 1.002737909)
  if (T0 < 0) { T0 = T0 + 24 }
  if (T0 > 24) { T0 = T0 - 24 }
  var h = Math.floor(T0)
  var m1 = T0 - h
  var m = Math.floor((T0 - h) * 60)
  var s = Math.floor((((T0 - h) * 60) - m) * 60)
  return T0
}

function lst (gstime, lon) {
  var lstime
  var utcdiff = Math.abs(lon) / 15
  if (sign(lon) == -1) {
    lstime = gstime - utcdiff
  } else {
    lstime = gstime + utcdiff
  }
  if (lstime > 24) { lstime = lstime - 24 }
  if (lstime < 0) { lstime = lstime + 24 }
  console.log(lstime)
  return lstime
}

function calculate_lst (lon) {
  const now = new Date()
  const nowjd = juliandate(now)
  const nowdechours = decimalhours(now)
  return lst(gst(nowjd, nowdechours), lon)
}
