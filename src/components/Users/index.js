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

const UserRegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    accessLevel: "",
    accessJustification: "",
    requiresMFA: false,
    isLdapUser: false,
    ldapDn: "",
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users from the API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://localhost:5189/api/Users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setUsers(response.data);
      } else {
        throw new Error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(
        error.response?.data?.message ||
          "Failed to fetch users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const userDto = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        accessLevel: formData.accessLevel,
        accessJustification: formData.accessJustification,
        requiresMFA: formData.requiresMFA,
        isLdapUser: formData.isLdapUser,
        ldapDn: formData.ldapDn,
      };

      const token = localStorage.getItem("token");

      if (isEditing) {
        userDto.userId = currentUser.userId;
        await axios.put(
          `https://localhost:5189/api/Users/${currentUser.userId}`,
          userDto,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSuccessMessage("User updated successfully!");
      } else {
        const response = await axios.post(
          "https://localhost:5189/api/Users",
          userDto,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 201) {
          setSuccessMessage("User registered successfully!");
        } else {
          throw new Error("Failed to register user");
        }
      }

      fetchUsers();
      resetForm();
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
  const handleEdit = (user) => {
    setIsEditing(true);
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      confirmPassword: "",
      phoneNumber: user.phoneNumber,
      accessLevel: user.accessLevel,
      accessJustification: user.accessJustification,
      requiresMFA: user.requiresMFA,
      isLdapUser: user.isLdapUser,
      ldapDn: user.ldapDn,
    });
  };

  // Handle lockout button click
  const handleLockout = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const lockoutEndTime = new Date();
      lockoutEndTime.setHours(lockoutEndTime.getHours() + 1);

      await axios.post(
        `https://localhost:5189/api/Users/${id}/Lockout`,
        lockoutEndTime,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccessMessage("User locked out successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Error locking out user:", error);
      setError("Failed to lock out user. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this user?"
      );
      if (!confirmDelete) return;

      await axios.delete(`https://localhost:5189/api/Users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setError(
        error.response?.data?.message ||
          "Failed to delete user. Please try again."
      );
    }
  };

  // Handle unlock button click
  const handleUnlock = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(`https://localhost:5189/api/Users/${id}/Unlock`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage("User unlocked successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Error unlocking user:", error);
      setError("Failed to unlock user. Please try again.");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      accessLevel: "",
      accessJustification: "",
      requiresMFA: false,
      isLdapUser: false,
      ldapDn: "",
    });
    setIsEditing(false);
    setCurrentUser(null);
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <Container className="mt-1">
      <Row>
        <Col md={12}>
          <Card className="shadow mb-3">
            <Card.Body>
              <Card.Title className="text-center mb-4">
                {isEditing ? "Edit User" : "Register New User"}
              </Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}
              {successMessage && (
                <Alert variant="success">{successMessage}</Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={3}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Control
                        type="text"
                        size="sm-2"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Select
                        name="accessLevel"
                        value={formData.accessLevel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            accessLevel: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select Access Level</option>
                        <option value="SuperAdmin">SuperAdmin</option>
                        <option value="Admin">Admin</option>
                        <option value="Auditor">Auditor</option>
                        <option value="SecurityOfficer">SecurityOfficer</option>
                        <option value="ComplianceOfficer">
                          ComplianceOfficer
                        </option>
                        <option value="HelpDesk">HelpDesk</option>
                        <option value="User">User</option>
                        <option value="PrivilegedUser">PrivilegedUser</option>
                        <option value="ApplicationUser">ApplicationUser</option>
                        <option value="Guest">Guest</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Control
                        type="text"
                        name="phoneNumber"
                        placeholder="Phone Number"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phoneNumber: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={3}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                        disabled={isEditing}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                        disabled={isEditing}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Control
                        type="text"
                        name="ldapDn"
                        placeholder="LDAP DN"
                        value={formData.ldapDn}
                        onChange={(e) =>
                          setFormData({ ...formData, ldapDn: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Control
                        as="textarea"
                        rows={1}
                        name="accessJustification"
                        placeholder="Access Justification"
                        value={formData.accessJustification}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            accessJustification: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={2}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Requires MFA"
                        name="requiresMFA"
                        checked={formData.requiresMFA}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requiresMFA: e.target.checked,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="input-group input-group-sm mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Is LDAP User"
                        name="isLdapUser"
                        checked={formData.isLdapUser}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isLdapUser: e.target.checked,
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
                      "Update User"
                    ) : (
                      "Register"
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
                User Management
              </Card.Title>
              <Row>
                <Col md={9}></Col>
                <Col md={3}>
                  <Form.Group className="input-group input-group-sm mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Search by username"
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
                        Username
                      </th>
                      <th scope="col" className="text-uppercase">
                        Email
                      </th>
                      <th scope="col" className="text-uppercase">
                        Access Level
                      </th>
                      <th scope="col" className="text-uppercase">
                        Phone
                      </th>
                      <th scope="col" className="text-uppercase">
                        Is Active
                      </th>
                      <th scope="col" className="text-uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers
                      .filter((user) =>
                        user.username
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      )
                      .map((user) => (
                        <tr key={user.userId} className="table-light">
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>{user.accessLevel}</td>
                          <td>{user.phoneNumber}</td>
                          <td>{user.isActive ? "Active" : "Inactive"}</td>
                          <td>
                            <Button
                              variant="success"
                              size="sm-2"
                              onClick={() => handleEdit(user)}
                              className="btn btn-success btn-sm me-2"
                              aria-label={`Edit user ${user.username}`}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm-2"
                              onClick={() => handleDelete(user.userId)}
                              className="btn btn-secondary btn-sm me-2"
                              aria-label={`Delete user ${user.username}`}
                              disabled={user.accessLevel === "SuperAdmin"}
                            >
                              Delete
                            </Button>
                            <Button
                              variant={!user.isActive ? "success" : "danger"}
                              size="sm-2"
                              onClick={() => {
                                if (user.role === "superadmin") {
                                  alert("Admin user cannot be locked out.");
                                  return;
                                }
                                !user.isActive
                                  ? handleUnlock(user.userId)
                                  : handleLockout(user.userId);
                              }}
                              className="btn btn-secondary btn-sm"
                              aria-label={
                                user.isActive
                                  ? `Unlock user ${user.username}`
                                  : `Lockout user ${user.username}`
                              }
                              disabled={user.accessLevel === "SuperAdmin"}
                            >
                              {!user.isActive ? "Active" : "Inactive"}
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

export default UserRegistrationForm;
