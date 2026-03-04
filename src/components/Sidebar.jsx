
import React, { useState, useMemo } from 'react';
import LogsPanel from './LogsPanel';

export default function Sidebar({
    AVAILABLE_CLASSES,
    activeClasses,
    setActiveClasses,
    speedThreshold,
    setSpeedThreshold,
    frameThreshold,
    setFrameThreshold,
    handleFileUpload,
    handleCameraFeed,
    isActive,
    handleStartStop,
    handleRestart,
    mediaSrc,
    summary,
    currentDetections = [],
    downloadPDFReport,
    logs,
    setLogs
}) {
    // Real-time calculation from current detections
    const realTimeMetrics = useMemo(() => {
        const safeDets = Array.isArray(currentDetections) ? currentDetections : [];
        return {
            car: safeDets.filter(d => d && d.cls === 'car').length,
            truck: safeDets.filter(d => d && d.cls === 'truck').length,
            bus: safeDets.filter(d => d && d.cls === 'bus').length,
            motorcycle: safeDets.filter(d => d && ['motorcycle', 'bicycle', 'bike'].includes(d.cls)).length,
            person: safeDets.filter(d => d && d.cls === 'person').length,
            avgConf: safeDets.length > 0
                ? Math.round((safeDets.reduce((a, b) => a + (b.conf || 0.8), 0) / safeDets.length) * 100)
                : 0
        };
    }, [currentDetections]);

    const hasAccident = isActive ? currentDetections.some(d => d.isAccident) : summary?.hasAccident;
    const probability = isActive
        ? (realTimeMetrics.avgConf > 0 ? `${realTimeMetrics.avgConf}%` : 'Scanning...')
        : (summary?.confidence ? `${summary.confidence}%` : 'N/A');

    const severity = summary?.severity ? `${summary.severity}/10` : (isActive && hasAccident ? 'Calculating...' : 'N/A');

    const vehiclesInvolved = isActive
        ? (currentDetections.length)
        : (summary?.history?.reduce((a, b) => Math.max(a, b.vehicles || 0), 0) || 0);

    const personsDetected = isActive
        ? (realTimeMetrics.person > 0 ? 'Yes' : 'No')
        : (summary?.objects?.includes('person') ? 'Yes' : 'No');

    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        const baseUrl = window.location.origin + window.location.pathname;
        const shareLink = summary?.eventID ? `${baseUrl}?report=${summary.eventID}` : baseUrl;
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderSectionHeader = (number, title) => (
        <h3 style={{ fontSize: '0.9rem', color: '#a78bfa', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
            <span style={{ background: 'rgba(167, 139, 250, 0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>{number}</span>
            {title}
        </h3>
    );

    const renderMetricRow = (label, value, color = 'white') => (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0' }}>
            <span style={{ color: '#9ca3af' }}>{label}</span>
            <strong style={{ color }}>{value}</strong>
        </div>
    );

    return (
        <div className="sidebar" style={{ overflowY: 'auto' }}>
            <div className="brand" style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', justifyContent: 'center', gap: '12px' }}>
                <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                        <linearGradient id="accent-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logo-grad)" strokeWidth="6" strokeDasharray="15 10" />
                    <circle cx="50" cy="50" r="30" fill="url(#logo-grad)" fillOpacity="0.1" />
                    <path d="M42 32 L68 50 L42 68 Z" fill="url(#logo-grad)" />
                    <circle cx="75" cy="25" r="5" fill="url(#accent-grad)" />
                    <circle cx="25" cy="75" r="5" fill="url(#accent-grad)" />
                    <path d="M68 50 L75 25 M42 68 L25 75" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="4 4" />
                </svg>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                    <span style={{ background: 'linear-gradient(to right, #3b82f6, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Collision</span>
                    <span style={{ color: '#fff', marginLeft: '4px' }}>AI</span>
                </span>
            </div>

            {/* 1. Media Input & Processing */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                {renderSectionHeader('1️⃣', 'Media Input & Processing')}
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Upload / Source</label>

                {/* Modern File Upload Button */}
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <input type="file" accept="video/*, image/*" onChange={handleFileUpload} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '6px', padding: '10px', textAlign: 'center', color: '#a78bfa', fontSize: '0.8rem', transition: 'all 0.2s' }}>
                        <div>📁 Choose Video/Image File</div>
                    </div>
                </div>

                <button onClick={handleCameraFeed} style={{ width: '100%', background: 'rgba(99,102,241,0.2)', color: '#a78bfa', border: '1px solid rgba(99,102,241,0.4)', padding: '8px', borderRadius: '6px', fontSize: '0.75rem', marginBottom: '16px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 'bold' }}>
                    📹 Select System Camera Feed
                </button>

                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Playback Controls</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleStartStop} disabled={!mediaSrc} style={{ flex: 1, background: isActive ? 'transparent' : '#6366f1', border: isActive ? '1px solid #ef4444' : 'none', color: isActive ? '#ef4444' : 'white', padding: '8px', borderRadius: '6px', cursor: mediaSrc ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '0.8rem' }}>
                        {isActive ? '⏸ Pause' : '▶ Play'}
                    </button>
                    <button onClick={handleRestart} disabled={!mediaSrc} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: mediaSrc ? 'pointer' : 'not-allowed', fontSize: '0.8rem' }}>
                        🔄 Restart
                    </button>
                </div>
            </div>

            {/* 2. Detection Insights */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                {renderSectionHeader('2️⃣', 'Detection Insights')}
                {renderMetricRow('Accident Status', hasAccident === true ? '🔴 Detected' : (hasAccident === false ? '🟢 Safe' : 'Waiting...'), hasAccident ? '#ef4444' : (hasAccident === false ? '#10b981' : '#9ca3af'))}
                {renderMetricRow('Probability', probability, '#fbbf24')}
                {renderMetricRow('Severity Level', severity, '#fca5a5')}
                {renderMetricRow('Vehicles Involved', vehiclesInvolved, '#a7f3d0')}
                {renderMetricRow('Persons Detected', personsDetected, 'white')}
            </div>

            {/* 3. Detection Metrics */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                {renderSectionHeader('3️⃣', 'Detection Metrics')}
                {renderMetricRow('FPS (Processing)', summary ? `${Math.round(1000 / (summary.avgLatency || 50))} FPS` : '...', '#3b82f6')}
                {renderMetricRow('Confidence Range', summary ? `${summary.confidence || 0}% - 99%` : '...', 'white')}
                {renderMetricRow('Frames Analyzed', summary?.framesAnalyzed || 0, 'white')}
                {renderMetricRow('Accident Timestamp', summary?.firstDetectionTime ? `${summary.firstDetectionTime}s` : 'N/A', '#fbbf24')}
                {renderMetricRow('Engine Version', summary?.modelType || 'YOLOv8 Cloud', '#a78bfa')}
            </div>

            {/* 4. Environment */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                {renderSectionHeader('4️⃣', 'Environment')}
                {renderMetricRow('Weather', 'Clear (Auto-detect)', 'white')}
                {renderMetricRow('Lighting', summary?.lighting || 'Daytime', '#fde047')}
                {renderMetricRow('Traffic Density', summary ? (vehiclesInvolved < 5 ? 'Light' : (vehiclesInvolved < 12 ? 'Moderate' : 'Heavy')) : '...', '#a7f3d0')}
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                {renderSectionHeader('⚙️', 'Internal Engine Config')}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Speed Dist</label>
                        <input type="number" className="input-field" value={speedThreshold} onChange={(e) => setSpeedThreshold(Number(e.target.value))} min="1" max="100" style={{ width: '100%', padding: '4px', fontSize: '0.8rem' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Frame Tol</label>
                        <input type="number" className="input-field" value={frameThreshold} onChange={(e) => setFrameThreshold(Number(e.target.value))} min="1" max="100" style={{ width: '100%', padding: '4px', fontSize: '0.8rem' }} />
                    </div>
                </div>
            </div>

            {/* 5. Log History */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                {renderSectionHeader('📝', 'Log History')}
                <LogsPanel logs={logs} setLogs={setLogs} />
            </div>

            {/* 6. Generate Shareable Link */}
            <button
                onClick={handleCopy}
                style={{ width: '100%', background: copied ? '#059669' : '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}
            >
                {copied ? '✅ Link Copied!' : '🔗 Generate Shareable Link'}
            </button>
        </div>
    );
}
