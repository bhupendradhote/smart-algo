import React from 'react';

const styles = {
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', zIndex: 99, display: 'flex', justifyContent: 'flex-end',
  },
  sidebar: {
    width: '280px', height: '100%', background: '#161923',
    borderLeft: '1px solid #2b313a', display: 'flex', flexDirection: 'column',
    boxShadow: '-4px 0 15px rgba(0,0,0,0.3)', transition: 'transform 0.3s ease',
  },
  header: {
    padding: '16px', borderBottom: '1px solid #2b313a',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    color: '#fff', fontWeight: '600', fontSize: '16px',
  },
  closeBtn: {
    background: 'transparent', border: 'none', color: '#9aa0aa',
    cursor: 'pointer', fontSize: '20px',
  },
  list: { flex: 1, overflowY: 'auto', padding: '8px' },
  item: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 12px', marginBottom: '4px', borderRadius: '6px',
    background: '#0f1220', border: '1px solid #20242e',
  },
  label: { display: 'flex', flexDirection: 'column', gap: '2px' },
  name: { color: '#d1d4dc', fontSize: '14px', fontWeight: 500 },
  code: { color: '#686d76', fontSize: '11px', textTransform: 'uppercase' },
  // Simple CSS toggle switch
  switch: {
    position: 'relative', display: 'inline-block', width: '34px', height: '20px',
  },
  input: { opacity: 0, width: 0, height: 0 },
  slider: (active, color) => ({
    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: active ? (color || '#2962ff') : '#363a45',
    transition: '.4s', borderRadius: '20px',
  }),
  knob: (active) => ({
    position: 'absolute', content: '""', height: '14px', width: '14px',
    left: active ? '16px' : '4px', bottom: '3px',
    backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
  }),
};

export default function Sidebar({ isOpen, onClose, availableIndicators, activeIndicators, onToggle }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sidebar} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          Indicators
          <button style={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        
        <div style={styles.list}>
          {availableIndicators.length === 0 && (
            <div style={{padding: 20, textAlign: 'center', color: '#666'}}>Loading...</div>
          )}

          {availableIndicators.map((ind) => {
            const isActive = activeIndicators.includes(ind.code);
            return (
              <div key={ind.code} style={styles.item}>
                <div style={styles.label}>
                  <span style={styles.name}>{ind.name}</span>
                  <span style={styles.code}>{ind.type}</span>
                </div>
                
                <label style={styles.switch}>
                  <input 
                    type="checkbox" 
                    checked={isActive} 
                    onChange={() => onToggle(ind.code)}
                    style={styles.input}
                  />
                  <span style={styles.slider(isActive, ind.default_color)}>
                    <span style={styles.knob(isActive)} />
                  </span>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}