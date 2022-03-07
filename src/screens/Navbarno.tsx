import React from 'react'
import {Navbar,Container,Nav,NavDropdown} from 'react-bootstrap'
import Loginmodal from './Loginmodal';
export default function Navbarno() {
  const [modalShow, setModalShow] = React.useState(false);
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
  <Container>
  <Navbar.Brand href="#home">My Brand Name</Navbar.Brand>
  <Navbar.Toggle aria-controls="responsive-navbar-nav" />
  <Navbar.Collapse id="responsive-navbar-nav">
    <Nav className="me-auto">
      <Nav.Link href="#features">Features</Nav.Link>
      <Nav.Link href="#pricing">Pricing</Nav.Link>
      <NavDropdown title="Dropdown" id="collasible-nav-dropdown">
        <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
        <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
        <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
      </NavDropdown>
    </Nav>
    <Nav>

      <Nav.Link onClick={() => setModalShow(true)}>
        Login
      </Nav.Link>

      <Loginmodal
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
        <Nav.Link href="#deets">Reach Out</Nav.Link>
    </Nav>
  </Navbar.Collapse>
  </Container>
</Navbar>
  )
}
