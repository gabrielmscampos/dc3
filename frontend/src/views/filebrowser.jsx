import React, { useState, useEffect } from 'react'

import { useParams, Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'
import Spinner from 'react-bootstrap/Spinner'
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import { FaFolder, FaFile } from 'react-icons/fa'

import API from '../services/api'
import { toast } from 'react-toastify'
import '../assets/css/filebrowser.css'

const FileBrowser = () => {
  const { callId } = useParams()

  const [isLoading, setIsLoading] = useState(false)
  const [files, setFiles] = useState([])
  const [currentDir, setCurrentDir] = useState(callId)
  const [currentFile, setCurrentFile] = useState('')
  const [fileContent, setFileContent] = useState(null)
  const [fileType, setFileType] = useState('')
  const [_, setHistory] = useState([]) // eslint-disable-line no-unused-vars

  useEffect(() => {
    fetchFiles(currentDir)
  }, [currentDir])

  const fetchFiles = (dir) => {
    setIsLoading(true)
    API.files
      .list({ dir })
      .then((response) => {
        const sortedFiles = response.sort((a, b) => {
          if (a.is_directory && !b.is_directory) return -1
          if (!a.is_directory && b.is_directory) return 1
          return a.name.localeCompare(b.name)
        })
        setFiles(sortedFiles)
      })
      .catch((err) => {
        console.error(err)
        toast.error('Failure to communicate with the API!')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleDirectoryClick = (dir) => {
    setHistory((prevHistory) => [...prevHistory, currentDir])
    setCurrentDir(`${currentDir}/${dir}`)
    setFileContent(null)
    setCurrentFile('')
  }

  const handleBackClick = () => {
    setHistory((prevHistory) => {
      const previousHistory = [...prevHistory]
      const previousDir = previousHistory.pop()
      setCurrentDir(previousDir || '')
      return previousHistory
    })
    setFileContent(null)
    setCurrentFile('')
  }

  const handleFileClick = (fileName) => {
    const filePath = `${currentDir}/${fileName}`
    setCurrentFile(filePath)

    API.files
      .getContent({ path: filePath })
      .then((response) => {
        const contentType = response.headers.get('Content-Type')
        setFileType(contentType)
        if (contentType.startsWith('image/')) {
          setFileContent(URL.createObjectURL(response.data))
        } else {
          response.data.text().then((text) => {
            if (contentType === 'application/json') {
              setFileContent(JSON.stringify(JSON.parse(text), null, 2))
            } else {
              setFileContent(text)
            }
          })
        }
      })
      .catch((err) => {
        console.error('Error fetching file content:', err)
        toast.error('Failure to communicate with the API!')
      })
  }

  const handleFileDownload = () => {
    window.location.href = API.files.downloadUrl({ path: currentFile })
  }

  return (
    <Container fluid className='file-browser-container'>
      <Breadcrumb className='mt-4'>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/call/${callId}` }}>
          Go back to call info
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          Directory listing of ./{currentDir}
        </Breadcrumb.Item>
      </Breadcrumb>
      <Row className='file-browser-row'>
        <Col md={4} className='file-browser-left'>
          {isLoading ? (
            <Spinner animation='border' />
          ) : (
            <ListGroup>
              {currentDir !== callId && (
                <ListGroup.Item
                  as='li'
                  key='../'
                  action
                  onClick={handleBackClick}
                >
                  <FaFolder /> {'../'}
                </ListGroup.Item>
              )}
              {files.map((file) => (
                <ListGroup.Item
                  as='li'
                  key={file.name}
                  active={
                    file.is_directory
                      ? false
                      : currentFile === `${currentDir}/${file.name}`
                  }
                  action
                  onClick={() =>
                    file.is_directory
                      ? handleDirectoryClick(file.name)
                      : handleFileClick(file.name)
                  }
                >
                  {file.is_directory ? <FaFolder /> : <FaFile />} {file.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={8} className='file-browser-right'>
          {currentFile && (
            <div className='mb-3'>
              <Button variant='primary' onClick={handleFileDownload}>
                Download
              </Button>
            </div>
          )}
          {fileContent && fileType.startsWith('image/') ? (
            <img
              src={fileContent}
              alt='file content'
              style={{ maxWidth: '100%' }}
            />
          ) : (
            <pre>{fileContent}</pre>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default FileBrowser
