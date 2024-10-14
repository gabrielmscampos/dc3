import { useState, useEffect } from 'react'

import { toast } from 'react-toastify'

import API from '../../services/api'
import dateFormat from '../../utils/date'

const useFetchCall = (callId) => {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState(null)

  const fetchData = (callId) => {
    setIsLoading(true)
    API.calls
      .get({ callId })
      .then((response) => {
        const results = {
          ...response,
          created_at: dateFormat(response.created_at, 'dd.MM.yyyy HH:mm:ss'),
          modified_at: dateFormat(response.modified_at, 'dd.MM.yyyy HH:mm:ss'),
          disabled: response.status === 'CLOSED' ? 'true' : '',
        }
        setData(results)
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
    if (callId) {
      fetchData(callId)
    }
  }, [callId])

  return { data, isLoading }
}

export default useFetchCall
