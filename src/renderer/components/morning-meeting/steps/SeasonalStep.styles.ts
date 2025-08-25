import React from 'react';

export const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { height: '100%', display: 'flex', gap: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)', fontFamily: 'system-ui, sans-serif' },
    leftColumn: { width: '350px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', color: 'white' },
    rightColumn: { flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '2rem' },
    leftTitle: { fontSize: '2.5rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)', marginBottom: '2rem' },
    progressItem: { cursor: 'pointer', fontSize: '1.1rem', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', fontWeight: 500, transition: 'all 0.3s ease', display: 'flex', alignItems: 'center' },
    progressItemActive: { background: 'rgba(255, 255, 255, 0.3)', fontWeight: 700 },
    progressItemCompleted: { opacity: 1, textDecoration: 'line-through' },
    progressCheck: { marginRight: '0.75rem', fontSize: '1.2rem' },
    standardText: { fontSize: '0.8rem', opacity: 0.7, marginTop: '4px' }, 
    rightPanelTitle: { fontSize: '2.5rem', fontWeight: 700, color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.3)', textAlign: 'center', marginBottom: '1rem' },
    gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '80%', maxWidth: '600px' },
    // MODIFICATION: Card is now a positioning container for the arrow
    card: { 
        background: 'rgba(255, 255, 255, 0.8)', 
        border: '1px solid rgba(255, 255, 255, 0.5)', 
        borderRadius: '16px', 
        padding: '1.5rem', 
        textAlign: 'center', 
        cursor: 'pointer', 
        transition: 'all 0.2s ease-in-out', 
        color: '#333',
        position: 'relative', // ADDED: Allows absolute positioning of children
        overflow: 'hidden'    // ADDED: Keeps corners clean
    },
    cardSelected: { background: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)', color: 'white', transform: 'scale(1.05)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' },
    cardEmoji: { fontSize: '3rem' },
    cardTitle: { fontSize: '1.2rem', fontWeight: 600 },
    // MODIFICATION: Arrow styles updated for the new design
    arrow: {
        position: 'absolute',
        fontSize: '2rem',
        background: 'rgba(255, 255, 255, 0.9)',
        color: '#3B82F6',
        borderRadius: '8px',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        opacity: 0,
        transform: 'scale(0.5)',
        transition: 'opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s'
    },
    arrowVisible: { 
        opacity: 1, 
        transform: 'scale(1)' 
    },
    // NEW: Corner positioning styles
    arrowPositionBR: { bottom: '10px', right: '10px' }, // For Spring
    arrowPositionBL: { bottom: '10px', left: '10px' },  // For Summer
    arrowPositionTL: { top: '10px', left: '10px' },   // For Winter
    arrowPositionTR: { top: '10px', right: '10px' },   // For Fall
    quizButtonContainer: { display: 'flex', gap: '1rem', marginBottom: '2rem' },
    quizButton: { padding: '1rem 2rem', fontSize: '1.2rem', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, color: '#333' },
    quizCard: { width: '80%', background: 'rgba(255,255,255,0.7)', padding: '2rem', borderRadius: '16px', textAlign: 'center', transition: 'all 0.3s ease' },
    quizCardCorrect: { background: 'rgba(40, 167, 69, 0.8)', color: 'white' },
    quizCardIncorrect: { background: 'rgba(220, 53, 69, 0.8)', color: 'white', animation: 'shake 0.5s' },
    quizCardText: { fontSize: '1.5rem', fontWeight: 500, margin: '1rem 0 0 0' },
    mysteryBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '16px', padding: '3rem', width: '80%', color: 'white' },
    actionButton: { padding: '1rem 2rem', fontSize: '1.2rem', background: 'linear-gradient(45deg, #28a745 0%, #20c997 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, marginTop: '2rem' },
    internalNavBar: { position: 'absolute', bottom: '2rem', display: 'flex', gap: '1rem' },
    internalNavButton: { padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', background: 'rgba(0, 86, 179, 0.7)', color: 'white', border: '1px solid rgba(255,255,255,0.5)' },
    finishButton: { padding: '0.8rem 2rem', fontSize: '1.2rem', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', background: 'linear-gradient(45deg, #28a745, #20c997)', color: 'white', border: 'none' },
    disabledButton: { background: 'rgba(108, 117, 125, 0.7)', cursor: 'not-allowed', color: 'rgba(255,255,255,0.5)' },
    celebrationOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    celebrationMessage: { padding: '2rem 4rem', background: 'linear-gradient(45deg, #28a745, #20c997)', color: 'white', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', fontSize: '2rem', fontWeight: 700 },
    videoButton: { marginTop: 'auto', padding: '1rem', fontSize: '1rem', background: 'rgba(0, 86, 179, 0.7)', color: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 },
};