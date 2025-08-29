export function raDecToDegrees (ra, dec) {
  const [h, m, s] = ra.trim().split(/[\s:]+/).map(Number)
  const raDeg = (h + m / 60 + s / 3600) * 15

  const sign = dec.trim().startsWith('-') ? -1 : 1
  const [d, m2, s2] = dec.replace(/[+-]/, '').trim().split(/[\s:]+/).map(Number)
  const decDeg = sign * (d + m2 / 60 + s2 / 3600)
  return { ra: raDeg, dec: decDeg }
}
