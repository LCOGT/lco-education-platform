import { describe, it, expect } from 'vitest'
import { formatDateTime, formatToUTC, formatCountdown, calculateSessionCountdown } from '../../../utils/formatTime'

describe('formatUtils.js', () => {
  describe('formatDateTime', () => {
    const getLocalTimeString = (dateString, options) => {
      const date = new Date(dateString)
      // Converts UTC to the environment's local time
      return date.toLocaleTimeString('en-US', options)
    }

    const getLocalDateString = (dateString, options) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', options)
    }

    it('formats a date string to "Month Day, Year" format', () => {
      const date = '2024-08-15T00:00:00Z'
      const expectedDate = getLocalDateString(date, { year: 'numeric', month: 'long', day: 'numeric' })
      expect(formatDateTime(date, { year: 'numeric', month: 'long', day: 'numeric' })).toBe(expectedDate)
    })

    it('formats a UTC time string to "Hour:Minute AM/PM" format', () => {
      const time = '2024-08-15T15:30:00Z'
      const expectedTime = getLocalTimeString(time, { hour: 'numeric', minute: 'numeric' })
      expect(formatDateTime(time, { hour: 'numeric', minute: 'numeric' })).toBe(expectedTime)
    })

    it('formats a local time string to "Hour:Minute AM/PM" format', () => {
      const time = 'Wed Aug 21 2024 16:15:00Z'
      const expectedTime = getLocalTimeString(time, { hour: 'numeric', minute: 'numeric' })
      expect(formatDateTime(time, { hour: 'numeric', minute: 'numeric' })).toBe(expectedTime)
    })

    it('formats a date string to "MM/DD/YY" format', () => {
      const date = '2024-12-25T00:00:00Z'
      const expectedDate = getLocalDateString(date, { month: '2-digit', day: '2-digit', year: '2-digit' })
      expect(formatDateTime(date, { month: '2-digit', day: '2-digit', year: '2-digit' })).toBe(expectedDate)
    })
  })

  describe('formatToUTC', () => {
    it('converts a date-time string to UTC format', () => {
      const dateTime = 'Wed Aug 15 2024 08:30:00 GMT-0700 (Pacific Daylight Time)'
      const expectedUTC = '2024-08-15T15:30:00Z'
      expect(formatToUTC(dateTime)).toBe(expectedUTC)
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
      expect(formatCountdown(3600 * 3)).toBe('03 hours and 00 minutes')
    })

    it('formats seconds into hours and minutes', () => {
      expect(formatCountdown(5400)).toBe('01 hour and 30 minutes')
    })

    it('formats seconds into minutes and seconds', () => {
      expect(formatCountdown(90)).toBe('01 minute and 30 seconds')
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
