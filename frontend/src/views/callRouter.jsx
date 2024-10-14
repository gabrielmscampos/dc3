import React from 'react'

import { useParams, Outlet } from 'react-router-dom'

import GenericVerticalNavbar from './components/genericVerticalNavbar'

const CallRouter = () => {
  const { callId } = useParams()

  const routeItems = [
    { label: 'Home', to: `/call/${callId}` },
    { label: 'Actions', to: `/call/${callId}/actions` },
    { label: 'Tasks', to: `/call/${callId}/tasks` },
    { label: 'Runs', to: `/call/${callId}/runs` },
    { label: 'Files', to: `/call/${callId}/files` },
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

export default CallRouter
