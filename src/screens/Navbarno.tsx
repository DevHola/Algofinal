import React from 'react'
import {Navbar,Container} from 'react-bootstrap'
export default function Navbarno() {
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
  <Container>
  <Navbar.Brand href="#">Trackdefi</Navbar.Brand>
  <Navbar.Toggle aria-controls="responsive-navbar-nav" />
  
  </Container>
</Navbar>
  )
}
