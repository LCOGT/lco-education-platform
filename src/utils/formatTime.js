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

export { formatDate, formatTime, formatToUTC }
