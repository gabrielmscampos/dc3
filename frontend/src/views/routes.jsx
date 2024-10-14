import React from 'react'

import { Routes, Route } from 'react-router-dom'

import Home from './home'
import Calls from './calls'
import CallRouter from './callRouter'
import CallHome from './callHome'
import CallActions from './callActions'
import CallTasks from './callTasks'
import CallRuns from './callRuns'
import CallFiles from './callFiles'
import Jobs from './jobs'
import JobRouter from './jobRouter'
import JobRunner from './jobRunner'
import JobHome from './jobHome'
import JobFiles from './jobFiles'
import PrivateRoute from './components/privateRoute'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/calls' element={<PrivateRoute component={Calls} />} />
      <Route
        path='/call/:callId/*'
        element={<PrivateRoute component={CallRouter} />}
      >
        <Route index element={<PrivateRoute component={CallHome} />} />
        <Route
          path='actions'
          element={<PrivateRoute component={CallActions} />}
        />
        <Route path='tasks' element={<PrivateRoute component={CallTasks} />} />
        <Route path='runs' element={<PrivateRoute component={CallRuns} />} />
        <Route path='files' element={<PrivateRoute component={CallFiles} />} />
      </Route>
      <Route path='/jobs' element={<PrivateRoute component={Jobs} />} />
      <Route
        path='/job-runner'
        element={<PrivateRoute component={JobRunner} />}
      />
      <Route
        path='/job/:jobId/*'
        element={<PrivateRoute component={JobRouter} />}
      >
        <Route index element={<PrivateRoute component={JobHome} />} />
        <Route path='files' element={<PrivateRoute component={JobFiles} />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
