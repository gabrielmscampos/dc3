const defaults = {
  runsToIgnore: [],
  ignoreHLTEmergency: false,
  preJsonOMSFlags: [
    'beam1_present',
    'beam2_present',
    'beam1_stable',
    'beam2_stable',
  ],
  goldenJsonOMSFlags: [
    'beam1_present',
    'beam2_present',
    'beam1_stable',
    'beam2_stable',
    'cms_active',
    'bpix_ready',
    'fpix_ready',
    'tibtid_ready',
    'tecm_ready',
    'tecp_ready',
    'tob_ready',
    'hbhea_ready',
    'hbheb_ready',
    'hbhec_ready',
    'hf_ready',
    'ho_ready',
  ],
  goldenJsonRRFlags: [
    'tracker-pixel',
    'tracker-strip',
    'tracker-track',
    'ecal-ecal',
    'ecal-es',
    'hcal-hcal',
    'csc-csc',
    'dt-dt',
    'l1t-l1tmu',
    'l1t-l1tcalo',
    'hlt-hlt',
    'egamma-egamma',
    'muon-muon',
    'jetmet-jetmet',
  ],
  muonJsonOMSFlags: [
    'beam1_present',
    'beam2_present',
    'beam1_stable',
    'beam2_stable',
    'cms_active',
    'bpix_ready',
    'fpix_ready',
    'tibtid_ready',
    'tecm_ready',
    'tecp_ready',
    'tob_ready',
  ],
  muonJsonRRFlags: [
    'tracker-pixel',
    'tracker-strip',
    'tracker-track',
    'csc-csc',
    'dt-dt',
    'l1t-l1tmu',
    'hlt-hlt',
    'muon-muon',
  ],
  brilwsVersion: '3.7.4',
  brilUnit: '/ub',
  brilLowLumiThr: 80000,
  brilBeamstatus: 'STABLE BEAMS',
  brilAmodetag: 'PROTPHYS',
  brilNormtag:
    '/cvmfs/cms-bril.cern.ch/cms-lumi-pog/Normtags/normtag_BRIL.json',
  guiLookupDatasets: [
    '/ZeroBias/Run2024.*-PromptReco-v.*?/DQMIO',
    '/(JetMET0|JetMET1)/Run2024.*-PromptReco-v.*?/DQMIO',
    '/(Muon0|Muon1)/Run2024.*-PromptReco-v.*?/DQMIO',
    '/(EGamma0|EGamma1)/Run2024.*-PromptReco-v.*?/DQMIO',
    '/HcalNZS/Run2024.*-PromptReco-v.*?/DQMIO',
    '/HLTPhysics/Run2024.*-PromptReco-v.*?/DQMIO',
  ],
  refreshRunsIfNeeded: false,
  targetLumilossUnit: '/pb',
  lumilossDCSFlags: [
    'bpix_ready',
    'fpix_ready',
    'tibtid_ready',
    'tecm_ready',
    'tecp_ready',
    'tob_ready',
    'hbhea_ready',
    'hbheb_ready',
    'hbhec_ready',
    'hf_ready',
    'ho_ready',
  ],
  lumilossSubsystemsFlags: [
    'tracker-pixel',
    'tracker-strip',
    'tracker-track',
    'ecal-ecal',
    'ecal-es',
    'hcal-hcal',
    'csc-csc',
    'dt-dt',
    'l1t-l1tmu',
    'l1t-l1tcalo',
    'hlt-hlt',
    'egamma-egamma',
    'muon-muon',
    'jetmet-jetmet',
  ],
  lumilossSubdetectorsFlags: {
    PixelPhase1: ['tracker-pixel', 'bpix_ready', 'fpix_ready'],
    SiStrip: [
      'tracker-strip',
      'tibtid_ready',
      'tecm_ready',
      'tecp_ready',
      'tob_ready',
    ],
    ECAL: ['ecal-ecal'],
    ES: ['ecal-es'],
    HCAL: [
      'hcal-hcal',
      'hbhea_ready',
      'hbheb_ready',
      'hbhec_ready',
      'hf_ready',
      'ho_ready',
    ],
    CSC: ['csc-csc'],
    DT: ['dt-dt'],
    L1T: ['l1t-l1tcalo', 'l1t-l1tmu'],
    HLT: ['hlt-hlt'],
    Tracking: ['tracker-track'],
    MuonPOG: ['muon-muon'],
    JetMET: ['jetmet-jetmet'],
    EGamma: ['egamma-egamma'],
  },
  targetAccLumiUnit: '/fb',
  accLumiYear: 2024,
  accLumiBeamEnergy: 6800,
  accLumiAdditionalLabelOnPlot: 'CMS Preliminary Offline Luminosity',
  ignoreEras: ['Run2024A'],
  erasPrefix: 'Run2024',
}

export default defaults
