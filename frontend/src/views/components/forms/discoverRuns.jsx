import React, { useState } from 'react'

import { useNavigate } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import CreatableSelect from 'react-select/creatable'
import Swal from 'sweetalert2'

import defaults from '../../../config/defaults'
import API from '../../../services/api'

const DiscoverRunsForm = ({ callId }) => {
  const navigate = useNavigate()
  const [brilwsVersion, setBrilBrilwsVersion] = useState(defaults.brilwsVersion)
  const [brilUnit, setBrilUnit] = useState(defaults.brilUnit)
  const [brilLowLumiThr, setBrilLowLumiThr] = useState(defaults.brilLowLumiThr)
  const [brilBeamstatus, setBrilBeamstatus] = useState(defaults.brilBeamstatus)
  const [brilAmodetag, setBrilAmodetag] = useState(defaults.brilAmodetag)
  const [brilNormtag, setBrilNormtag] = useState(defaults.brilNormtag)
  const [guiLookupDatasets, setGuiLookupDatasets] = useState(
    defaults.guiLookupDatasets
  )
  const [refreshRunsIfNeeded, setRefreshRunsIfNeeded] = useState(
    defaults.refreshRunsIfNeeded
  )

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
      .discoverRuns({
        callId,
        brilwsVersion,
        brilUnit,
        brilLowLumiThr,
        brilBeamstatus,
        brilAmodetag,
        brilNormtag,
        guiLookupDatasets,
        refreshRunsIfNeeded,
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

  return (
    <Card className='mt-4'>
      <Card.Header>Form</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className='mb-2'>
            <Form.Label>Brilws package version:</Form.Label>
            <Form.Control
              type='text'
              value={brilwsVersion}
              onChange={(e) => setBrilBrilwsVersion(e.target.value)}
            />
          </Form.Group>
          <Form.Group className='mb-2'>
            <Form.Label>Unit:</Form.Label>
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
            <Form.Label>Beam Status:</Form.Label>
            <Form.Control
              type='text'
              value={brilBeamstatus}
              onChange={(e) =>
                setBrilBeamstatus(e.target.value === '' ? null : e.target.value)
              }
            />
          </Form.Group>
          <Form.Group className='mb-2'>
            <Form.Label>Amodetag:</Form.Label>
            <Form.Control
              type='text'
              value={brilAmodetag}
              onChange={(e) =>
                setBrilAmodetag(e.target.value === '' ? null : e.target.value)
              }
            />
          </Form.Group>
          <Form.Group className='mb-2'>
            <Form.Label>Normtag:</Form.Label>
            <Form.Control
              type='text'
              value={brilNormtag}
              onChange={(e) =>
                setBrilNormtag(e.target.value === '' ? null : e.target.value)
              }
            />
          </Form.Group>
          <Form.Group className='mb-2'>
            <Form.Label>GUI Lookup Datasets:</Form.Label>
            <CreatableSelect
              isMulti
              value={guiLookupDatasets.map((dataset) => ({
                value: dataset,
                label: dataset,
              }))}
              onChange={(newValue) =>
                setGuiLookupDatasets(newValue.map((option) => option.value))
              }
              placeholder='Enter or select datasets'
            />
          </Form.Group>
          <Form.Group className='mb-2'>
            <Form.Check
              type='checkbox'
              label='Refresh Runs If Needed'
              checked={refreshRunsIfNeeded}
              onChange={(e) => setRefreshRunsIfNeeded(e.target.checked)}
            />
          </Form.Group>
          <hr />
          <Button variant='primary' type='submit' onClick={handleSubmit}>
            Submit
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default DiscoverRunsForm
