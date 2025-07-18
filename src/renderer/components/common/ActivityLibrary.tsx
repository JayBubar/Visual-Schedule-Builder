import React, { useState } from 'react'

export default function ActivityLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', name: 'All Activities', icon: '📚' },
    { id: 'academic', name: 'Academic', icon: '📖' },
    { id: 'specials', name: 'Specials', icon: '🎨' },
    { id: 'transitions', name: 'Transitions', icon: '🚶' },
    { id: 'breaks', name: 'Breaks', icon: '☁️' },
    { id: 'social', name: 'Social', icon: '👥' }
  ]

  const activities = [
    // Academic
    { id: 1, name: 'Morning Meeting', category: 'academic', icon: '☀️', description: 'Start the day together' },
    { id: 2, name: 'Math', category: 'academic', icon: '🔢', description: 'Numbers and problem solving' },
    { id: 3, name: 'Reading', category: 'academic', icon: '📚', description: 'Independent and guided reading' },
    { id: 4, name: 'Writing', category: 'academic', icon: '✏️', description: 'Creative and structured writing' },
    { id: 5, name: 'Science', category: 'academic', icon: '🔬', description: 'Experiments and discovery' },
    { id: 6, name: 'Social Studies', category: 'academic', icon: '🌍', description: 'Community and history' },
    
    // Specials
    { id: 7, name: 'Art', category: 'specials', icon: '🎨', description: 'Creative expression' },
    { id: 8, name: 'Music', category: 'specials', icon: '🎵', description: 'Songs and instruments' },
    { id: 9, name: 'PE', category: 'specials', icon: '🏃', description: 'Physical education' },
    { id: 10, name: 'Library', category: 'specials', icon: '📖', description: 'Book exploration' },
    { id: 11, name: 'Computer Lab', category: 'specials', icon: '💻', description: 'Technology skills' },
    
    // Transitions
    { id: 12, name: 'Line Up', category: 'transitions', icon: '🚶', description: 'Getting ready to move' },
    { id: 13, name: 'Bathroom Break', category: 'transitions', icon: '🚻', description: 'Personal needs time' },
    { id: 14, name: 'Pack Up', category: 'transitions', icon: '🎒', description: 'Organizing materials' },
    { id: 15, name: 'Clean Up', category: 'transitions', icon: '🧹', description: 'Tidying the space' },
    
    // Breaks
    { id: 16, name: 'Recess', category: 'breaks', icon: '⚽', description: 'Outdoor play time' },
    { id: 17, name: 'Lunch', category: 'breaks', icon: '🍽️', description: 'Meal time' },
    { id: 18, name: 'Snack', category: 'breaks', icon: '🍎', description: 'Quick energy boost' },
    { id: 19, name: 'Quiet Time', category: 'breaks', icon: '🤫', description: 'Rest and reflection' },
    
    // Social
    { id: 20, name: 'Show and Tell', category: 'social', icon: '🎤', description: 'Sharing with friends' },
    { id: 21, name: 'Group Work', category: 'social', icon: '👥', description: 'Collaborative learning' },
    { id: 22, name: 'Circle Time', category: 'social', icon: '⭕', description: 'Community discussion' },
    { id: 23, name: 'Dismissal', category: 'social', icon: '👋', description: 'End of day goodbyes' }
  ]

  const filteredActivities = activities.filter(activity => {
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="activity-library" style={{ padding: '24px', height: '100%' }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '2px solid #e2e8f0'
        }}>
          <h1 style={{ 
            margin: '0 0 12px',
            fontSize: '32px',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            📚 Activity Library
          </h1>
          <p style={{ 
            margin: 0,
            color: '#64748b',
            fontSize: '18px'
          }}>
            Browse and manage activity icons for your visual schedules
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '20px',
          marginBottom: '24px',
          alignItems: 'end'
        }}>
          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Search Activities
            </label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Add Custom Activity Button */}
          <button style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}>
            ➕ Add Custom Activity
          </button>
        </div>

        {/* Category Filters */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                background: selectedCategory === category.id ? '#3b82f6' : 'white',
                color: selectedCategory === category.id ? 'white' : '#374151',
                border: '2px solid #e2e8f0',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div style={{
          marginBottom: '16px',
          fontSize: '14px',
          color: '#64748b'
        }}>
          Showing {filteredActivities.length} of {activities.length} activities
        </div>

        {/* Activity Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
          flex: 1,
          overflow: 'auto'
        }}>
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              style={{
                background: 'white',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: 'fit-content'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Icon */}
              <div style={{
                fontSize: '48px',
                marginBottom: '12px',
                background: '#f1f5f9',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {activity.icon}
              </div>

              {/* Name */}
              <h3 style={{
                margin: '0 0 8px',
                fontSize: '16px',
                color: '#1e293b',
                fontWeight: '600'
              }}>
                {activity.name}
              </h3>

              {/* Description */}
              <p style={{
                margin: '0 0 12px',
                fontSize: '12px',
                color: '#64748b',
                lineHeight: 1.4
              }}>
                {activity.description}
              </p>

              {/* Category Badge */}
              <span style={{
                background: '#dbeafe',
                color: '#1e40af',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '500',
                textTransform: 'capitalize'
              }}>
                {activity.category}
              </span>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredActivities.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>No activities found</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Try adjusting your search terms or category filter
            </p>
          </div>
        )}

        {/* Info Box */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#0c4a6e'
        }}>
          <strong>💡 Pro Tip:</strong> Drag activities directly from this library to your schedule canvas, 
          or click to add them to your custom collection. Coming soon: Upload your own activity images!
        </div>
      </div>
    </div>
  )
}
