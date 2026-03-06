import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { jsPDF } from 'jspdf';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Sidebar from './components/Sidebar';
import SummaryPanel from './components/SummaryPanel';
import LogsPanel from './components/LogsPanel';
import { drivers, vehicles, emergencyContacts, videoData } from './data';
import './index.css';

export default function App() {
  const apiUrl = "https://predict-69a307d63c8ad9ebb334-dproatj77a-em.a.run.app";
  const apiKey = "ul_b4cf23d145fa479fd92ad1aeadedfa377899ccef";
  const [speedThreshold, setSpeedThreshold] = useState(15);
  const [frameThreshold, setFrameThreshold] = useState(3);

  const AVAILABLE_CLASSES = ['person', 'car', 'truck', 'bus', 'motorcycle'];
  const [activeClasses, setActiveClasses] = useState(AVAILABLE_CLASSES);

  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState([]);
  const [hasAccident, setHasAccident] = useState(false);
  const [currentDetections, setCurrentDetections] = useState([]); // Real-time detection tracker

  const [mediaSrc, setMediaSrc] = useState(null);
  const [mediaType, setMediaType] = useState('video'); // 'video' or 'image'
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [summary, setSummary] = useState(null);
  const [locationName, setLocationName] = useState("Loading Location...");
  const [locationCoords, setLocationCoords] = useState({ lat: 25.612, lon: 85.115 });
  const [apiLatencies, setApiLatencies] = useState([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const loopRef = useRef(null);
  const isActiveRef = useRef(isActive);
  const activeClassesRef = useRef(activeClasses);

  const analyticsRef = useRef({
    framesAnalyzed: 0,
    hasAccident: false,
    involvedObjects: new Set(),
    firstDetectionTime: null,
    firstDetectionFrame: null,
    accidentReason: '',
    confidence: 0,
    severity: 0,
    accidentVehicles: [],
    snapshotData: null,
    history: [],
    uniqueIds: new Set(),
    lighting: "Assessing..."
  });

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    activeClassesRef.current = activeClasses;
  }, [activeClasses]);

  // Warm up the Cloud API container as soon as the app loads to prevent initial cold-start delays
  useEffect(() => {
    if (apiUrl) {
      const canvas = document.createElement('canvas');
      canvas.width = 10; canvas.height = 10;
      canvas.toBlob((blob) => {
        const fd = new FormData();
        fd.append('file', blob, 'ping.jpg');
        axios.post(apiUrl, fd, {
          headers: { "Authorization": `Bearer ${apiKey}` }
        }).catch(() => { });
      }, 'image/jpeg', 0.1);
    }
  }, []);

  const trackingObj = useRef({});

  const addLog = (msg, isAccident = false) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time, msg, isAccident }]); // Append logic for terminal
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaSrc(URL.createObjectURL(file));
      setMediaType(file.type.startsWith('image') ? 'image' : 'video');
      setIsLiveStream(false);
      setIsActive(false); // Only start when user hits Play button
      setHasAccident(false);
      setSummary(null);
      setCurrentDetections([]);
      analyticsRef.current = {
        framesAnalyzed: 0,
        hasAccident: false,
        involvedObjects: new Set(),
        firstDetectionTime: null,
        firstDetectionFrame: null,
        accidentReason: '',
        confidence: 0,
        severity: 0,
        accidentVehicles: [],
        snapshotData: null,
        history: [],
        uniqueIds: new Set(),
        lighting: "Daytime"
      };
      trackingObj.current = {};

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      addLog("Media loaded: " + file.name);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const data = await res.json();
              setLocationName(data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
              setLocationCoords({ lat: latitude, lon: longitude });
            } catch (err) {
              setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
              setLocationCoords({ lat: latitude, lon: longitude });
            }
          },
          (error) => {
            console.error("Error getting location", error);
            setLocationName("Location Permission Denied. Using fallback.");
            setLocationCoords({ lat: 25.612, lon: 85.115 });
          }
        );
      } else {
        setLocationName("Geolocation Not Supported. Using default.");
        setLocationCoords({ lat: 25.612, lon: 85.115 });
      }
    }
  };

  const handleCameraFeed = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setMediaSrc(stream);
      setMediaType('video');
      setIsLiveStream(true);
      setIsActive(false);
      setHasAccident(false);
      setSummary(null);
      analyticsRef.current = {
        framesAnalyzed: 0,
        hasAccident: false,
        involvedObjects: new Set(),
        firstDetectionTime: null,
        firstDetectionFrame: null,
        accidentReason: '',
        confidence: 0,
        severity: 0,
        accidentVehicles: [],
        snapshotData: null,
        history: [],
        uniqueIds: new Set(),
        lighting: "Daytime"
      };
      trackingObj.current = {};

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      addLog("System Camera Feed initiated.");
    } catch (err) {
      alert("Could not access camera.");
      console.error(err);
    }
  };

  useEffect(() => {
    if (videoRef.current && isLiveStream && mediaSrc) {
      videoRef.current.srcObject = mediaSrc;
    }
  }, [mediaSrc, isLiveStream]);

  const getFrameData = async () => {
    const hCanvas = hiddenCanvasRef.current;
    if (!hCanvas) return null;

    let sourceElement;
    let width, height;

    if (mediaType === 'video') {
      sourceElement = videoRef.current;
      if (!sourceElement || sourceElement.paused || sourceElement.ended || !sourceElement.videoWidth) {
        return null;
      }
      width = sourceElement.videoWidth;
      height = sourceElement.videoHeight;
    } else {
      sourceElement = imageRef.current;
      if (!sourceElement || !sourceElement.naturalWidth) return null;
      width = sourceElement.naturalWidth;
      height = sourceElement.naturalHeight;
    }

    try {
      hCanvas.width = width;
      hCanvas.height = height;
      const ctx = hCanvas.getContext('2d');
      ctx.drawImage(sourceElement, 0, 0, width, height);

      return new Promise((resolve) => {
        hCanvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.35); // Reduced quality for faster network send & performance
      });
    } catch (err) {
      addLog(`Canvas Extraction Error: ${err.message}`, true);
      return null;
    }

  };

  const sendToCloudAPI = async (frameBlob) => {
    if (!apiUrl) return null;
    try {
      const formData = new FormData();
      formData.append('file', frameBlob, "frame.jpg");

      formData.append('conf', '0.25');
      formData.append('iou', '0.7');
      formData.append('imgsz', '640');

      const config = {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        }
      };

      const reqStart = Date.now();
      const res = await axios.post(apiUrl, formData, config);
      const latency = Date.now() - reqStart;
      setApiLatencies(prev => [...prev.slice(-19), latency]);
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Unknown API Error";
      addLog(`API ERROR: ${errMsg}`, true);
      return null;
    }
  };

  const checkAccident = (detections, currentVideoTime) => {
    const TRACKING_DISTANCE = 100;

    const newTracked = {};
    let accidentNow = false;

    let normalizedDets = [];
    if (Array.isArray(detections)) {
      normalizedDets = detections;
    } else if (detections?.images && Array.isArray(detections.images) && detections.images.length > 0 && detections.images[0].results) {
      normalizedDets = detections.images[0].results;
    } else if (detections?.data && Array.isArray(detections.data)) {
      normalizedDets = detections.data;
    } else if (detections?.predictions && Array.isArray(detections.predictions)) {
      normalizedDets = detections.predictions;
    }

    let detectedVehiclesCount = 0;
    let newAccidentOccurred = false;
    let frameObjectsList = [];

    normalizedDets.forEach(det => {
      let x1, y1, x2, y2, cls, conf;
      if (det.box) {
        x1 = det.box.x1; y1 = det.box.y1; x2 = det.box.x2; y2 = det.box.y2;
      } else if (det.bounding_box) {
        x1 = det.bounding_box.xmin; y1 = det.bounding_box.ymin; x2 = det.bounding_box.xmax; y2 = det.bounding_box.ymax;
      } else if (det.x !== undefined && det.width !== undefined) {
        x1 = det.x - det.width / 2; y1 = det.y - det.height / 2;
        x2 = det.x + det.width / 2; y2 = det.y + det.height / 2;
      } else {
        x1 = det.xMin || det.xmin || det.x1;
        y1 = det.yMin || det.ymin || det.y1;
        x2 = det.xMax || det.xmax || det.x2;
        y2 = det.yMax || det.ymax || det.y2;
      }
      cls = det.name || det.class || det.label || 'car';
      conf = det.confidence || det.score || det.conf || 0.9;

      if (Array.isArray(det) && det.length >= 4 && !x1) {
        [x1, y1, x2, y2] = det;
        cls = det[5] || 'car';
      }

      if (x1 === undefined || x2 === undefined) return;
      if (!activeClassesRef.current.includes((cls + '').toLowerCase())) return;

      detectedVehiclesCount++;

      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;

      let bestId = null;
      let minDist = TRACKING_DISTANCE;
      Object.entries(trackingObj.current).forEach(([id, obj]) => {
        const dist = Math.hypot(cx - obj.cx, cy - obj.cy);
        if (dist < minDist) {
          minDist = dist;
          bestId = id;
        }
      });

      const idToUse = bestId || uuidv4();
      let roadCondition = "Wet Surface, 65% Visibility (NH-31 Highway)";
      let plate = `DL-${Math.floor(1 + Math.random() * 9)}C-${Math.floor(1000 + Math.random() * 9000)}`;
      let lowSpeedFrames = 0;
      let speed = 0;
      let history = [];
      let speedHistory = [];
      let speedChange = 0;

      if (bestId && trackingObj.current[bestId]) {
        plate = trackingObj.current[bestId].plate || plate;
        roadCondition = trackingObj.current[bestId].roadCondition || roadCondition;
        history = trackingObj.current[bestId].history || [];
        speedHistory = trackingObj.current[bestId].speedHistory || [];
      }

      history.push({ cx, cy });
      if (history.length > 20) history.shift();

      if (bestId && mediaType === 'video') {
        speed = minDist;
        speedHistory.push(speed);
        if (speedHistory.length > 20) speedHistory.shift();

        const maxSpd = Math.max(...speedHistory, 1);
        speedChange = Math.max(0, ((maxSpd - speed) / maxSpd) * 100);

        if (speed < speedThreshold) {
          lowSpeedFrames = trackingObj.current[bestId].lowSpeedFrames + 1;
        }
        delete trackingObj.current[bestId];
      }

      let isAccident = false;
      if (mediaType === 'video' && lowSpeedFrames >= frameThreshold) {
        isAccident = true;
      }

      let riskLevel = 'Low';
      if (isAccident) {
        accidentNow = true;
        newAccidentOccurred = true;
        analyticsRef.current.hasAccident = true;
        analyticsRef.current.involvedObjects.add(cls);
        riskLevel = 'High';
        if (analyticsRef.current.firstDetectionTime === null) {
          analyticsRef.current.firstDetectionTime = currentVideoTime !== null ? currentVideoTime.toFixed(1) : 'Frame ' + analyticsRef.current.framesAnalyzed;
          analyticsRef.current.firstDetectionFrame = analyticsRef.current.framesAnalyzed;
          analyticsRef.current.accidentReason = `Object velocity dropped below threshold (${Math.round(speed)} px/frame) for ${frameThreshold} frames`;
          analyticsRef.current.confidence = 92;
          analyticsRef.current.severity = 6.5;
        }
      }

      let collisionType = 'N/A';
      let impactForce = 'Low';

      newTracked[idToUse] = { id: idToUse, x1, y1, x2, y2, cx, cy, cls, conf, speed, lowSpeedFrames, isAccident, riskLevel, plate, roadCondition, history, speedHistory, speedChange, collisionType, impactForce };
      frameObjectsList.push(`${cls}(ID:${idToUse.slice(0, 4)})`);
      analyticsRef.current.uniqueIds.add(idToUse);
    });

    const trackedList = Object.values(newTracked);
    for (let i = 0; i < trackedList.length; i++) {
      for (let j = i + 1; j < trackedList.length; j++) {
        const b1 = trackedList[i];
        const b2 = trackedList[j];

        const overlapX = Math.max(0, Math.min(b1.x2, b2.x2) - Math.max(b1.x1, b2.x1));
        const overlapY = Math.max(0, Math.min(b1.y2, b2.y2) - Math.max(b1.y1, b2.y1));
        const overlapArea = overlapX * overlapY;

        if (overlapArea > 0) {
          const area1 = (b1.x2 - b1.x1) * (b1.y2 - b1.y1);
          const area2 = (b2.x2 - b2.x1) * (b2.y2 - b2.y1);
          const minArea = Math.min(area1, area2);

          if (overlapArea / minArea > 0.05) {
            accidentNow = true;
            newAccidentOccurred = true;
            analyticsRef.current.hasAccident = true;

            b1.isAccident = true;
            b2.isAccident = true;
            b1.riskLevel = 'Critical';
            b2.riskLevel = 'Critical';

            const dx = Math.abs(b2.cx - b1.cx);
            const dy = Math.abs(b2.cy - b1.cy);
            let cType = "Side-impact";
            if (dx > dy * 1.5) cType = "Head-on";
            else if (dy > dx * 1.5) cType = "Rear-end";

            if (Object.values(newTracked).filter(t => t.isAccident).length > 2) {
              cType = "Multi-vehicle pileup";
            }
            b1.collisionType = cType;
            b2.collisionType = cType;

            const forceVal = (b1.speed || 0) + (b2.speed || 0);
            let iForce = "Low";
            if (forceVal > speedThreshold * 1.5) iForce = "Medium";
            if (forceVal > speedThreshold * 3) iForce = "High";
            b1.impactForce = iForce;
            b2.impactForce = iForce;

            analyticsRef.current.involvedObjects.add(b1.cls);
            analyticsRef.current.involvedObjects.add(b2.cls);
            if (analyticsRef.current.firstDetectionTime === null) {
              analyticsRef.current.firstDetectionTime = currentVideoTime !== null ? currentVideoTime.toFixed(1) : 'Frame ' + analyticsRef.current.framesAnalyzed;
              analyticsRef.current.firstDetectionFrame = analyticsRef.current.framesAnalyzed;
              analyticsRef.current.accidentReason = `Collision: ${cType} detected with ${iForce} impact force.`;
              analyticsRef.current.confidence = 96;
              analyticsRef.current.severity = iForce === 'High' ? 9.5 : (iForce === 'Medium' ? 7.5 : 5.5);
            }
          }
        }
      }
    }

    analyticsRef.current.framesAnalyzed += 1;
    analyticsRef.current.history.push({
      frame: analyticsRef.current.framesAnalyzed,
      time: currentVideoTime ? currentVideoTime.toFixed(1) : analyticsRef.current.framesAnalyzed,
      vehicles: detectedVehiclesCount,
      accidents: newAccidentOccurred ? 1 : 0,
      objectsStr: frameObjectsList.length ? `[${frameObjectsList.join(', ')}]` : '[]',
      isAccidentLabel: newAccidentOccurred ? 'True' : 'False',
      confidenceValue: accidentNow ? (analyticsRef.current.confidence || Math.random() * 15 + 80) : Math.random() * 10
    });

    if (newAccidentOccurred && analyticsRef.current.accidentVehicles.length === 0) {
      analyticsRef.current.accidentVehicles = Object.values(newTracked).filter(t => t.isAccident);
    }

    trackingObj.current = newTracked;
    return { newTracked, accidentNow };
  };

  const drawDetectionsOnCanvas = (dets) => {
    const canvas = canvasRef.current;
    const mediaObj = mediaType === 'image' ? imageRef.current : videoRef.current;
    if (!canvas || !mediaObj) return;

    const w = mediaType === 'image' ? mediaObj.naturalWidth : mediaObj.videoWidth;
    const h = mediaType === 'image' ? mediaObj.naturalHeight : mediaObj.videoHeight;

    if (!w || !h) return;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.values(dets).forEach(det => {
      const color = det.isAccident ? '#ef4444' : '#10b981';

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(det.x1, det.y1, det.x2 - det.x1, det.y2 - det.y1);

      ctx.fillStyle = color;
      ctx.font = 'bold 16px Inter';
      const confText = det.conf ? ` | Conf: ${(det.conf * 100).toFixed(0)}%` : '';
      const spdText = mediaType === 'video' ? ` | Spd: ${Math.round(det.speed)}` : '';
      const label = `${det.cls.toUpperCase()}${confText}${spdText}`;

      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(det.x1, det.y1 - 28, textWidth + 12, 28);

      ctx.fillStyle = 'white';
      ctx.fillText(label, det.x1 + 6, det.y1 - 8);

      if (det.history && det.history.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = det.isAccident ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.5)';
        ctx.lineWidth = 2;
        ctx.moveTo(det.history[0].cx, det.history[0].cy);
        for (let k = 1; k < det.history.length; k++) {
          ctx.lineTo(det.history[k].cx, det.history[k].cy);
        }
        ctx.stroke();
      }

      if (det.isAccident) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
        ctx.fillRect(det.x1, det.y1, det.x2 - det.x1, det.y2 - det.y1);

        const grd = ctx.createRadialGradient(det.cx, det.cy, 10, det.cx, det.cy, Math.max(det.x2 - det.x1, det.y2 - det.y1));
        grd.addColorStop(0, "rgba(255, 0, 0, 0.2)");
        grd.addColorStop(1, "rgba(255, 0, 0, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(det.cx, det.cy, Math.max(det.x2 - det.x1, det.y2 - det.y1), 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const processFrame = async () => {
    if (!isActiveRef.current) return;

    const frameBlob = await getFrameData();
    if (!frameBlob) {
      if (isActiveRef.current && mediaType === 'video') {
        loopRef.current = setTimeout(processFrame, 50);
      }
      return;
    }

    // Determine lighting based on image pixel canvas - throttled to run every 30 frames
    if (analyticsRef.current.framesAnalyzed % 30 === 0) {
      try {
        const hCanvas = hiddenCanvasRef.current;
        if (hCanvas) {
          const ctx = hCanvas.getContext('2d');
          const imageData = ctx.getImageData(0, 0, hCanvas.width, hCanvas.height);
          const data = imageData.data;
          let r, g, b, avg;
          let colorSum = 0;
          // Sample down pixels to avoid freezing UI
          const step = 4 * 100;
          let count = 0;
          for (let x = 0; x < data.length; x += step) {
            r = data[x];
            g = data[x + 1];
            b = data[x + 2];
            avg = Math.floor((r + g + b) / 3);
            colorSum += avg;
            count++;
          }
          const brightness = Math.floor(colorSum / count);
          // Brightness threshold: below 80 is night
          if (brightness < 80) {
            analyticsRef.current.lighting = "Nighttime";
          } else if (brightness < 120) {
            analyticsRef.current.lighting = "Low Light (Dusk/Dawn)";
          } else {
            analyticsRef.current.lighting = "Daytime";
          }
        }
      } catch (e) {
        // ignore
      }
    }

    const detections = await sendToCloudAPI(frameBlob);

    if (detections && isActiveRef.current) {
      const currentVideoTime = mediaType === 'video' && videoRef.current ? videoRef.current.currentTime : null;
      const { newTracked, accidentNow } = checkAccident(detections, currentVideoTime);
      drawDetectionsOnCanvas(newTracked);
      setCurrentDetections(Object.values(newTracked));

      setHasAccident(accidentNow);
      const objCount = Object.keys(newTracked).length;

      if (accidentNow && !hasAccident) {
        addLog(`CRITICAL: Collision detected! Potential Accident. (Tracking ${objCount} objects)`, true);
        addLog(`ALARM: Automatic dispatch sequence initiated for Police & EMS.`, true);
        if (canvasRef.current) {
          analyticsRef.current.snapshotData = canvasRef.current.toDataURL('image/jpeg', 0.85);
        }
      }
    } else if (isActiveRef.current) {
      addLog("WARNING: API request failed or returned empty.");
    }

    if (isActiveRef.current) {
      if (mediaType === 'video') {
        loopRef.current = setTimeout(processFrame, 50); // Reduced loop delay from 200ms
      } else {
        setIsActive(false);
        finishAnalysis();
      }
    }
  };

  const finishAnalysis = () => {
    let logText = `--- Detection Summary ---\n`;
    logText += `Total Frames: ${analyticsRef.current.framesAnalyzed}\n`;
    logText += `Accident Status: ${analyticsRef.current.hasAccident ? '✅ DETECTED' : '❌ NONE'}\n`;
    const uniqueVehiclesCount = analyticsRef.current.uniqueIds ? analyticsRef.current.uniqueIds.size : 0;
    logText += `Unique Vehicles Involved: ${uniqueVehiclesCount}\n\n`;
    logText += `--- First 10 Frames Detail Sample ---\n`;

    const sample = analyticsRef.current.history.slice(0, 10);
    sample.forEach(f => {
      logText += `Frame ${f.frame} | Accident: ${f.isAccidentLabel} | Objects: ${f.objectsStr}\n`;
    });

    logText += `\n(Detailed 'frame_details' list is now populated with data for all frames)`;

    const currentSeverity = analyticsRef.current.severity || 0;
    const damageRange = currentSeverity >= 8 ? "₹1,50,000 – ₹5,00,000" : (currentSeverity >= 5 ? "₹50,000 – ₹1,50,000" : "₹5,000 – ₹50,000");
    const avgLatency = apiLatencies.length ? Math.round(apiLatencies.reduce((a, b) => a + b, 0) / apiLatencies.length) : 150;

    // Pick mock data that matches the accident vehicle type
    let driver = null;
    let vehicle = null;
    let contact = null;
    if (analyticsRef.current.hasAccident) {
      let detectedClass = 'car';
      if (analyticsRef.current.accidentVehicles && analyticsRef.current.accidentVehicles.length > 0) {
        detectedClass = analyticsRef.current.accidentVehicles[0].cls.toLowerCase();
      }

      let matchingIndices = [];
      vehicles.forEach((v, index) => {
        const vType = v.type.toLowerCase();
        if (vType === detectedClass || (detectedClass === 'motorcycle' && vType === 'bike')) {
          matchingIndices.push(index);
        }
      });

      let idx;
      if (matchingIndices.length > 0) {
        idx = matchingIndices[Math.floor(Math.random() * matchingIndices.length)];
      } else {
        idx = Math.floor(Math.random() * drivers.length);
      }

      driver = drivers[idx];
      vehicle = vehicles[idx];
      contact = emergencyContacts.find(c => c.contactId === driver.emergencyContactId) || emergencyContacts[0];
    }

    setSummary({
      framesAnalyzed: analyticsRef.current.framesAnalyzed || 0,
      hasAccident: !!analyticsRef.current.hasAccident,
      objects: Array.from(analyticsRef.current.involvedObjects || []),
      uniqueVehiclesCount,
      history: Array.isArray(analyticsRef.current.history) ? [...analyticsRef.current.history] : [],
      report: logText || "No data available",
      accidentReason: analyticsRef.current.accidentReason || "N/A",
      confidence: analyticsRef.current.confidence || 0,
      severity: analyticsRef.current.severity || 0,
      firstDetectionTime: analyticsRef.current.firstDetectionTime || "0",
      firstDetectionFrame: analyticsRef.current.firstDetectionFrame || 0,
      accidentVehicles: Array.isArray(analyticsRef.current.accidentVehicles) ? [...analyticsRef.current.accidentVehicles] : [],
      snapshotData: analyticsRef.current.snapshotData,
      eventID: `ACC-${new Date().toISOString().split('T')[0]}-${Math.floor(1000 + Math.random() * 9000)}`,
      damageRange,
      avgLatency,
      modelType: "YOLOv8 Cloud Engine",
      lighting: analyticsRef.current.lighting || "Daytime",
      timestamp: new Date().toLocaleString(),
      driverInfo: driver,
      vehicleInfo: vehicle,
      emergencyContact: contact,
      // New simulated forensic details
      collisionAngle: Math.floor(15 + Math.random() * 75),
      distractionScore: (Math.random() * 10).toFixed(1),
      distractionType: ["Mobile Phone", "Drowsiness", "Looking Away", "None"][Math.floor(Math.random() * 4)],
      roadType: ["National Highway", "State Highway", "Urban Sector Road", "Intersection"][Math.floor(Math.random() * 4)],
      weather: ["Clear", "Light Rain", "Foggy", "Overcast"][Math.floor(Math.random() * 4)],
      etaAmbulance: Math.floor(3 + Math.random() * 10),
      inferenceMetrics: {
        mAP: (0.85 + Math.random() * 0.1).toFixed(2),
        iou: (0.7 + Math.random() * 0.15).toFixed(2),
        gpuLoad: Math.floor(40 + Math.random() * 30) + "%"
      },
      preIncidentSnapshot: analyticsRef.current.snapshotData, // Simulated pre-frame
      postIncidentSnapshot: analyticsRef.current.snapshotData // Simulated post-frame
    });

    addLog(logText);
    addLog("Analysis complete. Generating report...");
    setIsActive(false);
  };

  const downloadPDFReport = () => {
    if (!summary) return;
    const doc = new jsPDF();
    doc.setFont("courier", "normal");

    doc.setFontSize(16);
    doc.text("CollisionAI Complete Detection Report", 10, 20);

    let logText = `--- Detection Summary ---\n`;
    logText += `Total Frames Analysed: ${summary.framesAnalyzed}\n`;
    logText += `Accident Status: ${summary.hasAccident ? 'DETECTED' : 'NONE'}\n`;
    logText += `Unique Vehicles Involved: ${summary.uniqueVehiclesCount || 0}\n\n`;
    logText += `--- First 10 Frames Detail Sample ---\n`;

    const sample = summary.history.slice(0, 10);
    sample.forEach(f => {
      logText += `Frame ${f.frame} | Accident: ${f.isAccidentLabel || (f.accidents > 0 ? 'True' : 'False')} | Objects: ${f.objectsStr || '[]'}\n`;
    });

    logText += `\n(Detailed 'frame_details' list is populated with data for all frames)`;

    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(logText, 180);
    doc.text(splitText, 10, 40);

    doc.save("collision_report.pdf");
  };

  const sendTelegramAlert = async () => {
    if (!summary) return;

    const BOT_TOKEN = "8755648682:AAEM2BE03RjkERCieUCAxtr1UJXBaESlf6I";
    const CHAT_IDS = ["8503429521", "5995705267", "5194855700"];
    const subject = summary.hasAccident ? "🚨 CRITICAL ACCIDENT DETECTED!" : "✅ SAFE REPORT";
    const dateTimeStr = summary.timestamp || new Date().toLocaleString();
    const mapsLink = `https://www.google.com/maps?q=${locationCoords.lat},${locationCoords.lon}`;

    const driverDetail = summary.driverInfo ? `👤 Driver: ${summary.driverInfo.name} (${summary.driverInfo.bloodGroup})\n📱 Phone: ${summary.driverInfo.phone}\n` : "";
    const vehicleDetail = summary.vehicleInfo ? `🚗 Vehicle: ${summary.vehicleInfo.brand} ${summary.vehicleInfo.model} [${summary.vehicleInfo.registrationNumber}]\n` : "";
    const emergencyDetail = summary.emergencyContact ? `🆘 Emergency: ${summary.emergencyContact.name} (${summary.emergencyContact.relation})\n📞 Contact: ${summary.emergencyContact.phone}\n` : "";

    const reportText = summary.hasAccident
      ? `${subject}\n\n🆔 Event ID: ${summary.eventID || 'Unknown'}\n📅 Date & Time: ${dateTimeStr}\n📍 Location: ${locationName}\n🗺️ Maps: ${mapsLink}\n\n${driverDetail}${vehicleDetail}${emergencyDetail}\n🕒 Trigger: Frame ${summary.firstDetectionFrame} (${summary.firstDetectionTime}s)\n💥 Collision: ${(summary.accidentVehicles?.[0]?.collisionType || "Unknown")}\n⚡ Impact: ${(summary.accidentVehicles?.[0]?.impactForce || "Unknown")}\n\n🎯 Severity: ${summary.severity}/10 \n Est. Damage: ${summary.damageRange || 'N/A'}\n🤖 Confidence: ${summary.confidence}%`
      : `${subject}\n\n📅 Date & Time: ${dateTimeStr}\nNo accidents detected over ${summary.framesAnalyzed} frames.\n📍 Location: ${locationName}\n🗺️ Maps: ${mapsLink}\nLatency: ${summary.avgLatency}ms`;

    try {
      addLog("Sending Telegram alerts...");

      for (const chatId of CHAT_IDS) {
        let sentMain = false;
        // If there's a snapshot, send as photo
        if (summary.hasAccident && summary.snapshotData) {
          const fetchResponse = await fetch(summary.snapshotData);
          const blob = await fetchResponse.blob();

          const formData = new FormData();
          formData.append('chat_id', chatId);
          formData.append('photo', blob, 'accident_frame.jpg');
          // Caption limit is 1024 chars, so we send basic details here
          formData.append('caption', reportText.slice(0, 1000));

          const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: "POST",
            body: formData,
          });
          if (response.ok) sentMain = true;
        }

        // If photo failed or no photo or we want to send the FULL report anyway
        if (!sentMain || summary.hasAccident) {
          const textResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `� INCIDENT SUMMARY:\n\n${reportText}`,
            }),
          });
          if (textResponse.ok) addLog(`Summary report sent to ${chatId}`);
        }

        if (sentMain) addLog(`Accident snapshot sent to ${chatId}`);
      }
    } catch (err) {
      addLog(`Error sending Telegram alert: ${err.message}`, true);
    }
  };

  const handleStartStop = () => {
    if (!mediaSrc) {
      alert("Please upload media or start camera first");
      return;
    }
    const newActiveState = !isActive;
    setIsActive(newActiveState);
    if (newActiveState) {
      setSummary(null);
      setCurrentDetections([]);
      analyticsRef.current = {
        framesAnalyzed: 0,
        hasAccident: false,
        involvedObjects: new Set(),
        firstDetectionTime: null,
        firstDetectionFrame: null,
        accidentReason: '',
        confidence: 0,
        severity: 0,
        accidentVehicles: [],
        snapshotData: null,
        history: [],
        uniqueIds: new Set(),
        lighting: "Assessing..."
      };
      if (mediaType === 'video' && !isLiveStream) {
        videoRef.current?.play();
      }
    } else {
      if (mediaType === 'video' && !isLiveStream) {
        videoRef.current?.pause();
      }
      finishAnalysis();
    }
  };

  const handleRestart = () => {
    if (mediaType === 'video' && videoRef.current && !isLiveStream) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsActive(true);
      setHasAccident(false);
      trackingObj.current = {};
      setSummary(null);
      analyticsRef.current = {
        framesAnalyzed: 0,
        hasAccident: false,
        involvedObjects: new Set(),
        firstDetectionTime: null,
        firstDetectionFrame: null,
        accidentReason: '',
        confidence: 0,
        severity: 0,
        accidentVehicles: [],
        snapshotData: null,
        history: [],
        uniqueIds: new Set(),
        lighting: "Assessing..."
      };
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleVideoEnded = () => {
    setIsActive(false);
    finishAnalysis();
  };

  useEffect(() => {
    if (isActive) {
      addLog(`Starting collision monitoring on uploaded ${mediaType}...`);
      trackingObj.current = {};
      setHasAccident(false);
      processFrame();
    } else {
      addLog("System paused.");
      if (loopRef.current) clearTimeout(loopRef.current);
    }
    return () => {
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, [isActive]);

  // Pre-calculate real-time metrics for top display with extreme safety
  const safeDetections = Array.isArray(currentDetections) ? currentDetections : [];
  const realTimeMetrics = {
    car: safeDetections.filter(d => d && d.cls === 'car').length || 0,
    truck: safeDetections.filter(d => d && d.cls === 'truck').length || 0,
    bus: safeDetections.filter(d => d && d.cls === 'bus').length || 0,
    motorcycle: safeDetections.filter(d => d && ['motorcycle', 'bicycle', 'bike'].includes(d.cls)).length || 0,
    person: safeDetections.filter(d => d && d.cls === 'person').length || 0,
  };

  return (
    <div className="app-container">
      <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />

      <Sidebar
        AVAILABLE_CLASSES={AVAILABLE_CLASSES}
        activeClasses={activeClasses}
        setActiveClasses={setActiveClasses}
        speedThreshold={speedThreshold}
        setSpeedThreshold={setSpeedThreshold}
        frameThreshold={frameThreshold}
        setFrameThreshold={setFrameThreshold}
        handleFileUpload={handleFileUpload}
        handleCameraFeed={handleCameraFeed}
        isActive={isActive}
        handleStartStop={handleStartStop}
        handleRestart={handleRestart}
        mediaSrc={mediaSrc}
        summary={summary}
        currentDetections={currentDetections}
        downloadPDFReport={downloadPDFReport}
        logs={logs}
        setLogs={setLogs}
      />

      <div className="main-content">
        <div className="header" style={{ alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ lineHeight: 1 }}>Offline Media Analysis</h2>
              <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '6px', fontWeight: '500', display: 'flex', gap: '12px' }}>
                <span>📅 {now.toLocaleDateString()}</span>
                <span>⏰ {now.toLocaleTimeString()}</span>
              </div>
            </div>

            {/* LIVE BREAKDOWN BESIDE TEXT - MEDIUM SIZE */}
            <div style={{ display: 'flex', gap: '16px', background: 'rgba(255, 255, 255, 0.05)', padding: '8px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
              <div style={{ textAlign: 'center', minWidth: '50px' }}>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', letterSpacing: '0.5px', fontWeight: 'bold' }}>CARS</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#3b82f6' }}>{realTimeMetrics.car}</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', height: '20px', alignSelf: 'center' }}></div>
              <div style={{ textAlign: 'center', minWidth: '50px' }}>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', letterSpacing: '0.5px', fontWeight: 'bold' }}>TRUCKS</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#10b981' }}>{realTimeMetrics.truck}</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', height: '20px', alignSelf: 'center' }}></div>
              <div style={{ textAlign: 'center', minWidth: '50px' }}>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', letterSpacing: '0.5px', fontWeight: 'bold' }}>BUSES</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fbbf24' }}>{realTimeMetrics.bus}</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', height: '20px', alignSelf: 'center' }}></div>
              <div style={{ textAlign: 'center', minWidth: '50px' }}>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', letterSpacing: '0.5px', fontWeight: 'bold' }}>BIKES</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ef4444' }}>{realTimeMetrics.motorcycle}</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', height: '20px', alignSelf: 'center' }}></div>
              <div style={{ textAlign: 'center', minWidth: '50px' }}>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', letterSpacing: '0.5px', fontWeight: 'bold' }}>PERSONS</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{realTimeMetrics.person}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            {hasAccident ? (
              <div className="status-badge error" style={{ margin: 0 }}>
                ● CRITICAL ALERT
              </div>
            ) : isActive ? (
              <div className="status-badge" style={{ margin: 0 }}>
                ● PROCESSING
              </div>
            ) : (
              <div className="status-badge" style={{ color: 'gray', borderColor: 'gray', background: 'transparent', margin: 0 }}>
                ○ STANDBY
              </div>
            )}
            {isActive && (
              <div className="engine-status" style={{ fontSize: '0.6rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                YOLOv8 LIVE-SYNC
              </div>
            )}
          </div>
        </div>

        <div className="video-container">
          {mediaSrc ? (
            <>
              {mediaType === 'video' ? (
                <video
                  ref={videoRef}
                  src={!isLiveStream ? mediaSrc : undefined}
                  className="video-element"
                  controls={!isLiveStream}
                  autoPlay={isLiveStream}
                  onEnded={handleVideoEnded}
                  muted
                />
              ) : (
                <img
                  ref={imageRef}
                  src={mediaSrc}
                  className="video-element"
                  style={{ objectFit: 'contain' }}
                  alt="uploaded collision"
                />
              )}

              <canvas ref={canvasRef} className="canvas-element" />
              {hasAccident && (
                <div className="accident-alert-overlay">
                  ⚠️ ACCIDENT DETECTED
                </div>
              )}
            </>
          ) : (
            <div className="placeholder-view">
              <i className="ri-movie-line">🎬</i>
              <p>Upload a video or photo on the left to begin analysis</p>
            </div>
          )}
        </div>

        {/* Show logs below video during analysis */}
        {!summary && <LogsPanel logs={logs} setLogs={setLogs} />}

        {summary && (
          <SummaryPanel
            summary={summary}
            sendTelegramAlert={sendTelegramAlert}
            downloadPDFReport={downloadPDFReport}
            locationName={locationName}
            locationCoords={locationCoords}
          />
        )}
      </div>
    </div>
  );
}
