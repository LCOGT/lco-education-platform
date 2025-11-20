// formats a date based on the options provided
function formatDateTime (dateString, options) {
  const date = new Date(dateString)
  // This condition is necessary because the toLocaleTimeString method does not accept the year, month, or day options
  if (options && (options.hour || options.minute)) {
    return date.toLocaleTimeString('en-US', options)
    // And this condition is necessary because the toLocaleDateString method does not accept the hour or minute options
  } else {
    return date.toLocaleDateString('en-US', options)
  }
}

function formatToUTC (dateTime) {
  const dateObject = new Date(dateTime)
  if (isNaN(dateObject)) {
    return
  }
  return dateObject.toISOString().split('.')[0] + 'Z'
}

function formatCountdown (seconds) {
  const secondsInMinute = 60
  const secondsInHour = 60 * secondsInMinute
  const secondsInDay = 24 * secondsInHour
  if (seconds >= secondsInDay) {
    const days = Math.floor(seconds / secondsInDay)
    return `${days} day${days !== 1 ? 's' : ''}`
  } else if (seconds >= secondsInHour) {
    const hours = Math.floor(seconds / secondsInHour)
    const minutes = Math.floor((seconds % secondsInHour) / secondsInMinute)
    return `${String(hours).padStart(2, '0')} hour${hours === 1 ? '' : 's'} and ${String(minutes).padStart(2, '0')} minute${minutes === 1 ? '' : 's'}`
  } else {
    const minutes = Math.floor(seconds / secondsInMinute)
    const secs = seconds % secondsInMinute
    return `${String(minutes).padStart(2, '0')} minute${minutes === 1 ? '' : 's'} and ${String(secs).padStart(2, '0')} second${secs === 1 ? '' : 's'}`
  }
}

// calculates either the time left in the session or the time until the session starts
function calculateSessionCountdown (session) {
  const currentTime = new Date().getTime()
  const sessionStartTime = new Date(session.start).getTime()
  const sessionTime = new Date(session.end).getTime()
  // checking if the session has started or not
  const countdown = sessionStartTime > currentTime ? sessionStartTime : sessionTime
  return Math.floor((countdown - currentTime) / 1000)
}

export { formatDateTime, formatToUTC, formatCountdown, calculateSessionCountdown }
