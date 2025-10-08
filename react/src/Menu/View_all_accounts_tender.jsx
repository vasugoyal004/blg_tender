import { useEffect, useState } from "react";
import { FaEye, FaArrowUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function View_all_accounts_tender() {
  const [selectedBox, setSelectedBox] = useState(0); // Default to "Upcoming Tender" (index 0)
  const [searchValue, setSearchValue] = useState("");
  const [tenderData, setTenderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [maxPagesToShow] = useState(5);
  const [selectedTenderId, setSelectedTenderId] = useState(null);
  const [selectedTender, setSelectedTender] = useState(null);
  const [notification, setNotification] = useState(null);

  const boxTitles = ["Upcoming Tender", "Tender Submitted", "Tender Awarded"];
  const navigate = useNavigate();

  const boxColors = [
    { tenderBoxBg: "linear-gradient(90deg, #fffefc 0%, #fff9f2 100%)" },
    { tenderBoxBg: "linear-gradient(90deg, #f8fcff 0%, #eaf4ff 100%)" },
    { tenderBoxBg: "linear-gradient(90deg, #f9f5ff 0%, #ece6ff 100%)" },
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  useEffect(() => {
    fetchTenders();
  }, [selectedBox, currentPage, searchValue]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!selectedTenderId) return;

    const fetchTenderDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${import.meta.env.VITE_SERVER_API}/tender_information_view.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ temp_id: selectedTenderId }),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          const formattedData = data[0] || data;
          const updatedTender = {
            ...formattedData,
            submission_date: formatDateToYYYYMMDD(formattedData.submission_date || ""),
            document_last_date: formatDateToYYYYMMDD(formattedData.document_last_date || ""),
            opening_tender_date: formatDateToYYYYMMDD(formattedData.opening_tender_date || ""),
            emd_validity: formatDateToYYYYMMDD(formattedData.emd_validity || ""),
            tender_validity: formatDateToYYYYMMDD(formattedData.tender_validity || ""),
            submission_time: (formattedData.submission_time || "").slice(0, 5),
            document_last_time: (formattedData.document_last_time || "").slice(0, 5),
            opening_tender_time: (formattedData.opening_tender_time || "").slice(0, 5),
            nit_file_names: formattedData.nit_file_names || {},
            bid_file_names: formattedData.bid_file_names || {},
            nit_pending_files: {},
            bid_pending_files: {},
          };
          setSelectedTender(updatedTender);
        }
      } catch (e) {
        console.error("Fetching tender details failed:", e);
        setError("Failed to fetch tender details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTenderDetails();
  }, [selectedTenderId]);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      setError(null);
      const savedTempId = localStorage.getItem("temp_id");
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/view_all_acoounts_tender.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedBoxIndex: selectedBox,
            currentPage: currentPage,
            itemsPerPage: itemsPerPage,
            temp_id: savedTempId || "",
            search: searchValue, 
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { tenders, totalCount } = await response.json();
      setTenderData(tenders || []);
      setTotalItems(totalCount || 0);

      if (tenders && tenders.length > 0 && tenders[0].temp_id) {
        localStorage.setItem("temp_id", tenders[0].temp_id);
      }
    } catch (e) {
      console.error("Fetching tenders failed:", e);
      setError("Failed to fetch data. Please check the network.");
      setTenderData([]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("/");
    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return "";
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 2000);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pageNumbers = [];
  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const currentColors = selectedBox !== null ? boxColors[selectedBox] : {};

  function handleBoxClick(index) {
    setSelectedBox(index);
   
    setCurrentPage(1); 
  }

  return (
    <div style={{ position: "relative", margin: "0 auto", padding: "20px" }}>
      {/* Notification Display */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "50px",
            left: "850px",
            padding: "20px 25px",
            backgroundColor: notification.type === "success" ? "#28a745" : "#dc3545",
            color: "white",
            zIndex: 9999,
          }}
        >
          {notification.message}
        </div>
      )}

      <div style={{ width: "100%", height: "4px", background: "linear-gradient(90deg, #6a5acd 0%, #007bff 100%)", margin: "10px 0 10px 0", borderRadius: "2px" }}></div>
      <div style={{ display: "flex", justifyContent: "center", margin: "20px 0", flexWrap: "wrap" }}>
        {boxTitles.map((text, index) => (
          <div
            key={index}
            style={{
              padding: "20px 30px",
              margin: "10px",
              background: selectedBox === index ? "linear-gradient(45deg, #6a5acd, #836fff)" : "linear-gradient(45deg, #a0c4ff, #007bff)",
              color: "white",
              cursor: "pointer",
              minWidth: "230px",
              textAlign: "center",
              boxShadow: selectedBox === index ? "0 8px 15px rgba(0,0,0,0.3)" : "0 4px 8px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
            }}
            onClick={() => handleBoxClick(index)}
          >
            <img src="https://img.icons8.com/ios-filled/50/ffffff/document.png" alt="Document Icon" style={{ width: "40px", height: "40px", marginBottom: "5px" }} />
            <div>{text}</div>
          </div>
        ))}
      </div>
      {selectedBox !== null && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ color: "purple", fontSize: "26px", fontWeight: "bold", borderBottom: "2px solid purple", paddingBottom: "5px", margin: 0, width: "80%", }}>
              {boxTitles[selectedBox]}
            </h2>
            <input
              type="text"
              placeholder="Search work and organisation name"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)} // <-- Changing this triggers fetchTenders after setCurrentPage(1)
              style={{ padding: "8px", border: "2px solid purple", borderRadius: "18px", outline: "none", width: "300px" }}
            />
          </div>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && !error && tenderData.length === 0 && <p>No tenders found.</p>}
          {tenderData.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {tenderData.map((tender, index) => (
                <div
                  key={index}
                  style={{
                    background: currentColors.tenderBoxBg || "#f9f9f9",
                    border: `1px solid ${currentColors.tenderBoxBorder || '#ddd'}`,
                    borderRadius: "30px",
                    padding: "20px",
                    boxShadow: currentColors.tenderBoxShadow || "0 2px 5px rgba(0,0,0,0.1)",
                    width: "100%",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div>
                      <span style={{ color: "#333", fontSize: "12px" }}>{(currentPage - 1) * itemsPerPage + index + 1}</span>
                      <h3 style={{ margin: "5px 0 0", color: "#333", fontSize: "18px" }}>
                        {tender.organisation_name || ""}
                      </h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <span style={{ color: "#333", fontSize: "15px" }}>
                        Location: {tender.state || ""}{tender.city ? `, ${tender.city}` : ""}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "15px" }}>
                    <div style={{ width: "70%", color: "#333" }}>
                      <p style={{ margin: "5px 0", fontSize: "15px", color: "red", maxWidth: "100%", whiteSpace: "normal" }}>
                        Work: {tender.work_name || ""}
                      </p>
                    </div>
                    <div style={{ width: "2px", height: "150px", backgroundColor: "blue", margin: "-50px 40px" }}></div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 40px)", gridGap: "10px", alignItems: "center", justifyContent: "center" }}>
                      <button
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: "#007bff",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                        title="View"
                        onClick={() => navigate(`/Account_tender_information/${tender.temp_id}`)}
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: "2px 3px", fontSize: "15px", color: "#333" }}>
                    <strong>BGL Id:</strong> {tender.temp_id ? `${tender.temp_id}/${tender.tender_source}/${tender.tender_source_id}` : ""}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", paddingTop: "10px", borderTop: "1px solid #eee" }}>
                    <span style={{ color: "#333", fontSize: "15px" }}>
                      <strong>Value:</strong> {tender.tender_value ? `₹${tender.tender_value}` : ""}
                    </span>
                    <p style={{ margin: "5px 0", fontSize: "15px", color: "#333", marginLeft: "270px" }}>
                      {tender.ndate ? `${tender.ndate} ${tender.submission_time || ""}` : ""}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {selectedBox !== 2 && (
                        <span style={{ backgroundColor: "#e8f5e8", color: "#28a745", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                          {tender.status_label || ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", gap: "10px" }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{ padding: "8px 16px", borderRadius: "50px", border: "none", backgroundColor: "#007bff", color: "white", cursor: "pointer", transition: "background-color 0.3s" }}
              >
                Previous
              </button>
              {startPage > 1 && <span>...</span>}
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "50px",
                    border: "none",
                    backgroundColor: currentPage === number ? "#6a5acd" : "#e9ecef",
                    color: currentPage === number ? "white" : "#333",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                    fontWeight: currentPage === number ? "bold" : "normal",
                  }}
                >
                  {number}
                </button>
              ))}
              {endPage < totalPages && <span>...</span>}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{ padding: "8px 16px", borderRadius: "50px", border: "none", backgroundColor: "#007bff", color: "white", cursor: "pointer", transition: "background-color 0.3s" }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {showScrollButton && (
        <button
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            zIndex: 999,
            transition: "all 0.3s ease",
          }}
          title="Scroll to Top"
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
}