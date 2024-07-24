import React from 'react'

import Container from 'react-bootstrap/Container'

import Calls from './calls'
import LandPage from './components/landPage'


const Home = () => {
  const isAuthenticated = true

  return <Container>{isAuthenticated ? <Calls /> : <LandPage />}</Container>
}

export default Home
