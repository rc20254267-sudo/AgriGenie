/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  UserProfile, 
  Farm, 
  CropManagement, 
  Expense, 
  DiseaseRecord, 
  YieldPrediction, 
  NotificationItem 
} from "./types";

// Components
import Auth from "./components/Auth";
import Sidebar, { ViewType } from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import FarmManagement from "./components/FarmManagement";
import DiseaseDetection from "./components/DiseaseDetection";
import SmartIrrigation from "./components/SmartIrrigation";
import YieldPredictionModule from "./components/YieldPrediction";
import AIAssistant from "./components/AIAssistant";
import Reports from "./components/Reports";
import Notifications from "./components/Notifications";
import ProfileSettings from "./components/ProfileSettings";

// Initial High-Fidelity Demo Seed Data
const DEFAULT_PROFILE: UserProfile = {
  name: "Tharun Yegraddy",
  phone: "yegraddytharun@gmail.com",
  email: "yegraddytharun@gmail.com",
  location: "Anantapur, Andhra Pradesh",
  language: "en"
};

const DEFAULT_FARMS: Farm[] = [
  {
    id: "farm-1",
    name: "Red Soil Hillside Plot",
    location: "Anantapur",
    area: 4.5,
    soilType: "Red Clay Soil",
    cropType: "Sona Masuri Rice",
    plantingDate: "2026-05-12"
  },
  {
    id: "farm-2",
    name: "Silt Loam Lowlands",
    location: "Anantapur",
    area: 2.0,
    soilType: "Sandy Loam",
    cropType: "Early-Blight Tomato",
    plantingDate: "2026-06-01"
  }
];

const DEFAULT_CROPS: CropManagement[] = [
  {
    id: "crop-1",
    farmId: "farm-1",
    cropName: "Sona Masuri Rice",
    growthStage: "Vegetative",
    expectedHarvestDate: "2026-10-15",
    fertilizerSchedule: "Basal dose: apply 50kg NPK (15:15:15) during transplanting. Tillering stage: apply 25kg Urea.",
    pesticideSchedule: "Apply Neem Seed Kernel Extract (5%) if leaf folders exceed thresholds."
  },
  {
    id: "crop-2",
    farmId: "farm-2",
    cropName: "Roma Tomatoes",
    growthStage: "Flowering",
    expectedHarvestDate: "2026-08-30",
    fertilizerSchedule: "Apply 20kg Potassium Sulphate at flowering stage.",
    pesticideSchedule: "Copper oxychloride spray if early leaf blight signs persist."
  }
];

const DEFAULT_EXPENSES: Expense[] = [
  {
    id: "expense-1",
    farmId: "farm-1",
    seedCost: 4500,
    fertilizerCost: 6800,
    laborCost: 12000,
    equipmentCost: 3500,
    timestamp: "2026-05-15T08:30:00.000Z"
  },
  {
    id: "expense-2",
    farmId: "farm-2",
    seedCost: 2400,
    fertilizerCost: 3200,
    laborCost: 8000,
    equipmentCost: 2000,
    timestamp: "2026-06-03T09:00:00.000Z"
  }
];

const DEFAULT_DISEASE_RECORDS: DiseaseRecord[] = [
  {
    id: "disease-1",
    crop: "Tomato Vine",
    imageUrl: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=300",
    diseaseName: "Tomato Early Blight (Alternaria solani)",
    confidenceScore: 92,
    cause: "Warm temperatures accompanied by abundant rainfall or heavy dews, enabling Alternaria solani fungal spores to germinate on lower foliage.",
    symptoms: [
      "Concentrated circular concentric target-like rings on mature leaves.",
      "Lower leaves yellowing and dropping off prematurely.",
      "Stem lesions on foliage margins with dark velvet spores."
    ],
    severity: "High",
    prevention: [
      "Adopt drip irrigation or ground level watering; strictly avoid overhead sprinklers.",
      "Prune lowest branches to increase airflow and sunlight penetration.",
      "Practice 3-year crop rotation with non-solanaceous families."
    ],
    organicTreatment: "Spray organic bio-fungicides formulated with Bacillus subtilis or apply copper hydroxide soap decoctions weekly.",
    chemicalTreatment: "Spray localized Mancozeb (0.2%) or Chlorothalonil fungicide at early symptoms.",
    recommendedFertilizer: "Boost nitrogen-potassium soil balance to maintain vegetative energy.",
    recoveryTime: "12 Days",
    thingsToAvoid: ["Do not leave infected crop debris on soil. Do not irrigate in the late evening."],
    timestamp: "2026-06-25T14:30:00.000Z"
  }
];

