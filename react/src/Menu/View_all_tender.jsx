import { useEffect, useState, useMemo } from "react";
import documentIcon from "assets/images/icons8-document-50.png";
import { useNavigate, useParams } from "react-router-dom";
import { MdVerified } from "react-icons/md";
import { FaArrowUp, FaTimes } from "react-icons/fa";

export default function ViewAllTender() {
  const [selectedBox, setSelectedBox] = useState(() => {
    const savedIndex = localStorage.getItem("selectedBoxIndex");
    return savedIndex ? parseInt(savedIndex) : 0;
  });
  const [tenderData, setTenderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTenderId, setSelectedTenderId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [archiveReason, setArchiveReason] = useState("");
  const [archiveTenderId, setArchiveTenderId] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageTenderId, setMessageTenderId] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isModalOpen12, setIsModalOpen12] = useState(false);
  const [modalStatus, setModalStatus] = useState("");
  const [modalReason, setModalReason] = useState("");
  const [categories, setCategories] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  const { temp_id } = useParams();
  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search
  const [searchValue, setSearchValue] = useState("");
  const emp_id = localStorage.getItem("user_id");
  const user_type = localStorage.getItem("user_type");
  const user_name = localStorage.getItem("name");
  const isOperator = user_type === "Operator";

  const boxTitles = [
    "Upcoming Tenders",
    "Approved Tenders",
    "Tender Submitted",
    "Not Awarded",
    "Tender Awarded",
  ];

  // Helper function to format date
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCheckCircleClick = (tempId) => {
    setSelectedTenderId(tempId);
    setIsModalOpen12(true);
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
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
        setIsModalOpen12(false);
        setModalStatus("");
        setModalReason("");
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

  useEffect(() => {
    const fetchTenderData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_API}/second_approval_list.php`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
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

  useEffect(() => {
    if (selectedBox === null) {
      setTenderData([]);
      return;
    }
    fetchTenders();
  }, [selectedBox]);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      setError(null);
      const savedTempId = localStorage.getItem("temp_id");
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/view_all_tender.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedBoxIndex: selectedBox,
            temp_id: savedTempId || "",
          }),
        }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTenderData(data);
      if (data && data.length > 0 && data[0].temp_id) {
        localStorage.setItem("temp_id", data[0].temp_id);
      }
    } catch (e) {
      console.error("Fetching tenders failed:", e);
      setError("Failed to fetch data. Please check the network.");
      setTenderData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isMessageModalOpen || !messageTenderId) return;
    fetchMessages();
  }, [isMessageModalOpen, messageTenderId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/fetch_messages.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ temp_id: messageTenderId }),
        }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        setMessageHistory(data.messages || []);
      } else {
        showNotification(data.message || "Failed to fetch messages", "error");
      }
    } catch (e) {
      console.error("Failed to fetch messages:", e);
      showNotification("Failed to fetch messages. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return Array.isArray(tenderData)
      ? tenderData.filter(
          (tender) =>
            tender.organisation_name
              ?.toLowerCase()
              .includes(searchValue.toLowerCase()) ||
            tender.work_name?.toLowerCase().includes(searchValue.toLowerCase())
        )
      : [];
  }, [tenderData, searchValue]);

  const currentItems = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleEditClick = (tempId) => {
    setSelectedTenderId(tempId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTenderId(null);
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000);
  };

  const closeNotification = () => setNotification(null);

  const handleOpenModal = (tempId) => {
    const currentTender = tenderData.find((tender) => tender.temp_id === tempId);
    if (!currentTender) {
      showNotification("Tender not found.", "error");
      return;
    }
    const isCurrentlyAble = currentTender.interest === "0";
    setCurrentAction(isCurrentlyAble ? "setAble" : "setNotAble");
    setArchiveTenderId(tempId);
    if (isCurrentlyAble) {
      handleConfirmArchive();
    } else {
      setIsModalOpen(true);
      setArchiveReason("");
      setIsConfirmed(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setArchiveReason("");
    setArchiveTenderId(null);
    setIsConfirmed(false);
    setCurrentAction(null);
  };

  const handleConfirmArchive = async () => {
    const needsReason = currentAction === "setNotAble";
    if (needsReason && !isConfirmed) {
      setIsConfirmed(true);
      return;
    }
    if (needsReason && !archiveReason.trim()) {
      showNotification("Please provide a reason for Not Able To Proceed.", "error");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/not_able_to_proceed_update.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            temp_id: archiveTenderId,
            archive_reason: needsReason ? archiveReason : "",
          }),
        }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        const newInterest = needsReason ? "1" : "0";
        const newReason = needsReason ? archiveReason : "";
        setTenderData((prev) =>
          prev.map((tender) =>
            tender.temp_id === archiveTenderId
              ? { ...tender, interest: newInterest, not_process_reason: newReason }
              : tender
          )
        );
        showNotification(data.message);
        fetchTenders();
      } else {
        showNotification(data.message || "Failed to update tender status", "error");
      }
    } catch (e) {
      console.error("Failed to update tender status:", e);
      showNotification("Failed to update tender status. Please try again.", "error");
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  const handleOpenMessageModal = (tempId) => {
    setMessageTenderId(tempId);
    setMessageContent("");
    setMessageHistory([]);
    setIsMessageModalOpen(true);
  };

  const handleCloseMessageModal = () => {
    setIsMessageModalOpen(false);
    setMessageTenderId(null);
    setMessageContent("");
    setMessageHistory([]);
  };

  const handleSubmitMessage = async () => {
    if (!messageTenderId || !messageContent.trim()) {
      showNotification("Please provide a message.", "error");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/send_message.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            temp_id: messageTenderId,
            message: messageContent,
            emp_id,
            user_name,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            data.message || "Unknown error"
          }`
        );
      }
      if (data.success) {
        showNotification("Message sent successfully", "success");
        const fetchResponse = await fetch(
          `${import.meta.env.VITE_SERVER_API}/fetch_messages.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ temp_id: messageTenderId }),
          }
        );
        const fetchData = await fetchResponse.json();
        if (fetchData.success) {
          setMessageHistory(fetchData.messages || []);
        }
        setMessageContent("");
      } else {
        showNotification(data.message || "Failed to send message", "error");
      }
    } catch (e) {
      console.error("Failed to send message:", e);
      showNotification(`Failed to send message: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleThumbsUp = async (temp_id) => {
    if (!temp_id || isNaN(temp_id)) {
      showNotification("Invalid tender ID", "error");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/awarded.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ temp_id: String(temp_id) }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            data.message || "Unknown error"
          }`
        );
      }
      if (data.success) {
        showNotification(data.message, "success");
        fetchTenders();
      } else {
        showNotification(data.message || "Failed to update thumbs up status", "error");
      }
    } catch (e) {
      console.error("Failed to process thumbs up:", e);
      showNotification(`Failed to process thumbs up: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleThumbsDown = async (temp_id) => {
    if (!temp_id) {
      showNotification("Invalid tender ID", "error");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/not_awarded.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ temp_id: String(temp_id) }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            data.message || "Unknown error"
          }`
        );
      }
      if (data.success) {
        showNotification(data.message, "success");
        setTenderData((prev) =>
          prev.map((tender) =>
            tender.temp_id === temp_id ? { ...tender, awarded: 1 } : tender
          )
        );
        fetchTenders();
      } else {
        showNotification(data.message || "Failed to update thumbs down status", "error");
      }
    } catch (e) {
      console.error("Failed to process thumbs down:", e);
      showNotification(`Failed to process thumbs down: ${e.message}`, "error");
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
      if (!response.ok) throw new Error(data.message || "Unknown error");
      if (data.success) {
        showNotification(data.message, "success");
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

  const handleTenderActionDelete = async (temp_id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this tender?");
    if (!confirmDelete) return;
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/tender_delete.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ temp_id }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unknown error");
      if (data.success) {
        showNotification(data.message, "success");
        setTenderData((prev) => prev.filter((tender) => tender.temp_id !== temp_id));
        fetchTenders();
      } else {
        showNotification(data.message || "Failed to delete tender", "error");
      }
    } catch (e) {
      console.error("Failed to delete tender:", e);
      showNotification("Failed to delete tender. Please try again.", "error");
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
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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

  const handleMarkImportantarchive = async (tempId) => {
    try {
      setLoading(true);
      setError(null);
      const originalTender = tenderData.find((tender) => tender.temp_id === tempId);
      setTenderData((prev) =>
        prev.map((tender) =>
          tender.temp_id === tempId
            ? { ...tender, add_archive: tender.add_archive === "1" ? "0" : "1" }
            : tender
        )
      );
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/add_archive_update.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ temp_id: tempId }),
        }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        showNotification(data.message);
        fetchTenders();
      } else {
        setTenderData((prev) =>
          prev.map((tender) =>
            tender.temp_id === tempId
              ? { ...tender, add_archive: originalTender.add_archive }
              : tender
          )
        );
        showNotification(data.message || "Failed to update archive status", "error");
      }
    } catch (e) {
      console.error("Failed to update archive status:", e);
      setTenderData((prev) =>
        prev.map((tender) =>
          tender.temp_id === tempId
            ? { ...tender, add_archive: originalTender.add_archive }
            : tender
        )
      );
      showNotification("Failed to update archive status. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const cardBgColors = [
    "linear-gradient(90deg, #fffefc 0%, #fff9f2 100%)",
    "linear-gradient(90deg, #f8fcff 0%, #eaf4ff 100%)",
    "linear-gradient(90deg, #f9f5ff 0%, #ece6ff 100%)",
    "linear-gradient(90deg, #fffaf9 0%, #fff4ef 100%)",
    "linear-gradient(90deg, #fff8fb 0%, #ffeef4 100%)",
  ];

  const getCardStyle = (selectedStatus) => ({
    background: selectedStatus !== null ? cardBgColors[selectedStatus] : cardBgColors[0],
    padding: "20px",
    marginBottom: "15px",
    width: "100%",
    boxShadow: "0 6px 12px rgba(0,0,0,0.09)",
    cursor: "pointer",
    transition: "background 0.3s ease, box-shadow 0.3s ease",
    position: "relative",
    borderRadius: "30px",
    minHeight: "200px", // Ensure consistent height to prevent layout shifts
    boxSizing: "border-box",
  });

  return (
    <div style={{ position: "relative" }}>
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "70px",
            right: "20px",
            backgroundColor: notification.type === "success" ? "#4caf50" : "#f44336",
            color: "white",
            padding: "15px 20px",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: "1000px",
          }}
        >
          <span>{notification.message}</span>
          <button
            onClick={closeNotification}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              marginLeft: "10px",
              fontSize: "16px",
            }}
            aria-label="Close notification"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              width: "800px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            <h3 style={{ marginBottom: "15px", color: "#333" }}>
              Are you sure you want to{" "}
              {currentAction === "setNotAble"
                ? "mark this as Not Able to Proceed?"
                : "mark this as Able to Proceed?"}
            </h3>
            {currentAction === "setNotAble" && isConfirmed && (
              <textarea
                style={{
                  width: "100%",
                  minHeight: "150px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  marginBottom: "15px",
                  resize: "vertical",
                }}
                placeholder="Enter reason for Not Able To Proceed..."
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
              />
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={handleConfirmArchive}
                disabled={loading}
              >
                {loading ? "Processing..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isMessageModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              backgroundImage:
                "url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')",
              padding: "20px",
              width: "800px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <h3
              style={{
                marginBottom: "15px",
                color: "#333",
                fontSize: "20px",
                fontWeight: "bold",
                textAlign: "center",
                borderBottom: "1px solid #e0e0e0",
                paddingBottom: "10px",
              }}
            >
              Messages for{" "}
              {messageHistory.length > 0
                ? messageHistory[0].organisation_name
                : "Tender"}
            </h3>
            <div
              className="message-history"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px",
                marginBottom: "15px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {loading && (
                <p style={{ textAlign: "center", color: "#666" }}>
                  Loading messages...
                </p>
              )}
              {error && (
                <p style={{ textAlign: "center", color: "red" }}>{error}</p>
              )}
              {messageHistory.length === 0 && !loading && !error && (
                <p style={{ textAlign: "center", color: "#666" }}>
                  No messages found for this tender.
                </p>
              )}
              {messageHistory.map((msg, index) => (
                <div
                  key={`${msg.temp_id}-${index}`}
                  style={{
                    maxWidth: "60%",
                    alignSelf: msg.user_id === emp_id ? "flex-end" : "flex-start",
                    backgroundColor: msg.user_id === emp_id ? "#007bff" : "#e6ffed",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    margin: "5px 10px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: msg.user_id === emp_id ? "#fff" : "#333",
                    }}
                  >
                    {msg.user_name}
                  </p>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: "14px",
                      color: msg.user_id === emp_id ? "#fff" : "#333",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.comment}
                  </p>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "10px",
                      color: msg.user_id === emp_id ? "#cce5ff" : "#666",
                      textAlign: "right",
                    }}
                  >
                    {new Date(msg.time).toLocaleString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
                  </p>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px",
                borderTop: "1px solid #e0e0e0",
                backgroundColor: "#f9f9f9",
              }}
            >
              <textarea
                style={{
                  flex: 1,
                  minHeight: "40px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "20px",
                  fontSize: "14px",
                  resize: "none",
                  outline: "none",
                }}
                placeholder="Type your message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
              <button
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "20px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
                onClick={handleSubmitMessage}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send"}
              </button>
              <button
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                }}
                onClick={handleCloseMessageModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          width: "100%",
          height: "4px",
          background: "linear-gradient(90deg, #6a5acd 0%, #007bff 100%)",
          margin: "30px 0 10px 0",
          borderRadius: "2px",
        }}
      ></div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          margin: "20px 0",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {boxTitles.map((text, index) => (
          <div
            key={index}
            style={{
              padding: "20px 30px",
              margin: "10px",
              background:
                selectedBox === index
                  ? "linear-gradient(45deg, #6a5acd, #836fff)"
                  : "linear-gradient(45deg, #a0c4ff, #007bff)",
              color: "white",
              cursor: "pointer",
              minWidth: "230px",
              textAlign: "center",
              boxShadow:
                selectedBox === index
                  ? "0 8px 15px rgba(0,0,0,0.3)"
                  : "0 4px 8px rgba(0,0,0,0.1)",
              transition: "background 0.3s ease, box-shadow 0.3s ease",
              // borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => {
              const newIndex = selectedBox === index ? null : index;
              setSelectedBox(newIndex);
              localStorage.setItem("selectedBoxIndex", newIndex);
              setCurrentPage(1);
            }}
          >
            <img
              src={documentIcon}
              alt="Document Icon"
              style={{ width: "40px", height: "40px", marginBottom: "5px" }}
            />
            <div>{text}</div>
          </div>
        ))}
      </div>

      {selectedBox !== null && (
        <div style={{ padding: "20px", minHeight: "400px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                color: "purple",
                fontSize: "26px",
                fontWeight: "bold",
                marginBottom: "10px",
                borderBottom: "2px solid purple",
                paddingBottom: "5px",
                width: "100%",
              }}
            >
              {boxTitles[selectedBox]}
            </h2>
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{
                padding: "8px",
                border: "2px solid purple",
                borderRadius: "18px",
                outline: "none",
                marginLeft: "20px",
                width: "200px",
              }}
            />
          </div>

          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && !error && currentItems.length > 0 && (
            <div>
              {currentItems.map((tender) => (
                <div key={tender.temp_id} style={getCardStyle(selectedBox)}>
                  <span
                    style={{
                      position: "absolute",
                      top: "15px",
                      left: "15px",
                      fontWeight: "bold",
                      color: "#6a5acd",
                    }}
                  >
                    {(currentPage - 1) * itemsPerPage +
                      currentItems.indexOf(tender) +
                      1}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "stretch",
                      gap: "90px",
                      flexDirection: window.innerWidth < 768 ? "column" : "row",
                      minHeight: "180px",
                    }}
                  >
                    <div
                      style={{
                        flex: 2,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        position: "relative",
                        paddingLeft: "20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                          width: "100%",
                          gap: "5px",
                          flexWrap: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            margin: 0,
                            color: "#333",
                            fontSize: "18px",
                            fontWeight: 600,
                            width: "100%",
                            wordBreak: "break-word",
                            whiteSpace: "pre-line",
                            display: "block",
                            flex: 1,
                            lineHeight: 1.3,
                          }}
                        >
                          {tender.organisation_name}
                        </span>
                        <span
                          style={{
                            fontSize: "15px",
                            color: "#333",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "20px",
                          }}
                        >
                          <strong>Value:</strong> ₹{tender.tender_value}
                        </span>
                      </div>
                      <div style={{ marginTop: "4px" }}>
                        <span
                          style={{
                            color: "red",
                            width: "100%",
                            display: "inline-block",
                            wordWrap: "break-word",
                            fontSize: "17px",
                            fontWeight: 100,
                            whiteSpace: "pre-line",
                          }}
                        >
                          <strong
                            style={{
                              color: "#333",
                              fontWeight: 600,
                              fontSize: "16px",
                            }}
                          >
                            Work:
                          </strong>{" "}
                          {tender.work_name}
                        </span>
                      </div>
                      <p style={{ margin: "15px 0 0 0", fontSize: "15px" }}>
                        <strong>BLG Id:</strong>{" "}
                        <span>
                          {tender.temp_id}/{tender.tender_source}/
                          {tender.tender_source_id}
                        </span>
                      </p>
                    </div>

                    <div
                      style={{
                        width: "2px",
                        background:
                          "linear-gradient(180deg, #6a5acd 0%, #007bff 100%)",
                        margin: "0 5px",
                        borderRadius: "2px",
                      }}
                    ></div>

                    <div style={{ position: "relative" }}>
                      {(selectedBox === 0 ||
                        selectedBox === 1 ||
                        selectedBox === 2 ||
                        selectedBox === 3) &&
                        tender.supervise_by && (
                          <span
                            style={{
                              position: "absolute",
                              right: "130px",
                              bottom: "0px",
                              padding: "8px 12px",
                              fontSize: "14px",
                              borderRadius: "15px",
                              backgroundColor: "#ffe4b5",
                              color: "#6a5acd",
                              textAlign: "center",
                              fontWeight: 600,
                              boxShadow: "0 2px 6px rgba(106,90,205,0.07)",
                              zIndex: 3,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {selectedBox !== 4 && (
                              <span style={{ color: "green", fontWeight: 700 }}>
                                {tender.status_label}
                              </span>
                            )}
                            {selectedBox !== 0 && (
                              <>
                                <span>|</span>
                                <span>
                                  Supervisor:{" "}
                                  <span style={{ color: "red" }}>
                                    {tender.supervise_by}
                                  </span>
                                </span>
                              </>
                            )}
                          </span>
                        )}
                    </div>

                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginLeft: "-50px",
                        minHeight: "180px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          textAlign: "left",
                          fontSize: "15px",
                          color: "#555",
                          marginBottom: "10px",
                          marginLeft: "-100px",
                          position: window.innerWidth < 768 ? "static" : "relative",
                        }}
                      >
                        <div>
                          <strong>Location:</strong> {tender.state}, {tender.city}
                        </div>
                        <div>
                          <strong>Submission:</strong> {tender.ndate} /{" "}
                          {tender.submission_time}
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: "18px",
                          display: "grid",
                          gridTemplateColumns:
                            window.innerWidth < 768
                              ? "repeat(1, 44px)"
                              : "repeat(3, 44px)",
                          gridGap: "12px",
                          marginLeft: "-100px",
                          flexDirection: window.innerWidth < 768 ? "column" : "row",
                        }}
                      >
                        {selectedBox === 0 ? (
                          <>
                            {isOperator ? (
                              <>
                                <button
                                  style={{
                                    backgroundColor: "#007bff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    zIndex: 10,
                                  }}
                                  onClick={() =>
                                    navigate(`/Tender_information_view/${tender.temp_id}`)
                                  }
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  style={{
                                    backgroundColor: "#ffc107",
                                    color: "black",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    zIndex: 10,
                                  }}
                                  onClick={() =>
                                    navigate(`/Tender_information_edit/${tender.temp_id}`)
                                  }
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  style={{
                                    backgroundColor:
                                      tender.add_archive === "1" ? "#17a2b8" : "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    zIndex: 10,
                                  }}
                                  onClick={() => handleMarkImportantarchive(tender.temp_id)}
                                  title={
                                    tender.add_archive === "1"
                                      ? "Remove from Archive"
                                      : "Add to Archive"
                                  }
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                  ) : (
                                    <i className="fas fa-file"></i>
                                  )}
                                </button>
                              </>
                            ) : (
                              <>
                                {tender.interest === "0" ? (
                                  <>
                                    <button
                                      style={{
                                        backgroundColor: "#007bff",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "40px",
                                        height: "40px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        zIndex: 10,
                                      }}
                                      onClick={() =>
                                        navigate(`/Tender_information_view/${tender.temp_id}`)
                                      }
                                    >
                                      <i className="fas fa-eye"></i>
                                    </button>
                                    <button
                                      style={{
                                        backgroundColor:
                                          tender.add_archive === "1" ? "#17a2b8" : "#6c757d",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "40px",
                                        height: "40px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        zIndex: 10,
                                      }}
                                      onClick={() => handleMarkImportantarchive(tender.temp_id)}
                                      title={
                                        tender.add_archive === "1"
                                          ? "Remove from Archive"
                                          : "Add to Archive"
                                      }
                                      disabled={loading}
                                    >
                                      {loading ? (
                                        <i className="fas fa-spinner fa-spin"></i>
                                      ) : (
                                        <i className="fas fa-file"></i>
                                      )}
                                    </button>
                                    {tender.status === "1" && (
                                      <button
                                        style={{
                                          backgroundColor: "#ffc107",
                                          color: "#333",
                                          border: "none",
                                          borderRadius: "18px",
                                          width: "100px",
                                          height: "40px",
                                          display: "flex",
                                          justifyContent: "center",
                                          alignItems: "center",
                                          fontWeight: 600,
                                          fontSize: "14px",
                                          cursor: "pointer",
                                          zIndex: 10,
                                        }}
                                        onClick={() => handleTenderActionsubmit(tender.temp_id)}
                                        disabled={loading}
                                      >
                                        {loading ? "Processing..." : "Submit"}
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <button
                                      style={{
                                        backgroundColor: "#007bff",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "40px",
                                        height: "40px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        zIndex: 10,
                                      }}
                                      onClick={() =>
                                        navigate(`/Tender_information_view/${tender.temp_id}`)
                                      }
                                    >
                                      <i className="fas fa-eye"></i>
                                    </button>
                                    <button
                                      style={{
                                        backgroundColor: "#ffc107",
                                        color: "black",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "40px",
                                        height: "40px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        zIndex: 10,
                                      }}
                                      onClick={() =>
                                        navigate(`/Tender_information_edit/${tender.temp_id}`)
                                      }
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                      style={{
                                        backgroundColor: "#dc3545",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "40px",
                                        height: "40px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        zIndex: 10,
                                      }}
                                      onClick={() => handleTenderActionDelete(tender.temp_id)}
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                    <button
                                      style={{
                                        backgroundColor:
                                          tender.add_archive === "1" ? "#17a2b8" : "#6c757d",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "40px",
                                        height: "40px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        zIndex: 10,
                                      }}
                                      onClick={() => handleMarkImportantarchive(tender.temp_id)}
                                      title={
                                        tender.add_archive === "1"
                                          ? "Remove from Archive"
                                          : "Add to Archive"
                                      }
                                      disabled={loading}
                                    >
                                      {loading ? (
                                        <i className="fas fa-spinner fa-spin"></i>
                                      ) : (
                                        <i className="fas fa-file"></i>
                                      )}
                                    </button>
                                    <button
                                      style={{
                                        backgroundColor:
                                          tender.mark_important === "1" ? "#ff5722" : "#6c757d",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "40px",
                                        height: "40px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        zIndex: 10,
                                      }}
                                      onClick={() => handleMarkImportant(tender.temp_id)}
                                      title={
                                        tender.mark_important === "1"
                                          ? "Unmark as Important"
                                          : "Mark as Important"
                                      }
                                      disabled={loading}
                                    >
                                      {loading ? (
                                        <i className="fas fa-spinner fa-spin"></i>
                                      ) : tender.mark_important === "1" ? (
                                        <i className="fas fa-star"></i>
                                      ) : (
                                        <i className="far fa-star"></i>
                                      )}
                                    </button>
                                    <button
                                      style={{
                                        backgroundColor:
                                          tender.interest === "1" ? "#dc3545" : "#28a745",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "40px",
                                        height: "40px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        zIndex: 10,
                                      }}
                                      onClick={() => handleOpenModal(tender.temp_id)}
                                      title={
                                        tender.interest === "1"
                                          ? "Mark as Able to Proceed"
                                          : "Mark as Not Able to Proceed"
                                      }
                                      disabled={loading}
                                    >
                                      {loading ? (
                                        <i className="fas fa-ban"></i>
                                      ) : (
                                        <i
                                          className={
                                            tender.interest === "1"
                                              ? "fas fa-ban"
                                              : "fas fa-ban"
                                          }
                                        ></i>
                                      )}
                                    </button>
                                    {tender.status === "1" && (
                                      <button
                                        style={{
                                          backgroundColor: "#ffc107",
                                          color: "#333",
                                          border: "none",
                                          borderRadius: "18px",
                                          width: "100px",
                                          height: "40px",
                                          display: "flex",
                                          justifyContent: "center",
                                          alignItems: "center",
                                          fontWeight: 600,
                                          fontSize: "14px",
                                          cursor: "pointer",
                                          zIndex: 10,
                                        }}
                                        onClick={() => handleTenderActionsubmit(tender.temp_id)}
                                        disabled={loading}
                                      >
                                        {loading ? "Processing..." : "Submit"}
                                      </button>
                                    )}
                                    <button
                                      style={{
                                        width: "150px",
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
                                      Approve
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </>
                        ) : selectedBox === 1 ? (
                          <>
                            <button
                              style={{
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() =>
                                navigate(`/Tender_information_view/${tender.temp_id}`)
                              }
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              style={{
                                backgroundColor:
                                  tender.add_archive === "1" ? "#17a2b8" : "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() => handleMarkImportantarchive(tender.temp_id)}
                              title={
                                tender.add_archive === "1"
                                  ? "Remove from Archive"
                                  : "Add to Archive"
                              }
                              disabled={loading}
                            >
                              {loading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-file"></i>
                              )}
                            </button>
                            <button
                              style={{
                                backgroundColor:
                                  tender.interest === "1" ? "#dc3545" : "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() => handleOpenModal(tender.temp_id)}
                              title={
                                tender.interest === "1"
                                  ? "Mark as Able to Proceed"
                                  : "Mark as Not Able to Proceed"
                              }
                              disabled={loading}
                            >
                              <i className="fas fa-ban"></i>
                            </button>
                            {tender.interest === "1" && (
                              <>
                                <button
                                  style={{
                                    backgroundColor: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    zIndex: 10,
                                  }}
                                  onClick={() => handleTenderActionDelete(tender.temp_id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                                <button
                                  style={{
                                    backgroundColor: "#ffc107",
                                    color: "black",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    zIndex: 10,
                                  }}
                                  onClick={() =>
                                    navigate(`/Tender_information_edit/${tender.temp_id}`)
                                  }
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  style={{
                                    backgroundColor:
                                      tender.mark_important === "1" ? "#ff5722" : "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    zIndex: 10,
                                  }}
                                  onClick={() => handleMarkImportant(tender.temp_id)}
                                  title={
                                    tender.mark_important === "1"
                                      ? "Unmark as Important"
                                      : "Mark as Important"
                                  }
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                  ) : tender.mark_important === "1" ? (
                                    <i className="fas fa-star"></i>
                                  ) : (
                                    <i className="far fa-star"></i>
                                  )}
                                </button>
                                {Number(tender.status) >= 1 && (
                                  <button
                                    style={{
                                      backgroundColor: "#ffc107",
                                      color: "#333",
                                      border: "none",
                                      borderRadius: "18px",
                                      width: "100px",
                                      height: "40px",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      fontWeight: 600,
                                      fontSize: "14px",
                                      cursor: "pointer",
                                      zIndex: 10,
                                    }}
                                    onClick={() => handleTenderActionsubmit(tender.temp_id)}
                                    disabled={loading}
                                  >
                                    {loading ? "Processing..." : "Submit"}
                                  </button>
                                )}
                              </>
                            )}
                          </>
                        ) : selectedBox === 2 ? (
                          <>
                            <button
                              style={{
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() =>
                                navigate(`/Tender_information_view/${tender.temp_id}`)
                              }
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              style={{
                                backgroundColor: "#ffc107",
                                color: "black",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() =>
                                navigate(`/Tender_information_edit/${tender.temp_id}`)
                              }
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            {tender?.temp_id && (
                              <button
                                style={{
                                  backgroundColor: "#28a745",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "40px",
                                  height: "40px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  cursor: loading ? "not-allowed" : "pointer",
                                  zIndex: 10,
                                  opacity: loading ? 0.6 : 1,
                                }}
                                onClick={() => handleThumbsUp(tender.temp_id)}
                                disabled={loading}
                              >
                                <i className="fas fa-thumbs-up"></i>
                              </button>
                            )}
                            {tender?.temp_id && (
                              <button
                                style={{
                                  backgroundColor: "#dc3545",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "40px",
                                  height: "40px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  cursor: loading ? "not-allowed" : "pointer",
                                  zIndex: 10,
                                  opacity: loading ? 0.6 : 1,
                                }}
                                onClick={() => handleThumbsDown(tender.temp_id)}
                                disabled={loading}
                              >
                                <i className="fas fa-thumbs-down"></i>
                              </button>
                            )}
                            {isOperator && (
                              <button
                                style={{
                                  backgroundColor:
                                    tender.add_archive === "1" ? "#17a2b8" : "#6c757d",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "40px",
                                  height: "40px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  cursor: "pointer",
                                  zIndex: 10,
                                }}
                                onClick={() => handleMarkImportantarchive(tender.temp_id)}
                                title={
                                  tender.add_archive === "1"
                                    ? "Remove from Archive"
                                    : "Add to Archive"
                                }
                                disabled={loading}
                              >
                                {loading ? (
                                  <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                  <i className="fas fa-file"></i>
                                )}
                              </button>
                            )}
                          </>
                        ) : selectedBox === 3 ? (
                          <>
                            <button
                              style={{
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() =>
                                navigate(`/Tender_information_view/${tender.temp_id}`)
                              }
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              style={{
                                backgroundColor: "#ffc107",
                                color: "black",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() =>
                                navigate(`/Tender_information_edit/${tender.temp_id}`)
                              }
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            {isOperator && (
                              <button
                                style={{
                                  backgroundColor:
                                    tender.add_archive === "1" ? "#17a2b8" : "#6c757d",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "40px",
                                  height: "40px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  cursor: "pointer",
                                  zIndex: 10,
                                }}
                                onClick={() => handleMarkImportantarchive(tender.temp_id)}
                                title={
                                  tender.add_archive === "1"
                                    ? "Remove from Archive"
                                    : "Add to Archive"
                                }
                                disabled={loading}
                              >
                                {loading ? (
                                  <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                  <i className="fas fa-file"></i>
                                )}
                              </button>
                            )}
                            <div
                              style={{
                                position: "relative",
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <button
                                style={{
                                  position: "absolute",
                                  left: "2px",
                                  backgroundColor: "#dc3545",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "18px",
                                  width: "100px",
                                  height: "35px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  cursor: "default",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  zIndex: 10,
                                }}
                                disabled
                              >
                                Not Awarded
                              </button>
                            </div>
                          </>
                        ) : selectedBox === 4 ? (
                          <>
                            <button
                              style={{
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() =>
                                navigate(`/Tender_information_view/${tender.temp_id}`)
                              }
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              style={{
                                backgroundColor: "#ffc107",
                                color: "black",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() =>
                                navigate(`/Tender_information_edit/${tender.temp_id}`)
                              }
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              style={{
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() =>
                                navigate(`/Tender_information_view/${tender.temp_id}`)
                              }
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              style={{
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() => handleTenderActionDelete(tender.temp_id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                            <button
                              style={{
                                backgroundColor:
                                  tender.add_archive === "1" ? "#17a2b8" : "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() => handleMarkImportantarchive(tender.temp_id)}
                              title={
                                tender.add_archive === "1"
                                  ? "Remove from Archive"
                                  : "Add to Archive"
                              }
                              disabled={loading}
                            >
                              {loading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-file"></i>
                              )}
                            </button>
                            <button
                              style={{
                                backgroundColor:
                                  tender.mark_important === "1" ? "#ff5722" : "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() => handleMarkImportant(tender.temp_id)}
                              title={
                                tender.mark_important === "1"
                                  ? "Unmark as Important"
                                  : "Mark as Important"
                              }
                              disabled={loading}
                            >
                              {loading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : tender.mark_important === "1" ? (
                                <i className="fas fa-star"></i>
                              ) : (
                                <i className="far fa-star"></i>
                              )}
                            </button>
                            <button
                              style={{
                                backgroundColor:
                                  tender.interest === "1" ? "#dc3545" : "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() => handleOpenModal(tender.temp_id)}
                              title={
                                tender.interest === "1"
                                  ? "Mark as Able to Proceed"
                                  : "Mark as Not Able to Proceed"
                              }
                              disabled={loading}
                            >
                              {loading ? (
                                <i className="fas fa-ban"></i>
                              ) : (
                                <i
                                  className={
                                    tender.interest === "1"
                                      ? "fas fa-ban"
                                      : "fas fa-ban"
                                  }
                                ></i>
                              )}
                            </button>
                            <button
                              style={{
                                backgroundColor: "#ffc107",
                                color: "black",
                                border: "none",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() =>
                                navigate(`/Tender_information_edit/${tender.temp_id}`)
                              }
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </>
                        )}
                      </div>

                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                        }}
                      >
                        {(selectedBox === 0 ||
                          selectedBox === 1 ||
                          Number(tender.status) >= 1) && (
                          <div
                            style={{
                              position: "absolute",
                              right: "10%",
                              bottom: "5%",
                              display: "flex",
                              alignItems: "center",
                              gap: "15px",
                              zIndex: 3,
                            }}
                          >
                            {selectedBox === 1 && Number(tender.status) >= 1 && (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <span
                                  style={{
                                    borderRadius: "50%",
                                    width: "45px",
                                    height: "45px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 2px 8px rgba(76,175,80,0.15)",
                                  }}
                                >
                                  <MdVerified
                                    style={{
                                      color: "green",
                                      fontSize: "40px",
                                    }}
                                  />
                                </span>
                              </span>
                            )}
                            {(selectedBox === 0 || selectedBox === 1) && (
                              <button
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: 0,
                                  position: "relative",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenMessageModal(tender.temp_id);
                                }}
                                title="Send Message"
                              >
                                {messageHistory.message_count > 0 && (
                                  <span
                                    style={{
                                      position: "absolute",
                                      top: -8,
                                      right: -8,
                                      backgroundColor: "red",
                                      color: "white",
                                      borderRadius: "50%",
                                      width: "20px",
                                      height: "20px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                      zIndex: 1,
                                    }}
                                  >
                                    {messageHistory.message_count}
                                  </span>
                                )}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 64 64"
                                  width="50"
                                  height="50"
                                  style={{ marginTop: "4px" }}
                                >
                                  <path
                                    d="M48 8H16c-2.21 0-4 1.79-4 4v28l8-8h28c2.21 0 4-1.79 4-4V12c0-2.21-1.79-4-4-4z"
                                    fill="red"
                                  />
                                  <path
                                    d="M44 12H16c-2.21 0-4 1.79-4 4v28l8-8h28c2.21 0 4-1.79 4-4V16c0-2.21-1.79-4-4-4z"
                                    fill="#6a5acd"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && !error && currentItems.length === 0 && (
            <p>No tenders found.</p>
          )}
        </div>
      )}

      {!loading && !error && currentItems.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
            alignItems: "center",
            transform: "translateY(-25px)",
          }}
        >
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            style={{
              padding: "8px 16px",
              backgroundColor: currentPage === 1 ? "#ccc" : "#007bff",
              color: "#fff",
              border: "none",
              marginRight: "10px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>
          <span style={{ margin: "0 10px" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 16px",
              backgroundColor: currentPage === totalPages ? "#ccc" : "#007bff",
              color: "#fff",
              border: "none",
              marginLeft: "10px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}


      {isModalOpen12 && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            right: isMobile ? "0" : "0", // Responsive positioning
            transform: "translateY(-50%)",
            width: isMobile ? "100%" : "800px", // Full width on small screens
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
              onClick={() => setIsModalOpen12(false)}
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
            backgroundColor: "#6a5acd",
            color: "white",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            zIndex: 1000,
          }}
          aria-label="Scroll to top"
        >
          <FaArrowUp size={20} />
        </button>
      )}
    </div>
  );
}