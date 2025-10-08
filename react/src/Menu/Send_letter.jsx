import { useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaListUl,
  FaListOl,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaHighlighter,
  FaHeading,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SendLetter() {
  const { temp_id } = useParams();
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const letterRef = useRef(null);
  const user_id = localStorage.getItem("user_id"); 



const baseBtn = {
  background: "#fff",
  border: "1px solid #d1d1d1",
  padding: "10px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  color: "#444",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const hoverOn = (e) => {
  e.currentTarget.style.background = "#007bff";
  e.currentTarget.style.color = "#fff";
  e.currentTarget.style.borderColor = "#007bff";
  e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,123,255,0.3)";
  e.currentTarget.style.transform = "translateY(-2px)";
};

const hoverOff = (e) => {
  e.currentTarget.style.background = "#fff";
  e.currentTarget.style.color = "#444";
  e.currentTarget.style.borderColor = "#d1d1d1";
  e.currentTarget.style.boxShadow = "none";
  e.currentTarget.style.transform = "translateY(0)";
};



  
  useEffect(() => {
    if (!temp_id) {
      setError("No temp_id provided in URL");
      toast.error("No temp_id provided in URL", { position: "top-right" });
      return;
    }

    const fetchData = async () => {
      try {
        console.log("Fetching data for temp_id:", temp_id);
        const response = await fetch(`${import.meta.env.VITE_SERVER_API}/letter_information.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ temp_id }),
        });
        console.log("Response status:", response.status);
        const result = await response.json();
        console.log("Response data:", result);
        if (response.ok) {
          setData(result);
          setError(null);
        } else {
          setError(result.message || "Failed to fetch data");
          toast.error(result.message || "Failed to fetch data", { position: "top-right" });
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Network error: Unable to fetch data");
        toast.error("Network error: Unable to fetch data", { position: "top-right" });
      }
    };

    fetchData();
  }, [temp_id]);

  useEffect(() => {
    if (data) {
      const referenceValue = [
        data.year || "N/A",
        data.year1 || "N/A",
        data.temp_id || "N/A",
        data.EMDRQST || "N/A",
        data.no || "N/A",
      ].join("/");
      setTo(referenceValue);
    }
  }, [data]);

  useEffect(() => {
    if (letterRef.current && data) {
      letterRef.current.innerHTML = `
        <div style="display: flex; justify-content: center; margin: 25px 0;">
          <table style="border-collapse: collapse; width: 80%; font-size: 15px;">
            <tbody>
              <tr>
                <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">NIT No</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${data.nit_no || "N/A"}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">Work Name</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${data.work_name || "N/A"}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">Date of Submission</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${data.submission_date || "N/A"}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">Name of Bank</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${data.bank_name || "N/A"}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">In The Form of / No</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${data.emd_mode || "N/A"} / ${data.emd_mode_no || ""}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">EMD Amount</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${data.emd_amount || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="margin-top: 40px; text-align: left; font-size: 15px; line-height: 1.6;">
          <b>Full Name: Mr. Vaibhav Varshney</b><br>
          Designation: Managing Director<br>
          Address: Cyb-4 RIICO Cyber Park Basni Heavy Industrial Area Near Saras Dairy Jodhpur.
        </div>
        <img 
          src="/react/images/blg_seal_sign.png" 
          alt="Seal and Signature" 
          style="float: left; margin: 0 10px 10px 0; width: 100px;" 
        />
      `;
    }
  }, [data]);

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    letterRef.current.focus();
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const letterContent = letterRef.current.innerHTML;

  // Prepare data to send to backend, including user_id
  const formData = {
    temp_id,
    reference: to,
    to1: cc,
    cc,
    subject,
    message: letterContent,
    from: "Mr. Vaibhav Varshney",
    user_id, // Add user_id to formData
  };

  try {
    const response = await fetch(`${import.meta.env.VITE_SERVER_API}/letter_insert.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (response.ok) {
      toast.success("Letter data inserted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setTo("");
      setCc("");
      setSubject(""); 
      letterRef.current.innerHTML = ""; 
    } else {
      toast.error(`Error: ${result.message || "Failed to insert data"}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  } catch (error) {
    console.error("Submit error:", error);
    toast.error("Network error: Unable to submit data", {
      position: "top-right",
      autoClose: 3000,
    });
  }
};

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center py-10 px-6 bg-gradient-to-br from-blue-100 via-white to-blue-50">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-6 bg-gradient-to-br from-blue-100 via-white to-blue-50" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" , marginTop: "40px"}}>
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-10 border border-gray-200">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
        <h6 className="text-2xl font-extrabold text-gray-800 mb-10 text-center drop-shadow">
          <span className="text-blue-600">{data?.work_name || "Loading..."}</span>
        </h6>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 px-3">Reference</label>
              <input
                id="to"
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                className="w-full border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
                style={{ width: "100%" }}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 px-3">To</label>
              <input
                id="cc"
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 px-3">Subject</label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
                style={{ width: "100%" }}
              />
            </div>
          </div>
         <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "12px",
    marginTop: "20px",
    marginBottom: "16px",
    background: "#f8f9fa",
    // border: "1px solid #ccc",
    // borderRadius: "10px",
    padding: "12px",
  }}
>
  {/* Bold */}
  <button
    type="button"
    onClick={() => applyFormat("bold")}
    title="Bold"
    style={baseBtn}
    onMouseOver={hoverOn}
    onMouseOut={hoverOff}
  >
    <FaBold size={20} />
  </button>

  {/* Italic */}
  <button
    type="button"
    onClick={() => applyFormat("italic")}
    title="Italic"
    style={baseBtn}
    onMouseOver={hoverOn}
    onMouseOut={hoverOff}
  >
    <FaItalic size={20} />
  </button>

  {/* Underline */}
  <button
    type="button"
    onClick={() => applyFormat("underline")}
    title="Underline"
    style={baseBtn}
    onMouseOver={hoverOn}
    onMouseOut={hoverOff}
  >
    <FaUnderline size={20} />
  </button>

  {/* Strikethrough */}
  <button
    type="button"
    onClick={() => applyFormat("strikeThrough")}
    title="Strikethrough"
    style={baseBtn}
    onMouseOver={hoverOn}
    onMouseOut={hoverOff}
  >
    <FaStrikethrough size={20} />
  </button>

  {/* Bullet List */}
  <button
    type="button"
    onClick={() => applyFormat("insertUnorderedList")}
    title="Bullet List"
    style={baseBtn}
    onMouseOver={hoverOn}
    onMouseOut={hoverOff}
  >
    <FaListUl size={20} />
  </button>

  {/* Numbered List */}
  <button
    type="button"
    onClick={() => applyFormat("insertOrderedList")}
    title="Numbered List"
    style={baseBtn}
    onMouseOver={hoverOn}
    onMouseOut={hoverOff}
  >
    <FaListOl size={20} />
  </button>

  {/* Align Left */}
  <button
    type="button"
    onClick={() => applyFormat("justifyLeft")}
    title="Align Left"
    style={baseBtn}
    onMouseOver={hoverOn}
    onMouseOut={hoverOff}
  >
    <FaAlignLeft size={20} />
  </button>

  {/* Align Center */}
  <button
    type="button"
    onClick={() => applyFormat("justifyCenter")}
    title="Align Center"
    style={baseBtn}
    onMouseOver={hoverOn}
    onMouseOut={hoverOff}
  >
    <FaAlignCenter size={20} />
  </button>

  {/* Align Right */}
  <button
    type="button"
    onClick={() => applyFormat("justifyRight")}
    title="Align Right"
    style={baseBtn}
    onMouseOver={hoverOn}
    onMouseOut={hoverOff}
  >
    <FaAlignRight size={20} />
  </button>

  {/* Heading */}
  <button
    type="button"
    onClick={() => applyFormat("formatBlock", "h3")}
    title="Heading"
    style={baseBtn}
    onMouseOver={hoverOn}
    onMouseOut={hoverOff}
  >
    <FaHeading size={20} />
  </button>

  {/* Text Color */}
  <button
    type="button"
    onClick={() => applyFormat("foreColor", "blue")}
    title="Text Color"
    style={baseBtn}
    onMouseOver={hoverOn}
    onMouseOut={hoverOff}
  >
    <FaHighlighter size={20} />
  </button>
</div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Letter Content:</label>
            <div
              ref={letterRef}
              contentEditable={data !== null}
              spellCheck={true}
              className="editor-content w-full p-4 border border-gray-300 rounded-lg bg-white shadow-md focus:ring-2 focus:ring-blue-400 transition duration-200 overflow-auto prose max-w-none"
              style={{ whiteSpace: "pre-wrap", minHeight: "300px", backgroundColor: "#f9f9f9" }}
              aria-label="Letter content editor"
            >
              {data === null && <p>Loading content...</p>}
            </div>
          </div>
          <div className="text-center pt-4">
      <button
  type="submit"
  style={{
    marginTop: "20px",
    width: "100%",
    backgroundColor: "#2563eb",
    color: "white",
    fontWeight: "600",
    padding: "12px",
    // borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    border: "blue",
  }}
  onMouseOver={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
  onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
>
  Submit
</button>


          </div>
        </form>
      </div>
    </div>
  );
}

export default SendLetter;