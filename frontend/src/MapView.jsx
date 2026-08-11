import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapView() {
  // Varanasi coordinates
  const varanasi = [25.3176, 82.9739];

  const stations = [
    {
      name: "Varanasi Cantt Fast Charge",
      position: [25.3336, 82.9873],
      power: "150 kW",
      status: "Available",
    },
    {
      name: "Lanka EV Energy Hub",
      position: [25.2677, 82.9913],
      power: "120 kW",
      status: "Available",
    },
    {
      name: "Sigra EV Station",
      position: [25.3174, 82.9883],
      power: "60 kW",
      status: "Busy",
    },
  ];

  return (
    <MapContainer
      center={varanasi}
      zoom={13}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "350px",
      }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Your Location */}
      <Marker position={varanasi}>
        <Popup>
          <strong>Your Location</strong>
          <br />
          Varanasi, India
        </Popup>
      </Marker>

      {/* Charging Stations */}
      {stations.map((station, index) => (
        <Marker
          key={index}
          position={station.position}
        >
          <Popup>
            <strong>{station.name}</strong>
            <br />
            Power: {station.power}
            <br />
            Status: {station.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;