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

const RunJsonProductionForm = () => {
  const navigate = useNavigate()

  // Inputs for json production
  const [jobName, setJobName] = useState()
  const [rrClassName, setRRClassName] = useState()
  const [rrDatasetName, setRRDatasetName] = useState()
  const [runList, setRunList] = useState([])
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

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!jobName || !rrClassName || !rrDatasetName || runList.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Please provide values for Run Registry Class, Dataset, and Run List.',
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
      .jsonProduction({
        jobName,
        className: rrClassName,
        datasetName: rrDatasetName,
        runList,
        ignoreHLTEmergency,
        preJsonOMSFlags,
        goldenJsonOMSFlags,
        goldenJsonRRFlags,
        muonJsonOMSFlags,
        muonJsonRRFlags,
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
              <Form.Label>Run list:</Form.Label>
              <CreatableSelect
                isMulti
                value={runList.map((runNumber) => ({
                  value: runNumber,
                  label: runNumber,
                }))}
                onChange={(newValue) =>
                  setRunList(newValue.map((option) => parseInt(option.value)))
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

export default RunJsonProductionForm
