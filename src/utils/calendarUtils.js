import { fetchApiCall } from './api.js'
import { useConfigurationStore } from '../stores/configuration.js'

let currentSemesterStart = null
let currentSemesterEnd = null

function parseISOString (s) {
  if (s === null) return null
  const b = s.split(/\D+/)
  return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]))
}

const getStartAndEndDatesOfCurrentSemester = (semesters) => {
  const today = new Date()
  const currentSemester = semesters.find(semester => {
    const startDate = new Date(semester.start)
    const endDate = new Date(semester.end)
    return today >= startDate && today <= endDate
  })
  if (currentSemester) {
    currentSemesterStart = currentSemester.start
    currentSemesterEnd = currentSemester.end
  }
}

const fetchSemesterData = async () => {
  const configurationStore = useConfigurationStore()
  const observationPortalUrl = configurationStore.observationPortalUrl
  await fetchApiCall({
    url: `${observationPortalUrl}semesters/`,
    method: 'GET',
    successCallback: (response) => {
      const semesters = response.results
      getStartAndEndDatesOfCurrentSemester(semesters)
    }
  })
}

export { currentSemesterStart, currentSemesterEnd, fetchSemesterData, parseISOString }
