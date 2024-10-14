import React, { useState, useEffect } from 'react'

import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button'
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import Select from 'react-select'

import RenderFile from './components/renderFile'
import API from '../services/api'

const CallFiles = () => {
  const { callId } = useParams()

  const [isTasksLoading, setIsTasksLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState()
  const [basePath, setBasePath] = useState()

  const [isDirLoading, setIsDirLoading] = useState(false)
  const [currentPath, setCurrentPath] = useState([])
  const [currentDirContent, setCurrentDirContent] = useState([])

  const fetchTasks = ({ callId }) => {
    setIsTasksLoading(true)
    API.utils
      .genericFetchAllPages({
        apiMethod: API.callHistory.list,
        params: {
          callId,
          name: 'run_full_certification_task',
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

  const listDirectory = ({ dirPath }) => {
    setIsDirLoading(true)
    API.files
      .list({ dir: dirPath })
      .then((response) => {
        const sortedFiles = response.sort((a, b) => {
          if (a.is_directory && !b.is_directory) return -1
          if (!a.is_directory && b.is_directory) return 1
          return a.name.localeCompare(b.name)
        })
        setCurrentDirContent(sortedFiles)
      })
      .catch((err) => {
        console.error(err)
        toast.error('Failure to communicate with the API!')
      })
      .finally(() => {
        setIsDirLoading(false)
      })
  }

  const navigateTo = (dir) => {
    const newPath = [...currentPath, dir]
    setCurrentPath(newPath)
    listDirectory({ dirPath: basePath + '/' + newPath.join('/') })
  }

  const navigateToPath = (index) => {
    if (index === -1) {
      setCurrentPath([])
      listDirectory({ dirPath: basePath })
    } else {
      const newPath = currentPath.slice(0, index + 1)
      setCurrentPath(newPath)
      listDirectory({ dirPath: basePath + '/' + newPath.join('/') })
    }
  }

  useEffect(() => {
    fetchTasks({ callId })
  }, [callId])

  if (isTasksLoading) {
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
              setBasePath(selectedTask.results_dir)
              listDirectory({ dirPath: selectedTask.results_dir })
            }}
          >
            Inspect
          </Button>
        </Col>
      </Row>
      <Row className='mt-3'>
        {basePath && (
          <>
            {isDirLoading ? (
              <Spinner animation='border' role='status' />
            ) : (
              <div>
                <Breadcrumb>
                  <Breadcrumb.Item
                    disabled={currentPath.length === 0}
                    active={currentPath.length === 0}
                    onClick={() =>
                      currentPath.length !== 0 ? navigateToPath(-1) : null
                    }
                  >
                    Root
                  </Breadcrumb.Item>
                  {currentPath.map((dir, index) => (
                    <Breadcrumb.Item
                      disabled={index === currentPath.length - 1}
                      active={index === currentPath.length - 1}
                      key={index}
                      onClick={() =>
                        index !== currentPath.length - 1
                          ? navigateToPath(index)
                          : null
                      }
                    >
                      {dir}
                    </Breadcrumb.Item>
                  ))}
                </Breadcrumb>
                {currentDirContent.map(
                  (obj, index) =>
                    index % 4 === 0 && (
                      <Row key={index} className='mb-3'>
                        {currentDirContent
                          .slice(index, index + 4)
                          .map((node, innerIndex) => {
                            return (
                              <Col key={innerIndex} sm={3}>
                                <RenderFile
                                  basePath={basePath}
                                  currentPath={currentPath}
                                  file={node}
                                  navigateTo={navigateTo}
                                />
                              </Col>
                            )
                          })}
                      </Row>
                    )
                )}
              </div>
            )}
          </>
        )}
      </Row>
    </Container>
  )
}

export default CallFiles
