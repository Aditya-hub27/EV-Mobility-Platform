import { useEffect, useState } from "react";
import "./App.css";
import MapView from "./MapView";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  // =========================================================
  // API STATE
  // =========================================================

  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [stationError, setStationError] = useState("");

  // =========================================================
  // FETCH CHARGING STATIONS FROM BACKEND
  // =========================================================

  const fetchStations = async () => {
    try {
      setLoadingStations(true);
      setStationError("");

      const response = await fetch(
       "https://ev-mobility-platform-production.up.railway.app/api/charging-stations"
      );

      if (!response.ok) {
        throw new Error("Backend API request failed");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Unable to load stations");
      }

      const formattedStations = (data.stations || []).map((station) => ({
        id: station.id,
        name: station.name,
        location: station.location,
        latitude: Number(station.latitude),
        longitude: Number(station.longitude),
        chargerType: station.charger_type,
        power: `${station.power_kw} kW`,
        powerKw: Number(station.power_kw),
        status: station.status,
        distance: `${station.distance_km} km`,
        distanceKm: Number(station.distance_km),
        createdAt: station.created_at,
      }));

      setStations(formattedStations);
    } catch (error) {
      console.error("Charging station API error:", error);

      setStationError(
        "Unable to load charging stations. Please make sure the backend is running on port 5000."
      );
    } finally {
      setLoadingStations(false);
    }
  };

  // Fetch data when app starts
  useEffect(() => {
    fetchStations();
  }, []);

  // =========================================================
  // CALCULATED DATA
  // =========================================================

  const availableStations = stations.filter(
    (station) => station.status === "Available"
  );

  const busyStations = stations.filter(
    (station) => station.status === "Busy"
  );

  const totalStations = stations.length;

  // =========================================================
  // NAVIGATION
  // =========================================================

  const navigateToStation = (station) => {
    if (!station) return;

    const destination =
      station.latitude && station.longitude
        ? `${station.latitude},${station.longitude}`
        : `${station.name}, ${station.location}, Varanasi, India`;

    const googleMapsUrl =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${encodeURIComponent(destination)}` +
      `&travelmode=driving`;

    window.open(googleMapsUrl, "_blank");
  };

  const startNavigation = () => {
    if (stations.length > 0) {
      navigateToStation(stations[0]);
      return;
    }

    const destination =
      "Varanasi Cantt Fast Charge, Varanasi, Uttar Pradesh, India";

    const googleMapsUrl =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${encodeURIComponent(destination)}` +
      `&travelmode=driving`;

    window.open(googleMapsUrl, "_blank");
  };

  // =========================================================
  // SIDEBAR
  // =========================================================

  const renderSidebar = () => (
    <aside className="sidebar">
      {/* LOGO */}
      <div className="logo">
        <div className="logo-icon">⚡</div>

        <div>
          <h2>EV Mobility</h2>
          <span>INTELLIGENCE</span>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav>
        <button
          className={
            activePage === "Dashboard"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() => setActivePage("Dashboard")}
        >
          📊 <span>Dashboard</span>
        </button>

        <button
          className={
            activePage === "Map"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() => setActivePage("Map")}
        >
          🗺️ <span>Live Map</span>
        </button>

        <button
          className={
            activePage === "Charging"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() => setActivePage("Charging")}
        >
          ⚡ <span>Charging</span>
        </button>

        <button
          className={
            activePage === "Routes"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() => setActivePage("Routes")}
        >
          🚗 <span>Route Planner</span>
        </button>

        <button
          className={
            activePage === "Analytics"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() => setActivePage("Analytics")}
        >
          📈 <span>Analytics</span>
        </button>
      </nav>

      {/* SYSTEM STATUS */}
      <div className="sidebar-bottom">
        <div className="system-status">
          <span className="status-dot"></span>

          <div>
            <strong>System Online</strong>
            <small>All services operational</small>
          </div>
        </div>
      </div>
    </aside>
  );

  // =========================================================
  // HEADER
  // =========================================================

  const renderHeader = () => (
    <header className="header">
      <div>
        <p className="eyebrow">
          EV MOBILITY INTELLIGENCE PLATFORM
        </p>

        <h1>{activePage}</h1>
      </div>

      <div className="header-right">
        <div className="location">
          📍 Varanasi, India
        </div>

        <div className="profile">
          <div className="avatar">A</div>

          <div>
            <strong>EV User</strong>
            <small>Driver</small>
          </div>
        </div>
      </div>
    </header>
  );

  // =========================================================
  // LOADING COMPONENT
  // =========================================================

  const renderStationLoading = () => (
    <div className="station-list">
      <div className="card">
        <p>Loading charging stations...</p>
      </div>
    </div>
  );

  // =========================================================
  // ERROR COMPONENT
  // =========================================================

  const renderStationError = () => (
    <div className="station-list">
      <div className="card">
        <p>{stationError}</p>

        <button
          className="primary-btn"
          onClick={fetchStations}
        >
          Retry
        </button>
      </div>
    </div>
  );

  // =========================================================
  // STATION CARD
  // =========================================================

  const renderStation = (station, buttonText = "Navigate") => (
    <div className="station" key={station.id}>
      <div className="station-icon">
        ⚡
      </div>

      <div className="station-info">
        <strong>{station.name}</strong>

        <span>
          📍 {station.location} • {station.distance}
        </span>
      </div>

      <div className="station-power">
        <strong>{station.power}</strong>

        <span>
          {station.chargerType || "Fast Charger"}
        </span>
      </div>

      <div
        className={
          station.status === "Available"
            ? "available"
            : "busy"
        }
      >
        {station.status}
      </div>

      <button
        className="charge-btn"
        onClick={() => navigateToStation(station)}
      >
        {buttonText}
      </button>
    </div>
  );

  // =========================================================
  // DASHBOARD
  // =========================================================

  const renderDashboard = () => (
    <>
      {/* STATS */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">
            ⚡
          </div>

          <div>
            <span>Available Chargers</span>

            <h2>{loadingStations ? "..." : availableStations.length}</h2>

            <small className="positive">
              Live from MySQL
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            🔋
          </div>

          <div>
            <span>Total Stations</span>

            <h2>{loadingStations ? "..." : totalStations}</h2>

            <small className="positive">
              Backend connected
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            🚗
          </div>

          <div>
            <span>Busy Stations</span>

            <h2>{loadingStations ? "..." : busyStations.length}</h2>

            <small>
              Current network status
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            🌱
          </div>

          <div>
            <span>Network Status</span>

            <h2>
              {stationError ? "Offline" : "Online"}
            </h2>

            <small className="positive">
              {stationError
                ? "Check backend"
                : "API connected"}
            </small>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="content-grid">
        {/* MAP */}
        <div className="card map-card">
          <div className="card-header">
            <div>
              <h2>Charging Network</h2>
              <p>Live charging infrastructure</p>
            </div>

            <button
              className="outline-btn"
              onClick={() => setActivePage("Map")}
            >
              View Full Map
            </button>
          </div>

          <div className="map">
            <MapView />
          </div>
        </div>

        {/* AI RECOMMENDATION */}
        <div className="card ai-card">
          <div className="ai-title">
            <div className="ai-icon">
              🤖
            </div>

            <div>
              <h2>AI Recommendation</h2>
              <p>Smart charging suggestion</p>
            </div>
          </div>

          <div className="recommendation">
            <span className="recommendation-tag">
              OPTIMAL
            </span>

            <h3>
              {stations.length > 0
                ? stations[0].name
                : "Varanasi Cantt Fast Charge"}
            </h3>

            <p>
              Recommended charging station based on
              current station availability and distance.
            </p>

            <div className="recommendation-data">
              <div>
                <span>Distance</span>

                <strong>
                  {stations.length > 0
                    ? stations[0].distance
                    : "1.2 km"}
                </strong>
              </div>

              <div>
                <span>Charger</span>

                <strong>
                  {stations.length > 0
                    ? stations[0].power
                    : "150 kW"}
                </strong>
              </div>

              <div>
                <span>Status</span>

                <strong>
                  {stations.length > 0
                    ? stations[0].status
                    : "Available"}
                </strong>
              </div>
            </div>

            <button
              className="primary-btn"
              onClick={startNavigation}
            >
              Start Navigation →
            </button>
          </div>
        </div>
      </section>

      {/* STATIONS */}
      <section className="card stations-card">
        <div className="card-header">
          <div>
            <h2>Nearby Charging Stations</h2>
            <p>
              Real-time data from MySQL database
            </p>
          </div>

          <button
            className="outline-btn"
            onClick={() => setActivePage("Charging")}
          >
            View All
          </button>
        </div>

        {loadingStations
          ? renderStationLoading()
          : stationError
          ? renderStationError()
          : (
            <div className="station-list">
              {stations.slice(0, 5).map((station) =>
                renderStation(station, "Navigate")
              )}
            </div>
          )}
      </section>
    </>
  );

  // =========================================================
  // LIVE MAP
  // =========================================================

  const renderLiveMap = () => (
    <div className="live-map-page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">
            REAL-TIME EV INFRASTRUCTURE
          </p>

          <h2>Live Charging Map</h2>

          <p>
            Explore EV charging stations across Varanasi.
          </p>
        </div>

        <span className="live-badge">
          ● LIVE
        </span>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Varanasi Charging Network</h2>

            <p>
              {totalStations} stations from backend
            </p>
          </div>

          <span className="available">
            Network Online
          </span>
        </div>

        <div className="map large-map">
          <MapView />
        </div>
      </div>

      {/* MAP STATION LIST */}
      <div className="card stations-card">
        <div className="card-header">
          <div>
            <h2>Nearby Stations</h2>

            <p>
              Available charging points
            </p>
          </div>
        </div>

        {loadingStations
          ? renderStationLoading()
          : stationError
          ? renderStationError()
          : (
            <div className="station-list">
              {stations.map((station) =>
                renderStation(station, "Navigate")
              )}
            </div>
          )}
      </div>
    </div>
  );

  // =========================================================
  // CHARGING PAGE
  // =========================================================

  const renderCharging = () => (
    <div className="charging-page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">
            EV CHARGING NETWORK
          </p>

          <h2>Charging Stations</h2>

          <p>
            Find and monitor EV charging stations in Varanasi.
          </p>
        </div>

        <button
          className="outline-btn"
          onClick={fetchStations}
        >
          Refresh
        </button>
      </div>

      {/* API SUMMARY */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">
            ⚡
          </div>

          <div>
            <span>All Stations</span>
            <h2>{loadingStations ? "..." : totalStations}</h2>
            <small>From MySQL</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            ✓
          </div>

          <div>
            <span>Available</span>
            <h2>
              {loadingStations
                ? "..."
                : availableStations.length}
            </h2>

            <small className="positive">
              Ready to charge
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            ⏳
          </div>

          <div>
            <span>Busy</span>
            <h2>
              {loadingStations
                ? "..."
                : busyStations.length}
            </h2>

            <small>
              Currently occupied
            </small>
          </div>
        </div>
      </section>

      {loadingStations
        ? renderStationLoading()
        : stationError
        ? renderStationError()
        : (
          <div className="station-list">
            {stations.map((station) =>
              renderStation(station, "Details")
            )}
          </div>
        )}
    </div>
  );

  // =========================================================
  // ROUTE PLANNER
  // =========================================================

  const renderRoutePlanner = () => {
    const [firstStation] = stations;

    return (
      <div className="route-page">
        <div className="page-intro">
          <div>
            <p className="eyebrow">
              SMART EV ROUTING
            </p>

            <h2>Route Planner</h2>

            <p>
              Plan an efficient route with EV charging support.
            </p>
          </div>
        </div>

        <section className="route-grid">
          {/* ROUTE FORM */}
          <div className="card route-form">
            <h2>Plan Your Journey</h2>

            <p>
              Enter your starting point and destination.
            </p>

            <div className="route-input-group">
              <label>
                Starting Point
              </label>

              <input
                type="text"
                defaultValue="Varanasi, India"
                placeholder="Enter starting point"
              />
            </div>

            <div className="route-input-group">
              <label>
                Destination
              </label>

              <input
                type="text"
                defaultValue={
                  firstStation
                    ? firstStation.location
                    : "Assi Ghat, Varanasi"
                }
                placeholder="Enter destination"
              />
            </div>

            <div className="route-options">
              <div>
                <span>🔋 Battery</span>
                <strong>72%</strong>
              </div>

              <div>
                <span>⚡ Range</span>
                <strong>285 km</strong>
              </div>
            </div>

            <button
              className="primary-btn"
              onClick={() => {
                const destination =
                  firstStation
                    ? `${firstStation.name}, ${firstStation.location}, Varanasi, Uttar Pradesh, India`
                    : "Assi Ghat, Varanasi, Uttar Pradesh, India";

                const url =
                  `https://www.google.com/maps/dir/?api=1` +
                  `&destination=${encodeURIComponent(destination)}` +
                  `&travelmode=driving`;

                window.open(url, "_blank");
              }}
            >
              Plan Route →
            </button>
          </div>

          {/* ROUTE RESULT */}
          <div className="card route-result">
            <div className="route-result-header">
              <div>
                <span>RECOMMENDED CHARGING POINT</span>

                <h2>
                  {firstStation
                    ? firstStation.name
                    : "Varanasi → Assi Ghat"}
                </h2>
              </div>

              <div className="route-time">
                {firstStation
                  ? firstStation.distance
                  : "24 min"}
              </div>
            </div>

            <div className="route-details">
              <div>
                <span>Distance</span>

                <strong>
                  {firstStation
                    ? firstStation.distance
                    : "8.2 km"}
                </strong>
              </div>

              <div>
                <span>Power</span>

                <strong>
                  {firstStation
                    ? firstStation.power
                    : "150 kW"}
                </strong>
              </div>

              <div>
                <span>Status</span>

                <strong>
                  {firstStation
                    ? firstStation.status
                    : "Available"}
                </strong>
              </div>
            </div>

            <div className="route-message">
              ✓ Charging station data is coming
              directly from the EV Mobility backend.
            </div>

            <button
              className="primary-btn"
              onClick={() =>
                firstStation
                  ? navigateToStation(firstStation)
                  : startNavigation()
              }
            >
              Start Navigation →
            </button>
          </div>
        </section>
      </div>
    );
  };

  // =========================================================
  // ANALYTICS
  // =========================================================

  const renderAnalytics = () => (
    <div className="analytics-page">
      {/* PAGE INTRO */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">
            EV NETWORK ANALYTICS
          </p>

          <h2>
            Analytics Dashboard
          </h2>

          <p>
            Monitor charging activity, energy consumption
            and network performance across Varanasi.
          </p>
        </div>

        <div className="analytics-period">
          <button className="period-btn active">
            7 Days
          </button>

          <button className="period-btn">
            30 Days
          </button>

          <button className="period-btn">
            3 Months
          </button>
        </div>
      </div>

      {/* ANALYTICS STATS */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">
            ⚡
          </div>

          <div>
            <span>Total Stations</span>

            <h2>
              {loadingStations
                ? "..."
                : totalStations}
            </h2>

            <small className="positive">
              Live database count
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            🔋
          </div>

          <div>
            <span>Available Stations</span>

            <h2>
              {loadingStations
                ? "..."
                : availableStations.length}
            </h2>

            <small className="positive">
              Currently available
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            🚗
          </div>

          <div>
            <span>Busy Stations</span>

            <h2>
              {loadingStations
                ? "..."
                : busyStations.length}
            </h2>

            <small>
              Current utilization
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            🌱
          </div>

          <div>
            <span>API Status</span>

            <h2>
              {stationError
                ? "Error"
                : "OK"}
            </h2>

            <small className="positive">
              MySQL + Express
            </small>
          </div>
        </div>
      </section>

      {/* ANALYTICS GRID */}
      <section className="analytics-grid">
        {/* ENERGY CHART */}
        <div className="card analytics-card">
          <div className="card-header">
            <div>
              <h2>Energy Consumption</h2>

              <p>
                Energy delivered across the network
              </p>
            </div>

            <span className="chart-value">
              Live Network
            </span>
          </div>

          <div className="chart">
            <div className="chart-y-axis">
              <span>12 MWh</span>
              <span>8 MWh</span>
              <span>4 MWh</span>
              <span>0</span>
            </div>

            <div className="chart-area">
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>

              <div className="bars">
                <div className="bar-column">
                  <div
                    className="bar"
                    style={{ height: "55%" }}
                  ></div>

                  <span>Mon</span>
                </div>

                <div className="bar-column">
                  <div
                    className="bar"
                    style={{ height: "72%" }}
                  ></div>

                  <span>Tue</span>
                </div>

                <div className="bar-column">
                  <div
                    className="bar"
                    style={{ height: "64%" }}
                  ></div>

                  <span>Wed</span>
                </div>

                <div className="bar-column">
                  <div
                    className="bar"
                    style={{ height: "82%" }}
                  ></div>

                  <span>Thu</span>
                </div>

                <div className="bar-column">
                  <div
                    className="bar"
                    style={{ height: "70%" }}
                  ></div>

                  <span>Fri</span>
                </div>

                <div className="bar-column">
                  <div
                    className="bar"
                    style={{ height: "91%" }}
                  ></div>

                  <span>Sat</span>
                </div>

                <div className="bar-column">
                  <div
                    className="bar"
                    style={{ height: "78%" }}
                  ></div>

                  <span>Sun</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATION PERFORMANCE */}
        <div className="card analytics-card">
          <div className="card-header">
            <div>
              <h2>Station Performance</h2>

              <p>
                Charging station utilization
              </p>
            </div>
          </div>

          <div className="performance-list">
            {stations.length === 0 && !loadingStations && (
              <p>No station data available.</p>
            )}

            {stations.slice(0, 5).map((station) => {
              const utilization =
                station.status === "Busy"
                  ? 85
                  : 60;

              return (
                <div
                  className="performance-item"
                  key={station.id}
                >
                  <div className="performance-top">
                    <strong>
                      {station.name}
                    </strong>

                    <span>
                      {utilization}%
                    </span>
                  </div>

                  <div className="progress">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${utilization}%`,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECOND ANALYTICS ROW */}
      <section className="analytics-bottom-grid">
        {/* CHARGING ACTIVITY */}
        <div className="card analytics-card">
          <div className="card-header">
            <div>
              <h2>Charging Activity</h2>

              <p>
                Network activity overview
              </p>
            </div>
          </div>

          <div className="activity-list">
            <div className="activity-row">
              <span>🌅 Morning</span>

              <strong>214 sessions</strong>

              <span className="activity-percent">
                17%
              </span>
            </div>

            <div className="activity-row">
              <span>☀️ Afternoon</span>

              <strong>438 sessions</strong>

              <span className="activity-percent">
                34%
              </span>
            </div>

            <div className="activity-row">
              <span>🌆 Evening</span>

              <strong>512 sessions</strong>

              <span className="activity-percent">
                40%
              </span>
            </div>

            <div className="activity-row">
              <span>🌙 Night</span>

              <strong>120 sessions</strong>

              <span className="activity-percent">
                9%
              </span>
            </div>
          </div>
        </div>

        {/* ENVIRONMENTAL IMPACT */}
        <div className="card analytics-card impact-card">
          <div className="card-header">
            <div>
              <h2>Environmental Impact</h2>

              <p>
                Positive impact generated by EV charging
              </p>
            </div>
          </div>

          <div className="impact-stats">
            <div className="impact-item">
              <span className="impact-icon">
                🌱
              </span>

              <div>
                <strong>19.4 t</strong>
                <small>CO₂ Saved</small>
              </div>
            </div>

            <div className="impact-item">
              <span className="impact-icon">
                🌳
              </span>

              <div>
                <strong>892</strong>
                <small>Trees Equivalent</small>
              </div>
            </div>

            <div className="impact-item">
              <span className="impact-icon">
                ⚡
              </span>

              <div>
                <strong>58.6 MWh</strong>
                <small>Clean Energy</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  // =========================================================
  // MAIN RENDER
  // =========================================================

  return (
    <div className="app">
      {/* SIDEBAR */}
      {renderSidebar()}

      {/* MAIN */}
      <main className="main">
        {/* HEADER */}
        {renderHeader()}

        {/* PAGE CONTENT */}

        {activePage === "Dashboard" &&
          renderDashboard()}

        {activePage === "Map" &&
          renderLiveMap()}

        {activePage === "Charging" &&
          renderCharging()}

        {activePage === "Routes" &&
          renderRoutePlanner()}

        {activePage === "Analytics" &&
          renderAnalytics()}
      </main>
    </div>
  );
}

export default App;
