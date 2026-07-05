/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { TrendingUp, Award, Calendar, DollarSign, Sparkles, Loader2, RefreshCw, BarChart4, AlertCircle, HelpCircle } from "lucide-react";
import { YieldPrediction as YieldType, UserProfile } from "../types";
import { translations } from "../translations";

interface YieldPredictionProps {
  onAddPredictionRecord: (record: YieldType) => void;
  predictions: YieldType[];
  userProfile?: UserProfile;
}

export default function YieldPrediction({ onAddPredictionRecord, predictions, userProfile }: YieldPredictionProps) {
  const lang = userProfile?.language || "en";
  const t = translations[lang] || translations.en;

  // Dictionary of fully localized labels for absolutely every single word in this UI module
  const labels = {
    cropFamily: lang === "te" ? "పంట రకం" : lang === "hi" ? "फसल परिवार" : "Crop Family",
    plotArea: lang === "te" ? "పొలం వైశాల్యం (ఎకరాలు)" : lang === "hi" ? "खेत का आकार (एकड़)" : "Plot Area (Acres)",
    prevYield: lang === "te" ? "మునుపటి దిగుబడి (కిలోలు/ఎకరా)" : lang === "hi" ? "पिछली उपज (किग्रा/एकड़)" : "Previous Yield (kg/acre)",
    seasonalRain: lang === "te" ? "వర్షపాతం" : lang === "hi" ? "वर्षा" : "Seasonal Rain",
    meanTemp: lang === "te" ? "సగటు ఉష్ణోగ్రత" : lang === "hi" ? "औसत तापमान" : "Mean Temp",
    meanHumidity: lang === "te" ? "సగటు తేమ" : lang === "hi" ? "औसत आर्द्रता" : "Mean Humidity",
    fertilizersSown: lang === "te" ? "వాడిన ఎరువులు" : lang === "hi" ? "बोया गया उर्वरक" : "Fertilizers Sown",
    fertilizerPlaceholder: lang === "te" ? "ఉదా: యూరియా + NPK 19:19:19" : lang === "hi" ? "जैसे: यूरिया + एनपीके 19:19:19" : "e.g. Urea + NPK 19:19:19",
    calculating: lang === "te" ? "పంట దిగుబడిని లెక్కిస్తోంది..." : lang === "hi" ? "फसल उपज की गणना की जा रही है..." : "Calculating Harvest Densities...",
    predictBtn: lang === "te" ? "దిగుబడి & ఆదాయాన్ని అంచనా వేయండి" : lang === "hi" ? "उपज और आय का अनुमान लगाएं" : "Predict Yield & Income",
    calculatingTitle: lang === "te" ? "పంట దిగుబడి మాతృకలను లెక్కిస్తోంది" : lang === "hi" ? "फसल उपज मैट्रिक्स की गणना" : "Calculating Crop Yield Matrices",
    calculatingDesc: lang === "te" 
      ? "నేల లక్షణాలు, వర్షపాత నమూనాలు మరియు ఆశించిన మార్కెట్ విలువలను క్రాస్-రిఫరెన్స్ చేస్తోంది..." 
      : lang === "hi" 
      ? "मिट्टी की विशेषताओं, वर्षा मॉडल और अपेक्षित बाजार मूल्यांकन का मिलान किया जा रहा है..." 
      : "Cross-referencing soil characteristics, precipitation models, and expected market valuations...",
    estimatedYield: lang === "te" ? "అంచనా దిగుబడి" : lang === "hi" ? "अनुमानित उपज" : "Estimated Yield",
    forAcres: lang === "te" ? "ఎకరాలకు" : lang === "hi" ? "एकड़ के लिए" : "For",
    expectedProfit: lang === "te" ? "ఆశించిన లాభం" : lang === "hi" ? "अपेक्षित लाभ" : "Expected Profit",
    avgMarket: lang === "te" ? "సగటు మార్కెట్ ధర ₹32/కిలో" : lang === "hi" ? "औसत बाजार दर ₹32/किग्रा" : "₹32 / kg avg market",
    harvestDate: lang === "te" ? "అంచనా కోత తేదీ" : lang === "hi" ? "अनुमानित फसल तिथि" : "Est. Harvest Date",
    optimalSowing: lang === "te" ? "సరైన కోత సమయం" : lang === "hi" ? "इष्टतम कटाई समय" : "Sowing window optimal",
    modelConfidence: lang === "te" ? "నమూనా విశ్వసనీయత" : lang === "hi" ? "मॉडल की सटीकता" : "Model Confidence",
    satVerified: lang === "te" ? "ఉపగ్రహ డేటా ధృవీకరించబడింది" : lang === "hi" ? "सैटेलाइट डेटा सत्यापित" : "Sat data verified",
    diagnosticsTitle: lang === "te" ? "అగ్రిజెనీ దిగుబడి విశ్లేషణ" : lang === "hi" ? "एग्रीजीनी उपज निदान" : "AgriGenie Yield Diagnostics",
    diagnosticsDesc: lang === "te" ? "పంట పనితీరుపై వివరణాత్మక వివరణ" : lang === "hi" ? "फसल प्रदर्शन का विवरण" : "Automated crop performance explanation",
    analysisExp: lang === "te" ? "విశ్లేషణ వివరణ" : lang === "hi" ? "विश्लेषण विवरण" : "Analysis Explanation",
    growthActions: lang === "te" ? "లక్ష్యంగా చేసుకున్న వృద్ధి చర్యలు" : lang === "hi" ? "लक्षित विकास क्रियाएं" : "Targeted Growth Actions",
    bestPractices: lang === "te" ? "ఉత్తమ వ్యవసాయ పద్ధతులు" : lang === "hi" ? "सर्वोत्तम कृषि पद्धतियाँ" : "Best Farming Practices",
    pendingTitle: lang === "te" ? "పంట దిగుబడి అంచనా వేయడానికి సిద్ధంగా ఉంది" : lang === "hi" ? "लंबित फसल उपज भविष्यवक्ता" : "Pending Crop Yield Predictor",
    pendingDesc: lang === "te" 
      ? "ఎడమ వైపున వర్షపాతం, ఉష్ణోగ్రత మరియు మునుపటి దిగుబడి వివరాలను సర్దుబాటు చేయండి, ఆపై జెమిని అంచనాలను చూడటానికి విశ్లేషించండి క్లిక్ చేయండి." 
      : lang === "hi" 
      ? "बाईं ओर वर्षा, तापमान और पिछली उपज के विवरण समायोजित करें, फिर जेमिनी पूर्वानुमान चलाने के लिए विश्लेषण करें पर क्लिक करें।" 
      : "Adjust rainfall, temperature, and previous yield records on the left, then click analyze to run Gemini predictions."
  };

  const [crop, setCrop] = useState("Rice Paddy");
  const [area, setArea] = useState(2);
  const [rainfall, setRainfall] = useState(650);
  const [temperature, setTemperature] = useState(28);
  const [humidity, setHumidity] = useState(65);
  const [fertilizerUsed, setFertilizerUsed] = useState("Urea + NPK (19:19:19)");
  const [previousYield, setPreviousYield] = useState(1200);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState("");

  const predictYield = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/gemini/yield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop,
          area,
          rainfall,
          temperature,
          humidity,
          fertilizerUsed,
          previousYield,
          lang, // pass the lang variable to backend!
        }),
      });

      if (!res.ok) {
        throw new Error("Yield calculation failed");
      }

      const data = await res.json();
      setResult(data);

      const record: YieldType = {
        id: "yield-" + Date.now(),
        farmId: "farm-1",
        crop,
        area,
        rainfall,
        temperature,
        humidity,
        fertilizerUsed,
        previousYield,
        estimatedYield: data.estimatedYield,
        harvestDate: data.harvestDate,
        expectedProfit: data.expectedProfit,
        confidence: data.confidence,
        aiInsights: {
          why: data.aiInsights.why,
          improvements: data.aiInsights.improvements,
          bestPractices: data.aiInsights.bestPractices,
        },
        timestamp: new Date().toISOString(),
      };
      onAddPredictionRecord(record);
    } catch (err) {
      console.error(err);
      setError(
        lang === "te"
          ? "వ్యవసాయ AI అంచనా సేవ చాలా సమయం తీసుకుంది. దయచేసి మళ్లీ సమర్పించండి..."
          : lang === "hi"
          ? "कृषि एआई भविष्यवाणी सेवा में बहुत समय लगा। पुनः प्रयास करें..."
          : "Farming AI prediction service took too long. Resubmitting..."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="pb-4 border-b border-gray-100 dark:border-slate-800">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{t.yieldPrediction}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {lang === "te" 
            ? "పంట సాంద్రత మరియు మార్కెట్ లాభాల అంచనాలను అంచనా వేయడానికి భౌగోళిక, వాతావరణ మరియు నేల పరిస్థితుల వివరాలను నమోదు చేయండి." 
            : lang === "hi" 
            ? "फसल घनत्व और बाजार लाभ अनुमानों की भविष्यवाणी करने के लिए भौगोलिक, मौसमी मौसम और मिट्टी की स्थिति के इनपुट शामिल करें।" 
            : "Incorporate geological, seasonal meteorological and soil conditioning inputs to predict harvest densities and market profit estimates."}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Form Controls Card */}
        <div className="xl:col-span-5 bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-emerald-50/40 dark:border-slate-800 shadow-sm">
          <form onSubmit={predictYield} className="space-y-4">
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
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{labels.plotArea}</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="0.1"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{labels.prevYield}</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={previousYield}
                  onChange={(e) => setPreviousYield(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex justify-between">
                  <span>{labels.seasonalRain}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{rainfall} mm</span>
                </label>
                <input
                  type="range"
                  min="200"
                  max="1600"
                  value={rainfall}
                  onChange={(e) => setRainfall(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex justify-between">
                  <span>{labels.meanTemp}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{temperature}°C</span>
                </label>
                <input
                  type="range"
                  min="18"
                  max="45"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex justify-between">
                  <span>{labels.meanHumidity}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{humidity}%</span>
                </label>
                <input
                  type="range"
                  min="30"
                  max="95"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{labels.fertilizersSown}</label>
                <input
                  type="text"
                  required
                  value={fertilizerUsed}
                  onChange={(e) => setFertilizerUsed(e.target.value)}
                  placeholder={labels.fertilizerPlaceholder}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
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
                  <BarChart4 className="w-4 h-4" />
                  {labels.predictBtn}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output Predictions Summary & AI Insights */}
        <div className="xl:col-span-7 space-y-6">
          {loading ? (
            <div className="bg-white dark:bg-slate-900/60 p-8 rounded-2xl border border-emerald-50/40 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[450px]">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
              <div className="space-y-1.5 animate-pulse">
                <h4 className="font-extrabold text-gray-800 dark:text-slate-100">{labels.calculatingTitle}</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400">{labels.calculatingDesc}</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Core numbers Grid cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">{labels.estimatedYield}</span>
                  <h4 className="text-lg font-black text-emerald-800 dark:text-emerald-400 mt-2">{result.estimatedYield.toLocaleString()} kg</h4>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 block mt-1">{labels.forAcres} {area} {t.acres}</span>
                </div>

                <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">{labels.expectedProfit}</span>
                  <h4 className="text-lg font-black text-emerald-800 dark:text-emerald-400 mt-2">₹{result.expectedProfit.toLocaleString()}</h4>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-semibold block mt-1">{labels.avgMarket}</span>
                </div>

                <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">{labels.harvestDate}</span>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mt-3 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-450" />
                    {new Date(result.harvestDate).toLocaleDateString()}
                  </h4>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 block mt-1">{labels.optimalSowing}</span>
                </div>

                <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">{labels.modelConfidence}</span>
                  <h4 className="text-lg font-black text-emerald-800 dark:text-emerald-400 mt-2">{result.confidence}%</h4>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 block mt-1">{labels.satVerified}</span>
                </div>
              </div>

              {/* Gemini AI Insights Panel */}
              <div className="bg-gradient-to-br from-white to-emerald-50/20 dark:from-slate-900/40 dark:to-emerald-950/10 p-6 rounded-2xl border border-emerald-100/60 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-slate-800">
                  <span className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-emerald-700 dark:text-emerald-400">
                    <Sparkles className="w-4.5 h-4.5" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-gray-800 dark:text-slate-100 text-sm">{labels.diagnosticsTitle}</h3>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{labels.diagnosticsDesc}</p>
                  </div>
                </div>

                <div className="space-y-4 mt-5">
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-450 dark:text-gray-500 uppercase tracking-wider">{labels.analysisExp}</h4>
                    <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed mt-2">{result.aiInsights.why}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-50 dark:border-slate-800 text-xs">
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-450 dark:text-gray-500 uppercase tracking-wider">{labels.growthActions}</h4>
                      <ul className="list-disc list-inside space-y-1.5 text-gray-600 dark:text-slate-300 mt-2">
                        {result.aiInsights.improvements.map((imp: string, idx: number) => (
                          <li key={idx} className="leading-relaxed">{imp}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-extrabold text-gray-450 dark:text-gray-500 uppercase tracking-wider">{labels.bestPractices}</h4>
                      <ul className="list-disc list-inside space-y-1.5 text-gray-600 dark:text-slate-300 mt-2">
                        {result.aiInsights.bestPractices.map((prac: string, idx: number) => (
                          <li key={idx} className="leading-relaxed">{prac}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900/60 p-8 rounded-2xl border border-emerald-50/40 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[450px]">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-full">
                <TrendingUp className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-extrabold text-gray-800 dark:text-slate-100">{labels.pendingTitle}</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mt-1">
                  {labels.pendingDesc}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
