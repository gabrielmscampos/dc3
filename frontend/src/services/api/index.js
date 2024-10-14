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

const scheduleDiscoverRuns = async ({
  callId,
  brilwsVersion,
  brilUnit,
  brilLowLumiThr,
  brilBeamstatus,
  brilAmodetag,
  brilNormtag,
  guiLookupDatasets,
  refreshRunsIfNeeded,
}) => {
  const endpoint = `${API_URL}/calls/${callId}/discover-runs/`
  const response = await axiosApiInstance.post(endpoint, {
    bril_brilws_version: brilwsVersion,
    bril_unit: brilUnit,
    bril_low_lumi_thr: brilLowLumiThr,
    bril_beamstatus: brilBeamstatus,
    bril_amodetag: brilAmodetag,
    bril_normtag: brilNormtag,
    gui_lookup_datasets: guiLookupDatasets,
    refresh_runs_if_needed: refreshRunsIfNeeded,
  })
  return response.data
}

const scheduleRunCallFullCertification = async ({
  callId,
  runTaskId,
  runsToIgnore,
  ignoreHLTEmergency,
  preJsonOMSFlags,
  goldenJsonOMSFlags,
  goldenJsonRRFlags,
  muonJsonOMSFlags,
  muonJsonRRFlags,
  targetLumilossUnit,
  lumilossDCSFlags,
  lumilossSubsystemsFlags,
  lumilossSubdetectorsFlags,
  targetAccLumiUnit,
  accLumiYear,
  accLumiBeamEnergy,
  accLumiAdditionalLabelOnPlot,
}) => {
  const endpoint = `${API_URL}/calls/${callId}/run-full-certification/`
  const response = await axiosApiInstance.post(endpoint, {
    run_task_id: runTaskId,
    runs_to_ignore: runsToIgnore,
    ignore_hlt_emergency: ignoreHLTEmergency,
    pre_json_oms_flags: preJsonOMSFlags,
    golden_json_oms_flags: goldenJsonOMSFlags,
    golden_json_rr_flags: goldenJsonRRFlags,
    muon_json_oms_flags: muonJsonOMSFlags,
    muon_json_rr_flags: muonJsonRRFlags,
    target_lumiloss_unit: targetLumilossUnit,
    lumiloss_dcs_flags: lumilossDCSFlags,
    lumiloss_subsystems_flags: lumilossSubsystemsFlags,
    lumiloss_subdetectors_flags: lumilossSubdetectorsFlags,
    target_acclumi_unit: targetAccLumiUnit,
    acc_lumi_year: accLumiYear,
    acc_lumi_beam_energy: accLumiBeamEnergy,
    acc_lumi_additional_label_on_plot: accLumiAdditionalLabelOnPlot,
  })
  return response.data
}

const listCallHistory = async ({ page, callId, name, status }) => {
  const endpoint = `${API_URL}/call-jobs/`
  const params = sanitizedURLSearchParams(
    {
      page,
      call_id: callId,
      name,
      status,
    },
    { repeatMode: false }
  )
  const response = await axiosApiInstance.get(endpoint, { params })
  return response.data
}

const getJob = async ({ id }) => {
  const endpoint = `${API_URL}/jobs/${id}/`
  const response = await axiosApiInstance.get(endpoint)
  return response.data
}

const listJobs = async ({ page, name, action, createdBy, status }) => {
  const endpoint = `${API_URL}/jobs/`
  const params = sanitizedURLSearchParams(
    {
      page,
      job_name: name,
      action_name: action,
      created_by: createdBy,
      status,
    },
    { repeatMode: false }
  )
  const response = await axiosApiInstance.get(endpoint, {
    params,
  })
  return response.data
}

const scheduleRunJsonProduction = async ({
  jobName,
  className,
  datasetName,
  runList,
  ignoreHLTEmergency,
  preJsonOMSFlags,
  goldenJsonOMSFlags,
  goldenJsonRRFlags,
  muonJsonOMSFlags,
  muonJsonRRFlags,
}) => {
  const endpoint = `${API_URL}/jobs/run-json-production/`
  const response = await axiosApiInstance.post(endpoint, {
    job_name: jobName,
    class_name: className,
    dataset_name: datasetName,
    run_list: runList,
    ignore_hlt_emergency: ignoreHLTEmergency,
    pre_json_oms_flags: preJsonOMSFlags,
    golden_json_oms_flags: goldenJsonOMSFlags,
    golden_json_rr_flags: goldenJsonRRFlags,
    muon_json_oms_flags: muonJsonOMSFlags,
    muon_json_rr_flags: muonJsonRRFlags,
  })
  return response.data
}

