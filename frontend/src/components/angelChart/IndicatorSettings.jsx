import React, { useState, useEffect } from 'react';

const styles = {
    overlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.6)', zIndex: 1000, 
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    modal: {
        background: '#1e222d', width: '320px', borderRadius: '6px',
        border: '1px solid #2b313a', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', 
        color: '#d1d4dc', fontFamily: 'sans-serif'
    },
    header: {
        padding: '14px 16px', background: '#1e222d', borderBottom: '1px solid #2b313a',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600'
    },
    body: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { color: '#9aa0aa', fontSize: '12px', textTransform: 'uppercase' },
    input: {
        background: '#161923', border: '1px solid #2b313a', color: '#fff',
        padding: '8px 10px', borderRadius: '4px', outline: 'none', fontSize: '14px'
    },
    footer: {
        padding: '14px 16px', display: 'flex', justifyContent: 'flex-end', gap: '12px',
        borderTop: '1px solid #2b313a', background: '#1e222d'
    },
    btnCancel: { background: 'transparent', border: 'none', color: '#9aa0aa', cursor: 'pointer', fontSize: '13px' },
    btnSave: { background: '#2962ff', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }
};

export default function IndicatorSettings({ indicator, onClose, onSave }) {
    const [values, setValues] = useState({});

    useEffect(() => {
        if (indicator && indicator.params) {
            const initial = {};
            indicator.params.forEach(p => {
                initial[p.key] = p.value !== undefined ? p.value : p.default_value;
            });
            setValues(initial);
        }
    }, [indicator]);

    const handleChange = (key, val, type) => {
        setValues(prev => ({
            ...prev,
            [key]: type === 'int' ? parseInt(val) : type === 'float' ? parseFloat(val) : val
        }));
    };

    const handleSave = () => {
        onSave(indicator.code, values);
        onClose();
    };

    if (!indicator) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <span>{indicator.name} Settings</span>
                    <button onClick={onClose} style={{...styles.btnCancel, fontSize:'18px'}}>&times;</button>
                </div>
                <div style={styles.body}>
                    {indicator.params.map(param => (
                        <div key={param.key} style={styles.field}>
                            <label style={styles.label}>{param.label || param.key}</label>
                            {param.type === 'bool' ? (
                                <select 
                                    style={styles.input}
                                    value={values[param.key] ? "true" : "false"}
                                    onChange={(e) => handleChange(param.key, e.target.value === "true", 'bool')}
                                >
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                </select>
                            ) : (
                                <input
                                    type={param.type === 'int' || param.type === 'float' ? 'number' : 'text'}
                                    style={styles.input}
                                    value={values[param.key] || ''}
                                    onChange={(e) => handleChange(param.key, e.target.value, param.type)}
                                />
                            )}
                        </div>
                    ))}
                    {(!indicator.params || indicator.params.length === 0) && (
                        <div style={{color:'#666', fontStyle:'italic', fontSize:'13px'}}>No configurable settings.</div>
                    )}
                </div>
                <div style={styles.footer}>
                    <button style={styles.btnCancel} onClick={onClose}>Cancel</button>
                    <button style={styles.btnSave} onClick={handleSave}>Apply & Save</button>
                </div>
            </div>
        </div>
    );
}