import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Badge,
  Button,
  Spinner,
  Alert,
  InputGroup,
  FormControl,
  Modal,
  Form,
  Tab,
  Tabs,
  Accordion,
} from "react-bootstrap";
import {
  faHistory,
  faSearch,
  faSync,
  faLockOpen,
  faClock,
  faServer,
  faNetworkWired,
  faDatabase,
  faCloud,
  faInfoCircle,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { toast } from "react-toastify";
// Helper component for resource type icons
const ResourceTypeIcon = ({ type }) => {
  const icons = {
    0: faServer, // Server
    1: faDatabase, // Database
    2: faCloud, // Cloud
    3: faNetworkWired, // Network
    // Add more mappings as needed
  };

  return <FontAwesomeIcon icon={icons[type] || faServer} className="me-2" />;
};

const RequestAccess = () => {
  // State management
  const [requests, setRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState({
    requests: true,
    resources: true,
    submitting: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [resourceDetails, setResourceDetails] = useState(null);
  const [showResourceDetails, setShowResourceDetails] = useState(false);

  const [formData, setFormData] = useState({
    duration: "1",
    reason: "",
    urgency: "normal",
  });

  // Fetch resources from API
  const fetchResources = async () => {
    setLoading((prev) => ({ ...prev, resources: true }));
    try {
      const response = await axios.get("https://localhost:5189/api/Resource");
      const enrichedResources = response.data.map((resource) => ({
        ...resource,
        typeLabel: resource.resourceType || "Unknown",
        protocolLabel: resource.protocol || "Unknown",
        osLabel: resource.operatingSystem || "Unknown",
        databaseLabel: resource.databaseType || "Unknown",
        cloudLabel: resource.cloudProvider || "Unknown",
        deviceLabel: resource.deviceType || "Unknown",
      }));
      setResources(enrichedResources);
    } catch (err) {
      toast.error("Failed to load resources");
      console.error("Resource fetch error:", err);
    } finally {
      setLoading((prev) => ({ ...prev, resources: false }));
    }
  };

  // Fetch requests from API
  const fetchRequests = async () => {
    setLoading((prev) => ({ ...prev, requests: true }));
    try {
      const response = await axios.get(
        "https://localhost:5189/api/AccessRequests/my-requests"
      );
      setRequests(response.data);
    } catch (err) {
      toast.error("Failed to load requests");
      console.error("Request fetch error:", err);
    } finally {
      setLoading((prev) => ({ ...prev, requests: false }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      await fetchResources();
      await fetchRequests();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get badge color based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "danger";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  // View resource details
  const viewResourceDetails = (resource) => {
    setResourceDetails(resource);
    setShowResourceDetails(true);
  };

  // Enhanced request submission with more validation
  const submitRequest = async () => {
    if (formData.reason.length < 20) {
      toast.warning(
        "Please provide a more detailed justification (min 20 chars)"
      );
      return;
    }

    setLoading((prev) => ({ ...prev, submitting: true }));
    try {
      // Extract userId from JWT token
      const token = localStorage.getItem("token"); // Replace with your token storage mechanism
      const userId = token
        ? JSON.parse(atob(token.split(".")[1])).userId
        : null;
      const requestPayload = {
        userId: userId,
        resourceId: selectedResource.resourceId,
        status: "pending", // Default status for a new request
        requestDate: new Date().toISOString(),
        approvalDate: null, // Approval date will be set by the backend upon approval
        reason: formData.reason,
        requestedDuration: `${formData.duration}h`,
        urgency: formData.urgency,
      };

      const response = await axios.post(
        "https://localhost:5189/api/AccessRequests",
        requestPayload
      );

      setRequests([...requests, response.data]);
      toast.success(
        `Access request submitted for ${selectedResource.resourceName}!`,
        { autoClose: 3000 }
      );
      setShowRequestModal(false);
      setFormData({ duration: "1", reason: "", urgency: "normal" });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to submit request. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-center">
            <FontAwesomeIcon icon={faLockOpen} className="me-2" />
            Resource Access Management
          </h2>
        </Col>
      </Row>

      {/* Search and Actions */}
      <Row className="mb-4">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <FormControl
              placeholder="Search resources or requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4} className="d-flex justify-content-end gap-2">
          <Button
            variant="outline-secondary"
            onClick={() => {
              fetchRequests();
              fetchResources();
            }}
            disabled={loading.requests || loading.resources}
          >
            <FontAwesomeIcon
              icon={faSync}
              spin={loading.requests || loading.resources}
            />
          </Button>
          <Button variant="primary" onClick={() => setShowRequestModal(true)}>
            <FontAwesomeIcon icon={faLockOpen} className="me-2" />
            Request Access
          </Button>
        </Col>
      </Row>

      {/* Main Content with Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="list" title="Available Resources">
          <Row className="mt-3">
            {loading.resources ? (
              <Col className="text-center py-5">
                <Spinner animation="border" />
                <p className="mt-2">Loading resources...</p>
              </Col>
            ) : resources.length === 0 ? (
              <Col className="text-center py-5">
                <FontAwesomeIcon
                  icon={faServer}
                  size="3x"
                  className="text-muted mb-3"
                />
                <h5>No resources available</h5>
                <p className="text-muted">
                  Contact your administrator to request resource access
                </p>
              </Col>
            ) : (
              <ListGroup variant="flush">
                {resources
                  .filter(
                    (resource) =>
                      resource.resourceName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      resource.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((resource) => (
                    <ListGroup.Item
                      key={resource.resourceId}
                      className="d-flex justify-content-between align-items-center py-3"
                    >
                      <div>
                        <h5 className="mb-1">
                          <ResourceTypeIcon type={resource.resourceType} />
                          {resource.resourceName}
                        </h5>
                        <p className="mb-1 text-muted small">
                          {resource.description}
                        </p>
                        <div className="mb-2">
                          <Badge bg="info" className="me-1">
                            {resource.protocolLabel}
                          </Badge>
                          {resource.osLabel && (
                            <Badge bg="info" className="me-1">
                              {resource.osLabel}
                            </Badge>
                          )}
                          {resource.databaseLabel && (
                            <Badge bg="info" className="me-1">
                              {resource.databaseLabel}
                            </Badge>
                          )}
                          {resource.cloudLabel && (
                            <Badge bg="info" className="me-1">
                              {resource.cloudLabel}
                            </Badge>
                          )}
                          {resource.deviceLabel && (
                            <Badge bg="info">{resource.deviceLabel}</Badge>
                          )}
                        </div>
                        {resource.hostName && (
                          <p className="small mb-0">
                            <strong>Host:</strong> {resource.hostName}
                            {resource.port && `:${resource.port}`}
                          </p>
                        )}
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => viewResourceDetails(resource)}
                        >
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="me-1"
                          />
                          Details
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedResource(resource);
                            setShowRequestModal(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faLockOpen} className="me-1" />
                          Request Access
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
              </ListGroup>
            )}
          </Row>
        </Tab>
        <Tab eventKey="requests" title="My Requests">
          <Card className="shadow-sm mt-3">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <span>Access Request History</span>
                <Badge bg="light" text="dark" pill>
                  {requests.length} requests
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              {loading.requests ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                  <p className="mt-2">Loading requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon
                    icon={faHistory}
                    size="3x"
                    className="text-muted mb-3"
                  />
                  <h5>No access requests</h5>
                  <p className="text-muted">
                    You haven't made any access requests yet
                  </p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {requests.map((request) => (
                    <ListGroup.Item key={request.id} className="py-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <Badge
                              bg={getStatusBadge(request.status)}
                              className="me-2"
                            >
                              {request.status.toUpperCase()}
                            </Badge>
                            <strong>{request.resourceName}</strong>
                          </div>
                          <div className="small text-muted mb-1">
                            <FontAwesomeIcon icon={faClock} className="me-1" />
                            Requested:{" "}
                            {new Date(request.requestedAt).toLocaleString()} •
                            Duration: {request.requestedDuration}
                          </div>
                          <div className="mb-1">{request.reason}</div>
                          {request.status === "rejected" &&
                            request.rejectionReason && (
                              <div className="text-danger small">
                                <strong>Reason:</strong>{" "}
                                {request.rejectionReason}
                              </div>
                            )}
                        </div>
                        <div>
                          {request.status === "approved" && (
                            <Button variant="success" size="sm">
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* New Request Modal */}
      <Modal
        show={showRequestModal}
        onHide={() => {
          setShowRequestModal(false);
          setSelectedResource(null);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FontAwesomeIcon icon={faLockOpen} className="me-2" />
            New Access Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedResource && (
            <div className="mb-4 p-3 bg-light rounded">
              <h5>
                <ResourceTypeIcon type={selectedResource.resourceType} />
                {selectedResource.resourceName}
              </h5>
              <div className="d-flex flex-wrap gap-2 mb-2">
                <Badge bg="info">{selectedResource.typeLabel}</Badge>
                <Badge bg="info">{selectedResource.protocolLabel}</Badge>
                {selectedResource.osLabel && (
                  <Badge bg="info">{selectedResource.osLabel}</Badge>
                )}
              </div>
              <p className="mb-1">
                <strong>Host:</strong> {selectedResource.hostName}
                {selectedResource.port && `:${selectedResource.port}`}
              </p>
              <p className="mb-0">{selectedResource.description}</p>
            </div>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Resource *</Form.Label>
              <Form.Select
                value={selectedResource?.resourceId || ""}
                onChange={(e) => {
                  const resource = resources.find(
                    (r) => r.resourceId === e.target.value
                  );
                  setSelectedResource(resource || null);
                }}
                required
              >
                <option value="">Choose a resource...</option>
                {resources.map((resource) => (
                  <option key={resource.resourceId} value={resource.resourceId}>
                    {resource.resourceName} ({resource.typeLabel})
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Only resources you have permission to request are shown
              </Form.Text>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration *</Form.Label>
                  <Form.Select
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    required
                  >
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="4">4 hours</option>
                    <option value="8">8 hours</option>
                    <option value="24">1 day</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Urgency *</Form.Label>
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      id="urgency-normal"
                      label="Normal"
                      name="urgency"
                      checked={formData.urgency === "normal"}
                      onChange={() =>
                        setFormData({ ...formData, urgency: "normal" })
                      }
                    />
                    <Form.Check
                      type="radio"
                      id="urgency-high"
                      label="High"
                      name="urgency"
                      checked={formData.urgency === "high"}
                      onChange={() =>
                        setFormData({ ...formData, urgency: "high" })
                      }
                    />
                    <Form.Check
                      type="radio"
                      id="urgency-emergency"
                      label="Emergency"
                      name="urgency"
                      checked={formData.urgency === "emergency"}
                      onChange={() =>
                        setFormData({ ...formData, urgency: "emergency" })
                      }
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Justification *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Explain why you need access to this resource..."
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                required
                minLength={20}
              />
              <Form.Text className="text-muted">
                Minimum 20 characters. Be specific about your need for access.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowRequestModal(false);
              setSelectedResource(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={submitRequest}
            disabled={
              !selectedResource ||
              formData.reason.length < 20 ||
              loading.submitting
            }
          >
            {loading.submitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Resource Details Modal */}
      <Modal
        show={showResourceDetails}
        onHide={() => setShowResourceDetails(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <ResourceTypeIcon type={resourceDetails?.resourceType} />
            {resourceDetails?.resourceName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {resourceDetails && (
            <div className="mb-4">
              <h5>Description</h5>
              <p>{resourceDetails.description || "No description available"}</p>
              <h5 className="mt-4">Details</h5>
              <div className="d-flex flex-wrap gap-3">
                <Badge bg="info">Type: {resourceDetails.typeLabel}</Badge>
                <Badge bg="info">
                  Protocol: {resourceDetails.protocolLabel}
                </Badge>
                {resourceDetails.osLabel && (
                  <Badge bg="info">OS: {resourceDetails.osLabel}</Badge>
                )}
                {resourceDetails.databaseLabel && (
                  <Badge bg="info">
                    Database: {resourceDetails.databaseLabel}
                  </Badge>
                )}
                {resourceDetails.cloudLabel && (
                  <Badge bg="info">Cloud: {resourceDetails.cloudLabel}</Badge>
                )}
                {resourceDetails.deviceLabel && (
                  <Badge bg="info">Device: {resourceDetails.deviceLabel}</Badge>
                )}
                {resourceDetails.hostName && (
                  <Badge bg="info">
                    Host: {resourceDetails.hostName}
                    {resourceDetails.port && `:${resourceDetails.port}`}
                  </Badge>
                )}
                <Badge bg="info">
                  Created:{" "}
                  {new Date(resourceDetails.createdAt).toLocaleDateString()}
                </Badge>
                <Badge bg="info">
                  Last Accessed:{" "}
                  {resourceDetails.lastAccessed
                    ? new Date(resourceDetails.lastAccessed).toLocaleString()
                    : "Never"}
                </Badge>
                <Badge bg="success">Compliance: Compliant</Badge>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowResourceDetails(false)}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setSelectedResource(resourceDetails);
              setShowResourceDetails(false);
              setShowRequestModal(true);
            }}
          >
            <FontAwesomeIcon icon={faLockOpen} className="me-2" />
            Request Access
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RequestAccess;
