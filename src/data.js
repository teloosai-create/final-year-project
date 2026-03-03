// src/data.js

export const emergencyContacts = [
    {
        contactId: "EC1",
        name: "Rajesh Kumar",
        relation: "Father",
        phone: "9876543210",
        secondPhone: "9123456780",
        location: "Pune, Maharashtra",
    },
    {
        contactId: "EC2",
        name: "Sunita Sharma",
        relation: "Wife",
        phone: "9001112233",
        location: "Nashik, Maharashtra",
    },
    {
        contactId: "EC3",
        name: "Arjun Patel",
        relation: "Brother",
        phone: "8800223344",
        location: "Mumbai, Maharashtra",
    },
    {
        contactId: "EC4",
        name: "Vikram Mehta",
        relation: "Friend",
        phone: "7766554433",
        location: "Patna, Bihar",
    },
    {
        contactId: "EC5",
        name: "Anjali Gupta",
        relation: "Sister",
        phone: "9988776655",
        location: "Delhi, NCR",
    }
];

export const drivers = [
    {
        driverId: "D1",
        name: "Amit Verma",
        age: 32,
        licenseNumber: "MH12-123456",
        experienceYears: 8,
        bloodGroup: "B+",
        phone: "9876501234",
        address: "Pune",
        emergencyContactId: "EC1"
    },
    {
        driverId: "D2",
        name: "Suresh Singh",
        age: 45,
        licenseNumber: "MH14-654321",
        experienceYears: 20,
        bloodGroup: "O+",
        phone: "9898989898",
        address: "Nashik",
        emergencyContactId: "EC2"
    },
    {
        driverId: "D3",
        name: "Karan Patel",
        age: 28,
        licenseNumber: "MH01-778899",
        experienceYears: 5,
        bloodGroup: "A+",
        phone: "9001234567",
        address: "Mumbai",
        emergencyContactId: "EC3"
    },
    {
        driverId: "D4",
        name: "Shubham Choudhary",
        age: 24,
        licenseNumber: "BR01-112233",
        experienceYears: 3,
        bloodGroup: "O-",
        phone: "7004455667",
        address: "Patna",
        emergencyContactId: "EC4"
    },
    {
        driverId: "D5",
        name: "Rahul Khanna",
        age: 38,
        licenseNumber: "DL03-990088",
        experienceYears: 12,
        bloodGroup: "AB+",
        phone: "9811223344",
        address: "New Delhi",
        emergencyContactId: "EC5"
    }
];

export const vehicles = [
    {
        vehicleId: "V1",
        type: "Car",
        brand: "Hyundai",
        model: "i20",
        registrationNumber: "MH12 AB 2345",
        ownerName: "Amit Verma",
        insuranceExpiry: "2026-03-20",
        lastServiceDate: "2025-12-15",
    },
    {
        vehicleId: "V2",
        type: "Bike",
        brand: "Bajaj",
        model: "Pulsar 150",
        registrationNumber: "MH14 XY 4567",
        ownerName: "Suresh Singh",
        insuranceExpiry: "2025-09-10",
        lastServiceDate: "2025-11-05",
    },
    {
        vehicleId: "V3",
        type: "Truck",
        brand: "Tata",
        model: "407",
        registrationNumber: "MH01 ZT 8899",
        ownerName: "Karan Patel",
        insuranceExpiry: "2026-01-01",
        lastServiceDate: "2025-10-10",
    },
    {
        vehicleId: "V4",
        type: "Car",
        brand: "Toyota",
        model: "Fortuner",
        registrationNumber: "BR01 PA 0001",
        ownerName: "Shubham Choudhary",
        insuranceExpiry: "2027-05-15",
        lastServiceDate: "2026-02-10",
    },
    {
        vehicleId: "V5",
        type: "Bus",
        brand: "Ashok Leyland",
        model: "Vikrant",
        registrationNumber: "DL01 RT 1122",
        ownerName: "Rahul Khanna",
        insuranceExpiry: "2025-12-30",
        lastServiceDate: "2026-01-20",
    }
];

