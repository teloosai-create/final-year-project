import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SummaryPanel({ summary, sendTelegramAlert, downloadPDFReport, locationName, locationCoords }) {
    if (!summary) return null;

    const lat = locationCoords?.lat || 25.612;
    const lon = locationCoords?.lon || 85.115;
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`;

    const totalVehicles = summary.history.reduce((a, b) => Math.max(a, b.vehicles || 0), 0);
    const trafficDensity = totalVehicles < 5 ? 'Light' : (totalVehicles < 12 ? 'Moderate' : 'Heavy');

    if (summary.hasAccident) {
        return (
            <div style={{ marginTop: '24px', background: '#111827', border: '1px solid #ef4444', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🚨</span>
                        <h3 style={{ color: '#ef4444', margin: 0 }}>Incident Detection Profile ({summary.eventID})</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={sendTelegramAlert}
                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            🚀 Transmit Alert
                        </button>
                        <button
                            onClick={downloadPDFReport}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            📥 Export Forensics PDF
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                            <span style={{ color: '#9ca3af', display: 'block', marginBottom: '4px', fontSize: '0.8rem' }}>Geo-Location Engine</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <strong style={{ color: '#a7f3d0' }}>{locationName}</strong>
                                <span style={{ fontSize: '0.85rem', color: '#6ee7b7' }}>GPS: {lat.toFixed(5)}, {lon.toFixed(5)}</span>
                                <span style={{ fontSize: '0.85rem', color: '#fbbf24' }}>Traffic Density: {trafficDensity}</span>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                            <span style={{ color: '#9ca3af', display: 'block', marginBottom: '4px', fontSize: '0.8rem' }}>Accident Metadata</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Severity Score:</span><strong style={{ color: '#fbbf24' }}>{summary.severity || 0} / 10</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Trigger Timestamp:</span><strong>Frame {summary.firstDetectionFrame} / {summary.firstDetectionTime}s</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Estimated Damage:</span><strong style={{ color: '#fca5a5' }}>{summary.damageRange}</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Reporting Authority:</span><strong style={{ color: '#93c5fd' }}>Local Control Room</strong></div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ border: '1px solid #374151', borderRadius: '8px', overflow: 'hidden', height: '140px', background: 'black' }}>
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight="0"
                                marginWidth="0"
                                src={mapUrl}
                                style={{ filter: 'invert(90%) hue-rotate(180deg)', opacity: 0.8 }}
                                title="Accident Location"
                            ></iframe>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                            <span style={{ color: '#9ca3af', display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Signal Dispatch Status</span>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '4px' }}><span>Telegram:</span><strong style={{ color: '#10b981' }}>✓ Dispatched</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '4px' }}><span>Email Alert:</span><strong style={{ color: '#fbbf24' }}>⟳ Pending</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '4px' }}><span>Ambulance:</span><strong style={{ color: '#9ca3af' }}>Standby</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '4px' }}><span>Traffic DB:</span><strong style={{ color: '#10b981' }}>✓ Synced</strong></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* New Section for Driver & Vehicle Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '12px', borderRadius: '8px' }}>
                        <span style={{ color: '#93c5fd', display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>👤 Driver Profile</span>
                        {summary.driverInfo ? (
                            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <strong style={{ fontSize: '1rem', color: 'white' }}>{summary.driverInfo.name}</strong>
                                <span>Age: {summary.driverInfo.age} | Exp: {summary.driverInfo.experienceYears}y</span>
                                <span>Blood Group: <strong style={{ color: '#ef4444' }}>{summary.driverInfo.bloodGroup}</strong></span>
                                <span style={{ color: '#9ca3af' }}>DL: {summary.driverInfo.licenseNumber}</span>
                            </div>
                        ) : <span>No Driver Assigned</span>}
                    </div>

                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px', borderRadius: '8px' }}>
                        <span style={{ color: '#6ee7b7', display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>🚗 Vehicle Profile</span>
                        {summary.vehicleInfo ? (
                            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <strong style={{ fontSize: '1rem', color: 'white' }}>{summary.vehicleInfo.brand} {summary.vehicleInfo.model}</strong>
                                <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{summary.vehicleInfo.registrationNumber}</span>
                                <span>Type: {summary.vehicleInfo.type}</span>
                                <span style={{ color: '#9ca3af' }}>Insurance Expiry: {summary.vehicleInfo.insuranceExpiry}</span>
                            </div>
                        ) : <span>No Vehicle Assigned</span>}
                    </div>

                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '8px' }}>
                        <span style={{ color: '#fca5a5', display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>🆘 Emergency Contact</span>
                        {summary.emergencyContact ? (
                            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <strong style={{ fontSize: '1rem', color: 'white' }}>{summary.emergencyContact.name}</strong>
                                <span style={{ color: '#fca5a5' }}>Relation: {summary.emergencyContact.relation}</span>
                                <strong style={{ color: 'white', marginTop: '4px' }}>📞 {summary.emergencyContact.phone}</strong>
                                <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{summary.emergencyContact.location}</span>
                            </div>
                        ) : <span>No Contact Assigned</span>}
                    </div>
                </div>

                {/* Emergency Services Dispatch Section */}
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid #374151', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                    <span style={{ color: '#9ca3af', display: 'block', marginBottom: '16px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>🏢 Emergency Services Dispatch (Demo Purpose)</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', padding: '12px', borderRadius: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <strong style={{ color: '#3b82f6' }}>🚔 Police</strong>
                                <span style={{ color: '#10b981', fontSize: '0.75rem' }}>● Transmitted</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#d1d5db' }}>
                                <div>PCR: Zone-4 Patna</div>
                                <div>ETA: 4-6 Minutes</div>
                                <div style={{ marginTop: '4px', fontWeight: 'bold', color: 'white' }}>📞 112 / 100</div>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(239, 44, 44, 0.1)', border: '1px solid #ef4444', padding: '12px', borderRadius: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <strong style={{ color: '#ef4444' }}>🚑 Ambulance</strong>
                                <span style={{ color: '#fbbf24', fontSize: '0.75rem' }}>● In-Route</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#d1d5db' }}>
                                <div>Apollo Emergency Unit</div>
                                <div>Distance: 2.4 KM</div>
                                <div style={{ marginTop: '4px', fontWeight: 'bold', color: 'white' }}>📞 102 / 108</div>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid #f97316', padding: '12px', borderRadius: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <strong style={{ color: '#f97316' }}>🚒 Fire Dept</strong>
                                <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>○ Standby</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#d1d5db' }}>
                                <div>Station: Patna Cent.</div>
                                <div>Status: Notification Sent</div>
                                <div style={{ marginTop: '4px', fontWeight: 'bold', color: 'white' }}>📞 101</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px', height: '200px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                        <span style={{ color: '#9ca3af', display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Accident Confidence Graph</span>
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart data={summary.history.slice(-30)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tick={{ fill: '#9ca3af' }} />
                                <YAxis stroke="#9ca3af" fontSize={10} domain={[0, 100]} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', fontSize: '12px' }} />
                                <Line type="monotone" dataKey="confidenceValue" stroke="#ef4444" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                        <span style={{ color: '#9ca3af', display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Vehicle Density Over Time</span>
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart data={summary.history.slice(-30)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} />
                                <YAxis stroke="#9ca3af" fontSize={10} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', fontSize: '12px' }} />
                                <Line type="stepAfter" dataKey="vehicles" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
                    <div>
                        <h4 style={{ color: '#9ca3af', marginBottom: '12px' }}>Object-Level Tracing Breakdown</h4>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(0,0,0,0.5)', color: '#9ca3af' }}>
                                        <th style={{ padding: '8px' }}>ID</th>
                                        <th style={{ padding: '8px' }}>Type</th>
                                        <th style={{ padding: '8px' }}>Collision Mode</th>
                                        <th style={{ padding: '8px' }}>Impact Est</th>
                                        <th style={{ padding: '8px' }}>Spd Drop</th>
                                        <th style={{ padding: '8px' }}>Risk</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(summary.accidentVehicles || []).map((v, idx) => (
                                        <tr key={v?.id || idx} style={{ borderBottom: '1px solid #374151' }}>
                                            <td style={{ padding: '8px', color: '#d1d5db', fontFamily: 'monospace' }}>{v?.id ? v.id.slice(0, 4) : 'N/A'}</td>
                                            <td style={{ padding: '8px', color: 'white', textTransform: 'capitalize' }}>{v?.cls || 'Unknown'}</td>
                                            <td style={{ padding: '8px', color: '#fcd34d', fontWeight: 'bold' }}>{v?.collisionType || 'N/A'}</td>
                                            <td style={{ padding: '8px', color: v?.impactForce === 'High' ? '#ef4444' : '#fbbf24' }}>{v?.impactForce || 'Low'}</td>
                                            <td style={{ padding: '8px', color: '#a7f3d0' }}>-{Math.round(v?.speedChange || 0)}%</td>
                                            <td style={{ padding: '8px', color: v?.riskLevel === 'Critical' ? '#ef4444' : '#fbbf24', fontWeight: 'bold' }}>{v?.riskLevel || 'High'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {summary.snapshotData && (
                        <div>
                            <h4 style={{ color: '#9ca3af', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Accident Evidence Snapshot</span>
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
                    <h3 style={{ color: '#10b981', margin: 0 }}>Incident Detection Profile (SAFE)</h3>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                    <span style={{ color: '#9ca3af' }}>Location:</span>
                    <strong style={{ color: '#a7f3d0' }}>{locationName} (Traffic: {trafficDensity})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                    <span style={{ color: '#9ca3af' }}>Total Frames Analyzed:</span>
                    <strong>{summary.framesAnalyzed}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                    <span style={{ color: '#9ca3af' }}>Detection Latency:</span>
                    <strong style={{ fontFamily: 'monospace' }}>{summary.avgLatency}ms / frame</strong>
                </div>
            </div>

            <div style={{ marginTop: '24px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', height: '180px' }}>
                <span style={{ color: '#9ca3af', display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Vehicle Density Over Time</span>
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={summary.history.slice(-30)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} />
                        <YAxis stroke="#9ca3af" fontSize={10} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', fontSize: '12px' }} />
                        <Line type="stepAfter" dataKey="vehicles" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
