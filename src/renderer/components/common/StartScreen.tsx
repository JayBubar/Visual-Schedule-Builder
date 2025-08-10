// 🌸 Bloom Classroom - Start Screen Component
// File: src/renderer/components/common/StartScreen.tsx

import React from 'react';

interface StartScreenProps {
  onStartMyDay: () => void;
  onManageClassroom: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartMyDay, onManageClassroom }) => {
  return (
    <div className="start-screen">
      <div className="start-screen-container">
        {/* Header Section */}
        <div className="header-section">
          <div className="logo-container">
            {/* Bloom Classroom Logo */}
            <div className="logo-placeholder">
              <img 
                src="/src/renderer/assets/blom-log.png" 
                alt="Bloom Classroom Logo" 
                className="logo-image"
              />
            </div>
          </div>
          <h1 className="app-title">Bloom Classroom</h1>
          <p className="app-subtitle">Where Every Student Flourishes</p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="action-button primary"
            onClick={onStartMyDay}
          >
            <div className="button-icon">📅</div>
            <div className="button-content">
              <h3>Start My Day</h3>
              <p>Daily check-in and schedule overview</p>
            </div>
          </button>

          <button 
            className="action-button secondary"
            onClick={onManageClassroom}
          >
            <div className="button-icon">🛠️</div>
            <div className="button-content">
              <h3>Manage My Classroom</h3>
              <p>Students, schedules, and classroom tools</p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="footer-section">
          <p className="version-info">Version 1.0.0</p>
          <p className="tagline">Empowering educators, inspiring students</p>
        </div>
      </div>

      <style>{`
        .start-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .start-screen::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .start-screen-container {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          padding: 3rem;
          max-width: 600px;
          width: 100%;
          text-align: center;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.2),
            0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          z-index: 1;
        }

        .header-section {
          margin-bottom: 3rem;
        }

        .logo-container {
          margin-bottom: 1.5rem;
        }

        .logo-placeholder {
          width: 120px;
          height: 120px;
          margin: 0 auto;
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 12px 40px rgba(255, 154, 158, 0.3),
            0 4px 16px rgba(255, 154, 158, 0.2);
          animation: logoFloat 3s ease-in-out infinite;
        }

        .logo-emoji {
          font-size: 3rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .logo-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .app-title {
          font-size: 3rem;
          font-weight: 800;
          color: #2d3748;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .app-subtitle {
          font-size: 1.25rem;
          color: #718096;
          margin: 0;
          font-weight: 500;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem 2rem;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          background: white;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border: 2px solid transparent;
        }

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .action-button.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .action-button.primary:hover {
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
        }

        .action-button.secondary {
          background: white;
          color: #2d3748;
          border-color: #e2e8f0;
        }

        .action-button.secondary:hover {
          border-color: #667eea;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
        }

        .button-icon {
          font-size: 2.5rem;
          flex-shrink: 0;
        }

        .button-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .button-content p {
          font-size: 1rem;
          margin: 0;
          opacity: 0.8;
        }

        .footer-section {
          border-top: 1px solid #e2e8f0;
          padding-top: 2rem;
          color: #718096;
        }

        .version-info {
          font-size: 0.875rem;
          margin: 0 0 0.5rem 0;
          font-weight: 600;
        }

        .tagline {
          font-size: 1rem;
          margin: 0;
          font-style: italic;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .start-screen {
            padding: 1rem;
          }

          .start-screen-container {
            padding: 2rem;
          }

          .app-title {
            font-size: 2.5rem;
          }

          .logo-placeholder {
            width: 100px;
            height: 100px;
          }

          .logo-emoji {
            font-size: 2.5rem;
          }

          .action-button {
            padding: 1.25rem 1.5rem;
            gap: 1rem;
          }

          .button-icon {
            font-size: 2rem;
          }

          .button-content h3 {
            font-size: 1.25rem;
          }

          .button-content p {
            font-size: 0.875rem;
          }
        }

        @media (max-width: 480px) {
          .start-screen-container {
            padding: 1.5rem;
          }

          .app-title {
            font-size: 2rem;
          }

          .app-subtitle {
            font-size: 1rem;
          }

          .action-buttons {
            gap: 1rem;
          }

          .action-button {
            flex-direction: column;
            text-align: center;
            gap: 0.75rem;
            padding: 1.5rem 1rem;
          }

          .button-content h3 {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StartScreen;
