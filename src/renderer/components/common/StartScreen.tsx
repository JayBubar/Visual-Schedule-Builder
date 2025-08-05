// Updated Navigation Component - Removed IEP Data Tab
// File: src/renderer/components/common/Navigation.tsx

import React from 'react';
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
  // UPDATED: Removed IEP Data tab, moved IEP features to Student Management
  const navItems = [
    { id: 'builder', icon: '🛠️', label: 'Builder', shortcut: 'Ctrl+1' },
    { id: 'display', icon: '📺', label: 'Display', shortcut: 'Ctrl+2' },
    { id: 'students', icon: '👥', label: 'Students', shortcut: 'Ctrl+3' },
    { id: 'staff', icon: '👨‍🏫', label: 'Staff', shortcut: 'Ctrl+4' },
    { id: 'library', icon: '📚', label: 'Library', shortcut: 'Ctrl+5' },
    { id: 'reports', icon: '📈', label: 'Reports', shortcut: 'Ctrl+6' },
    { id: 'settings', icon: '⚙️', label: 'Settings', shortcut: 'Ctrl+7' }
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
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewType)}
            className={`nav-button ${currentView === item.id ? 'active' : ''}`}
            title={`${item.label} (${item.shortcut})`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            <span className="nav-shortcut">{item.shortcut}</span>
          </button>
        ))}
      </div>

      <div className="nav-status">
        <div className="status-indicator">
          <div className="status-dot"></div>
          <span className="status-text">Ready</span>
        </div>
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

        .brand-info {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-size: 1.125rem;
          font-weight: 700;
          line-height: 1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .brand-version {
          font-size: 0.75rem;
          opacity: 0.8;
          font-weight: 500;
        }

        .dev-indicator {
          background: #ef4444;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
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

        .nav-buttons {
          display: flex;
          gap: 8px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          flex: 1;
          justify-content: center;
          max-width: 800px;
        }

        .nav-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 14px 18px;
          border: none;
          border-radius: 12px;
          background: transparent;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 90px;
          position: relative;
          border: 2px solid transparent;
        }

        .nav-button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .nav-button.active {
          background: rgba(255, 255, 255, 0.9);
          color: #667eea;
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 8px 30px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .nav-icon {
          font-size: 1.8rem;
          margin-bottom: 6px;
          transition: transform 0.3s ease;
        }

        .nav-button:hover .nav-icon {
          transform: scale(1.1);
        }

        .nav-label {
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          line-height: 1.2;
        }

        .nav-shortcut {
          font-size: 10px;
          opacity: 0;
          background: rgba(0, 0, 0, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          margin-top: 2px;
          transition: all 0.3s ease;
        }

        .nav-button:hover .nav-shortcut {
          opacity: 1;
          background: rgba(0, 0, 0, 0.15);
          color: white;
        }

        .nav-button.active .nav-shortcut {
          opacity: 0.9;
          background: rgba(0, 0, 0, 0.2);
          color: white;
        }

        .nav-status {
          display: flex;
          align-items: center;
          margin-left: 2rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #2ecc71;
          border-radius: 50%;
          box-shadow: 
            0 0 8px rgba(46, 204, 113, 0.5),
            0 0 16px rgba(46, 204, 113, 0.3);
          animation: statusPulse 2s ease infinite;
        }

        @keyframes statusPulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.7; 
            transform: scale(1.1);
          }
        }

        .status-text {
          font-size: 12px;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .nav-button:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 
            0 0 0 3px rgba(255, 255, 255, 0.2),
            0 8px 30px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 1024px) {
          .navigation {
            padding: 12px 20px;
          }
          
          .nav-buttons {
            gap: 6px;
            padding: 6px;
          }
          
          .nav-button {
            padding: 12px 16px;
            min-width: 85px;
          }
          
          .nav-icon {
            font-size: 1.6rem;
            margin-bottom: 4px;
          }
          
          .nav-label {
            font-size: 12px;
          }
          
          .nav-shortcut {
            font-size: 9px;
          }
        }

        @media (max-width: 768px) {
          .navigation {
            flex-direction: column;
            gap: 16px;
            padding: 16px;
          }
          
          .nav-buttons {
            order: 2;
            flex-wrap: wrap;
            justify-content: center;
            max-width: 100%;
          }
          
          .nav-brand {
            order: 1;
            margin-right: 0;
          }
          
          .nav-status {
            order: 3;
            margin-left: 0;
          }
          
          .nav-button {
            flex: 1;
            min-width: 70px;
            max-width: 90px;
          }
          
          .brand-title {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 480px) {
          .nav-button {
            padding: 10px 12px;
            min-width: 60px;
          }
          
          .nav-icon {
            font-size: 1.4rem;
          }
          
          .nav-label {
            font-size: 11px;
          }
          
          .nav-shortcut {
            display: none;
          }
          
          .brand-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;