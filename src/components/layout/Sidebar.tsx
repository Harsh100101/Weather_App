import { Home, BarChart2, Map, Bell, GitCompare, Settings } from 'lucide-react';
import { useAppStore, type Page } from '../../store/useAppStore';

const NAV: { page: Page; icon: any; label: string; tip: string }[] = [
  { page: 'dashboard', icon: Home,       label: 'Dashboard',  tip: 'Dashboard'  },
  { page: 'forecast',  icon: BarChart2,  label: 'Forecast',   tip: 'Forecast'   },
  { page: 'map',       icon: Map,        label: 'Map',        tip: 'Map'        },
  { page: 'alerts',    icon: Bell,       label: 'Alerts',     tip: 'Alerts'     },
  { page: 'compare',   icon: GitCompare, label: 'Compare',    tip: 'Compare'    },
];

export default function Sidebar() {
  const { currentPage, setPage } = useAppStore();

  return (
    <nav className="sidebar">
      {/* Brand mark */}
      <div className="sidebar-icon" style={{ marginBottom: 6 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#38bdf8,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>☁</div>
      </div>
      <div className="sidebar-sep" />

      {NAV.map(({ page, icon: Icon, label, tip }) => (
        <button
          key={page}
          className={`sidebar-item${currentPage === page ? ' active' : ''}`}
          onClick={() => setPage(page)}
          data-tip={tip}
        >
          <span className="sidebar-icon"><Icon size={16} /></span>
          <span className="sidebar-label">{label}</span>
        </button>
      ))}

      {/* Bottom: settings */}
      <div style={{ flex: 1 }} />
      <div className="sidebar-sep" />
      <button
        className={`sidebar-item${currentPage === 'settings' ? ' active' : ''}`}
        onClick={() => setPage('settings')}
      >
        <span className="sidebar-icon"><Settings size={16} /></span>
        <span className="sidebar-label">Settings</span>
      </button>
    </nav>
  );
}
