import React, { useState, useEffect } from 'react'

import { useParams } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Spinner from 'react-bootstrap/Spinner'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Swal from 'sweetalert2'
import paginationFactory from 'react-bootstrap-table2-paginator'

import Table from '../components/table'
import dateFormat from '../utils/date'
import API from '../services/api'
import { toast } from 'react-toastify'

const CallInfo = ({ call, isLoading }) => {

  const handleCloseCallButton = async ({ callId }) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, close it!'
    }).then((confirmDialog) => {
      if (confirmDialog.isConfirmed) {
        API.calls
          .close({ callId })
          .then((_) => {
            Swal.fire({ icon: 'success', title: 'Success', text: 'The call has been closed!', willClose: () => { window.location.reload() }})
          })
          .catch((err) => {
            console.error(err)
            Swal.fire({ icon: 'error', title: 'Error', text: 'There was an issue closing the call!', willClose: () => { window.location.reload() }})
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
      confirmButtonText: 'Yes, run it!'
    }).then((confirmDialog) => {
      if (confirmDialog.isConfirmed) {
        API.calls
          .schedule
          .discoverRuns({ callId })
          .then((_) => {
            Swal.fire({ icon: 'success', title: 'Success', text: 'The discover runs job has been scheduled!', willClose: () => { window.location.reload() }})
          })
          .catch((err) => {
            console.error(err)
            Swal.fire({ icon: 'error', title: 'Error', text: 'There was an issue scheduling the dicover runs job!', willClose: () => { window.location.reload() }})
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
      cancelButtonText: 'Cancel'
    }).then((dialog) => {
      if (dialog.isConfirmed) {
        API.calls
          .schedule
          .generateLumilossPlots({ callId, mode: dialog.value })
          .then((_) => {
            Swal.fire({ icon: 'success', title: 'Success', text: 'The generated lumiloss plots has been scheduled!', willClose: () => { window.location.reload() }})
          })
          .catch((err) => {
            console.error(err)
            Swal.fire({ icon: 'error', title: 'Error', text: 'There was an issue scheduling the lumiloss job!', willClose: () => { window.location.reload() }})
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
            <hr/>
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
              variant='primary'
              type='submit'
              disabled={call.disabled}
              onClick={() => handleGenerateLumilossButton({ callId: call.call_id })}
            >
              Generate lumiloss plots
            </Button>
          </Card.Body>
        </Card>
      )}
    </>
  )
}

const CallTasks = ({ data, totalSize, currentPage, isLoading, onTableChange }) => {
  const [showModal, setShowModal] = useState(false)
  const [traceback, setTraceback] = useState('')

  const columns = [
    { dataField: 'task_id', text: 'ID', type: 'string' },
    { dataField: 'task_name', text: 'Name', type: 'string' },
    { dataField: 'task_args', text: 'Args', type: 'string' },
    { dataField: 'created_by', text: 'Created by', type: 'string' },
    { dataField: 'created_at', text: 'Created at', type: 'string' },
    { dataField: 'modified_at', text: 'Modified at', type: 'string' },
    {
      dataField: 'status',
      text: 'Status',
      formatter: (_, row) => {
        return row.status === 'FAILURE' ? (
          <a
            href='#'
            onClick={() => {
              setTraceback(row.traceback)
              setShowModal(true)
            }}
          >
            {row.status}
          </a>
        ) : (
          row.status
        )
      }
    }
  ]

  return (
    <>
      <Card className='text-center'>
        <Card.Header>Tasks</Card.Header>
        <Card.Body>
          <Table
            keyField='keyField'
            isLoading={isLoading}
            data={data}
            columns={columns}
            bordered={false}
            hover={true}
            remote
            responsive
            onTableChange={onTableChange}
            pagination={paginationFactory({
              totalSize,
              sizePerPage: 10,
              page: currentPage,
              hideSizePerPage: true,
              showTotal: true,
            })}
            wrapperClasses={'overflow-y: auto; max-height: 300px'}
            headerWrapperClasses={'position: sticky; top: 0'}
          />
        </Card.Body>
      </Card>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>Traceback</Modal.Title></Modal.Header>
        <Modal.Body><pre>{traceback}</pre></Modal.Body>
      </Modal>
    </>
  )
}

const Call = () => {
  const { callId } = useParams()
  const [ isCallLoading, setIsCallLoading ] = useState(true)
  const [ isCallTasksLoading, setIsCallTasksLoading ] = useState(true)

  const [ call, setCall ] = useState()
  const [ callTasks, setCallTasks ] = useState()
  const [ totalTasks, setTotalTasks ] = useState()
  const [ currentTasksPage, setCurrentTasksPage ] = useState(1)

  const fetchCall = ({ callId }) => {
    setIsCallLoading(true)
    API.calls
      .get({
        callId,
      })
      .then((response) => {
        const results = {
            ...response,
            created_at: dateFormat(
              response.created_at,
              'dd.mm.yyyy hh:mm:ss'
            ),
            modified_at: dateFormat(
              response.modified_at,
              'dd.mm.yyyy hh:mm:ss'
            ),
            disabled: response.status === 'CLOSED' ? 'true' : ''
        }
        setCall(results)
      })
      .catch((error) => {
        console.error(error)
        toast.error('Failure to communicate with the API!')
      })
      .finally(() => {
        setIsCallLoading(false)
      })
  }

  const fetchCallTasks = ({ page, callId }) => {
    setIsCallTasksLoading(true)
    API.callsTasks
      .list({
        page,
        callId,
      })
      .then((response) => {
        const results = response.results.map((item) => {
          return {
            ...item,
            created_at: dateFormat(
              item.created_at,
              'dd.mm.yyyy hh:mm:ss'
            ),
            modified_at: dateFormat(
              item.modified_at,
              'dd.mm.yyyy hh:mm:ss'
            ),
            keyField: item.id
          }
        })
        setCallTasks(results)
        setTotalTasks(response.count)
        setCurrentTasksPage(page)
      })
      .catch((error) => {
        console.error(error)
        toast.error('Failure to communicate with the API!')
      })
      .finally(() => {
        setIsCallTasksLoading(false)
      })
  }

  useEffect(() => {
    fetchCall({ callId })
    fetchCallTasks({ page: 1, callId })
  }, [callId])

  return (
    <Container>
      <Row className='mt-5 mb-3 m-3'>
        <Col md={3}/>
        <Col md={6}>
          <CallInfo
            call={call}
            isLoading={isCallLoading}
          />
        </Col>
        <Col md={3}/>
      </Row>
      <Row className='mt-2 mb-3 m-3'>
        <Col md={12}>
          <CallTasks
            data={callTasks}
            totalSize={totalTasks}
            currentPage={currentTasksPage}
            isLoading={isCallTasksLoading}
            onTableChange={(type, { page }) => {
                if (type === 'pagination') {
                  fetchCallTasks({
                    page,
                    callId
                  })
                }
              }
            }
          />
        </Col>
      </Row>
    </Container>
  )
}

export default Call
