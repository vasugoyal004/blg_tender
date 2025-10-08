import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaArrowUp } from 'react-icons/fa';

function Emd_refund() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tenderData, setTenderData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [notification, setNotification] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const navigate = useNavigate();

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const maxPagesToShow = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  // Filter tenders based on search value
  const filteredTenders = tenderData.filter(
    (tender) =>
      tender.organisation_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      tender.work_name?.toLowerCase().includes(searchValue.toLowerCase())
  );


  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 2000);
  };

  const fetchTenders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/emd_refund_all_show.php`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPage,
            itemsPerPage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { tenders, totalCount } = await response.json();
      if (!tenders || !Array.isArray(tenders)) {
        throw new Error('Invalid response format: tenders array missing');
      }

      setTenderData(tenders);

      console.log('tenders:', tenders);
      
      setTotalItems(totalCount || 0);
    } catch (e) {
      console.error('Fetching tenders failed:', e);
      setError('Failed to fetch data. Please check the network.');
      setTenderData([]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchTenders();
  }, [currentPage, itemsPerPage]);

  return (
    <div style={{ position: 'relative', margin: '0 auto', padding: '20px' }}>
      {/* Notification Display */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '50px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '20px 25px',
            backgroundColor: notification.type === 'success' ? '#28a745' : '#dc3545',
            color: 'white',
            zIndex: 9999,
            borderRadius: '5px',
          }}
        >
          {notification.message}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          marginTop: '40px',
        }}
      >
        <h2
          style={{
            color: 'purple',
            fontSize: '26px',
            fontWeight: 'bold',
            borderBottom: '2px solid purple',
            paddingBottom: '5px',
            margin: 0,
            width: '100%',
          }}
        >
          EMD Refund
        </h2>
        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{
            padding: '8px',
            border: '2px solid purple',
            borderRadius: '18px',
            outline: 'none',
            width: '200px',
          }}
        />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && filteredTenders.length === 0 && <p>No tenders found.</p>}
      {filteredTenders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredTenders.map((tender, index) => (
            <div
              key={tender.temp_id || index}
              style={{
                background: '#ffecec',
                borderRadius: '30px',
                padding: '20px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                width: '100%',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '10px',
                }}
              >
                <div>
                  <span style={{ color: '#333', fontSize: '12px' }}>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </span>
                  <h3 style={{ margin: '5px 0 0', color: '#333', fontSize: '18px' }}>
                    {tender.organisation_name || ''}
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ color: '#333', fontSize: '15px' }}>
                    Location: {tender.state || ''} / {tender.city || ''}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ width: '70%', color: '#333' }}>
                  <p
                    style={{
                      margin: '5px 0',
                      fontSize: '15px',
                      color: 'red',
                      maxWidth: '100%',
                      whiteSpace: 'normal',
                    }}
                  >
                    Work: {tender.work_name || ''}
                  </p>
                </div>
                <div
                  style={{
                    width: '2px',
                    height: '150px',
                    backgroundColor: 'blue',
                    margin: '-50px 40px',
                  }}
                ></div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <button
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#007bff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                    title="View"
                    onClick={() => navigate(`/Account_tender_information/${tender.temp_id}`)}
                  >
                    <FaEye />
                  </button>

                     <button
                    style={{
                      width: '155px',
                      height: '37px',
                      borderRadius: '50px',
                      backgroundColor: '#f28c38 ',
                      border: 'none',
                      cursor: 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                    title="EMD & Tender Fee"
                  >

{tender.status_label}

                  </button>
                </div>
              </div>
              <p style={{ margin: '2px 3px', fontSize: '15px', color: '#333' }}>
                <strong>BGL Id:</strong>{' '}
                {tender.temp_id
                  ? `${tender.tender_source || ''}`
                  : ''}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '15px',
                  paddingTop: '10px',
                  borderTop: '1px solid #eee',
                }}
              >
                <span style={{ color: '#333', fontSize: '15px' }}>
                  <strong>EMD Amount:</strong> {tender.emd_ammount ? `₹${tender.emd_ammount}` : ''}
                  <br />
                  <strong>EMD Issue Date:</strong> {tender.emd_issue_date || ''}
                </span>
                <p style={{ margin: '5px 0', fontSize: '15px', color: '#333', marginLeft: '270px' }}>
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      fontSize: '15px',
                      color: '#333',
                    }}
                  >
                    <span>
                      <strong>EMD Mode:</strong> {tender.emd_mode || 'N/A'}
                    </span>
                    <span>
                      <strong>EMD Expire Date:</strong> {tender.emd_expire_date || 'N/A'}
                    </span>
                  </div>
                  <span
                    style={{
                      backgroundColor: tender.label ? '#e8f5e8' : '#f8d7da',
                      color: tender.label ? '#28a745' : '#dc3545',
                      padding: '12px 16px',
                      borderRadius: '50px',
                      fontSize: '15px',
                      fontWeight: 'bold',
                    }}
                  >
                    {tender.label || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              borderRadius: '50px',
              border: 'none',
              backgroundColor: '#007bff',
              color: 'white',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s',
            }}
          >
            Previous
          </button>
          {startPage > 1 && <span>...</span>}
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              style={{
                padding: '8px 16px',
                borderRadius: '50px',
                border: 'none',
                backgroundColor: currentPage === number ? '#6a5acd' : '#e9ecef',
                color: currentPage === number ? 'white' : '#333',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                fontWeight: currentPage === number ? 'bold' : 'normal',
              }}
            >
              {number}
            </button>
          ))}
          {endPage < totalPages && <span>...</span>}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              borderRadius: '50px',
              border: 'none',
              backgroundColor: '#007bff',
              color: 'white',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s',
            }}
          >
            Next
          </button>
        </div>
      )}

      {showScrollButton && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            zIndex: 999,
            transition: 'all 0.3s ease',
          }}
          title="Scroll to Top"
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
}

export default Emd_refund;