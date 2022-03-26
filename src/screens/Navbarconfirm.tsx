import { Navbar, Container } from "react-bootstrap";
import "./Navbarconfirm.css";
const Navbarconfirm = () => {
  return (
    <Navbar className="tom mt-2">
      <Container>
        <Navbar.Brand href="#home" className="text-white">
          Trackdefi
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <button className="btn green">Wallet Connected</button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
export default Navbarconfirm;
