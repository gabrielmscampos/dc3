const generateRRUrl = ({ datasetName, className, runList }) => {
  return `https://cmsrunregistry.web.cern.ch/offline/datasets/global?ofbf%5Brules%5D%5B0%5D%5Bfield%5D=name&ofbf%5Brules%5D%5B0%5D%5Bvalue%5D=${datasetName}&ofbf%5Brules%5D%5B0%5D%5Boperator%5D=%3D&ofbf%5Brules%5D%5B1%5D%5Bfield%5D=rr_attributes.class&ofbf%5Brules%5D%5B1%5D%5Bvalue%5D=${className}&ofbf%5Brules%5D%5B1%5D%5Boperator%5D=%3D&ofbf%5Brules%5D%5B2%5D%5Bfield%5D=run_number&ofbf%5Brules%5D%5B2%5D%5Bvalue%5D=${runList.join(' ')}&ofbf%5Brules%5D%5B2%5D%5Boperator%5D=in&ofbf%5Bcombinator%5D=and&ofbf%5Bnot%5D=true`
}

export { generateRRUrl }
