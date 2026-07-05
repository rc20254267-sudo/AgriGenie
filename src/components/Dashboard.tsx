/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sun, 
  CloudSun, 
  CloudRain, 
  CloudLightning, 
  CloudFog, 
  CloudDrizzle, 
  CloudSnow, 
  Cloud, 
  Droplet, 
  Thermometer, 
  Wind, 
  Activity, 
  TrendingUp, 
  Sprout, 
  AlertTriangle, 
  DollarSign,
  Sunrise,
  Sunset,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Clock
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Farm, CropManagement, Expense, DiseaseRecord, YieldPrediction, NotificationItem, UserProfile } from "../types";
import { translations, translateValue as globalTranslateValue } from "../translations";

// Icon lookup dictionary
const weatherIcons = {
  Sun: Sun,
  CloudSun: CloudSun,
  CloudRain: CloudRain,
  CloudLightning: CloudLightning,
  CloudFog: CloudFog,
  CloudDrizzle: CloudDrizzle,
  CloudSnow: CloudSnow,
  Cloud: Cloud
};

interface DashboardProps {
  farms: Farm[];
  crops: CropManagement[];
  expenses: Expense[];
  diseases: DiseaseRecord[];
  predictions: YieldPrediction[];
  notifications: NotificationItem[];
  onNavigate: (view: string) => void;
  weatherData: any;
  setWeatherData: (data: any) => void;
  userProfile?: UserProfile;
}

