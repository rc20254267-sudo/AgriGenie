/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Droplet, Sun, Clock, Calculator, Loader2, Sparkles, CheckCircle, HelpCircle, Thermometer, Percent } from "lucide-react";
import { IrrigationRecommendation, UserProfile } from "../types";
import { translations } from "../translations";

interface SmartIrrigationProps {
  onAddIrrigationRecord: (record: IrrigationRecommendation) => void;
  irrigationRecords: IrrigationRecommendation[];
  userProfile?: UserProfile;
}

export default function SmartIrrigation({ onAddIrrigationRecord, irrigationRecords, userProfile }: SmartIrrigationProps) {
  const lang = userProfile?.language || "en";
  const t = translations[lang] || translations.en;

  // Dictionary of fully localized labels for absolutely every single word in this UI module
  const labels = {
    cropFamily: lang === "te" ? "పంట రకం" : lang === "hi" ? "फसल परिवार" : "Crop Family",
    soilMoistureLabel: lang === "te" ? "నేల తేమ" : lang === "hi" ? "मिट्टी की नमी" : "Soil Moisture",
    belowDry: lang === "te" ? "45% కంటే తక్కువ ఉంటే పొడిగా ఉన్నట్లు" : lang === "hi" ? "45% से कम सूखा है" : "Below 45% is dry",
    temperatureLabel: lang === "te" ? "ఉష్ణోగ్రత" : lang === "hi" ? "तापमान" : "Temperature",
    humidityLabel: lang === "te" ? "సాపేక్ష తేమ" : lang === "hi" ? "सापेक्ष आर्द्रता" : "Relative Humidity",
    rainProb: lang === "te" ? "వర్షం వచ్చే అవకాశం" : lang === "hi" ? "वर्षा की संभावना" : "Rain Probability",
    weatherSky: lang === "te" ? "వాతావరణ ఆకాశం" : lang === "hi" ? "मौसम आकाश" : "Weather Sky",
    clearSunny: lang === "te" ? "స్పష్టంగా / ఎండగా" : lang === "hi" ? "साफ / धूप" : "Clear / Sunny",
    partlyCloudy: lang === "te" ? "పాక్షికంగా మేఘావృతం" : lang === "hi" ? "आंशिक रूप से बादल" : "Partly Cloudy",
    overcast: lang === "te" ? "మబ్బులు పట్టిన వాతావరణం" : lang === "hi" ? "घने बादल" : "Overcast",
    drizzle: lang === "te" ? "చిరుజల్లులు" : lang === "hi" ? "हल्की बूंदाबांदी" : "Light Drizzle",
    farmPlotSize: lang === "te" ? "పొలం వైశాల్యం (ఎకరాలు)" : lang === "hi" ? "खेत का आकार (एकड़)" : "Farm Plot Size (Acres)",
    getSchedule: lang === "te" ? "నీటి పారుదల షెడ్యూల్ పొందండి" : lang === "hi" ? "सिंचाई अनुसूची प्राप्त करें" : "Get Irrigation Schedule",
    calculating: lang === "te" ? "నీటి ఆవిరి రేటును లెక్కిస్తోంది..." : lang === "hi" ? "वाष्पीकरण की गणना की जा रही है..." : "Calculating Evapotranspiration...",
    consulting: lang === "te" ? "జలసంబంధిత నమూనాలను సంప్రదిస్తోంది" : lang === "hi" ? "जल विज्ञान मॉडल से परामर्श" : "Consulting Hydrological Models",
    formulating: lang === "te" ? "సరైన పంపు సమయాలు మరియు తేమ నిష్పత్తులను రూపొందిస్తోంది..." : lang === "hi" ? "इष्टतम पंप अवधि और नमी संतुलन अनुपात तैयार करना..." : "Formulating optimal pump durations and moisture balance ratios...",
    wateringIndicated: lang === "te" ? "నీరు పెట్టడం అవసరం" : lang === "hi" ? "सिंचाई का संकेत" : "Watering Indicated",
    wateringPaused: lang === "te" ? "నీరు పెట్టడం నిలిపివేయబడింది" : lang === "hi" ? "सिंचाई स्थगित" : "Watering Paused / Postponed",
    irrigationRequired: lang === "te" ? "ఈరోజు నీటిపారుదల అవసరం" : lang === "hi" ? "आज सिंचाई की आवश्यकता है" : "Irrigation Required Today",
    moistureAdequate: lang === "te" ? "తగినంత తేమ స్థాయిలు ఉన్నాయి" : lang === "hi" ? "नमी का स्तर पर्याप्त है" : "Moisture Levels Adequate",
    hydroEvaluation: lang === "te" ? "జలసంబంధిత మూల్యాంకనం" : lang === "hi" ? "जल विज्ञान मूल्यांकन" : "Hydrological evaluation for",
    totalWater: lang === "te" ? "మొత్తం నీటి పరిమాణం" : lang === "hi" ? "कुल पानी की मात्रा" : "Total Water Volume",
    diagnosticReason: lang === "te" ? "జలసంబంధిత రోగనిర్ధారణ కారణం" : lang === "hi" ? "जल विज्ञान संबंधी नैदानिक ​​कारण" : "Hydrological Diagnostic Reason",
    bestTimeLabel: lang === "te" ? "ఉత్తమ నీటిపారుదల సమయం" : lang === "hi" ? "सिंचाई का सर्वोत्तम समय" : "Best Irrigation Time",
    optimalDuration: lang === "te" ? "సరైన రన్ సమయం" : lang === "hi" ? "इष्टतम संचालन अवधि" : "Optimal Run Duration",
    pendingAnalysis: lang === "te" ? "నేల విశ్లేషణ కోసం వేచి ఉంది" : lang === "hi" ? "लंबित मिट्टी विश्लेषण" : "Pending Soil Analysis",
    adjustSliders: lang === "te" 
      ? "మీ పొలంలోని నేల మరియు వాతావరణ సూచికలకు అనుగుణంగా ఎడమ వైపున ఉన్న స్లైడర్‌లను సర్దుబాటు చేయండి, ఆపై AI అంతర్దృష్టులను పొందడానికి లెక్కించు క్లిక్ చేయండి." 
      : lang === "hi" 
      ? "अपने वास्तविक मिट्टी और मौसम सूचकांकों के अनुसार बाईं ओर के स्लाइडर्स को समायोजित करें, फिर AI अंतर्दृष्टि प्राप्त करने के लिए गणना करें पर क्लिक करें।" 
      : "Adjust the range sliders on the left corresponding to your real soil and weather indices, then hit calculate to receive AI insights."
  };

  const [crop, setCrop] = useState("Rice Paddy");
  const [soilMoisture, setSoilMoisture] = useState(35);
  const [temperature, setTemperature] = useState(32);
  const [humidity, setHumidity] = useState(60);
  const [weatherCondition, setWeatherCondition] = useState("Sunny");
  const [rainProbability, setRainProbability] = useState(15);
  const [farmSize, setFarmSize] = useState(2);

  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any | null>(null);
  const [error, setError] = useState("");

  const calculateIrrigation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/gemini/irrigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop,
          soilMoisture,
          temperature,
          humidity,
          weather: weatherCondition,
          rainProbability,
          farmSize,
          lang, // passing lang to backend!
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate recommendation");
      }

      const data = await res.json();
      setRecommendation(data);

      const record: IrrigationRecommendation = {
        id: "irrigation-" + Date.now(),
        farmId: "farm-1",
        crop,
        shouldIrrigate: data.shouldIrrigate,
        waterQuantity: data.waterQuantity,
        bestTime: data.bestTime,
        duration: data.duration,
        reason: data.reason,
        timestamp: new Date().toISOString(),
      };
      onAddIrrigationRecord(record);
    } catch (err) {
      console.error(err);
      setError(
        lang === "te"
          ? "AI నమూనా సర్వర్ అధిక రద్దీని ఎదుర్కొంటోంది. దయచేసి కొన్ని సెకన్ల తర్వాత మళ్లీ ప్రయత్నించండి."
          : lang === "hi"
          ? "AI मॉडल सर्वर पर लोड अधिक है। कृपया कुछ सेकंड में पुनः प्रयास करें।"
          : "AI model server is experiencing high volumes. Please try again in a few seconds."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="pb-4 border-b border-gray-100 dark:border-slate-800">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{t.smartIrrigation}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {lang === "te" 
            ? "మీ పంట పారామితులు మరియు సూక్ష్మ వాతావరణ సూచికలను నమోదు చేయండి. అగ్రిజెనీ AI ఖచ్చితమైన నీటిపారుదల సమయాన్ని సూచిస్తుంది." 
            : lang === "hi" 
            ? "अपनी फसल के मापदंडों और परिवेशीय सूक्ष्म जलवायु संकेतकों को दर्ज करें। एग्रीजीनी एआई सटीक सिंचाई अवधि और मात्रा निर्धारित करेगा।" 
            : "Input your crop parameters and ambient microclimate indicators. AgriGenie AI will prescribe precise irrigation durations and volume requirements."}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Input Form Controls */}
        <div className="xl:col-span-5 bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-emerald-50/40 dark:border-slate-800 shadow-sm">
          <form onSubmit={calculateIrrigation} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{labels.cropFamily}</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium"
              >
                <option value="Rice Paddy">{lang === "te" ? "వరి పంట" : lang === "hi" ? "धान" : "Rice Paddy"}</option>
                <option value="Tomato Vine">{lang === "te" ? "టమోటా" : lang === "hi" ? "टमाटर" : "Tomato Vine"}</option>
                <option value="Wheat">{lang === "te" ? "గోధుమ" : lang === "hi" ? "गेहूं" : "Wheat"}</option>
                <option value="Cotton">{lang === "te" ? "ప్రత్తి" : lang === "hi" ? "कपास" : "Cotton"}</option>
                <option value="Sweet Corn">{lang === "te" ? "మొక్కజొన్న" : lang === "hi" ? "मक्का" : "Sweet Corn"}</option>
                <option value="Chilli Crop">{lang === "te" ? "మిరప" : lang === "hi" ? "मिर्च" : "Chilli / Pepper"}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>{labels.soilMoistureLabel}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{soilMoisture}%</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={soilMoisture}
                  onChange={(e) => setSoilMoisture(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block mt-1">{labels.belowDry}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>{labels.temperatureLabel}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{temperature}°C</span>
                </label>
                <input
                  type="range"
                  min="15"
                  max="48"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>{labels.humidityLabel}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{humidity}%</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="95"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>{labels.rainProb}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{rainProbability}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={rainProbability}
                  onChange={(e) => setRainProbability(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{labels.weatherSky}</label>
                <select
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium"
                >
                  <option value="Sunny">{labels.clearSunny}</option>
                  <option value="Partly Cloudy">{labels.partlyCloudy}</option>
                  <option value="Overcast">{labels.overcast}</option>
                  <option value="Drizzle">{labels.drizzle}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{labels.farmPlotSize}</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="0.1"
                  value={farmSize}
                  onChange={(e) => setFarmSize(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-extrabold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {labels.calculating}
                </>
              ) : (
                <>
                  <Droplet className="w-4 h-4" />
                  {labels.getSchedule}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output Advice Cards Panel */}
        <div className="xl:col-span-7 space-y-6">
          {loading ? (
            <div className="bg-white dark:bg-slate-900/60 p-8 rounded-2xl border border-emerald-50/40 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
              <div className="space-y-1.5 animate-pulse">
                <h4 className="font-extrabold text-gray-800 dark:text-slate-100">{labels.consulting}</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400">{labels.formulating}</p>
              </div>
            </div>
          ) : recommendation ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Recommendation Title Card */}
              <div className={`
                p-6 rounded-2xl border shadow-sm relative overflow-hidden bg-white dark:bg-slate-900/60 dark:border-slate-800
                ${recommendation.shouldIrrigate 
                  ? "bg-gradient-to-br from-white to-blue-50/20 border-blue-100" 
                  : "bg-gradient-to-br from-white to-emerald-50/20 border-emerald-100"}
              `}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                  <div>
                    <span className={`
                      px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                      ${recommendation.shouldIrrigate ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"}
                    `}>
                      {recommendation.shouldIrrigate ? labels.wateringIndicated : labels.wateringPaused}
                    </span>
                    <h3 className="text-xl font-extrabold text-gray-800 dark:text-slate-100 mt-2">
                      {recommendation.shouldIrrigate ? labels.irrigationRequired : labels.moistureAdequate}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{labels.hydroEvaluation} {lang === "te" ? (crop === "Rice Paddy" ? "వరి పంట" : crop) : lang === "hi" ? (crop === "Rice Paddy" ? "धान" : crop) : crop}</p>
                  </div>
                  <div className={`
                    p-3 rounded-xl text-center shrink-0 border
                    ${recommendation.shouldIrrigate ? "bg-blue-50/50 border-blue-100 dark:bg-blue-950/10 dark:border-blue-900/40" : "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/40"}
                  `}>
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block">{labels.totalWater}</span>
                    <span className={`text-sm font-extrabold ${recommendation.shouldIrrigate ? "text-blue-800 dark:text-blue-400" : "text-emerald-800 dark:text-emerald-400"}`}>
                      {recommendation.waterQuantity}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      {labels.diagnosticReason}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed mt-2">{recommendation.reason}</p>
                  </div>
                </div>
              </div>

              {/* Recommendation Parameters Grid */}
              {recommendation.shouldIrrigate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-amber-600 dark:text-amber-400">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block">{labels.bestTimeLabel}</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-slate-200 block mt-1">{recommendation.bestTime}</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl text-blue-600 dark:text-blue-400">
                      <Droplet className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block">{labels.optimalDuration}</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-slate-200 block mt-1">{recommendation.duration}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900/60 p-8 rounded-2xl border border-emerald-50/40 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-full">
                <Droplet className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-extrabold text-gray-800 dark:text-slate-100">{labels.pendingAnalysis}</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mt-1">
                  {labels.adjustSliders}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
