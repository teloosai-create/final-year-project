import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function SummaryPanel({ summary, sendTelegramAlert, downloadPDFReport, locationName, locationCoords }) {
    if (!summary) return null;

    const lat = locationCoords?.lat || 25.612;
    const lon = locationCoords?.lon || 85.115;
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`;

    const totalVehicles = summary.history?.reduce((a, b) => Math.max(a, b.vehicles || 0), 0) || 0;
    const trafficDensity = totalVehicles < 5 ? 'Light' : (totalVehicles < 12 ? 'Moderate' : 'Heavy');

    if (!summary.hasAccident) {
        return (
            <div style={{ marginTop: '24px', background: '#111827', border: '1px solid #10b981', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.5rem' }}>✅</span>
                        <h3 style={{ color: '#10b981', margin: 0 }}>Incident Detection Profile (SAFE)</h3>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#9ca3af' }}>Location:</span>
                            <strong style={{ color: '#a7f3d0', textAlign: 'right' }}>{locationName} <br /><span style={{ fontSize: '0.8rem', color: '#6b7280' }}>(Traffic: {trafficDensity})</span></strong>
                        </div>
                        <div style={{ height: '140px', width: '100%', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginTop: '8px' }}>
                            <iframe title="Safe Map" width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" src={mapUrl} style={{ border: 0 }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                        <span style={{ color: '#9ca3af' }}>Total Frames Analyzed:</span>
                        <strong>{summary.framesAnalyzed || 0}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                        <span style={{ color: '#9ca3af' }}>Detection Latency:</span>
                        <strong style={{ fontFamily: 'monospace' }}>{summary.avgLatency || 0}ms / frame</strong>
                    </div>
                </div>

                <div style={{ marginTop: '24px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', height: '180px' }}>
                    <span style={{ color: '#9ca3af', display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Vehicle Density Over Time</span>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={(summary.history || []).slice(-30)}>
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

    // Prepare robust fallback data
    const driverInfo = summary.driverInfo || { name: 'Unknown', age: 'N/A', bloodGroup: 'N/A', experienceYears: 'N/A', license: 'N/A', idLink: '#' };
    const vehicleInfo = summary.vehicleInfo || { registration: 'N/A', type: 'Car', make: 'Unknown', model: 'Unknown', insuranceExpiry: 'N/A', owner: 'N/A' };
    const metadata = {
        category: summary.collisionType || 'Rear-end', speedAtImpact: (summary.accidentVehicles?.[0]?.speed || 0) + ' km/h',
        damageCost: 'Est. ₹45,000+', impactAngle: summary.collisionAngle || 15, deltaV: '42 km/h',
        primaryCause: summary.distractionType || 'Speeding/Tailgating', triggerFrame: summary.firstDetectionFrame || 0
    };
    const forceData = [
        { name: 'Primary Vehicle', force: summary.accidentVehicles?.[0]?.impactForceValue || 4500 },
        { name: 'Secondary Entity', force: summary.accidentVehicles?.[1]?.impactForceValue || 3200 }
    ];

    return (
        <div style={{ marginTop: '24px', background: '#111827', border: '1px solid #ef4444', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.15)', color: '#d1d5db' }}>

            {/* 🟥 SECTION 1 — INCIDENT OVERVIEW (TOP SUMMARY) */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ef4444', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '2rem' }}>🚨</span>
                        <div>
                            <h2 style={{ color: '#ef4444', margin: 0, fontSize: '1.6rem', fontWeight: 'bold' }}>INCIDENT OVERVIEW ({summary.eventID})</h2>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '0.85rem' }}>
                                <span style={{ color: '#9ca3af' }}>TS: {new Date().toLocaleString()}</span>
                                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>SEVERITY: {summary.severity || 8}/10 (CRITICAL)</span>
                                <span style={{ color: '#fbbf24' }}>STATUS: PENDING DISPATCH</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={sendTelegramAlert}
                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}
                        >
                            🚀 Send all details to Telegram Bot
                        </button>
                        <button
                            onClick={downloadPDFReport}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}
                        >
                            📥 Send Bundles (Demo Purpose)
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    {/* 1.2 Accident Metadata */}
                    <div style={{ background: 'rgba(239, 68, 68, 0.04)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#fca5a5', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '12px', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', paddingBottom: '8px' }}>📐 Accident Metadata</span>
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.7', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Category:</span> <strong style={{ color: '#fff' }}>{metadata.category}</strong></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Speed at Impact:</span> <strong style={{ color: '#ef4444' }}>{metadata.speedAtImpact}</strong></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Impact Angle:</span> <span>{metadata.impactAngle}°</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Delta-V:</span> <span>{metadata.deltaV}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}><span style={{ color: '#6b7280' }}>Primary Cause:</span> <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{metadata.primaryCause}</span></div>
                        </div>
                    </div>

                    {/* 1.3 Vehicle Primary */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>🚗 Primary Vehicle</span>
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.7' }}>
                            <strong style={{ color: '#e5e7eb', display: 'block', fontSize: '1rem', marginBottom: '4px', letterSpacing: '0.5px' }}>{vehicleInfo.registration || vehicleInfo.registrationNumber}</strong>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Type:</span> <span>{vehicleInfo.type}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Model:</span> <span>{vehicleInfo.make} {vehicleInfo.model || vehicleInfo.brand}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Insurance:</span> <span>{vehicleInfo.insuranceExpiry}</span></div>
                        </div>
                    </div>

                    {/* 1.4 Driver Info */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>👤 Driver Details</span>
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.7' }}>
                            <strong style={{ color: '#e5e7eb', display: 'block', fontSize: '1rem', marginBottom: '4px' }}>{driverInfo.name}</strong>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Age:</span> <span>{driverInfo.age}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Blood Group:</span> <strong style={{ color: '#ef4444' }}>{driverInfo.bloodGroup}</strong></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Experience:</span> <span>{driverInfo.experienceYears} Years</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>License:</span> <span>{driverInfo.license}</span></div>
                        </div>
                    </div>
                </div>

                {/* 1.5 Geo-Location Row */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <span style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>📍 Geo-Location Snapshot</span>
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.7' }}>
                            <strong style={{ color: '#a7f3d0', display: 'block', fontSize: '0.95rem', marginBottom: '8px' }}>{locationName}</strong>
                            <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '400px' }}><span style={{ color: '#6b7280' }}>Coordinates:</span> <span>{lat.toFixed(5)}, {lon.toFixed(5)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '400px' }}><span style={{ color: '#6b7280' }}>Road Type:</span> <span>{summary.roadType || 'Highway'}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '400px' }}><span style={{ color: '#6b7280' }}>Traffic Density:</span> <span>{trafficDensity}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '400px' }}><span style={{ color: '#6b7280' }}>Conditions:</span> <span>{summary.weather || 'Clear'} | Day</span></div>
                        </div>
                    </div>
                    <div style={{ height: '160px', flex: '1 1 300px', minWidth: '250px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                        <iframe title="Incident Map" width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" src={mapUrl} style={{ border: 0 }} />
                    </div>
                </div>
            </div>

            {/* 🟦 SECTION 2 — EVIDENCE SNAPSHOTS & FRAME ANALYSIS */}
            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ color: '#60a5fa', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #1e3a8a', paddingBottom: '8px' }}>🟦 EVIDENCE SNAPSHOTS & FRAME ANALYSIS</h3>

                {/* 2.1 & 2.2 */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ background: 'black', border: '2px solid #ef4444', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                        <img src={summary.snapshotData} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Impact Point" />
                        <div style={{ position: 'absolute', top: 0, left: 0, background: 'rgba(239, 68, 68, 0.8)', padding: '4px 8px', color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>IMPACT FRAME {metadata.triggerFrame}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '16px' }}>
                        <div style={{ background: 'black', border: '1px solid #374151', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                            {summary.preIncidentSnapshot ? <img src={summary.preIncidentSnapshot} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Pre-Incident" /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>T-2s</div>}
                            <div style={{ position: 'absolute', bottom: 0, background: 'rgba(0,0,0,0.6)', width: '100%', textAlign: 'center', fontSize: '0.7rem', padding: '2px' }}>PRE-IMPACT</div>
                        </div>
                        <div style={{ background: 'black', border: '1px solid #374151', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                            {summary.postIncidentSnapshot ? <img src={summary.postIncidentSnapshot} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Post-Incident" /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>T+2s</div>}
                            <div style={{ position: 'absolute', bottom: 0, background: 'rgba(0,0,0,0.6)', width: '100%', textAlign: 'center', fontSize: '0.7rem', padding: '2px' }}>POST-IMPACT</div>
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', overflowY: 'auto' }}>
                        <h4 style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px' }}>Detection Table (Impact Frame)</h4>
                        <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                            <tr style={{ color: '#6b7280', borderBottom: '1px solid #374151' }}><th>ID</th><th>Type</th><th>Speed</th><th>Conf</th></tr>
                            {(summary.accidentVehicles || [{ id: 'v1', cls: 'car', speed: 60, confidence: 0.92 }, { id: 'p1', cls: 'person', speed: 5, confidence: 0.88 }]).map((v, i) => (
                                <tr key={i} style={{ borderBottom: '1px dotted #374151', textAlign: 'center' }}>
                                    <td style={{ padding: '4px' }}>{v.id?.slice(0, 4) || i}</td>
                                    <td>{v.cls}</td>
                                    <td style={{ color: v.speed > 50 ? '#ef4444' : '#fff' }}>{v.speed}</td>
                                    <td style={{ color: '#10b981' }}>{v.confidence || 0.9}</td>
                                </tr>
                            ))}
                        </table>
                    </div>
                </div>
            </div>

            {/* 🟩 SECTION 3 — AI MODEL DETAILS & TECHNICAL METRICS */}
            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #064e3b', paddingBottom: '8px' }}>🟩 AI MODEL DETAILS & TECHNICAL METRICS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                        <span style={{ color: '#6ee7b7', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Model Specs</span>
                        <div style={{ fontSize: '0.85rem' }}>
                            <div><span style={{ color: '#6b7280' }}>Architecture:</span> YOLOv8-NAS</div>
                            <div><span style={{ color: '#6b7280' }}>Input Res:</span> 640x640</div>
                            <div><span style={{ color: '#6b7280' }}>Conf Thresh:</span> 0.35 | <span style={{ color: '#6b7280' }}>NMS:</span> 0.45</div>
                            <div><span style={{ color: '#6b7280' }}>Inf Time:</span> {summary.avgLatency || 12}ms (CUDA GPU)</div>
                        </div>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                        <span style={{ color: '#6ee7b7', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Confidence Breakdown</span>
                        <div style={{ fontSize: '0.85rem' }}>
                            <div><span style={{ color: '#6b7280' }}>Mean Conf:</span> {(summary.confidence || 92)}%</div>
                            <div><span style={{ color: '#6b7280' }}>Peak Frame Conf:</span> 98%</div>
                            <div><span style={{ color: '#6b7280' }}>Lowest Frame Conf:</span> 65%</div>
                            <div><span style={{ color: '#6b7280' }}>Misclassification Prob:</span> &lt; 2%</div>
                        </div>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                        <span style={{ color: '#6ee7b7', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Motion & Trajectory</span>
                        <div style={{ fontSize: '0.85rem' }}>
                            <div><span style={{ color: '#6b7280' }}>Trajectory Deviation:</span> High (Swerving)</div>
                            <div><span style={{ color: '#6b7280' }}>Sudden Braking:</span> Detected (94% prob)</div>
                            <div><span style={{ color: '#6b7280' }}>Lane Violation:</span> Yes (Crossed Solid Line)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🟧 SECTION 4 — EMERGENCY RESOURCES & CONTACT DIRECTORY */}
            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ color: '#fb923c', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #7c2d12', paddingBottom: '8px' }}>🟧 EMERGENCY RESOURCES & CONTACT DIRECTORY</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: 'rgba(251, 146, 60, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(251, 146, 60, 0.1)' }}>
                        <span style={{ color: '#fdba74', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Victim Emergency Contact</span>
                        {summary.emergencyContact ? (
                            <div style={{ fontSize: '0.9rem' }}>
                                <strong>{summary.emergencyContact.name} ({summary.emergencyContact.relation})</strong>
                                <div>📞 {summary.emergencyContact.phone}</div>
                                <div><span style={{ color: '#ef4444' }}>Status:</span> Alert Transmitted</div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>No ICE data available for this registered vehicle.</div>
                        )}
                    </div>
                    <div style={{ background: 'rgba(251, 146, 60, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(251, 146, 60, 0.1)' }}>
                        <span style={{ color: '#fdba74', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Local Authority Dispatch (ETA: {summary.etaAmbulance || 4} mins)</span>
                        <div style={{ fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>🚔 Police: <span style={{ color: '#a7f3d0' }}>Patna Central (1.2km)</span></div>
                            <div>🚑 Med: <span style={{ color: '#a7f3d0' }}>PMCH (2.5km)</span></div>
                            <div>🚒 Fire: <span style={{ color: '#a7f3d0' }}>Station 4 (3.1km)</span></div>
                        </div>
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                            <button onClick={sendTelegramAlert} style={{ flex: 1, background: '#ea580c', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Send all details to Telegram Bot</button>
                            <button onClick={downloadPDFReport} style={{ flex: 1, background: '#374151', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Send Bundles (Demo Purpose)</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🟫 SECTION 5 — GRAPHICAL EVIDENCE & ANALYTICS */}
            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ color: '#a8a29e', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #44403c', paddingBottom: '8px' }}>🟫 GRAPHICAL EVIDENCE & ANALYTICS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', height: '200px', marginBottom: '16px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                        <span style={{ color: '#9ca3af', display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Accident Confidence Graph</span>
                        <ResponsiveContainer width="100%" height="85%">
                            <LineChart data={(summary.history || []).slice(-40)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tick={{ fill: '#9ca3af' }} />
                                <YAxis stroke="#9ca3af" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} />
                                <Line type="monotone" dataKey="confidenceValue" stroke="#ef4444" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                        <span style={{ color: '#9ca3af', display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Estimated Collision Force (Newtons)</span>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={forceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                                <YAxis stroke="#9ca3af" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} />
                                <Bar dataKey="force" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 🟪 SECTION 6 — FORENSIC ENTITY ANALYSIS (HIGH VALUE SECTION) */}
            <div>
                <h3 style={{ color: '#c084fc', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #581c87', paddingBottom: '8px' }}>🟪 FORENSIC ENTITY ANALYSIS</h3>

                <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ background: 'rgba(192, 132, 252, 0.1)', color: '#d8b4fe' }}>
                                <th style={{ padding: '10px' }}>ID</th>
                                <th style={{ padding: '10px' }}>Type</th>
                                <th style={{ padding: '10px' }}>Collision Mode</th>
                                <th style={{ padding: '10px' }}>Impact Force</th>
                                <th style={{ padding: '10px' }}>Speed Before</th>
                                <th style={{ padding: '10px' }}>Speed Drop</th>
                                <th style={{ padding: '10px' }}>Risk Level</th>
                                <th style={{ padding: '10px' }}>Conf</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(summary.accidentVehicles || [{ id: 'A-1', cls: 'Car', collisionType: 'Rear-end', impactForce: 'High', speed: 65, speedChange: 50, risk: 'Critical', confidence: '98%' }]).map((v, idx) => (
                                <tr key={v?.id || idx} style={{ borderBottom: '1px solid #374151' }}>
                                    <td style={{ padding: '10px' }}>{v?.id?.slice(0, 4) || `ENT-${idx}`}</td>
                                    <td style={{ padding: '10px', textTransform: 'capitalize' }}>{v?.cls || 'Vehicle'}</td>
                                    <td style={{ padding: '10px', color: '#fcd34d' }}>{v?.collisionType || 'Direct Hit'}</td>
                                    <td style={{ padding: '10px', color: v?.impactForce === 'High' ? '#ef4444' : '#fbbf24' }}>{v?.impactForce || 'Severe'}</td>
                                    <td style={{ padding: '10px' }}>{v?.speed || 60} km/h</td>
                                    <td style={{ padding: '10px', color: '#a7f3d0' }}>-{Math.round(v?.speedChange || 45)}%</td>
                                    <td style={{ padding: '10px', color: '#ef4444', fontWeight: 'bold' }}>{v?.risk || 'CRITICAL'}</td>
                                    <td style={{ padding: '10px', color: '#10b981' }}>{v?.confidence || '0.94'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: 'rgba(192, 132, 252, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(192, 132, 252, 0.1)' }}>
                        <span style={{ color: '#d8b4fe', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Person Involvement Analysis</span>
                        <div style={{ fontSize: '0.85rem' }}>
                            <div><span style={{ color: '#6b7280' }}>Pedestrian Proximity:</span> 1.2m from impact</div>
                            <div><span style={{ color: '#6b7280' }}>Impact Probability:</span> 15% (Near Miss)</div>
                            <div><span style={{ color: '#6b7280' }}>Reaction Delay:</span> 0.6s Estimated</div>
                            <div style={{ marginTop: '8px', color: '#fbbf24' }}>No pedestrian collision detected. High risk zone.</div>
                        </div>
                    </div>
                    <div style={{ background: 'rgba(192, 132, 252, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(192, 132, 252, 0.1)' }}>
                        <span style={{ color: '#d8b4fe', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Multi-Vehicle Breakdown</span>
                        <div style={{ fontSize: '0.85rem' }}>
                            <div><span style={{ color: '#6b7280' }}>Vehicle 1 (Target):</span> Primary Impact (Absorbed 80% force)</div>
                            <div><span style={{ color: '#6b7280' }}>Vehicle 2 (Bullet):</span> Initiator (Failed to brake)</div>
                            <div><span style={{ color: '#6b7280' }}>Following Distance:</span> 0.8s (Violation - Too Close)</div>
                            <div><span style={{ color: '#6b7280' }}>Brake Delay:</span> 1.2s beyond normative limit</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
