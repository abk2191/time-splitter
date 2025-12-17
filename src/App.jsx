import { useState, useEffect } from "react";
import LiveClock from "./Liveclock";

function App() {
  // Initialize state from localStorage
  const [timee, setTimee] = useState(() => {
    const saved = localStorage.getItem("splitTimes");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever timee changes
  useEffect(() => {
    localStorage.setItem("splitTimes", JSON.stringify(timee));
  }, [timee]);

  function getTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    // Convert to 12-hour format
    const ampm = hours >= 12 ? "PM" : "AM";
    const twelveHour = hours % 12 || 12; // Convert 0 to 12 for 12 AM

    // Store both 12-hour format with AM/PM and the raw time for calculations
    const timeString = `${twelveHour}:${minutes}:${seconds} ${ampm}`;
    const rawTimeForCalc = `${hours}:${minutes}:${seconds}`; // 24-hour format for midnight calculation

    setTimee((prevTime) => [
      ...prevTime,
      {
        displayTime: timeString, // For display with AM/PM
        rawTime: rawTimeForCalc, // For midnight calculation (24h format)
        timestamp: now.getTime(), // Unique ID
      },
    ]);
  }

  function tillMidnight(rawTime) {
    // Parse the input time (24-hour format)
    const [hours, minutes, seconds] = rawTime.split(":").map(Number);

    // Calculate total seconds from input time
    const inputTotalSeconds = hours * 3600 + minutes * 60 + seconds;

    // Total seconds in a day
    const totalSecondsInDay = 24 * 60 * 60;

    // Remaining seconds until midnight
    const remainingSeconds = totalSecondsInDay - inputTotalSeconds;

    // If it's exactly midnight
    if (remainingSeconds <= 0) {
      return "It's midnight!";
    }

    // Convert to hours, minutes, seconds
    const diffHours = Math.floor(remainingSeconds / 3600);
    const diffMinutes = Math.floor((remainingSeconds % 3600) / 60);
    const diffSeconds = remainingSeconds % 60;

    // Format the result
    return (
      <>
        <span style={{ color: "yellow" }}>
          {diffHours} hours {diffMinutes} minutes {diffSeconds} seconds till
          midnight
        </span>
      </>
    );
  }

  function clearLocalStorage() {
    // Clear localStorage for this app
    localStorage.removeItem("splitTimes");

    // Clear the state
    setTimee([]);
  }

  return (
    <>
      <div className="time-container">
        <LiveClock />
        <button onClick={getTime}>
          <span className="shadow"></span>
          <span className="edge"></span>
          <span className="front text">SPLIT</span>
        </button>

        <button className="delete-button" onClick={clearLocalStorage}>
          <i class="fa-regular fa-trash-can"></i>
        </button>

        {timee.map((timeObj, index) => (
          <div key={timeObj.timestamp} className="time-div">
            <p className="thime" style={{ fontSize: "25px" }}>
              Split-{index + 1}: {timeObj.displayTime}
            </p>
            <p style={{ fontSize: "20px" }}>{tillMidnight(timeObj.rawTime)}</p>
          </div>
        ))}

        {timee.length === 0 && (
          <div
            style={{
              marginTop: "30px",
              padding: "20px",
              textAlign: "center",
              color: "#718096",
              fontSize: "18px",
            }}
          >
            Click "SPLIT" to record your first time
          </div>
        )}
      </div>
    </>
  );
}

export default App;
