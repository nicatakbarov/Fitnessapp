import { WifiOff } from 'lucide-react';

/**
 * Fixed banner shown at the top of the screen when the device is offline.
 * z-index 200 — appears above the DashboardNav (z-50).
 */
const OfflineBanner = () => (
  <div
    style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 200,
      background: '#92400e',
      color: '#fef3c7',
      padding: '7px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontSize: 13,
      fontWeight: 500,
      letterSpacing: '0.01em',
    }}
  >
    <WifiOff size={14} />
    İnternet yoxdur — keşlənmiş data göstərilir
  </div>
);

export default OfflineBanner;
