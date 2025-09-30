export function raToDegrees (ra) {
  const [h = 0, m = 0, s = 0] = (ra.match(/\d+(?:\.\d+)?/g) || []).map(Number)
  const raDeg = (h + (m / 60) + (s / 3600)) * 15
  return raDeg
}

export function decToDegrees (dec) {
  const sign = /^[\s]*[-−‒–—―﹣－]+/.test(dec) ? -1 : 1
  const [d = 0, m2 = 0, s2 = 0] = (dec.match(/\d+(?:\.\d+)?/g) || []).map(Number)
  const decDeg = sign * (d + (m2 / 60) + (s2 / 3600))
  return decDeg
}
