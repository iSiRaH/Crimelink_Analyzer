interface SafetyLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
}

interface CrimeReport {
  id?: number;
  longitude: number;
  latitude: number;
  description: string;
  dateReported: string;
  timeReported: string;
  crimeType: string;
}

interface MapPopupProps {
  open: boolean;
  onClose: () => void;
  onLocationSelect: (location: { latitude: number; longitude: number }) => void;
}
