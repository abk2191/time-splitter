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
    return savedColor || "#ffffff";
  });

  // Add state for live counters
  const [liveCounters, setLiveCounters] = useState({});

  // Save to localStorage whenever timee changes
  useEffect(() => {
    localStorage.setItem("splitTimes", JSON.stringify(timee));
  }, [timee]);

  // Function to calculate time ago
  function getTimeAgo(timestamp) {
    const now = new Date().getTime();
    const diffMs = now - timestamp;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  }

  // Function to calculate percentage of day passed
  function getDayPercentage(rawTime = null) {
    let hours, minutes, seconds;

    if (rawTime) {
      [hours, minutes, seconds] = rawTime.split(":").map(Number);
    } else {
      const now = new Date();
      hours = now.getHours();
      minutes = now.getMinutes();
      seconds = now.getSeconds();
    }

    const totalSecondsPassed = hours * 3600 + minutes * 60 + seconds;
    const totalSecondsInDay = 24 * 60 * 60;
    const percentage = (totalSecondsPassed / totalSecondsInDay) * 100;

    return {
      percentage: percentage.toFixed(2),
      formatted: `${percentage.toFixed(2)}%`,
      time: `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
    };
  }

  // Updated function to calculate remaining time until midnight
  function getRemainingTime(rawTime) {
    // Parse the input time (24-hour format)
    const [hours, minutes, seconds] = rawTime.split(":").map(Number);

    // Calculate total seconds from input time
    const inputTotalSeconds = hours * 3600 + minutes * 60 + seconds;

    // Total seconds in a day
    const totalSecondsInDay = 24 * 60 * 60;

    // Remaining seconds until midnight
    let remainingSeconds = totalSecondsInDay - inputTotalSeconds;

    // If it's exactly midnight or past
    if (remainingSeconds <= 0) {
      return "It's midnight!";
    }

    // Convert to hours, minutes, seconds
    const diffHours = Math.floor(remainingSeconds / 3600);
    const diffMinutes = Math.floor((remainingSeconds % 3600) / 60);
    const diffSeconds = remainingSeconds % 60;

    // Return with gold numbers
    return (
      <>
        <span style={{ color: "gold" }}>{diffHours}</span>h{" "}
        <span style={{ color: "gold" }}>{diffMinutes}</span>m{" "}
        <span style={{ color: "gold" }}>{diffSeconds}</span>s till midnight 🌃
      </>
    );
  }

  // Function to update live counters
  function updateLiveCounters() {
    const newCounters = {};
    const now = new Date();
    const currentTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    
    // Only update the latest split (first in reversed array or last in original)
    if (timee.length > 0) {
      const latestTime = timee[timee.length - 1];
      newCounters[latestTime.timestamp] = getRemainingTime(currentTime);
    }
    
    setLiveCounters(newCounters);
  }

  // Update live counters every second
  useEffect(() => {
    // Initial update
    updateLiveCounters();
    
    const interval = setInterval(updateLiveCounters, 1000);
    
    return () => clearInterval(interval);
  }, [timee]); // Re-run when timee changes

  function getTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    const twelveHour = hours % 12 || 12;

    const timeString = `${twelveHour}:${minutes}:${seconds} ${ampm}`;
    const rawTimeForCalc = `${hours}:${minutes}:${seconds}`;

    const newTimeObj = {
      displayTime: timeString,
      rawTime: rawTimeForCalc,
      timestamp: now.getTime(),
      note: "",
    };

    setTimee((prevTime) => [...prevTime, newTimeObj]);
    
    // The useEffect will handle updating the live counter for the new split
  }

  function handleNoteChange(timestamp, newNote) {
    setTimee((prevTime) =>
      prevTime.map((item) =>
        item.timestamp === timestamp ? { ...item, note: newNote } : item
      )
    );
  }

  function clearLocalStorage() {
    localStorage.removeItem("splitTimes");
    setTimee([]);
    setLiveCounters({});
  }

  function displayDate() {
    const date = new Date();
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };

    const formattedDate = date.toLocaleDateString("en-US", options);
    const parts = formattedDate.split(", ");
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
    setBgColor(colorVal);
    document.body.style.backgroundColor = colorVal;
    document.body.style.transition = "background-color 0.3s ease";
    localStorage.setItem("appBgColor", colorVal);
  }

  useEffect(() => {
    const savedColor = localStorage.getItem("appBgColor");
    if (savedColor) {
      document.body.style.backgroundColor = savedColor;
    }
  }, []);

  useEffect(() => {
    getIsEvening();
    const interval = setInterval(getIsEvening, 60000);
    return () => clearInterval(interval);
  }, []);

  // Reverse the array
  const reversedTimee = timee.filter(() => true).reverse();
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
          <p className="today">JUST FOR TODAY</p>
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
          const splitDayProgress = getDayPercentage(timeObj.rawTime);
          const timeAgo = getTimeAgo(timeObj.timestamp);
          
          // Check if this is the latest split (first in reversed array)
          const isLatest = index === 0;
          
          // Get the live counter value or fallback to static calculation
          const counterText = isLatest 
            ? (liveCounters[timeObj.timestamp] || getRemainingTime(timeObj.rawTime))
            : getRemainingTime(timeObj.rawTime);

          return (
            <div key={timeObj.timestamp} className="time-div">
              <p className="thime" style={{ fontSize: "25px", textAlign: "center"}}>
                
                  
                
                <span style={{ color: "white" }}>
                  {timeObj.displayTime}
                </span>
              </p>
              
              <p
                style={{
                  fontSize: "14px",
                  marginTop: "5px",
                  color: "white",
                  textAlign: "center",
                }}
              >
                {timeAgo}
              </p>
              
              <p
                style={{ 
                  fontSize: "16px",
                  marginTop: "15px", 
                  color: "white",
                  whiteSpace: "nowrap",
                  textAlign: "center", // Centered text
                  transition: "all 0.1s ease"
                }}
              >
                <i className="fa-regular fa-hourglass" style={{ marginRight: "8px" }}></i>
                {counterText}
              </p>
              
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

                <div
                  style={{
                    width: "100%",
                    height: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "5px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${splitDayProgress.percentage}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #4c32c1ff, #3c23abff)",
                      transition: "width 0.3s ease",
                      borderRadius: "5px",
                    }}
                  />
                </div>

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