const DEFAULT_PREDICTIONS: YieldPrediction[] = [
  {
    id: "yield-1",
    farmId: "farm-1",
    crop: "Sona Masuri Rice",
    area: 4.5,
    rainfall: 620,
    temperature: 30,
    humidity: 68,
    fertilizerUsed: "NPK 15:15:15 + Organic Vermicompost",
    previousYield: 2400,
    estimatedYield: 2850,
    harvestDate: "2026-10-15",
    expectedProfit: 91200,
    confidence: 89,
    aiInsights: {
      why: "Consistent rainfall indices matching tillering stages combined with adequate basal clay-red water absorption holds estimated yield density high.",
      improvements: [
        "Ensure field is flooded to a uniform 5cm depth during panning.",
        "Apply final top dressing of potash to fill grain kernels cleanly."
      ],
      bestPractices: [
        "Incorporate organic crop mulching during pre-sowing.",
        "Maintain clean field margins to prevent insect migration."
      ]
    },
    timestamp: "2026-07-02T10:00:00.000Z"
  }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Rain Forecast Probability",
    message: "Precipitation models indicate a 75% chance of light showers in Anantapur in the next 18 hours. Hold pesticide spray applications.",
    type: "rain",
    isRead: false,
    timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hr ago
  },
  {
    id: "notif-2",
    title: "Tomato Pathology Spotting",
    message: "Leaf Blight spots identified on Red Soil lowlands plot. Check pathology advisory report.",
    type: "disease",
    isRead: false,
    timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hrs ago
  },
  {
    id: "notif-3",
    title: "Fertilizer Schedule Reminder",
    message: "Optimal window for nitrogen top-dressing is starting on Rice plot.",
    type: "fertilizer",
    isRead: true,
    timestamp: new Date(Date.now() - 86400000).toISOString() // yesterday
  }
];

