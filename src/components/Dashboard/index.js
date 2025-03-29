import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Modal,
  Form,
  Spinner,
  Alert,
  InputGroup,
  ListGroup,
} from "react-bootstrap";
import {
  faLockOpen,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faSearch,
  faTerminal,
  faServer,
  faUserShield,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  // State management
  const [resources, setResources] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState({
    resources: false,
    sessions: false,
    requests: false,
  });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [formData, setFormData] = useState({
    reason: "",
    duration: "1", // hours
    approvalRequired: true,
  });
  const [userRole, setUserRole] = useState("user"); // 'admin' or 'user'
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setLoading({ resources: true, sessions: true, requests: true });

      // Simulate API calls
      const resourcesRes = await axios.get(
        "https://localhost:5189/api/Resources"
      );
      const sessionsRes = await axios.get(
        "https://localhost:5189/api/Sessions"
      );
      const requestsRes =
        userRole === "admin"
          ? await axios.get("https://localhost:5189/api/AccessRequests/pending")
          : await axios.get(
              "https://localhost:5189/api/AccessRequests/my-requests"
            );

      setResources(resourcesRes.data);
      setSessions(sessionsRes.data);
      setAccessRequests(requestsRes.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading({ resources: false, sessions: false, requests: false });
    }
  }, [userRole]);

  // Request access to resource
  const requestAccess = async () => {
    try {
      await axios.post("https://localhost:5189/api/AccessRequests", {
        resourceId: selectedResource.id,
        reason: formData.reason,
        requestedDuration: formData.duration,
      });
      toast.success("Access request submitted for approval");
      setShowRequestModal(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to submit request");
    }
  };

  // Approve/Reject request (admin only)
  const handleRequestAction = async (requestId, action) => {
    try {
      await axios.put(
        `https://localhost:5189/api/AccessRequests/${requestId}/${action}`
      );
      toast.success(
        `Request ${action === "approve" ? "approved" : "rejected"}`
      );
      fetchData();
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  // Start a session
  const startSession = async (resourceId) => {
    try {
      const res = await axios.post("https://localhost:5189/api/Sessions", {
        resourceId,
      });
      setCurrentSession(res.data);
      setShowSessionModal(true);
      toast.success("Session started successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to start session");
    }
  };

  // End a session
  const endSession = async (sessionId) => {
    try {
      await axios.delete(`https://localhost:5189/api/Sessions/${sessionId}`);
      toast.success("Session terminated");
      setShowSessionModal(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to end session");
    }
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Calculate time remaining
  const getTimeRemaining = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  // Initialize data
  useEffect(() => {
    fetchData();
    // Simulate role detection (in real app, get from auth context)
    setUserRole(localStorage.getItem("userRole") || "user");
  }, [fetchData]);

  // Filter resources by search term
  const filteredResources = resources.filter(
    (resource) =>
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="py-4 bg-light">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">
            <FontAwesomeIcon icon={faUserShield} className="me-2" />
            SecureWave Dashboard
            <Badge bg="secondary" className="ms-2">
              {userRole === "admin" ? "Administrator" : "User"}
            </Badge>
          </h2>
        </Col>
      </Row>

      {/* Search and Stats */}
      <Row className="mb-4">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4} className="d-flex justify-content-end">
          <Card className="text-center px-3 py-2 shadow-sm">
            <small className="text-muted">Active Sessions</small>
            <h4 className="mb-0 text-success">
              {sessions.filter((s) => !s.endTime).length}
            </h4>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row>
        {/* Resources Panel */}
        <Col lg={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  <FontAwesomeIcon icon={faServer} className="me-2" />
                  Resources
                </span>
                <Badge bg="light" text="dark">
                  {filteredResources.length} available
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              {loading.resources ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                </div>
              ) : filteredResources.length === 0 ? (
                <Alert variant="info" className="text-center">
                  No resources found matching your search
                </Alert>
              ) : (
                <Table striped hover responsive className="align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Access</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResources.map((resource) => (
                      <tr key={resource.id}>
                        <td>
                          <strong>{resource.name}</strong>
                          <div className="text-muted small">
                            {resource.description}
                          </div>
                        </td>
                        <td>
                          <Badge
                            bg={
                              resource.type === "server"
                                ? "primary"
                                : resource.type === "database"
                                ? "info"
                                : "secondary"
                            }
                          >
                            {resource.type}
                          </Badge>
                        </td>
                        <td>
                          {resource.status === "online" ? (
                            <Badge bg="success">Online</Badge>
                          ) : (
                            <Badge bg="danger">Offline</Badge>
                          )}
                        </td>
                        <td>
                          {resource.accessLevel === "full" ? (
                            <Badge bg="warning">Full Access</Badge>
                          ) : (
                            <Badge bg="light" text="dark">
                              Restricted
                            </Badge>
                          )}
                        </td>
                        <td>
                          {resource.requiresApproval ? (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                setSelectedResource(resource);
                                setShowRequestModal(true);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faLockOpen}
                                className="me-1"
                              />
                              Request Access
                            </Button>
                          ) : (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => startSession(resource.id)}
                            >
                              <FontAwesomeIcon
                                icon={faTerminal}
                                className="me-1"
                              />
                              Connect
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Side Panels */}
        <Col lg={4}>
          {/* Active Sessions */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-success text-white">
              <FontAwesomeIcon icon={faClock} className="me-2" />
              Active Sessions
            </Card.Header>
            <Card.Body>
              {loading.sessions ? (
                <Spinner animation="border" size="sm" />
              ) : sessions.filter((s) => !s.endTime).length === 0 ? (
                <Alert variant="secondary" className="text-center">
                  No active sessions
                </Alert>
              ) : (
                <ListGroup variant="flush">
                  {sessions
                    .filter((session) => !session.endTime)
                    .map((session) => (
                      <ListGroup.Item key={session.id}>
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>{session.resourceName}</strong>
                            <div className="small text-muted">
                              Started: {formatTime(session.startTime)}
                            </div>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => endSession(session.id)}
                          >
                            End
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>

          {/* Access Requests */}
          <Card className="shadow-sm">
            <Card.Header className="bg-warning text-dark">
              <FontAwesomeIcon icon={faHistory} className="me-2" />
              {userRole === "admin" ? "Pending Approvals" : "My Requests"}
            </Card.Header>
            <Card.Body>
              {loading.requests ? (
                <Spinner animation="border" size="sm" />
              ) : accessRequests.length === 0 ? (
                <Alert variant="secondary" className="text-center">
                  {userRole === "admin"
                    ? "No pending requests"
                    : "You have no active requests"}
                </Alert>
              ) : (
                <ListGroup variant="flush">
                  {accessRequests.map((request) => (
                    <ListGroup.Item key={request.id}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{request.resourceName}</strong>
                          <div className="small">{request.reason}</div>
                          <div className="small text-muted">
                            {formatTime(request.requestedAt)} •{" "}
                            {request.requestedDuration}h
                          </div>
                        </div>
                        {userRole === "admin" ? (
                          <div>
                            <Button
                              variant="success"
                              size="sm"
                              className="me-1"
                              onClick={() =>
                                handleRequestAction(request.id, "approve")
                              }
                            >
                              <FontAwesomeIcon icon={faCheckCircle} />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                handleRequestAction(request.id, "reject")
                              }
                            >
                              <FontAwesomeIcon icon={faTimesCircle} />
                            </Button>
                          </div>
                        ) : (
                          <Badge
                            bg={
                              request.status === "approved"
                                ? "success"
                                : request.status === "rejected"
                                ? "danger"
                                : "warning"
                            }
                          >
                            {request.status}
                          </Badge>
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      {/* Access Request Modal */}
      <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faLockOpen} className="me-2" />
            Request Access
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Resource</Form.Label>
              <Form.Control
                type="text"
                value={selectedResource?.name || ""}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Duration (hours)</Form.Label>
              <Form.Select
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="4">4 hours</option>
                <option value="8">8 hours</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Justification *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRequestModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={requestAccess}>
            Submit Request
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Active Session Modal */}
      <Modal
        show={showSessionModal}
        onHide={() => setShowSessionModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faTerminal} className="me-2" />
            Active Session: {currentSession?.resourceName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <strong>Session Details:</strong>
            <div className="small text-muted">
              Started: {formatTime(currentSession?.startTime)} •
              {currentSession?.endTime
                ? ` Ended: ${formatTime(currentSession.endTime)}`
                : ` ${getTimeRemaining(currentSession?.expiresAt)}`}
            </div>
          </div>

          {/* Terminal Simulation */}
          <Card bg="dark" text="white">
            <Card.Body className="p-2">
              <pre
                className="mb-0"
                style={{ height: "300px", overflowY: "auto" }}
              >
                {currentSession?.sessionData || "Waiting for session data..."}
              </pre>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between">
              <div className="text-muted small">
                {userRole === "admin" && `User: ${currentSession?.userName}`}
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => endSession(currentSession?.id)}
              >
                Terminate Session
              </Button>
            </Card.Footer>
          </Card>
        </Modal.Body>
      </Modal>
    </Container>
  );
};
export default Dashboard;