const scheduleRunLumiloss = async ({
  jobName,
  className,
  datasetName,
  includedRuns,
  notInDCSRuns,
  lowLumiRuns,
  ignoreRuns,
  ignoreHLTEmergency,
  preJsonOMSFlags,
  goldenJsonOMSFlags,
  goldenJsonRRFlags,
  muonJsonOMSFlags,
  muonJsonRRFlags,
  brilwsVersion,
  brilUnit,
  brilLowLumiThr,
  brilBeamstatus,
  brilAmodetag,
  brilNormtag,
  targetLumilossUnit,
  lumilossDCSFlags,
  lumilossSubsystemsFlags,
  lumilossSubdetectorsFlags,
}) => {
  const endpoint = `${API_URL}/jobs/run-lumiloss/`
  const response = await axiosApiInstance.post(endpoint, {
    job_name: jobName,
    class_name: className,
    dataset_name: datasetName,
    included_runs: includedRuns,
    not_in_dcs_runs: notInDCSRuns,
    low_lumi_runs: lowLumiRuns,
    ignore_runs: ignoreRuns,
    ignore_hlt_emergency: ignoreHLTEmergency,
    pre_json_oms_flags: preJsonOMSFlags,
    golden_json_oms_flags: goldenJsonOMSFlags,
    golden_json_rr_flags: goldenJsonRRFlags,
    muon_json_oms_flags: muonJsonOMSFlags,
    muon_json_rr_flags: muonJsonRRFlags,
    bril_brilws_version: brilwsVersion,
    bril_unit: brilUnit,
    bril_low_lumi_thr: brilLowLumiThr,
    bril_beamstatus: brilBeamstatus,
    bril_amodetag: brilAmodetag,
    bril_normtag: brilNormtag,
    target_lumiloss_unit: targetLumilossUnit,
    lumiloss_dcs_flags: lumilossDCSFlags,
    lumiloss_subsystems_flags: lumilossSubsystemsFlags,
    lumiloss_subdetectors_flags: lumilossSubdetectorsFlags,
  })
  return response.data
}

const scheduleRunFullLumiAnalysis = async ({
  jobName,
  className,
  datasetName,
  includedRuns,
  notInDCSRuns,
  lowLumiRuns,
  ignoreRuns,
  ignoreHLTEmergency,
  preJsonOMSFlags,
  goldenJsonOMSFlags,
  goldenJsonRRFlags,
  muonJsonOMSFlags,
  muonJsonRRFlags,
  brilwsVersion,
  brilUnit,
  brilLowLumiThr,
  brilBeamstatus,
  brilAmodetag,
  brilNormtag,
  targetLumilossUnit,
  lumilossDCSFlags,
  lumilossSubsystemsFlags,
  lumilossSubdetectorsFlags,
  targetAccLumiUnit,
  accLumiYear,
  accLumiBeamEnergy,
  accLumiAdditionalLabelOnPlot,
}) => {
  const endpoint = `${API_URL}/jobs/run-full-lumi-analysis/`
  const response = await axiosApiInstance.post(endpoint, {
    job_name: jobName,
    class_name: className,
    dataset_name: datasetName,
    included_runs: includedRuns,
    not_in_dcs_runs: notInDCSRuns,
    low_lumi_runs: lowLumiRuns,
    ignore_runs: ignoreRuns,
    ignore_hlt_emergency: ignoreHLTEmergency,
    pre_json_oms_flags: preJsonOMSFlags,
    golden_json_oms_flags: goldenJsonOMSFlags,
    golden_json_rr_flags: goldenJsonRRFlags,
    muon_json_oms_flags: muonJsonOMSFlags,
    muon_json_rr_flags: muonJsonRRFlags,
    bril_brilws_version: brilwsVersion,
    bril_unit: brilUnit,
    bril_low_lumi_thr: brilLowLumiThr,
    bril_beamstatus: brilBeamstatus,
    bril_amodetag: brilAmodetag,
    bril_normtag: brilNormtag,
    target_lumiloss_unit: targetLumilossUnit,
    lumiloss_dcs_flags: lumilossDCSFlags,
    lumiloss_subsystems_flags: lumilossSubsystemsFlags,
    lumiloss_subdetectors_flags: lumilossSubdetectorsFlags,
    target_acclumi_unit: targetAccLumiUnit,
    acc_lumi_year: accLumiYear,
    acc_lumi_beam_energy: accLumiBeamEnergy,
    acc_lumi_additional_label_on_plot: accLumiAdditionalLabelOnPlot,
  })
  return response.data
}