export default function App() {
  // Authentication state
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("authenticated") === "true";
  });

  // Dark mode state with system preference fallback
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  // Apply dark mode theme class
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Core synchronized application state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_PROFILE;
      }
    }
    return DEFAULT_PROFILE;
  });

  // Synchronize authentication and profile changes with localStorage to remember credentials
  React.useEffect(() => {
    localStorage.setItem("authenticated", authenticated ? "true" : "false");
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
  }, [authenticated, userProfile]);

  const [farms, setFarms] = useState<Farm[]>(DEFAULT_FARMS);
  const [crops, setCrops] = useState<CropManagement[]>(DEFAULT_CROPS);
  const [expenses, setExpenses] = useState<Expense[]>(DEFAULT_EXPENSES);
  const [diseases, setDiseases] = useState<DiseaseRecord[]>(DEFAULT_DISEASE_RECORDS);
  const [predictions, setPredictions] = useState<YieldPrediction[]>(DEFAULT_PREDICTIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [weatherData, setWeatherData] = useState<any>(null);

  // Router View State
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");

  // Handler functions for global data flow
  const handleAddFarm = (farm: Farm) => {
    setFarms((prev) => [farm, ...prev]);
  };

  const handleEditFarm = (updatedFarm: Farm) => {
    setFarms((prev) => prev.map((f) => (f.id === updatedFarm.id ? updatedFarm : f)));
  };

  const handleDeleteFarm = (id: string) => {
    setFarms((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddCrop = (newCrop: CropManagement) => {
    setCrops((prev) => [newCrop, ...prev]);
    // Create operation notification
    const notif: NotificationItem = {
      id: "notif-" + Date.now(),
      title: "New Crop Registered",
      message: `${newCrop.cropName} registered on farm plot with an estimated harvest on ${new Date(newCrop.expectedHarvestDate).toLocaleDateString()}.`,
      type: "fertilizer",
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleAddExpense = (newExpense: Expense) => {
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleAddDiseaseRecord = (record: DiseaseRecord) => {
    setDiseases((prev) => [record, ...prev]);
    // Create alert notification
    const notif: NotificationItem = {
      id: "notif-" + Date.now(),
      title: "Crop Disease Spotting Alert",
      message: `Pathological analysis confirmed presence of ${record.diseaseName} with ${record.confidenceScore}% confidence.`,
      type: "disease",
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleAddPrediction = (record: YieldPrediction) => {
    setPredictions((prev) => [record, ...prev]);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  // Logout routine
  const handleLogout = () => {
    setAuthenticated(false);
  };

  if (!authenticated) {
    return (
      <div className={`min-h-screen transition-colors duration-300 flex items-center justify-center p-4 relative overflow-hidden ${darkMode ? "bg-[#0B0F19] dark" : "bg-[#F5F5F5]"}`}>
        {/* Decorative blurred background circles */}
        <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
          {darkMode ? (
            <>
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#1B4332] blur-[140px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#1E3A8A] blur-[140px]" />
            </>
          ) : (
            <>
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#2E7D32] blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#81C784] blur-[120px]" />
            </>
          )}
        </div>
        <div className="relative z-10 w-full max-w-lg">
          <Auth onLoginSuccess={(profile) => { setUserProfile(profile); setAuthenticated(true); }} />
        </div>
      </div>
    );
  }

  // Calculate dynamic unread notification badge
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans flex flex-col lg:flex-row relative overflow-x-hidden ${darkMode ? "bg-[#0B0F19] text-slate-100 dark" : "bg-[#F5F5F5] text-slate-800"}`}>
      {/* Decorative blurred agriculture background circles */}
      <div className="absolute inset-0 pointer-events-none opacity-35 z-0 overflow-hidden">
        {darkMode ? (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#1B4332] blur-[140px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#1E3A8A] blur-[140px]" />
          </>
        ) : (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#2E7D32] blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#81C784] blur-[120px]" />
          </>
        )}
      </div>

      {/* Sidebar Panel Left */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        userProfile={userProfile}
        onLogout={handleLogout}
        unreadCount={unreadCount}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onLanguageChange={(lang) => setUserProfile((prev) => ({ ...prev, language: lang }))}
      />

      {/* Main Dynamic View Area Right */}
      <main className="flex-1 lg:pl-64 p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full z-10 relative">
        {currentView === "dashboard" && (
          <Dashboard
            farms={farms}
            crops={crops}
            expenses={expenses}
            diseases={diseases}
            predictions={predictions}
            notifications={notifications}
            onNavigate={(view) => setCurrentView(view as ViewType)}
            weatherData={weatherData}
            setWeatherData={setWeatherData}
            userProfile={userProfile}
          />
        )}

        {currentView === "farm-management" && (
          <FarmManagement
            farms={farms}
            crops={crops}
            expenses={expenses}
            onAddFarm={handleAddFarm}
            onEditFarm={handleEditFarm}
            onDeleteFarm={handleDeleteFarm}
            onAddCrop={handleAddCrop}
            onAddExpense={handleAddExpense}
            userProfile={userProfile}
          />
        )}

        {currentView === "disease" && (
          <DiseaseDetection
            diseases={diseases}
            onAddDiseaseRecord={handleAddDiseaseRecord}
            userProfile={userProfile}
            onLanguageChange={(lang) => setUserProfile((prev) => ({ ...prev, language: lang }))}
          />
        )}

        {currentView === "irrigation" && (
          <SmartIrrigation
            irrigationRecords={[]} // tracking list can map inside component
            onAddIrrigationRecord={(rec) => {
              // trigger localized notifications if needed
              const notif: NotificationItem = {
                id: "notif-" + Date.now(),
                title: "Irrigation Schedule Generated",
                message: `Watering schedule generated: ${rec.waterQuantity} indicated at ${rec.bestTime}.`,
                type: "irrigation",
                isRead: false,
                timestamp: new Date().toISOString()
              };
              setNotifications((prev) => [notif, ...prev]);
            }}
            userProfile={userProfile}
          />
        )}

        {currentView === "yield" && (
          <YieldPredictionModule
            predictions={predictions}
            onAddPredictionRecord={handleAddPrediction}
            userProfile={userProfile}
          />
        )}

        {currentView === "chat" && (
          <AIAssistant
            userProfile={userProfile}
            farms={farms}
            crops={crops}
            diseases={diseases}
            predictions={predictions}
            weatherData={weatherData}
          />
        )}

        {currentView === "reports" && (
          <Reports
            farms={farms}
            crops={crops}
            expenses={expenses}
            diseases={diseases}
            predictions={predictions}
            weatherData={weatherData}
            userProfile={userProfile}
          />
        )}

        {currentView === "notifications" && (
          <Notifications
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDeleteNotification={handleDeleteNotification}
            userProfile={userProfile}
          />
        )}

        {currentView === "profile" && (
          <ProfileSettings
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {currentView === "settings" && (
          <ProfileSettings
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>
    </div>
  );
}