export default function Dashboard({
  farms,
  crops,
  expenses,
  diseases,
  predictions,
  notifications,
  onNavigate,
  weatherData,
  setWeatherData,
  userProfile
}: DashboardProps) {
  const [loadingWeather, setLoadingWeather] = useState(false);

  const lang = userProfile?.language || "en";
  const t = translations[lang] || translations.en;

  // Fetch weather based on active farm or default Hyderabad
  useEffect(() => {
    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        const query = farms.length > 0 ? farms[0].location : "hyderabad";
        const response = await fetch(`/api/weather?location=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setWeatherData(data);
        }
      } catch (err) {
        console.error("Error fetching weather:", err);
      } finally {
        setLoadingWeather(false);
      }
    };
    fetchWeather();
  }, [farms, setWeatherData]);

  // Dynamic translations based on selected language
  const translateValue = (val: string) => {
    return globalTranslateValue(val, lang);
  };

  const expectedYieldLabel = lang === "te" ? "ఆశించిన దిగుబడి (kg)" : lang === "hi" ? "अपेक्षित उपज (kg)" : "Expected Yield (kg)";
  const previousYieldLabel = lang === "te" ? "మునుపటి దిగుబడి (kg)" : lang === "hi" ? "पिछली उपज (kg)" : "Previous Yield (kg)";

  // Aggregate stats
  const totalArea = farms.reduce((acc, f) => acc + Number(f.area), 0);
  const activeCropsCount = crops.filter(c => c.growthStage !== "Harvested").length;
  
  // Expenses distribution
  const aggregatedExpenses = expenses.reduce(
    (acc, e) => {
      acc.seed += Number(e.seedCost);
      acc.fertilizer += Number(e.fertilizerCost);
      acc.labor += Number(e.laborCost);
      acc.equipment += Number(e.equipmentCost);
      return acc;
    },
    { seed: 0, fertilizer: 0, labor: 0, equipment: 0 }
  );

  const totalExpenseAmount = aggregatedExpenses.seed + aggregatedExpenses.fertilizer + aggregatedExpenses.labor + aggregatedExpenses.equipment;

  const expensePieData = [
    { name: translateValue("Seeds"), value: aggregatedExpenses.seed, color: "#10B981" },
    { name: translateValue("Fertilizers"), value: aggregatedExpenses.fertilizer, color: "#F59E0B" },
    { name: translateValue("Labor"), value: aggregatedExpenses.labor, color: "#3B82F6" },
    { name: translateValue("Equipment"), value: aggregatedExpenses.equipment, color: "#EF4444" },
  ].filter(item => item.value > 0);

  // If no expenses, show standard template
  const hasExpenses = expensePieData.length > 0;
  const displayPieData = hasExpenses ? expensePieData : [
    { name: translateValue("Seeds"), value: 4500, color: "#10B981" },
    { name: translateValue("Fertilizers"), value: 8200, color: "#F59E0B" },
    { name: translateValue("Labor"), value: 12000, color: "#3B82F6" },
    { name: translateValue("Equipment"), value: 6500, color: "#EF4444" },
  ];
  const finalTotalExpense = hasExpenses ? totalExpenseAmount : 31200;

  // Chart data for Yield predictions vs previous crops
  const yieldChartData = predictions.map(p => ({
    crop: translateValue(p.crop),
    [expectedYieldLabel]: p.estimatedYield,
    [previousYieldLabel]: p.previousYield,
  }));

  const displayYieldData = yieldChartData.length > 0 ? yieldChartData : [
    { crop: translateValue("Rice (Sona)"), [expectedYieldLabel]: 2800, [previousYieldLabel]: 2400 },
    { crop: translateValue("Tomato"), [expectedYieldLabel]: 4500, [previousYieldLabel]: 4100 },
    { crop: translateValue("Cotton"), [expectedYieldLabel]: 1800, [previousYieldLabel]: 1950 },
  ];

  // Growth progress data
  const growthData = crops.map(c => {
    let pct = 20;
    if (c.growthStage === "Vegetative") pct = 45;
    if (c.growthStage === "Flowering") pct = 75;
    if (c.growthStage === "Maturity") pct = 95;
    if (c.growthStage === "Harvested") pct = 100;
    return { name: translateValue(c.cropName), progress: pct, stage: translateValue(c.growthStage) };
  });

  const displayGrowthData = growthData.length > 0 ? growthData : [
    { name: translateValue("Rice Paddy"), progress: 45, stage: translateValue("Vegetative") },
    { name: translateValue("Tomato Vine"), progress: 75, stage: translateValue("Flowering") },
    { name: translateValue("Sweet Corn"), progress: 20, stage: translateValue("Seedling") },
  ];

  const WeatherIconComponent = weatherData ? (weatherIcons[weatherData.icon as keyof typeof weatherIcons] || Cloud) : Sun;

  return (
    <div className="space-y-6">
      {/* Top Banner Greetings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1B4332]/90 to-[#2E7D32]/90 border border-white/20 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">{t.appName} {t.dashboard}</h2>
          <p className="text-emerald-100/90 text-sm mt-1 max-w-xl">
            {t.welcome} {userProfile?.name || "Farmer"}! {t.tagline}
          </p>
        </div>
        <button
          onClick={() => onNavigate("chat")}
          className="bg-[#81C784] text-[#1B4332] font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:bg-[#66bb6a] shadow-md flex items-center gap-2 cursor-pointer shrink-0 font-display"
        >
          {lang === "te" ? "అగ్రిజెనీ AIని అడగండి" : lang === "hi" ? "एग्रीजीनी AI से पूछें" : "Ask AgriGenie AI"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Numerical Bento Grid Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-lg border border-white/50 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#2E7D32]/10 rounded-xl text-[#2E7D32]">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.activeCrops}</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-1 font-display">{activeCropsCount || 3}</h3>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-lg border border-white/50 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-500/10 rounded-xl text-blue-600">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.totalArea}</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-1 font-display">{totalArea || "6.5"} {t.acres}</h3>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-lg border border-white/50 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-yellow-500/10 rounded-xl text-yellow-600 font-display">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "te" ? "మొత్తం ఖర్చులు" : lang === "hi" ? "कुल खर्च" : "Total Expenses"}</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-1 font-display">₹{finalTotalExpense.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-lg border border-white/50 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-rose-500/10 rounded-xl text-rose-600">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "te" ? "తెగులు హెచ్చరికలు" : lang === "hi" ? "रोग अलर्ट" : "Disease Alerts"}</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-1 font-display">{diseases.length || 1} {lang === "te" ? "పెండింగ్" : lang === "hi" ? "लंबित" : "Pending"}</h3>
          </div>
        </div>
      </div>


      {/* Main Content Row: Weather & Irrigation Alert */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className="xl:col-span-2 bg-white/60 backdrop-blur-lg border border-white/50 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-white/20">
              <div>
                <h3 className="font-bold text-slate-800 text-lg font-display">{t.weatherForecast}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{lang === "te" ? `ప్రస్తుత వాతావరణ సమాచారం: ${weatherData?.location || "Anantapur"}` : lang === "hi" ? `वास्तविक समय मौसम जानकारी: ${weatherData?.location || "Anantapur"}` : `Real-time telemetry for ${weatherData?.location || "Anantapur"}`}</p>
              </div>
              <span className="text-xs bg-[#2E7D32]/10 text-[#2E7D32] px-2.5 py-1 rounded-full font-bold">
                {lang === "te" ? "లైవ్ డేటా" : lang === "hi" ? "लाइव डेटा" : "Live Data"}
              </span>
            </div>

            {loadingWeather ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500">{lang === "te" ? "శాటిలైట్ సూచనను సమకాలీకరిస్తోంది..." : lang === "hi" ? "सैटेलाइट पूर्वानुमान सिंक किया जा रहा है..." : "Syncing satellite forecast..."}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="flex items-center gap-5 bg-[#2E7D32]/5 p-5 rounded-2xl border border-white/40">
                  <div className="p-3 bg-white/80 rounded-xl shadow-xs text-[#2E7D32]">
                    <WeatherIconComponent className="w-12 h-12" />
                  </div>
                  <div>
                    <div className="text-4xl font-extrabold text-slate-800 font-display">{weatherData?.temperature || 32}°C</div>
                    <div className="text-sm font-semibold text-slate-600 mt-0.5">{weatherData?.condition || "Partly Cloudy"}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{lang === "te" ? "అనిపిస్తోంది" : lang === "hi" ? "ऐसा महसूस होता है" : "Feels like"} {weatherData?.feelsLike || 35}°C</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/30 backdrop-blur-md border border-white/45 p-3 rounded-2xl flex items-center gap-3">
                    <Droplet className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">{t.humidity}</div>
                      <div className="text-sm font-bold text-slate-700">{weatherData?.humidity || 62}%</div>
                    </div>
                  </div>

                  <div className="bg-white/30 backdrop-blur-md border border-white/45 p-3 rounded-2xl flex items-center gap-3">
                    <CloudRain className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">{t.rainfall}</div>
                      <div className="text-sm font-bold text-slate-700">{weatherData?.rainProbability || 25}%</div>
                    </div>
                  </div>

                  <div className="bg-white/30 backdrop-blur-md border border-white/45 p-3 rounded-2xl flex items-center gap-3">
                    <Wind className="w-4 h-4 text-yellow-600" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">{t.windSpeed}</div>
                      <div className="text-sm font-bold text-slate-700">{weatherData?.windSpeed || 14} km/h</div>
                    </div>
                  </div>

                  <div className="bg-white/30 backdrop-blur-md border border-white/45 p-3 rounded-2xl flex items-center gap-3">
                    <Sunrise className="w-4 h-4 text-orange-500" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">{lang === "te" ? "సూర్యోదయం/సూర్యాస్తమయం" : lang === "hi" ? "सूर्योदय/सूर्यास्त" : "Sunrise/Sunset"}</div>
                      <div className="text-[11px] font-bold text-slate-700">{weatherData?.sunrise || "05:48 AM"}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Forecast row */}
          {!loadingWeather && weatherData?.forecast && (
            <div className="mt-6 pt-5 border-t border-white/20">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">{lang === "te" ? "7 రోజుల వాతావరణ సూచన" : lang === "hi" ? "7 दिनों का मौसम पूर्वानुमान" : "7-Day Local Forecast"}</span>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2 overflow-x-auto pb-1">
                {weatherData.forecast.slice(0, 7).map((day: any, idx: number) => {
                  const DayIcon = weatherIcons[day.icon as keyof typeof weatherIcons] || Sun;
                  return (
                    <div key={idx} className="bg-white/30 hover:bg-white/60 transition-all p-2 rounded-2xl text-center border border-white/30 shrink-0 min-w-[70px]">
                      <span className="text-xs font-bold text-slate-500 block">{day.day}</span>
                      <DayIcon className="w-5 h-5 mx-auto my-1.5 text-[#2E7D32]" />
                      <div className="text-xs font-bold text-slate-800">{day.tempMax}°</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{day.tempMin}°</div>
                      <div className="text-[9px] text-blue-500 font-bold mt-1 flex items-center justify-center gap-0.5">
                        <Droplet className="w-2 h-2" />
                        {day.rainProb}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Irrigation Alert & Today's Recommendation */}
        <div className="bg-white/60 backdrop-blur-lg border border-white/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-800 text-lg font-display">{t.irrigationTitle}</h3>
                <p className="text-xs text-[#2E7D32] font-bold mt-0.5">{t.shouldIrrigate}</p>
              </div>
              <span className="p-2 bg-[#2E7D32]/10 rounded-xl text-[#2E7D32]">
                <Droplet className="w-5 h-5 animate-bounce" />
              </span>
            </div>

            <div className="my-5 p-4 bg-[#2E7D32] text-white rounded-2xl shadow-md relative overflow-hidden">
              <div className="absolute right-[-20px] bottom-[-20px] text-white/5 pointer-events-none">
                <Sprout className="w-32 h-32" />
              </div>
              <div className="text-xs uppercase tracking-wider font-bold text-emerald-100">Status</div>
              <div className="text-xl font-bold mt-1 font-display">{lang === "te" ? "నీటి పారుదల సిఫార్సు చేయబడింది" : lang === "hi" ? "सिंचाई की सिफारिश की जाती है" : "Irrigation Recommended"}</div>
              <div className="text-xs text-emerald-50 mt-2 font-medium leading-relaxed">
                {lang === "te" ? "నేలలో తేమ తగ్గుతోంది. ఉదయం లేదా సాయంత్రం వేళల్లో నీరు పెట్టడం ఉత్తమం." : lang === "hi" ? "मिट्टी की नमी कम हो रही है। सुबह या शाम को पानी देना सबसे अच्छा है।" : "Soil Moisture is dipping. Optimal watering recommended at dawn or dusk."}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-2 border-b border-white/20">
                <span className="text-slate-500 font-medium">{lang === "te" ? "లక్ష్య పంట" : lang === "hi" ? "लक्ष्य फसल" : "Target Crop"}</span>
                <span className="font-bold text-slate-800">{crops?.[0]?.cropName || "Paddy Rice"}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-white/20">
                <span className="text-slate-500 font-medium">{lang === "te" ? "అవసరమైన నీటి పరిమాణం" : lang === "hi" ? "आवश्यक पानी की मात्रा" : "Water Volume Needed"}</span>
                <span className="font-bold text-slate-800">~16,000 {t.waterQty}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-white/20">
                <span className="text-slate-500 font-medium">{t.bestTime}</span>
                <span className="font-bold text-[#2E7D32]">06:00 AM - 08:00 AM</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("irrigation")}
            className="w-full mt-6 py-2.5 bg-white/50 hover:bg-white/80 border border-white/40 text-[#2E7D32] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {lang === "te" ? "స్మార్ట్ నీటి పారుదల సలహాదారుని తెరవండి" : lang === "hi" ? "स्मार्ट सिंचाई सलाहकार खोलें" : "Open Precision Irrigation Advisor"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Analytical Charts and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield Predictions Recharts Area Graph */}
        <div className="bg-white/60 backdrop-blur-lg border border-white/50 p-6 rounded-3xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-lg font-display">{t.yieldTitle}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{lang === "te" ? "మునుపటి దిగుబడులతో భవిష్యత్ పంట అంచనాల పోలిక" : lang === "hi" ? "पिछले वर्षों की तुलना में भविष्य की फसल का अनुमान" : "Historical previous yields compared with future smart crop estimates"}</p>
            </div>
            <span className="p-2 bg-[#2E7D32]/10 rounded-lg text-[#2E7D32]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayYieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="crop" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1f2937", borderRadius: "12px", border: "none", color: "#fff" }}
                  labelClassName="font-bold"
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey={expectedYieldLabel} fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey={previousYieldLabel} fill="#a7f3d0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses and Growth Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expenses Donut Chart */}
           <div className="bg-white/60 backdrop-blur-lg border border-white/50 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base font-display">
                {lang === "te" ? "ఖర్చుల పంపిణీ" : lang === "hi" ? "व्यय वितरण" : "Expense Distribution"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === "te" ? "ధరల భాగస్వామ్య నిష్పత్తి" : lang === "hi" ? "लागत हिस्सा वितरण" : "Cost share distribution"}
              </p>
            </div>

            <div className="h-44 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {displayPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">
                  {lang === "te" ? "మొత్తం" : lang === "hi" ? "कुल" : "Total"}
                </div>
                <div className="text-sm font-extrabold text-slate-800 font-display">₹{finalTotalExpense.toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {displayPieData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-500 truncate">{entry.name}:</span>
                  <span className="font-bold text-slate-800 ml-auto font-mono">₹{entry.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Crop Stages */}
           <div className="bg-white/60 backdrop-blur-lg border border-white/50 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base font-display">
                {lang === "te" ? "పంట ఎదుగుదల పర్యవేక్షణ" : lang === "hi" ? "फसल वृद्धि की निगरानी" : "Crop Growth Tracking"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === "te" ? "సక్రియ ఎదుగుదల ప్రగతి కొలమానాలు" : lang === "hi" ? "सक्रिय विकास प्रगति संकेतक" : "Active growth progress metrics"}
              </p>
            </div>

            <div className="space-y-4 my-4">
              {displayGrowthData.map((crop, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">{crop.name}</span>
                    <span className="text-[10px] bg-[#2E7D32]/10 text-[#2E7D32] font-bold px-1.5 py-0.5 rounded">
                      {crop.stage}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/50 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#2E7D32] h-full rounded-full transition-all duration-500"
                      style={{ width: `${crop.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{lang === "te" ? "విత్తినది" : lang === "hi" ? "बुआई" : "Sown"}</span>
                    <span>{crop.progress}% {lang === "te" ? "పక్వత" : lang === "hi" ? "परिपक्वता" : "Maturity"}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate("farm-management")}
              className="w-full py-2 bg-white/50 hover:bg-white/80 border border-white/40 transition-colors rounded-xl text-[11px] font-bold text-[#2E7D32]"
            >
              {lang === "te" ? "పంట ఎదుగుదల క్యాలెండర్లను నిర్వహించండి" : lang === "hi" ? "फसल वृद्धि कैलेंडर प्रबंधित करें" : "Manage Crop Growth Calendars"}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Disease alerts, Recent Notifications & quick guides */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active Disease Diagnosis Panel */}
        <div className="bg-white/60 backdrop-blur-lg border border-white/50 p-6 rounded-3xl shadow-sm xl:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-white/20">
              <h3 className="font-bold text-slate-800 text-base font-display">
                {lang === "te" ? "పంట తెగుళ్ల హెచ్చరికలు" : lang === "hi" ? "फसल रोग अलर्ट" : "Plant Pathology Alerts"}
              </h3>
              <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                {lang === "te" ? "సక్రియ హెచ్చరికలు" : lang === "hi" ? "सक्रिय अलर्ट" : "Active Alerts"}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {diseases.length > 0 ? (
                diseases.slice(0, 2).map((d) => (
                  <div key={d.id} className="p-3 bg-red-50/50 rounded-2xl border border-red-100/40 flex gap-3">
                    <img 
                      src={d.imageUrl || "https://images.unsplash.com/photo-1592176372045-2d3b0d121367?auto=format&fit=crop&q=80&w=120"} 
                      alt="diseased leaf" 
                      className="w-12 h-12 rounded-xl object-cover border border-red-200"
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-red-950 truncate">{translateValue(d.diseaseName)}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {lang === "te" ? "పంట:" : lang === "hi" ? "फसल:" : "Crop:"} {translateValue(d.crop)} • {lang === "te" ? "తీవ్రత:" : lang === "hi" ? "तीव्रता:" : "Severity:"} <span className="text-red-600 font-bold">{translateValue(d.severity)}</span>
                      </div>
                      <div className="text-[10px] text-red-800/80 mt-1 line-clamp-1">
                        {lang === "te" ? "చికిత్స:" : lang === "hi" ? "उपचार:" : "Tr:"} {d.chemicalTreatment}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-emerald-50/20 border border-emerald-100/40 rounded-2xl flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-emerald-900">
                      {lang === "te" ? "తెగుళ్ల వ్యాప్తి శూన్యం" : lang === "hi" ? "कोई रोग प्रकोप नहीं" : "Zero Disease Outbreaks"}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {lang === "te" ? "అగ్రిజెనీ చురుకుగా పర్యవేక్షిస్తోంది. ఆకులు ఆరోగ్యంగా ఉన్నాయి." : lang === "hi" ? "एग्रीजीनी सक्रिय रूप से निगरानी कर रहा है। पत्तियां स्वस्थ हैं।" : "AgriGenie is actively monitoring. Clean leaf samples."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate("disease")}
            className="w-full mt-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-rose-100"
          >
            {lang === "te" ? "కొత్త ఆకు చిత్రాన్ని స్కాన్ చేయండి" : lang === "hi" ? "पौधे की नई पत्ती स्कैन करें" : "Scan New Plant Leaf Image"}
          </button>
        </div>

        {/* Recent Activities Log */}
        <div className="bg-white/60 backdrop-blur-lg border border-white/50 p-6 rounded-3xl shadow-sm xl:col-span-2">
          <div className="flex justify-between items-center pb-4 border-b border-white/20 mb-4">
            <h3 className="font-bold text-slate-800 text-base font-display">
              {lang === "te" ? "ఇటీవలి కార్యకలాపాలు & ప్రకటనలు" : lang === "hi" ? "हाल की गतिविधियाँ और सूचनाएं" : "Recent Activities & Notices"}
            </h3>
            <button 
              onClick={() => onNavigate("notifications")}
              className="text-xs text-[#2E7D32] hover:underline font-bold"
            >
              {lang === "te" ? "అన్ని నోటిఫికేషన్లను చూడండి" : lang === "hi" ? "सभी सूचनाएं देखें" : "View All Notification Logs"}
            </button>
          </div>

          <div className="space-y-3.5">
            {notifications.slice(0, 3).map((item) => (
              <div key={item.id} className="flex gap-4 items-start p-2.5 hover:bg-white/40 rounded-2xl border border-transparent hover:border-white/20 transition-all">
                <div className={`p-2 rounded-xl shrink-0 ${
                  item.type === "rain" ? "bg-blue-500/10 text-blue-600" :
                  item.type === "disease" ? "bg-rose-500/10 text-rose-600" :
                  item.type === "irrigation" ? "bg-cyan-500/10 text-cyan-600" :
                  "bg-amber-500/10 text-amber-600"
                }`}>
                  {item.type === "rain" ? <CloudRain className="w-4 h-4" /> :
                   item.type === "disease" ? <AlertTriangle className="w-4 h-4" /> :
                   item.type === "irrigation" ? <Droplet className="w-4 h-4" /> :
                   <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                    <span className="text-[9px] text-slate-400 font-mono">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.message}</p>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                {lang === "te" ? "ఇటీవలి కార్యకలాపాలు ఏవీ లేవు. నాటడం కొనసాగించండి!" : lang === "hi" ? "कोई हालिया गतिविधि नहीं मिली। बुआई जारी रखें!" : "No recent activity notices found. Keep planting!"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
