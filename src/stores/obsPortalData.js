import { defineStore } from 'pinia'
import { fetchApiCall } from '../utils/api'
import { useUserDataStore } from './userData'
import { useConfigurationStore } from './configuration'

const fifteenDaysAgo = new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

export const useObsPortalDataStore = defineStore('obsPortalData', {
  state () {
    return {
      completedObservations: {},
      upcomingRealTimeSessions: {},
      pendingScheduledRequests: {},
      observationDetails: {},
      selectedConfiguration: null,
      completedObservationsCount: 0
    }
  },
  persist: true,
  actions: {
    storeUpcomingRealTimeSessions (realTimeSessions) {
      this.upcomingRealTimeSessions = {}
      for (const session of realTimeSessions.results) {
        if (!this.upcomingRealTimeSessions[session.id]) {
          this.upcomingRealTimeSessions[session.id] = session
        }
      }
    },
    async fetchUpcomingRealTimeSessions () {
      const configurationStore = useConfigurationStore()
      const userDataStore = useUserDataStore()
      const username = userDataStore.username
      // I know now why this has to be 16 minutes. If it's `end_after=${now}`, the session only appears on the dashboard before now.
      // Meaning, the session will not show up in the list if it has already started. So users can't join a session that has already started.
      // sixteenMinutesFromNow is the time 16 minutes from now in ISO format so they can access the session
      const now = new Date().toISOString()
      await fetchApiCall({
        url: configurationStore.observationPortalUrl + `observations/?user=${username}&state=PENDING&state=IN_PROGRESS&observation_type=REAL_TIME&limit=100&ordering=-start&end_after=${now}`,
        method: 'GET',
        successCallback: (response) => {
          this.storeUpcomingRealTimeSessions(response)
        }
      })
    },
    storePendingScheduledRequests (response) {
      // The format of the response is as follows:
    //   {
    //     "count": 7,
    //     "next": null,
    //     "previous": null,
    //     "results": [
    //         {
    //             "id": 2240578,
    //             "submitter": "ccapetillo",
    //             "proposal": "LCOEPO2014B-010",
    //             "name": "M109_2025-05-19",
    //             "observation_type": "NORMAL",
    //             "operator": "SINGLE",
    //             "ipp_value": 1,
    //             "state": "PENDING",
    //             "created": "2025-05-19T16:27:20.299250Z",
    //             "modified": "2025-05-19T16:27:20.299261Z",
    //             "requests": [
    //                 {
    //                     "id": 3866319,
    //                     "observation_note": "",
    //                     "optimization_type": "TIME",
    //                     "state": "PENDING",
    //                     "acceptability_threshold": 90,
    //                     "configuration_repeats": 1,
    //                     "extra_params": {},
    //                     "modified": "2025-05-19T16:27:20.303691Z",
    //                     "duration": 656,
    //                     "configurations": [
    //                         {
    //                             "id": 12966963,
    //                             "instrument_type": "0M4-SCICAM-QHY600",
    //                             "type": "EXPOSE",
    //                             "repeat_duration": null,
    //                             "extra_params": {
    //                                 "sub_expose": false
    //                             },
    //                             "priority": 1,
    //                             "instrument_configs": [
    //                                 {
    //                                     "optical_elements": {
    //                                         "filter": "rp"
    //                                     },
    //                                     "mode": "central30x30",
    //                                     "exposure_time": 180,
    //                                     "exposure_count": 1,
    //                                     "rotator_mode": "",
    //                                     "extra_params": {
    //                                         "defocus": 0,
    //                                         "offset_ra": 0,
    //                                         "offset_dec": 0
    //                                     },
    //                                     "rois": []
    //                                 },
    //                                 {
    //                                     "optical_elements": {
    //                                         "filter": "B"
    //                                     },
    //                                     "mode": "central30x30",
    //                                     "exposure_time": 180,
    //                                     "exposure_count": 1,
    //                                     "rotator_mode": "",
    //                                     "extra_params": {
    //                                         "defocus": 0,
    //                                         "offset_ra": 0,
    //                                         "offset_dec": 0
    //                                     },
    //                                     "rois": []
    //                                 },
    //                                 {
    //                                     "optical_elements": {
    //                                         "filter": "V"
    //                                     },
    //                                     "mode": "central30x30",
    //                                     "exposure_time": 180,
    //                                     "exposure_count": 1,
    //                                     "rotator_mode": "",
    //                                     "extra_params": {
    //                                         "defocus": 0,
    //                                         "offset_ra": 0,
    //                                         "offset_dec": 0
    //                                     },
    //                                     "rois": []
    //                                 }
    //                             ],
    //                             "constraints": {
    //                                 "max_airmass": 1.6,
    //                                 "min_lunar_distance": 30,
    //                                 "max_lunar_phase": 1,
    //                                 "extra_params": {}
    //                             },
    //                             "acquisition_config": {
    //                                 "mode": "OFF",
    //                                 "extra_params": {}
    //                             },
    //                             "guiding_config": {
    //                                 "optional": true,
    //                                 "mode": "ON",
    //                                 "optical_elements": {},
    //                                 "exposure_time": null,
    //                                 "extra_params": {}
    //                             },
    //                             "target": {
    //                                 "type": "ICRS",
    //                                 "name": "M109",
    //                                 "ra": 179.4,
    //                                 "dec": 53.37,
    //                                 "proper_motion_ra": 0,
    //                                 "proper_motion_dec": 0,
    //                                 "parallax": 0,
    //                                 "epoch": 2000,
    //                                 "hour_angle": null,
    //                                 "extra_params": {}
    //                             }
    //                         }
    //                     ],
    //                     "location": {
    //                         "telescope_class": "0m4"
    //                     },
    //                     "windows": [
    //                         {
    //                             "start": "2025-05-20T14:00:00Z",
    //                             "end": "2025-05-27T14:00:00Z"
    //                         }
    //                     ]
    //                 }
    //             ]
    //         }
    //     ]
    // }
      this.pendingScheduledRequests = {}
      const results = response.results
      const requests = results.map((result) => result.requests).flat()
      for (const pendingScheduledRequest of requests) {
        // Because a scheduled request is ephemeral and its id can change, we store the request id which is stable
        // So the example above would be stored as:
        // {
        //   3784722: {... details of the request ...}
        this.pendingScheduledRequests[pendingScheduledRequest.id] = pendingScheduledRequest
      }
    },
    async fetchPendingScheduledRequests () {
      const configurationStore = useConfigurationStore()
      const userDataStore = useUserDataStore()
      const username = userDataStore.username
      await fetchApiCall({
        // This will only work with NORMAL observations, so TIME_CRITICAL or RAPID_RESPONSE will not show up.
        //  Also only getting ones submitted by the user, which ignores observations on a shared proposal the user has access too.
        // In the future, we have to change the query
        url: configurationStore.observationPortalUrl + `requestgroups/?observation_type=NORMAL&state=PENDING&user=${username}&created_after=${fifteenDaysAgo}`,
        method: 'GET',
        successCallback: (response) => {
          this.storePendingScheduledRequests(response)
        }
      })
    },
    async fetchSelectedObservationDetails (requestId) {
      const configurationStore = useConfigurationStore()
      const userDataStore = useUserDataStore()
      const username = userDataStore.username
      await fetchApiCall({
        url: configurationStore.observationPortalUrl + `requestgroups/?state=PENDING&user=${username}&request_id=${requestId}`,
        method: 'GET',
        successCallback: (response) => {
          this.observationDetails = response
        }
      })
    },
    async fetchCompletedObservations (page = 1) {
      const configurationStore = useConfigurationStore()
      const userDataStore = useUserDataStore()
      const username = userDataStore.username
      // We want 5 items per page
      const limit = 5
      // For pagination purposes we need offset
      const offset = (page - 1) * limit
      await fetchApiCall({
        url: configurationStore.observationPortalUrl + `observations/?user=${username}&state=COMPLETED&limit=${limit}&offset=${offset}&ordering=-start`,
        method: 'GET',
        successCallback: (response) => {
          this.completedObservations = {}
          this.completedObservationsCount = response.count
          this.completedObservations = response.results
        }
      })
    },
    setSelectedConfiguration (configuration) {
      this.selectedConfiguration = configuration
    }
  }
})
