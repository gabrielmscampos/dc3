import React, { useState } from 'react'

import { useNavigate } from 'react-router-dom'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import CreatableSelect from 'react-select/creatable'
import Swal from 'sweetalert2'

import defaults from '../../../config/defaults'
import API from '../../../services/api'

const RunFullCertificationForm = () => {
  const navigate = useNavigate()

  // Inputs for json production
  const [jobName, setJobName] = useState()
  const [rrClassName, setRRClassName] = useState()
  const [rrDatasetName, setRRDatasetName] = useState()
  const [rrCycles, setRRCycles] = useState([])
  const [rrMinRun, setRRMinRun] = useState()
  const [rrMaxRun, setRRMaxRun] = useState()
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
  const [erasPrefix, setErasPrefix] = useState(defaults.erasPrefix)
  const [ignoreEras, setIgnoreEras] = useState(defaults.ignoreEras)
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
  const [targetAccLumiUnit, setTargetAcclumiUnit] = useState(
    defaults.targetAccLumiUnit
  )
  const [accLumiYear, setAccLumiYear] = useState(defaults.accLumiYear)
  const [accLumiBeamEnergy, setAccLumiBeamEnergy] = useState(
    defaults.accLumiBeamEnergy
  )
  const [accLumiAdditionalLabelOnPlot, setAccLumiAdditionalLabel] = useState(
    defaults.accLumiAdditionalLabelOnPlot
  )

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!jobName || !rrClassName || !rrDatasetName) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Please provide values for Run Registry Class and Dataset.',
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
      .fullCertification({
        jobName,
        className: rrClassName,
        datasetName: rrDatasetName,
        cycles: rrCycles.length === 0 ? undefined : rrCycles,
        minRun: rrMinRun,
        maxRun: rrMaxRun,
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
              <Form.Label>
                Cycles (keep it empty if using run range):
              </Form.Label>
              <CreatableSelect
                isMulti
                value={rrCycles.map((cycle) => ({
                  value: cycle,
                  label: cycle,
                }))}
                onChange={(newValue) =>
                  setRRCycles(newValue.map((option) => parseInt(option.value)))
                }
                placeholder='Type to add a cycle'
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='formRunRange'>
              <Form.Label>Run range</Form.Label>
              <Row>
                <Col xs={6}>
                  <Form.Control
                    type='number'
                    value={rrMinRun}
                    onChange={(e) => setRRMinRun(parseFloat(e.target.value))}
                  />
                </Col>
                <Col xs={6}>
                  <Form.Control
                    type='number'
                    value={rrMaxRun}
                    onChange={(e) => setRRMaxRun(parseFloat(e.target.value))}
                  />
                </Col>
              </Row>
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
              <Form.Label>Era T0 label prefix:</Form.Label>
              <Form.Control
                type='text'
                value={erasPrefix}
                onChange={(e) => setErasPrefix(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Ignore eras:</Form.Label>
              <CreatableSelect
                isMulti
                value={ignoreEras.map((era) => ({
                  value: era,
                  label: era,
                }))}
                onChange={(newValue) =>
                  setIgnoreEras(newValue.map((option) => option.value))
                }
                placeholder='Type to add an era'
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
                onChange={(e) => setBrilLowLumiThr(parseInt(e.target.value))}
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
            <Form.Group className='mb-2'>
              <Form.Label>Convert Acc. Luminosity to unit:</Form.Label>
              <Form.Control
                type='text'
                value={targetAccLumiUnit}
                onChange={(e) =>
                  setTargetAcclumiUnit(
                    e.target.value === '' ? null : e.target.value
                  )
                }
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Acc. Luminosity Year:</Form.Label>
              <Form.Control
                type='number'
                value={accLumiYear}
                onChange={(e) => setAccLumiYear(parseInt(e.target.value))}
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Acc. Luminosity Beam Energy:</Form.Label>
              <Form.Control
                type='number'
                value={accLumiBeamEnergy}
                onChange={(e) => setAccLumiBeamEnergy(parseInt(e.target.value))}
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Additional Label on Acc. Luminosity plot:</Form.Label>
              <Form.Control
                type='text'
                value={accLumiAdditionalLabelOnPlot}
                onChange={(e) => {
                  setAccLumiAdditionalLabel(
                    e.target.value === '' ? null : e.target.value
                  )
                }}
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

export default RunFullCertificationForm
