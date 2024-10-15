import React, { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import Swal from 'sweetalert2'

import defaults from '../../../config/defaults'
import API from '../../../services/api'

const CertifyCallForm = ({ callId }) => {
  const navigate = useNavigate()

  const [isLoadingRunsTasks, setIsLoadingRunsTasks] = useState(true)
  const [runsTasks, setRunsTasks] = useState()
  const [selectedTask, setSelectedTask] = useState()
  const [taskResult, setTaskResult] = useState()

  // Inputs for full certification
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

  const fetchFinishedRunsTasks = ({ callId }) => {
    setIsLoadingRunsTasks(true)
    API.utils
      .genericFetchAllPages({
        apiMethod: API.callHistory.list,
        params: {
          callId,
          name: 'discover_runs_task',
          status: 'SUCCESS',
        },
      })
      .then((response) => {
        const results = response.results.map((item) => {
          return {
            value: item.id,
            label: `${item.id} - ${item.modified_at}`,
            params: item.params,
            results_dir: item.results_dir,
          }
        })
        setRunsTasks(results)
      })
      .catch((error) => {
        console.error(error)
        toast.error('Failure to communicate with the API!')
      })
      .finally(() => {
        setIsLoadingRunsTasks(false)
      })
  }

  const fetchRunTaskResult = ({ runTaskFile }) => {
    API.files
      .getContent({ path: runTaskFile })
      .then((response) => {
        response.data.text().then((text) => {
          setTaskResult(JSON.parse(text))
        })
      })
      .catch((error) => {
        console.error(error)
        toast.error('Failure to communicate with the API!')
      })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    Swal.fire({
      title: 'Loading...',
      text: 'Please wait while we process your request.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })

    API.calls.schedule
      .certifyCall({
        callId,
        runJobId: selectedTask.value,
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
      })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Your request was completed successfully.',
        }).then(() => {
          navigate(`/call/${callId}/tasks`)
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

  useEffect(() => {
    fetchFinishedRunsTasks({ callId })
  }, [callId])

  if (isLoadingRunsTasks) {
    return <Spinner animation='border' role='status' />
  }

  if (runsTasks.length === 0) {
    return (
      <Alert className='mt-4' variant='danger'>
        <Alert.Heading>Attention</Alert.Heading>
        <hr />
        <p>Couldn&apos;t find any successfully finished discover runs task.</p>
      </Alert>
    )
  }

  return (
    <>
      <Card className='mt-4'>
        <Card.Header>Discover runs</Card.Header>
        <Card.Body>
          <Row>
            <Col xs={10}>
              <Select
                options={runsTasks}
                onChange={setSelectedTask}
                value={selectedTask}
                placeholder='Select a run task'
              />
            </Col>
            <Col xs={1}>
              <Button
                variant='primary'
                type='submit'
                disabled={selectedTask === undefined}
                onClick={() => {
                  fetchRunTaskResult({
                    runTaskFile: `${selectedTask.results_dir}/results.json`,
                  })
                }}
              >
                Choose
              </Button>
            </Col>
          </Row>
          {taskResult !== undefined && (
            <Row className='mt-2'>
              <Form.Group className='mb-2'>
                <Form.Label>Brilws package version:</Form.Label>
                <Form.Control
                  type='text'
                  value={selectedTask.params.bril_brilws_version}
                  readOnly
                  disabled
                />
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label>Unit:</Form.Label>
                <Form.Control
                  type='text'
                  value={selectedTask.params.bril_unit}
                  readOnly
                  disabled
                />
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label>Low Lumi Threshold:</Form.Label>
                <Form.Control
                  type='number'
                  value={selectedTask.params.bril_low_lumi_thr}
                  readOnly
                  disabled
                />
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label>Beam Status:</Form.Label>
                <Form.Control
                  type='text'
                  value={selectedTask.params.bril_beamstatus}
                  readOnly
                  disabled
                />
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label>Amodetag:</Form.Label>
                <Form.Control
                  type='text'
                  value={selectedTask.params.bril_amodetag}
                  readOnly
                  disabled
                />
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label>Normtag:</Form.Label>
                <Form.Control
                  type='text'
                  value={selectedTask.params.bril_normtag}
                  readOnly
                  disabled
                />
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label>Included runs</Form.Label>
                <CreatableSelect
                  isMulti
                  value={taskResult.final_run_list.map((item) => ({
                    value: item,
                    label: item,
                  }))}
                  isDisabled
                />
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label>Low luminosity runs</Form.Label>
                <CreatableSelect
                  isMulti
                  value={taskResult.low_lumi_runs.map((item) => ({
                    value: item.run_number,
                    label: item.run_number,
                  }))}
                  isDisabled
                />
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label>Runs not in DCS-only JSON</Form.Label>
                <CreatableSelect
                  isMulti
                  value={taskResult.not_in_dcs_runs.run_numbers.map((item) => ({
                    value: item,
                    label: item,
                  }))}
                  isDisabled
                />
              </Form.Group>
            </Row>
          )}
        </Card.Body>
      </Card>
      {taskResult !== undefined && (
        <Card className='mt-4'>
          <Card.Header>Form</Card.Header>
          <Card.Body>
            <Row className='mt-2'>
              <Form onSubmit={handleSubmit}>
                <Form.Group className='mb-2'>
                  <Form.Label>Runs to ignore:</Form.Label>
                  <CreatableSelect
                    isMulti
                    value={runsToIgnore.map((dataset) => ({
                      value: dataset,
                      label: dataset,
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
                      setGoldenJsonOMSFlags(
                        newValue.map((option) => option.value)
                      )
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
                      setGoldenJsonRRFlags(
                        newValue.map((option) => option.value)
                      )
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
                      setMuonJsonOMSFlags(
                        newValue.map((option) => option.value)
                      )
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
                      setLumilossDCSFlags(
                        newValue.map((option) => option.value)
                      )
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
                    onChange={(e) =>
                      setAccLumiBeamEnergy(parseInt(e.target.value))
                    }
                  />
                </Form.Group>
                <Form.Group className='mb-2'>
                  <Form.Label>
                    Additional Label on Acc. Luminosity plot:
                  </Form.Label>
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
      )}
    </>
  )
}

export default CertifyCallForm
