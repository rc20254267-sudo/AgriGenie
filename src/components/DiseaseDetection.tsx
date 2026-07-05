/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Camera, Upload, AlertCircle, RefreshCw, CheckCircle, Shield, Sparkles, BookOpen, Ban, Globe } from "lucide-react";
import { DiseaseRecord, UserProfile } from "../types";
import { translations, translateValue } from "../translations";

// Standard Sample Images for demo testing
const SAMPLE_LEAF_SAMPLES = [
  {
    name: "Rice Blast Leaf",
    crop: "Rice Paddy",
    url: "https://images.unsplash.com/photo-1592176372045-2d3b0d121367?auto=format&fit=crop&q=80&w=300"
  },
  {
    name: "Tomato Early Blight Leaf",
    crop: "Tomato Vine",
    url: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=300"
  },
  {
    name: "Healthy Wheat Leaf",
    crop: "Wheat",
    url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=300"
  }
];

interface DiseaseDetectionProps {
  onAddDiseaseRecord: (record: DiseaseRecord) => void;
  diseases: DiseaseRecord[];
  userProfile?: UserProfile;
  onLanguageChange?: (lang: "en" | "te" | "hi") => void;
}

export default function DiseaseDetection({ onAddDiseaseRecord, diseases, userProfile, onLanguageChange }: DiseaseDetectionProps) {
  const lang = userProfile?.language || "en";
  const t = translations[lang] || translations.en;

  // Localized string registry for additional fields
  const labels = {
    selectCrop: lang === "te" ? "పంట రకాన్ని ఎంచుకోండి" : lang === "hi" ? "फसल परिवार का चयन करें" : "Select Crop Family",
    quickDemo: lang === "te" ? "త్వరిత డెమో టెస్టింగ్ ఆకులు" : lang === "hi" ? "त्वरित डेमो परीक्षण पत्तियां" : "Quick Demo Testing Leaves",
    uploadSample: lang === "te" ? "ఆకు నమూనాను అప్‌లోడ్ చేయండి" : lang === "hi" ? "फसल पत्ती का नमूना अपलोड करें" : "Upload Crop Leaf Sample",
    analyzeBtn: lang === "te" ? "తెగులు కోసం ఆకును విశ్లేషించండి" : lang === "hi" ? "रोग के लिए पत्ती का विश्लेषण करें" : "Analyze Leaf for Disease",
    scanningText: lang === "te" ? "అగ్రిజెనీ స్కాన్ చేస్తోంది..." : lang === "hi" ? "एग्रीजीनी स्कैनिंग..." : "AgriGenie Scanning...",
    pendingTitle: lang === "te" ? "ఆకు స్కాన్ కోసం వేచి ఉంది" : lang === "hi" ? "लंबित रोग पत्ती स्कैन" : "Pending Pathology Leaf Scan",
    pendingDesc: lang === "te" 
      ? "ఎడమ ప్యానెల్‌లో పంట ఆకు చిత్రాన్ని అప్‌లోడ్ చేయండి లేదా మా డెమో ఆకులలో ఒకదాన్ని ఎంచుకోండి, ఆపై విశ్లేషించడానికి క్లిక్ చేయండి." 
      : lang === "hi" 
      ? "बाएं पैनल पर एक फसल पत्ती की छवि अपलोड करें या हमारे डेमो पत्ती प्रीसेट में से एक चुनें, फिर विश्लेषण करने के लिए क्लिक करें।" 
      : "Upload a crop leaf image on the left panel or choose one of our demo leaf presets, then click 'Analyze' to run Gemini diagnostics."
  };

  const [selectedCrop, setSelectedCrop] = useState("Rice Paddy");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [diagnosticReport, setDiagnosticReport] = useState<DiseaseRecord | null>(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setDiagnosticReport(null);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const selectSample = (sample: typeof SAMPLE_LEAF_SAMPLES[0]) => {
    setUploadedImage(sample.url);
    setSelectedCrop(sample.crop);
    setDiagnosticReport(null);
    setError("");
  };

  const triggerScan = async () => {
    if (!uploadedImage) {
      setError(
        lang === "te"
          ? "దయచేసి మొదట ఆకు చిత్రాన్ని అప్‌లోడ్ చేయండి లేదా శీఘ్ర నమూనా ఆకును ఎంచుకోండి."
          : lang === "hi"
          ? "कृपया पहले पत्ती की छवि अपलोड करें या एक त्वरित नमूना पत्ती चुनें।"
          : "Please upload a leaf image or select a quick sample leaf first."
      );
      return;
    }

    setScanning(true);
    setScanProgress(15);
    setError("");

    // Simulate standard scanning phases for polished UX
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 400);

    try {
      // Call server-side disease endpoint
      const res = await fetch("/api/gemini/disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: selectedCrop,
          imageBase64: uploadedImage.startsWith("data:") ? uploadedImage : null, // send base64 if user uploaded it
          lang,
        }),
      });

      clearInterval(interval);
      setScanProgress(100);

      if (!res.ok) {
        throw new Error("Diagnosis response failed");
      }

      const data = await res.json();
      
      const newRecord: DiseaseRecord = {
        id: "disease-" + Date.now(),
        crop: selectedCrop,
        imageUrl: uploadedImage,
        diseaseName: data.diseaseName || (lang === "te" ? "ఆకు మచ్చలు" : lang === "hi" ? "पत्ती के धब्बे" : "Leaf Spottings"),
        confidenceScore: data.confidenceScore || 85,
        cause: data.cause || (lang === "te" ? "శిలీంధ్ర బీజాలు" : lang === "hi" ? "कवक बीजाणु" : "Fungal spores"),
        symptoms: data.symptoms || (lang === "te" ? ["పసుపు వృత్తాకార మచ్చలు", "పొడి అంచులు"] : lang === "hi" ? ["पीले गोलाकार धब्बे", "सूखे किनारे"] : ["Yellow circular spots", "Dry edges"]),
        severity: data.severity || "Medium",
        prevention: data.prevention || (lang === "te" ? ["పైనుంచి నీరు పోయడం నివారించండి"] : lang === "hi" ? ["ऊपर से पानी देने से बचें"] : ["Avoid overhead watering"]),
        organicTreatment: data.organicTreatment || (lang === "te" ? "వేప కషాయం పిచికారీ చేయండి" : lang === "hi" ? "नीम के काढ़े का छिड़काव करें" : "Spray neem decoctions"),
        chemicalTreatment: data.chemicalTreatment || (lang === "te" ? "శిలీంధ్ర నాశిని పిచికారీ" : lang === "hi" ? "कवकनाशी छिड़काव" : "Fungicide spray"),
        recommendedFertilizer: data.recommendedFertilizer || (lang === "te" ? "NPK సమతుల్యత సర్దుబాటు" : lang === "hi" ? "एनपीके संतुलन समायोजन" : "NPK balance adjustment"),
        recoveryTime: data.recoveryTime || (lang === "te" ? "10 రోజులు" : lang === "hi" ? "10 दिन" : "10 Days"),
        thingsToAvoid: data.thingsToAvoid || (lang === "te" ? ["ఆకులను నేరుగా తడపకండి"] : lang === "hi" ? ["पत्तियों को सीधे गीला न करें"] : ["Do not water leaf foliage directly"]),
        timestamp: new Date().toISOString()
      };

      // Add to shared state
      onAddDiseaseRecord(newRecord);
      setDiagnosticReport(newRecord);
    } catch (err) {
      console.error(err);
      setError(
        lang === "te"
          ? "వ్యవసాయ AI సర్వర్ అధిక లోడ్‌ను ఎదుర్కొంటోంది. మళ్లీ ప్రయత్నిస్తోంది..."
          : lang === "hi"
          ? "कृषि एआई सर्वर पर लोड अधिक है। पुनः प्रयास कर रहा है..."
          : "Farming AI server is experiencing heavy loads. Re-trying..."
      );
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="pb-4 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{t.diseaseDetection}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === "te" 
              ? "పంట ఆకుల చిత్రాన్ని అప్‌లోడ్ చేయండి. అగ్రిజెనీ యొక్క విజువల్ ఇంటెలిజెన్స్ స్కాన్ చేసి చికిత్సా వ్యూహాలను అందిస్తుంది." 
              : lang === "hi" 
              ? "फसल की पत्तियों की एक छवि अपलोड करें। एग्रीजीनी की विजुअल इंटेलिजेंस स्कैन करेगी और पूरी रोकथाम और उपचार रणनीतियां प्रदान करेगी।" 
              : "Upload an image of crop leaves. AgriGenie's visual intelligence will scan and provide complete prevention and treatment strategies."}
          </p>
        </div>

        {/* Localized Language Selector option */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 p-1.5 rounded-xl self-end sm:self-auto shadow-xs">
          <span className="p-1 text-slate-400">
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </span>
          <select
            value={lang}
            onChange={(e) => onLanguageChange?.(e.target.value as "en" | "te" | "hi")}
            className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-4"
          >
            <option value="en" className="dark:bg-slate-900 dark:text-slate-100">English</option>
            <option value="te" className="dark:bg-slate-900 dark:text-slate-100">తెలుగు (Telugu)</option>
            <option value="hi" className="dark:bg-slate-900 dark:text-slate-100">हिन्दी (Hindi)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left scanning card controls */}
        <div className="xl:col-span-5 bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-emerald-50/40 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{labels.selectCrop}</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium"
            >
              <option value="Rice Paddy">{lang === "te" ? "వరి పంట" : lang === "hi" ? "धान" : "Rice Paddy"}</option>
              <option value="Tomato Vine">{lang === "te" ? "టమోటా" : lang === "hi" ? "टमाटर" : "Tomato Vine"}</option>
              <option value="Sweet Corn">{lang === "te" ? "మొక్కజొన్న" : lang === "hi" ? "मक्का" : "Sweet Corn"}</option>
              <option value="Cotton Crop">{lang === "te" ? "ప్రత్తి" : lang === "hi" ? "कपास" : "Cotton Crop"}</option>
              <option value="Wheat">{lang === "te" ? "గోధుమ" : lang === "hi" ? "गेहूं" : "Wheat"}</option>
              <option value="Chilli Crop">{lang === "te" ? "మిరప" : lang === "hi" ? "मिर्च" : "Chilli / Pepper"}</option>
            </select>
          </div>

          {/* Quick Preset leaf samples */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{labels.quickDemo}</span>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_LEAF_SAMPLES.map((sample, idx) => {
                const sampleName = 
                  sample.name === "Rice Blast Leaf" ? (lang === "te" ? "వరి బ్లాస్ట్ ఆకు" : lang === "hi" ? "धान ब्लास्ट पत्ती" : "Rice Blast") :
                  sample.name === "Tomato Early Blight Leaf" ? (lang === "te" ? "టమోటా తెగులు ఆకు" : lang === "hi" ? "टमाटर अगेती झुलसा" : "Tomato Early Blight") :
                  (lang === "te" ? "ఆరోగ్యకరమైన గోధుమ" : lang === "hi" ? "स्वस्थ गेहूं पत्ती" : "Healthy Wheat");

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectSample(sample)}
                    className={`
                      p-2 rounded-xl border text-center transition-all overflow-hidden shrink-0 cursor-pointer dark:bg-slate-800/40
                      ${uploadedImage === sample.url ? "border-emerald-600 dark:border-emerald-500 bg-emerald-50/20 font-bold" : "border-gray-100 dark:border-slate-800 hover:border-gray-200 bg-gray-50/40"}
                    `}
                  >
                    <img src={sample.url} alt={sampleName} className="w-10 h-10 object-cover mx-auto rounded-lg border border-gray-100 dark:border-slate-800 mb-1" />
                    <span className="text-[10px] text-gray-600 dark:text-slate-300 truncate block font-medium">{sampleName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{labels.uploadSample}</span>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all relative overflow-hidden group
                ${uploadedImage ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10" : "border-gray-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50/10"}
              `}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*" 
                className="hidden" 
              />
              
              {uploadedImage ? (
                <div className="relative">
                  <img src={uploadedImage} alt="Leaf Upload" className="w-full max-h-56 object-contain rounded-xl mx-auto border border-emerald-50 dark:border-slate-800" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <span className="text-white text-xs font-bold bg-emerald-700/80 py-1.5 px-3 rounded-lg flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse" />
                      {lang === "te" ? "చిత్రాన్ని మార్చండి" : lang === "hi" ? "तस्वीर बदलें" : "Change Leaf Image"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-700 dark:text-slate-200 block">
                      {lang === "te" ? "ఫోటోను ఇక్కడ వేయండి లేదా బ్రౌజ్ చేయండి" : lang === "hi" ? "पत्ती की तस्वीर यहाँ खींचें या खोजें" : "Drag leaf photo here or browse"}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 block">
                      {lang === "te"
                        ? "JPG, PNG ఫార్మాట్‌లకు 5MB వరకు మద్దతు ఇస్తుంది"
                        : lang === "hi"
                        ? "5MB तक के JPG, PNG प्रारूपों का समर्थन करता है"
                        : "Supports JPG, PNG formats up to 5MB"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50 text-xs flex gap-1.5 items-start">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={triggerScan}
            disabled={scanning || !uploadedImage}
            className="w-full py-3 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl text-sm font-extrabold shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {scanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {labels.scanningText} ({scanProgress}%)
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                {labels.analyzeBtn}
              </>
            )}
          </button>
        </div>

        {/* Right scanning report panels */}
        <div className="xl:col-span-7 space-y-6">
          {scanning ? (
            <div className="bg-white dark:bg-slate-900/60 p-8 rounded-2xl border border-emerald-50/40 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[500px]">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin flex items-center justify-center" />
              <div className="space-y-1.5 animate-pulse">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100">
                  {lang === "te" ? "అగ్రిజెనీ AI ఇంజిన్ ప్రాసెస్ చేస్తోంది" : lang === "hi" ? "एग्रीजीनी एआई इंजन प्रोसेसिंग" : "AgriGenie AI Engine Processing"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === "te" ? "కణ నష్టాలను వేరుచేస్తోంది, తెగుళ్ల డేటాబేస్‌తో పోల్చి చూస్తోంది..." : lang === "hi" ? "कोशिकीय घावों को अलग करना, रोगज़नक़ वर्गीकरण डेटाबेस के साथ तुलना करना..." : "Isolating cellular lesions, comparing with pathogen taxonomy databases..."}
                </p>
              </div>
            </div>
          ) : diagnosticReport ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Executive Diagnosis Summary Card */}
              <div className="bg-gradient-to-br from-white to-emerald-50/20 dark:from-slate-900/40 dark:to-emerald-950/10 p-6 rounded-2xl border border-emerald-100/60 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                  <div>
                    <span className={`
                      px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                      ${diagnosticReport.severity === "High" || diagnosticReport.severity === "అధిక" || diagnosticReport.severity === "उच्च" ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400" :
                        diagnosticReport.severity === "Medium" || diagnosticReport.severity === "మధ్యస్థం" || diagnosticReport.severity === "मध्यम" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400" :
                        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"}
                    `}>
                      {diagnosticReport.severity === "High" || diagnosticReport.severity === "అధిక" || diagnosticReport.severity === "उच्च" 
                        ? (lang === "te" ? "అధిక" : lang === "hi" ? "उच्च" : "High") 
                        : diagnosticReport.severity === "Medium" || diagnosticReport.severity === "మధ్యస్థం" || diagnosticReport.severity === "मध्यम"
                        ? (lang === "te" ? "మధ్యస్థం" : lang === "hi" ? "मध्यम" : "Medium")
                        : (lang === "te" ? "తక్కువ" : lang === "hi" ? "कम" : "Low")} {lang === "te" ? "తీవ్రత వ్యాప్తి" : lang === "hi" ? "तीव्रता प्रकोप" : "Severity Outbreak"}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{translateValue(diagnosticReport.diseaseName, lang)}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {lang === "te" ? "జెమిని విజన్ ఇంటెలిజెన్స్ ద్వారా నిర్ధారించబడింది" : lang === "hi" ? "जेमिनी विजन इंटेलिजेंस के माध्यम से निदान" : "Diagnosed via Gemini Vision Intelligence"}
                    </p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-center shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                      {lang === "te" ? "AI నమ్మకపు శాతం" : lang === "hi" ? "एआई सटीकता" : "AI Confidence"}
                    </span>
                    <span className="text-lg font-black text-emerald-800 dark:text-emerald-400">{diagnosticReport.confidenceScore}%</span>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {lang === "te" ? "ప్రధాన కారణం" : lang === "hi" ? "प्राथमिक कारण" : "Primary Cause"}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5">{translateValue(diagnosticReport.cause, lang)}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-50 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {lang === "te" ? "గుర్తించదగిన లక్షణాలు" : lang === "hi" ? "पहचाने जाने वाले लक्षण" : "Identifiable Symptoms"}
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300 mt-2">
                        {diagnosticReport.symptoms.map((s, idx) => (
                          <li key={idx}>{translateValue(s, lang)}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {lang === "te" ? "నివారణ సూచనలు" : lang === "hi" ? "निवारक निर्देश" : "Preventive Directives"}
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300 mt-2">
                        {diagnosticReport.prevention.map((p, idx) => (
                          <li key={idx}>{translateValue(p, lang)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Treatment Plans Side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-5 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 tracking-wider">
                    {lang === "te" ? "చికిత్స ప్రణాళిక" : lang === "hi" ? "उपचार कार्यक्रम" : "Treatment Schedule"}
                  </span>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm mt-1">
                    {lang === "te" ? "సేంద్రీయ జీవ చికిత్సలు" : lang === "hi" ? "जैविक उपचार" : "Organic Bio-Treatments"}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{translateValue(diagnosticReport.organicTreatment, lang)}</p>
                </div>

                <div className="bg-blue-50/50 dark:bg-blue-950/10 p-5 rounded-2xl border border-blue-100/50 dark:border-blue-900/30">
                  <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-400 tracking-wider">
                    {lang === "te" ? "చికిత్స ప్రణాళిక" : lang === "hi" ? "उपचार कार्यक्रम" : "Treatment Schedule"}
                  </span>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm mt-1">
                    {lang === "te" ? "రసాయన చికిత్సలు" : lang === "hi" ? "रासायनिक उपचार" : "Chemical Treatments"}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{translateValue(diagnosticReport.chemicalTreatment, lang)}</p>
                </div>
              </div>

              {/* Recovery Metadata details */}
              <div className="grid grid-cols-3 gap-3 bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs">
                <div className="text-center p-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                    {lang === "te" ? "సిఫార్సు చేసిన ఎరువు" : lang === "hi" ? "अनुशंसित फ़ीड" : "Recommended Feed"}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mt-1">{translateValue(diagnosticReport.recommendedFertilizer, lang)}</span>
                </div>
                <div className="text-center p-2 border-x border-gray-50 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                    {lang === "te" ? "కోలుకునే అంచనా సమయం" : lang === "hi" ? "अनुमानित सुधार" : "Est. Recovery"}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mt-1">{translateValue(diagnosticReport.recoveryTime, lang)}</span>
                </div>
                <div className="text-center p-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                    {lang === "te" ? "భద్రతా హెచ్చరిక" : lang === "hi" ? "सुरक्षा चेतावनी" : "Safety Warning"}
                  </span>
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <Ban className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-semibold block">{translateValue(diagnosticReport.thingsToAvoid?.[0] || "No flooding", lang)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900/60 p-8 rounded-2xl border border-emerald-50/40 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[500px]">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-full">
                <Camera className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100">{labels.pendingTitle}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
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
