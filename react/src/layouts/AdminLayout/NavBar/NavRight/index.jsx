import React, { useState, useEffect, startTransition } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ListGroup, Dropdown, Form, Modal, Button } from "react-bootstrap";
import Cookies from "js-cookie";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👁️ Eye icons for password toggle

// Using a placeholder URL for the profile image
import download1 from "../../../../assets/images/download1.png";
// Local Icon component using inline SVG
const Icon = ({ icon, size = 18, className = "", color = "currentColor" }) => {
  const iconPaths = {
    user: (
      <g>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </g>
    ),
    tag: (
      <g>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </g>
    ),
    mail: (
      <g>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </g>
    ),
    hash: (
      <g>
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
      </g>
    ),
    "log-out": (
      <g>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </g>
    ),
    "alert-triangle": (
      <g>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </g>
    ),
    search: (
      <g>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </g>
    ),
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {iconPaths[icon] || (
        <circle cx="12" cy="12" r="10" strokeDasharray="50" strokeDashoffset="10" />
      )}
    </svg>
  );
};

export default function NavRight() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: localStorage.getItem("name") || "User",
    user_type: localStorage.getItem("user_type") || "Guest",
    email: "",
    user_id: localStorage.getItem("user_id") || "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const user_id = localStorage.getItem("user_id");
  const mainuser_id = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user_id) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_API}/user_information.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id }),
        });

        const data = await response.json();
        if (data.success) {
          setUserDetails({
            name: data.data.name || "User",
            user_type: data.data.user_type || "Guest",
            email: data.data.email || "",
            password: data.data.password || "",
            user_id: data.data.user_id || "",
          });
          localStorage.setItem("name", data.data.name);
          localStorage.setItem("user_type", data.data.user_type);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserDetails();
  }, [user_id]);

  const handleShowLogoutModal = () => setShowLogoutModal(true);
  const handleCloseLogoutModal = () => setShowLogoutModal(false);
  const handleShowProfileModal = () => setShowProfileModal(true);
  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setShowChangePassword(false);
    setPasswordError("");
    setPasswordSuccess("");
    setNewPassword("");
    setConfirmPassword("");
  };

