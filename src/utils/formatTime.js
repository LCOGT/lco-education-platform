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
  const [hours, minutes] = time.split(':')
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
function calculateTime (session) {
  const currentTime = new Date().getTime()
  const sessionStartTime = new Date(session.start).getTime()
  const sessionEndTime = new Date(session.end).getTime()
  let countdown
  // this checks if the session has started or not
  sessionStartTime > currentTime ? countdown = sessionStartTime : countdown = sessionEndTime
  return Math.floor((countdown - currentTime) / 1000)
}

export { formatDate, formatTime, formatToUTC, formatCountdown, calculateTime }
