import React from 'react';

export const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { 
        height: '100vh',
        background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', 
        display: 'flex', 
        gap: '2rem', 
        padding: '2rem',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, sans-serif',
        overflow: 'hidden'
    },
    leftColumn: { 
        width: '350px', 
        background: 'rgba(255, 255, 255, 0.2)', 
        backdropFilter: 'blur(10px)', 
        border: '1px solid rgba(255, 255, 255, 0.2)', 
        borderRadius: '24px', 
        padding: '2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        color: 'white',
        height: 'fit-content',
        maxHeight: '100%',
        overflow: 'hidden'
    },
    rightColumn: { 
        flex: 1, 
        background: 'rgba(255, 255, 255, 0.2)', 
        backdropFilter: 'blur(10px)', 
        border: '1px solid rgba(255, 255, 255, 0.2)', 
        borderRadius: '24px', 
        padding: '2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '0'
    },
    leftTitle: { fontSize: '2.5rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)', marginBottom: '0.5rem' },
    progressList: { flex: 1, overflowY: 'auto' },
    progressItem: { cursor: 'pointer', fontSize: '1.1rem', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', fontWeight: 500, transition: 'all 0.3s ease', display: 'flex', alignItems: 'center' },
    progressItemActive: { background: 'rgba(255, 255, 255, 0.3)', fontWeight: 700 },
    progressItemCompleted: { 
        opacity: 1, 
        textDecoration: 'line-through',
        background: 'rgba(40, 167, 69, 0.3)'
    },
    progressCheck: { marginRight: '0.75rem', fontSize: '1.2rem' },
    standardText: { fontSize: '0.8rem', opacity: 0.7, marginTop: '4px' },
    rightPanelTitle: { fontSize: '2.5rem', fontWeight: 700, color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.3)', textAlign: 'center' },
    gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '800px', marginTop: '2rem' },
    card: { background: 'rgba(255, 255, 255, 0.7)', border: '2px solid transparent', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease-in-out', color: '#333' },
    cardSelected: { borderColor: '#3B82F6', background: 'rgba(59, 130, 246, 0.3)', color: 'white', transform: 'scale(1.05)', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' },
    cardEmoji: { fontSize: '3rem' },
    cardTitle: { fontSize: '1.2rem', fontWeight: 600 },
    // Calendar Chart Styles
    calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', width: '100%', background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '16px' },
    calendarHeader: { textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', color: 'white', paddingBottom: '0.5rem' },
    calendarDay: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '1rem', color: 'white', position: 'relative' },
    calendarDayNumber: { position: 'absolute', top: '5px', right: '5px', opacity: 0.7 },
    calendarDayToday: { background: 'rgba(59, 130, 246, 0.5)', border: '2px solid white' },
    weatherIcon: { fontSize: '2.5rem' },
    // Bar Graph Styles
    graphContainer: { display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', width: '100%', height: '300px', background: 'rgba(0,0,0,0.1)', borderRadius: '16px', padding: '1rem' },
    barWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
    bar: { width: '60%', background: 'linear-gradient(to top, #a1c4fd, #c2e9fb)', borderRadius: '8px 8px 0 0', transition: 'height 0.5s ease-out' },
    barLabel: { marginTop: '0.5rem', fontSize: '2rem' },
    barCount: { color: 'white', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '0.5rem' },
    
    // Enhanced Bar Graph Styles
    enhancedGraphContainer: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        width: '100%',
        height: '400px',
        background: 'rgba(0,0,0,0.1)',
        borderRadius: '16px',
        padding: '2rem'
    },
    
    enhancedBarWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        gap: '0.5rem'
    },
    
    enhancedBar: {
        width: '80%',
        borderRadius: '8px 8px 0 0',
        transition: 'height 0.5s ease-out',
        minHeight: '20px'
    },
    
    colorSquare: {
        width: '20px',
        height: '20px',
        borderRadius: '4px',
        border: '2px solid white'
    },
    internalNavBar: { 
        position: 'absolute', 
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', 
        gap: '1rem',
        zIndex: 10
    },
    internalNavButton: { padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', background: 'rgba(0, 86, 179, 0.7)', color: 'white', border: '1px solid rgba(255,255,255,0.5)' },
    disabledButton: { background: 'rgba(108, 117, 125, 0.7)', cursor: 'not-allowed' },
    celebrationOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    celebrationMessage: { padding: '2rem 4rem', background: 'linear-gradient(45deg, #28a745, #20c997)', color: 'white', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', fontSize: '2rem', fontWeight: 700 },
    videoButton: { marginTop: 'auto', padding: '1rem', fontSize: '1rem', background: 'rgba(0, 86, 179, 0.7)', color: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 },
};
