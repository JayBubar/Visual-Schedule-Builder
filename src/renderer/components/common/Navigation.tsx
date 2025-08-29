import React from 'react';
import { Brain } from 'lucide-react';
import { ViewType, ScheduleVariation } from '../../types';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  selectedSchedule?: ScheduleVariation | null;
  onBackToStart?: () => void; // NEW: Option to return to start screen
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  onViewChange, 
  selectedSchedule,
  onBackToStart
}) => {
  const navItems = [
    { id: 'smart-groups', icon: Brain, label: 'Bloom Smart Groups', shortcut: 'Ctrl+1', description: 'AI-powered curriculum alignment and small group recommendations', color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', isNew: true },
    { id: 'library', icon: '📚', label: 'Library', shortcut: 'Ctrl+2' },
    { id: 'builder', icon: '🛠️', label: 'Builder', shortcut: 'Ctrl+3' },
    { id: 'display', icon: '📺', label: 'Display', shortcut: 'Ctrl+4' },
    { id: 'students', icon: '👥', label: 'Students', shortcut: 'Ctrl+5' },
    { id: 'staff', icon: '👨‍🏫', label: 'Staff', shortcut: 'Ctrl+6' },
    { id: 'iep-goals', icon: '🎯', label: 'IEP Goals', shortcut: 'Ctrl+7' },
    { id: 'reports', icon: '📈', label: 'Reports', shortcut: 'Ctrl+8' },
    { id: 'settings', icon: '⚙️', label: 'Settings', shortcut: 'Ctrl+9' }
  ] as const;

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <div className="brand-icon">🌸</div>
        <div className="brand-info">
          <div className="brand-title">
            Bloom Classroom
            {window.location.hostname === 'localhost' && (
              <span className="dev-indicator">DEV</span>
            )}
          </div>
          <div className="brand-version">v1.0.0</div>
        </div>
        
        {/* NEW: Back to Start button */}
        {onBackToStart && (
          <button
            onClick={onBackToStart}
            className="back-to-start-btn"
            title="Back to Start Screen"
          >
            🏠
          </button>
        )}
      </div>

      <div className="nav-buttons">
        {navItems.map(item => {
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewType)}
              className={`nav-button ${currentView === item.id ? 'active' : ''}`}
              title={`${item.label} (${item.shortcut})`}
            >
              <span className="nav-icon">
                {typeof item.icon === 'string' ? item.icon : <item.icon size={16} />}
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
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

        .back-to-start-btn {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          margin-left: 1rem;
        }

        .back-to-start-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }

        .dev-indicator {
          background: #ff453a;
          color: white;
          font-size: 0.625rem;
          font-weight: 800;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          margin-left: 0.5rem;
          animation: devPulse 2s ease-in-out infinite;
        }

        @keyframes devPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
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
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 0.5rem;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .nav-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .nav-button.active {
          background: rgba(255, 255, 255, 0.25);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }


        .nav-icon {
          font-size: 1rem;
        }

        .nav-label {
          font-size: 0.875rem;
        }

        .nav-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: 1rem;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .status-text {
          font-size: 0.75rem;
          opacity: 0.9;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @media (max-width: 1024px) {
          .nav-label {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;
