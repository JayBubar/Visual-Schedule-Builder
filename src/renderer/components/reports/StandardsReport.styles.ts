import React from 'react';

export const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: '1rem' },
    header: { marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' },
    th: { 
        padding: '0.75rem', 
        textAlign: 'left', 
        borderBottom: '2px solid #E5E7EB', 
        backgroundColor: '#F9FAFB',
        color: '#374151',
        fontWeight: 600
    },
    td: { padding: '0.75rem', borderBottom: '1px solid #E5E7EB', color: '#111827' },
    select: { padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB' }
};