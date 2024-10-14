import React, { useState, useEffect } from 'react'

import { toast } from 'react-toastify'
import Spinner from 'react-bootstrap/Spinner'
import Card from 'react-bootstrap/Card'
import Modal from 'react-bootstrap/Modal'
import { FaDownload } from 'react-icons/fa'

import directoryIcon from '../../assets/img/dir.png'
import jsonIcon from '../../assets/img/json.png'
import txtIcon from '../../assets/img/txt.png'
import API from '../../services/api'

const RenderFile = ({ basePath, currentPath, file, navigateTo }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [fileContent, setFileContent] = useState()
  const [showModal, setShowModal] = useState(false)

  const handleFileDownload = () => {
    const filePath = `${basePath}/${currentPath.join('/')}/${file.name}`
    API.files.download({ path: filePath }).then((response) => {
      const a = document.createElement('a')
      a.href = window.URL.createObjectURL(response.data)
      a.download = file.name
      a.dispatchEvent(new MouseEvent('click'))
    })
  }

  const getFileContent = ({ filePath }) => {
    setIsLoading(true)
    API.files
      .getContent({ path: filePath })
      .then((response) => {
        const contentType = response.headers.get('Content-Type')
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
      .catch((error) => {
        console.error(error)
        toast.error('Failure to communicate with the API!')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    if (file.name.endsWith('.png')) {
      const filePath = `${basePath}/${currentPath.join('/')}/${file.name}`
      getFileContent({ filePath })
    }
  }, [basePath, currentPath, file])

  if (file.is_directory) {
    return (
      <Card key={file.name} onClick={() => navigateTo(file.name)}>
        <Card.Img
          style={{ height: 'auto', width: '100%' }}
          variant='top'
          src={directoryIcon}
        />
        <Card.Body>
          <Card.Title>{file.name}</Card.Title>
        </Card.Body>
      </Card>
    )
  }

  if (file.name.endsWith('.txt') || file.name.endsWith('.json')) {
    return (
      <>
        <Card
          onClick={() => {
            const filePath = `${basePath}/${currentPath.join('/')}/${file.name}`
            getFileContent({ filePath })
            setShowModal(!showModal)
          }}
          key={file.name}
        >
          <Card.Img
            onClick={() => setShowModal(!showModal)}
            style={{ height: 'auto', width: '100%' }}
            variant='top'
            src={file.name.endsWith('.json') ? jsonIcon : txtIcon}
          />
          <Card.Body>
            <FaDownload onClick={handleFileDownload} />
            <Card.Title>{file.name}</Card.Title>
          </Card.Body>
        </Card>
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{file.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {isLoading ? (
              <Spinner animation='border' role='status' />
            ) : (
              <pre>{fileContent}</pre>
            )}
          </Modal.Body>
        </Modal>
      </>
    )
  }

  if (file.name.endsWith('.png')) {
    return (
      <>
        <Card key={file.name}>
          {isLoading ? (
            <Spinner animation='border' role='status' />
          ) : (
            <Card.Img
              onClick={() => setShowModal(!showModal)}
              style={{ height: 'auto', width: '100%' }}
              variant='top'
              src={fileContent}
            />
          )}
          <Card.Body>
            <FaDownload onClick={handleFileDownload} />
            <Card.Title>{file.name}</Card.Title>
          </Card.Body>
        </Card>
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{file.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img
              src={fileContent}
              alt='file content'
              style={{ height: 'auto', maxWidth: '100%' }}
            />
          </Modal.Body>
        </Modal>
      </>
    )
  }
}

export default RenderFile
