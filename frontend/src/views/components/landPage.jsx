import React from 'react'

import Image from 'react-bootstrap/Image'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'

import logo from '../../assets/img/logo.png'

const LandPage = () => {
  return (
    <Row className='mt-5 mb-3 align-items-center'>
      <Col md={4} className='text-center'>
        <Image src={logo} alt='' />
      </Col>
      <Col md={8}>
        <Card>
          <Card.Body>
            <h3>DC3: Data Certification Call Center</h3>
            <br />
            {`
              Manage and automate CMS DC calls from DC3!
            `}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default LandPage
