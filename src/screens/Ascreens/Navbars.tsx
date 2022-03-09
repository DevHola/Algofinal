import React from 'react'
import {Navbar,Container,Nav} from 'react-bootstrap'

export default function Navbars() {
  const logout = ()=>{
    sessionStorage.removeItem("Auth Token");
    window.location.reload();
  }
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
  <Container>
  <Navbar.Brand href="#home">Trackdefi</Navbar.Brand>
  <Navbar.Toggle aria-controls="responsive-navbar-nav" />
  <Navbar.Collapse id="responsive-navbar-nav">
   
    <Nav>

        <Nav.Link  onClick={logout}>Log Out</Nav.Link>
    </Nav>
  </Navbar.Collapse>
  </Container>
</Navbar>
  )
}
