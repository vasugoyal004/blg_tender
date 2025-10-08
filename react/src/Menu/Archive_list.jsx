import { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaDownload, FaUpload, FaStar, FaArrowUp, FaTimes, FaPlus, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Archive_list() {
  const [selectedBox, setSelectedBox] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [tenderData, setTenderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [maxPagesToShow] = useState(5);
  const [selectedTenderId, setSelectedTenderId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [notification, setNotification] = useState(null);
  const [nitUploadCount, setNitUploadCount] = useState(1);
  const [bidUploadCount, setBidUploadCount] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState("");
  const [modalReason, setModalReason] = useState("");
  const [categories, setCategories] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  const boxTitles = ["Archive Tenders", "Past Tenders", "Not Able To Proceed"];
  const navigate = useNavigate();

  const boxColors = [
    { tenderBoxBg: "linear-gradient(90deg, #fffefc 0%, #fff9f2 100%)" },
    { tenderBoxBg: "linear-gradient(90deg, #f8fcff 0%, #eaf4ff 100%)" },
    { tenderBoxBg: "linear-gradient(90deg, #f9f5ff 0%, #ece6ff 100%)" },
  ];

  // Fetch categories and supervisors for the modal
  useEffect(() => {
    const fetchTenderData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${import.meta.env.VITE_SERVER_API}/second_approval_list.php`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        // Update state with categories and supervisors
        setCategories(data.categories || []);
        setSupervisors(data.supervisors || []);

      } catch (e) {
        console.error("Failed to fetch tender data:", e);
        setError("Failed to fetch categories and supervisors.");
      } finally {
        setLoading(false);
      }
    };

    fetchTenderData();
  }, []);

  const handleBoxClick = (index) => {
    setSelectedBox(index);
    setCurrentPage(1);
  };

  const handleEditClick = (tempId) => {
    setSelectedTenderId(tempId);
    setIsDrawerOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedTender((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e, type, index) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedTender((prev) => ({
        ...prev,
        [`${type}_pending_files`]: {
          ...prev[`${type}_pending_files`],
          [index]: file,
        },
        [`${type}_file_names`]: {
          ...prev[`${type}_file_names`],
          [index]: file.name,
        },
      }));
    }
  };

  const handleAddMore = (type) => {
    if (type === "nit") {
      setNitUploadCount((prev) => prev + 1);
    } else if (type === "bid") {
      setBidUploadCount((prev) => prev + 1);
    }
  };

  const handleCheckCircleClick = (tempId) => {
    setSelectedTenderId(tempId);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    if (!selectedTenderId || !modalStatus || !modalReason) {
      showNotification("Please select both category and supervisor.", "error");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/second_approval_instert.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            temp_id: selectedTenderId,
            category: modalStatus,
            supervisor_id: modalReason,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        showNotification("Your tender has been given 2nd approval");
        setTenderData((prev) =>
          prev.map((tender) =>
            tender.temp_id === selectedTenderId
              ? { ...tender, category: modalStatus, supervisor_id: modalReason }
              : tender
          )
        );
        setIsModalOpen(false);
        setModalStatus("");
        setModalReason("");
      } else {
        showNotification(data.message || "Failed to update status", "error");
      }
    } catch (e) {
      console.error("Failed to update status:", e);
      showNotification("Failed to update status. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBox === null) {
      setTenderData([]);
      return;
    }
    fetchTenders();
  }, [selectedBox, currentPage]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!selectedTenderId || !isDrawerOpen) return;

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
  }, [selectedTenderId, isDrawerOpen]);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      setError(null);
      const savedTempId = localStorage.getItem("temp_id");
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/view_all_archive.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedBoxIndex: selectedBox,
            currentPage: currentPage,
            itemsPerPage: itemsPerPage,
            temp_id: savedTempId || "",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { tenders, totalCount } = await response.json();
      setTenderData(tenders);
      setTotalItems(totalCount);

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

  const filteredTenders = tenderData.filter((tender) =>
    Object.values(tender).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchValue.toLowerCase())
    )
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTenderId(null);
    setSelectedTender(null);
    setNitUploadCount(1);
    setBidUploadCount(1);
  };

  const formatDateForBackend = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return "";
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
      if (type === "success") {
        handleCloseDrawer();
      }
    }, 2000);
  };

  const handleSubmitSection = async (section) => {
    if (!selectedTenderId) {
      showNotification("No tender selected.", "error");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let payload = { temp_id: selectedTenderId };

      if (section === "tender_details") {
        payload = {
          ...payload,
          organisation_name: selectedTender.organisation_name || "",
          work_name: selectedTender.work_name || "",
          submission_date: formatDateForBackend(selectedTender.submission_date || ""),
          submission_time: selectedTender.submission_time ? `${selectedTender.submission_time}:00` : "",
          tender_value: selectedTender.tender_value || "",
          tender_source: selectedTender.tender_source || "",
          tender_source_id: selectedTender.tender_source_id || "",
          state: selectedTender.state || "",
          city: selectedTender.city || "",
        };
      } else if (section === "tender_emd_info") {
        payload = {
          ...payload,
          tender_fee: selectedTender.tender_fee || "",
          tender_favour_of: selectedTender.tender_favour_of || "",
          tender_payble_at: selectedTender.tender_payble_at || "",
          tender_validity: selectedTender.tender_validity || "",
          fee_from_of: selectedTender.mode_tender ? selectedTender.mode_tender.toUpperCase() : "",
          emd_amount: selectedTender.emd_amount || "",
          emd_favour_of: selectedTender.emd_favour_of || "",
          emd_payble_at: selectedTender.emd_payble_at || "",
          emd_validity: selectedTender.emd_validity || "",
          emd_from: selectedTender.mode_emd ? selectedTender.mode_emd.toUpperCase() : "",
        };
      } else if (section === "further_info") {
        payload = {
          ...payload,
          tender_submission: selectedTender.tender_submission || "",
          pre_qualification: selectedTender.pre_qualification || "",
          document_last_date: formatDateForBackend(selectedTender.document_last_date || ""),
          document_last_time: selectedTender.document_last_time ? `${selectedTender.document_last_time}:00` : "",
          opening_tender_date: formatDateForBackend(selectedTender.opening_tender_date || ""),
          opening_tender_time: selectedTender.opening_tender_time ? `${selectedTender.opening_tender_time}:00` : "",
          contact_name: selectedTender.contact_name || "",
          contact_add: selectedTender.contact_add || "",
          contact_phone: selectedTender.contact_phone || "",
          contact_email: selectedTender.contact_email || "",
        };
      }

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/update_tender_information.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setTenderData((prev) =>
          prev.map((tender) =>
            tender.temp_id === selectedTenderId
              ? { ...tender, ...payload }
              : tender
          )
        );
        setSelectedTender((prev) => ({
          ...prev,
          ...payload,
          submission_date: payload.submission_date ? formatDateToYYYYMMDD(payload.submission_date) : prev.submission_date,
          document_last_date: payload.document_last_date ? formatDateToYYYYMMDD(payload.document_last_date) : prev.document_last_date,
          opening_tender_date: payload.opening_tender_date ? formatDateToYYYYMMDD(payload.opening_tender_date) : prev.opening_tender_date,
          submission_time: payload.submission_time ? payload.submission_time.slice(0, 5) : prev.submission_time,
          document_last_time: payload.document_last_time ? payload.document_last_time.slice(0, 5) : prev.document_last_time,
          opening_tender_time: payload.opening_tender_time ? payload.opening_tender_time.slice(0, 5) : prev.opening_tender_time,
        }));
        showNotification("Data Updated Successfully");
      } else {
        showNotification(data.message || `Failed to update ${section}`, "error");
      }
    } catch (e) {
      console.error(`Failed to submit ${section}:`, e);
      showNotification(`Failed to update ${section}. Please try again.`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitImage = async (type, file, index) => {
    if (!file || !selectedTenderId) {
      showNotification("No file selected or tender ID missing.", "error");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("temp_id", selectedTenderId);
      formData.append("file", file);
      formData.append("type", type);
      formData.append("index", index);

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/upload_tender_document.php`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSelectedTender((prev) => ({
          ...prev,
          [`${type}_file_paths`]: {
            ...prev[`${type}_file_paths`],
            [index]: data.file_path,
          },
          [`${type}_pending_files`]: {
            ...prev[`${type}_pending_files`],
            [index]: null,
          },
        }));
        showNotification(`${type.toUpperCase()} File Uploaded Successfully`);
      } else {
        showNotification(data.message || `Failed to upload ${type} file`, "error");
      }
    } catch (e) {
      console.error(`Failed to upload ${type} file:`, e);
      showNotification(`Failed to upload ${type} file. Please try again.`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkImportant = async (tempId) => {
    try {
      setLoading(true);
      setError(null);

      const originalTender = tenderData.find((tender) => tender.temp_id === tempId);
      setTenderData((prev) =>
        prev.map((tender) =>
          tender.temp_id === tempId
            ? { ...tender, mark_important: tender.mark_important === "1" ? "0" : "1" }
            : tender
        )
      );

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/mark_update.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ temp_id: tempId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        showNotification(data.message);
      } else {
        setTenderData((prev) =>
          prev.map((tender) =>
            tender.temp_id === tempId
              ? { ...tender, mark_important: originalTender.mark_important }
              : tender
          )
        );
        showNotification(data.message || "Failed to update important status", "error");
      }
    } catch (e) {
      console.error("Failed to mark tender as important:", e);
      setTenderData((prev) =>
        prev.map((tender) =>
          tender.temp_id === tempId
            ? { ...tender, mark_important: originalTender.mark_important }
            : tender
        )
      );
      showNotification("Failed to update important status. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTenderActionsubmit = async (temp_id) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/second_approved_update_submit.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ temp_id }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unknown error");
      }

      if (data.success) {
        showNotification(data.message, "success");
        setTenderData((prevTenders) =>
          prevTenders.map((tender) =>
            tender.temp_id === temp_id
              ? { ...tender, temp_id: data.temp_id }
              : tender
          )
        );
        showNotification(data.message);
        fetchTenders();
      } else {
        showNotification(data.message || "Failed to update status", "error");
      }
    } catch (e) {
      console.error("Failed to update status:", e);
      showNotification("Failed to update status. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pageNumbers = [];
  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const currentColors = selectedBox !== null ? boxColors[selectedBox] : {};

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

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            right: "0",
            transform: "translateY(-50%)",
            width: "800px",
            height: "auto",
            maxHeight: "80vh",
            backgroundColor: "white",
            boxShadow: "-4px 0 12px rgba(0,0,0,0.2)",
            zIndex: 9999,
            padding: "20px",
            overflowY: "auto",
            animation: "slideInRight 0.3s ease-in-out",
          }}
        >
          <style>
            {`
              @keyframes slideInRight {
                from { 
                  transform: translateY(-50%) translateX(100%); 
                }
                to { 
                  transform: translateY(-50%) translateX(0); 
                }
              }
              .underline-input {
                width: 100%;
                padding: 8px 0;
                border: none;
                border-bottom: 2px solid #ccc;
                font-size: 14px;
                outline: none;
                transition: border-color 0.3s;
                background: transparent;
              }
              .underline-input:focus {
                border-bottom: 2px solid #28a745;
              }
            `}
          </style>

          {/* Modal Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
              2nd Approval
            </h3>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                backgroundColor: "red",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "25px",
                height: "25px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <FaTimes />
            </button>
          </div>

          {/* Category Select */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>
              Select Category
            </label>
            <select
              value={modalStatus}
              onChange={(e) => setModalStatus(e.target.value)}
              className="underline-input"
            >
              <option value="" disabled>Select Category</option>
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))
              ) : (
                <option value="" disabled>No Categories Available</option>
              )}
            </select>
          </div>

          {/* Supervisor Select */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>
              Select Supervisor
            </label>
            <select
              value={modalReason}
              onChange={(e) => setModalReason(e.target.value)}
              className="underline-input"
            >
              <option value="" disabled>Select Supervisor</option>
              {supervisors.length > 0 ? (
                supervisors.map((supervisor, index) => (
                  <option key={index} value={supervisor.id}>
                    {supervisor.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>No Supervisors Available</option>
              )}
            </select>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleModalSubmit}
            disabled={loading || !modalStatus || !modalReason}
            style={{
              backgroundColor: loading ? "#6c757d" : "#28a745",
              color: "white",
              padding: "10px 15px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
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
            <h2 style={{ color: "purple", fontSize: "26px", fontWeight: "bold", borderBottom: "2px solid purple", paddingBottom: "5px", margin: 0, width: "100%", }}>
              {boxTitles[selectedBox]}
            </h2>
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ padding: "8px", border: "2px solid purple", borderRadius: "18px", outline: "none", width: "200px" }}
            />
          </div>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && !error && filteredTenders.length === 0 && <p>No tenders found.</p>}
          {filteredTenders.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {filteredTenders.map((tender, index) => (
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
                        {tender.organisation_name || "Organisation Name Is Not Found"}
                      </h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <span style={{ color: "#333", fontSize: "15px" }}>Location: {tender.state || ""}, {tender.city || ""}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "15px" }}>
                    <div style={{ width: "70%", color: "#333" }}>
                      <p style={{ margin: "5px 0", fontSize: "15px", color: "red", maxWidth: "100%", whiteSpace: "normal" }}>
                        Work: {tender.work_name || "Work Name Is Not Found."}
                      </p>
                    </div>
                    <div style={{ width: "2px", height: "150px", backgroundColor: "blue", margin: "-50px 40px" }}></div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 40px)", gridGap: "10px", alignItems: "center", justifyContent: "center" }}>
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
                        onClick={() => navigate(`/Tender_information_view/${tender.temp_id}`)}
                      >
                        <FaEye />
                      </button>
                      <button
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: "#6c757d",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                        title="Edit"
                        onClick={() => handleEditClick(tender.temp_id)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: "#28a745",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                        title="Approve"
                      >
                        <FaUpload />
                      </button>
                      <button
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: tender.mark_important === "1" ? "#ff5722" : "#6c757d",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                        title={tender.mark_important === "1" ? "Unmark as Important" : "Mark as Important"}
                        onClick={() => handleMarkImportant(tender.temp_id)}
                        disabled={loading}
                      >
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : <FaStar />}
                      </button>
                      {tender.status === "0" && (
                        <button
                          style={{
                            width: "90px",
                            height: "40px",
                            borderRadius: "50px",
                            backgroundColor: "#2c28c5",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            position: "relative",
                          }}
                          title="Update Status"
                          onClick={() => handleCheckCircleClick(tender.temp_id)}
                        >
                          {/* <FaCheckCircle style={{ fontSize: "18px" }} /> */}
                         Approval
                        </button>
                      )}
                     {tender.status === "2" && (
  <button
    style={{
      width: "100px",
      height: "35px",
      borderRadius: "30px",
      backgroundColor: "#ffc107",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
    }}
    onClick={() => handleTenderActionsubmit(tender.temp_id)}
  >
    Submit
  </button>
)}

{tender.status === "3" && (
  <span
    style={{
      width: "100px",
      height: "35px",
      borderRadius: "30px",
      backgroundColor: "blue",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "bold",
      clipPath: "polygon(10% 0, 90% 0, 100% 20%, 100% 80%, 90% 100%, 10% 100%, 0 80%, 0 20%)", // cut-cut ticket shape
    }}
  >
    Submitted
  </span>
)}

                    </div>
                  </div>
                  <p style={{ margin: "2px 3px", fontSize: "15px", color: "#333" }}>
                    <strong>BGL Id:</strong> {tender.temp_id}/{tender.tender_source}/{tender.tender_source_id}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", paddingTop: "10px", borderTop: "1px solid #eee" }}>
                    <span style={{ color: "#333", fontSize: "15px" }}>
                      <strong>Value:</strong> ₹{tender.tender_value || ""}
                    </span>
                    <p style={{ margin: "5px 0", fontSize: "15px", color: "#333", marginLeft: "270px" }}>
                      Submission: {tender.ndate || ""} {tender.submission_time || ""}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ backgroundColor: "#e8f5e8", color: "#28a745", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                        {tender.status_label || ""}
                      </span>
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

      {isDrawerOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: "290px",
            right: 0,
            width: "calc(100% - 300px)",
            height: "80vh",
            backgroundColor: "white",
            boxShadow: "0 -4px 12px rgba(0,0,0,0.2)",
            zIndex: 1000,
            padding: "20px",
            overflowY: "auto",
            animation: "slideUp 0.3s ease-in-out",
          }}
        >
          <style>
            {`
              @keyframes slideUp {
                from {
                  transform: translateY(100%);
                }
                to {
                  transform: translateY(0);
                }
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
                font-size: 14px;
                box-sizing: border-box;
                text-align: left;
              }

              .floating-textarea {
                width: 100%;
                min-height: 50px;
                padding: 8px 15px;
                border: 1px solid #ccc;
                borderRadius: 20px;
                font-size: 14px;
                box-sizing: border-box;
                text-align: left;
                resize: none;
                overflow: hidden;
              }

              .floating-input:focus + .floating-label,
              .floating-input:not(:placeholder-shown) + .floating-label,
              .floating-textarea:focus + .floating-label,
              .floating-textarea:not(:placeholder-shown) + .floating-label,
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
                justifyContent: space-between;
              }

              .full-row {
                display: flex;
                justifyContent: stretch;
              }

              .upload-section {
                display: flex;
                justify-content: space-between;
                gap: 20px;
                margin-top: 20px;
              }

              .upload-column {
                flex: 1;
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
                flex-wrap: nowrap;
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
                margin-right: 10px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              .submit-button {
                background-color: green;
                color: white;
                padding: 10px 15px;
                border: none;
                cursor: pointer;
                font-size: 12px;
                fontWeight: bold;
                margin-top: 10px;
                margin-bottom: 30px;
                display: block;
                margin-left: auto;
              }

              .small-submit-button {
                background-color: #007bff;
                color: white;
                border: none;
                borderRadius: 50%;
                width: 25px;
                height: 25px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                font-size: 10px;
                flex-shrink: 0;
              }

              .small-submit-button:disabled {
                background-color: #6c757d;
                cursor: not-allowed;
              }

              .add-more-button {
                background-color: #28a745;
                color: white;
                padding: 8px 12px;
                border: none;
                borderRadius: 5px;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 5px;
                margin-top: 10px;
              }

              .add-more-button:hover {
                background-color: #218838;
              }
            `}
          </style>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              backgroundColor: "#5b52bf",
              padding: "15px 15px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "white",
                margin: 0,
              }}
            >
              Tender Details
            </h2>
            <button
              onClick={handleCloseDrawer}
              style={{
                backgroundColor: "red",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "25px",
                height: "25px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <FaTimes />
            </button>
          </div>

          <div>
            {loading && <p>Loading tender details...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {selectedTender && (
              <div style={{ marginTop: "15px" }}>
                <div className="full-row">
                  <div className="floating-label-group" style={{ flex: "1 1 100%" }}>
                    <textarea
                      id="work-name"
                      className="floating-textarea"
                      placeholder=" "
                      value={selectedTender.work_name || ""}
                      onChange={(e) => {
                        setSelectedTender({
                          ...selectedTender,
                          work_name: e.target.value,
                        });
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                    />
                    <label htmlFor="work-name" className="floating-label">
                      Work Name
                    </label>
                  </div>
                </div>

                <div className="input-row">
                  <div className="floating-label-group">
                    <input
                      id="organisation-name"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.organisation_name || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          organisation_name: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="organisation-name" className="floating-label">
                      Organisation Name
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      id="tender_source_id"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.tender_source_id || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          tender_source_id: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="tender_source_id" className="floating-label">
                      Tender Source Id
                    </label>
                  </div>
                </div>

                <div className="input-row">
                  <div className="floating-label-group">
                    <input
                      id="state"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.state || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          state: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="state" className="floating-label">
                      State
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      id="city"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.city || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          city: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="city" className="floating-label">
                      City
                    </label>
                  </div>
                </div>

                <div className="input-row">
                  <div className="floating-label-group">
                    <input
                      id="submission_date"
                      type="date"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.submission_date || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          submission_date: e.target.value,
                        })
                      }
                    />
                    <label
                      htmlFor="submission_date"
                      className="floating-label"
                    >
                      Last Date for Submission
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      id="submission_time"
                      type="time"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.submission_time || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          submission_time: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="submission_time" className="floating-label">
                      Up To
                    </label>
                  </div>
                </div>

                <div className="input-row">
                  <div className="floating-label-group">
                    <input
                      id="tender_value"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.tender_value || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          tender_value: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="tender_value" className="floating-label">
                      Tender Value
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      id="tender_source"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.tender_source || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          tender_source: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="tender_source" className="floating-label">
                      Tender Source
                    </label>
                  </div>
                </div>

                <button
                  className="submit-button"
                  onClick={() => handleSubmitSection("tender_details")}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Tender Details"}
                </button>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    backgroundColor: "#5b52bf",
                    padding: "15px 15px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "white",
                      margin: 0,
                    }}
                  >
                    Tender Information
                  </h2>
                </div>

                <div className="input-row">
                  <div className="floating-label-group">
                    <input
                      id="tender_fee"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.tender_fee || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          tender_fee: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="tender_fee" className="floating-label">
                      Tender Fee Amount
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      id="tender_favour_of"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.tender_favour_of || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          tender_favour_of: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="tender_favour_of" className="floating-label">
                      In Favor Of
                    </label>
                  </div>
                </div>

                <div className="input-row">
                  <div className="floating-label-group">
                    <input
                      id="tender_payble_at"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.tender_payble_at || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          tender_payble_at: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="tender_payble_at" className="floating-label">
                      Payable At
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      id="tender_validity"
                      type="date"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.tender_validity || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          tender_validity: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="tender_validity" className="floating-label">
                      Validity
                    </label>
                  </div>
                </div>

                <div className="input-row">
                  <div className="floating-label-group" style={{ flex: "1 1 100%" }}>
                    <select
                      id="mode_tender"
                      className="floating-select"
                      value={selectedTender.mode_tender || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          mode_tender: e.target.value,
                        })
                      }
                    >
                      <option value="" disabled>
                        Select Tender Mode
                      </option>
                      <option value="DD">DD</option>
                      <option value="ONLINE">Online</option>
                      <option value="EXEMPTED">Exempted</option>
                    </select>
                    <label htmlFor="mode_tender" className="floating-label">
                      Tender Mode
                    </label>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    backgroundColor: "#5b52bf",
                    padding: "15px 15px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "white",
                      margin: 0,
                    }}
                  >
                    EMD Information
                  </h2>
                </div>

                <div className="input-row">
                  <div className="floating-label-group">
                    <input
                      id="emd_amount"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.emd_amount || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          emd_amount: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="emd_amount" className="floating-label">
                      EMD Amount
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      id="emd_favour_of"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.emd_favour_of || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          emd_favour_of: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="emd_favour_of" className="floating-label">
                      In Favor Of
                    </label>
                  </div>
                </div>

                <div className="input-row">
                  <div className="floating-label-group">
                    <input
                      id="emd_payble_at"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.emd_payble_at || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          emd_payble_at: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="emd_payble_at" className="floating-label">
                      Payable At
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      id="emd_validity"
                      type="date"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.emd_validity || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          emd_validity: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="emd_validity" className="floating-label">
                      Validity
                    </label>
                  </div>
                </div>

                <div className="input-row">
                  <div className="floating-label-group" style={{ flex: "1 1 100%" }}>
                    <select
                      id="mode_emd"
                      className="floating-select"
                      value={selectedTender.mode_emd || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          mode_emd: e.target.value,
                        })
                      }
                    >
                      <option value="" disabled>
                        Select EMD Mode
                      </option>
                      <option value="DD">DD</option>
                      <option value="FDR">FDR</option>
                      <option value="BG">BG</option>
                      <option value="ONLINE">Online</option>
                      <option value="EXEMPTED">Exempted</option>
                    </select>
                    <label htmlFor="mode_emd" className="floating-label">
                      EMD Mode
                    </label>
                  </div>
                </div>

                <button
                  className="submit-button"
                  onClick={() => handleSubmitSection("tender_emd_info")}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Tender & EMD Information"}
                </button>

                <div className="upload-section">
                  <div className="upload-column">
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#333",
                        marginBottom: "10px",
                      }}
                    >
                      NIT Document
                    </h3>
                    {[...Array(nitUploadCount)].map((_, index) => {
                      const type = "nit";
                      const fileName = selectedTender[`${type}_file_names`]?.[index] || "";
                      const pendingFile = selectedTender[`${type}_pending_files`]?.[index];
                      return (
                        <div key={`${type}-${index}`} className="upload-box">
                          <input
                            type="file"
                            id={`${type}-upload-${index}`}
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, type, index)}
                          />
                          <label htmlFor={`${type}-upload-${index}`}>
                            {fileName || `Upload NIT Document ${index + 1}`}
                          </label>
                          <button
                            className="small-submit-button"
                            onClick={() => {
                              if (pendingFile) {
                                handleSubmitImage(type, pendingFile, index);
                              }
                            }}
                            disabled={!pendingFile || loading}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        </div>
                      );
                    })}
                    <button
                      className="add-more-button"
                      onClick={() => handleAddMore("nit")}
                    >
                      <FaPlus /> Add More
                    </button>
                  </div>

                  <div className="upload-column">
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#333",
                        marginBottom: "10px",
                      }}
                    >
                      Bid Document
                    </h3>
                    {[...Array(bidUploadCount)].map((_, index) => {
                      const type = "bid";
                      const fileName = selectedTender[`${type}_file_names`]?.[index] || "";
                      const pendingFile = selectedTender[`${type}_pending_files`]?.[index];
                      return (
                        <div key={`${type}-${index}`} className="upload-box">
                          <input
                            type="file"
                            id={`${type}-upload-${index}`}
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, type, index)}
                          />
                          <label htmlFor={`${type}-upload-${index}`}>
                            {fileName || `Upload Bid Document ${index + 1}`}
                          </label>
                          <button
                            className="small-submit-button"
                            onClick={() => {
                              if (pendingFile) {
                                handleSubmitImage(type, pendingFile, index);
                              }
                            }}
                            disabled={!pendingFile || loading}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        </div>
                      );
                    })}
                    <button
                      className="add-more-button"
                      onClick={() => handleAddMore("bid")}
                    >
                      <FaPlus /> Add More
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    marginTop: "40px",
                    backgroundColor: "#5b52bf",
                    padding: "15px 15px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "white",
                      margin: 0,
                    }}
                  >
                    Update Tender Further Information Form
                  </h2>
                </div>

                <div className="full-row">
                  <div className="floating-label-group" style={{ flex: "1 1 100%" }}>
                    <select
                      id="tender_submission"
                      className="floating-select"
                      value={selectedTender.tender_submission || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          tender_submission: e.target.value,
                        })
                      }
                    >
                      <option value="" disabled>
                        Tender Submission
                      </option>
                      <option value="online">Online</option>
                      <option value="Physical">Physical</option>
                      <option value="both">Both</option>
                    </select>
                    <label htmlFor="tender_submission" className="floating-label">
                      Tender Submission
                    </label>
                  </div>
                </div>

                <div className="full-row">
                  <div className="floating-label-group" style={{ flex: "1 1 100%" }}>
                    <select
                      id="pre_qualification"
                      className="floating-select"
                      value={selectedTender.pre_qualification || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          pre_qualification: e.target.value,
                        })
                      }
                    >
                      <option value="" disabled>
                        Pre Qualification
                      </option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    <label
                      htmlFor="pre_qualification"
                      className="floating-label"
                    >
                      Pre Qualification
                    </label>
                  </div>
                </div>

                <div className="input-row">
                  <div className="floating-label-group">
                    <input
                      id="document_last_date"
                      type="date"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.document_last_date || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          document_last_date: e.target.value,
                        })
                      }
                    />
                    <label
                      htmlFor="document_last_date"
                      className="floating-label"
                    >
                      Last Date of Document Collection
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      id="document_last_time"
                      type="time"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.document_last_time || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          document_last_time: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="document_last_time" className="floating-label">
                      Up To
                    </label>
                  </div>
                </div>

                <div className="input-row">
                  <div className="floating-label-group">
                    <input
                      id="opening_tender_date"
                      type="date"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.opening_tender_date || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          opening_tender_date: e.target.value,
                        })
                      }
                    />
                    <label
                      htmlFor="opening_tender_date"
                      className="floating-label"
                    >
                      Opening Tender Date
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      id="opening_tender_time"
                      type="time"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.opening_tender_time || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          opening_tender_time: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="opening_tender_time" className="floating-label">
                      At
                    </label>
                  </div>
                </div>

                <hr
                  style={{
                    border: "none",
                    borderBottom: "2px dashed #333",
                    margin: "12px 0",
                  }}
                />

                <div className="input-row">
                  <div className="floating-label-group">
                    <input
                      id="contact_name"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.contact_name || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          contact_name: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="contact_name" className="floating-label">
                      Name
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      id="contact_add"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.contact_add || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          contact_add: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="contact_add" className="floating-label">
                      Address
                    </label>
                  </div>
                </div>

                <div className="input-row">
                  <div className="floating-label-group">
                    <input
                      id="contact_phone"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.contact_phone || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          contact_phone: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="contact_phone" className="floating-label">
                      Phone Office
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      id="contact_email"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={selectedTender.contact_email || ""}
                      onChange={(e) =>
                        setSelectedTender({
                          ...selectedTender,
                          contact_email: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="contact_email" className="floating-label">
                      Email
                    </label>
                  </div>
                </div>

                <button
                  className="submit-button"
                  onClick={() => handleSubmitSection("further_info")}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            )}
          </div>
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