import React from 'react'

import { Link } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button'

const CallInfo = ({ call, isLoading }) => {
  return (
    <>
      {isLoading ? (
        <Spinner animation='border' role='status' />
      ) : (
        <Card className='text-center'>
          <Card.Header>Call</Card.Header>
          <Card.Body>
            <dl className='row'>
              <dt className='col-sm-4'>Call ID:</dt>
              <dd className='col-sm-8'>{call.call_id}</dd>
              <dt className='col-sm-4'>Call Name:</dt>
              <dd className='col-sm-8'>{call.call_name}</dd>
              <dt className='col-sm-4'>Dataset Name:</dt>
              <dd className='col-sm-8'>{call.dataset_name}</dd>
              <dt className='col-sm-4'>Class Name:</dt>
              <dd className='col-sm-8'>{call.class_name}</dd>
              <dt className='col-sm-4'>Status:</dt>
              <dd className='col-sm-8'>{call.status}</dd>
              <dt className='col-sm-4'>Created By:</dt>
              <dd className='col-sm-8'>{call.created_by}</dd>
              <dt className='col-sm-4'>Modified By:</dt>
              <dd className='col-sm-8'>{call.modified_by}</dd>
              <dt className='col-sm-4'>Created At:</dt>
              <dd className='col-sm-8'>{call.created_at}</dd>
              <dt className='col-sm-4'>Modified At:</dt>
              <dd className='col-sm-8'>{call.modified_at}</dd>
            </dl>
            <hr />
            <Link to={`/call/${call.call_id}/files`}>
              <Button variant='primary' type='submit'>
                Filebrowser
              </Button>
            </Link>
          </Card.Body>
        </Card>
      )}
    </>
  )
}

export default CallInfo
