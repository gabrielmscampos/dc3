import React, { useState } from 'react'

import { useNavigate } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Swal from 'sweetalert2'

import API from '../../../services/api'

const CloseCallForm = ({ callId }) => {
  const navigate = useNavigate()

  const [inputValue, setInputValue] = useState('')
  const [isDisabled, setIsDisabled] = useState(true)

  const handleChange = (e) => {
    const value = e.target.value.toLowerCase()
    setInputValue(value)
    setIsDisabled(value !== 'yes')
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

    API.calls
      .close({ callId })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Your request was completed successfully.',
        }).then(() => {
          navigate(`/call/${callId}`)
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
            <Form.Label>
              This action cannot be undone! Type yes to submit:
            </Form.Label>
            <Form.Control
              type='text'
              value={inputValue}
              onChange={handleChange}
            />
          </Form.Group>
          <Button variant='primary' type='submit' disabled={isDisabled}>
            Submit
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default CloseCallForm
