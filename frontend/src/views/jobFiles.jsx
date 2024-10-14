import React, { useState, useEffect } from 'react'

import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Spinner from 'react-bootstrap/Spinner'
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import Alert from 'react-bootstrap/Alert'

import RenderFile from './components/renderFile'
import API from '../services/api'

const Files = () => {
  const { jobId } = useParams()

  const [isJobLoading, setIsJobLoading] = useState(true)
  const [jobStatus, setJobStatus] = useState()
  const [basePath, setBasePath] = useState()

  const [isDirLoading, setIsDirLoading] = useState(false)
  const [currentPath, setCurrentPath] = useState([])
  const [currentDirContent, setCurrentDirContent] = useState([])

  const fetchJob = ({ id }) => {
    setIsJobLoading(true)
    API.jobs
      .get({
        id,
      })
      .then((response) => {
        setJobStatus(response.status)
        setBasePath(response.results_dir)
      })
      .catch((error) => {
        console.error(error)
        toast.error('Failure to communicate with the API!')
      })
      .finally(() => {
        setIsJobLoading(false)
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
    fetchJob({ id: jobId })
  }, [jobId])

  useEffect(() => {
    if (jobStatus === 'SUCCESS' && basePath !== undefined) {
      listDirectory({ dirPath: basePath })
    }
  }, [jobStatus, basePath])

  if (isJobLoading) {
    return <Spinner animation='border' role='status' />
  }

  if (jobStatus !== 'SUCCESS') {
    return (
      <Container>
        <Alert variant='danger'>
          <Alert.Heading>This job failed</Alert.Heading>
          <hr />
          <p>There is nothing to see here!</p>
        </Alert>
      </Container>
    )
  }

  return (
    <Container>
      <Row>
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

export default Files
