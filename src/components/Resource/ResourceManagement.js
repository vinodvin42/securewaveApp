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
} from "react-bootstrap";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

const ResourceManagement = () => {
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

  const [resources, setResources] = useState([]);
  const [resourcesType, setResourcesType] = useState([]);
  const [protocols, setProtocols] = useState([]); // Add state for protocols
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentResource, setCurrentResource] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [resourcesPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch resources from the API
  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token"); // Get the token from local storage
      const response = await axios.get("https://localhost:5189/api/Resources", {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request
        },
      });

      if (response.status === 200) {
        setResources(response.data);
      } else {
        throw new Error("Failed to fetch resources");
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      if (error.response) {
        if (error.response.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else {
          setError(
            error.response.data.message ||
              "Failed to fetch resources. Please try again."
          );
        }
      } else if (error.request) {
        setError(
          "No response received from the server. Please check your connection."
        );
      } else {
        setError("An error occurred while setting up the request.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch resources type from the API
  const fetchResourcesType = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token"); // Get the token from local storage
      const response = await axios.get(
        "https://localhost:5189/api/Resource/type", // Corrected endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request
          },
        }
      );

      if (response.status === 200) {
        setResourcesType(response.data);
      } else {
        throw new Error("Failed to fetch resources type");
      }
    } catch (error) {
      console.error("Error fetching resources type:", error);
      if (error.response) {
        if (error.response.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else {
          setError(
            error.response.data.message ||
              "Failed to fetch resources type. Please try again."
          );
        }
      } else if (error.request) {
        setError(
          "No response received from the server. Please check your connection."
        );
      } else {
        setError("An error occurred while setting up the request.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch protocols from the API
  const fetchProtocols = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token"); // Get the token from local storage
      const response = await axios.get(
        "https://localhost:5189/api/Resource/protocol", // Corrected endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request
          },
        }
      );

      if (response.status === 200) {
        setProtocols(response.data);
      } else {
        throw new Error("Failed to fetch protocols");
      }
    } catch (error) {
      console.error("Error fetching protocols:", error);
      if (error.response) {
        if (error.response.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else {
          setError(
            error.response.data.message ||
              "Failed to fetch protocols. Please try again."
          );
        }
      } else if (error.request) {
        setError(
          "No response received from the server. Please check your connection."
        );
      } else {
        setError("An error occurred while setting up the request.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchResourcesType(); // Fetch resource types
    fetchProtocols(); // Fetch protocols
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const resourceDto = {
        resourceName: formData.resourceName,
        resourceType: formData.resourceType,
        description: formData.description,
        hostName: formData.hostName,
        port: formData.port,
        protocol: formData.protocol,
        operatingSystem: formData.operatingSystem,
        databaseType: formData.databaseType,
        cloudProvider: formData.cloudProvider,
        apiEndpoint: formData.apiEndpoint,
        fileSystemType: formData.fileSystemType,
        containerType: formData.containerType,
        deviceType: formData.deviceType,
        certificateDetails: formData.certificateDetails,
      };

      const token = localStorage.getItem("token"); // Get the token from local storage

      if (isEditing) {
        // Update resource
        await axios.put(
          `https://localhost:5189/api/Resources/${currentResource.resourceId}`,
          resourceDto,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the request
            },
          }
        );
        setSuccessMessage("Resource updated successfully!");
      } else {
        // Create resource
        const response = await axios.post(
          "https://localhost:5189/api/Resources",
          resourceDto,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the request
            },
          }
        );
        if (response.status === 201) {
          setSuccessMessage("Resource created successfully!");
        } else {
          throw new Error("Failed to create resource");
        }
      }

      fetchResources(); // Refresh the resource list
      resetForm(); // Reset the form
    } catch (error) {
      console.error("Error:", error);
      setError(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (resource) => {
    setIsEditing(true);
    setCurrentResource(resource);
    setFormData({
      resourceName: resource.resourceName,
      resourceType: resource.resourceType,
      description: resource.description,
      hostName: resource.hostName,
      port: resource.port,
      protocol: resource.protocol,
      operatingSystem: resource.operatingSystem,
      databaseType: resource.databaseType,
      cloudProvider: resource.cloudProvider,
      apiEndpoint: resource.apiEndpoint,
      fileSystemType: resource.fileSystemType,
      containerType: resource.containerType,
      deviceType: resource.deviceType,
      certificateDetails: resource.certificateDetails,
    });
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token"); // Get the token from local storage

      // Confirm deletion with the user
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this resource?"
      );
      if (!confirmDelete) return; // Exit if the user cancels

      await axios.delete(`https://localhost:5189/api/Resources/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request
        },
      });

      // Show success message
      setSuccessMessage("Resource deleted successfully!");

      // Refresh the resource list
      fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);

      // Set the error message
      setError(
        error.response?.data?.message ||
          "Failed to delete resource. Please try again."
      );
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

  // Pagination logic
  const indexOfLastResource = currentPage * resourcesPerPage;
  const indexOfFirstResource = indexOfLastResource - resourcesPerPage;
  const currentResources = resources.slice(
    indexOfFirstResource,
    indexOfLastResource
  );
  const totalPages = Math.ceil(resources.length / resourcesPerPage);

  return (
    <Container className="mt-1">
      <Row>
        <Col md={12}>
          <Card className="shadow mb-3">
            <Card.Body>
              <Card.Title className="text-center mb-4">
                {isEditing ? "Edit Resource" : "Create New Resource"}
              </Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}
              {successMessage && (
                <Alert variant="success">{successMessage}</Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={4}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Control
                        type="text"
                        name="resourceName"
                        placeholder="Resource Name"
                        value={formData.resourceName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            resourceName: e.target.value,
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Select
                        name="resourceType"
                        value={formData.resourceType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            resourceType: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select Resource Type</option>
                        {resourcesType.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Control
                        type="text"
                        name="hostName"
                        placeholder="Hostname or IP"
                        value={formData.hostName}
                        onChange={(e) =>
                          setFormData({ ...formData, hostName: e.target.value })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Control
                        type="number"
                        name="port"
                        placeholder="Port"
                        value={formData.port}
                        onChange={(e) =>
                          setFormData({ ...formData, port: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Select
                        name="protocol"
                        value={formData.protocol}
                        onChange={(e) =>
                          setFormData({ ...formData, protocol: e.target.value })
                        }
                        required
                      >
                        <option value="">Select Protocol</option>
                        {protocols.map((protocol) => (
                          <option key={protocol} value={protocol}>
                            {protocol}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Control
                        type="text"
                        name="apiEndpoint"
                        placeholder="API Endpoint"
                        value={formData.apiEndpoint}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            apiEndpoint: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="text-center">
                  <Button
                    type="submit"
                    size="sm-2"
                    variant="success"
                    disabled={loading}
                    className="me-2"
                  >
                    {loading ? (
                      <Spinner
                        as="span"
                        animation="border"
                        variant="light"
                        size="sm-2"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : isEditing ? (
                      "Update Resource"
                    ) : (
                      "Create Resource"
                    )}
                  </Button>
                  {isEditing && (
                    <Button
                      size="sm-2"
                      variant="secondary"
                      onClick={resetForm}
                      className="me-2"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <Card className="shadow mb-3">
            <Card.Body>
              <Card.Title className="text-center mb-4">
                Resource Management
              </Card.Title>
              <Row>
                <Col md={9}></Col>
                <Col md={3}>
                  <Form.Group className="input-group input-group-sm mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Search by resource name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="table-responsive">
                <Table bordered className="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th scope="col" className="text-uppercase">
                        Resource Name
                      </th>
                      <th scope="col" className="text-uppercase">
                        Resource Type
                      </th>
                      <th scope="col" className="text-uppercase">
                        Hostname
                      </th>
                      <th scope="col" className="text-uppercase">
                        Protocol
                      </th>
                      <th scope="col" className="text-uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentResources
                      .filter((resource) =>
                        resource.resourceName
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      )
                      .map((resource) => (
                        <tr key={resource.resourceId} className="table-light">
                          <td>{resource.resourceName}</td>
                          <td>{resource.resourceType}</td>
                          <td>{resource.hostName}</td>
                          <td>{resource.protocol}</td>
                          <td>
                            <Button
                              variant="success"
                              size="sm-2"
                              onClick={() => handleEdit(resource)}
                              className="btn btn-success btn-sm me-2"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm-2"
                              onClick={() => handleDelete(resource.resourceId)}
                              className="btn btn-danger btn-sm"
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </div>
              <Pagination className="mt-4 pagination-sm justify-content-center">
                {Array.from({ length: totalPages }, (_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => setCurrentPage(index + 1)}
                    aria-label={`Go to page ${index + 1}`}
                    className="rounded-pill px-3"
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResourceManagement;
