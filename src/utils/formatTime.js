// formats a date based on the options provided
function formatDateTime (dateString, options) {
  const date = new Date(dateString)
  if (options && (options.hour || options.minute)) {
    return date.toLocaleTimeString('en-US', options)
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
  if (seconds > 23 * 3600) {
    const days = Math.floor(seconds / 86400)
    return `${days} day${days !== 1 ? 's' : ''}`
  } else if (seconds > 1.5 * 3600) {
    const hours = Math.floor(seconds / 3600)
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  } else if (seconds > 15 * 60) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  } else if (seconds > 15 * 60) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  } else {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
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
