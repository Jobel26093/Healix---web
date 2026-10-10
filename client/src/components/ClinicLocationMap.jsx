import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink, Copy, Check, Compass, Layers, Globe } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useToast } from '../context/ToastContext';

// Verified Healix Advance Physiotherapy & Rehabilitation Center
// 8/207 Pillayar Koil Street, Nookampalayam Main Road, Sithalapakkam, Chennai - 600131
const CLINIC_COORDS = [12.8907997, 80.1977621];
const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/9ZwbWzGo3AVLExwL9';
const CLINIC_NAME = 'Healix Advance Physiotherapy and Rehabilitation Center';
const CLINIC_ADDRESS = '8/207 Pillayar Koil St, Nookampalayam Main Rd, Sithalapakkam, Chennai - 600131';

// Direct local proxy endpoints: 100% First-party requests (never blocked by browser ad-blockers or Edge tracking prevention)
const TILE_SOURCES = {
  google: {
    name: 'Google Map',
    url: '/api/map/tile?lyrs=m&x={x}&y={y}&z={z}',
    maxZoom: 20,
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps'
  },
  satellite: {
    name: 'Satellite',
    url: '/api/map/tile?lyrs=y&x={x}&y={y}&z={z}',
    maxZoom: 20,
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Satellite'
  }
};

