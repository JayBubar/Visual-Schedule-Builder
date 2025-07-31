import React from 'react';
import { ViewType, ScheduleVariation } from '../../types';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  selectedSchedule?: ScheduleVariation | null;
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  onViewChange, 
  selectedSchedule 
}) => {
const navItems = [
  { id: 'builder', icon: '🛠️', label: 'Builder', shortcut: 'Ctrl+1' },
  { id: 'display', icon: '📺', label: 'Display', shortcut: 'Ctrl+2' },
  { id: 'calendar', icon: '📅', label: 'Daily Check-In', shortcut: 'Ctrl+5' },
  { id: 'library', icon: '📚', label: 'Library', shortcut: 'Ctrl+6' },
  { id: 'data-collection', icon: '📋', label: 'IEP Data', shortcut: 'Ctrl+7' },
  { id: 'students', icon: '👥', label: 'Students', shortcut: 'Ctrl+3' },
  { id: 'staff', icon: '👨‍🏫', label: 'Staff', shortcut: 'Ctrl+4' },
  { id: 'reports', icon: '📈', label: 'Reports', shortcut: 'Ctrl+r' },
  { id: 'settings', icon: '⚙️', label: 'Settings', shortcut: 'Ctrl+,' }
] as const;

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <div className="brand-icon">📅</div>
        <div className="brand-info">
          <div className="brand-title">Visual Schedule Builder</div>
          <div className="brand-version">v1.0.0</div>
        </div>
      </div>

      <div className="nav-buttons">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewType)}
            className={`nav-button ${currentView === item.id ? 'active' : ''}`}
            title={`${item.label} (${item.shortcut})`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="nav-status">
        <div className="status-indicator"></div>
        <span className="status-text">Ready</span>
      </div>

      <style>{`
        .navigation {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-right: 2rem;
        }

        .brand-icon {
          font-size: 1.5rem;
        }

        .brand-title {
          font-size: 1.125rem;
          font-weight: 700;
          line-height: 1;
        }

        .brand-version {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .nav-buttons {
          display: flex;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.875rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .nav-button.active {
          background: rgba(255, 255, 255, 0.25);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transform: translateY(-1px);
        }

        .nav-icon {
          font-size: 1rem;
        }

        .nav-label {
          white-space: nowrap;
        }

        .nav-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: 2rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .status-indicator {
          width: 0.5rem;
          height: 0.5rem;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-text {
          font-size: 0.875rem;
          font-weight: 500;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @media (max-width: 768px) {
          .navigation {
            padding: 0.5rem 1rem;
          }

          .nav-brand {
            margin-right: 1rem;
          }

          .brand-title {
            display: none;
          }

          .nav-buttons {
            gap: 0.25rem;
          }

          .nav-button {
            padding: 0.375rem 0.5rem;
            font-size: 0.75rem;
          }

          .nav-label {
            display: none;
          }

          .nav-status {
            margin-left: 1rem;
            padding: 0.375rem 0.5rem;
          }

          .status-text {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .nav-buttons {
            overflow-x: auto;
            scrollbar-width: none;
          }

          .nav-buttons::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;