import React, { useState } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import Card from 'react-bootstrap/Card'
import Select from 'react-select'

import RunJsonProductionForm from './components/forms/runJsonProduction'
import RunLumilossForm from './components/forms/runLumiloss'
import RunAccLumiForm from './components/forms/runAccLumi'
import RunFullLumiAnalysis from './components/forms/runFullLumiAnalysis'
import RunFullCerticationForm from './components/forms/runFullCertification'

const Runner = () => {
  const [selectedOption, setSelectedOption] = useState()

  const actions = [
    {
      value: 'run-json-production',
      label: 'JSON production',
    },
    {
      value: 'run-lumiloss',
      label: 'Lumiloss',
    },
    {
      value: 'run-acc-lumi',
      label: 'Accumulated Luminosity',
    },
    {
      value: 'run-full-lumi-analysis',
      label: 'Full Luminosity Analysis (JSON + Lumiloss + Acc. Lumi)',
    },
    {
      value: 'run-full-certification',
      label:
        'Full Certification (JSON + Lumiloss + Acc. Lumi per Era + Full range)',
    },
  ]

  const renderActionForm = () => {
    switch (selectedOption?.value) {
      case 'run-json-production':
        return <RunJsonProductionForm />
      case 'run-lumiloss':
        return <RunLumilossForm />
      case 'run-acc-lumi':
        return <RunAccLumiForm />
      case 'run-full-lumi-analysis':
        return <RunFullLumiAnalysis />
      case 'run-full-certification':
        return <RunFullCerticationForm />
      default:
        return <></>
    }
  }

  return (
    <Container>
      <Row className='mt-3'>
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
          <Alert variant='warning'>
            <Alert.Heading>Note</Alert.Heading>
            <hr />
            <p>
              Select an action through the dropdown selector and fill the
              required fields as needed.
            </p>
          </Alert>
        </Col>
      </Row>
    </Container>
  )
}

export default Runner
