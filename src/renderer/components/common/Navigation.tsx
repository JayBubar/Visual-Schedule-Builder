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
    { id: 'students', icon: '👥', label: 'Students', shortcut: 'Ctrl+3' },
    { id: 'staff', icon: '👨‍🏫', label: 'Staff', shortcut: 'Ctrl+4' },
    { id: 'library', icon: '📚', label: 'Library', shortcut: 'Ctrl+5' },
    { id: 'celebrations', icon: '🎉', label: 'Celebrations', shortcut: 'Ctrl+6' },
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
          line-height: 1;
        }

        .nav-buttons {
          display: flex;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          min-width: 80px;
        }

        .nav-button:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-1px);
        }

        .nav-button.active {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .nav-icon {
          font-size: 1.25rem;
        }

        .nav-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-align: center;
        }

        .nav-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: 2rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          background: #2ecc71;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-text {
          font-size: 0.875rem;
          font-weight: 500;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 768px) {
          .navigation {
            flex-wrap: wrap;
            gap: 1rem;
          }

          .nav-brand {
            margin-right: 0;
          }

          .nav-buttons {
            flex-wrap: wrap;
            justify-content: center;
          }

          .nav-button {
            min-width: 70px;
          }

          .nav-status {
            margin-left: 0;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;