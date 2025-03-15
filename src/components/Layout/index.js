import React from "react";
import {
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  Button,
  Dropdown,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const username = localStorage.getItem("username");
  // Function to handle sign-out
  const handleSignOut = () => {
    // Clear JWT token or any other session data
    localStorage.removeItem("token");
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="bg-light" style={{ width: "250px", height: "100vh" }}>
        <Navbar bg="light" className="d-block px-3 py-4">
          <Navbar.Brand href="#">SecureWave</Navbar.Brand>
          <Nav className="flex-column">
            <Nav.Link href="/">Dashboard</Nav.Link>
            <Nav.Link href="Users">User On Boarding</Nav.Link>
            <Nav.Link href="/settings">Settings</Nav.Link>
          </Nav>
        </Navbar>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Top Navbar with Profile and Signout */}
        <Navbar bg="light" className="justify-content-end p-3 shadow-sm">
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              <img
                src="logo512.png" // Add your profile image here
                alt="profile"
                className="rounded-circle"
                style={{ width: "30px", marginRight: "10px" }}
              />
              {username}
            </Dropdown.Toggle>

            <Dropdown.Menu align="end">
              <Dropdown.Item href="/profile">Profile</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleSignOut}>Sign Out</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar>

        {/* Content Section */}
        <Container fluid className="mt-4">
          <Row>
            <Col>{children}</Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Layout;
