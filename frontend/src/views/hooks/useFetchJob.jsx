import { useState, useEffect } from 'react'

import { toast } from 'react-toastify'

import API from '../../services/api'
import dateFormat from '../../utils/date'

const useFetchJob = (id) => {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState(null)

  const fetchData = (id) => {
    setIsLoading(true)
    API.jobs
      .get({ id })
      .then((response) => {
        const results = {
          ...response,
          created_at: dateFormat(response.created_at, 'dd.MM.yyyy HH:mm:ss'),
          modified_at: dateFormat(response.modified_at, 'dd.MM.yyyy HH:mm:ss'),
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
    if (id) {
      fetchData(id)
    }
  }, [id])

  return { data, isLoading }
}

export default useFetchJob
