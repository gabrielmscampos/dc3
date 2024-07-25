import React from 'react'

import { Routes, Route } from 'react-router-dom'

import Views from '../views'

// Note on `PrivateRoute`
//
// From the component src code you can see that you can
// restrict user access based on applications-portal roles by
// just adding the parameter "roles={['role-name']}" to a private route
// and users without that role will see a permission denied modal
//
// Example (based on applications-portal-qa), only users in `viz-role` will load that component:
// <PrivateRoute roles={['viz-role']} component={Views.DataExplorer.Histograms2D} />

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Views.Home.Index />} />
      <Route path='/call'>
        <Route path=':callId' element={<Views.Home.Call />} />
        <Route path=':callId/files' element={<Views.Home.FileBrowser />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
