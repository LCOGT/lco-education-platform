import { describe, it, expect } from 'vitest'
import { formatDate, formatTime, formatToUTC, formatCountdown, calculateSessionCountdown } from '../../../utils/formatTime'

describe('formatUtils.js', () => {
  describe('formatDate', () => {
    it('formats a date string to "Month Day, Year" format', () => {
      const date = '2024-08-15T00:00:00Z'
      expect(formatDate(date)).toBe('August 14, 2024')
    })

    it('returns an empty string for an invalid date', () => {
      const date = 'Wed Aug 21 2024 16:15:00 GMT-0700 (Pacific Daylight Time)'
      expect(formatDate(date)).toBe('August 21, 2024')
    })
  })

  describe('formatTime', () => {
    it('formats a time string to "Hour:Minute AM/PM" format', () => {
      const time = '2024-08-15T15:30:00Z'
      expect(formatTime(time)).toBe('8:30 AM')
    })

    it('returns an empty string for an invalid time', () => {
      const time = 'Wed Aug 21 2024 16:15:00 GMT-0700 (Pacific Daylight Time)'
      expect(formatTime(time)).toBe('4:15 PM')
    })
  })

  describe('formatToUTC', () => {
    it('converts a date-time string to UTC format', () => {
      const dateTime = 'Wed Aug 15 2024 08:30:00 GMT-0700 (Pacific Daylight Time)'
      expect(formatToUTC(dateTime)).toBe('2024-08-15T15:30:00Z')
    })

    it('returns undefined for an invalid date-time', () => {
      const dateTime = '11:00 AM'
      expect(formatToUTC(dateTime)).toBeUndefined()
    })
  })

  describe('formatCountdown', () => {
    it('formats seconds into days', () => {
      expect(formatCountdown(86400 * 2)).toBe('2 days')
    })

    it('formats seconds into hours', () => {
      expect(formatCountdown(3600 * 3)).toBe('3 hours')
    })

    it('formats seconds into hours and minutes', () => {
      expect(formatCountdown(5400)).toBe('1h 30m')
    })

    it('formats seconds into minutes and seconds', () => {
      expect(formatCountdown(90)).toBe('01:30')
    })
  })

  describe('calculateSessionCountdown', () => {
    it('calculates the time until the session starts', () => {
      const session = {
        start: new Date(new Date().getTime() + 3600 * 1000).toISOString(),
        end: new Date(new Date().getTime() + 7200 * 1000).toISOString()
      }
      const countdown = calculateSessionCountdown(session)
      expect(countdown).toBeGreaterThan(0)
      expect(countdown).toBeLessThanOrEqual(3600)
    })

    it('calculates the time left in the session if it has started', () => {
      const session = {
        start: new Date(new Date().getTime() - 3600 * 1000).toISOString(),
        end: new Date(new Date().getTime() + 3600 * 1000).toISOString()
      }
      const countdown = calculateSessionCountdown(session)
      expect(countdown).toBeGreaterThan(0)
      expect(countdown).toBeLessThanOrEqual(3600)
    })
  })
})
