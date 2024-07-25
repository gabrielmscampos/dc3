import React from 'react'

import { Link } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button'
import Swal from 'sweetalert2'

import API from '../../services/api'

const CallInfo = ({ call, isLoading }) => {
  const handleCloseCallButton = async ({ callId }) => {
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

  const handleDiscoverRunsButton = async ({ callId }) => {
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

  const handleGenerateLumilossButton = async ({ callId }) => {
    Swal.fire({
      title: 'Enter details',
      html: '<input id="swal-input1" class="swal2-input" placeholder="Preview, Final, Test, ...">',
      focusConfirm: false,
      preConfirm: () => document.getElementById('swal-input1').value,
      showCancelButton: true,
      confirmButtonText: 'Yes, run it',
      cancelButtonText: 'Cancel',
    }).then((dialog) => {
      if (dialog.isConfirmed) {
        API.calls.schedule
          .generateLumilossPlots({ callId, mode: dialog.value })
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
      }
    })
  }

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
            <Button
              className='me-3'
              variant='danger'
              type='submit'
              disabled={call.disabled}
              onClick={() => handleCloseCallButton({ callId: call.call_id })}
            >
              Close call
            </Button>
            <Button
              className='me-3'
              variant='primary'
              type='submit'
              disabled={call.disabled}
              onClick={() => handleDiscoverRunsButton({ callId: call.call_id })}
            >
              Discover runs
            </Button>
            <Button
              className='me-3'
              variant='primary'
              type='submit'
              disabled={call.disabled}
              onClick={() =>
                handleGenerateLumilossButton({ callId: call.call_id })
              }
            >
              Generate lumiloss plots
            </Button>
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
