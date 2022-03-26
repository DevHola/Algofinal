import React, { useState } from "react";
import { Navbar, Container } from "react-bootstrap";
import "./Navbarse.css";
export default function Navbars(props) {
  const [isactive, setactive] = useState(false);
  const logout = () => {
    sessionStorage.removeItem("Auth Token");
    window.location.reload();
  };
  const open = (e) => {
    e.preventDefault();
    setactive(true);
    props.data(true);
  };
  const close = (e) => {
    e.preventDefault();
    setactive(false);
    props.data(false);
  };
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="#home">Trackdefi</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse className="justify-content-end m-2">
          {isactive === false && (
            <button className="btn btn-success breaker" onClick={open}>
              Set Wallet
            </button>
          )}
          {isactive === true && (
            <button className="btn btn-primary breaker m-1" onClick={close}>
              Close Dialog
            </button>
          )}

          <hr></hr>

          <button className="btn btn-danger m-1" onClick={logout}>
            logout
          </button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
