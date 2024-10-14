import React from 'react'

import { NavLink } from 'react-router-dom'
import Nav from 'react-bootstrap/Nav'

const GenericVerticalNavbar = ({ items }) => {
  return (
    <div className='vertical-navbar'>
      <Nav className='flex-column'>
        {items.map((item, idx) => (
          <Nav.Link
            key={idx}
            as={NavLink}
            to={item.to}
            className={({ isActive }) => (isActive ? 'active' : '')}
            end
          >
            {item.label}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  )
}

export default GenericVerticalNavbar
