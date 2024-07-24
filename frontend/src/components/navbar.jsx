import React from 'react'

import { NavLink } from 'react-router-dom'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Image from 'react-bootstrap/Image'

import logo from '../assets/img/logo.png'

const AppNavbar = () => {
  return (
    <Navbar expand='lg' bg='dark' variant='dark' sticky='top'>
      <Navbar.Brand as={NavLink} to='/'>
        <Image
          src={logo}
          height='30vmin'
          className='d-inline-block align-top ms-3'
          alt='Home'
        />{' '}
        <Navbar.Text>DC3</Navbar.Text>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls='basic-navbar-nav' />
      <Navbar.Collapse
        id='basic-navbar-nav'
        className='justify-content-end me-3'
      >
        <>
          <Nav>
            <Nav.Link className='me-3'>Signed in as: demo</Nav.Link>
          </Nav>
        </>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default AppNavbar
