import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaUserMd,
  FaExclamationTriangle,
  FaSignOutAlt,
  FaComments,
  FaChartLine,
  FaFileAlt,
} from "react-icons/fa";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Import the ReportPage component
import ReportPage from "./ReportPage"; // Adjust the import path as needed

// Initial alerts for testing purposes
const initialAlerts = [];

const DoctorDashboardPage = () => {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("daily");
  const [showFullReport, setShowFullReport] = useState(false);
  const [selectedAlertForReport, setSelectedAlertForReport] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  // Function to fetch intensity data from the API
  const fetchIntensityData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/intensity-history`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data); // Debug log
      return data?.history || [];
    } catch (error) {
      console.error("Error fetching intensity data:", error);
      setError("Failed to fetch patient data. Please try again later.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch report data
  const fetchReportData = async (timeframe = "daily") => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/get_graph`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ timeframe }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw Report Data:", data); // Debug the raw data

      // Handle different possible data structures
      let formattedData = {
        data: [],
      };

      if (data.graph) {
        formattedData.data = data.graph;
      } else if (data.data) {
        formattedData.data = data.data;
      } else {
        // Create a simple data structure if we don't have the expected format
        formattedData.data = [
          {
            date: new Date().toISOString().split("T")[0],
            positive: 0,
            negative: 0,
            neutral: 0,
            anxiety: 0,
            depression: 0,
            stress: 0,
          },
        ];
      }

      console.log("Formatted Report Data:", formattedData); // Debug the formatted data
      setReportData(formattedData);
      setSelectedTimeframe(timeframe);
      setShowReport(true);
    } catch (error) {
      console.error("Error fetching report data:", error);
      setError("Failed to fetch report data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = (data) => {
    if (typeof data === "string" && data.startsWith("iVBORw0KGgo")) {
      return { type: "image", base64: data };
    }

    if (!data || !data.data) return [];

    let dataArray = Array.isArray(data.data) ? data.data : [];
    return dataArray.map((item) => ({
      date: item.date || new Date().toISOString().split("T")[0],
      positive: parseFloat(item.positive || 0),
      negative: parseFloat(item.negative || 0),
      neutral: parseFloat(item.neutral || 0),
      anxiety: parseFloat(item.anxiety || 0),
      depression: parseFloat(item.depression || 0),
      stress: parseFloat(item.stress || 0),
    }));
  };

  // Function to generate a detailed report for a specific alert
  const generateReport = (alert) => {
    setSelectedAlertForReport(alert);
    setShowFullReport(true);
  };

  // Function to close the full report view
  const closeFullReport = () => {
    setShowFullReport(false);
    setSelectedAlertForReport(null);
  };

  useEffect(() => {
    const checkIntensity = async () => {
      try {
        const intensityData = await fetchIntensityData();

        if (intensityData.length > 0) {
          console.log("Processing intensity data:", intensityData);

          // Process each entry from the intensity history
          intensityData.forEach((entry) => {
            // Skip entries with invalid structure or empty text
            if (!entry || !entry.text || !entry.timestamp) {
              return;
            }

            const timestamp = new Date(entry.timestamp);

            // If intensity_scores is missing or empty, analyze the text directly
            if (
              !entry.intensity_scores ||
              !Array.isArray(entry.intensity_scores) ||
              entry.intensity_scores.length === 0
            ) {
              // Log it but don't treat as an error - we'll analyze the text directly
              console.log(
                `Entry has no intensity_scores, analyzing text directly: "${entry.text}"`
              );

              // Simple keyword analysis as a fallback
              const anxietyKeywords = [
                "anxious",
                "anxiety",
                "nervous",
                "worry",
                "panic",
                "fear",
              ];
              const depressionKeywords = [
                "depressed",
                "depression",
                "sad",
                "hopeless",
                "empty",
                "down",
              ];
              const stressKeywords = [
                "stress",
                "stressed",
                "overwhelmed",
                "pressure",
                "tension",
              ];

              const text = entry.text.toLowerCase();

              // Check for anxiety keywords
              if (anxietyKeywords.some((keyword) => text.includes(keyword))) {
                const alertId = `${entry.timestamp}-anxiety`;

                setAlerts((prevAlerts) => {
                  const alertExists = prevAlerts.some(
                    (alert) => alert.id === alertId
                  );

                  if (!alertExists) {
                    console.log(`Detected anxiety in text: "${entry.text}"`);

                    const newAlert = {
                      id: alertId,
                      patient: "User",
                      concern: "Anxiety",
                      score: 9.0, // Default high score for keyword matches
                      message: `Anxiety detected in text`,
                      timestamp: timestamp,
                      text: entry.text,
                    };

                    try {
                      const audio = new Audio("/notification.mp3");
                      audio.play();
                    } catch (err) {
                      console.log("Could not play notification sound");
                    }

                    return [newAlert, ...prevAlerts];
                  }

                  return prevAlerts;
                });
              }

              // Check for depression keywords
              if (
                depressionKeywords.some((keyword) => text.includes(keyword))
              ) {
                const alertId = `${entry.timestamp}-depression`;

                setAlerts((prevAlerts) => {
                  const alertExists = prevAlerts.some(
                    (alert) => alert.id === alertId
                  );

                  if (!alertExists) {
                    console.log(`Detected depression in text: "${entry.text}"`);

                    const newAlert = {
                      id: alertId,
                      patient: "User",
                      concern: "Depression",
                      score: 9.0,
                      message: `Depression detected in text`,
                      timestamp: timestamp,
                      text: entry.text,
                    };

                    try {
                      const audio = new Audio("/notification.mp3");
                      audio.play();
                    } catch (err) {
                      console.log("Could not play notification sound");
                    }

                    return [newAlert, ...prevAlerts];
                  }

                  return prevAlerts;
                });
              }

              // Check for stress keywords
              if (stressKeywords.some((keyword) => text.includes(keyword))) {
                const alertId = `${entry.timestamp}-stress`;

                setAlerts((prevAlerts) => {
                  const alertExists = prevAlerts.some(
                    (alert) => alert.id === alertId
                  );

                  if (!alertExists) {
                    console.log(`Detected stress in text: "${entry.text}"`);

                    const newAlert = {
                      id: alertId,
                      patient: "User",
                      concern: "Stress",
                      score: 9.0,
                      message: `Stress detected in text`,
                      timestamp: timestamp,
                      text: entry.text,
                    };

                    try {
                      const audio = new Audio("/notification.mp3");
                      audio.play();
                    } catch (err) {
                      console.log("Could not play notification sound");
                    }

                    return [newAlert, ...prevAlerts];
                  }

                  return prevAlerts;
                });
              }

              return; // Skip the rest of the processing for this entry
            }

            // Process entries with intensity_scores as before
            entry.intensity_scores.forEach((scoreItem) => {
              // Only process valid score items
              if (
                !scoreItem ||
                typeof scoreItem.score !== "number" ||
                !scoreItem.concern
              ) {
                return;
              }

              // Check if the score is above 8
              if (scoreItem.score > 8) {
                const alertId = `${entry.timestamp}-${scoreItem.concern}`;

                // Add new alert if it doesn't exist
                setAlerts((prevAlerts) => {
                  // Check if this alert already exists
                  const alertExists = prevAlerts.some(
                    (alert) => alert.id === alertId
                  );

                  if (!alertExists) {
                    console.log(
                      `New high intensity alert: ${scoreItem.concern} - ${scoreItem.score}`
                    );

                    const newAlert = {
                      id: alertId,
                      patient: "User", // Replace with actual user ID when available
                      concern: scoreItem.concern,
                      score: scoreItem.score,
                      message: `High intensity detected for ${scoreItem.concern}`,
                      timestamp: timestamp,
                      text: entry.text, // Include the original text
                      intensity_scores: entry.intensity_scores, // Include all intensity scores
                      sentiment: entry.sentiment || "Unknown", // Include sentiment if available
                      keywords: entry.keywords || [], // Include keywords if available
                    };

                    // Play notification sound
                    try {
                      const audio = new Audio("/notification.mp3");
                      audio.play();
                    } catch (err) {
                      console.log("Could not play notification sound");
                    }

                    return [newAlert, ...prevAlerts];
                  }

                  return prevAlerts;
                });
              }
            });
          });
        } else {
          console.log("No intensity data received from API");
        }
      } catch (err) {
        console.error("Error processing intensity data:", err);
      }
    };

    // Initial check
    checkIntensity();

    // Set up polling interval (every 10 seconds)
    const intervalId = setInterval(checkIntensity, 10000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const dismissAlert = (alertId) => {
    setAlerts((prevAlerts) =>
      prevAlerts.filter((alert) => alert.id !== alertId)
    );
  };

  const viewPatientChat = (patientId) => {
    // Navigate to patient chat history
    console.log(`Viewing chat for patient: ${patientId}`);
    // Implement your navigation logic here
    // navigate(`/patient-chat/${patientId}`);
  };

  // Create analysis data object for the report
  const createAnalysisData = (alert) => {
    return {
      concern_categories: {
        [alert.concern]: alert.score,
      },
      concerns: [alert.concern],
      intensity_scores: {
        [alert.concern]: alert.score,
      },
      keywords: alert.keywords || [],
      response_message: `High intensity detected for ${alert.concern}. Original message: "${alert.text}"`,
      sentiment: alert.sentiment || "Unknown",
    };
  };

  // If showing the full report, render the ReportPage component
  if (showFullReport && selectedAlertForReport) {
    return (
      <div className="report-container">
        <div className="fixed top-0 left-0 w-full bg-slate-800 p-4 z-50 flex items-center">
          <button
            onClick={closeFullReport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Back to Dashboard</span>
          </button>
          <h2 className="text-xl font-bold text-white ml-4">
            {selectedAlertForReport.concern} Report for{" "}
            {selectedAlertForReport.patient}
          </h2>
        </div>

        <div className="pt-16">
          <ReportPage
            location={{
              state: {
                analysisData: createAnalysisData(selectedAlertForReport),
              },
            }}
            navigate={navigate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <FaUserMd className="text-4xl text-slate-400" />
            <h1 className="text-2xl font-bold">Doctor's Dashboard</h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <FaBell className="text-2xl text-slate-400 cursor-pointer hover:text-slate-300 transition-colors" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {alerts.length}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <FaSignOutAlt className="text-lg" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Alerts Section */}
          <div className="md:col-span-2 bg-slate-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaExclamationTriangle className="mr-2 text-red-500" />
              High Intensity Alerts
              <span className="text-sm text-slate-400 ml-2">
                (Scores &gt; 8)
              </span>
            </h2>

            {loading && alerts.length === 0 && (
              <p className="text-slate-400">Loading alerts...</p>
            )}

            {error && (
              <div className="bg-red-500/20 p-4 rounded-lg mb-4">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {!loading && !error && alerts.length === 0 && (
              <p className="text-slate-400">
                No high intensity alerts at this time.
              </p>
            )}

            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-red-500/20 p-4 rounded-lg transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold flex items-center">
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                        {alert.patient}
                      </h3>
                      <p className="text-sm text-slate-300">
                        <span className="font-medium">{alert.concern}: </span>
                        {alert.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        "{alert.text}"
                      </p>
                      <p className="text-xs text-red-400 mt-1">
                        Intensity Score: {alert.score.toFixed(1)}/10
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => viewPatientChat(alert.patient)}
                          className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <FaComments className="text-xs" />
                          View Chat
                        </button>
                        <button
                          onClick={() => generateReport(alert)}
                          className="text-xs bg-blue-700 hover:bg-blue-600 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <FaFileAlt className="text-xs" />
                          Generate Report
                        </button>
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {format(alert.timestamp, "MMM d, yyyy - HH:mm")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-slate-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Dashboard Stats</h2>
            <div className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-sm text-slate-400 mb-1">Active Alerts</h3>
                <p className="text-2xl font-bold text-red-400">
                  {alerts.length}
                </p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-sm text-slate-400 mb-1">
                  Patients Monitored
                </h3>
                <p className="text-2xl font-bold">5</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-sm text-slate-400 mb-1">Response Rate</h3>
                <p className="text-2xl font-bold text-green-400">95%</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <button
                  onClick={() => fetchReportData("daily")}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <FaChartLine className="text-lg" />
                  <span>View Patient Reports</span>
                </button>
              </div>
            </div>

            {/* Report Modal */}
            {showReport && reportData && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-slate-800 p-6 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Patient Report</h3>
                    <button
                      onClick={() => setShowReport(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Timeframe Selector */}
                  <div className="flex space-x-2 mb-6">
                    <button
                      onClick={() => fetchReportData("daily")}
                      className={`px-3 py-1 rounded ${
                        selectedTimeframe === "daily"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => fetchReportData("weekly")}
                      className={`px-3 py-1 rounded ${
                        selectedTimeframe === "weekly"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => fetchReportData("monthly")}
                      className={`px-3 py-1 rounded ${
                        selectedTimeframe === "monthly"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      Monthly
                    </button>
                  </div>

                  {/* Sentiment Analysis Graph */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Sentiment Analysis</h4>
                    <div className="bg-slate-700 p-4 rounded-lg">
                      {formatChartData(reportData).length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart
                            data={formatChartData(reportData)}
                            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#444"
                            />
                            <XAxis
                              dataKey="date"
                              stroke="#aaa"
                              tick={{ fill: "#aaa", fontSize: 12 }}
                            />
                            <YAxis
                              stroke="#aaa"
                              tick={{ fill: "#aaa", fontSize: 12 }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "none",
                                borderRadius: "4px",
                                color: "#fff",
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="positive"
                              name="Positive"
                              stroke="#4ade80"
                              activeDot={{ r: 8 }}
                              strokeWidth={2}
                            />
                            <Line
                              type="monotone"
                              dataKey="negative"
                              name="Negative"
                              stroke="#f87171"
                              activeDot={{ r: 8 }}
                              strokeWidth={2}
                            />
                            <Line
                              type="monotone"
                              dataKey="neutral"
                              name="Neutral"
                              stroke="#60a5fa"
                              activeDot={{ r: 8 }}
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-slate-400">
                          No sentiment data available for this timeframe
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mental Health Concerns Graph */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Mental Health Concerns</h4>
                    <div className="bg-slate-700 p-4 rounded-lg">
                      {formatChartData(reportData).length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart
                            data={formatChartData(reportData)}
                            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#444"
                            />
                            <XAxis
                              dataKey="date"
                              stroke="#aaa"
                              tick={{ fill: "#aaa", fontSize: 12 }}
                            />
                            <YAxis
                              stroke="#aaa"
                              tick={{ fill: "#aaa", fontSize: 12 }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "none",
                                borderRadius: "4px",
                                color: "#fff",
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="anxiety"
                              name="Anxiety"
                              stroke="#fbbf24"
                              activeDot={{ r: 8 }}
                              strokeWidth={2}
                            />
                            <Line
                              type="monotone"
                              dataKey="depression"
                              name="Depression"
                              stroke="#a78bfa"
                              activeDot={{ r: 8 }}
                              strokeWidth={2}
                            />
                            <Line
                              type="monotone"
                              dataKey="stress"
                              name="Stress"
                              stroke="#fb7185"
                              activeDot={{ r: 8 }}
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-slate-400">
                          No mental health data available for this timeframe
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Raw Data Toggle */}
                  <details className="mb-4">
                    <summary className="cursor-pointer text-slate-400 hover:text-white mb-2">
                      View Raw JSON Data
                    </summary>
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <pre className="text-xs overflow-auto text-slate-300">
                        {JSON.stringify(reportData, null, 2)}
                      </pre>
                    </div>
                  </details>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowReport(false)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
