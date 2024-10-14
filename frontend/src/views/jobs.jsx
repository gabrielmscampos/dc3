import React, { useState, useEffect } from 'react'

import { Link, useNavigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { toast } from 'react-toastify'

import Table from './components/table'
import API from '../services/api'
import dateFormat from '../utils/date'

const Jobs = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState([])
  const [totalSize, setTotalSize] = useState()
  const [currentPage, setCurrentPage] = useState(1)

  const columns = [
    {
      dataField: 'name',
      text: 'Name',
      type: 'string',
      formatter: (_, row) => {
        const linkTo = `/job/${row.id}`
        return <Link to={linkTo}>{row.name}</Link>
      },
    },
    { dataField: 'created_by', text: 'Created by', type: 'string' },
    { dataField: 'created_at', text: 'Created at', type: 'string' },
    { dataField: 'modified_at', text: 'Modified at', type: 'string' },
    { dataField: 'status', text: 'Status', type: 'string' },
  ]

  const fetchData = ({ page }) => {
    setIsLoading(true)
    API.jobs
      .list({ page })
      .then((response) => {
        const results = response.results.map((item) => {
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

  const handleJobRunner = () => {
    navigate('/job-runner')
  }

  useEffect(() => {
    fetchData({ page: 1 })
  }, [])

  return (
    <Container>
      <Row className='mt-5 mb-3 m-4'>
        <Col sm={12}>
          <Button
            className='mb-3'
            variant='primary'
            type='submit'
            onClick={handleJobRunner}
          >
            Run job
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

export default Jobs
