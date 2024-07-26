import axios from 'axios'

import { sanitizedURLSearchParams } from '../../utils/sanitizer'
import { getPublicToken, getConfidentialToken } from '../../utils/userTokens'
import { API_URL } from '../../config/env'

const axiosApiInstance = axios.create()

axiosApiInstance.interceptors.request.use(
  async (config) => {
    const oidc = getConfidentialToken()
    config.headers = {
      Authorization: `${oidc.tokenType} ${oidc.accessToken}`,
      Accept: 'application/json',
    }
    return config
  },
  (error) => {
    Promise.reject(error)
  }
)

const exchangeToken = async () => {
  const oidc = getPublicToken()
  const endpoint = `${API_URL}/auth/exchange-token/`
  const response = await axios.post(
    endpoint,
    {},
    {
      headers: {
        Authorization: `${oidc.tokenType} ${oidc.accessToken}`,
        Accept: 'application/json',
      },
    }
  )
  return response.data
}

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
  const response = await axiosApiInstance.post(endpoint, {
    call_name: callName,
    dataset_name: datasetName,
    class_name: className,
  })
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
  const response = await axiosApiInstance.post(endpoint, {
    call_id: callId,
    mode,
    remove_runs: removeRuns,
  })
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

const listFiles = async ({ dir }) => {
  const endpoint = `${API_URL}/files/`
  const params = sanitizedURLSearchParams(
    {
      dir,
    },
    { repeatMode: false }
  )
  const response = await axiosApiInstance.get(endpoint, { params })
  return response.data
}

const getFileContent = async ({ path }) => {
  const endpoint = `${API_URL}/files/content/`
  const params = sanitizedURLSearchParams(
    {
      path,
    },
    { repeatMode: false }
  )
  const response = await axiosApiInstance.get(endpoint, {
    params,
    responseType: 'blob',
  })
  return response
}

const downloadFileUrl = ({ path }) => {
  const params = sanitizedURLSearchParams({ path }, { repeatMode: false })
  return `${API_URL}/files/download/?path=${params.get('path')}`
}

const API = {
  auth: {
    exchange: exchangeToken,
  },
  calls: {
    get: getCall,
    create: createCall,
    list: listCalls,
    close: closeCall,
    schedule: {
      discoverRuns: scheduleDiscoverRuns,
      generateLumilossPlots: scheduleGenerateLumilossPlots,
    },
  },
  callsTasks: {
    list: listCallsTasks,
  },
  files: {
    list: listFiles,
    getContent: getFileContent,
    downloadUrl: downloadFileUrl,
  },
}

export default API