export const videoData = [
    {
        videoId: "VID1",
        fileName: "highway_car_collision.mp4",
        description: "Highway collision between two cars",
        durationSec: 18,
        sceneType: "Highway",
        dateCaptured: "2024-05-01",
    },
    {
        videoId: "VID2",
        fileName: "city_lane_change_accident.mp4",
        description: "Sudden lane change in city traffic",
        durationSec: 22,
        sceneType: "City",
        dateCaptured: "2024-05-06",
    },
    {
        videoId: "VID3",
        fileName: "bike_slip_rain.mp4",
        description: "Bike slips due to wet road in rain",
        durationSec: 15,
        sceneType: "Rainy Road",
        dateCaptured: "2024-05-10",
    },
    {
        videoId: "VID4",
        fileName: "truck_rollover_expressway.mp4",
        description: "Heavy truck rollover on sharp turn",
        durationSec: 30,
        sceneType: "Expressway",
        dateCaptured: "2024-05-12",
    },
    {
        videoId: "VID5",
        fileName: "pedestrian_near_miss.mp4",
        description: "Emergency braking to avoid pedestrian",
        durationSec: 12,
        sceneType: "Urban",
        dateCaptured: "2024-05-15",
    },
    {
        videoId: "VID6",
        fileName: "foggy_pileup.mp4",
        description: "Multiple vehicle pileup in thick fog",
        durationSec: 45,
        sceneType: "Foggy Highway",
        dateCaptured: "2024-05-18"
    },
    {
        videoId: "VID7",
        fileName: "night_intersection_crash.mp4",
        description: "Red light violation at night intersection",
        durationSec: 20,
        sceneType: "Intersection",
        dateCaptured: "2024-05-20"
    },
    {
        videoId: "VID8",
        fileName: "animal_crossing_collision.mp4",
        description: "Collision due to animal crossing road",
        durationSec: 25,
        sceneType: "Rural",
        dateCaptured: "2024-05-22"
    },
    {
        videoId: "VID9",
        fileName: "wrong_way_driving.mp4",
        description: "Head-on collision caused by wrong-way driver",
        durationSec: 15,
        sceneType: "One-way Street",
        dateCaptured: "2024-05-25"
    },
    {
        videoId: "VID10",
        fileName: "brake_failure_descent.mp4",
        description: "Brake failure during mountain descent",
        durationSec: 60,
        sceneType: "Mountain",
        dateCaptured: "2024-05-28"
    },
    {
        videoId: "VID11",
        fileName: "oil_slick_spinout.mp4",
        description: "Vehicle spinout on oil slick",
        durationSec: 18,
        sceneType: "Industrial Area",
        dateCaptured: "2024-06-01"
    },
    {
        videoId: "VID12",
        fileName: "pothole_impact.mp4",
        description: "Loss of control due to large pothole",
        durationSec: 10,
        sceneType: "Local Road",
        dateCaptured: "2024-06-03"
    },
    {
        videoId: "VID13",
        fileName: "distracted_driver_rear_end.mp4",
        description: "Rear-end collision due to phone usage",
        durationSec: 22,
        sceneType: "City Traffic",
        dateCaptured: "2024-06-05"
    },
    {
        videoId: "VID14",
        fileName: "tire_burst_high_speed.mp4",
        description: "Loss of control after tire burst at 100kmph",
        durationSec: 28,
        sceneType: "Highway",
        dateCaptured: "2024-06-08"
    },
    {
        videoId: "VID15",
        fileName: "cyclist_collision_blindspot.mp4",
        description: "Left turn collision with unseen cyclist",
        durationSec: 14,
        sceneType: "Urban Corner",
        dateCaptured: "2024-06-10"
    },
    {
        videoId: "VID16",
        fileName: "aquaplaning_storm.mp4",
        description: "Vehicle hydroplaning during heavy storm",
        durationSec: 20,
        sceneType: "Stormy Weather",
        dateCaptured: "2024-06-12"
    },
    {
        videoId: "VID17",
        fileName: "construction_zone_crash.mp4",
        description: "Impact with barrels in construction zone",
        durationSec: 35,
        sceneType: "Road Work Zone",
        dateCaptured: "2024-06-15"
    },
    {
        videoId: "VID18",
        fileName: "overloaded_truck_tip.mp4",
        description: "Overloaded truck tipping over during turn",
        durationSec: 40,
        sceneType: "Loading Dock Entrance",
        dateCaptured: "2024-06-18"
    },
    {
        videoId: "VID19",
        fileName: "t-bone_rural_junction.mp4",
        description: "T-bone collision at unsignaled rural junction",
        durationSec: 25,
        sceneType: "Rural Junction",
        dateCaptured: "2024-06-20"
    },
    {
        videoId: "VID20",
        fileName: "drunken_driving_weaving.mp4",
        description: "Drunken driver weaving and hitting median",
        durationSec: 50,
        sceneType: "Avenue",
        dateCaptured: "2024-06-22"
    }
];

export const accidentLogs = [
    {
        accidentId: "A1",
        videoId: "VID1",
        driverId: "D1",
        vehicleId: "V1",
        timestamp: "2024-06-01T10:23:33Z",
        location: "Pune Highway - NH48",
        severity: "High",
        speedAtImpact: 78,
        weatherCondition: "Clear",
        snapshotURL: "/snapshots/accident1.png"
    },
    {
        accidentId: "A2",
        videoId: "VID3",
        driverId: "D3",
        vehicleId: "V3",
        timestamp: "2024-06-03T16:55:12Z",
        location: "Mumbai Eastern Express",
        severity: "Medium",
        speedAtImpact: 54,
        weatherCondition: "Rainy",
        snapshotURL: "/snapshots/accident2.png"
    }
];
