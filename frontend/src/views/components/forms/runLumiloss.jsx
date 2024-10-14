import React, { useState } from 'react'

import { useNavigate } from 'react-router-dom'
import Row from 'react-bootstrap/Row'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import CreatableSelect from 'react-select/creatable'
import Swal from 'sweetalert2'

import defaults from '../../../config/defaults'
import API from '../../../services/api'

const RunLumilossForm = () => {
  const navigate = useNavigate()

  // Inputs for json production
  const [jobName, setJobName] = useState()
  const [rrClassName, setRRClassName] = useState()
  const [rrDatasetName, setRRDatasetName] = useState()
  const [includedRuns, setIncludedRuns] = useState([])
  const [notInDCSRuns, setNotInDCSRuns] = useState([])
  const [lowLumiRuns, setLowLumiRuns] = useState([])
  const [runsToIgnore, setRunsToIgnore] = useState(defaults.runsToIgnore)
  const [ignoreHLTEmergency, setIgnoreHLTEmergency] = useState(
    defaults.ignoreHLTEmergency
  )
  const [preJsonOMSFlags, setPreJsonOMSFlags] = useState(
    defaults.preJsonOMSFlags
  )
  const [goldenJsonOMSFlags, setGoldenJsonOMSFlags] = useState(
    defaults.goldenJsonOMSFlags
  )
  const [goldenJsonRRFlags, setGoldenJsonRRFlags] = useState(
    defaults.goldenJsonRRFlags
  )
  const [muonJsonOMSFlags, setMuonJsonOMSFlags] = useState(
    defaults.muonJsonOMSFlags
  )
  const [muonJsonRRFlags, setMuonJsonRRFlags] = useState(
    defaults.muonJsonRRFlags
  )
  const [brilwsVersion, setBrilBrilwsVersion] = useState(defaults.brilwsVersion)
  const [brilUnit, setBrilUnit] = useState(defaults.brilUnit)
  const [brilLowLumiThr, setBrilLowLumiThr] = useState(defaults.brilLowLumiThr)
  const [brilBeamstatus, setBrilBeamstatus] = useState(defaults.brilBeamstatus)
  const [brilAmodetag, setBrilAmodetag] = useState(defaults.brilAmodetag)
  const [brilNormtag, setBrilNormtag] = useState(defaults.brilNormtag)
  const [targetLumilossUnit, setTargetLumilossUnit] = useState(
    defaults.targetLumilossUnit
  )
  const [lumilossDCSFlags, setLumilossDCSFlags] = useState(
    defaults.lumilossDCSFlags
  )
  const [lumilossSubsystemsFlags, setLumilossSubsystemsFlags] = useState(
    defaults.lumilossSubsystemsFlags
  )
  const [lumilossSubdetectorsFlags, setLumilossSubdetectorsFlags] = useState(
    defaults.lumilossSubdetectorsFlags
  )

  const handleSubmit = (e) => {
    e.preventDefault()

    if (
      !jobName ||
      !rrClassName ||
      !rrDatasetName ||
      includedRuns.length === 0
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Please provide values for Run Registry Class, Dataset, and Included Runs.',
      })
      return
    }

    Swal.fire({
      title: 'Loading...',
      text: 'Please wait while we process your request.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })

    API.jobs.schedule
      .lumiloss({
        jobName,
        className: rrClassName,
        datasetName: rrDatasetName,
        includedRuns,
        notInDCSRuns,
        lowLumiRuns,
        ignoreRuns: runsToIgnore,
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
      })
      .then((response) => {
        const jobId = response.task_id
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Your request was completed successfully.',
        }).then(() => {
          navigate(`/job/${jobId}`)
        })
      })
      .catch((err) => {
        console.error(err)
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong with the request!',
        })
      })
  }

  return (
    <Card className='mt-4'>
      <Card.Header>Form</Card.Header>
      <Card.Body>
        <Row className='mt-2'>
          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-2'>
              <Form.Label>Job name</Form.Label>
              <Form.Control
                type='text'
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder='Type a short description for your job'
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Run Registry Class:</Form.Label>
              <Form.Control
                type='text'
                value={rrClassName}
                onChange={(e) => setRRClassName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Run Registry Dataset:</Form.Label>
              <Form.Control
                type='text'
                value={rrDatasetName}
                onChange={(e) => setRRDatasetName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Included Runs:</Form.Label>
              <CreatableSelect
                isMulti
                value={includedRuns.map((runNumber) => ({
                  value: runNumber,
                  label: runNumber,
                }))}
                onChange={(newValue) =>
                  setIncludedRuns(
                    newValue.map((option) => parseInt(option.value))
                  )
                }
                placeholder='Type to add a run'
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Not in DCS runs:</Form.Label>
              <CreatableSelect
                isMulti
                value={notInDCSRuns.map((runNumber) => ({
                  value: runNumber,
                  label: runNumber,
                }))}
                onChange={(newValue) =>
                  setNotInDCSRuns(
                    newValue.map((option) => parseInt(option.value))
                  )
                }
                placeholder='Type to add a run'
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Low luminosity runs:</Form.Label>
              <CreatableSelect
                isMulti
                value={lowLumiRuns.map((runNumber) => ({
                  value: runNumber,
                  label: runNumber,
                }))}
                onChange={(newValue) =>
                  setLowLumiRuns(
                    newValue.map((option) => parseInt(option.value))
                  )
                }
                placeholder='Type to add a run'
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Runs to ignore:</Form.Label>
              <CreatableSelect
                isMulti
                value={runsToIgnore.map((runNumber) => ({
                  value: runNumber,
                  label: runNumber,
                }))}
                onChange={(newValue) =>
                  setRunsToIgnore(
                    newValue.map((option) => parseInt(option.value))
                  )
                }
                placeholder='Type to add a run'
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Ignore HLT Emergency:</Form.Label>
              <Form.Check
                type='checkbox'
                checked={ignoreHLTEmergency}
                onChange={(e) => setIgnoreHLTEmergency(e.target.checked)}
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>preJSON OMS flags:</Form.Label>
              <CreatableSelect
                isMulti
                value={preJsonOMSFlags.map((dataset) => ({
                  value: dataset,
                  label: dataset,
                }))}
                onChange={(newValue) =>
                  setPreJsonOMSFlags(newValue.map((option) => option.value))
                }
                placeholder='Type to add a flag'
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>goldenJSON OMS flags:</Form.Label>
              <CreatableSelect
                isMulti
                value={goldenJsonOMSFlags.map((dataset) => ({
                  value: dataset,
                  label: dataset,
                }))}
                onChange={(newValue) =>
                  setGoldenJsonOMSFlags(newValue.map((option) => option.value))
                }
                placeholder='Type to add a flag'
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>goldenJSON RR flags:</Form.Label>
              <CreatableSelect
                isMulti
                value={goldenJsonRRFlags.map((dataset) => ({
                  value: dataset,
                  label: dataset,
                }))}
                onChange={(newValue) =>
                  setGoldenJsonRRFlags(newValue.map((option) => option.value))
                }
                placeholder='Type to add a flag'
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>muonJSON OMS flags:</Form.Label>
              <CreatableSelect
                isMulti
                value={muonJsonOMSFlags.map((dataset) => ({
                  value: dataset,
                  label: dataset,
                }))}
                onChange={(newValue) =>
                  setMuonJsonOMSFlags(newValue.map((option) => option.value))
                }
                placeholder='Type to add a flag'
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>muonJSON RR flags:</Form.Label>
              <CreatableSelect
                isMulti
                value={muonJsonRRFlags.map((dataset) => ({
                  value: dataset,
                  label: dataset,
                }))}
                onChange={(newValue) =>
                  setMuonJsonRRFlags(newValue.map((option) => option.value))
                }
                placeholder='Type to add a flag'
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Brilws package version:</Form.Label>
              <Form.Control
                type='text'
                value={brilwsVersion}
                onChange={(e) => setBrilBrilwsVersion(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Bril Unit:</Form.Label>
              <Form.Control
                type='text'
                value={brilUnit}
                onChange={(e) =>
                  setBrilUnit(e.target.value === '' ? null : e.target.value)
                }
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Low Lumi Threshold:</Form.Label>
              <Form.Control
                type='number'
                value={brilLowLumiThr}
                onChange={(e) => setBrilLowLumiThr(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Bril Beam Status:</Form.Label>
              <Form.Control
                type='text'
                value={brilBeamstatus}
                onChange={(e) =>
                  setBrilBeamstatus(
                    e.target.value === '' ? null : e.target.value
                  )
                }
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Bril Amodetag:</Form.Label>
              <Form.Control
                type='text'
                value={brilAmodetag}
                onChange={(e) =>
                  setBrilAmodetag(e.target.value === '' ? null : e.target.value)
                }
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Bril Normtag:</Form.Label>
              <Form.Control
                type='text'
                value={brilNormtag}
                onChange={(e) =>
                  setBrilNormtag(e.target.value === '' ? null : e.target.value)
                }
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Convert Lumiloss to unit:</Form.Label>
              <Form.Control
                type='text'
                value={targetLumilossUnit}
                onChange={(e) =>
                  setTargetLumilossUnit(
                    e.target.value === '' ? null : e.target.value
                  )
                }
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Lumiloss DCS flags:</Form.Label>
              <CreatableSelect
                isMulti
                value={lumilossDCSFlags.map((dataset) => ({
                  value: dataset,
                  label: dataset,
                }))}
                onChange={(newValue) =>
                  setLumilossDCSFlags(newValue.map((option) => option.value))
                }
                placeholder='Type to add a flag'
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Lumiloss Subsystems flags:</Form.Label>
              <CreatableSelect
                isMulti
                value={lumilossSubsystemsFlags.map((dataset) => ({
                  value: dataset,
                  label: dataset,
                }))}
                onChange={(newValue) =>
                  setLumilossSubsystemsFlags(
                    newValue.map((option) => option.value)
                  )
                }
                placeholder='Type to add a flag'
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Lumiloss Subdetectors flags:</Form.Label>
              <Form.Control
                as='textarea'
                type='text'
                value={JSON.stringify(lumilossSubdetectorsFlags, null, 2)}
                onChange={(e) =>
                  setLumilossSubdetectorsFlags(JSON.parse(e.target.value))
                }
              />
            </Form.Group>
            <hr />
            <Button variant='primary' type='submit'>
              Submit
            </Button>
          </Form>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default RunLumilossForm
