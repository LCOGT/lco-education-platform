function formatDate (dateString) {
  const date = new Date(dateString)
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

function formatTime (timeString) {
  const date = new Date(timeString)
  const options = { hour: 'numeric', minute: 'numeric' }
  return date.toLocaleTimeString('en-US', options)
}

function formatToUTC (date, time) {
  const combinedDateTime = new Date(date)
  // Extract hours, minutes, and period (AM/PM) from the time string
  let [hours, minutes, period] = time.match(/(\d+):(\d+)\s*(AM|PM)/i).slice(1)
  hours = parseInt(hours, 10)
  minutes = parseInt(minutes, 10)

  // Convert PM times to 24-hour format to handle 12 PM and 12 AM correctly
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0
  }
  combinedDateTime.setHours(hours)
  combinedDateTime.setMinutes(minutes)
  return combinedDateTime.toISOString().split('.')[0] + 'Z'
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

export { formatDate, formatTime, formatToUTC, formatCountdown, calculateSessionCountdown }
