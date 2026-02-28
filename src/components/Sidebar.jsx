import React from 'react';

export default function Sidebar({
    AVAILABLE_CLASSES,
    activeClasses,
    setActiveClasses,
    speedThreshold,
    setSpeedThreshold,
    frameThreshold,
    setFrameThreshold,
    handleFileUpload,
    isActive,
    handleStartStop,
    mediaSrc,
    summary,
    downloadPDFReport
}) {
    return (
        <div className="sidebar">
            <div className="brand">
                <div className="brand-icon">
                    <i className="ri-shield-flash-line">⚠</i>
                </div>
                <h1>CollisionAI</h1>
            </div>

            <div className="control-group">
                <label>1. Upload Video or Photo</label>
                <input
                    type="file"
                    accept="video/*, image/*"
                    className="input-field"
                    onChange={handleFileUpload}
                    style={{ padding: '8px 12px' }}
                />
            </div>

            <hr style={{ borderColor: 'var(--border-color)', margin: '12px 0' }} />

            <div className="control-group">
                <label>Speed Threshold (px/frame)</label>
                <input
                    type="number"
                    className="input-field"
                    value={speedThreshold}
                    onChange={(e) => setSpeedThreshold(Number(e.target.value))}
                    min="1" max="100"
                />
            </div>

            <div className="control-group">
                <label>Frame Threshold (Accident limit)</label>
                <input
                    type="number"
                    className="input-field"
                    value={frameThreshold}
                    onChange={(e) => setFrameThreshold(Number(e.target.value))}
                    min="1" max="100"
                />
            </div>

            <hr style={{ borderColor: 'var(--border-color)', margin: '12px 0' }} />

            <div className="control-group">
                <label>Target Classes to Detect</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                    {AVAILABLE_CLASSES.map(cls => (
                        <label key={cls} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.75rem', color: 'white' }}>
                            <input
                                type="checkbox"
                                checked={activeClasses.includes(cls)}
                                onChange={() => {
                                    setActiveClasses(prev =>
                                        prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
                                    );
                                }}
                            />
                            {cls.toUpperCase()}
                        </label>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
                <button
                    className={`btn ${isActive ? 'btn-danger' : ''}`}
                    style={{ width: '100%' }}
                    onClick={handleStartStop}
                    disabled={!mediaSrc}
                >
                    {isActive ? 'Pause Video & Engine' : 'Play Video & Engine'}
                </button>

                {summary && (
                    <button
                        className="btn"
                        style={{
                            width: '100%',
                            marginTop: '12px',
                            background: 'transparent',
                            border: `1px solid ${summary.hasAccident ? 'var(--danger-color)' : '#10b981'}`,
                            color: summary.hasAccident ? 'var(--danger-color)' : '#10b981'
                        }}
                        onClick={downloadPDFReport}
                    >
                        📄 Download Report (PDF)
                    </button>
                )}
            </div>
        </div>
    );
}
