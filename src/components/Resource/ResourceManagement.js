import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
  Card,
  Table,
  Pagination,
  Badge,
  Modal,
  InputGroup,
  Accordion,
  ListGroup,
} from "react-bootstrap";
import axios from "axios";
import {
  faEdit,
  faTrash,
  faPlus,
  faSearch,
  faSync,
  faInfoCircle,
  faServer,
  faNetworkWired,
  faDatabase,
  faCloud,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "bootstrap/dist/css/bootstrap.min.css";

// Update ResourceTypeIcon to handle numeric resourceType values
const ResourceTypeIcon = ({ type }) => {
  const icons = {
    Server: faServer,
    Database: faDatabase,
    Cloud: faCloud,
    NetworkDevice: faNetworkWired,
    Application: faServer,
    FileSystem: faDatabase,
    Container: faCloud,
    Device: faNetworkWired,
    API: faCloud,
    Certificate: faShieldAlt,
  };

  // Convert numeric type to corresponding resource type name if necessary
  const resourceTypeName =
    {
      0: "Server",
      1: "Database",
      2: "Cloud",
      3: "NetworkDevice",
      4: "Application",
      5: "FileSystem",
      6: "Container",
      7: "Device",
      8: "API",
      9: "Certificate",
    }[type] || type;

  return (
    <FontAwesomeIcon
      icon={icons[resourceTypeName] || faServer}
      className="me-2"
    />
  );
};

// Field configuration logic - updated to include all resource types
const getFieldConfig = (resourceTypeValue) => {
  // Map numeric values to resource type names
  const resourceTypeName =
    {
      0: "Server",
      1: "Database",
      2: "Cloud",
      3: "NetworkDevice",
      4: "Application",
      5: "FileSystem",
      6: "Container",
      7: "Device",
      8: "API",
      9: "Certificate",
    }[resourceTypeValue] || "Server";

  // Base fields common to all resource types - unchanged
  const baseFields = [
    { name: "resourceName", label: "Resource Name", required: true },
    { name: "resourceType", label: "Resource Type", required: true },
    { name: "description", label: "Description", required: false },
  ];

  // Type-specific field configurations - updated with all resource types
  const typeSpecificFields = {
    Server: [
      { name: "hostName", label: "Hostname/IP", required: true },
      { name: "port", label: "Port", required: false },
      { name: "protocol", label: "Protocol", required: true },
      { name: "operatingSystem", label: "Operating System", required: true },
    ],
    Database: [
      { name: "hostName", label: "Hostname/IP", required: true },
      { name: "port", label: "Port", required: true },
      { name: "protocol", label: "Protocol", required: true },
      { name: "databaseType", label: "Database Type", required: true },
    ],
    Cloud: [
      { name: "cloudProvider", label: "Cloud Provider", required: true },
      { name: "apiEndpoint", label: "API Endpoint", required: false },
      { name: "region", label: "Region", required: false },
    ],
    NetworkDevice: [
      { name: "hostName", label: "IP Address", required: true },
      { name: "port", label: "Management Port", required: true },
      { name: "deviceType", label: "Device Type", required: true },
    ],
    Application: [
      { name: "appName", label: "Application Name", required: true },
      { name: "version", label: "Version", required: false },
      { name: "language", label: "Language/Framework", required: false },
    ],
    FileSystem: [
      { name: "fileSystemType", label: "File System Type", required: true },
      { name: "mountPoint", label: "Mount Point", required: true },
      { name: "capacityGB", label: "Capacity (GB)", required: false },
    ],
    Container: [
      { name: "containerType", label: "Container Type", required: true },
      { name: "image", label: "Image", required: true },
      { name: "portMappings", label: "Port Mappings", required: false },
    ],
    Device: [
      { name: "deviceType", label: "Device Type", required: true },
      { name: "manufacturer", label: "Manufacturer", required: false },
      { name: "model", label: "Model", required: false },
    ],
    API: [
      { name: "apiEndpoint", label: "API Endpoint", required: true },
      { name: "protocol", label: "Protocol", required: true },
      { name: "authType", label: "Authentication Type", required: false },
    ],
    Certificate: [
      {
        name: "certificateDetails",
        label: "Certificate Details",
        required: true,
      },
      { name: "issuer", label: "Issuer", required: true },
      { name: "expirationDate", label: "Expiration Date", required: true },
    ],
  };

  // Return structure unchanged
  return [
    ...baseFields,
    ...(typeSpecificFields[resourceTypeName] || []),
    { name: "tags", label: "Tags", required: false },
  ];
};

const ResourceManagement = () => {
  // Form state
  const [formData, setFormData] = useState({
    resourceName: "",
    resourceType: "",
    description: "",
    hostName: "",
    port: "",
    protocol: "",
    operatingSystem: "",
    databaseType: "",
    cloudProvider: "",
    apiEndpoint: "",
    fileSystemType: "",
    containerType: "",
    deviceType: "",
    certificateDetails: "",
  });

  // Data state
  const [resources, setResources] = useState([]);
  const [resourcesType, setResourcesType] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [databaseTypes, setDatabaseTypes] = useState([]);
  const [cloudProviders, setCloudProviders] = useState([]);
  const [fileSystemTypes, setFileSystemTypes] = useState([]);
  const [containerTypes, setContainerTypes] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);

  // UI state
  const [loading, setLoading] = useState({
    main: false,
    form: false,
    delete: false,
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentResource, setCurrentResource] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [resourcesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  // Fetch all necessary data
  const fetchAllData = async () => {
    setLoading((prev) => ({ ...prev, main: true }));
    try {
      const token = localStorage.getItem("token");
      const endpoints = [
        "https://localhost:5189/api/Resource",
        "https://localhost:5189/api/Resource/type",
        "https://localhost:5189/api/Resource/protocol",
        "https://localhost:5189/api/Resource/operatingsystem",
        "https://localhost:5189/api/Resource/databasetype",
        "https://localhost:5189/api/Resource/cloudprovider",
        "https://localhost:5189/api/Resource/filesystemtype",
        "https://localhost:5189/api/Resource/containertype",
        "https://localhost:5189/api/Resource/devicetype",
      ];

      const responses = await Promise.all(
        endpoints.map((url) =>
          axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      setResources(responses[0].data);
      setResourcesType(responses[1].data);
      setProtocols(responses[2].data);
      setOperatingSystems(responses[3].data);
      setDatabaseTypes(responses[4].data);
      setCloudProviders(responses[5].data);
      setFileSystemTypes(responses[6].data);
      setContainerTypes(responses[7].data);
      setDeviceTypes(responses[8].data);
    } catch (error) {
      handleApiError(error, "Failed to fetch data");
    } finally {
      setLoading((prev) => ({ ...prev, main: false }));
    }
  };

  // Handle API errors consistently
  const handleApiError = (error, defaultMessage) => {
    console.error("API Error:", error);
    if (error.response) {
      if (error.response.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else {
        setError(error.response.data.message || defaultMessage);
      }
    } else if (error.request) {
      setError("No response from server. Check your connection.");
    } else {
      setError("An error occurred while setting up the request.");
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};

    if (formData.port && !formData.hostName) {
      errors.hostName = "Hostname is required when specifying a port.";
    }

    if (formData.port) {
      const portNum = parseInt(formData.port, 10);
      if (isNaN(portNum) || portNum.toString() !== formData.port) {
        errors.port = "Port must be a number.";
      } else if (portNum < 1 || portNum > 65535) {
        errors.port = "Port must be between 1 and 65535.";
      }
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError("Please fix the errors in the form.");
      return;
    }

    setLoading((prev) => ({ ...prev, form: true }));
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("token");
      const resourceDto = {
        ...formData,
        resourceType: parseInt(formData.resourceType, 10) || 0,
        protocol: parseInt(formData.protocol, 10) || 0,
        operatingSystem: parseInt(formData.operatingSystem, 10) || 0,
        databaseType: parseInt(formData.databaseType, 10) || 0,
        cloudProvider: parseInt(formData.cloudProvider, 10) || 0,
        fileSystemType: parseInt(formData.fileSystemType, 10) || 0,
        deviceType: parseInt(formData.deviceType, 10) || 0,
        containerType: parseInt(formData.containerType, 10) || 0,
        port: formData.port ? parseInt(formData.port, 10) : null,
      };

      if (isEditing) {
        await axios.put(
          `https://localhost:5189/api/Resource/${currentResource.resourceId}`,
          resourceDto,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccessMessage("Resource updated successfully!");
      } else {
        await axios.post("https://localhost:5189/api/Resource", resourceDto, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage("Resource created successfully!");
      }

      fetchAllData();
      resetForm();
    } catch (error) {
      handleApiError(error, "Failed to save resource");
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle edit button click
  const handleEdit = (resource) => {
    setIsEditing(true);
    setCurrentResource(resource);

    // Map response values to corresponding IDs for dropdowns
    const mapValueToId = (options, value) => {
      const matchedOption = options.find((option) => option.value === value);
      return matchedOption ? matchedOption.id : "";
    };

    setFormData({
      resourceName: resource.resourceName,
      resourceType: mapValueToId(resourcesType, resource.resourceType), // Ensure correct mapping for resourceType
      description: resource.description,
      hostName: resource.hostName,
      port: resource.port || "",
      protocol: mapValueToId(protocols, resource.protocol),
      operatingSystem: mapValueToId(operatingSystems, resource.operatingSystem),
      databaseType: mapValueToId(databaseTypes, resource.databaseType),
      cloudProvider: mapValueToId(cloudProviders, resource.cloudProvider),
      fileSystemType: mapValueToId(fileSystemTypes, resource.fileSystemType),
      containerType: mapValueToId(containerTypes, resource.containerType),
      deviceType: mapValueToId(deviceTypes, resource.deviceType),
      apiEndpoint: resource.apiEndpoint || "",
      certificateDetails: resource.certificateDetails || "",
    });
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?"))
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://localhost:5189/api/Resource/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage("Resource deleted successfully!");
      fetchAllData();
    } catch (error) {
      handleApiError(error, "Failed to delete resource");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      resourceName: "",
      resourceType: "",
      description: "",
      hostName: "",
      port: "",
      protocol: "",
      operatingSystem: "",
      databaseType: "",
      cloudProvider: "",
      apiEndpoint: "",
      fileSystemType: "",
      containerType: "",
      deviceType: "",
      certificateDetails: "",
    });
    setIsEditing(false);
    setCurrentResource(null);
  };

  // View resource details
  const viewResourceDetails = (resource) => {
    setSelectedResource(resource);
    setShowDetailsModal(true);
  };

  // Render dropdown options using id and value fields
  const renderDropdownOptions = (options) => {
    return options.length > 0 ? (
      options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.value}
        </option>
      ))
    ) : (
      <option disabled>Loading...</option>
    );
  };

  // Render form fields dynamically based on configuration
  const renderFormFields = () => {
    const fields = getFieldConfig(formData.resourceType);

    return fields.map((field) => (
      <Col md={field.name === "description" ? 12 : 6} key={field.name}>
        <Form.Group className="mb-3">
          <Form.Label>
            {field.label} {field.required && "*"}
          </Form.Label>
          {field.name === "protocol" || field.name === "resourceType" ? (
            <Form.Select
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              required={field.required}
            >
              <option value="">Select {field.label}</option>
              {renderDropdownOptions(
                field.name === "protocol" ? protocols : resourcesType
              )}
            </Form.Select>
          ) : field.name === "operatingSystem" ? (
            <Form.Select
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              required={field.required}
            >
              <option value="">Select Operating System</option>
              {renderDropdownOptions(operatingSystems)}
            </Form.Select>
          ) : field.name === "databaseType" ? (
            <Form.Select
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              required={field.required}
            >
              <option value="">Select Database Type</option>
              {renderDropdownOptions(databaseTypes)}
            </Form.Select>
          ) : field.name === "deviceType" ? (
            <Form.Select
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              required={field.required}
            >
              <option value="">Select Device Type</option>
              {renderDropdownOptions(deviceTypes)}
            </Form.Select>
          ) : field.name === "cloudProvider" ? (
            <Form.Select
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              required={field.required}
            >
              <option value="">Select Cloud Provider</option>
              {renderDropdownOptions(cloudProviders)}
            </Form.Select>
          ) : field.name === "containerType" ? (
            <Form.Select
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              required={field.required}
            >
              <option value="">Select Container Type</option>
              {renderDropdownOptions(containerTypes)}
            </Form.Select>
          ) : field.name === "certificateDetails" ? (
            <Form.Control
              as="textarea"
              rows={3}
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              required={field.required}
            />
          ) : (
            <Form.Control
              type={field.name === "port" ? "number" : "text"}
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              required={field.required}
              min={field.name === "port" ? 1 : undefined}
              max={field.name === "port" ? 65535 : undefined}
            />
          )}
        </Form.Group>
      </Col>
    ));
  };

  // Pagination logic
  const indexOfLastResource = currentPage * resourcesPerPage;
  const indexOfFirstResource = indexOfLastResource - resourcesPerPage;
  const filteredResources = resources.filter(
    (resource) =>
      resource.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.hostName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentResources = filteredResources.slice(
    indexOfFirstResource,
    indexOfLastResource
  );
  const totalPages = Math.ceil(filteredResources.length / resourcesPerPage);

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <Container className="mt-4">
      {/* Success/Error Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {/* Resource Form Card */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                {isEditing ? (
                  <>
                    <FontAwesomeIcon icon={faEdit} className="me-2" />
                    Edit Resource
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Create New Resource
                  </>
                )}
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>{renderFormFields()}</Row>
                <div className="d-flex justify-content-end">
                  {isEditing && (
                    <Button
                      variant="outline-secondary"
                      onClick={resetForm}
                      className="me-2"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant={isEditing ? "primary" : "success"}
                    disabled={loading.form}
                  >
                    {loading.form ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : isEditing ? (
                      <>
                        <FontAwesomeIcon icon={faEdit} className="me-2" />
                        Update Resource
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Create Resource
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resource List Card */}
      <Row>
        <Col>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Resource Management</h5>
              <div>
                <Button
                  variant="light"
                  size="sm"
                  onClick={fetchAllData}
                  disabled={loading.main}
                >
                  <FontAwesomeIcon
                    icon={faSync}
                    spin={loading.main}
                    className="me-2"
                  />
                  Refresh
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search resources..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={8} className="d-flex justify-content-end">
                  <div className="text-muted small">
                    Showing {currentResources.length} of{" "}
                    {filteredResources.length} resources
                  </div>
                </Col>
              </Row>

              {loading.main ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                  <p className="mt-2">Loading resources...</p>
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="text-center py-5">
                  {searchTerm ? (
                    <>
                      <FontAwesomeIcon
                        icon={faSearch}
                        size="3x"
                        className="text-muted mb-3"
                      />
                      <h5>No matching resources found</h5>
                      <p className="text-muted">
                        Try adjusting your search criteria
                      </p>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={faServer}
                        size="3x"
                        className="text-muted mb-3"
                      />
                      <h5>No resources available</h5>
                      <p className="text-muted">
                        Create your first resource using the form above
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Host</th>
                          <th>Protocol</th>
                          <th>Description</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentResources.map((resource) => (
                          <tr key={resource.resourceId}>
                            <td>
                              <div className="d-flex align-items-center">
                                <ResourceTypeIcon
                                  type={resource.resourceType}
                                />
                                {resource.resourceName}
                              </div>
                            </td>
                            <td>
                              <Badge bg="info">{resource.resourceType}</Badge>
                            </td>
                            <td>
                              {resource.hostName}
                              {resource.port && `:${resource.port}`}
                            </td>
                            <td>
                              <Badge bg="secondary">{resource.protocol}</Badge>
                            </td>
                            <td>
                              <small className="text-muted">
                                {resource.description || "No description"}
                              </small>
                            </td>
                            <td>
                              <Button
                                variant="info"
                                size="sm"
                                onClick={() => viewResourceDetails(resource)}
                                className="me-2"
                              >
                                <FontAwesomeIcon icon={faInfoCircle} />
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleEdit(resource)}
                                className="me-2"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  handleDelete(resource.resourceId)
                                }
                                disabled={loading.delete}
                              >
                                {loading.delete &&
                                currentResource?.resourceId ===
                                  resource.resourceId ? (
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                  />
                                ) : (
                                  <FontAwesomeIcon icon={faTrash} />
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <Pagination>
                        <Pagination.First
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                        />
                        <Pagination.Prev
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        />
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            return (
                              <Pagination.Item
                                key={pageNum}
                                active={pageNum === currentPage}
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </Pagination.Item>
                            );
                          }
                        )}
                        <Pagination.Next
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        />
                        <Pagination.Last
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resource Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <ResourceTypeIcon type={selectedResource?.resourceType} />
            {selectedResource?.resourceName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedResource && (
            <>
              <Row>
                <Col md={6}>
                  <h5>Basic Information</h5>
                  <ListGroup variant="flush" className="mb-3">
                    <ListGroup.Item>
                      <strong>Type:</strong> {selectedResource.resourceType}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Host:</strong> {selectedResource.hostName}
                      {selectedResource.port && `:${selectedResource.port}`}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Protocol:</strong> {selectedResource.protocol}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Created:</strong>{" "}
                      {new Date(
                        selectedResource.createdAt
                      ).toLocaleDateString()}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                <Col md={6}>
                  <h5>Technical Details</h5>
                  <ListGroup variant="flush" className="mb-3">
                    {selectedResource.operatingSystem && (
                      <ListGroup.Item>
                        <strong>OS:</strong> {selectedResource.operatingSystem}
                      </ListGroup.Item>
                    )}
                    {selectedResource.databaseType && (
                      <ListGroup.Item>
                        <strong>Database:</strong>{" "}
                        {selectedResource.databaseType}
                      </ListGroup.Item>
                    )}
                    {selectedResource.cloudProvider && (
                      <ListGroup.Item>
                        <strong>Cloud:</strong> {selectedResource.cloudProvider}
                      </ListGroup.Item>
                    )}
                    {selectedResource.apiEndpoint && (
                      <ListGroup.Item>
                        <strong>API Endpoint:</strong>{" "}
                        {selectedResource.apiEndpoint}
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Col>
              </Row>

              {selectedResource.description && (
                <div className="mb-3">
                  <h5>Description</h5>
                  <p>{selectedResource.description}</p>
                </div>
              )}

              {selectedResource.certificateDetails && (
                <Accordion className="mb-3">
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>
                      <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                      Security Certificate Details
                    </Accordion.Header>
                    <Accordion.Body>
                      <pre className="small p-2 bg-light rounded">
                        {selectedResource.certificateDetails}
                      </pre>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleEdit(selectedResource);
              setShowDetailsModal(false);
            }}
          >
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            Edit Resource
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ResourceManagement;
