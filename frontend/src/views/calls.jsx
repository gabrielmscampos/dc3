import React, { useState, useEffect } from 'react'

import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Swal from 'sweetalert2'
import paginationFactory from 'react-bootstrap-table2-paginator'

import Table from '../components/table'
import dateFormat from '../utils/date'
import API from '../services/api'
import { toast } from 'react-toastify'

const Calls = () => {
  const [isLoading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [totalSize, setTotalSize] = useState()
  const [currentPage, setCurrentPage] = useState(1)

  const columns = [
    {
      dataField: 'call_name',
      text: 'Name',
      type: 'string',
      formatter: (_, row) => {
        const linkTo = `/call/${row.call_id}`
        return <Link to={linkTo}>{row.call_name}</Link>
      },
    },
    { dataField: 'created_at', text: 'Created at', type: 'string' },
    { dataField: 'modified_at', text: 'Modified at', type: 'string' },
    { dataField: 'status', text: 'Status', type: 'string' },
  ]

  const fetchData = ({ page }) => {
    setLoading(true)
    API.calls
      .list({
        page,
      })
      .then((response) => {
        const results = response.results.map((item) => {
          return {
            ...item,
            created_at: dateFormat(item.created_at, 'dd.mm.yyyy hh:mm:ss'),
            modified_at: dateFormat(item.modified_at, 'dd.mm.yyyy hh:mm:ss'),
            keyField: item.call_id,
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
        setLoading(false)
      })
  }

  const handleCreateButton = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Enter details',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Call Name">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Dataset Name">' +
        '<input id="swal-input3" class="swal2-input" placeholder="Class Name">',
      focusConfirm: false,
      preConfirm: () => {
        return [
          document.getElementById('swal-input1').value,
          document.getElementById('swal-input2').value,
          document.getElementById('swal-input3').value,
        ]
      },
      showCancelButton: true,
      confirmButtonText: 'Yes, create it',
      cancelButtonText: 'Cancel',
    })

    if (formValues) {
      const [callName, datasetName, className] = formValues
      let result

      try {
        await API.calls.create({ callName, datasetName, className })
        result = await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'The call has been opened!',
        })
      } catch (error) {
        console.log(error)
        result = await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'There was an issue creating the call',
        })
      }

      if (result.isConfirmed) {
        window.location.reload()
      }
    }
  }

  useEffect(() => {
    fetchData({ page: 1 })
  }, [])

  return (
    <Container>
      <Row className='mt-5 mb-3 m-3'>
        <Col sm={12}>
          <Button
            className='mb-3'
            variant='primary'
            type='submit'
            onClick={handleCreateButton}
          >
            Create call
          </Button>
          <Card className='text-center'>
            <Card.Body>
              <Table
                keyField='keyField'
                isLoading={isLoading}
                data={data}
                columns={columns}
                bordered={false}
                hover={true}
                remote
                onTableChange={(type, { page }) => {
                  if (type === 'pagination') {
                    fetchData({
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
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Calls
