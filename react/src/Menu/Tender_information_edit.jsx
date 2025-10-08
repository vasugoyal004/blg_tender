import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import fileIcon from "../assets/images/img.png";

function Tender_information_edit({ showNotification, onUpdateSuccess }) {
  const { temp_id } = useParams();
  const [selectedTender, setSelectedTender] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [numNitUploads, setNumNitUploads] = useState(1);
  const [numBidUploads, setNumBidUploads] = useState(1);
  const [notification, setNotification] = useState({ message: "", type: "", visible: false });

  // Handle notification display
  const displayNotification = (message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification({ message: "", type: "", visible: false });
    }, 5000);
  };

  const closeNotification = () => {
    setNotification({ message: "", type: "", visible: false });
  };

  // Format date for frontend display (convert DD/MM/YYYY to YYYY-MM-DD)
  const formatDateForFrontend = (dateString) => {
    if (!dateString) return "";
    dateString = dateString.replace(/[-.]/g, '/');
    const parts = dateString.split('/');
    if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateString; // Already in YYYY-MM-DD or invalid
  };

  useEffect(() => {
    if (!temp_id) {
      setError("No tender ID provided in URL. Please select a tender.");
      return;
    }

    const fetchTenderDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${import.meta.env.VITE_SERVER_API}/tender_information_view.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ temp_id }),
          }
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Network response was not ok: ${response.status}, body: ${text || 'No body'}`);
        }

        const data = await response.json();
        console.log("API Response edit page:", data);
        if (data.error) {
          setError(data.error);
        } else {
          const formattedData = Array.isArray(data) ? data[0] : data;
          if (!formattedData || !Object.keys(formattedData).length) {
            setError("No tender data found for the provided ID.");
            return;
          }
          const nitDocs = Array.isArray(formattedData.nit_documents) ? formattedData.nit_documents : [];
          const bidDocs = Array.isArray(formattedData.bid_documents) ? formattedData.bid_documents : [];
          const updatedTender = {
            ...formattedData,
            submission_date: formatDateForFrontend(formattedData.submission_date) || "",
            document_last_date: formatDateForFrontend(formattedData.document_last_date) || "",
            opening_tender_date: formatDateForFrontend(formattedData.opening_tender_date) || "",
            emd_validity: formatDateForFrontend(formattedData.emd_validity) || "",
            tender_validity: formatDateForFrontend(formattedData.tender_validity) || "",
            submission_time: formattedData.submission_time?.slice(0, 5) || "",
            document_last_time: formattedData.document_last_time?.slice(0, 5) || "",
            opening_tender_time: formattedData.opening_tender_time?.slice(0, 5) || "",
            nit_documents: nitDocs,
            bid_documents: bidDocs,
            mode_tender: formattedData.fee_from || "",
            mode_emd: formattedData.emd_from || "",
          };
          setSelectedTender(updatedTender);
          setNumNitUploads(nitDocs.length || 1);
          setNumBidUploads(bidDocs.length || 1);
        }
      } catch (e) {
        console.error("Fetching tender details failed:", e);
        setError("Failed to fetch tender details: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTenderDetails();
  }, [temp_id]);

  // Handle file upload
  const handleSubmitImage = async (type, file, index) => {
    if (!file || !temp_id) {
      displayNotification("No file or tender selected.", "error");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append(`${type}_files[]`, file);
      formData.append("temp_id", temp_id);
      // Include work_name to ensure WhatsApp message has context
      formData.append("work_name", selectedTender.work_name || "N/A");

      console.log(`Submitting ${type} file:`, file.name);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/update_tender_information.php`,
        {
          method: "POST",
          body: formData,
        }
      );

      let data;
      try {
        data = await response.json();
      } catch (e) {
        const text = await response.text();
        throw new Error(`Failed to parse JSON response: ${e.message}, status: ${response.status}, body: ${text || 'No body'}`);
      }

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}, message: ${data.message || 'No message'}`);
      }

      if (data.success) {
        displayNotification(`${type.toUpperCase()} document uploaded successfully`, "success");
        const fetchResponse = await fetch(
          `${import.meta.env.VITE_SERVER_API}/tender_information_view.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ temp_id }),
          }
        );

        if (!fetchResponse.ok) {
          const text = await fetchResponse.text();
          throw new Error(`Network response was not ok: ${fetchResponse.status}, body: ${text || 'No body'}`);
        }

        const fetchData = await fetchResponse.json();
        if (!fetchData.error) {
          const updatedData = Array.isArray(fetchData) ? fetchData[0] : fetchData;
          const nitDocs = Array.isArray(updatedData.nit_documents) ? updatedData.nit_documents : [];
          const bidDocs = Array.isArray(updatedData.bid_documents) ? updatedData.bid_documents : [];
          setSelectedTender((prev) => ({
            ...prev,
            nit_documents: nitDocs,
            bid_documents: bidDocs,
            [`${type}_document${index}`]: null,
          }));
          setNumNitUploads(nitDocs.length || 1);
          setNumBidUploads(bidDocs.length || 1);
        }
      } else {
        displayNotification(data.message || `Failed to upload ${type} document`, "error");
      }
    } catch (e) {
      console.error(`Failed to upload ${type} document:`, e);
      displayNotification(`Failed to upload ${type} document: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle removing upload box
  const handleRemoveUploadBox = (type, index) => {
    if (type === "nit") {
      setNumNitUploads((prev) => Math.max(1, prev - 1));
      setSelectedTender((prev) => {
        const newTender = { ...prev };
        delete newTender[`${type}_document${index}`];
        return newTender;
      });
    } else if (type === "bid") {
      setNumBidUploads((prev) => Math.max(1, prev - 1));
      setSelectedTender((prev) => {
        const newTender = { ...prev };
        delete newTender[`${type}_document${index}`];
        return newTender;
      });
    }
  };

  // Handle section submission
  const handleSubmitSection = async (section) => {
    if (!temp_id) {
      displayNotification("No tender selected.", "error");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("temp_id", temp_id);

      if (section === "tender_details") {
        formData.append("organisation_name", selectedTender.organisation_name || "");
        formData.append("work_name", selectedTender.work_name || "");
        formData.append("submission_date", selectedTender.submission_date || "");
        formData.append("submission_time", selectedTender.submission_time ? `${selectedTender.submission_time}:00` : "");
        formData.append("tender_value", selectedTender.tender_value || "");
        formData.append("tender_source", selectedTender.tender_source || "");
        formData.append("tender_source_id", selectedTender.tender_source_id || "");
        formData.append("state", selectedTender.state || "");
        formData.append("city", selectedTender.city || "");
      } else if (section === "tender_emd_info") {
        // Include all fields to ensure WhatsApp trigger
        formData.append("organisation_name", selectedTender.organisation_name || "");
        formData.append("work_name", selectedTender.work_name || "");
        formData.append("tender_fee", selectedTender.tender_fee || "");
        formData.append("tender_favour_of", selectedTender.tender_favour_of || "");
        formData.append("tender_payble_at", selectedTender.tender_payble_at || "");
        formData.append("tender_validity", selectedTender.tender_validity || "");
        formData.append("fee_from_of", selectedTender.mode_tender ? selectedTender.mode_tender.toUpperCase() : "");
        formData.append("emd_amount", selectedTender.emd_amount || "");
        formData.append("emd_favour_of", selectedTender.emd_favour_of || "");
        formData.append("emd_payble_at", selectedTender.emd_payble_at || "");
        formData.append("emd_validity", selectedTender.emd_validity || "");
        formData.append("emd_from", selectedTender.mode_emd ? selectedTender.mode_emd.toUpperCase() : "");
      } else if (section === "further_info") {
        const nitFiles = Object.entries(selectedTender)
          .filter(([key, value]) => key.startsWith("nit_document") && value instanceof File)
          .map(([_, value]) => value);
        const bidFiles = Object.entries(selectedTender)
          .filter(([key, value]) => key.startsWith("bid_document") && value instanceof File)
          .map(([_, value]) => value);

        nitFiles.forEach((file) => formData.append("nit_files[]", file));
        bidFiles.forEach((file) => formData.append("bid_files[]", file));

        // Include work_name for WhatsApp message context
        formData.append("work_name", selectedTender.work_name || "");
        formData.append("tender_submission", selectedTender.tender_submission || "");
        formData.append("pre_qualification", selectedTender.pre_qualification || "");
        formData.append("document_last_date", selectedTender.document_last_date || "");
        formData.append("document_last_time", selectedTender.document_last_time ? `${selectedTender.document_last_time}:00` : "");
        formData.append("opening_tender_date", selectedTender.opening_tender_date || "");
        formData.append("opening_tender_time", selectedTender.opening_tender_time ? `${selectedTender.opening_tender_time}:00` : "");
        formData.append("contact_name", selectedTender.contact_name || "");
        formData.append("contact_add", selectedTender.contact_add || "");
        formData.append("contact_phone", selectedTender.contact_phone || "");
        formData.append("contact_email", selectedTender.contact_email || "");
      }

      // Log formData for debugging
      const debugEntries = {};
      for (const [k, v] of formData.entries()) {
        debugEntries[k] = v instanceof File ? v.name : v;
      }
      console.log(`Submitting ${section} FormData:`, debugEntries);

      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/update_tender_information.php`, {
        method: "POST",
        body: formData,
      });

      const rawText = await response.text();
      let data;
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (err) {
        console.error("Response is not valid JSON:", rawText);
        throw new Error(`Server returned non-JSON response (status ${response.status}): ${rawText}`);
      }

      if (!response.ok) {
        const serverMessage = data.message || `Status ${response.status}`;
        throw new Error(`Network response was not ok: ${serverMessage}`);
      }

      if (data.success) {
        displayNotification("Data updated successfully", "success");

        // Fetch updated data
        const fetchResponse = await fetch(`${import.meta.env.VITE_SERVER_API}/tender_information_view.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ temp_id }),
        });

        const fetchRaw = await fetchResponse.text();
        let fetchData;
        try {
          fetchData = fetchRaw ? JSON.parse(fetchRaw) : {};
        } catch (err) {
          throw new Error(`Failed to parse tender_information_view response as JSON (status ${fetchResponse.status}).`);
        }

        if (!fetchResponse.ok) {
          throw new Error(`Failed to fetch updated data: ${fetchData.message || fetchResponse.status}`);
        }

        const updatedData = Array.isArray(fetchData) ? fetchData[0] : fetchData;
        const nitDocs = Array.isArray(updatedData.nit_documents) ? updatedData.nit_documents : [];
        const bidDocs = Array.isArray(updatedData.bid_documents) ? updatedData.bid_documents : [];

        const clearedTender = {
          ...selectedTender,
          ...updatedData,
          submission_date: formatDateForFrontend(updatedData.submission_date) || "",
          document_last_date: formatDateForFrontend(updatedData.document_last_date) || "",
          opening_tender_date: formatDateForFrontend(updatedData.opening_tender_date) || "",
          emd_validity: formatDateForFrontend(updatedData.emd_validity) || "",
          tender_validity: formatDateForFrontend(updatedData.tender_validity) || "",
          submission_time: (updatedData.submission_time || "").slice(0, 5),
          document_last_time: (updatedData.document_last_time || "").slice(0, 5),
          opening_tender_time: (updatedData.opening_tender_time || "").slice(0, 5),
          nit_documents: nitDocs,
          bid_documents: bidDocs,
          mode_tender: updatedData.fee_from || "",
          mode_emd: updatedData.emd_from || "",
        };

        // Clear file inputs
        if (section === "further_info" || section === "tender_emd_info" || section === "tender_details") {
          for (let i = 0; i < Math.max(numNitUploads, numBidUploads); i++) {
            clearedTender[`nit_document${i}`] = null;
            clearedTender[`bid_document${i}`] = null;
          }
        }

        setSelectedTender(clearedTender);
        setNumNitUploads(nitDocs.length || 1);
        setNumBidUploads(bidDocs.length || 1);
        if (onUpdateSuccess) onUpdateSuccess();
      } else {
        displayNotification(data.message || `Failed to update ${section}`, "error");
      }
    } catch (e) {
      console.error(`Failed to submit ${section}:`, e);
      displayNotification(`Failed to update ${section}: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      <style>
        {`
          .form-container {
            display: flex;
            flex-direction: column;
            gap: 30px;
          }
          .form-section {
            background-color: #f9f9f9;
            padding: 30px;
            border: 1px solid #ccc;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            width: 50%;
            text-align: left;
            margin-bottom: 10px;
            background-color: #bfbfea;
            padding: 15px;
            border-radius: 18px;
            margin-top: 20px;
          }
          .section-content {
            flex-grow: 1;
          }
          .input-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }
          .tender-emd-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }
          .input-group {
            display: flex;
            flex-direction: column;
          }
          .input-group label {
            font-size: 14px;
            color: #333;
            margin-bottom: 8px;
            font-weight: 500;
          }
          .input-group input,
          .input-group select,
          .input-group textarea {
            padding: 12px 0;
            border: none;
            border-bottom: 1px solid #ccc;
            font-size: 14px;
            width: 100%;
            box-sizing: border-box;
            background-color: transparent;
            transition: border-bottom-color 0.3s ease;
          }
          .input-group input:focus,
          .input-group select:focus,
          .input-group textarea:focus {
            border-bottom-color: #5b52bf;
            outline: none;
          }
          .input-group textarea {
            resize: vertical;
            min-height: 100px;
          }
          .input-group input:disabled,
          .input-group select:disabled,
          .input-group textarea:disabled {
            background-color: transparent;
            cursor: not-allowed;
            border-bottom-color: #eee;
          }
          .upload-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
          }
          .upload-group {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          .upload-box {
            border: 1px solid #ccc;
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #fff;
            position: relative;
          }
          .upload-box input[type="file"] {
            display: none;
          }
          .upload-box label {
            font-size: 14px;
            color: #555;
            cursor: pointer;
            flex-grow: 1;
          }
          .file-name {
            font-size: 14px;
            color: #333;
            margin-right: 10px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 200px;
          }
          .submit-button {
            background-color: #28a745;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s ease;
            align-self: flex-end;
          }
          .submit-button:hover {
            background-color: #218838;
          }
          .submit-button:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
          }
          .small-submit-button {
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s ease;
            margin-left: 10px;
          }
          .small-submit-button:hover {
            background-color: #0069d9;
          }
          .small-submit-button:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
          }
          .remove-button {
            background-color: #dc3545;
            color: white;
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s ease;
            margin-left: 10px;
          }
          .remove-button:hover {
            background-color: #c82333;
          }
          .add-more-button {
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s ease;
            align-self: flex-end;
            margin-top: 18px;
          }
          .add-more-button:hover {
            background-color: #0069d9;
          }
          .notification {
            position: fixed;
            top: 70px;
            right: 20px;
            padding: 15px 20px;
            color: white;
            font-size: 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 9999;
            max-width: 1000px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .notification.success {
            background-color: #28a745;
          }
          .notification.error {
            background-color: #dc3545;
          }
          .notification-close {
            width: 100%;
            height: 2px;
            background-color: white;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          .notification-close:hover {
            background-color: #ddd;
          }
          .file-display {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            color: #333;
            margin-left: 10px;
          }
          .file-display img {
            max-width: 50px;
            max-height: 50px;
            object-fit: contain;
          }
          .file-display a {
            color: #007bff;
            text-decoration: none;
          }
          .file-display a:hover {
            text-decoration: underline;
          }
          .file-display .error {
            color: #dc3545;
            font-size: 12px;
          }
          .upload-container {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          @media (max-width: 1024px) {
            .input-row,
            .upload-section {
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            }
            .tender-emd-container {
              grid-template-columns: 1fr;
            }
          }
          @media (max-width: 768px) {
            .input-row,
            .upload-section {
              grid-template-columns: 1fr;
            }
            .form-section {
              padding: 20px;
              flex-direction: column;
            }
            .section-title {
              width: 100%;
              margin-bottom: 10px;
            }
            .notification {
              right: 10px;
              min-width: 150px;
              max-width: 250px;
            }
          }
          @media (max-width: 480px) {
            .section-title {
              font-size: 14px;
            }
            .input-group label {
              font-size: 13px;
            }
            .input-group input,
            .input-group select,
            .input-group textarea {
              font-size: 13px;
            }
            .submit-button,
            .add-more-button {
              padding: 10px 20px;
              font-size: 13px;
            }
            .notification {
              top: 10px;
              right: 10px;
              padding: 10px 15px;
              font-size: 12px;
              min-width: 120px;
              max-width: 200px;
            }
            .file-display img {
              max-width: 40px;
              max-height: 40px;
            }
          }
        `}
      </style>

      <div className="form-container">
        {notification.visible && (
          <div className={`notification ${notification.type}`}>
            <span>{notification.message}</span>
            <div className="notification-close" onClick={closeNotification}></div>
          </div>
        )}
        {loading && <p>Loading tender details...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!selectedTender && !loading && !error && (
          <p>No tender data available. Please try again.</p>
        )}
        {selectedTender && (
          <>
            {/* Tender Details Section */}
            <h2 className="section-title">Tender Details</h2>
            <div className="form-section">
              <div className="section-content">
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="work-name">Work Name</label>
                    <textarea
                      id="work-name"
                      value={selectedTender.work_name || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, work_name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="organisation-name">Organisation Name</label>
                    <input
                      id="organisation-name"
                      type="text"
                      value={selectedTender.organisation_name || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, organisation_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="tender_source_id">Tender Source ID</label>
                    <input
                      id="tender_source_id"
                      type="text"
                      value={selectedTender.tender_source_id || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, tender_source_id: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="state">State</label>
                    <input
                      id="state"
                      type="text"
                      value={selectedTender.state || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, state: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      type="text"
                      value={selectedTender.city || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, city: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="submission_date">Last Date for Submission</label>
                    <input
                      id="submission_date"
                      type="date"
                      value={selectedTender.submission_date || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, submission_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="submission_time">Up To</label>
                    <input
                      id="submission_time"
                      type="time"
                      value={selectedTender.submission_time || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, submission_time: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="tender_value">Tender Value</label>
                    <input
                      id="tender_value"
                      type="text"
                      value={selectedTender.tender_value || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, tender_value: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="tender_source">Tender Source</label>
                    <input
                      id="tender_source"
                      type="text"
                      value={selectedTender.tender_source || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, tender_source: e.target.value })
                      }
                    />
                  </div>
                </div>
                <button
                  className="submit-button"
                  onClick={() => handleSubmitSection("tender_details")}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>

            {/* Tender and EMD Information Sections */}
            <h2 className="section-title">Tender & EMD Information</h2>
            <div className="form-section">
              <div className="section-content">
                <div className="tender-emd-container">
                  <div>
                    <div className="input-row">
                      <div className="input-group">
                        <label htmlFor="tender_fee">Tender Fee Amount</label>
                        <input
                          id="tender_fee"
                          type="text"
                          value={selectedTender.tender_fee || ""}
                          onChange={(e) =>
                            setSelectedTender({ ...selectedTender, tender_fee: e.target.value })
                          }
                        />
                      </div>
                      <div className="input-group">
                        <label htmlFor="tender_favour_of">In Favor Of</label>
                        <input
                          id="tender_favour_of"
                          type="text"
                          value={selectedTender.tender_favour_of || ""}
                          onChange={(e) =>
                            setSelectedTender({ ...selectedTender, tender_favour_of: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="input-row">
                      <div className="input-group">
                        <label htmlFor="tender_payble_at">Payable At</label>
                        <input
                          id="tender_payble_at"
                          type="text"
                          value={selectedTender.tender_payble_at || ""}
                          onChange={(e) =>
                            setSelectedTender({ ...selectedTender, tender_payble_at: e.target.value })
                          }
                        />
                      </div>
                      <div className="input-group">
                        <label htmlFor="tender_validity">Validity</label>
                        <input
                          id="tender_validity"
                          type="date"
                          value={selectedTender.tender_validity || ""}
                          onChange={(e) =>
                            setSelectedTender({ ...selectedTender, tender_validity: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="input-row">
                      <div className="input-group">
                        <label htmlFor="mode_tender">Tender Mode</label>
                        <select
                          id="mode_tender"
                          value={selectedTender.mode_tender || ""}
                          onChange={(e) =>
                            setSelectedTender({ ...selectedTender, mode_tender: e.target.value })
                          }
                        >
                          <option value="" disabled>
                            Select Tender Mode
                          </option>
                          <option value="DD">DD</option>
                          <option value="ONLINE">Online</option>
                          <option value="EXEMPTED">Exempted</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="input-row">
                      <div className="input-group">
                        <label htmlFor="emd_amount">EMD Amount</label>
                        <input
                          id="emd_amount"
                          type="text"
                          value={selectedTender.emd_amount || ""}
                          onChange={(e) =>
                            setSelectedTender({ ...selectedTender, emd_amount: e.target.value })
                          }
                        />
                      </div>
                      <div className="input-group">
                        <label htmlFor="emd_favour_of">In Favor Of</label>
                        <input
                          id="emd_favour_of"
                          type="text"
                          value={selectedTender.emd_favour_of || ""}
                          onChange={(e) =>
                            setSelectedTender({ ...selectedTender, emd_favour_of: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="input-row">
                      <div className="input-group">
                        <label htmlFor="emd_payble_at">Payable At</label>
                        <input
                          id="emd_payble_at"
                          type="text"
                          value={selectedTender.emd_payble_at || ""}
                          onChange={(e) =>
                            setSelectedTender({ ...selectedTender, emd_payble_at: e.target.value })
                          }
                        />
                      </div>
                      <div className="input-group">
                        <label htmlFor="emd_validity">Validity</label>
                        <input
                          id="emd_validity"
                          type="date"
                          value={selectedTender.emd_validity || ""}
                          onChange={(e) =>
                            setSelectedTender({ ...selectedTender, emd_validity: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="input-row">
                      <div className="input-group">
                        <label htmlFor="mode_emd">EMD Mode</label>
                        <select
                          id="mode_emd"
                          value={selectedTender.mode_emd || ""}
                          onChange={(e) =>
                            setSelectedTender({ ...selectedTender, mode_emd: e.target.value })
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
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  className="submit-button"
                  onClick={() => handleSubmitSection("tender_emd_info")}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>

            {/* Document Upload Section */}
            <h2 className="section-title">Document Upload</h2>
            <div className="form-section">
              <div className="section-content">
                <div className="upload-section">
                  <div className="upload-group">
                    <h3 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px" }}>
                      NIT Document
                    </h3>
                    {[...Array(numNitUploads)].map((_, index) => {
                      const key = `nit_document${index}`;
                      const file = selectedTender[key];
                      const uploadedFileName = selectedTender.nit_documents?.[index];
                      return (
                        <div key={`nit-${index}`} className="upload-container">
                          <div className="upload-box">
                            <input
                              type="file"
                              id={`nit-upload-${index}`}
                              accept="image/jpeg,image/png,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setSelectedTender((prev) => ({ ...prev, [key]: file }));
                                }
                              }}
                            />
                            <label htmlFor={`nit-upload-${index}`}>
                              {file instanceof File
                                ? file.name
                                : uploadedFileName
                                ? `Uploaded: ${uploadedFileName.split('?')[0].split('/').pop()}`
                                : `Upload NIT Document ${index + 1}`}
                            </label>
                            {file instanceof File && (
                              <button
                                className="small-submit-button"
                                onClick={() => handleSubmitImage("nit", file, index)}
                                disabled={loading}
                              >
                                {loading ? "Uploading..." : <i className="fas fa-check"></i>}
                              </button>
                            )}
                            {numNitUploads > 1 && (
                              <button
                                className="remove-button"
                                onClick={() => handleRemoveUploadBox("nit", index)}
                                title="Remove this upload box"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            )}
                          </div>
                          {uploadedFileName && (
                            <div className="file-display">
                              <a
                                href={uploadedFileName}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={fileIcon}
                                  alt="Document"
                                  style={{ maxWidth: '50px', maxHeight: '50px', objectFit: 'contain' }}
                                />
                              </a>
                              <span className="file-name">{uploadedFileName.split('?')[0].split('/').pop()}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button
                      className="add-more-button"
                      onClick={() => setNumNitUploads((prev) => prev + 1)}
                    >
                      Add More
                    </button>
                  </div>
                  <div className="upload-group">
                    <h3 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px" }}>
                      Bid Document
                    </h3>
                    {[...Array(numBidUploads)].map((_, index) => {
                      const key = `bid_document${index}`;
                      const file = selectedTender[key];
                      const uploadedFileName = selectedTender.bid_documents?.[index];
                      return (
                        <div key={`bid-${index}`} className="upload-container">
                          <div className="upload-box">
                            <input
                              type="file"
                              id={`bid-upload-${index}`}
                              accept="image/jpeg,image/png,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setSelectedTender((prev) => ({ ...prev, [key]: file }));
                                }
                              }}
                            />
                            <label htmlFor={`bid-upload-${index}`}>
                              {file instanceof File
                                ? file.name
                                : uploadedFileName
                                ? `Uploaded: ${uploadedFileName.split('?')[0].split('/').pop()}`
                                : `Upload Bid Document ${index + 1}`}
                            </label>
                            {file instanceof File && (
                              <button
                                className="small-submit-button"
                                onClick={() => handleSubmitImage("bid", file, index)}
                                disabled={loading}
                              >
                                {loading ? "Uploading..." : <i className="fas fa-check"></i>}
                              </button>
                            )}
                            {numBidUploads > 1 && (
                              <button
                                className="remove-button"
                                onClick={() => handleRemoveUploadBox("bid", index)}
                                title="Remove this upload box"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            )}
                          </div>
                          {uploadedFileName && (
                            <div className="file-display">
                              <a
                                href={uploadedFileName}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={fileIcon}
                                  alt="Document"
                                  style={{ maxWidth: '50px', maxHeight: '50px', objectFit: 'contain' }}
                                />
                              </a>
                              <span className="file-name">{uploadedFileName.split('?')[0].split('/').pop()}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button
                      className="add-more-button"
                      onClick={() => setNumBidUploads((prev) => prev + 1)}
                    >
                      Add More
                    </button>
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
            </div>

            {/* Further Information Section */}
            <h2 className="section-title">Further Information</h2>
            <div className="form-section">
              <div className="section-content">
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="tender_submission">Tender Submission</label>
                    <select
                      id="tender_submission"
                      value={selectedTender.tender_submission || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, tender_submission: e.target.value })
                      }
                    >
                      <option value="" disabled>
                        Tender Submission
                      </option>
                      <option value="online">Online</option>
                      <option value="Physical">Physical</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label htmlFor="pre_qualification">Pre Qualification</label>
                    <select
                      id="pre_qualification"
                      value={selectedTender.pre_qualification || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, pre_qualification: e.target.value })
                      }
                    >
                      <option value="" disabled>
                        Pre Qualification
                      </option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="document_last_date">Last Date of Document Collection</label>
                    <input
                      id="document_last_date"
                      type="date"
                      value={selectedTender.document_last_date || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, document_last_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="document_last_time">Up To</label>
                    <input
                      id="document_last_time"
                      type="time"
                      value={selectedTender.document_last_time || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, document_last_time: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="opening_tender_date">Opening Tender Date</label>
                    <input
                      id="opening_tender_date"
                      type="date"
                      value={selectedTender.opening_tender_date || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, opening_tender_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="opening_tender_time">At</label>
                    <input
                      id="opening_tender_time"
                      type="time"
                      value={selectedTender.opening_tender_time || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, opening_tender_time: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="contact_name">Name</label>
                    <input
                      id="contact_name"
                      type="text"
                      value={selectedTender.contact_name || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, contact_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="contact_add">Address</label>
                    <input
                      id="contact_add"
                      type="text"
                      value={selectedTender.contact_add || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, contact_add: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="contact_phone">Phone Office</label>
                    <input
                      id="contact_phone"
                      type="text"
                      value={selectedTender.contact_phone || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, contact_phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="contact_email">Email</label>
                    <input
                      id="contact_email"
                      type="text"
                      value={selectedTender.contact_email || ""}
                      onChange={(e) =>
                        setSelectedTender({ ...selectedTender, contact_email: e.target.value })
                      }
                    />
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Tender_information_edit;