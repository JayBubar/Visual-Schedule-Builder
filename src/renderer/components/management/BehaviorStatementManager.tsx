import React, { useState, useEffect } from 'react';
import { 
  BehaviorStatement, 
  DEFAULT_BEHAVIOR_STATEMENTS 
} from '../../types';
import UnifiedDataService from '../../services/unifiedDataService';

interface BehaviorStatementManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (statements: BehaviorStatement[]) => void;
}

const BehaviorStatementManager: React.FC<BehaviorStatementManagerProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [statements, setStatements] = useState<BehaviorStatement[]>([]);
  const [editingStatement, setEditingStatement] = useState<BehaviorStatement | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing statements
  useEffect(() => {
    if (isOpen) {
      loadStatements();
    }
  }, [isOpen]);

  const loadStatements = async () => {
    try {
      setLoading(true);
      const data = await UnifiedDataService.getUnifiedData();
      const customStatements = data?.settings?.behaviorCommitments?.customStatements;
      
      if (customStatements && customStatements.length > 0) {
        setStatements(customStatements);
      } else {
        setStatements([...DEFAULT_BEHAVIOR_STATEMENTS]);
      }
    } catch (error) {
      console.error('Failed to load behavior statements:', error);
      setStatements([...DEFAULT_BEHAVIOR_STATEMENTS]);
    } finally {
      setLoading(false);
    }
  };

  const saveStatements = async () => {
    try {
      const data = await UnifiedDataService.getUnifiedData();
      const updatedData = {
        ...data,
        settings: {
          ...data.settings,
          behaviorCommitments: {
            ...data.settings?.behaviorCommitments,
            customStatements: statements
          }
        }
      };
      
      await UnifiedDataService.saveUnifiedData(updatedData);
      onSave(statements);
      onClose();
    } catch (error) {
      console.error('Failed to save behavior statements:', error);
      alert('Failed to save behavior statements. Please try again.');
    }
  };

  const addStatement = () => {
    setEditingStatement({
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: '',
      category: 'kindness',
      emoji: '😊',
      isActive: true,
      isDefault: false,
      createdAt: new Date().toISOString()
    });
    setShowForm(true);
  };

  const editStatement = (statement: BehaviorStatement) => {
    setEditingStatement({ ...statement });
    setShowForm(true);
  };

  const saveEditingStatement = () => {
    if (!editingStatement?.text.trim()) {
      alert('Please enter a behavior statement');
      return;
    }

    const updatedStatements = statements.filter(s => s.id !== editingStatement.id);
    updatedStatements.push(editingStatement);
    setStatements(updatedStatements);
    setShowForm(false);
    setEditingStatement(null);
  };

  const deleteStatement = (id: string) => {
    const statement = statements.find(s => s.id === id);
    if (statement?.isDefault) {
      alert('Cannot delete default statements. You can disable them instead.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this behavior statement?')) {
      setStatements(statements.filter(s => s.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    setStatements(statements.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const resetToDefaults = () => {
    if (window.confirm('Reset all behavior statements to defaults? This will remove custom statements and restore all defaults.')) {
      setStatements([...DEFAULT_BEHAVIOR_STATEMENTS]);
    }
  };

  const categoryOptions = [
    { value: 'kindness', label: 'Kindness', emoji: '🤝' },
    { value: 'effort', label: 'Effort', emoji: '💪' },
    { value: 'responsibility', label: 'Responsibility', emoji: '📋' },
    { value: 'safety', label: 'Safety', emoji: '🛡️' },
    { value: 'learning', label: 'Learning', emoji: '📚' }  // ← Changed from 'communication'
  ];

  const emojiOptions = ['😊', '🤝', '💪', '👂', '🙌', '🧹', '💬', '📚', '🎯', '⭐', '🌟', '✨', '🏆', '👍', '💯', '🔥'];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '1000px',
        width: '95%',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: 'white',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: '700'
          }}>
            💪 Behavior Statement Manager
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={addStatement}
            style={{
              background: 'rgba(76, 175, 80, 0.9)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ➕ Add Statement
          </button>
          <button
            onClick={resetToDefaults}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            🔄 Reset to Defaults
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: 'white',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>
            <button
              onClick={saveStatements}
              style={{
                background: 'rgba(76, 175, 80, 0.9)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              💾 Save Changes
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            fontSize: '1.2rem'
          }}>
            Loading behavior statements...
          </div>
        )}

        {/* Statements List */}
        {!loading && (
          <div style={{
            display: 'grid',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {statements.map(statement => (
              <div key={statement.id} style={{
                background: statement.isActive 
                  ? 'rgba(255,255,255,0.15)' 
                  : 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                border: statement.isActive 
                  ? '2px solid rgba(76, 175, 80, 0.5)' 
                  : '2px solid rgba(255,255,255,0.1)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{statement.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    marginBottom: '0.25rem',
                    opacity: statement.isActive ? 1 : 0.6
                  }}>
                    {statement.text}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    opacity: 0.7,
                    display: 'flex',
                    gap: '1rem'
                  }}>
                    <span>Category: {statement.category}</span>
                    {statement.isDefault && <span>🔒 Default</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={statement.isActive}
                      onChange={() => toggleActive(statement.id)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    <span style={{ fontSize: '0.9rem' }}>Active</span>
                  </label>
                  <button
                    onClick={() => editStatement(statement)}
                    style={{
                      background: 'rgba(33, 150, 243, 0.8)',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  {!statement.isDefault && (
                    <button
                      onClick={() => deleteStatement(statement.id)}
                      style={{
                        background: 'rgba(244, 67, 54, 0.8)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Form Modal */}
        {showForm && editingStatement && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              color: '#333'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#333' }}>
                {editingStatement.isDefault ? 'Edit Statement' : 'Add New Statement'}
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Statement Text:
                </label>
                <input
                  type="text"
                  value={editingStatement.text}
                  onChange={(e) => setEditingStatement({
                    ...editingStatement,
                    text: e.target.value
                  })}
                  placeholder="I will..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Category:
                </label>
                <select
                  value={editingStatement.category}
                  onChange={(e) => setEditingStatement({
                    ...editingStatement,
                    category: e.target.value as any
                  })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '1rem'
                  }}
                >
                  {categoryOptions.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Emoji:
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  gap: '0.5rem'
                }}>
                  {emojiOptions.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setEditingStatement({
                        ...editingStatement,
                        emoji
                      })}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: editingStatement.emoji === emoji 
                          ? '2px solid #667eea' 
                          : '2px solid #e0e0e0',
                        background: editingStatement.emoji === emoji 
                          ? 'rgba(102, 126, 234, 0.1)' 
                          : 'white',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingStatement(null);
                  }}
                  style={{
                    background: '#f5f5f5',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    color: '#666',
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditingStatement}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  Save Statement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BehaviorStatementManager;
