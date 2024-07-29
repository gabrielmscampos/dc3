import React, { useState, useEffect } from 'react'

import { useParams } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import CallInfo from './components/callInfo'
import CallTasks from './components/callTasks'
import CallActions from './components/callActions'
import dateFormat from '../utils/date'
import API from '../services/api'
import { toast } from 'react-toastify'

const Call = () => {
  const { callId } = useParams()
  const [isCallLoading, setIsCallLoading] = useState(true)
  const [isCallTasksLoading, setIsCallTasksLoading] = useState(true)

  const [call, setCall] = useState()
  const [callTasks, setCallTasks] = useState()
  const [totalTasks, setTotalTasks] = useState()
  const [currentTasksPage, setCurrentTasksPage] = useState(1)

  const fetchCall = ({ callId }) => {
    setIsCallLoading(true)
    API.calls
      .get({
        callId,
      })
      .then((response) => {
        const results = {
          ...response,
          created_at: dateFormat(response.created_at, 'dd.mm.yyyy hh:mm:ss'),
          modified_at: dateFormat(response.modified_at, 'dd.mm.yyyy hh:mm:ss'),
          disabled: response.status === 'CLOSED' ? 'true' : '',
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
            created_at: dateFormat(item.created_at, 'dd.mm.yyyy hh:mm:ss'),
            modified_at: dateFormat(item.modified_at, 'dd.mm.yyyy hh:mm:ss'),
            keyField: item.id,
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
        <Col md={1} />
        <Col md={5}>
          <CallInfo call={call} isLoading={isCallLoading} />
        </Col>
        <Col md={5}>
          <CallActions
            callId={call?.call_id}
            disabled={call?.disabled}
            isLoading={isCallLoading}
          />
        </Col>
        <Col md={1} />
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
                  callId,
                })
              }
            }}
          />
        </Col>
      </Row>
    </Container>
  )
}

export default Call
