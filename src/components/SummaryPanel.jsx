import React from 'react';

export default function SummaryPanel({ summary, sendTelegramAlert, downloadPDFReport, locationName }) {
    if (!summary) return null;

    if (summary.hasAccident) {
        return (
            <div style={{ marginTop: '24px', background: '#111827', border: '1px solid #ef4444', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🚨</span>
                        <h3 style={{ color: '#ef4444', margin: 0 }}>Incident Detection Profile</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={sendTelegramAlert}
                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            🚀 Telegram Alert
                        </button>
                        <button
                            onClick={downloadPDFReport}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            📥 Download PDF Report
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                            <span style={{ color: '#9ca3af' }}>Accident Status:</span>
                            <strong style={{ color: '#ef4444' }}>🔴 Accident Detected</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                            <span style={{ color: '#9ca3af' }}>Location:</span>
                            <strong style={{ color: '#a7f3d0' }}>{locationName}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                            <span style={{ color: '#9ca3af' }}>Trigger Frame / Timestamp:</span>
                            <strong>Frame {summary.firstDetectionFrame} / {summary.firstDetectionTime}s</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                            <span style={{ color: '#9ca3af' }}>Vehicles Involved ({(summary.accidentVehicles || []).length}):</span>
                            <strong>{(summary.objects || []).join(', ')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                            <span style={{ color: '#9ca3af' }}>Confidence Score:</span>
                            <strong>{summary.confidence || 0}%</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                            <span style={{ color: '#9ca3af' }}>Severity Level:</span>
                            <strong style={{ color: '#fbbf24' }}>{summary.severity || 0} / 10</strong>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                            <span style={{ color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Reason for Detection</span>
                            <strong style={{ color: '#fca5a5' }}>"{summary.accidentReason || 'Unknown Event Detected'}"</strong>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                            <span style={{ color: '#9ca3af', display: 'block', marginBottom: '8px' }}>AI Summary Report</span>
                            <div style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#e5e7eb' }}>
                                An accident was detected at frame {summary.firstDetectionFrame || 'N/A'} involving {(summary.accidentVehicles || []).length} vehicles ({(summary.objects || []).join(', ')}). {summary.accidentReason || 'An event'} triggered the event. Estimated severity is {(summary.severity || 0) >= 8 ? 'High' : 'Medium-High'}.
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
                    <div>
                        <h4 style={{ color: '#9ca3af', marginBottom: '12px' }}>Event Tracking Data</h4>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ background: 'rgba(0,0,0,0.5)', color: '#9ca3af' }}>
                                    <th style={{ padding: '8px' }}>Tracking ID</th>
                                    <th style={{ padding: '8px' }}>Reg No (Demo)</th>
                                    <th style={{ padding: '8px' }}>Type</th>
                                    <th style={{ padding: '8px' }}>Road Conditions</th>
                                    <th style={{ padding: '8px' }}>Risk Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(summary.accidentVehicles || []).map(v => (
                                    <tr key={v?.id || Math.random()} style={{ borderBottom: '1px solid #374151' }}>
                                        <td style={{ padding: '8px', color: '#d1d5db', fontFamily: 'monospace' }}>{v?.id ? v.id.split('-')[0] : 'N/A'}</td>
                                        <td style={{ padding: '8px', color: '#fcd34d', fontWeight: 'bold' }}>{v?.plate || 'Unknown'}</td>
                                        <td style={{ padding: '8px', color: 'white', textTransform: 'capitalize' }}>{v?.cls || 'Unknown'}</td>
                                        <td style={{ padding: '8px', color: '#a7f3d0' }}>{v?.roadCondition || 'Clear'}</td>
                                        <td style={{ padding: '8px', color: v?.riskLevel === 'Critical' ? '#ef4444' : '#fbbf24', fontWeight: 'bold' }}>{v?.riskLevel || 'High'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {summary.snapshotData && (
                        <div>
                            <h4 style={{ color: '#9ca3af', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Accident Visual Evidence Snapshot</span>
                                <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>FRAME {summary.firstDetectionFrame}</span>
                            </h4>
                            <div style={{ border: '2px solid #ef4444', borderRadius: '8px', overflow: 'hidden', background: 'black', width: '100%', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img src={summary.snapshotData} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Accident Evidence Snapshot" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '24px', background: '#111827', border: '1px solid #10b981', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.5rem' }}>✅</span>
                    <h3 style={{ color: '#10b981', margin: 0 }}>Incident Detection Profile</h3>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={sendTelegramAlert}
                        style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        🚀 Telegram Report
                    </button>
                    <button
                        onClick={downloadPDFReport}
                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        📥 Download PDF Report
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                    <span style={{ color: '#9ca3af' }}>Accident Status:</span>
                    <strong style={{ color: '#10b981' }}>🟢 Safe / No Accident Detected</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                    <span style={{ color: '#9ca3af' }}>Location:</span>
                    <strong style={{ color: '#a7f3d0' }}>{locationName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                    <span style={{ color: '#9ca3af' }}>Total Frames Analyzed:</span>
                    <strong>{summary.framesAnalyzed}</strong>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                    <span style={{ color: '#9ca3af', display: 'block', marginBottom: '8px' }}>AI Summary Report</span>
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#e5e7eb' }}>
                        The media analysis completed over {summary.framesAnalyzed} frames. No collisions or threshold-violating anomalies were detected. All tracked objects maintained safe speeds and trajectories. The location monitored was {locationName}.
                    </div>
                </div>
            </div>
        </div>
    );
}
