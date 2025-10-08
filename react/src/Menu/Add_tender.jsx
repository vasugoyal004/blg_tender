import { useEffect, useState, useRef } from "react";

export default function ViewPage() {
  const [user, setUser] = useState({
    user_id: "",
    user_name: "default_user", // Fallback if localStorage is empty
    user_type: "",
  });

  // Form states
  const [tenderCategory, setTenderCategory] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [city, setCity] = useState("");
  const [nit_no, setNitNo] = useState("");
  const [work_name, setWorkname] = useState("");
  const [dateOfPublish, setDateOfPublish] = useState("");
  const [lastDateOfSubmission, setLastDateOfSubmission] = useState("");
  const [preBidMeetingDate, setPreBidMeetingDate] = useState("");
  const [dateofsale, setDateofsale] = useState("");
  const [upTo, setUpTo] = useState("");
  const [tenderFeeAmount, setTenderFeeAmount] = useState("");
  const [emdAmount, setEmdAmount] = useState("");
  const [tenderintheFeeForm, settenderintheFeeForm] = useState("");
  const [emdintheForm, setemdintheForm] = useState("");
  const [qualificationTurnOver, setQualificationTurnOver] = useState("");
  const [technicalFiles, setTechnicalFiles] = useState([null]);
  const [nitFiles, setNitFiles] = useState([null]);
  const [tenderSource, setTenderSource] = useState("");
  const [qualificationTechnical, setQualificationTechnical] = useState("");
  const [tenderValue, setTenderValue] = useState("");
  const [step, setStep] = useState(1);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown data
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState("");

  // Refs for file inputs
  const fileInputRefs = useRef([]);
  const nitFileInputRefs = useRef([]);

  useEffect(() => {
    const user_id = localStorage.getItem("user_id") || "";
    const user_name = localStorage.getItem("name") || "default_user";
    const user_type = localStorage.getItem("user_type") || "";
    setUser({ user_id, user_name, user_type });
    console.log("user_name:", user_name); 
  }, []);

  useEffect(() => {
    // Fetch states with caching
    const cachedStates = localStorage.getItem("states");
    if (cachedStates) {
      try {
        setStates(JSON.parse(cachedStates));
      } catch (err) {
        console.error("Invalid JSON in cached states:", err);
        setNotification("Failed to parse cached states data");
        setNotificationType("error");
      }
    } else {
      fetch(`${import.meta.env.VITE_SERVER_API}/get_states.php`)
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch (err) {
            console.error("Invalid JSON from get_states.php:", text);
            throw new Error("Invalid JSON response from server");
          }
        })
        .then((data) => {
          setStates(data);
          localStorage.setItem("states", JSON.stringify(data));
        })
        .catch((err) => {
          console.error("Error fetching states:", err);
          setNotification("Failed to load states: " + err.message);
          setNotificationType("error");
        });
    }
  }, []);

  useEffect(() => {
    if (selectedStateId) {
      fetchCities(selectedStateId);
    } else {
      setCities([]);
      setCity("");
    }
  }, [selectedStateId]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 5000); // Extended to 5s for visibility
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchCities = async (stateId) => {
    if (!stateId) {
      setCities([]);
      setCity("");
      return;
    }

    const cachedCities = localStorage.getItem(`cities_${stateId}`);
    if (cachedCities) {
      try {
        setCities(JSON.parse(cachedCities));
      } catch (err) {
        console.error("Invalid JSON in cached cities:", err);
        setNotification("Failed to parse cached cities data");
        setNotificationType("error");
      }
    } else {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_API}/get_cities.php?state_id=${stateId}`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setCities(data);
          localStorage.setItem(`cities_${stateId}`, JSON.stringify(data));
        } catch (err) {
          console.error("Invalid JSON from get_cities.php:", text);
          throw new Error("Invalid JSON response from server");
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
        setNotification("Failed to load cities: " + err.message);
        setNotificationType("error");
        setCities([]);
        setCity("");
      }
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!tenderCategory) return "Tender Category is required";
      if (!organisationName) return "Organisation Name is required";
      if (!stateVal) return "State is required";
      if (!city) return "City is required";
      if (!nit_no) return "NIT No is required";
      if (!work_name) return "Work Name is required";
      return "";
    }
    if (step === 2) {
      if (!dateOfPublish) return "Date of Publish is required";
      if (!lastDateOfSubmission) return "Last Date of Submission is required";
      if (!preBidMeetingDate) return "Pre Bid Meeting Date is required";
      if (!upTo) return "Up To time is required";
      if (!dateofsale) return "Date of Sale is required";
      if (new Date(lastDateOfSubmission) <= new Date(dateOfPublish)) {
        return "Last Date of Submission must be after Date of Publish";
      }
      if (new Date(preBidMeetingDate) < new Date(dateOfPublish)) {
        return "Pre Bid Meeting Date must be on or after Date of Publish";
      }
      return "";
    }
    if (step === 3) {
      if (!tenderFeeAmount || tenderFeeAmount < 0) return "Tender Fee Amount is required and must be non-negative";
      if (!emdAmount || emdAmount < 0) return "EMD Amount is required and must be non-negative";
      if (!tenderintheFeeForm) return "Tender Fee Form is required";
      if (!emdintheForm) return "EMD Form is required";
      return "";
    }
    if (step === 4) {
      if (!qualificationTurnOver || qualificationTurnOver < 0) return "Turn Over is required and must be non-negative";
      if (!technicalFiles[0]) return "Technical File is required";
      if (!nitFiles[0]) return "At least one NIT Document is required";
      if (!tenderSource) return "Tender Source is required";
      if (!qualificationTechnical) return "Technical Qualification is required";
      if (!tenderValue || tenderValue < 0) return "Tender Value is required and must be non-negative";
      return "";
    }
    return "";
  };

  const handleNext = () => {
    const error = validateStep();
    if (!error) {
      setNotification("");
      setStep(step + 1);
    } else {
      setNotification(error);
      setNotificationType("error");
    }
  };

  const handleAddFileInput = () => {
    setTechnicalFiles([...technicalFiles, null]);
  };

  const handleRemoveFileInput = (index) => {
    if (index === 0) return;
    const updatedFiles = technicalFiles.filter((_, i) => i !== index);
    setTechnicalFiles(updatedFiles);
    fileInputRefs.current = fileInputRefs.current.filter((_, i) => i !== index);
  };

  const handleFileChange = (index, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      setNotification("File size exceeds 5MB limit");
      setNotificationType("error");
      fileInputRefs.current[index].value = "";
      return;
    }
    const updatedFiles = [...technicalFiles];
    updatedFiles[index] = file;
    setTechnicalFiles(updatedFiles);
  };

  const handleAddNitFileInput = () => {
    setNitFiles([...nitFiles, null]);
  };

  const handleRemoveNitFileInput = (index) => {
    const updatedFiles = nitFiles.filter((_, i) => i !== index);
    setNitFiles(updatedFiles);
    nitFileInputRefs.current = nitFileInputRefs.current.filter((_, i) => i !== index);
  };

  const handleNitFileChange = (index, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      setNotification("File size exceeds 5MB limit");
      setNotificationType("error");
      nitFileInputRefs.current[index].value = "";
      return;
    }
    const updatedFiles = [...nitFiles];
    updatedFiles[index] = file;
    setNitFiles(updatedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const error = validateStep();
    if (error) {
      setNotification(error);
      setNotificationType("error");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("tenderCategory", tenderCategory);
      formData.append("organisationName", organisationName);
      formData.append("state", stateVal);
      formData.append("city", city);
      formData.append("workName", work_name);
      formData.append("nit_no", nit_no);
      formData.append("dateOfPublish", dateOfPublish);
      formData.append("lastDateOfSubmission", lastDateOfSubmission);
      formData.append("preBidMeetingDate", preBidMeetingDate);
      formData.append("upTo", upTo);
      formData.append("dateofsale", dateofsale);
      formData.append("tenderFeeAmount", tenderFeeAmount);
      formData.append("emdAmount", emdAmount);
      formData.append("tenderintheFeeForm", tenderintheFeeForm);
      formData.append("emdintheForm", emdintheForm);
      formData.append("qualificationTurnOver", qualificationTurnOver);
      formData.append("tenderSource", tenderSource);
      formData.append("qualificationTechnical", qualificationTechnical);
      formData.append("tenderValue", tenderValue);
      formData.append("user_name", user.user_name);

      technicalFiles.forEach((file, index) => {
        if (file) {
          formData.append(index === 0 ? "technical_file" : `bid_document_${index}`, file);
        }
      });

      nitFiles.forEach((file, index) => {
        if (file) {
          formData.append(`nit_document_${index + 1}`, file);
        }
      });

      // Log FormData for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased to 60s

      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/add_tender_insert.php`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text();
        console.error("Server response (non-OK):", text);
        throw new Error(`Server error: ${response.status} - ${text}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Invalid JSON from add_tender_insert.php:", text);
        throw new Error("Invalid JSON response from server");
      }

      if (data.status === "success") {
        setNotification("Data successfully inserted!");
        setNotificationType("success");

        // Reset form
        setTenderCategory("");
        setOrganisationName("");
        setStateVal("");
        setCity("");
        setNitNo("");
        setWorkname("");
        setDateOfPublish("");
        setLastDateOfSubmission("");
        setPreBidMeetingDate("");
        setDateofsale("");
        setUpTo("");
        setTenderFeeAmount("");
        setEmdAmount("");
        settenderintheFeeForm("");
        setemdintheForm("");
        setQualificationTurnOver("");
        setTechnicalFiles([null]);
        setNitFiles([null]);
        setTenderSource("");
        setQualificationTechnical("");
        setTenderValue("");
        setStep(1);
        setSelectedStateId("");
        setCities([]);

        fileInputRefs.current.forEach((ref) => {
          if (ref) ref.value = "";
        });
        fileInputRefs.current = [];

        nitFileInputRefs.current.forEach((ref) => {
          if (ref) ref.value = "";
        });
        nitFileInputRefs.current = [];
      } else {
        setNotification(`Error: ${data.message || "Unknown error"}`);
        setNotificationType("error");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setNotification(`Error submitting data: ${err.message}`);
      setNotificationType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "20px", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          backgroundColor: "#fff",
          padding: "30px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.40)",
          maxWidth: "1300px",
          width: "100%",
          marginTop: "40px",
          position: "relative",
        }}
      >
        {notification && (
          <div
            style={{
              position: "fixed",
              top: "70px",
              right: "20px",
              backgroundColor: notificationType === "success" ? "#4caf50" : "#f44336",
              color: "white",
              padding: "15px 20px",
              fontSize: "16px",
              fontWeight: "bold",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              maxWidth: "90%",
              width: "auto",
            }}
          >
            {notification}
            <button
              onClick={() => setNotification("")}
              style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>
        )}

        <div className="step-wizard-container">
          <div className="step-wizard">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className={`step ${step === num ? "active" : step > num ? "done" : ""}`}>
                {num}
              </div>
            ))}
          </div>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <h3 style={{ textAlign: "left", marginBottom: "50px", color: "purple" }}>
          NIT FORM PART {step}
        </h3>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-grid">
              <div className="form-group">
                <select
                  value={tenderCategory}
                  onChange={(e) => setTenderCategory(e.target.value)}
                  required
                  className={tenderCategory ? "filled" : ""}
                >
                  <option value="" disabled hidden>Select Tender Category</option>
                  <option value="Construction">Construction</option>
                  <option value="Consultancy">Consultancy</option>
                  <option value="Third Party Inspection">Third Party Inspection</option>
                  <option value="PMC (Project Management Consultant)">PMC (Project Management Consultant)</option>
                  <option value="EOI (Expression of Interest)">EOI (Expression of Interest)</option>
                </select>
                <label className="floating-label">Tender Category</label>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={work_name}
                  onChange={(e) => setWorkname(e.target.value)}
                  required
                />
                <label className={work_name ? "floating-label active" : "floating-label"}>Work Name</label>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={nit_no}
                  onChange={(e) => setNitNo(e.target.value)}
                  required
                />
                <label className={nit_no ? "floating-label active" : "floating-label"}>NIT No</label>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={organisationName}
                  onChange={(e) => setOrganisationName(e.target.value)}
                  required
                />
                <label className={organisationName ? "floating-label active" : "floating-label"}>Organisation Name</label>
              </div>
              <div className="form-group">
                <select
                  value={stateVal}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    const selected = states.find((s) => s.name === selectedName);
                    setStateVal(selectedName);
                    setSelectedStateId(selected ? selected.id : "");
                    setCity("");
                    if (selected) fetchCities(selected.id);
                  }}
                  required
                  className={stateVal ? "filled" : ""}
                >
                  <option value="" disabled>Select State</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <label className="floating-label">State</label>
              </div>
              <div className="form-group">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  disabled={!selectedStateId}
                  className={city ? "filled" : ""}
                >
                  <option value="" disabled>Select City</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <label className="floating-label">City</label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-grid">
              <div className="form-group">
                <input
                  type="date"
                  value={dateOfPublish}
                  onChange={(e) => setDateOfPublish(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
                <label className={dateOfPublish ? "floating-label active" : "floating-label"}>Date Of Publish</label>
              </div>
              <div className="form-group">
                <input
                  type="date"
                  value={lastDateOfSubmission}
                  onChange={(e) => setLastDateOfSubmission(e.target.value)}
                  required
                  min={dateOfPublish || new Date().toISOString().split("T")[0]}
                />
                <label className={lastDateOfSubmission ? "floating-label active" : "floating-label"}>Last Date Of Submission</label>
              </div>
              <div className="form-group">
                <input
                  type="date"
                  value={dateofsale}
                  onChange={(e) => setDateofsale(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
                <label className={dateofsale ? "floating-label active" : "floating-label"}>Date Of Sale</label>
              </div>
              <div className="form-group">
                <input
                  type="date"
                  value={preBidMeetingDate}
                  onChange={(e) => setPreBidMeetingDate(e.target.value)}
                  required
                  min={dateOfPublish || new Date().toISOString().split("T")[0]}
                />
                <label className={preBidMeetingDate ? "floating-label active" : "floating-label"}>Pre Bid Meeting Date</label>
              </div>
              <div className="form-group">
                <input
                  type="time"
                  value={upTo}
                  onChange={(e) => setUpTo(e.target.value)}
                  required
                />
                <label className={upTo ? "floating-label active" : "floating-label"}>Up To</label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-grid">
              <div className="form-group">
                <input
                  type="number"
                  value={tenderFeeAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val >= 0 || val === "") setTenderFeeAmount(val);
                  }}
                  required
                  min="0"
                />
                <label className={tenderFeeAmount ? "floating-label active" : "floating-label"}>Tender Fee Amount</label>
              </div>
              <div className="form-group">
                <input
                  type="number"
                  value={emdAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val >= 0 || val === "") setEmdAmount(val);
                  }}
                  required
                  min="0"
                />
                <label className={emdAmount ? "floating-label active" : "floating-label"}>EMD Amount</label>
              </div>
              <div className="form-group">
                <select
                  value={tenderintheFeeForm}
                  onChange={(e) => settenderintheFeeForm(e.target.value)}
                  required
                  className={tenderintheFeeForm ? "filled" : ""}
                >
                  <option value="" disabled hidden>Select Tender Fee Form</option>
                  <option value="DD">DD</option>
                  <option value="Online">Online</option>
                  <option value="Exempted">Exempted</option>
                </select>
                <label className="floating-label">Tender Fee Form</label>
              </div>
              <div className="form-group">
                <select
                  value={emdintheForm}
                  onChange={(e) => setemdintheForm(e.target.value)}
                  required
                  className={emdintheForm ? "filled" : ""}
                >
                  <option value="" disabled hidden>Select EMD Form</option>
                  <option value="DD">DD</option>
                  <option value="Online">Online</option>
                  <option value="FDR">FDR</option>
                  <option value="BG">BG</option>
                  <option value="Exempted">Exempted</option>
                </select>
                <label className="floating-label">EMD Form</label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="form-grid">
              <div className="form-group">
                <input
                  type="number"
                  value={qualificationTurnOver}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val >= 0 || val === "") setQualificationTurnOver(val);
                  }}
                  required
                  min="0"
                />
                <label className={qualificationTurnOver ? "floating-label active" : "floating-label"}>Turn Over</label>
              </div>
              <div className="form-group">
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {technicalFiles.map((file, index) => (
                    <div key={index} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                          type="file"
                          name={index === 0 ? "technical_file" : `bid_document_${index}`}
                          ref={(el) => (fileInputRefs.current[index] = el)}
                          onChange={(e) => handleFileChange(index, e.target.files[0])}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                          required={index === 0}
                          style={{ width: "100%", padding: "10px 5px", border: "none", borderBottom: "2px solid #ccc" }}
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFileInput(index)}
                            style={{ backgroundColor: "#dc3545", padding: "5px 10px", color: "white", border: "none" }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <span style={{ fontSize: "14px", color: "#777" }}>
                        {index === 0 ? "Technical File" : `Bid Document ${index}`}
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddFileInput}
                    style={{ backgroundColor: "#28a745", padding: "10px 20px", color: "white", border: "none", alignSelf: "flex-start" }}
                  >
                    Add More
                  </button>
                </div>
              </div>
              <div className="form-group">
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {nitFiles.map((file, index) => (
                    <div key={index} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                          type="file"
                          name={`nit_document_${index + 1}`}
                          ref={(el) => (nitFileInputRefs.current[index] = el)}
                          onChange={(e) => handleNitFileChange(index, e.target.files[0])}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                          required={index === 0}
                          style={{ width: "100%", padding: "10px 5px", border: "none", borderBottom: "2px solid #ccc" }}
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveNitFileInput(index)}
                            style={{ backgroundColor: "#dc3545", padding: "5px 10px", color: "white", border: "none" }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <span style={{ fontSize: "14px", color: "#777" }}>
                        NIT Document {index + 1}
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddNitFileInput}
                    style={{ backgroundColor: "#28a745", padding: "10px 20px", color: "white", border: "none", alignSelf: "flex-start" }}
                  >
                    Add More
                  </button>
                </div>
              </div>
              <div className="form-group">
                <select
                  value={tenderSource}
                  onChange={(e) => setTenderSource(e.target.value)}
                  required
                  className={tenderSource ? "filled" : ""}
                >
                  <option value="" disabled hidden>Select Tender Source</option>
                  <option value="tender_tiger">Tender Tiger</option>
                  <option value="trade_reader">Trade Reader</option>
                  <option value="news_paper">News Paper</option>
                  <option value="nprocure">Nprocure</option>
                  <option value="eprocure">Eprocure</option>
                  <option value="morth">Morth</option>
                  <option value="other">Other</option>
                </select>
                <label className="floating-label">Tender Source</label>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={qualificationTechnical}
                  onChange={(e) => setQualificationTechnical(e.target.value)}
                  required
                />
                <label className={qualificationTechnical ? "floating-label active" : "floating-label"}>Technical</label>
              </div>
              <div className="form-group">
                <input
                  type="number"
                  value={tenderValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val >= 0 || val === "") setTenderValue(val);
                  }}
                  required
                  min="0"
                />
                <label className={tenderValue ? "floating-label active" : "floating-label"}>Tender Value</label>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", flexWrap: "wrap", gap: "10px" }}>
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} disabled={isSubmitting}>
                Previous
              </button>
            )}
            {step < 4 ? (
              <button type="button" onClick={handleNext} style={{ marginLeft: "auto" }} disabled={isSubmitting}>
                Next
              </button>
            ) : (
              <button type="submit" style={{ marginLeft: "auto" }} disabled={isSubmitting}>
                {isSubmitting ? (
                  <span>
                    <span className="spinner"></span> Submitting...
                  </span>
                ) : (
                  "Submit"
                )}
              </button>
            )}
          </div>
        </form>

        <style>{`
          .form-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 25px 40px; 
          }
          .form-group { 
            position: relative; 
            margin-bottom: 25px; 
          }
          .form-group input, 
          .form-group select { 
            width: 100%; 
            border: none; 
            border-bottom: 2px solid #ccc; 
            padding: 10px 5px; 
            font-size: 16px; 
            outline: none; 
            background: transparent; 
            transition: border-bottom 0.3s ease;
          }
          .form-group input:focus, 
          .form-group select:focus { 
            border-bottom: 2px solid #7b1fa2; 
          }
          .floating-label { 
            position: absolute; 
            left: 5px; 
            top: -20px; 
            color: #777; 
            font-size: 14px; 
            pointer-events: none; 
            transition: all 0.3s ease;
          }
          .floating-label.active { 
            color: #7b1fa2; 
          }
          .form-group input:not([type="file"]):not(:placeholder-shown) ~ .floating-label,
          .form-group input:focus ~ .floating-label,
          .form-group select.filled ~ .floating-label { 
            top: -20px; 
            font-size: 14px; 
            color: #7b1fa2; 
          }
          .form-group input[type="file"] ~ .floating-label { 
            display: none; 
          }
          .step-wizard-container { 
            position: relative; 
            width: 80%; 
            margin: 0 auto 25px; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
          }
          .step-wizard { 
            display: flex; 
            justify-content: space-between; 
            width: 100%; 
            position: relative; 
            z-index: 1; 
          }
          .step { 
            width: 35px; 
            height: 35px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: bold; 
            background: #ccc; 
            color: white; 
            transition: background 0.3s ease; 
          }
          .step.active { 
            background: #7b1fa2; 
          }
          .step.done { 
            background: #4caf50; 
          }
          .progress-container { 
            position: absolute; 
            top: 50%; 
            left: 10%; 
            right: 10%; 
            transform: translateY(-50%); 
            height: 4px; 
            background: #e0e0e0; 
            z-index: 0; 
          }
          .progress-bar { 
            height: 100%; 
            background: #7b1fa2; 
            transition: width 0.3s ease-in-out; 
          }
          button { 
            background-color: #7b1fa2; 
            color: white; 
            border: none; 
            padding: 10px 25px; 
            font-size: 16px; 
            font-weight: 500; 
            border-radius: 30px; 
            cursor: pointer; 
            transition: 0.3s ease; 
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          button:hover:not(:disabled) { 
            background-color: #6a1b9a; 
          }
          button:focus { 
            outline: none; 
            box-shadow: 0 0 6px rgba(123, 31, 162, 0.6); 
          }
          button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
          .spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #fff;
            border-top: 2px solid transparent;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-right: 8px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          /* Responsive Styles */
          @media (max-width: 768px) {
            .form-grid {
              grid-template-columns: 1fr;
            }
            .step-wizard-container {
              width: 100%;
            }
            .step-wizard {
              justify-content: space-around;
            }
            .step {
              width: 30px;
              height: 30px;
              font-size: 14px;
            }
            .progress-container {
              left: 5%;
              right: 5%;
            }
            .form-group input, 
            .form-group select {
              font-size: 14px;
            }
            .floating-label {
              font-size: 12px;
            }
            button {
              padding: 8px 20px;
              font-size: 14px;
            }
            .notification {
              font-size: 14px;
              padding: 10px 15px;
              max-width: 100%;
              right: 10px;
            }
          }

          @media (max-width: 480px) {
            .form-group {
              margin-bottom: 20px;
            }
            .form-group input, 
            .form-group select {
              padding: 8px 5px;
            }
            .step-wizard-container {
              margin-bottom: 15px;
            }
            .step {
              width: 25px;
              height: 25px;
              font-size: 12px;
            }
            button {
              padding: 6px 15px;
              font-size: 12px;
            }
            h3 {
              font-size: 18px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}