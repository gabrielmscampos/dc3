import React, { useState, useEffect } from 'react'

import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Accordion from 'react-bootstrap/Accordion'
import Spinner from 'react-bootstrap/Spinner'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Select from 'react-select'

import API from '../services/api'
import Table from './components/table'
import useFetchCall from './hooks/useFetchCall'
import { generateRRUrl } from '../utils/runregistry'

const Runs = () => {
  const { callId } = useParams()
  const { data: call, isLoading: isCallLoading } = useFetchCall(callId)
  const [isTasksLoading, setIsTasksLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState()
  const [data, setData] = useState()

  const rrOmsBrilMismatchesColumns = [
    { dataField: 'run_number', text: 'Run', type: 'number' },
    { dataField: 'online_rr', text: 'Online RR', type: 'number' },
    { dataField: 'offline_rr', text: 'Offline RR', type: 'number' },
    { dataField: 'oms', text: 'OMS', type: 'number' },
    {
      dataField: 'oms_last_cms_active_ls',
      text: 'OMS last CMS active LS',
      type: 'number',
    },
    { dataField: 'bril', text: 'Bril', type: 'number' },
  ]
  const lowLumiRunsColumns = [
    { dataField: 'run_number', text: 'Run', type: 'number' },
    { dataField: 'delivered', text: 'Delivered', type: 'number' },
    { dataField: 'recorded', text: 'Recorded', type: 'number' },
    { dataField: 'unit', text: 'unit', type: 'number' },
    { dataField: 'ls_count', text: 'LS count', type: 'number' },
  ]

  const fetchTasks = ({ callId }) => {
    setIsTasksLoading(true)
    API.utils
      .genericFetchAllPages({
        apiMethod: API.callHistory.list,
        params: {
          callId,
          name: 'discover_runs_task',
          status: 'SUCCESS',
        },
      })
      .then((response) => {
        const results = response.results
          .sort((a, b) => new Date(b.modified_at) - new Date(a.modified_at))
          .map((item) => {
            return {
              value: item.id,
              label: `${item.id} - ${item.modified_at}`,
              results_dir: item.results_dir,
            }
          })
        setTasks(results)
      })
      .catch((error) => {
        console.error(error)
        toast.error('Failure to communicate with the API!')
      })
      .finally(() => {
        setIsTasksLoading(false)
      })
  }

  const fetchData = ({ filePath }) => {
    API.files
      .getContent({ path: filePath })
      .then((response) => {
        response.data.text().then((text) => {
          setData(JSON.parse(text))
        })
      })
      .catch((error) => {
        console.error(error)
        toast.error('Failure to communicate with the API!')
      })
  }

  useEffect(() => {
    fetchTasks({ callId })
  }, [callId])

  if (isTasksLoading || isCallLoading) {
    return <Spinner animation='border' role='status' />
  }

  return (
    <Container>
      <Row>
        <Col xs={11}>
          <Select
            options={tasks}
            onChange={setSelectedTask}
            value={selectedTask}
            placeholder='Select a task'
          />
        </Col>
        <Col xs={1}>
          <Button
            variant='primary'
            type='submit'
            disabled={selectedTask === undefined}
            onClick={() => {
              fetchData({
                filePath: `${selectedTask.results_dir}/results.json`,
              })
            }}
          >
            Inspect
          </Button>
        </Col>
      </Row>
      {data !== undefined && (
        <Row className='mt-3'>
          <Col>
            <Accordion defaultActiveKey='0'>
              <Accordion.Item eventKey='1'>
                <Accordion.Header>Initial Run List</Accordion.Header>
                <Accordion.Body>
                  {data.initial_run_list.length > 0 && (
                    <>
                      <p>{data.initial_run_list.join(' ')}</p>
                      <a
                        href={generateRRUrl({
                          className: call.class_name,
                          datasetName: call.datasetName,
                          runList: data.initial_run_list,
                        })}
                        target='_blank'
                        rel='noreferrer'
                        className='mt-3'
                      >
                        Check in run registry
                      </a>
                    </>
                  )}
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey='2'>
                <Accordion.Header>Online RR x OMS Mismatches</Accordion.Header>
                <Accordion.Body>
                  {data.online_rr_oms_mismatches.length > 0 && (
                    <>
                      <p>
                        {data.online_rr_oms_mismatches
                          .map((item) => item.run_number)
                          .join(' ')}
                      </p>
                      <a
                        href={generateRRUrl({
                          className: call.class_name,
                          datasetName: call.dataset_name,
                          runList: data.online_rr_oms_mismatches.map(
                            (item) => item.run_number
                          ),
                        })}
                        target='_blank'
                        rel='noreferrer'
                        className='mt-3'
                      >
                        Check in run registry
                      </a>
                    </>
                  )}
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey='3'>
                <Accordion.Header>Runs Not in BRIL</Accordion.Header>
                <Accordion.Body>
                  {data.runs_not_in_bril.length > 0 && (
                    <>
                      <p>{data.runs_not_in_bril.join(' ')}</p>
                      <a
                        href={generateRRUrl({
                          className: call.class_name,
                          datasetName: call.dataset_name,
                          runList: data.runs_not_in_bril,
                        })}
                        target='_blank'
                        rel='noreferrer'
                        className='mt-3'
                      >
                        Check in run registry
                      </a>
                    </>
                  )}
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey='4'>
                <Accordion.Header>
                  RR x OMS x BRIL Mismatches (Inequality check)
                </Accordion.Header>
                <Accordion.Body>
                  {data.rr_oms_bril_mismatches_forced_inequality.length > 0 && (
                    <>
                      <Table
                        keyField='run_number'
                        data={data.rr_oms_bril_mismatches_forced_inequality}
                        columns={rrOmsBrilMismatchesColumns}
                        bordered={false}
                        hover={true}
                      />
                      <p>
                        {data.rr_oms_bril_mismatches_forced_inequality
                          .map((item) => item.run_number)
                          .join(' ')}
                      </p>
                      <a
                        href={generateRRUrl({
                          className: call.class_name,
                          datasetName: call.dataset_name,
                          runList:
                            data.rr_oms_bril_mismatches_forced_inequality.map(
                              (item) => item.run_number
                            ),
                        })}
                        target='_blank'
                        rel='noreferrer'
                        className='mt-3'
                      >
                        Check in run registry
                      </a>
                    </>
                  )}
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey='5'>
                <Accordion.Header>
                  RR x OMS x BRIL Mismatches (Loose check)
                </Accordion.Header>
                <Accordion.Body>
                  {data.rr_oms_bril_mismatches_loose.length > 0 && (
                    <>
                      <Table
                        keyField='run_number'
                        data={data.rr_oms_bril_mismatches_loose}
                        columns={rrOmsBrilMismatchesColumns}
                        bordered={false}
                        hover={true}
                      />
                      <p>
                        {data.rr_oms_bril_mismatches_loose
                          .map((item) => item.run_number)
                          .join(' ')}
                      </p>
                      <a
                        href={generateRRUrl({
                          className: call.class_name,
                          datasetName: call.dataset_name,
                          runList: data.rr_oms_bril_mismatches_loose.map(
                            (item) => item.run_number
                          ),
                        })}
                        target='_blank'
                        rel='noreferrer'
                        className='mt-3'
                      >
                        Check in run registry
                      </a>
                    </>
                  )}
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey='6'>
                <Accordion.Header>Low luminosity runs</Accordion.Header>
                <Accordion.Body>
                  {data.low_lumi_runs.length > 0 && (
                    <>
                      <Table
                        keyField='run_number'
                        data={data.low_lumi_runs}
                        columns={lowLumiRunsColumns}
                        bordered={false}
                        hover={true}
                      />
                      <p>
                        {data.low_lumi_runs
                          .map((item) => item.run_number)
                          .join(' ')}
                      </p>
                      <a
                        href={generateRRUrl({
                          className: call.class_name,
                          datasetName: call.dataset_name,
                          runList: data.low_lumi_runs.map(
                            (item) => item.run_number
                          ),
                        })}
                        target='_blank'
                        rel='noreferrer'
                        className='mt-3'
                      >
                        Check in run registry
                      </a>
                    </>
                  )}
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey='7'>
                <Accordion.Header>Not in DCS Runs</Accordion.Header>
                <Accordion.Body>
                  {data.not_in_dcs_runs.run_numbers.length > 0 && (
                    <>
                      <p>Filename: {data.not_in_dcs_runs.filename}</p>
                      <p>{data.not_in_dcs_runs.run_numbers.join(' ')}</p>
                      <a
                        href={generateRRUrl({
                          className: call.class_name,
                          datasetName: call.dataset_name,
                          runList: data.not_in_dcs_runs.run_numbers,
                        })}
                        target='_blank'
                        rel='noreferrer'
                        className='mt-3'
                      >
                        Check in run registry
                      </a>
                    </>
                  )}
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey='8'>
                <Accordion.Header>Not in DQMGui Datasets</Accordion.Header>
                <Accordion.Body>
                  {Object.keys(data.not_in_dqmgui_datasets).map((dataset) => {
                    const runs = data.not_in_dqmgui_datasets[dataset]
                    const runsString = runs.join(' ')
                    if (runs.length > 0) {
                      return (
                        <Card key={dataset} className='mb-2'>
                          <Card.Header>{dataset}</Card.Header>
                          <Card.Body>
                            <p>{runsString}</p>
                            <a
                              href={generateRRUrl({
                                className: call.class_name,
                                datasetName: call.dataset_name,
                                runList: runs,
                              })}
                              target='_blank'
                              rel='noreferrer'
                              className='mt-3'
                            >
                              Check in run registry
                            </a>
                          </Card.Body>
                        </Card>
                      )
                    }
                    return <></>
                  })}
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey='0'>
                <Accordion.Header>Final Run List</Accordion.Header>
                <Accordion.Body>
                  {data.final_run_list.length > 0 && (
                    <>
                      <p>{data.final_run_list.join(' ')}</p>
                      <a
                        href={generateRRUrl({
                          className: call.class_name,
                          datasetName: call.dataset_name,
                          runList: data.final_run_list,
                        })}
                        target='_blank'
                        rel='noreferrer'
                        className='mt-3'
                      >
                        Check in run registry
                      </a>
                    </>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
        </Row>
      )}
    </Container>
  )
}

export default Runs
