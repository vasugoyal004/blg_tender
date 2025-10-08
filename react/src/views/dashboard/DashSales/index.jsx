import { Row, Col, Card } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { FaCalendar, FaTasks, FaCheckCircle, FaTrophy } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// -----------------------|| DASHBOARD SALES ||-----------------------//
export default function DashSales() {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [counts, setCounts] = useState({
    upcoming: 0,
    approved: 0,
    submitted: 0,
    awarded: 0
  });
  const [userType, setUserType] = useState(localStorage.getItem('user_type') || ''); // Fetch user_type from localStorage

  // Fetch counts from backend
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_API}/dashboard_tender_count.php`, {
          params: { user_type: userType } // Pass user_type as a query parameter
        });
        setCounts(response.data.data);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    if (userType) {
      fetchCounts();
    }
  }, [userType]);

  // Update current date and time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dividerStyle = {
    width: '1px',
    backgroundColor: 'rgba(0,0,0,0.2)',
    margin: '15px 0',
    alignSelf: 'stretch',
    borderRadius: '5px'
  };

  // Reusable Section Component
  const Section = ({ icon: Icon, number, label, color, bgColor, onSectionClick }) => (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        padding: '15px',
        minWidth: '120px'
      }}
      onClick={onSectionClick}
    >
      {/* Decorative circle with count centered */}
      <div
        style={{
          position: 'relative',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 0,
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: 0,
            color: '#333',
            zIndex: 1
          }}
        >
          {number}
        </h1>
      </div>

      {/* Label with icon next to it */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '8px'
        }}
      >
        <Icon size={16} color={color} style={{ marginRight: '5px' }} /> {/* Small icon next to label */}
        <h5 style={{ fontSize: '1rem', color: '#555', margin: 0 }}>{label}</h5>
      </div>
    </div>
  );

  // Handle section click based on user_type
  const handleSectionClick = (filterType) => {
    const route = userType === 'Accounts' ? '/view_all_accounts_tender' : '/view_all_tender';
    navigate(route, { state: { filter: filterType } });
  };

  return (
    <>
      <Row className="mb-4">
        <Col md={12} xl={12}>
          <Card
            className="flat-card"
            style={{
              minHeight: '180px',
              borderRadius: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'row',
              padding: '15px',
              background: `
                radial-gradient(circle at top left, rgba(0,123,255,0.1), transparent 60%),
                radial-gradient(circle at bottom right, rgba(40,167,69,0.1), transparent 60%),
                linear-gradient(135deg, #f9f9f9, #f1f1f1)
              `
            }}
          >
            <style>
              {`
                @media (max-width: 768px) {
                  .flat-card {
                    flex-direction: column !important;
                    align-items: center;
                    padding: 8px;
                  }
                  .flat-card > div[style*="width: 1px"] {
                    width: 100% !important;
                    height: 1px !important;
                    margin: 8px 0 !important;
                  }
                  .flat-card > div {
                    width: 100%;
                    max-width: 250px;
                    margin: 8px 0;
                  }
                  .flat-card > div h1 {
                    font-size: 1.8rem !important;
                  }
                  .flat-card > div h5 {
                    font-size: 0.9rem !important;
                  }
                  .flat-card > div > div[style*="width: 80px"] {
                    width: 70px !important;
                    height: 70px !important;
                  }
                }
              `}
            </style>
            {/* 1. Upcoming */}
            <Section
              icon={FaCalendar}
              number={counts.upcoming}
              label="Upcoming"
              color="#007bff"
              bgColor="rgba(0, 123, 255, 0.15)"
              onSectionClick={() => handleSectionClick('upcoming')}
            />

            {userType !== 'Accounts' && (
              <>
                <div style={dividerStyle} />
                {/* 2. Approved (Hidden for Accounts) */}
                <Section
                  icon={FaTasks}
                  number={counts.approved}
                  label="Approved"
                  color="#dc3545"
                  bgColor="rgba(220, 53, 69, 0.15)"
                  onSectionClick={() => handleSectionClick('approved')}
                />
              </>
            )}

            <div style={dividerStyle} />

            {/* 3. Submitted */}
            <Section
              icon={FaCheckCircle}
              number={counts.submitted}
              label="Submitted"
              color="#28a745"
              bgColor="rgba(40, 167, 69, 0.15)"
              onSectionClick={() => handleSectionClick('submitted')}
            />

            <div style={dividerStyle} />

            {/* 4. Awarded */}
            <Section
              icon={FaTrophy}
              number={counts.awarded}
              label="Awarded"
              color="#ffc107"
              bgColor="rgba(255, 193, 7, 0.15)"
              onSectionClick={() => handleSectionClick('awarded')}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}