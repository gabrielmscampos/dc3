import React from 'react'

import { useParams, Outlet } from 'react-router-dom'

import GenericVerticalNavbar from './components/genericVerticalNavbar'

const Router = () => {
  const { jobId } = useParams()

  const routeItems = [
    { label: 'Home', to: `/job/${jobId}` },
    { label: 'Files', to: `/job/${jobId}/files` },
  ]

  return (
    <>
      <GenericVerticalNavbar items={routeItems} />
      <div className='content-area'>
        <Outlet />
      </div>
    </>
  )
}

export default Router
