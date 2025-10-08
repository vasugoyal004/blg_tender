import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaArrowUp } from 'react-icons/fa';

function Emd_tender_fee_request() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tenderData, setTenderData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [notification, setNotification] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
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

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTender(null);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
      if (type === 'success') {
        handleCloseDrawer();
      }
    }, 2000);
  };

  // Fetch tenders from backend
  const fetchTenders = async () => {
    try {
      setLoading(true);
      setError(null);
      const savedTempId = localStorage.getItem('temp_id') || '';
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/emd_tender_fee_request.php`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPage,
            itemsPerPage,
            temp_id: savedTempId || undefined,
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
      setTotalItems(totalCount || 0);

      if (tenders.length > 0 && tenders[0].temp_id) {
        localStorage.setItem('temp_id', tenders[0].temp_id);
      }
    } catch (e) {
      console.error('Fetching tenders failed:', e);
      setError('Failed to fetch data. Please check the network.');
      setTenderData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenderDetails = async (temp_id) => {
    if (!temp_id) {
      showNotification('No tender ID provided.', 'error');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/emd_tender_data_show.php`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ temp_id }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.message) {
        throw new Error(data.message);
      }

      setSelectedTender({
        temp_id: data.temp_id || temp_id,
        tender_source: data.tender_source || '',
        tender_source_id: data.tender_source_id || '',
        tender_date_of_issue: data.tender_date_of_issue || '',
        tender_favour_of: data.tender_favour_of || '',
        tender_amount: data.tender_amount || '',
        tender_no: data.tender_no || '',
        tender_payable_at: data.tender_payable_at || '',
        tender_validity: data.tender_validity || '',
        emd_date_of_issue: data.emd_date_of_issue || '',
        emd_name_of_issue: data.emd_name_of_issue || '',
        emd_amount: data.emd_amount || '',
        emd_no: data.emd_no || '',
        emd_payable_at: data.emd_payable_at || '',
        emd_validity: data.emd_validity || '',
        emd_city: data.emd_city || '',
        emd_state: data.emd_state || '',
        tender_doc_files: data.tender_doc_files || [],
        emd_doc_files: data.emd_doc_files || [],
        tender_pending_files: {},
        emd_pending_files: {},
      });
    } catch (e) {
      console.error('Fetching tender details failed:', e);
      showNotification('Failed to fetch tender details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle opening the drawer with tender details
  const handleOpenDrawer = (tender) => {
    if (!tender.temp_id) {
      showNotification('No tender ID available.', 'error');
      return;
    }
    localStorage.setItem('temp_id', tender.temp_id);
    fetchTenderDetails(tender.temp_id);
    setIsDrawerOpen(true);
  };

  // Handle form and file submission
  const handleSubmitAll = async () => {
    if (!selectedTender?.temp_id) {
      showNotification('No tender ID provided.', 'error');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('temp_id', selectedTender.temp_id);
      formData.append('tender_date_of_issue', selectedTender.tender_date_of_issue || '');
      formData.append('tender_favour_of', selectedTender.tender_favour_of || '');
      formData.append('tender_amount', selectedTender.tender_amount || '');
      formData.append('tender_no', selectedTender.tender_no || '');
      formData.append('tender_payable_at', selectedTender.tender_payable_at || '');
      formData.append('tender_validity', selectedTender.tender_validity || '');
      formData.append('emd_date_of_issue', selectedTender.emd_date_of_issue || '');
      formData.append('emd_name_of_issue', selectedTender.emd_name_of_issue || '');
      formData.append('emd_amount', selectedTender.emd_amount || '');
      formData.append('emd_no', selectedTender.emd_no || '');
      formData.append('emd_payable_at', selectedTender.emd_payable_at || '');
      formData.append('emd_validity', selectedTender.emd_validity || '');
      formData.append('emd_city', selectedTender.emd_city || '');
      formData.append('emd_state', selectedTender.emd_state || '');
      formData.append('fee_from', selectedTender.tender_favour_of || '');
      formData.append('emd_from', selectedTender.emd_name_of_issue || '');

      // Append files if they exist
      if (selectedTender.tender_pending_files[0]) {
        formData.append('tender_doc', selectedTender.tender_pending_files[0]);
      }
      if (selectedTender.emd_pending_files[0]) {
        formData.append('emd_doc', selectedTender.emd_pending_files[0]);
      }

      // Log FormData for debugging
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/emd_tender_fee_submit.php`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.message === 'Data submitted successfully') {
        showNotification('Tender and EMD details submitted successfully.', 'success');
        fetchTenderDetails(selectedTender.temp_id);
        setSelectedTender((prev) => ({
          ...prev,
          tender_pending_files: {},
          emd_pending_files: {},
        }));
      } else {
        throw new Error(result.message || 'Failed to submit data.');
      }
    } catch (e) {
      console.error('Failed to submit data:', e);
      showNotification(`Failed to submit tender and EMD details: ${e.message}`, 'error');
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
          className="main-heading"
          style={{
            color: 'purple',
            fontWeight: 'bold',
            borderBottom: '2px solid purple',
            paddingBottom: '5px',
            margin: 0,
            width: '100%',
          }}
        >
          EMD & Tender Fee Request
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
                    {tender.organisation_name || 'N/A'}
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ color: '#333', fontSize: '15px' }}>
                    Location: {tender.state || ''}{tender.city ? `, ${tender.city}` : ''}
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
                    Work: {tender.work_name || 'N/A'}
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
                      backgroundColor: '#1e7b48',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                    title="EMD & Tender Fee"
                    onClick={() => handleOpenDrawer(tender)}
                  >
                    EMD & Tender Fee
                  </button>
                </div>
              </div>
              <p style={{ margin: '2px 3px', fontSize: '15px', color: '#333' }}>
                <strong>BGL Id:</strong>{' '}
                {tender.temp_id
                  ? `${tender.temp_id}/${tender.tender_source || 'N/A'}/${tender.tender_source_id || 'N/A'}`
                  : 'N/A'}
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
                  <strong>Value:</strong> {tender.tender_value ? `₹${tender.tender_value}` : 'N/A'}
                </span>
                <p style={{ margin: '5px 0', fontSize: '15px', color: '#333', marginLeft: '270px' }}>
                  {tender.ndate ? `${tender.ndate} ${tender.submission_time || ''}` : 'N/A'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      backgroundColor: '#e8f5e8',
                      color: '#28a745',
                      padding: '12px 16px',
                      borderRadius: '50px',
                      fontSize: '15px',
                      fontWeight: 'bold',
                    }}
                  >
                    {tender.status_label || 'N/A'}
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

      {isDrawerOpen && selectedTender && (
        <div
          className="drawer"
          style={{
            position: 'fixed',
            bottom: 0,
            left: '290px',
            right: '20px',
            width: 'calc(100% - 310px)',
            height: '80vh',
            backgroundColor: 'white',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.2)',
            zIndex: 1000,
            padding: '20px',
            overflowY: 'auto',
            animation: 'slideUp 0.3s ease-in-out',
          }}
        >
          <style>
            {`
              @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
              }

              .main-heading {
                font-size: 26px;
              }

              .floating-label-group {
                position: relative;
                margin-bottom: 15px;
                flex: 1;
                margin-right: 15px;
              }

              .floating-label-group:last-child {
                margin-right: 0;
              }

              .floating-label {
                position: absolute;
                top: 50%;
                left: 15px;
                transform: translateY(-50%);
                transition: all 0.3s ease;
                background-color: #fff;
                padding: 0 5px;
                zIndex: 1;
                pointer-events: none;
                color: #6c757d;
              }

              .floating-input, .floating-select {
                width: 100%;
                height: 50px;
                padding: 8px 15px;
                border: 1px solid #ccc;
                borderRadius: 4px;
                font-size: 14px;
                box-sizing: border-box;
                text-align: left;
              }

              .floating-input:focus + .floating-label,
              .floating-input:not(:placeholder-shown) + .floating-label,
              .floating-select:focus + .floating-label,
              .floating-select:not(:placeholder-shown) + .floating-label {
                top: 0;
                left: 10px;
                transform: translateY(-50%) scale(0.8);
                color: #007bff;
              }

              .floating-input:disabled {
                background-color: #f5f5f5;
                cursor: not-allowed;
                opacity: 0.6;
              }

              .input-row {
                display: flex;
                justify-content: space-between;
                gap: 15px;
                flex-wrap: wrap;
              }

              .drawer-content {
                display: flex;
                justify-content: space-between;
                gap: 20px;
                flex-direction: row;
              }

              .input-section {
                flex: 2;
              }

              .info-section {
                flex: 1;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 50px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                margin-top: 0;
              }

              .info-section h3 {
                font-size: 18px;
                font-weight: bold;
                color: white;
                background-color: purple;
                padding: 10px;
                margin-bottom: 18px;
                text-align: center;
                border-radius: 50px;
              }

              .info-item {
                display: flex;
                align-items: center;
                font-size: 16px;
                color: #333;
                padding: 10px 0;
                flex-wrap: wrap;
              }

              .info-item strong {
                width: 140px;
                font-weight: 600;
                color: #5b52bf;
              }

              .info-item span {
                flex: 1;
                font-weight: 400;
                font-size: 16px;
              }

              .info-divider {
                border-top: 2px solid #ccc;
                margin: 15px 0;
              }

              .upload-section {
                display: flex;
                justify-content: space-between;
                gap: 20px;
                margin-top: 8px;
                flex-wrap: wrap;
              }

              .upload-column {
                flex: 1;
                min-width: 200px;
              }

              .upload-box {
                border: 2px dashed #ccc;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                transition: border-color 0.3s ease;
              }

              .upload-box:hover {
                border-color: #007bff;
              }

              .upload-box input[type="file"] {
                display: none;
              }

              .upload-box label {
                cursor: pointer;
                color: #6c757d;
                font-size: 14px;
                flex: 1;
                text-align: left;
                word-break: break-all;
              }

              .submit-button {
                background-color: green;
                color: white;
                padding: 10px 15px;
                border: none;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                margin-top: 20px;
                margin-bottom: 30px;
                display: block;
                margin-left: auto;
                border-radius: 4px;
              }

              @media (min-width: 1024px) {
                .drawer {
                  width: calc(90vw - 310px);
                  max-width: 1400px;
                  left: 290px;
                  right: 20px;
                  margin: 0 auto;
                }
              }

              @media (max-width: 1024px) {
                .main-heading {
                  font-size: 22px;
                }

                .drawer-content {
                  flex-direction: column;
                }

                .input-section, .info-section {
                  flex: 1;
                  width: 100%;
                }

                .info-section {
                  margin-top: 20px;
                }
              }

              @media (max-width: 768px) {
                .main-heading {
                  font-size: 20px;
                }

                .drawer {
                  left: 0 !important;
                  right: 0 !important;
                  width: 100% !important;
                  height: 90vh;
                  padding: 10px;
                }

                .input-row {
                  flex-direction: column;
                }

                .floating-label-group {
                  margin-right: 0;
                  width: 100%;
                }

                .upload-section {
                  flex-direction: column;
                }

                .upload-column {
                  width: 100%;
                }

                .submit-button {
                  width: 100%;
                  padding: 12px;
                  font-size: 14px;
                }

                .info-item strong {
                  width: 120px;
                }
              }

              @media (max-width: 480px) {
                .main-heading {
                  font-size: 18px;
                }

                .drawer {
                  height: 100vh;
                  padding: 5px;
                }

                .floating-input, .floating-select {
                  height: 45px;
                  font-size: 12px;
                }

                .floating-label {
                  font-size: 12px;
                }

                .info-section h3 {
                  font-size: 16px;
                }

                .info-item {
                  font-size: 14px;
                }

                .info-item strong {
                  width: 100px;
                }
              }
            `}
          </style>

          <div
            className="drawer"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              backgroundColor: '#5b52bf',
              padding: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderRadius: '5px',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
              }}
            >
              Tender Information
            </h2>
            <button
              onClick={handleCloseDrawer}
              style={{
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '25px',
                height: '25px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="drawer-content">
            <div className="input-section">
              <div className="input-row">
                <div className="floating-label-group">
                  <input
                    id="tender_date_of_issue"
                    type="date"
                    className="floating-input"
                    placeholder=" "
                    value={selectedTender.tender_date_of_issue || ''}
                    onChange={(e) =>
                      setSelectedTender({
                        ...selectedTender,
                        tender_date_of_issue: e.target.value,
                      })
                    }
                  />
                  <label htmlFor="tender_date_of_issue" className="floating-label">
                    Date of Issue
                  </label>
                </div>

                <div className="floating-label-group">
                  <input
                    id="tender_favour_of"
                    type="text"
                    className="floating-input"
                    placeholder=" "
                    value={selectedTender.tender_favour_of || ''}
                    onChange={(e) =>
                      setSelectedTender({
                        ...selectedTender,
                        tender_favour_of: e.target.value,
                      })
                    }
                  />
                  <label htmlFor="tender_favour_of" className="floating-label">
                    In Favour of
                  </label>
                </div>
              </div>

              <div className="input-row">
                <div className="floating-label-group">
                  <input
                    id="tender_amount"
                    type="text"
                    className="floating-input"
                    placeholder=" "
                    value={selectedTender.tender_amount || ''}
                    onChange={(e) =>
                      setSelectedTender({
                        ...selectedTender,
                        tender_amount: e.target.value,
                      })
                    }
                  />
                  <label htmlFor="tender_amount" className="floating-label">
                    Amount
                  </label>
                </div>

                <div className="floating-label-group">
                  <input
                    id="tender_no"
                    type="text"
                    className="floating-input"
                    placeholder=" "
                    value={selectedTender.tender_no || ''}
                    onChange={(e) =>
                      setSelectedTender({
                        ...selectedTender,
                        tender_no: e.target.value,
                      })
                    }
                  />
                  <label htmlFor="tender_no" className="floating-label">
                    No.
                  </label>
                </div>
              </div>

              <div className="input-row">
                <div className="floating-label-group">
                  <input
                    id="tender_payable_at"
                    type="text"
                    className="floating-input"
                    placeholder=" "
                    value={selectedTender.tender_payable_at || ''}
                    onChange={(e) =>
                      setSelectedTender({
                        ...selectedTender,
                        tender_payable_at: e.target.value,
                      })
                    }
                  />
                  <label htmlFor="tender_payable_at" className="floating-label">
                    Tender Payable At
                  </label>
                </div>

                <div className="floating-label-group">
                  <input
                    id="tender_validity"
                    type="date"
                    className="floating-input"
                    placeholder=" "
                    value={selectedTender.tender_validity || ''}
                    onChange={(e) =>
                      setSelectedTender({
                        ...selectedTender,
                        tender_validity: e.target.value,
                      })
                    }
                  />
                  <label htmlFor="tender_validity" className="floating-label">
                    Valid Up To
                  </label>
                </div>
              </div>

              <div className="upload-section">
                <div className="upload-column">
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#333',
                    }}
                  >
                    Tender Documents
                  </h3>
                  {[...Array(1)].map((_, index) => {
                    const type = 'tender';
                    const fileName = selectedTender[`${type}_doc_files`]?.[index] || '';
                    return (
                      <div key={`${type}-${index}`} className="upload-box">
                        <input
                          type="file"
                          id={`${type}-upload-${index}`}
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setSelectedTender((prev) => ({
                              ...prev,
                              [`${type}_pending_files`]: {
                                ...prev[`${type}_pending_files`],
                                [index]: file,
                              },
                              [`${type}_doc_files`]: {
                                ...prev[`${type}_doc_files`],
                                [index]: file ? file.name : '',
                              },
                            }));
                          }}
                        />
                        <label htmlFor={`${type}-upload-${index}`}>
                          {fileName || `Upload Tender Document ${index + 1}`}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  marginBottom: '20px',
                  marginTop: '20px',
                  backgroundColor: '#5b52bf',
                  padding: '15px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  borderRadius: '5px',
                }}
              >
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: 'white',
                    margin: 0,
                  }}
                >
                  EMD Information
                </h2>
              </div>

              <div className="input-row">
                <div className="floating-label-group">
                  <input
                    id="emd_date_of_issue"
                    type="date"
                    className="floating-input"
                    placeholder=" "
                    value={selectedTender.emd_date_of_issue || ''}
                    onChange={(e) =>
                      setSelectedTender({
                        ...selectedTender,
                        emd_date_of_issue: e.target.value,
                      })
                    }
                  />
                  <label htmlFor="emd_date_of_issue" className="floating-label">
                    Date of Issue
                  </label>
                </div>

                <div className="floating-label-group">
                  <input
                    id="emd_name_of_issue"
                    type="text"
                    className="floating-input"
                    placeholder=" "
                    value={selectedTender.emd_name_of_issue || ''}
                    onChange={(e) =>
                      setSelectedTender({
                        ...selectedTender,
                        emd_name_of_issue: e.target.value,
                      })
                    }
                  />
                  <label htmlFor="emd_name_of_issue" className="floating-label">
                    Name of Issue
                  </label>
                </div>
              </div>

              <div className="input-row">
                <div className="floating-label-group">
                  <input
                    id="emd_amount"
                    type="text"
                    className="floating-input"
                    placeholder=" "
                    value={selectedTender.emd_amount || ''}
                    onChange={(e) =>
                      setSelectedTender({
                        ...selectedTender,
                        emd_amount: e.target.value,
                      })
                    }
                  />
                  <label htmlFor="emd_amount" className="floating-label">
                    Amount
                  </label>
                </div>

                <div className="floating-label-group">
                  <input
                    id="emd_no"
                    type="text"
                    className="floating-input"
                    placeholder=" "
                    value={selectedTender.emd_no || ''}
                    onChange={(e) =>
                      setSelectedTender({
                        ...selectedTender,
                        emd_no: e.target.value,
                      })
                    }
                  />
                  <label htmlFor="emd_no" className="floating-label">
                    No.
                  </label>
                </div>
              </div>

              <div className="input-row">
                <div className="floating-label-group">
                  <input
                    id="emd_payable_at"
                    type="text"
                    className="floating-input"
                    placeholder=" "
                    value={selectedTender.emd_payable_at || ''}
                    onChange={(e) =>
                      setSelectedTender({
                        ...selectedTender,
                        emd_payable_at: e.target.value,
                      })
                    }
                  />
                  <label htmlFor="emd_payable_at" className="floating-label">
                    EMD Payable At
                  </label>
                </div>

                <div className="floating-label-group">
                  <input
                    id="emd_validity"
                    type="date"
                    className="floating-input"
                    placeholder=" "
                    value={selectedTender.emd_validity || ''}
                    onChange={(e) =>
                      setSelectedTender({
                        ...selectedTender,
                        emd_validity: e.target.value,
                      })
                    }
                  />
                  <label htmlFor="emd_validity" className="floating-label">
                    Valid Up To
                  </label>
                </div>
              </div>

              <div className="input-row">
                <div className="floating-label-group">
                  <input
                    id="emd_city"
                    type="text"
                    className="floating-input"
                    placeholder=" "
                    value={selectedTender.emd_city || ''}
                    onChange={(e) =>
                      setSelectedTender({
                        ...selectedTender,
                        emd_city: e.target.value,
                      })
                    }
                  />
                  <label htmlFor="emd_city" className="floating-label">
                    City
                  </label>
                </div>

                <div className="floating-label-group">
                  <input
                    id="emd_state"
                    type="text"
                    className="floating-input"
                    placeholder=" "
                    value={selectedTender.emd_state || ''}
                    onChange={(e) =>
                      setSelectedTender({
                        ...selectedTender,
                        emd_state: e.target.value,
                      })
                    }
                  />
                  <label htmlFor="emd_state" className="floating-label">
                    State
                  </label>
                </div>
              </div>

              <div className="upload-section">
                <div className="upload-column">
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#333',
                    }}
                  >
                    EMD Documents
                  </h3>
                  {[...Array(1)].map((_, index) => {
                    const type = 'emd';
                    const fileName = selectedTender[`${type}_doc_files`]?.[index] || '';
                    return (
                      <div key={`${type}-${index}`} className="upload-box">
                        <input
                          type="file"
                          id={`${type}-upload-${index}`}
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setSelectedTender((prev) => ({
                              ...prev,
                              [`${type}_pending_files`]: {
                                ...prev[`${type}_pending_files`],
                                [index]: file,
                              },
                              [`${type}_doc_files`]: {
                                ...prev[`${type}_doc_files`],
                                [index]: file ? file.name : '',
                              },
                            }));
                          }}
                        />
                        <label htmlFor={`${type}-upload-${index}`}>
                          {fileName || `Upload EMD Document ${index + 1}`}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                className="submit-button"
                onClick={handleSubmitAll}
                disabled={loading || !selectedTender.temp_id}
              >
                {loading ? 'Submitting...' : 'Submit All'}
              </button>
            </div>

            <div className="info-section">
              <h3>Tender Details</h3>
              <div className="info-item">
                <strong>Tender ID:</strong>{' '}
                <span>
                  {selectedTender.temp_id || ''}/{selectedTender.tender_source || ''}/
                  {selectedTender.tender_source_id || ''}
                </span>
              </div>
              <div className="info-item">
                <strong>Tender Fees:</strong>{' '}
                <span>{selectedTender.tender_amount || 'N/A'}</span>
              </div>
              <div className="info-item">
                <strong>Tender Mode:</strong>{' '}
                <span>{selectedTender.tender_no || 'N/A'}</span>
              </div>
              <div className="info-item">
                <strong>State/City:</strong>{' '}
                <span>
                  {selectedTender.emd_state || selectedTender.emd_city
                    ? `${selectedTender.emd_state || ''}${
                        selectedTender.emd_city ? `, ${selectedTender.emd_city}` : ''
                      }`
                    : 'N/A'}
                </span>
              </div>
              <div className="info-divider"></div>
              <div className="info-item">
                <strong>EMD Fees:</strong>{' '}
                <span>{selectedTender.emd_amount || 'N/A'}</span>
              </div>
              <div className="info-item">
                <strong>Mode of EMD:</strong>{' '}
                <span>{selectedTender.emd_no || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Emd_tender_fee_request;