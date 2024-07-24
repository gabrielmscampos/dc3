import React from 'react'

import { ToastContainer } from 'react-toastify'

import { AppNavbar, AppRoutes } from './components'

const Root = () => {
  return (
    <>
      <AppNavbar/>
      <AppRoutes/>
      <ToastContainer position='bottom-right' />
    </>
  )
}

export default Root
