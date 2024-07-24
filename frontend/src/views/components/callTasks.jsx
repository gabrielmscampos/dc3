import React, { useState } from 'react'

import Card from 'react-bootstrap/Card'
import Modal from 'react-bootstrap/Modal'
import paginationFactory from 'react-bootstrap-table2-paginator'

import Table from '../../components/table'

const CallTasks = ({
  data,
  totalSize,
  currentPage,
  isLoading,
  onTableChange,
}) => {
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
      },
    },
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
        <Modal.Header closeButton>
          <Modal.Title>Traceback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <pre>{traceback}</pre>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default CallTasks
