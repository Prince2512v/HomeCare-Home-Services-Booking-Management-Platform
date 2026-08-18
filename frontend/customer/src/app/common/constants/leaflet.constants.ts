export interface LeafletPinIcon {
  iconUrl: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
  popupAnchor: [number, number];
}

export interface LeafletConfig {
  VERSION: string;
  CSS_ID: string;
  JS_ID: string;
  CSS_URL: string;
  JS_URL: string;
  TILE_URL: string;
  TILE_ATTRIBUTION: string;
  TILE_MAX_ZOOM: number;
  DEFAULT_ZOOM: number;
  LOCATE_ZOOM: number;
  DEFAULT_LAT: number;
  DEFAULT_LNG: number;
  PIN_ICON: LeafletPinIcon;
}

export const LEAFLET: LeafletConfig = {
  VERSION: '1.9.4',
  CSS_ID: 'leaflet-css',
  JS_ID: 'leaflet-js',
  CSS_URL: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  JS_URL: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  TILE_ATTRIBUTION: '© OpenStreetMap',
  TILE_MAX_ZOOM: 19,
  DEFAULT_ZOOM: 15,
  LOCATE_ZOOM: 17,
  DEFAULT_LAT: 23.0225,
  DEFAULT_LNG: 72.5714,
  PIN_ICON: {
    iconUrl: 'assets/images/pin.svg',
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48],
  },
};