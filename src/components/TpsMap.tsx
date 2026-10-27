import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { TPS } from '../types';
import { ExternalLink, MapPin, AlertCircle, RefreshCw } from 'lucide-react';

// Fix Leaflet default icon issues in bundlers
const createTpsIcon = (nomor: string, isSelected: boolean = false) => {
  return L.divIcon({
    className: 'custom-tps-marker',
    html: `
      <div style="
        background: ${isSelected ? '#047857' : '#065f46'};
        color: white;
        padding: 4px 8px;
        border-radius: 9999px;
        font-weight: 800;
        font-size: 11px;
        border: 2px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        transform: translate(-50%, -100%);
      ">
        <span style="display:inline-block; width:6px; height:6px; border-radius:9999px; background:#34d399;"></span>
        TPS ${nomor}
      </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 30],
    popupAnchor: [0, -32],
  });
};

interface TpsMapProps {
  tpsList: TPS[];
  selectedTpsId?: string;
  onSelectTps?: (tps: TPS) => void;
  // Picker mode for Add/Edit
  isPickerMode?: boolean;
  pickerLat?: number;
  pickerLng?: number;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  height?: string;
}

export const TpsMap: React.FC<TpsMapProps> = ({
  tpsList,
  selectedTpsId,
  onSelectTps,
  isPickerMode = false,
  pickerLat,
  pickerLng,
  onCoordinatesChange,
  height = '440px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const pickerMarkerRef = useRef<L.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      // Padanaan / Paseh coordinates default ~ -6.8924, 107.9852
      const initialLat = pickerLat || (tpsList[0]?.latitude ?? -6.8924);
      const initialLng = pickerLng || (tpsList[0]?.longitude ?? 107.9852);

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> kontributor',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Handle map click in picker mode
      if (isPickerMode && onCoordinatesChange) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const lat = parseFloat(e.latlng.lat.toFixed(6));
          const lng = parseFloat(e.latlng.lng.toFixed(6));
          onCoordinatesChange(lat, lng);
        });
      }

      // Invalidate size to ensure proper rendering inside modals/tabs
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    } catch (err: unknown) {
      console.warn('Map initialization note:', err);
      setMapError('Peta interaktif tidak dapat memuat ubin peta saat ini. Anda tetap dapat menginput koordinat secara manual dan membuka lokasi di Google Maps.');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when tpsList or selectedTpsId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || isPickerMode) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    const bounds = L.latLngBounds([]);

    tpsList.forEach((tps) => {
      if (typeof tps.latitude !== 'number' || typeof tps.longitude !== 'number') return;
      const latLng: [number, number] = [tps.latitude, tps.longitude];
      bounds.extend(latLng);

      const isSelected = tps.id === selectedTpsId;
      const marker = L.marker(latLng, {
        icon: createTpsIcon(tps.nomor, isSelected),
      }).addTo(map);

      // Popup Content
      const googleMapsUrl = `https://www.google.com/maps?q=${tps.latitude},${tps.longitude}`;
      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 190px; color: #1e293b;">
          <div style="font-weight: 700; font-size: 13px; color: #065f46; margin-bottom: 2px;">
            ${tps.nomor}: ${tps.nama}
          </div>
          <div style="color: #475569; margin-bottom: 4px;">
            📍 ${tps.namaTempat || tps.alamat}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            ${tps.dusunNama ? `Dusun: ${tps.dusunNama} | ` : ''}RW: ${tps.rw || '-'} / RT: ${tps.rt || '-'}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="color: #0284c7; font-weight: 600; text-decoration: none; display:inline-flex; align-items:center; gap: 4px;">
              Buka Google Maps &rarr;
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectTps) {
          onSelectTps(tps);
        }
      });

      markersRef.current[tps.id] = marker;
    });

    if (tpsList.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [tpsList, selectedTpsId, onSelectTps, isPickerMode]);

  // Handle picker marker in picker mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isPickerMode) return;

    if (pickerLat !== undefined && pickerLng !== undefined && !isNaN(pickerLat) && !isNaN(pickerLng)) {
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng([pickerLat, pickerLng]);
      } else {
        const marker = L.marker([pickerLat, pickerLng], {
          draggable: true,
          icon: L.divIcon({
            className: 'custom-picker-pin',
            html: `
              <div style="
                background: #dc2626;
                color: white;
                padding: 4px 8px;
                border-radius: 9999px;
                font-weight: bold;
                font-size: 11px;
                border: 2px solid white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                white-space: nowrap;
                transform: translate(-50%, -100%);
              ">
                📍 Titik Koordinat
              </div>
            `,
            iconSize: [80, 30],
            iconAnchor: [40, 30],
          }),
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          if (onCoordinatesChange) {
            onCoordinatesChange(
              parseFloat(pos.lat.toFixed(6)),
              parseFloat(pos.lng.toFixed(6))
            );
          }
        });

        pickerMarkerRef.current = marker;
      }

      map.panTo([pickerLat, pickerLng]);
    }
  }, [pickerLat, pickerLng, isPickerMode, onCoordinatesChange]);

  const handleCenterMap = () => {
    const map = mapInstanceRef.current;
    if (map && tpsList.length > 0) {
      const bounds = L.latLngBounds(
        tpsList.map((t) => [t.latitude, t.longitude] as [number, number])
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs">
      {mapError && (
        <div className="p-4 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>{mapError}</div>
        </div>
      )}

      {/* Map DOM Container */}
      <div ref={mapContainerRef} style={{ height, width: '100%', zIndex: 1 }} />

      {/* Quick Map Controls Overlay */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={handleCenterMap}
          className="px-2.5 py-1.5 bg-white/95 hover:bg-white text-slate-700 text-xs font-semibold rounded-lg shadow-md border border-slate-200 flex items-center gap-1.5 transition"
          title="Fokuskan Semua Titik TPS"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
          <span>Fokus Semua TPS</span>
        </button>
      </div>

      {isPickerMode && (
        <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-md flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Klik pada peta atau geser pin merah untuk menentukan titik lokasi TPS.</span>
          </div>
          {pickerLat && pickerLng && (
            <a
              href={`https://www.google.com/maps?q=${pickerLat},${pickerLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-900 shrink-0 ml-2"
            >
              <span>Uji di Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};
