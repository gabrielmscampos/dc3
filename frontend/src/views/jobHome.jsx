import React from 'react'

import { useParams } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Spinner from 'react-bootstrap/Spinner'

import useFetchJob from './hooks/useFetchJob'

const Home = () => {
  const { jobId } = useParams()
  const { data, isLoading } = useFetchJob(jobId)

  if (isLoading) {
    return <Spinner animation='border' role='status' />
  }

  return (
    <Container>
      <Card className='text-center'>
        <Card.Header>Job</Card.Header>
        <Card.Body>
          <dl className='row'>
            <dt className='col-sm-4'>Job ID:</dt>
            <dd className='col-sm-8'>{data.id}</dd>
            <dt className='col-sm-4'>Job Name:</dt>
            <dd className='col-sm-8'>{data.name}</dd>
            <dt className='col-sm-4'>Status:</dt>
            <dd className='col-sm-8'>{data.status}</dd>
            <dt className='col-sm-4'>Created By:</dt>
            <dd className='col-sm-8'>{data.created_by}</dd>
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