const confirmLogout = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SERVER_API}/logout.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include" 
    });

    const data = await response.json();
    if (data.success) {
      handleCloseLogoutModal();
      startTransition(() => {
        Cookies.remove("Tender");
        localStorage.clear();
        navigate("/");
      });
    } else {
      console.error("Logout failed:", data.message);
    }
  } catch (error) {
    console.error("Error during logout:", error);
  }
};


  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/forgot_password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, new_password: newPassword }),
      });
      const data = await response.json();
      if (data.success) {
        setPasswordSuccess("Password updated successfully!");
        setTimeout(() => {
          setShowChangePassword(false);
          setPasswordSuccess("");
          setNewPassword("");
          setConfirmPassword("");
        }, 2000);
      } else {
        setPasswordError(data.message || "Failed to update password.");
      }
    } catch (error) {
      setPasswordError("An error occurred while updating the password.");
    }
  };

  // InfoRow with proper alignment (label left, value right)
  const InfoRow = ({ icon, label, value }) => (
    <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
      <div className="d-flex align-items-center">
        <Icon icon={icon} size={22} className="me-2 text-primary" />
        <strong>{label}:</strong>
      </div>
      <span className="badge bg-light text-primary px-3 py-2 rounded-pill">
        {value || "N/A"}
      </span>
    </div>
  );

  return (
    <>
      {/* Navbar Right Items */}
      <ListGroup as="ul" bsPrefix=" " className="list-unstyled d-flex align-items-center mb-0">
        {/* Search Dropdown */}
        <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
          <Dropdown>
            <Dropdown.Toggle as="a" variant="link" className="pc-head-link arrow-none me-0">
              <i className="material-icons-two-tone">search</i>
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown drp-search">
              <Form className="px-3">
                <div className="d-flex align-items-center">
                  <Icon icon="search" size={20} color="gray" className="me-2" />
                  <Form.Control
                    type="search"
                    className="border-0 shadow-none"
                    placeholder="Search here..."
                  />
                </div>
              </Form>
            </Dropdown.Menu>
          </Dropdown>
        </ListGroup.Item>

        {/* User Profile Dropdown */}
        <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
          <Dropdown className="drp-user">
            <Dropdown.Toggle
              as="a"
              variant="link"
              className="pc-head-link arrow-none me-0 user-name d-flex align-items-center"
            >
              <img src={download1} alt="userimage" className="rounded-circle me-2" width="40" />
              <span>
                <div className="fw-bold">{userDetails.name}</div>
                <small className="text-muted">{userDetails.user_type}</small>
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown">
              <Dropdown.Header className="pro-head">
                <h5 className="m-0">
                  <span className="badge bg-success-subtle text-success">BLG Tender</span>
                </h5>
              </Dropdown.Header>
              <Dropdown.Item onClick={handleShowProfileModal}>
                <Icon icon="user" size={18} className="me-2" /> Profile
              </Dropdown.Item>
              <Dropdown.Item onClick={handleShowLogoutModal}>
                <Icon icon="log-out" size={18} className="me-2" /> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </ListGroup.Item>
      </ListGroup>

      {/* Profile Modal */}
      <Modal
        show={showProfileModal}
        onHide={handleCloseProfileModal}
        centered
        size={showChangePassword ? "lg" : "md"} //  modal bigger if password form visible
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <Icon icon="user" size={24} className="me-2" />
            User Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            {/* Left User Info */}
            <div className={showChangePassword ? "col-md-6 border-end" : "col-12"}>
              <div className="text-center mb-4">
                <Icon icon="user" size={60} className="text-primary mb-3" />
                <h4 className="fw-bold">{userDetails.name}</h4>
              </div>
              <InfoRow icon="user" label="Full Name" value={userDetails.name} />
              <InfoRow icon="tag" label="User Role" value={userDetails.user_type} />
              <InfoRow icon="mail" label="Email" value={userDetails.email} />
              <InfoRow icon="hash" label="User ID" value={mainuser_id} />
              {/* <InfoRow icon="hash" label="Password" value={userDetails.password} /> */}
              <Button
                variant="link"
                className="text-primary fw-semibold mt-3 p-0"
                onClick={() => setShowChangePassword(!showChangePassword)}
              >
                {showChangePassword ? "Hide Password Form" : "Change Password"}
              </Button>
            </div>

            {/* Right Change Password */}
            {showChangePassword && (
              <div className="col-md-6 mt-4 mt-md-0">
                <h5 className="fw-semibold mb-3">Update Password</h5>
                <Form onSubmit={handleChangePassword}>
                  <Form.Group className="mb-3 position-relative">
                    <Form.Label>New Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <span
                        className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{ cursor: "pointer" }}
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3 position-relative">
                    <Form.Label>Confirm Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <span
                        className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ cursor: "pointer" }}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  </Form.Group>

                  {passwordError && <p className="text-danger small">{passwordError}</p>}
                  {passwordSuccess && <p className="text-success small">{passwordSuccess}</p>}

                  <Button type="submit" className="w-100 btn btn-primary">
                    Update Password
                  </Button>
                </Form>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseProfileModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Logout Modal */}
      <Modal show={showLogoutModal} onHide={handleCloseLogoutModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger d-flex align-items-center">
            <Icon icon="alert-triangle" size={20} className="me-2" color="red" />
            Confirm Logout
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Icon icon="log-out" size={50} className="text-danger mb-3" color="red" />
          <p className="lead">
            Are you sure you want to <strong>Logout</strong>?
          </p>
          <p className="text-muted">This action will end your current session.</p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="secondary" onClick={handleCloseLogoutModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmLogout}>
            <Icon icon="log-out" size={16} className="me-2" color="white" /> Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}