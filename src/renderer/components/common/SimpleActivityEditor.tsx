import React, { useState } from 'react';
import { SavedActivity } from '../../types';

interface SimpleActivityEditorProps {
  activity: SavedActivity;
  onSave: (activity: SavedActivity) => void;
  onCancel: () => void;
}

const SimpleActivityEditor: React.FC<SimpleActivityEditorProps> = ({
  activity,
  onSave,
  onCancel
}) => {
  const [editedActivity, setEditedActivity] = useState<SavedActivity>(activity);

  const handleSave = () => {
    onSave(editedActivity);
  };

  const durationOptions = [
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 20, label: '20 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ];

  const categories = [
    { value: 'academic', label: '📚 Academic', color: '#3498db' },
    { value: 'social', label: '👥 Social', color: '#2ecc71' },
    { value: 'break', label: '☕ Break', color: '#f39c12' },
    { value: 'special', label: '🎭 Special', color: '#9b59b6' },
    { value: 'routine', label: '🔄 Routine', color: '#34495e' },
    { value: 'therapy', label: '🏥 Therapy', color: '#e74c3c' }
  ] as const;

  return (
    <div className="activity-editor-overlay">
      <div className="activity-editor">
        <div className="editor-header">
          <h2>✏️ Edit Activity</h2>
          <button onClick={onCancel} className="close-btn">×</button>
        </div>

        <div className="editor-content">
          {/* Activity Name */}
          <div className="form-group">
            <label className="form-label">Activity Name</label>
            <input
              type="text"
              value={editedActivity.name}
              onChange={(e) => setEditedActivity(prev => ({ ...prev, name: e.target.value }))}
              className="form-input"
              placeholder="Enter activity name..."
            />
          </div>

          {/* Emoji */}
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div className="emoji-input-group">
              <input
                type="text"
                value={editedActivity.emoji}
                onChange={(e) => setEditedActivity(prev => ({ ...prev, emoji: e.target.value }))}
                className="emoji-input"
                placeholder="📚"
                maxLength={2}
              />
              <div className="emoji-preview">{editedActivity.emoji}</div>
            </div>
          </div>

          {/* Duration */}
          <div className="form-group">
            <label className="form-label">Duration</label>
            <select
              value={editedActivity.duration}
              onChange={(e) => setEditedActivity(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="form-select"
            >
              {durationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="category-grid">
              {categories.map(category => (
                <button
                  key={category.value}
                  onClick={() => setEditedActivity(prev => ({ ...prev, category: category.value }))}
                  className={`category-btn ${editedActivity.category === category.value ? 'active' : ''}`}
                  style={{
                    borderColor: editedActivity.category === category.value ? category.color : '#e9ecef',
                    backgroundColor: editedActivity.category === category.value ? `${category.color}20` : 'white'
                  }}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description (Optional) */}
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              value={editedActivity.description || ''}
              onChange={(e) => setEditedActivity(prev => ({ ...prev, description: e.target.value }))}
              className="form-textarea"
              placeholder="Add any special notes or instructions..."
              rows={3}
            />
          </div>
        </div>

        <div className="editor-actions">
          <button onClick={onCancel} className="action-btn cancel">
            Cancel
          </button>
          <button onClick={handleSave} className="action-btn save">
            💾 Save Activity
          </button>
        </div>
      </div>

      <style>{`
        .activity-editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .activity-editor {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .editor-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .editor-content {
          padding: 2rem;
          overflow-y: auto;
          flex: 1;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
          box-sizing: border-box;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .emoji-input-group {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .emoji-input {
          width: 80px;
          text-align: center;
          font-size: 1.5rem;
        }

        .emoji-preview {
          font-size: 2rem;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .category-btn {
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          text-align: center;
        }

        .category-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .category-btn.active {
          font-weight: 600;
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }

        .editor-actions {
          display: flex;
          gap: 1rem;
          padding: 1.5rem 2rem;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }

        .action-btn {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border: 2px solid;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn.cancel {
          background: white;
          color: #6c757d;
          border-color: #dee2e6;
        }

        .action-btn.cancel:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
          color: #495057;
        }

        .action-btn.save {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .action-btn.save:hover {
          background: #5a67d8;
          border-color: #5a67d8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .activity-editor {
            width: 95%;
            margin: 1rem;
          }

          .editor-content {
            padding: 1.5rem;
          }

          .category-grid {
            grid-template-columns: 1fr;
          }

          .editor-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default SimpleActivityEditor;