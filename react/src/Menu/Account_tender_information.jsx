import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaPaperPlane,
  FaMoneyCheckAlt,
  FaFileInvoice,
  FaMoneyBillWave,
  FaFileContract,
  FaAward,
  FaHandshake,
  FaBars,
  FaTimes,
  FaImage,
} from "react-icons/fa";
import fileIcon from "../assets/images/img.png";

export default function AccountTenderInformation() {
  const { temp_id } = useParams();
  const [tenderData, setTenderData] = useState(null);
  const [emdData, setEmdData] = useState(null);
  const [popuptenderData, setPopuptenderData] = useState(null);
  const [popupPgData, setPopupPgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenemd, setIsModalOpenemd] = useState(false);
  const [isModalOpentender, setIsModalOpentender] = useState(false);
  const [isModalOpenpg, setIsModalOpenpg] = useState(false);
  const [refundDate, setRefundDate] = useState("");
  const [file, setFile] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "", visible: false });
  const navigate = useNavigate();

  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";
    try {
      const [day, month, year] = dateStr.includes("-")
        ? dateStr.split("-")
        : dateStr.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateStr;
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification({ message: "", type: "", visible: false });
    }, 3000);
  };

  const handleEMDRefundSubmit = async (e) => {
    e.preventDefault();
    if (!refundDate) {
      showNotification("Please select a refund date.", "error");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/pop_emd_refund_update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({
          temp_id,
          refund_date: refundDate,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit EMD refund.");
      }

      showNotification("EMD Refund submitted successfully!", "success");
      setIsModalOpen(false);
      setRefundDate("");
    } catch (err) {
      console.error("EMD Refund error:", err);
      showNotification(`Error: ${err.message}`, "error");
    }
  };


const handleEMDFileSubmit = async (e) => {
    e.preventDefault();
    console.log("temp_id:", temp_id);
    console.log("file:", file);
    if (!file) {
        showNotification("Please select an image file to upload.", "error");
        return;
    }

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(file.type)) {
        showNotification("Please upload a valid image file (JPEG, PNG, or GIF).", "error");
        return;
    }

    const formData = new FormData();
    formData.append("temp_id", temp_id);
    formData.append("emd_doc", file);

    try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_API}/popup_emd_file_update.php`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to upload image.");
        }

        showNotification("Image uploaded successfully!", "success");
        setIsModalOpenemd(false);
        setFile(null);
        fetchEmdData();
    } catch (err) {
        console.error("Image upload error:", err);
        showNotification(`Error: ${err.message}`, "error");
    }
};




  const fetchEmdData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/popup_emd.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({ temp_id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch EMD details.");
      }

      if (data.success && data.data && data.data.length > 0) {
        setEmdData(data.data[0]);
      } else {
        setEmdData(null);
      }
    } catch (err) {
      console.error("Fetch EMD data error:", err);
      showNotification(`Error: ${err.message}`, "error");
    }
  };


  const fetchTenderData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/popup_tender.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({ temp_id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch Tender details.");
      }

      if (data.success && data.data && data.data.length > 0) {
        setPopuptenderData(data.data[0]);
      } else {
        setPopuptenderData(null);
      }
    } catch (err) {
      console.error("Fetch Tender data error:", err);
      showNotification(`Error: ${err.message}`, "error");
    }
  };


    const fetchPgData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/performance_guarantee.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({ temp_id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch Performance Guarantee details.");
      }

      if (data.success && data.data && data.data.length > 0) {
        setPopupPgData(data.data[0]);
      } else {
        setPopupPgData(null);
      }
    } catch (err) {
      console.error("Fetch  Performance Guarantee data error:", err);
      showNotification(`Error: ${err.message}`, "error");
    }
  };

  const btnStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 15px",
    background: "#81ecb1",
    color: "black",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
    width: "100%",
    justifyContent: "center",
  };

  useEffect(() => {
    if (!temp_id) {
      setError("No tender ID provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetch(`${import.meta.env.VITE_SERVER_API}/tender_information_view.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      body: JSON.stringify({ temp_id }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          const formattedData = Array.isArray(data) ? data[0] || data : data;
          const updatedTender = {
            ...formattedData,
            submission_date: formatDateToDDMMYYYY(formattedData.submission_date || ""),
            document_last_date: formatDateToDDMMYYYY(formattedData.document_last_date || ""),
            opening_tender_date: formatDateToDDMMYYYY(formattedData.opening_tender_date || ""),
            emd_validity: formatDateToDDMMYYYY(formattedData.emd_validity || ""),
            tender_validity: formatDateToDDMMYYYY(formattedData.tender_validity || ""),
            pre_bid_meet_date: formatDateToDDMMYYYY(formattedData.pre_bid_meet_date || ""),
            sale_date: formatDateToDDMMYYYY(formattedData.sale_date || ""),
            submission_time: (formattedData.submission_time || "").slice(0, 5),
            document_last_time: (formattedData.document_last_time || "").slice(0, 5),
            opening_tender_time: (formattedData.opening_tender_time || "").slice(0, 5),
            nit_file_names: formattedData.nit_file_names || [],
            bid_file_names: formattedData.bid_file_names || [],
            nit_pending_files: {},
            bid_pending_files: {},
          };
          setTenderData(updatedTender);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(`Failed to fetch data: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, [temp_id]);

  useEffect(() => {
    if (isModalOpenemd) {
      fetchEmdData();
    }
  }, [isModalOpenemd]);

  
  useEffect(() => {
    if (isModalOpentender) {
      fetchTenderData();
    }
  }, [isModalOpentender]);


    useEffect(() => {
    if (isModalOpenpg) {
      fetchPgData();
    }
  }, [isModalOpenpg]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <div className="text-lg">{error}</div>
      </div>
    );
  }

  if (!tenderData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">No data available.</div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          .modal-content {
            background: white;
            padding: 24px;
            width: 90%;
            max-width: 900px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }
          .modal-header h2 {
            font-size: 1.25rem;
            font-weight: 600;
          }
          .modal-close-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: #4b5563;
          }
          .modal-close-btn:hover {
            color: #1f2937;
          }
          .modal-field {
            margin-bottom: 16px;
          }
          .modal-field label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: #374151;
            margin-bottom: 4px;
          }
          .modal-field input {
            width: 100%;
            padding: 8px;
            border: 1px solid #d1d5db;
            font-size: 1rem;
          }
          .modal-field input[readonly] {
            background: #f3f4f6;
          }
          .modal-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
          }
          .modal-btn-cancel {
            padding: 8px 16px;
            background: #d1d5db;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            color: #374151;
          }
          .modal-btn-cancel:hover {
            background: #9ca3af;
          }
          .modal-btn-submit {
            padding: 12px 16px;
            background: #81ecb1;
            border: none;
            // border-radius: 4px;
            cursor: pointer;
            color: black;
            top: 10px;
          }
          .modal-btn-submit:hover {
            background: #6bd89b;
          }
          .notification {
            position: fixed;
            top: 190px;
            right: 720px;
            padding: 12px 24px;
            background: #333;
            color: #fff;
            font-weight: 500;
            z-index: 9999;
            transition: opacity 0.3s ease, transform 0.3s ease;
            transform: translateY(0);
            opacity: 1;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }
          .notification.success {
            background: green;
            color: white;
          }
          .notification.error {
            background: red;
          }
          .image-icon {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #374151;
            cursor: pointer;
          }
          .image-icon:hover {
            color: #1f2937;
          }
        `}
      </style>

      <h1 className="text-2xl font-bold mb-6">Tender Information</h1>
      <div
        className="p-6 max-w-7xl mx-auto relative min-h-screen flex flex-row"
        style={{ gap: "20px", position: "relative" }}
      >
        <div
          className="flex flex-col gap-6 mb-6 div-1"
          style={{ flex: "3", width:  "75%", transition: "width 0.3s ease" }}
        >
          <div>
            <h2 className="bg-blue-200 text-lg font-semibold rounded-t-lg px-6 py-2 pb-4 -mb-2 z-10 relative">
              <span style={{ marginLeft: "27px", color: "black" }}>Tender Details</span>
            </h2>
            <div className="bg-white border rounded-b-lg p-6 shadow-md">
              <table className="w-full table-fixed border-collapse">
                <tbody>
                  <tr>
                    <td className="border p-4 font-medium" style={{ width: "245px" }}>Work Name</td>
                    <td className="border p-4" style={{ width: "1500px" }}>
                      {tenderData.work_name || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-4 font-medium" style={{ width: "245px" }}>Organisation</td>
                    <td className="border p-4" style={{ width: "1500px" }}>
                      {tenderData.organisation_name || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-4 font-medium" style={{ width: "245px" }}>Tender Source</td>
                    <td className="border p-4" style={{ width: "1500px" }}>
                      {tenderData.tender_source || "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ height: "20px" }}></div>

          <div>
            <h2 className="bg-blue-200 text-lg font-semibold rounded-t-lg px-6 py-2 pb-4 -mb-2 z-10 relative">
              <span style={{ marginLeft: "27px", color: "black" }}>Key Value</span>
            </h2>
            <div className="bg-white border rounded-b-lg p-6 shadow-md">
              <table className="w-full table-fixed border-collapse">
                <tbody>
                  <tr>
                    <td className="border p-4 font-medium" style={{ width: "245px" }}>
                      Tender Value
                    </td>
                    <td className="border p-4" style={{ width: "1500px" }}>
                      ₹ {tenderData.tender_value || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-4 font-medium" style={{ width: "245px" }}>Location</td>
                    <td className="border p-4" style={{ width: "1500px" }}>
                      {tenderData.state || ""} / {tenderData.city || ""}
                    </td>
                  </tr>
                  {(tenderData.document_last_date || tenderData.document_last_time) && (
                    <tr>
                      <td className="border p-4 font-medium" style={{ width: "245px" }}>
                        Closing Date & Time
                      </td>
                      <td className="border p-4" style={{ width: "1500px" }}>
                        {tenderData.document_last_date || ""} / {tenderData.document_last_time || ""}
                      </td>
                    </tr>
                  )}
                  {(tenderData.opening_tender_date || tenderData.opening_tender_time) && (
                    <tr>
                      <td className="border p-4 font-medium" style={{ width: "245px" }}>
                        Opening Date & Time
                      </td>
                      <td className="border p-4" style={{ width: "1500px" }}>
                        {tenderData.opening_tender_date || ""} / {tenderData.opening_tender_time || ""}
                      </td>
                    </tr>
                  )}
                  {(tenderData.tender_fees || tenderData.mode_tender_fees) && (
                    <tr>
                      <td className="border p-4 font-medium" style={{ width: "245px" }}>
                        Tender Fees & Mode
                      </td>
                      <td className="border p-4" style={{ width: "1500px" }}>
                        {tenderData.tender_fees || ""} / {tenderData.mode_tender_fees || ""}
                      </td>
                    </tr>
                  )}
                  {(tenderData.mode_of_emd || tenderData.mode_emd) && (
                    <tr>
                      <td className="border p-4 font-medium" style={{ width: "245px" }}>
                        Emd Fees & Mode
                      </td>
                      <td className="border p-4" style={{ width: "1500px" }}>
                        {tenderData.mode_of_emd || ""} / {tenderData.mode_emd || ""}
                      </td>
                    </tr>
                  )}
                  {(tenderData.pre_qualification) && (
                    <tr>
                      <td className="border p-4 font-medium" style={{ width: "245px" }}>
                        Pre-Qualification
                      </td>
                      <td className="border p-4" style={{ width: "1500px" }}>
                        {tenderData.pre_qualification || ""}
                      </td>
                    </tr>
                  )}
                  {(tenderData.pre_bid_meet_date) && (
                    <tr>
                      <td className="border p-4 font-medium" style={{ width: "245px" }}>
                        Pre-Bid Meeting Date
                      </td>
                      <td className="border p-4" style={{ width: "1500px" }}>
                        {tenderData.pre_bid_meet_date || ""}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ height: "20px" }}></div>

          <div>
            <h2 className="bg-blue-200 text-lg font-semibold rounded-t-lg px-6 py-2 pb-4 -mb-2 z-10 relative">
              <span style={{ marginLeft: "27px", color: "black" }}>Tender Document</span>
            </h2>
            <div className="bg-white border rounded-b-lg p-6 shadow-md">
              <table className="w-full table-fixed border-collapse">
                <tbody>
                          {/* Bid Document */}
                 <tr>
                   <td className="border p-4 font-medium" style={{ width: "245px" }}>
                     Bid Document
                   </td>
                   <td className="border p-4" style={{ width: "1500px" }}>
                     {tenderData.bid_documents && Object.values(tenderData.bid_documents).some(url => url) ? (
                       Object.entries(tenderData.bid_documents).map(([key, url]) => (
                         url && (
                           <div key={key} style={{ display: "inline-block", marginRight: "15px" }}>
                             <a href={url} target="_blank" rel="noopener noreferrer" title={key.replace('_', ' ').toUpperCase()}>
                               <img
                                 src={fileIcon}
                                 alt={`${key} Icon`}
                                 style={{ width: "30px", height: "30px", cursor: "pointer" }}
                               />
                             </a>
                           </div>
                         )
                       ))
                     ) : (
                       <span>No bid documents available</span>
                     )}
                   </td>
                 </tr>
                 
                 {/* Nit Document */}
                 <tr>
                   <td className="border p-4 font-medium" style={{ width: "245px" }}>
                     Nit Document
                   </td>
                   <td className="border p-4" style={{ width: "1500px" }}>
                     {tenderData.nit_documents && Object.values(tenderData.nit_documents).some(url => url) ? (
                       Object.entries(tenderData.nit_documents).map(([key, url]) => (
                         url && (
                           <div key={key} style={{ display: "inline-block", marginRight: "15px" }}>
                             <a href={url} target="_blank" rel="noopener noreferrer" title={key.replace('_', ' ').toUpperCase()}>
                               <img
                                 src={fileIcon}
                                 alt={`${key} Icon`}
                                 style={{ width: "30px", height: "30px", cursor: "pointer" }}
                               />
                             </a>
                           </div>
                         )
                       ))
                     ) : (
                       <span>No nit documents available</span>
                     )}
                   </td>
                 </tr>
                </tbody>
              </table>
            </div>
          </div>

          {tenderData.contact_name && (
            <>
              <div style={{ height: "20px" }}></div>
              <div>
                <h2 className="bg-blue-200 text-lg font-semibold rounded-t-lg px-6 py-2 pb-4 -mb-2 z-10 relative">
                  <span style={{ marginLeft: "27px", color: "black" }}>Contact Details</span>
                </h2>
                <div className="bg-white border rounded-b-lg p-6 shadow-md">
                  <table className="w-full table-fixed border-collapse">
                    <tbody>
                      {tenderData.contact_name && (
                        <tr>
                          <td className="border p-4 font-medium" style={{ width: "245px" }}>
                            Contact Name
                          </td>
                          <td className="border p-4" style={{ width: "1500px" }}>
                            {tenderData.contact_name}
                          </td>
                        </tr>
                      )}
                      {(tenderData.contact_add || tenderData.contact_city || tenderData.contact_state) && (
                        <tr>
                          <td className="border p-4 font-medium" style={{ width: "245px" }}>
                            Contact Address
                          </td>
                          <td className="border p-4" style={{ width: "1500px" }}>
                            {tenderData.contact_add || ""} {tenderData.contact_city && `, ${tenderData.contact_city}`}
                            {tenderData.contact_state && `, ${tenderData.contact_state}`}
                          </td>
                        </tr>
                      )}
                      {tenderData.contact_phone && (
                        <tr>
                          <td className="border p-4 font-medium" style={{ width: "245px" }}>
                            Contact Phone
                          </td>
                          <td className="border p-4" style={{ width: "1500px" }}>
                            {tenderData.contact_phone}
                          </td>
                        </tr>
                      )}
                      {tenderData.contact_fax && (
                        <tr>
                          <td className="border p-4 font-medium" style={{ width: "245px" }}>
                            Contact Fax
                          </td>
                          <td className="border p-4" style={{ width: "1500px" }}>
                            {tenderData.contact_fax}
                          </td>
                        </tr>
                      )}
                      {tenderData.contact_email && (
                        <tr>
                          <td className="border p-4 font-medium" style={{ width: "245px" }}>
                            Contact Email
                          </td>
                          <td className="border p-4" style={{ width: "1500px" }}>
                            {tenderData.contact_email}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

     

        <div
          className="div-2"
          style={{
            position: "fixed",
            top: 133,
            right: 0,
            width: "350px",
            height: "100%",
            background: "white",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            padding: "10px",
            transition: "right 0.3s ease",
            zIndex: 999,
          }}
        >
          {notification.visible && (
            <div className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          )}
          <div
            style={{
              background: "#c7c2f9",
              padding: "8px",
              textAlign: "center",
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            Related Menu
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              padding: "10px",
            }}
          >
            <button style={btnStyle} onClick={() => navigate(`/Send_letter/${tenderData.temp_id}`)}>
              <FaPaperPlane /> Send Letter
            </button>
            <button style={btnStyle} onClick={() => setIsModalOpen(true)}>
              <FaMoneyCheckAlt /> EMD Refund
            </button>
          </div>
          <div
            style={{
              background: "#c7c2f9",
              padding: "8px",
              textAlign: "center",
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            Related Documents
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              padding: "10px",
            }}
          >
            <button style={btnStyle} onClick={() => setIsModalOpentender(true)}>
              <FaFileInvoice /> Tender Fees
            </button>
            <button style={btnStyle} onClick={() => setIsModalOpenemd(true)}>
              <FaMoneyBillWave /> EMD
            </button>
            <button style={btnStyle}>
              <FaFileContract /> Work Order
            </button>
            <button style={btnStyle} onClick={() => setIsModalOpenpg(true)}>
              <FaAward /> Performance Guarantee
            </button>
            <button style={{ ...btnStyle, gridColumn: "span 2" }}>
              <FaHandshake /> Work Agreement
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>EMD Refund</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="modal-close-btn"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="modal-field">
              <label>Refund Date</label>
              <input
                type="date"
                value={refundDate}
                onChange={(e) => setRefundDate(e.target.value)}
                className="modal-field-input"
              />
            </div>
            <div className="modal-buttons">
              <button
                onClick={() => setIsModalOpen(false)}
                className="modal-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleEMDRefundSubmit}
                className="modal-btn-submit"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpenemd && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>EMD Details</h2>
              <button
                onClick={() => setIsModalOpenemd(false)}
                className="modal-close-btn"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="modal-field">
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid gray",
                }}
              >
                <tbody>
                  <tr style={{ height: "50px" }}>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                        fontWeight: "500",
                        width: "40%",
                      }}
                    >
                      Date of Issue
                    </td>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                      }}
                    >
                      {emdData?.emd_issue_date || "N/A"}
                    </td>
                  </tr>
                  <tr style={{ height: "50px" }}>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                        fontWeight: "500",
                      }}
                    >
                      Name of Issue
                    </td>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                      }}
                    >
                      {emdData?.emd_issue_name || "N/A"}
                    </td>
                  </tr>
                  <tr style={{ height: "50px" }}>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                        fontWeight: "500",
                      }}
                    >
                      Place
                    </td>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                      }}
                    >
                      {emdData?.emd_place || "N/A"}
                    </td>
                  </tr>
                  <tr style={{ height: "50px" }}>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                        fontWeight: "500",
                      }}
                    >
                      Amount
                    </td>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                      }}
                    >
                      {emdData?.emd_ammount || "N/A"}
                    </td>
                  </tr>
                  <tr style={{ height: "50px" }}>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                        fontWeight: "500",
                      }}
                    >
                      DD No.
                    </td>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                      }}
                    >
                      {emdData?.emd_mode_no || "N/A"}
                    </td>
                  </tr>
                  <tr style={{ height: "50px" }}>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                        fontWeight: "500",
                      }}
                    >
                      Valid Up To
                    </td>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                      }}
                    >
                      {emdData?.emd_expire_date || "N/A"}
                    </td>
                  </tr>
                 
                </tbody>
              </table>
            </div>
            <div className="modal-field">
              <label>EMD Document</label>
              {emdData?.emd_doc ? (
               <a href={emdData.emd_doc} target="_blank" rel="noopener noreferrer">
    <img src={fileIcon} alt="File Icon" style={{ width: "30px", height: "30px", cursor: "pointer" }} />
  </a>
              ) : (
                <>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="modal-field-input"
                    accept="image/*,application/pdf"
                  />
                  <div className="modal-buttons">
                    <button
                      onClick={() => setIsModalOpenemd(false)}
                      className="modal-btn-cancel"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEMDFileSubmit}
                      className="modal-btn-submit"
                    >
                      Submit
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}




      {isModalOpentender && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Tender Details</h2>
              <button
                onClick={() => setIsModalOpentender(false)}
                className="modal-close-btn"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="modal-field">
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid gray",
                }}
              >
                <tbody>
                  <tr style={{ height: "50px" }}>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                        fontWeight: "500",
                        width: "40%",
                      }}
                    >
                      Date of Issue
                    </td>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                      }}
                    >
                      {popuptenderData?.tenderfee_issue_date || "N/A"}
                    </td>
                  </tr>
                  <tr style={{ height: "50px" }}>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                        fontWeight: "500",
                      }}
                    >
                      Name of Issue
                    </td>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                      }}
                    >
                      {popuptenderData?.tenderfee_issue_name || "N/A"}
                    </td>
                  </tr>
                  <tr style={{ height: "50px" }}>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                        fontWeight: "500",
                      }}
                    >
                      Place
                    </td>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                      }}
                    >
                      {popuptenderData?.tenderfee_place || "N/A"}
                    </td>
                  </tr>
                  <tr style={{ height: "50px" }}>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                        fontWeight: "500",
                      }}
                    >
                      Amount
                    </td>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                      }}
                    >
                      {popuptenderData?.tender_fees || "N/A"}
                    </td>
                  </tr>
                  <tr style={{ height: "50px" }}>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                        fontWeight: "500",
                      }}
                    >
                      DD No.
                    </td>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                      }}
                    >
                      {popuptenderData?.tenderfee_mode_no || "N/A"}
                    </td>
                  </tr>
                  <tr style={{ height: "50px" }}>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                        fontWeight: "500",
                      }}
                    >
                      Valid Up To
                    </td>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                      }}
                    >
 
                      {popuptenderData?.tenderfee_expire_date || "N/A"}
                    </td>
                  </tr>
                  {/* <tr style={{ height: "50px" }}>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px", 
                        fontWeight: "500",
                      }}
                    >
                      Mode
                    </td>
                    <td
                      style={{
                        border: "1px solid gray",
                        padding: "12px",
                      }}
                    >
                      {emdData?.emd_mode || "N/A"}
                    </td>
                  </tr> */}
                </tbody>
              </table>
            </div>
            <div className="modal-field">
             


             {popuptenderData && popuptenderData.tender_doc ? (
  <a href={popuptenderData.tender_doc} target="_blank" rel="noopener noreferrer">
    <img src={fileIcon} alt="File Icon" style={{ width: "30px", height: "30px", cursor: "pointer" }} />
  </a>
) : (
  <label>No Tender Document</label>
)}
            </div>
          </div>
        </div>
      )}





      
{isModalOpenpg && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h2>Performance Guarantee</h2>
        <button
          onClick={() => setIsModalOpenpg(false)}
          className="modal-close-btn"
        >
          <FaTimes size={20} />
        </button>
      </div>
      <div className="modal-field">
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid gray",
          }}
        >
          <tbody>
            <tr style={{ height: "50px" }}>
              <td
                style={{
                  border: "1px solid gray",
                  padding: "12px",
                  fontWeight: "500",
                  width: "40%",
                }}
              >
                Date of Issue
              </td>
              <td
                style={{
                  border: "1px solid gray",
                  padding: "12px",
                }}
              >
                {popupPgData?.pg_issue_date || "N/A"}
              </td>
            </tr>
            <tr style={{ height: "50px" }}>
              <td
                style={{
                  border: "1px solid gray",
                  padding: "12px",
                  fontWeight: "500",
                }}
              >
                Name of Issue
              </td>
              <td
                style={{
                  border: "1px solid gray",
                  padding: "12px",
                }}
              >
                {popupPgData?.pg_issue_name || "N/A"}
              </td>
            </tr>
            <tr style={{ height: "50px" }}>
              <td
                style={{
                  border: "1px solid gray",
                  padding: "12px",
                  fontWeight: "500",
                }}
              >
                Place
              </td>
              <td
                style={{
                  border: "1px solid gray",
                  padding: "12px",
                }}
              >
                {popupPgData?.pg_place || "N/A"}
              </td>
            </tr>
            <tr style={{ height: "50px" }}>
              <td
                style={{
                  border: "1px solid gray",
                  padding: "12px",
                  fontWeight: "500",
                }}
              >
                Amount
              </td>
              <td
                style={{
                  border: "1px solid gray",
                  padding: "12px",
                }}
              >
                {popupPgData?.pg_ammount || "N/A"}
              </td>
            </tr>
            <tr style={{ height: "50px" }}>
              <td
                style={{
                  border: "1px solid gray",
                  padding: "12px",
                  fontWeight: "500",
                }}
              >
                DD No.
              </td>
              <td
                style={{
                  border: "1px solid gray",
                  padding: "12px",
                }}
              >
                {popupPgData?.pg_mode_no || "N/A"}
              </td>
            </tr>
            <tr style={{ height: "50px" }}>
              <td
                style={{
                  border: "1px solid gray",
                  padding: "12px",
                  fontWeight: "500",
                }}
              >
                Valid Up To
              </td>
              <td
                style={{
                  border: "1px solid gray",
                  padding: "12px",
                }}
              >
                {popupPgData?.pg_expire_date || "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="modal-field">
        <label>Performance Guarantee Document</label>
        {popupPgData?.pg_doc ? (
          <a href={popupPgData.pg_doc} target="_blank" rel="noopener noreferrer">
            <img src={fileIcon} alt="File Icon" style={{ width: "30px", height: "30px", cursor: "pointer" }} />
          </a>
        ) : (
          <p>No document available.</p>
        )}
      </div>
    </div>
  </div>
)}
    </>
  );
}