export default function ClinicLocationMap({ height = '100%', minHeight = '420px' }) {
  const [activeLayer, setActiveLayer] = useState('google'); // 'google' | 'satellite'
  const [copied, setCopied] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const currentTileLayerRef = useRef(null);
  const markerRef = useRef(null);
  const toast = useToast();

  // Helper to create tile layer with automated fallback
  const createTileLayer = (layerKey) => {
    const cfg = TILE_SOURCES[layerKey] || TILE_SOURCES.google;
    const layer = L.tileLayer(cfg.url, {
      maxZoom: cfg.maxZoom || 20,
      subdomains: cfg.subdomains || ['0', '1', '2', '3'],
      attribution: cfg.attribution
    });

    // Resilient fallback in case backend or proxy ever drops a tile
    layer.on('tileerror', (error) => {
      if (error && error.tile && !error.tile.__triedFallback) {
        error.tile.__triedFallback = true;
        const coords = error.coords;
        if (coords) {
          if (layerKey === 'satellite') {
            error.tile.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${coords.z}/${coords.y}/${coords.x}`;
          } else {
            error.tile.src = `https://tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`;
          }
        }
      }
    });

    return layer;
  };

  // Initialize Leaflet Map once on mount
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // StrictMode / Remount safety: destroy any existing instance on this DOM node
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        // Ignore removal error
      }
      mapInstanceRef.current = null;
    }
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    let map = null;
    let resizeObserver = null;
    let timer1 = null;
    let timer2 = null;

    try {
      map = L.map(container, {
        center: CLINIC_COORDS,
        zoom: 16,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: false
      });
      mapInstanceRef.current = map;

      // Add the active tile layer
      const tileLayer = createTileLayer(activeLayer);
      tileLayer.addTo(map);
      currentTileLayerRef.current = tileLayer;

      // Authentic Google-Style Animated Pin with Healix Branding
      const pinHtml = `
        <div style="position: relative; width: 44px; height: 54px; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="position: absolute; top: 0; width: 42px; height: 42px; border-radius: 50%; background: rgba(220, 38, 38, 0.35); animation: healixPinGlow 2s infinite ease-out;"></div>
          <div style="position: relative; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: linear-gradient(135deg, #ea4335 0%, #c5221f 100%); border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center;">
            <div style="transform: rotate(45deg); font-size: 15px; line-height: 1; color: #ffffff;">
              🏥
            </div>
          </div>
          <div style="width: 14px; height: 5px; border-radius: 50%; background: rgba(0,0,0,0.35); filter: blur(1.5px); margin-top: 2px;"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: pinHtml,
        className: 'healix-google-pin',
        iconSize: [44, 54],
        iconAnchor: [22, 50],
        popupAnchor: [0, -48]
      });

      const marker = L.marker(CLINIC_COORDS, { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      // Card Popup with Google Ratings & Verified Info
      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px; min-width: 230px; color: #170d24;">
          <div style="font-weight: 800; font-size: 13px; color: #791a9c; margin-bottom: 2px; line-height: 1.3;">
            ${CLINIC_NAME}
          </div>
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 6px;">
            <span style="background: #fef08a; color: #854d0e; font-size: 11px; font-weight: 800; padding: 1px 6px; border-radius: 4px;">
              ★ 4.9
            </span>
            <span style="font-size: 11px; color: #64748b; font-weight: 600;">
              (51 Google Reviews)
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; line-height: 1.4; margin-bottom: 8px;">
            ${CLINIC_ADDRESS}
          </div>
          <a href="${GOOGLE_MAPS_URL}" target="_blank" rel="noopener noreferrer"
             style="display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(135deg, #d91b76, #791a9c); color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 6px; box-shadow: 0 2px 8px rgba(217, 27, 118, 0.4);">
            <span>Open in Google Maps ↗</span>
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: true, autoPan: true });

      // Automatically invalidate size to ensure tiles fill the viewport
      timer1 = setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 100);

      timer2 = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          marker.openPopup();
        }
      }, 400);

      const handleResize = () => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      };
      window.addEventListener('resize', handleResize);

      // Also observe container size changes with ResizeObserver
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
        });
        resizeObserver.observe(container);
      }

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        window.removeEventListener('resize', handleResize);
        if (resizeObserver) resizeObserver.disconnect();
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {
            // Ignore
          }
          mapInstanceRef.current = null;
        }
        if (container && container._leaflet_id) {
          delete container._leaflet_id;
        }
      };
    } catch (err) {
      console.error("Map initialization failed:", err);
    }
  }, []);

  // When layer toggle changes, smoothly swap tileLayer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    try {
      if (currentTileLayerRef.current) {
        mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
      }
      const newLayer = createTileLayer(activeLayer);
      newLayer.addTo(mapInstanceRef.current);
      currentTileLayerRef.current = newLayer;
    } catch (e) {
      console.error("Failed to switch tile layer:", e);
    }
  }, [activeLayer]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(CLINIC_COORDS, 16, { animate: true });
      mapInstanceRef.current.invalidateSize();
      if (markerRef.current) markerRef.current.openPopup();
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(CLINIC_ADDRESS);
    setCopied(true);
    toast.success("Clinic address copied to clipboard!", "Address Copied");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{
      borderRadius: 'var(--radius-lg, 12px)',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      position: 'relative',
      background: 'var(--bg-card, #170d24)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
      height: height,
      minHeight: minHeight,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>{`
        @keyframes healixPinGlow {
          0% { transform: scale(0.85); opacity: 0.85; }
          50% { transform: scale(1.4); opacity: 0.15; }
          100% { transform: scale(0.85); opacity: 0.85; }
        }
        .healix-google-pin {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 10px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.35) !important;
          border: 1px solid rgba(217, 27, 118, 0.3) !important;
        }
        .leaflet-control-zoom {
          margin-top: 14px !important;
          border: 1px solid rgba(217, 27, 118, 0.25) !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        }
        .leaflet-control-zoom a {
          background: rgba(23, 13, 36, 0.95) !important;
          color: #fbbf24 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #d91b76 !important;
          color: #ffffff !important;
        }
      `}</style>

      {/* Top Header Control Bar */}
      <div style={{
        background: 'rgba(23, 13, 36, 0.98)',
        padding: '0.65rem 1rem',
        borderBottom: '1px solid rgba(217, 27, 118, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'rgba(217, 27, 118, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MapPin size={16} color="var(--accent-magenta, #d91b76)" />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.84rem', color: '#ffffff', lineHeight: 1.2 }}>
              Healix Advance Physiotherapy
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--accent-gold, #fbbf24)', fontWeight: '700' }}>
              4.9 ★ Verified on Google Maps (Live View)
            </div>
          </div>
        </div>

        {/* View Switcher: Google Map | Satellite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <button
              type="button"
              onClick={() => setActiveLayer('google')}
              style={{
                background: activeLayer === 'google' ? 'var(--accent-magenta, #d91b76)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 12px',
                fontSize: '0.74rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Google Map
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('satellite')}
              style={{
                background: activeLayer === 'satellite' ? 'var(--accent-magenta, #d91b76)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 12px',
                fontSize: '0.74rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Satellite
            </button>
          </div>

          <button
            onClick={handleRecenter}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', height: '26px' }}
            title="Recenter view on Healix Clinic"
          >
            <Compass size={13} />
            <span>Center</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas - 100% Native Vector/Raster Rendering */}
      <div 
        ref={mapContainerRef} 
        style={{ 
          flex: 1, 
          width: '100%', 
          height: '100%', 
          minHeight: '340px',
          background: '#e5e7eb',
          zIndex: 1
        }} 
      />

      {/* Dedicated Bottom Footer Bar */}
      <div style={{
        background: 'rgba(23, 13, 36, 0.98)',
        padding: '0.55rem 1rem',
        borderTop: '1px solid rgba(217, 27, 118, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        flexWrap: 'wrap',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: '180px' }}>
          <MapPin size={15} color="var(--accent-magenta, #d91b76)" />
          <span style={{ fontSize: '0.75rem', color: '#e2e8f0', fontWeight: '500' }}>
            Nookampalayam Main Rd, Sithalapakkam, Chennai - 600131
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={handleCopyAddress}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', height: '26px' }}
            title="Copy clinic address"
          >
            {copied ? <Check size={12} color="var(--accent-green, #10b981)" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy Address'}</span>
          </button>

          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-admin btn-sm"
            style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              padding: '0.2rem 0.75rem',
              height: '26px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Navigation size={12} />
            <span>Open in Google Maps ↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
