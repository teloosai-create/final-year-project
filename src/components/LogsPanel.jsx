import React from 'react';

export default function LogsPanel({ logs, setLogs }) {
    return (
        <div className="logs-container">
            <div className="logs-header">
                <span>System Logs</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span>{logs.length} entries</span>
                    <button
                        onClick={() => setLogs([])}
                        style={{ background: 'transparent', color: '#9ca3af', border: '1px solid #374151', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                        Clear Logs
                    </button>
                </div>
            </div>
            <div className="logs-list">
                {logs.map((log, idx) => (
                    <div key={idx} className="log-item">
                        <span className="log-time">[{log.time}]</span>
                        <span className={`log-msg ${log.isAccident ? 'accident' : ''}`} style={{ whiteSpace: 'pre-wrap' }}>{log.msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
