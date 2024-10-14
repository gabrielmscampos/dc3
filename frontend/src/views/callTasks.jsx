import React, { useState, useEffect } from 'react'

import { useParams } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import Card from 'react-bootstrap/Card'
import Spinner from 'react-bootstrap/Spinner'
import Modal from 'react-bootstrap/Modal'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { toast } from 'react-toastify'

import Table from './components/table'
import API from '../services/api'
import dateFormat from '../utils/date'

const Tasks = () => {
  const { callId } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState([])
  const [totalSize, setTotalSize] = useState()
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [traceback, setTraceback] = useState('')
  const [showParamsModal, setShowParamsModal] = useState(false)
  const [params, setParams] = useState('')

  const columns = [
    { dataField: 'id', text: 'Id', type: 'string' },
    { dataField: 'name', text: 'Name', type: 'string' },
    {
      dataField: 'params',
      text: 'Params',
      formatter: (_, row) => (
        <a
          href='#'
          onClick={() => {
            setParams(row.params)
            setShowParamsModal(true)
          }}
        >
          Inspect
        </a>
      ),
    },
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
      },
    },
  ]

  const fetchData = ({ callId, page }) => {
    setIsLoading(true)
    API.callHistory
      .list({ page, callId })
      .then((response) => {
        const results = response.results
          .sort((a, b) => new Date(b.modified_at) - new Date(a.modified_at))
          .map((item) => {
            return {
              ...item,
              created_at: dateFormat(item.created_at, 'dd.MM.yyyy HH:mm:ss'),
              modified_at: dateFormat(item.modified_at, 'dd.MM.yyyy HH:mm:ss'),
              keyField: item.id,
            }
          })
        setData(results)
        setTotalSize(response.count)
        setCurrentPage(page)
      })
      .catch((error) => {
        console.error(error)
        toast.error('Failure to communicate with the API!')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    fetchData({ callId, page: 1 })
  }, [callId])

  if (isLoading) {
    return <Spinner animation='border' role='status' />
  }

  return (
    <Container>
      <Row>
        <Col xs={8}>
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
                onTableChange={(type, { page }) => {
                  if (type === 'pagination') {
                    fetchData({
                      callId,
                      page,
                    })
                  }
                }}
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
            <Modal.Header closeButton>
              <Modal.Title>Traceback</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <pre>{traceback}</pre>
            </Modal.Body>
          </Modal>
          <Modal
            show={showParamsModal}
            onHide={() => setShowParamsModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Params</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <pre>{JSON.stringify(params, null, 2)}</pre>
            </Modal.Body>
          </Modal>
        </Col>
        <Col xs={4}>
          <Alert variant='warning'>
            <Alert.Heading>Note</Alert.Heading>
            <hr />
            <p>
              This page logs all operations triggered automatically or through
              the actions page inside this call.
            </p>
            <p>
              All operations are registered in a processing queue and results of
              a given action will only be available if its status is SUCCESS.
            </p>
          </Alert>
        </Col>
      </Row>
    </Container>
  )
}

export default Tasks
