import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Nav, Dropdown, Card } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  // Function to handle sign-out
  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <div
          className="bg-dark bg-gradient border-end vh-100 p-3 text-start"
          style={{ width: "250px", position: "fixed" }}
        >
          <h4 className="fw-bold text-white">
            <img
              src="logo512.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt=""
            />
            SecureWave
          </h4>
          <Nav className="flex-column">
            <Nav.Link as={NavLink} to="/" className="p-1">
              <i className="fas fa-home me-2"></i> Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/dashboard" className="p-1">
              <i className="fas fa-tachometer-alt me-2"></i> Dashboard
            </Nav.Link>
            <Nav.Link as={NavLink} to="/users" className="p-1">
              <i className="fas fa-users me-2"></i> User Management
            </Nav.Link>
            <Nav.Link as={NavLink} to="/roles" className="p-1">
              <i className="fas fa-user-tag me-2"></i> Role Management
            </Nav.Link>
            <Nav.Link as={NavLink} to="/resources" className="p-1">
              <i className="fas fa-server me-2"></i> Resource Management
            </Nav.Link>
            <Nav.Link as={NavLink} to="/credentials" className="p-1">
              <i className="fas fa-key me-2"></i> Credential Management
            </Nav.Link>
            <Nav.Link as={NavLink} to="/access-requests" className="p-1">
              <i className="fas fa-clipboard-list me-2"></i> Access Requests
            </Nav.Link>
            <Nav.Link as={NavLink} to="/sessions" className="p-1">
              <i className="fas fa-clock me-2"></i> Sessions
            </Nav.Link>
            <Nav.Link as={NavLink} to="/audit-logs" className="p-1">
              <i className="fas fa-clipboard-check me-2"></i> Audit Logs
            </Nav.Link>
            <Nav.Link as={NavLink} to="/notifications" className="p-1">
              <i className="fas fa-bell me-2"></i> Notifications
            </Nav.Link>
            <Nav.Link as={NavLink} to="/compliance-checks" className="p-1">
              <i className="fas fa-check-double me-2"></i> Compliance Checks
            </Nav.Link>
            <Nav.Link as={NavLink} to="/two-factor-auth" className="p-1">
              <i className="fas fa-shield-alt me-2"></i> Two-Factor Auth
            </Nav.Link>
            <Nav.Link as={NavLink} to="/settings" className="p-1">
              <i className="fas fa-cog me-2"></i> Settings
            </Nav.Link>
          </Nav>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1" style={{ marginLeft: "250px" }}>
          {/* Top Right Navbar */}
          <div
            className="d-flex justify-content-end p-3 bg-light border-bottom fixed-top"
            style={{ marginLeft: "250px" }}
          >
            <Dropdown>
              <Dropdown.Toggle
                variant="light"
                className="d-flex align-items-center bg-white border-0"
              >
                <img
                  src="logo512.png"
                  alt="profile"
                  className="rounded-circle me-2"
                  style={{ width: "30px", height: "30px" }}
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/30")
                  }
                />
                <span className="fw-bold text-dark">{username}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                <Dropdown.Item as={NavLink} to="/profile">
                  <i className="fas fa-user me-2"></i> Profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleSignOut}>
                  <i className="fas fa-sign-out-alt me-2"></i> Sign Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <Container fluid className="py-4" style={{ marginTop: "60px" }}>
            <Row>
              <Col lg={{ span: 12 }} md={{ span: 12 }}>
                <Card className="shadow p-4">{children}</Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Layout;
