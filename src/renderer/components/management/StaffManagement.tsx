import React, { useState, useRef, useEffect } from 'react';
import { StaffMember } from '../../types';

interface StaffManagementProps {
  isActive: boolean;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ isActive }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load staff data on mount
  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = () => {
    try {
      const savedStaff = localStorage.getItem('staff_members');
      if (savedStaff) {
        setStaff(JSON.parse(savedStaff));
      } else {
        // Initialize with default staff if none exist
        const defaultStaff: StaffMember[] = [
          {
            id: 'staff1',
            name: 'Ms. Johnson',
            role: 'Special Education Teacher',
            email: 'johnson@school.edu',
            phone: '(555) 123-4567',
            specialties: ['Autism Support', 'Behavior Management'],
            photo: null,
            isActive: true,
            startDate: '2023-08-15',
            notes: 'Lead teacher with 8 years experience',
            isResourceTeacher: false,
            isRelatedArtsTeacher: false
          },
          {
            id: 'staff2',
            name: 'Mr. Rodriguez',
            role: 'Paraprofessional',
            email: 'rodriguez@school.edu',
            phone: '(555) 234-5678',
            specialties: ['Math Support', 'Individual Assistance'],
            photo: null,
            isActive: true,
            startDate: '2024-01-08',
            notes: 'Excellent with one-on-one instruction',
            isResourceTeacher: false,
            isRelatedArtsTeacher: false
          },
          {
            id: 'staff3',
            name: 'Dr. Williams',
            role: 'Speech Therapist',
            email: 'williams@school.edu',
            phone: '(555) 345-6789',
            specialties: ['Speech Therapy', 'Communication Devices'],
            photo: null,
            isActive: true,
            startDate: '2022-09-01',
            notes: 'Specialist in AAC devices',
            isResourceTeacher: true,
            isRelatedArtsTeacher: false
          },
          {
            id: 'staff4',
            name: 'Mrs. Chen',
            role: 'Art Teacher',
            email: 'chen@school.edu',
            phone: '(555) 456-7890',
            specialties: ['Art Therapy', 'Creative Expression'],
            photo: null,
            isActive: true,
            startDate: '2023-01-15',
            notes: 'Comes to classroom for art sessions',
            isResourceTeacher: false,
            isRelatedArtsTeacher: true
          }
        ];
        setStaff(defaultStaff);
        saveStaffData(defaultStaff);
      }
    } catch (error) {
      console.error('Error loading staff data:', error);
    }
  };

  const saveStaffData = (staffData: StaffMember[]) => {
    try {
      localStorage.setItem('staff_members', JSON.stringify(staffData));
      // Also trigger a global data update event for other components
      window.dispatchEvent(new CustomEvent('staffDataUpdated', { 
        detail: staffData 
      }));
    } catch (error) {
      console.error('Error saving staff data:', error);
    }
  };

  const handlePhotoUpload = async (staffId: string, file: File) => {
    try {
      console.log('Uploading photo for staff ID:', staffId); // Debug log
      
      // Convert file to base64 for local storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Photo = e.target?.result as string;
        console.log('Photo loaded for staff ID:', staffId); // Debug log
        
        setStaff(currentStaff => {
          const updatedStaff = currentStaff.map(member => 
            member.id === staffId 
              ? { ...member, photo: base64Photo }
              : member
          );
          console.log('Updated staff array:', updatedStaff); // Debug log
          saveStaffData(updatedStaff);
          return updatedStaff;
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo. Please try again.');
    }
  };

  const handleRemovePhoto = (staffId: string) => {
    const updatedStaff = staff.map(member => 
      member.id === staffId 
        ? { ...member, photo: null }
        : member
    );
    
    setStaff(updatedStaff);
    saveStaffData(updatedStaff);
  };

  const handleAddStaff = (newStaff: Omit<StaffMember, 'id'>) => {
    const staffWithId: StaffMember = {
      ...newStaff,
      id: `staff_${Date.now()}`
    };
    
    const updatedStaff = [...staff, staffWithId];
    setStaff(updatedStaff);
    saveStaffData(updatedStaff);
    setShowAddModal(false);
  };

  const handleEditStaff = (updatedStaff: StaffMember) => {
    const newStaffList = staff.map(member => 
      member.id === updatedStaff.id ? updatedStaff : member
    );
    
    setStaff(newStaffList);
    saveStaffData(newStaffList);
    setEditingStaff(null);
  };

  const handleDeleteStaff = (staffId: string) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      const updatedStaff = staff.filter(member => member.id !== staffId);
      setStaff(updatedStaff);
      saveStaffData(updatedStaff);
    }
  };

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (!isActive) return null;

  return (
    <div style={{ 
      padding: '2rem', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '2rem', 
        textAlign: 'center' 
      }}>
        <h1 style={{ 
          color: 'white', 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          margin: '0 0 0.5rem 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          👨‍🏫 Staff Management
        </h1>
        <p style={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontSize: '1.1rem',
          margin: 0
        }}>
          Manage your classroom team, resource teachers, and related arts staff
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Search staff by name, role, or specialty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: '1',
            minWidth: '300px',
            padding: '12px 16px',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            fontSize: '14px',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            backdropFilter: 'blur(10px)'
          }}
        />
        
        <button
          className="create-activity-button"
          onClick={() => setShowAddModal(true)}
          style={{
            background: 'linear-gradient(145deg, #28a745, #20c997)',
            border: 'none',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          ➕ Add Staff Member
        </button>
      </div>

      {/* Staff Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {filteredStaff.map(member => (
          <div
            key={member.id}
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            }}
          >
            {/* Photo Section */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: member.photo 
                  ? 'transparent' 
                  : 'linear-gradient(145deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}>
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <span style={{
                    fontSize: '2rem',
                    color: 'white',
                    fontWeight: '700'
                  }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>

              <div style={{ flex: '1' }}>
                <h3 style={{
                  margin: '0 0 0.25rem 0',
                  color: '#2c3e50',
                  fontSize: '1.3rem',
                  fontWeight: '700'
                }}>
                  {member.name}
                </h3>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  color: '#667eea',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  {member.role}
                </p>
                
                {/* Teacher Type Badges */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.5rem'
                }}>
                  {member.isResourceTeacher && (
                    <span style={{
                      background: 'linear-gradient(145deg, #ff6b6b, #ee5a52)',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      🎯 Resource Teacher
                    </span>
                  )}
                  {member.isRelatedArtsTeacher && (
                    <span style={{
                      background: 'linear-gradient(145deg, #4ecdc4, #44a08d)',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      🎨 Related Arts
                    </span>
                  )}
                </div>
                
                {/* Specialties */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {member.specialties.slice(0, 2).map(specialty => (
                    <span
                      key={specialty}
                      style={{
                        background: 'linear-gradient(145deg, #667eea, #764ba2)',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Photo Upload Controls */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <label
                htmlFor={`file-input-${member.id}`}
                style={{
                  background: 'linear-gradient(145deg, #007bff, #0056b3)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flex: '1',
                  textAlign: 'center',
                  display: 'block'
                }}
              >
                📷 {member.photo ? 'Change Photo' : 'Add Photo'}
              </label>
              
              <input
                type="file"
                id={`file-input-${member.id}`}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log(`File selected for ${member.name} (ID: ${member.id})`);
                    handlePhotoUpload(member.id, file);
                    // Clear the input so the same file can be selected again if needed
                    e.target.value = '';
                  }
                }}
              />
              
              {member.photo && (
                <button
                  onClick={() => handleRemovePhoto(member.id)}
                  style={{
                    background: 'linear-gradient(145deg, #dc3545, #c82333)',
                    border: 'none',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🗑️
                </button>
              )}
            </div>

            {/* Contact Info */}
            <div style={{
              fontSize: '0.9rem',
              color: '#495057',
              marginBottom: '1rem'
            }}>
              <div style={{ marginBottom: '0.25rem' }}>
                📧 {member.email}
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                📞 {member.phone}
              </div>
              <div>
                📅 Started: {new Date(member.startDate).toLocaleDateString()}
              </div>
            </div>

            {/* Notes */}
            {member.notes && (
              <div style={{
                background: 'rgba(102, 126, 234, 0.1)',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#495057',
                marginBottom: '1rem',
                fontStyle: 'italic'
              }}>
                💭 {member.notes}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <button
                onClick={() => setEditingStaff(member)}
                style={{
                  background: 'linear-gradient(145deg, #ffc107, #e0a800)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flex: '1'
                }}
              >
                ✏️ Edit
              </button>
              
              <button
                onClick={() => handleDeleteStaff(member.id)}
                style={{
                  background: 'linear-gradient(145deg, #dc3545, #c82333)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🗑️ Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStaff.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍🏫</div>
          <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>
            {searchTerm ? 'No Staff Found' : 'No Staff Members Yet'}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>
            {searchTerm 
              ? 'Try adjusting your search terms.'
              : 'Add your first staff member to get started.'}
          </p>
          {!searchTerm && (
            <button
              className="create-activity-button"
              onClick={() => setShowAddModal(true)}
            >
              ➕ Add Staff Member
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Modals */}
      {showAddModal && (
        <StaffModal
          onSave={handleAddStaff}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {editingStaff && (
        <StaffModal
          staff={editingStaff}
          onSave={handleEditStaff}
          onCancel={() => setEditingStaff(null)}
        />
      )}
    </div>
  );
};

// Staff Modal Component
interface StaffModalProps {
  staff?: StaffMember;
  onSave: (staff: StaffMember | Omit<StaffMember, 'id'>) => void;
  onCancel: () => void;
}

const StaffModal: React.FC<StaffModalProps> = ({ staff, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: staff?.name || '',
    role: staff?.role || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    specialties: staff?.specialties || [],
    photo: staff?.photo || null,
    isActive: staff?.isActive ?? true,
    startDate: staff?.startDate || new Date().toISOString().split('T')[0],
    notes: staff?.notes || '',
    isResourceTeacher: staff?.isResourceTeacher ?? false,
    isRelatedArtsTeacher: staff?.isRelatedArtsTeacher ?? false
  });

  const [newSpecialty, setNewSpecialty] = useState('');

  const roleOptions = [
    'Special Education Teacher',
    'Paraprofessional',
    'Speech Therapist',
    'Occupational Therapist',
    'Physical Therapist',
    'Behavior Specialist',
    'Reading Specialist',
    'Math Support Specialist',
    'Inclusion Coordinator',
    'Classroom Aide',
    'Art Teacher',
    'Music Teacher',
    'PE Teacher',
    'Library Media Specialist',
    'Computer/Technology Teacher'
  ];

  const commonSpecialties = [
    'Autism Support',
    'Behavior Management',
    'Math Support',
    'Reading Support',
    'Individual Assistance',
    'Speech Therapy',
    'Occupational Therapy',
    'Physical Therapy',
    'Communication Devices',
    'Sensory Support',
    'Transition Planning',
    'Life Skills',
    'Art Therapy',
    'Music Therapy',
    'Movement/Dance',
    'Technology Integration'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (staff) {
      onSave({ ...staff, ...formData });
    } else {
      onSave(formData);
    }
  };

  const addSpecialty = (specialty: string) => {
    if (specialty && !formData.specialties.includes(specialty)) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialty]
      });
    }
    setNewSpecialty('');
  };

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== specialty)
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="">Select a role...</option>
                  {roleOptions.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({...formData, isActive: e.target.value === 'active'})}
                  style={{ width: '100%' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Teacher Type Checkboxes */}
            <div className="form-group">
              <label>Teacher Type</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#333' }}>
                  <input
                    type="checkbox"
                    checked={formData.isResourceTeacher}
                    onChange={(e) => setFormData({...formData, isResourceTeacher: e.target.checked})}
                  />
                  <span>🎯 Resource Teacher</span>
                  <small style={{ color: '#666', fontSize: '0.8rem' }}>(Pull-out services)</small>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#333' }}>
                  <input
                    type="checkbox"
                    checked={formData.isRelatedArtsTeacher}
                    onChange={(e) => setFormData({...formData, isRelatedArtsTeacher: e.target.checked})}
                  />
                  <span>🎨 Related Arts Teacher</span>
                  <small style={{ color: '#666', fontSize: '0.8rem' }}>(Comes to classroom)</small>
                </label>
              </div>
            </div>

            {/* Specialties */}
            <div className="form-group">
              <label>Specialties</label>
              <div style={{ marginBottom: '0.5rem' }}>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addSpecialty(e.target.value);
                    }
                  }}
                  style={{ width: '70%', marginRight: '0.5rem' }}
                >
                  <option value="">Add a specialty...</option>
                  {commonSpecialties.filter(s => !formData.specialties.includes(s)).map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const custom = prompt('Enter custom specialty:');
                    if (custom) addSpecialty(custom);
                  }}
                  style={{
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  + Custom
                </button>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {formData.specialties.map(specialty => (
                  <span
                    key={specialty}
                    style={{
                      background: 'linear-gradient(145deg, #667eea, #764ba2)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    {specialty}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(specialty)}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        fontSize: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes about this staff member..."
                rows={3}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {staff ? 'Update Staff Member' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffManagement;

// Global function to get staff data for other components
export const getStaffData = (): StaffMember[] => {
  try {
    const savedStaff = localStorage.getItem('staff_members');
    return savedStaff ? JSON.parse(savedStaff) : [];
  } catch (error) {
    console.error('Error getting staff data:', error);
    return [];
  }
};