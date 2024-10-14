import React from 'react'

import { useParams } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Spinner from 'react-bootstrap/Spinner'

import useFetchCall from './hooks/useFetchCall'

const Home = () => {
  const { callId } = useParams()
  const { data, isLoading } = useFetchCall(callId)

  if (isLoading) {
    return <Spinner animation='border' role='status' />
  }

  return (
    <Container>
      <Card className='text-center'>
        <Card.Header>Call</Card.Header>
        <Card.Body>
          <dl className='row'>
            <dt className='col-sm-4'>Call ID:</dt>
            <dd className='col-sm-8'>{data.call_id}</dd>
            <dt className='col-sm-4'>Call Name:</dt>
            <dd className='col-sm-8'>{data.call_name}</dd>
            <dt className='col-sm-4'>Dataset Name:</dt>
            <dd className='col-sm-8'>{data.dataset_name}</dd>
            <dt className='col-sm-4'>Class Name:</dt>
            <dd className='col-sm-8'>{data.class_name}</dd>
            <dt className='col-sm-4'>Status:</dt>
            <dd className='col-sm-8'>{data.status}</dd>
            <dt className='col-sm-4'>Created At:</dt>
            <dd className='col-sm-8'>{data.created_at}</dd>
            <dt className='col-sm-4'>Modified At:</dt>
            <dd className='col-sm-8'>{data.modified_at}</dd>
          </dl>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Home
