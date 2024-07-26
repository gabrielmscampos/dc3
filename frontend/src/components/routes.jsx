import React from 'react'

import { useAuth } from 'react-oidc-context'
import { Routes, Route } from 'react-router-dom'

import Views from '../views'
import PrivateRoute from './privateRoute'

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
  const auth = useAuth()

  return (
    <Routes>
      <Route
        path='/'
        element={
          !auth.isAuthenticated ? (
            <Views.Home />
          ) : (
            <PrivateRoute component={Views.Calls} />
          )
        }
      />
      <Route path='/call'>
        <Route
          path=':callId'
          element={<PrivateRoute component={Views.Call} />}
        />
        <Route
          path=':callId/files'
          element={<PrivateRoute component={Views.FileBrowser} />}
        />
      </Route>
    </Routes>
  )
}

export default AppRoutes
