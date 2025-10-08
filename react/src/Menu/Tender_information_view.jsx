import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import fileIcon from "../assets/images/img.png";

export default function TenderInformationView() {
  const { temp_id } = useParams();
  const [tenderData, setTenderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      body: JSON.stringify({ temp_id }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setTenderData(data);
        }
      })
      .catch(() => {
        setError("Failed to fetch data. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [temp_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">
          Loading tender data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!tenderData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">
          No tender data available.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Heading - Removed the old heading placeholder */}

      <div style={{ height: "20px" }}></div>

      {/* Tender Details Box */}
      <div>
        {/* Updated H2: Dark background, white text, top rounded corners */}
        <h2 className="bg-blue-700 text-white text-lg font-semibold rounded-t-lg px-6 py-3">
          <span style={{ marginLeft: "27px" }}>Tender Details</span>
        </h2>
        <div className="bg-white border rounded-b-lg p-6 shadow-md border-t-0">
          <table className="w-full table-fixed border-collapse">
            <tbody>
              <tr>
                <td className="border p-4 font-medium" style={{ width: "245px" }}>
                  Organisation Name
                </td>
                <td className="border p-4" style={{ width: "1500px" }}>
                  {tenderData.organisation_name}
                </td>
              </tr>


              <tr>
                <td className="border p-4 font-medium" style={{ width: "245px" }}>
                  Work Name
                </td>
                <td className="border p-4" style={{ width: "1500px" }}>
                  {tenderData.work_name}
                </td>
              </tr>


              <tr>
                <td className="border p-4 font-medium" style={{ width: "245px" }}>
                  Value
                </td>
                <td className="border p-4" style={{ width: "1500px" }}>
                  INR {tenderData.tender_value}
                </td>
              </tr>


              <tr>
                <td className="border p-4 font-medium" style={{ width: "245px" }}>
                  Tender Category
                </td>
                <td className="border p-4" style={{ width: "1500px" }}>
                  {tenderData.tender_category}
                </td>
              </tr>


              <tr>
                <td className="border p-4 font-medium" style={{ width: "245px" }}>
                  Tender Source
                </td>
                <td className="border p-4" style={{ width: "1500px" }}>
                  {tenderData.tender_source}
                </td>
              </tr>


              <tr>
                <td className="border p-4 font-medium" style={{ width: "245px" }}>
                  Tender Fee
                </td>
                <td className="border p-4" style={{ width: "1500px" }}>
                  {tenderData.tender_fee} ({tenderData.fee_from})
                </td>
              </tr>



              <tr>
                <td className="border p-4 font-medium" style={{ width: "245px" }}>
                  EMD Amount
                </td>
                <td className="border p-4" style={{ width: "1500px" }}>
                  {tenderData.emd_amount} ({tenderData.emd_from})
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ height: "20px" }}></div>


      <div>
        <h2 className="bg-blue-700 text-white text-lg font-semibold rounded-t-lg px-6 py-3">
          <span style={{ marginLeft: "27px" }}>Important Dates</span>
        </h2>
        <div className="bg-white border rounded-b-lg p-6 shadow-md border-t-0">
          <table className="w-full table-fixed border-collapse">
            <tbody>

              <tr>
                <td className="border p-4 font-medium" style={{ width: "245px" }}>
                  Submission Date
                </td>
                <td className="border p-4" style={{ width: "1500px" }}>
                  {tenderData.submission_date}
                </td>
              </tr>


              <tr>
                <td className="border p-4 font-medium" style={{ width: "245px" }}>
                  Opening Date
                </td>
                <td className="border p-4" style={{ width: "1500px" }}>
                  {tenderData.opening_tender_date}{" "}
                  {tenderData.opening_tender_time}
                </td>
              </tr>

              <tr>
                <td className="border p-4 font-medium" style={{ width: "245px" }}>
                  Pre-bid Meeting
                </td>
                <td className="border p-4" style={{ width: "1500px" }}>
                  {tenderData.pre_bid_meet_date}
                </td>
              </tr>

              <tr>
                <td className="border p-4 font-medium" style={{ width: "245px" }}>
                  Sale Date
                </td>
                <td className="border p-4" style={{ width: "1500px" }}>
                  {tenderData.sale_date}
                </td>
              </tr>

              <tr>
                <td className="border p-4 font-medium" style={{ width: "245px" }}>
                  State / City
                </td>
                <td className="border p-4" style={{ width: "1500px" }}>
                  {tenderData.state} / {tenderData.city}
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>








      <div style={{ height: "20px" }}></div>

      {/* Qualification Requirements Box */}

      <div>
        <h2 className="bg-blue-700 text-white text-lg font-semibold rounded-t-lg px-6 py-3">
          <span style={{ marginLeft: "27px" }}>Qualification</span>
        </h2>
        <div className="bg-white border rounded-b-lg p-6 shadow-md border-t-0">
          <table className="w-full table-fixed border-collapse">
            <tbody>
              <tr>
                <td className="border p-4 font-medium" style={{ width: "245px" }}>
                  Turnover
                </td>
                <td className="border p-4" style={{ width: "1500px" }}>
                  INR {tenderData.turn_over}
                </td>
              </tr>
              <tr>
                <td className="border p-4 font-medium" style={{ width: "245px" }}>
                  Technical
                </td>
                <td className="border p-4" style={{ width: "1500px" }}>
                  {tenderData.technical_text}
                </td>
              </tr>
              <tr>
                <td className="border p-4 font-medium" style={{ width: "245px" }}>
                  File
                </td>
                <td className="border p-4" style={{ width: "1500px" }}>
                  {tenderData.technical_file && (
                    <a
                      href={tenderData.technical_file}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={fileIcon}
                        alt="File Icon"
                        style={{
                          width: "30px",
                          height: "30px",
                          cursor: "pointer"
                        }}
                      />
                    </a>
                  )}
                </td>

              </tr>

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
    </div>
  );
}