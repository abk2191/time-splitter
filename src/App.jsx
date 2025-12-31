import { useState, useEffect } from "react";
import LiveClock from "./Liveclock";
import CalculateAge from "./AgeCalculator";

function App() {
  // Initialize state from localStorage
  const [timee, setTimee] = useState(() => {
    const saved = localStorage.getItem("splitTimes");
    return saved ? JSON.parse(saved) : [];
  });

  const [isEvening, setIsEvening] = useState(null);
  const [bgColor, setBgColor] = useState(() => {
    const savedColor = localStorage.getItem("appBgColor");
    return savedColor || "#ffffff"; // Default white
  });

  // Save to localStorage whenever timee changes
  useEffect(() => {
    localStorage.setItem("splitTimes", JSON.stringify(timee));
  }, [timee]);

  // Function to calculate percentage of day passed
  function getDayPercentage(rawTime = null) {
    let hours, minutes, seconds;

    if (rawTime) {
      // If rawTime is provided, parse it (it's in "HH:MM:SS" format)
      [hours, minutes, seconds] = rawTime.split(":").map(Number);
    } else {
      // Otherwise, use current time
      const now = new Date();
      hours = now.getHours();
      minutes = now.getMinutes();
      seconds = now.getSeconds();
    }

    // Calculate total seconds passed today
    const totalSecondsPassed = hours * 3600 + minutes * 60 + seconds;

    // Total seconds in a day
    const totalSecondsInDay = 24 * 60 * 60;

    // Calculate percentage
    const percentage = (totalSecondsPassed / totalSecondsInDay) * 100;

    return {
      percentage: percentage.toFixed(2),
      formatted: `${percentage.toFixed(2)}%`,
      time: `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
    };
  }

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
        note: "", // Initialize empty note for this time entry
      },
    ]);
  }

  function handleNoteChange(timestamp, newNote) {
    setTimee((prevTime) =>
      prevTime.map((item) =>
        item.timestamp === timestamp ? { ...item, note: newNote } : item
      )
    );
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
        <span
          style={{
            color: "yellow",
            fontSize: "14px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i class="fa-solid fa-circle-info"></i>
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

  function displayDate() {
    const date = new Date();
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };

    // Split the formatted date
    const formattedDate = date.toLocaleDateString("en-US", options);
    const parts = formattedDate.split(", ");

    // Reorder: "December 17, 2025, Wednesday"
    const reordered = `${parts[1]} ${parts[2]} ${parts[0]}`;

    return <p className="date">{reordered}</p>;
  }

  function getIsEvening() {
    const now = new Date();
    const currentHour = now.getHours();

    const isNightTime = currentHour >= 18 || currentHour < 4;
    setIsEvening(isNightTime);
  }

  function changeBackgroundColor(colorVal) {
    // 1. Update React state
    setBgColor(colorVal);

    // 2. Update DOM immediately
    document.body.style.backgroundColor = colorVal;
    document.body.style.transition = "background-color 0.3s ease";

    // 3. Save to localStorage
    localStorage.setItem("appBgColor", colorVal);
  }

  useEffect(() => {
    const savedColor = localStorage.getItem("appBgColor");
    if (savedColor) {
      document.body.style.backgroundColor = savedColor;
      // Don't need setBgColor here because it's already set in useState initializer
    }
  }, []);

  useEffect(() => {
    // Check immediately
    getIsEvening();

    // Set up interval to check every minute (optional)
    const interval = setInterval(getIsEvening, 60000);

    return () => clearInterval(interval);
  }, []);

  // Reverse the array using filter() - create a new reversed array
  const reversedTimee = timee.filter((item, index, array) => true).reverse();

  // Get current day percentage
  const dayProgress = getDayPercentage();

  return (
    <>
      <div className="time-container">
        <div>
          <input
            type="color"
            className="color-picker"
            value={bgColor}
            onChange={(e) => changeBackgroundColor(e.target.value)}
          />
        </div>
        <div className="time-and-day-container">
          <p className="today">TODAY</p>
          <LiveClock />
          <div className="sun-or-moon">{isEvening ? <p>🌙</p> : <p>☀️</p>}</div>
          {displayDate()}
          <CalculateAge />
        </div>

        <button onClick={getTime}>
          <span className="shadow"></span>
          <span className="edge"></span>
          <span className="front text">
            <i class="fa-solid fa-bolt"></i> SPLIT
          </span>
        </button>

        <button className="delete-button" onClick={clearLocalStorage}>
          <i className="fa-regular fa-trash-can"></i>
        </button>

        {reversedTimee.map((timeObj, index) => {
          // Calculate day progress for THIS specific split time
          const splitDayProgress = getDayPercentage(timeObj.rawTime);

          return (
            <div key={timeObj.timestamp} className="time-div">
              <p className="thime" style={{ fontSize: "25px" }}>
                <span
                  style={{
                    color: "white",
                    // textShadow: "0 0 5px red, 0 0 10px red, 0 0 15px red",
                  }}
                >
                  Split-{reversedTimee.length - index}:
                </span>{" "}
                <span
                  style={{
                    color: "white",
                    textShadow: "0 0 5px white, 0 0 10px white, 0 0 15px white",
                  }}
                >
                  {timeObj.displayTime}
                </span>
              </p>
              <p
                style={{ fontSize: "20px", marginTop: "15px", color: "yellow" }}
              >
                {tillMidnight(timeObj.rawTime)}
              </p>
              {/* Day Progress Display - using splitDayProgress instead of dayProgress */}
              <div
                style={{
                  margin: "15px 0",
                  padding: "15px",

                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    color: "white",
                    textShadow: "0 0 5px white, 0 0 10px white, 0 0 15px white",
                    fontSize: "16px",
                    marginBottom: "10px",
                    textAlign: "left",
                  }}
                >
                  Day Progress: {splitDayProgress.formatted}
                </p>

                {/* Progress Bar */}
                <div
                  style={{
                    width: "100%",
                    height: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "5px",
                    // border: "1px solid grey",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${splitDayProgress.percentage}%`,
                      height: "100%",
                      background:
                        "linear-gradient(90deg, #4c32c1ff, #3c23abff)",
                      transition: "width 0.3s ease",
                      borderRadius: "5px",
                    }}
                  />
                </div>

                {/* Content Editable Note */}
                <p
                  contentEditable
                  suppressContentEditableWarning
                  style={{
                    color: "white",
                    fontSize: "16px",
                    marginTop: "15px",
                    padding: "10px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "5px",
                    minHeight: "40px",
                    outline: "none",
                    textAlign: "left",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                  onBlur={(e) =>
                    handleNoteChange(timeObj.timestamp, e.target.textContent)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.target.blur();
                    }
                  }}
                >
                  {timeObj.note || "Click to add notes..."}
                </p>
              </div>
            </div>
          );
        })}

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
