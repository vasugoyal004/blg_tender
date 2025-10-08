import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Row, Col, Button, Spinner } from "react-bootstrap";
import Cookies from "js-cookie";
import { FaUserCircle } from "react-icons/fa";

// === NEW IMPORT for the background image ===
import login_bg from "../../assets/images/login_bg.png"; // Assuming .jpg, adjust if it's .png or another format
// ==========================================

import loginImage from "../../assets/images/success-removebg-preview.png";
import login_logo from "../../assets/images/login_logo.png";

export default function SignInModern() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("login");

  useEffect(() => {
    if (step === "success") {
      const timeout = setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [step, navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_API}/auth.php`,
        {
          email,
          password,
          otp: showOtp ? otp : undefined,
        },
        { withCredentials: true }
      );

      const data = res.data;

      if (data.status) {
        if (data.data === 1 && !showOtp) {
          setShowOtp(true);
          setStep("otp");
          setError("Please verify OTP sent to your email.");
        } else if (data.msg === "Login Successful") {
          if (!data.user_data?.user_type) {
            throw new Error("User type not provided by server.");
          }

          localStorage.setItem("user_id", data.user_data.id);
          localStorage.setItem("name", data.user_data.name);
          localStorage.setItem("user_type", data.user_data.user_type);
          Cookies.set("Tender", data.user_data.token, { expires: 1, path: "/" });
          localStorage.setItem("token", data.user_data.token);

          setStep("success");
        }
      } else {
        setError(data.msg);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div
      className="auth-wrapper d-flex align-items-center justify-content-center position-relative"
      style={{
        minHeight: "100vh",
        // === UPDATED BACKGROUND STYLE to cover the whole viewport ===
        backgroundImage: `url(${login_bg})`,
        backgroundSize: "cover", // Ensures the image covers the entire element
        backgroundPosition: "center", // Centers the image
        backgroundRepeat: "no-repeat", // Prevents repeating
        overflow: "hidden", // Hides any overflow
      }}
    >
      {/* === Background Overlay to lighten the image and cover the full background === */}
      <div
        className="background-overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.5)", // Adjust alpha (0.5 for 50% white overlay) to control lightness
          zIndex: 1, // Ensures it's above the background image
          pointerEvents: "none", // Allows clicks to pass through to elements below
        }}
      ></div>

      {/*
        === Removed Abstract Shapes ===
        The abstract shapes are usually for a subtle, generated background.
        With a full background image, they are often not needed and might
        clash with the image. If you still want them, place them BEFORE
        the 'background-overlay' div and ensure their z-index is lower
        than the overlay. For simplicity and a cleaner look with a full image,
        I've removed the 'abstract-background' div and its content.
      */}

      {/* === Card Section === */}
      <Card
        className="position-relative d-flex flex-column"
        style={{
          width: "1100px",
          maxWidth: "95%",
          background: "rgba(255, 255, 255, 0.95)", // Card background slightly transparent for a modern look
          zIndex: 2, // Card is above the background image and its overlay
          minHeight: "540px",
          borderRadius: "25px",
          boxShadow:
            "0 8px 20px rgba(0,0,0,0.1), 0 16px 32px rgba(0,0,0,0.05)",
          backdropFilter: "blur(10px)", // Optional: Adds a blur effect to content behind the card
          marginBottom: "20px",
        }}
      >
        {/* === Logo Section === */}
        <div
          className="user-icon-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            top: "-90px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            zIndex: 3, // Logo is above the card
          }}
        >
          <div
            style={{
              flex: 1,
              height: "2px",
              backgroundColor: "#b0bec5",
              marginRight: "10px",
            }}
          ></div>

          <img
            src={login_logo}
            alt="Login Logo"
            style={{
              height: "90px",
              width: "auto",
              borderRadius: "10px",
            }}
          />

          <div
            style={{
              flex: 1,
              height: "2px",
              backgroundColor: "#b0bec5",
              marginLeft: "10px",
            }}
          ></div>
        </div>

        <Row className="align-items-center flex-grow-1">
          {/* === Left Image Section === */}
          <Col
            md={6}
            className="d-flex flex-column justify-content-center align-items-center p-3 p-md-5 left-section"
            style={{
              borderRadius: "25px 0 0 25px",
            }}
          >
            <img
              src={loginImage}
              alt="Login Background"
              className="img-fluid"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "25px 0 0 25px",
              }}
            />
          </Col>

          {/* === Right Login Form Section === */}
          <Col md={6} className="p-3 p-md-5 right-section">
            <h4
              className="mb-4 fw-bold text-center"
              style={{ color: "#37474f" }}
            >
              Login
            </h4>

            {error && (
              <div
                style={{
                  color: "#ef5350",
                  marginBottom: "15px",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            {step === "login" && (
              <>
                <div
                  className="form-floating mb-4"
                  style={{ position: "relative" }}
                >
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      border: "none",
                      borderBottom: "2px solid #b0bec5",
                      borderRadius: "0",
                      padding: "12px 0 4px 0",
                      backgroundColor: "transparent",
                      color: "#37474f",
                    }}
                  />
                  <label
                    style={{
                      position: "absolute",
                      left: 0,
                      top: email ? "-10px" : "12px",
                      fontSize: email ? "0.75rem" : "1rem",
                      color: "#78909c",
                      transition: "all 0.3s ease-in-out",
                    }}
                  >
                    Email
                  </label>
                </div>

                <div
                  className="form-floating mb-4"
                  style={{ position: "relative" }}
                >
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      border: "none",
                      borderBottom: "2px solid #b0bec5",
                      borderRadius: "0",
                      padding: "12px 0 4px 0",
                      backgroundColor: "transparent",
                      color: "#37474f",
                    }}
                  />
                  <label
                    style={{
                      position: "absolute",
                      left: 0,
                      top: password ? "-10px" : "12px",
                      fontSize: password ? "0.75rem" : "1rem",
                      color: "#78909c",
                      transition: "all 0.3s ease-in-out",
                    }}
                  >
                    Password
                  </label>
                </div>
              </>
            )}

            {step === "otp" && (
              <div
                className="form-floating mb-4"
                style={{ position: "relative" }}
              >
                <input
                  type="text"
                  className="form-control"
                  placeholder="OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{
                    border: "none",
                    borderBottom: "2px solid #b0bec5",
                    borderRadius: "0",
                    padding: "12px 0 4px 0",
                    backgroundColor: "transparent",
                    color: "#37474f",
                  }}
                />
                <label
                  style={{
                    position: "absolute",
                    left: 0,
                    top: otp ? "-10px" : "12px",
                    fontSize: otp ? "0.75rem" : "1rem",
                    color: "#78909c",
                  }}
                >
                  OTP
                </label>
              </div>
            )}

            {step !== "success" && (
              <Button
                className="w-100"
                style={{
                  background: "linear-gradient(90deg, #1a8cbe, #1a8cbe)",
                  border: "none",
                  borderRadius: "30px",
                  padding: "12px",
                  fontWeight: "600",
                }}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                ) : step === "otp" ? (
                  "Verify OTP"
                ) : (
                  "Login"
                )}
              </Button>
            )}

            {step === "success" && (
              <div className="text-center mt-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3" style={{ color: "#455a64" }}>
                  Login successful — Redirecting...
                </p>
              </div>
            )}
          </Col>
        </Row>

        {/* === Footer Inside Card === */}
        <div
          style={{
            textAlign: "center",
            padding: "10px 0",
            fontSize: "0.75rem",
            color: "#78909c",
            background: "rgba(255,255,255,0.9)",
            borderTop: "1px solid #eceff1",
            borderRadius: "0 0 25px 25px",
            marginTop: "auto",
          }}
        >
          © 2025-26 &nbsp;&nbsp; BLG Technologies
        </div>
      </Card>

      <style>
        {`
          @media (max-width: 767.98px) {
            .left-section {
              border-radius: 25px 25px 0 0 !important;
            }
            .right-section {
              border-radius: 0 0 25px 25px !important;
            }
            .user-icon-container {
              top: -70px !important;
            }
          }
        `}
      </style>
    </div>
  );
}