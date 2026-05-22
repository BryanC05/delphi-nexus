import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

type RadarWidgetProps = {
  location: { lat: number; lon: number } | null;
  onPoisUpdate?: (pois: any[]) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

const RadarWidget: React.FC<RadarWidgetProps> = ({ location, onPoisUpdate, isCollapsed, onToggleCollapse }) => {
  // Fallback to New York coordinates if location is denied or still loading
  const defaultCenter: [number, number] = [40.7128, -74.0060]; 
  const center: [number, number] = location ? [location.lat, location.lon] : defaultCenter;

  const [pois, setPois] = useState<any[]>([]);

  useEffect(() => {
    const fetchPOIs = async () => {
      if (!location) return;
      try {
        // Fetch cafes, restaurants, and malls within 2000m using the free Overpass API
        const query = `[out:json];(node(around:2000,${location.lat},${location.lon})["amenity"~"cafe|restaurant"];node(around:2000,${location.lat},${location.lon})["shop"="mall"];);out 20;`;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const res = await axios.get(url);
        setPois(res.data.elements || []);
      } catch (error) {
        console.error('Error fetching POIs:', error);
      }
    };

    fetchPOIs();
  }, [location]);

  useEffect(() => {
    if (onPoisUpdate) onPoisUpdate(pois);
  }, [pois, onPoisUpdate]);

  return (
    <div className="widget radar-widget" style={isCollapsed ? { padding: '24px', overflow: 'hidden' } : { padding: 0, overflow: 'hidden' }}>
      <h3 style={isCollapsed ? {
        margin: 0, borderBottom: 'none', paddingBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      } : {
        position: 'absolute', top: '16px', left: '16px', right: '16px', zIndex: 1000, background: 'rgba(13, 22, 37, 0.8)', padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--card-border)', margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span>Sat-Link Radar</span>
        <button className="collapse-btn" onClick={onToggleCollapse}>
          {isCollapsed ? '+' : '-'}
        </button>
      </h3>
      
      {!isCollapsed && (
        <div style={{ height: '220px', width: '100%', position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div className="radar-sweep"></div>
        <MapContainer 
          center={center} 
          zoom={14} 
          scrollWheelZoom={true} 
          zoomControl={true}
          style={{ height: '100%', width: '100%', background: '#050b14' }}
        >
          {/* Free CartoDB Dark Matter tiles (No API Key required) */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <CircleMarker 
            center={center} 
            radius={6} 
            pathOptions={{ color: 'var(--accent-color)', fillColor: 'var(--accent-color)', fillOpacity: 0.8 }} 
          />
          {/* Render Nearby Locations */}
          {pois.map(poi => (
            <CircleMarker key={poi.id} center={[poi.lat, poi.lon]} radius={4} pathOptions={{ color: '#ff003c', fillColor: '#ff003c', fillOpacity: 0.8 }}>
              <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                <strong>{poi.tags?.name || poi.tags?.amenity || poi.tags?.shop || 'Unknown Location'}</strong>
                <br/>
                <span style={{ textTransform: 'capitalize' }}>{poi.tags?.amenity || poi.tags?.shop}</span>
              </Tooltip>
            </CircleMarker>
          ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default RadarWidget;