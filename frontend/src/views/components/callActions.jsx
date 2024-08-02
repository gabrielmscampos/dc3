import React, { useState, useEffect } from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Swal from 'sweetalert2'
import CreatableSelect from 'react-select/creatable'

import API from '../../services/api'

const CallActions = ({ callId, disabled, isLoading }) => {
  const [isIncludedRunsAvailable, setIsIncludedRunsAvailable] = useState(false)
  const [allRuns, setAllRuns] = useState([])
  const [jobTag, setJobTag] = useState()
  const [selectedRuns, setSelectedRuns] = useState([])
  const [showLumilossForm, setShowLumilossForm] = useState(false)

  const fetchCallRuns = async ({ callId, runsFile }) => {
    return API.files
      .getContent({ path: `${callId}/runs/${runsFile}` })
      .then((response) => {
        return response.data.text().then(JSON.parse)
      })
  }

  useEffect(() => {
    if (disabled === undefined || disabled) {
      return
    }

    fetchCallRuns({ callId, runsFile: 'base_included_runs.json' }).then(
      (response) => {
        const opts = response.map((item) => ({ value: item, label: item }))
        setAllRuns((prevArray) => [...prevArray, ...opts])
        setIsIncludedRunsAvailable(true)
      }
    )

    fetchCallRuns({ callId, runsFile: 'runs_not_in_dcs.json' }).then(
      (response) => {
        const opts = response.runs.map((item) => ({
          value: item,
          label: `${item} (DCS excluded)`,
        }))
        setAllRuns((prevArray) => [...prevArray, ...opts])
      }
    )
  }, [callId, disabled])

  const handleCloseCallButton = ({ callId }) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, close it!',
    }).then((confirmDialog) => {
      if (confirmDialog.isConfirmed) {
        API.calls
          .close({ callId })
          .then((_) => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'The call has been closed!',
              willClose: () => {
                window.location.reload()
              },
            })
          })
          .catch((err) => {
            console.error(err)
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'There was an issue closing the call!',
              willClose: () => {
                window.location.reload()
              },
            })
          })
      }
    })
  }

  const handleDiscoverRunsButton = ({ callId }) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, run it!',
    }).then((confirmDialog) => {
      if (confirmDialog.isConfirmed) {
        API.calls.schedule
          .discoverRuns({ callId })
          .then((_) => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'The discover runs job has been scheduled!',
              willClose: () => {
                window.location.reload()
              },
            })
          })
          .catch((err) => {
            console.error(err)
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'There was an issue scheduling the dicover runs job!',
              willClose: () => {
                window.location.reload()
              },
            })
          })
      }
    })
  }

  const handleGenerateLumilossButton = ({ callId }) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, run it!',
    }).then((dialog) => {
      if (dialog.isConfirmed) {
        API.calls.schedule
          .generateLumilossPlots({
            callId,
            mode: jobTag,
            runs: selectedRuns.map((item) => item.value),
          })
          .then((_) => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'The generated lumiloss plots has been scheduled!',
              willClose: () => {
                window.location.reload()
              },
            })
          })
          .catch((err) => {
            console.error(err)
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'There was an issue scheduling the lumiloss job!',
              willClose: () => {
                window.location.reload()
              },
            })
          })
          .finally(() => {
            setShowLumilossForm(!showLumilossForm)
          })
      }
    })
  }

  return (
    <>
      {isLoading ? (
        <Spinner animation='border' role='status' />
      ) : (
        <Card className='text-center'>
          <Card.Header>Actions</Card.Header>
          <Card.Body>
            <Row>
              <Col md={12}>
                <Button
                  variant='danger'
                  type='submit'
                  disabled={disabled}
                  onClick={() => handleCloseCallButton({ callId })}
                >
                  Close call
                </Button>
              </Col>
            </Row>
            <hr />
            <Row>
              <Col md={12}>
                <Button
                  variant='primary'
                  type='submit'
                  disabled={disabled}
                  onClick={() => handleDiscoverRunsButton({ callId })}
                >
                  Discover runs
                </Button>
              </Col>
            </Row>
            <hr />
            <Row>
              <Col md={12}>
                <Button
                  variant='primary'
                  type='submit'
                  disabled={disabled || !isIncludedRunsAvailable}
                  onClick={() => setShowLumilossForm(!showLumilossForm)}
                >
                  Generate lumiloss plots
                </Button>
              </Col>
              {showLumilossForm && (
                <div>
                  <Form.Control
                    className='mt-3'
                    type='text'
                    placeholder='Job tag'
                    value={jobTag}
                    onChange={(e) => setJobTag(e.target.value)}
                  />
                  <CreatableSelect
                    className='mt-3'
                    isMulti
                    value={selectedRuns}
                    options={allRuns}
                    onChange={(selectedOptions) => {
                      setSelectedRuns(selectedOptions)
                    }}
                    placeholder='Select runs'
                  />
                  <Button
                    className='mt-3'
                    variant='primary'
                    type='submit'
                    onClick={() => handleGenerateLumilossButton({ callId })}
                  >
                    Submit
                  </Button>
                </div>
              )}
            </Row>
            <hr />
          </Card.Body>
        </Card>
      )}
    </>
  )
}

export default CallActions
