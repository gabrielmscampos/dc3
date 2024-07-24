import axios from 'axios'

import { sanitizedURLSearchParams } from '../../utils/sanitizer'
import { API_URL } from '../../config/env'

const axiosApiInstance = axios.create()

axiosApiInstance.interceptors.request.use(
  async (config) => {
    config.headers = {
      Accept: 'application/json',
    }
    return config
  },
  (error) => {
    Promise.reject(error)
  }
)

const getCall = async ({ callId }) => {
  const endpoint = `${API_URL}/calls/${callId}/`
  const response = await axiosApiInstance.get(endpoint)
  return response.data
}

const listCalls = async ({ page }) => {
  const endpoint = `${API_URL}/calls/`
  const params = sanitizedURLSearchParams(
    {
      page,
    },
    { repeatMode: false }
  )
  const response = await axiosApiInstance.get(endpoint, {
    params,
  })
  return response.data
}


const createCall = async ({ callName, datasetName, className }) => {
  const endpoint = `${API_URL}/calls/`
  const response = await axiosApiInstance.post(
    endpoint,
    {
      call_name: callName,
      dataset_name: datasetName,
      class_name: className,
    }
  )
  return response.data
}

const closeCall = async ({ callId }) => {
  const endpoint = `${API_URL}/calls/${callId}/`
  const response = await axiosApiInstance.patch(endpoint, { status: 'CLOSED' })
  return response.data
}

const scheduleDiscoverRuns = async ({ callId }) => {
  const endpoint = `${API_URL}/calls/discover-runs/`
  const response = await axiosApiInstance.post(endpoint, { call_id: callId })
  return response.data
}

const scheduleGenerateLumilossPlots = async ({ callId, mode, removeRuns }) => {
  const endpoint = `${API_URL}/calls/generate-lumiloss-plots/`
  const response = await axiosApiInstance.post(
    endpoint,
    {
      call_id: callId,
      mode,
      remove_runs: removeRuns
    }
  )
  return response.data
}

const listCallsTasks = async ({ page, callId, taskId }) => {
  const endpoint = `${API_URL}/calls-tasks/`
  const params = sanitizedURLSearchParams(
    {
      page,
      call_id: callId,
      task_id: taskId,
    },
    { repeatMode: false }
  )
  const response = await axiosApiInstance.get(endpoint, { params })
  return response.data
}

const API = {
  calls: {
    get: getCall,
    create: createCall,
    list: listCalls,
    close: closeCall,
    schedule: {
      discoverRuns: scheduleDiscoverRuns,
      generateLumilossPlots: scheduleGenerateLumilossPlots,
    }
  },
  callsTasks: {
    list: listCallsTasks
  }
}

export default API
