import React, { useState } from 'react'

import { useParams } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import Card from 'react-bootstrap/Card'
import Select from 'react-select'
import Spinner from 'react-bootstrap/Spinner'

import CloseCallForm from './components/forms/closeCall'
import DiscoverRunsForm from './components/forms/discoverRuns'
import RunCallFullCertificationForm from './components/forms/runCallFullCertification'
import useFetchCall from './hooks/useFetchCall'

const Actions = () => {
  const { callId } = useParams()
  const { data, isLoading } = useFetchCall(callId)
  const [selectedOption, setSelectedOption] = useState()

  const actions = [
    { value: 'close-call', label: 'Close call', isDisabled: data?.disabled },
    {
      value: 'discover-runs',
      label: 'Discover runs',
      isDisabled: data?.disabled,
    },
    {
      value: 'run-full-certification',
      label: 'Run full certification',
      isDisabled: data?.disabled,
    },
  ]

  const renderActionForm = () => {
    switch (selectedOption?.value) {
      case 'close-call':
        return <CloseCallForm callId={callId} />
      case 'discover-runs':
        return <DiscoverRunsForm callId={callId} />
      case 'run-full-certification':
        return <RunCallFullCertificationForm callId={callId} />
      default:
        return <></>
    }
  }

  if (isLoading) {
    return <Spinner animation='border' role='status' />
  }

  return (
    <Container>
      <Row>
        <Col xs={8}>
          <Card>
            <Card.Header>Actions</Card.Header>
            <Card.Body>
              <Select
                options={actions}
                onChange={setSelectedOption}
                value={selectedOption}
              />
            </Card.Body>
          </Card>
          {selectedOption && <>{renderActionForm()}</>}
        </Col>
        <Col xs={4}>
          {!data?.disabled ? (
            <Alert variant='warning'>
              <Alert.Heading>Note</Alert.Heading>
              <hr />
              <p>
                Select an action through the dropdown selector and fill the
                required fields as needed.
              </p>
              <p>
                Check out the logs tab before issuing an Action to make sure no
                duplicated actions are in the processing queue.
              </p>
            </Alert>
          ) : (
            <Alert variant='danger'>
              <Alert.Heading>Note</Alert.Heading>
              <hr />
              <p>This call is CLOSED, actions should be disabled!</p>
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default Actions