const scheduleRunAccLumi = async ({
  jobName,
  className,
  datasetName,
  runList,
  ignoreHLTEmergency,
  preJsonOMSFlags,
  goldenJsonOMSFlags,
  goldenJsonRRFlags,
  muonJsonOMSFlags,
  muonJsonRRFlags,
  brilwsVersion,
  brilUnit,
  brilLowLumiThr,
  brilBeamstatus,
  brilAmodetag,
  brilNormtag,
  targetAccLumiUnit,
  accLumiYear,
  accLumiBeamEnergy,
  accLumiAdditionalLabelOnPlot,
}) => {
  const endpoint = `${API_URL}/jobs/run-acc-lumi/`
  const response = await axiosApiInstance.post(endpoint, {
    job_name: jobName,
    class_name: className,
    dataset_name: datasetName,
    run_list: runList,
    ignore_hlt_emergency: ignoreHLTEmergency,
    pre_json_oms_flags: preJsonOMSFlags,
    golden_json_oms_flags: goldenJsonOMSFlags,
    golden_json_rr_flags: goldenJsonRRFlags,
    muon_json_oms_flags: muonJsonOMSFlags,
    muon_json_rr_flags: muonJsonRRFlags,
    bril_brilws_version: brilwsVersion,
    bril_unit: brilUnit,
    bril_low_lumi_thr: brilLowLumiThr,
    bril_beamstatus: brilBeamstatus,
    bril_amodetag: brilAmodetag,
    bril_normtag: brilNormtag,
    target_acclumi_unit: targetAccLumiUnit,
    acc_lumi_year: accLumiYear,
    acc_lumi_beam_energy: accLumiBeamEnergy,
    acc_lumi_additional_label_on_plot: accLumiAdditionalLabelOnPlot,
  })
  return response.data
}

const scheduleRunFullCertification = async ({
  jobName,
  className,
  datasetName,
  cycles,
  minRun,
  maxRun,
  ignoreRuns,
  ignoreHLTEmergency,
  preJsonOMSFlags,
  goldenJsonOMSFlags,
  goldenJsonRRFlags,
  muonJsonOMSFlags,
  muonJsonRRFlags,
  brilwsVersion,
  brilUnit,
  brilLowLumiThr,
  brilBeamstatus,
  brilAmodetag,
  brilNormtag,
  erasPrefix,
  ignoreEras,
  targetLumilossUnit,
  lumilossDCSFlags,
  lumilossSubsystemsFlags,
  lumilossSubdetectorsFlags,
  targetAccLumiUnit,
  accLumiYear,
  accLumiBeamEnergy,
  accLumiAdditionalLabelOnPlot,
}) => {
  const endpoint = `${API_URL}/jobs/run-full-certification/`
  const response = await axiosApiInstance.post(endpoint, {
    job_name: jobName,
    class_name: className,
    dataset_name: datasetName,
    cycles,
    min_run: minRun,
    max_run: maxRun,
    ignore_runs: ignoreRuns,
    ignore_hlt_emergency: ignoreHLTEmergency,
    pre_json_oms_flags: preJsonOMSFlags,
    golden_json_oms_flags: goldenJsonOMSFlags,
    golden_json_rr_flags: goldenJsonRRFlags,
    muon_json_oms_flags: muonJsonOMSFlags,
    muon_json_rr_flags: muonJsonRRFlags,
    bril_brilws_version: brilwsVersion,
    bril_unit: brilUnit,
    bril_low_lumi_thr: brilLowLumiThr,
    bril_beamstatus: brilBeamstatus,
    bril_amodetag: brilAmodetag,
    bril_normtag: brilNormtag,
    eras_prefix: erasPrefix,
    ignore_eras: ignoreEras,
    target_lumiloss_unit: targetLumilossUnit,
    lumiloss_dcs_flags: lumilossDCSFlags,
    lumiloss_subsystems_flags: lumilossSubsystemsFlags,
    lumiloss_subdetectors_flags: lumilossSubdetectorsFlags,
    target_acclumi_unit: targetAccLumiUnit,
    acc_lumi_year: accLumiYear,
    acc_lumi_beam_energy: accLumiBeamEnergy,
    acc_lumi_additional_label_on_plot: accLumiAdditionalLabelOnPlot,
  })
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

const downloadFile = async ({ path }) => {
  const endpoint = `${API_URL}/files/download/`
  const params = sanitizedURLSearchParams({ path }, { repeatMode: false })
  const response = await axiosApiInstance.get(endpoint, {
    params,
    responseType: 'blob',
  })
  return response
}

const genericFetchAllPages = async ({ apiMethod, params = {} }) => {
  const allData = []
  let nextPageExists = true
  let page = 0
  let errorCount = 0
  while (nextPageExists) {
    page++
    try {
      const { results, next } = await apiMethod({
        page,
        ...params,
      })
      results.forEach((e) => allData.unshift(e))
      nextPageExists = !(next === null)
    } catch (err) {
      errorCount++
    }
  }

  return {
    results: allData,
    count: allData.length,
    error: errorCount,
    totalPages: page,
  }
}

const API = {
  utils: {
    genericFetchAllPages,
  },
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
      runCallFullCertification: scheduleRunCallFullCertification,
    },
  },
  callHistory: {
    list: listCallHistory,
  },
  jobs: {
    get: getJob,
    list: listJobs,
    schedule: {
      jsonProduction: scheduleRunJsonProduction,
      lumiloss: scheduleRunLumiloss,
      accLumi: scheduleRunAccLumi,
      fullLumiAnalysis: scheduleRunFullLumiAnalysis,
      fullCertification: scheduleRunFullCertification,
    },
  },
  files: {
    list: listFiles,
    getContent: getFileContent,
    download: downloadFile,
  },
}

export default API
