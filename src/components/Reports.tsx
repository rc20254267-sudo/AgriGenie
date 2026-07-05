/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FileText, Sparkles, Download, CheckCircle, Loader2, ArrowRight, BookOpen, User, Sprout, TrendingUp, DollarSign } from "lucide-react";
import { Farm, CropManagement, Expense, DiseaseRecord, YieldPrediction, UserProfile } from "../types";
import { translations } from "../translations";

interface ReportsProps {
  farms: Farm[];
  crops: CropManagement[];
  expenses: Expense[];
  diseases: DiseaseRecord[];
  predictions: YieldPrediction[];
  weatherData: any;
  userProfile?: UserProfile;
}

export default function Reports({
  farms,
  crops,
  expenses,
  diseases,
  predictions,
  weatherData,
  userProfile
}: ReportsProps) {
  const lang = userProfile?.language || "en";
  const t = translations[lang] || translations.en;

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Fully localized dictionary for every piece of UI text in the Reports component
  const labels = {
    desc: lang === "te" 
      ? "రియల్ టైమ్ క్షేత్ర విశ్లేషణలు, వ్యవసాయ కొలమానాలు మరియు కార్యాచరణ ఖర్చులను ఒక నివేదికగా రూపొందించండి." 
      : lang === "hi" 
      ? "वास्तविक समय के भूवैज्ञानिक निदान, कृषि मेट्रिक्स और परिचालन खर्चों को एक कार्यकारी प्रमाणित रिपोर्ट में संकलित करें।" 
      : "Compile real-time geological diagnostics, agricultural metrics, and operational expenses into an executive certified report.",
    exportPdf: lang === "te" ? "PDF నివేదికను డౌన్‌లోడ్ చేయి" : lang === "hi" ? "पीडीएफ रिपोर्ट निर्यात करें" : "Export as PDF Report",
    successMsg: lang === "te" 
      ? "నివేదిక విజయవంతంగా రూపొందించబడింది! బ్రౌజర్ ప్రింట్ డాక్యుమెంట్ ఓపెన్ అవుతోంది." 
      : lang === "hi" 
      ? "रिपोर्ट संकलन सफल! ब्राउज़र प्रिंट दस्तावेज लेआउट खोला जा रहा है।" 
      : "Report compilation successful! Opening browser print document layout.",
    generateTitle: lang === "te" ? "AI ధృవీకరించబడిన క్షేత్ర ఆరోగ్య తనిఖీని రూపొందించండి" : lang === "hi" ? "एआई प्रमाणित कृषि स्वास्थ्य ऑडिट उत्पन्न करें" : "Generate AI Certified Farm Health Audit",
    generateDesc: lang === "te"
      ? "యాక్టివ్ పంట దశలు, వాతావరణ పరిస్థితులు, ఖర్చులు మరియు తెగుళ్ల చరిత్రను సేకరిస్తుంది. జెమిని AI ముఖ్య వ్యవసాయ సలహాదారుగా నివేదికను రూపొందిస్తుంది."
      : lang === "hi"
      ? "सक्रिय फसल चरणों, मौसमी मौसम, खर्चों और पौधों की विकृति के इतिहास को एकत्रित करता है। जेमिनी एआई कार्यकारी प्रदर्शन समीक्षा तैयार करने के लिए मुख्य कृषि लेखा परीक्षक के रूप में कार्य करता है।"
      : "Aggregates active crop stages, seasonal microclimates, expenditures, and plant pathology histories. Gemini AI acts as the chief agricultural auditor to formulate executive performance reviews.",
    compiling: lang === "te" ? "పొలం పారామితులను సేకరిస్తోంది..." : lang === "hi" ? "कृषि मापदंडों का संकलन..." : "Compiling Farm Parameters...",
    compileBtn: lang === "te" ? "నివేదికను రూపొందించు" : lang === "hi" ? "कार्यकारी रिपोर्ट संकलित करें" : "Compile Executive Report",
    auditTitle: lang === "te" ? "అగ్రిజెనీ ముఖ్య వ్యవసాయ నివేదిక" : lang === "hi" ? "एग्रीजीनी कार्यकारी कृषि ऑडिट" : "AGRIGENIE EXECUTIVE FARM AUDIT",
    certifiedAdvisory: lang === "te" ? "ధృవీకరించబడిన వ్యవసాయ సలహా నివేదిక" : lang === "hi" ? "प्रमाणित कृषि सलाहकार रिपोर्ट" : "Certified Advisory Report",
    auditeePlot: lang === "te" ? "పొలం వివరాలు" : lang === "hi" ? "परीक्षणित फार्म प्लॉट" : "Auditee Farm Plot",
    dateOfComp: lang === "te" ? "నివేదిక తేదీ" : lang === "hi" ? "संकलन की तिथि" : "Date of Compilation",
    plotSize: lang === "te" ? "పొలం పరిమాణం" : lang === "hi" ? "प्लॉट का आकार" : "Plot Size",
    activeCrop: lang === "te" ? "ప్రస్తుత పంట" : lang === "hi" ? "सक्रिय फसल" : "Active Crop",
    operationalCosts: lang === "te" ? "నిర్వహణ ఖర్చులు" : lang === "hi" ? "परिचालन लागत" : "Operational Costs",
    forecastYield: lang === "te" ? "ఆశించిన ఆదాయం" : lang === "hi" ? "पूर्वानुमानित लाभ" : "Forecast Yield",
    aiEvaluation: lang === "te" ? "AI నిపుణుడి తెగులు & నేల విశ్లేషణ" : lang === "hi" ? "एआई कार्यकारी रोगविज्ञान और मिट्टी मूल्यांकन" : "AI Executive Pathology & Soil Evaluation",
    criticalAdvisory: lang === "te" ? "ముఖ్యమైన వ్యవసాయ సలహాలు & ప్రమాద నివారణలు" : lang === "hi" ? "महत्वपूर्ण सलाहकार निर्देश और जोखिम शमन" : "Critical Advisory Directives & Risk Mitigations",
    compiledVia: lang === "te" ? "రూపొందించబడింది: అగ్రిజెనీ సిస్టమ్స్ AI క్లౌడ్" : lang === "hi" ? "द्वारा संकलित: एग्रीजीनी सिस्टम्स एआई क्लाउड" : "Compiled via: AgriGenie Systems AI Cloud",
    authorizedSign: lang === "te" ? "అధికారిక AI సంతకం" : lang === "hi" ? "अधिकृत एआई हस्ताक्षर" : "Authorized AI Signature",
    est: lang === "te" ? "అంచనా" : lang === "hi" ? "अनुमानित" : "Est"
  };

  // Totals calculations
  const totalExpenses = expenses.reduce((acc, e) => {
    return acc + Number(e.seedCost) + Number(e.fertilizerCost) + Number(e.laborCost) + Number(e.equipmentCost);
  }, 0);

  const activeFarm = farms[0];
  const activeCropName = crops[0]?.cropName || "Paddy Rice";

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gemini/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farm: activeFarm,
          crops: crops,
          expenses: expenses,
          weather: weatherData,
          diseases: diseases,
          yieldPredictions: predictions,
          lang, // pass the lang variable to backend!
        })
      });

      if (!res.ok) throw new Error("Report generation failed");
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
      window.print(); // Triggers high quality browser print styled via CSS
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="pb-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{t.aiReports}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {labels.desc}
          </p>
        </div>
        {report && (
          <button
            onClick={triggerExportPDF}
            disabled={exporting}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {labels.exportPdf}
          </button>
        )}
      </div>

      {exportSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 text-xs rounded-xl flex items-center gap-2 print:hidden animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>
            {labels.successMsg}
          </span>
        </div>
      )}

      {/* Main viewport */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 print:block">
        {/* Left Side: Actions/Summary when report is not yet compiled */}
        {!report && (
          <div className="xl:col-span-12 bg-white dark:bg-slate-900/60 p-8 rounded-2xl border border-emerald-50/40 dark:border-slate-800 shadow-sm text-center max-w-2xl mx-auto flex flex-col items-center gap-4 print:hidden my-8">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-full">
              <FileText className="w-12 h-12" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-800 dark:text-slate-150 text-lg">{labels.generateTitle}</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                {labels.generateDesc}
              </p>
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="py-3 px-6 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 disabled:text-gray-400 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {labels.compiling}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {labels.compileBtn}
                </>
              )}
            </button>
          </div>
        )}

        {/* Detailed Report Viewport (Formatted like an official document) */}
        {report && (
          <div className="xl:col-span-12 bg-white dark:bg-slate-900/60 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-8 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
            {/* Report Header Branding */}
            <div className="flex justify-between items-start border-b-2 border-emerald-800 pb-6">
              <div>
                <h1 className="text-2xl font-black text-emerald-800 dark:text-emerald-400 tracking-tight">{labels.auditTitle}</h1>
                <p className="text-[10px] uppercase font-extrabold text-gray-400 dark:text-gray-500 mt-1">{labels.certifiedAdvisory}</p>
                <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-gray-500">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">{labels.auditeePlot}</span>
                    <span className="font-bold text-gray-800 dark:text-slate-100">{activeFarm?.name || (lang === "te" ? "హరిత క్షేత్రం" : lang === "hi" ? "हरित मैदान" : "Green Meadows Plot")}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">{labels.dateOfComp}</span>
                    <span className="font-bold text-gray-800 dark:text-slate-100">{new Date().toLocaleDateString(lang === "te" ? "te-IN" : lang === "hi" ? "hi-IN" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="p-2 bg-emerald-700 text-white rounded-xl inline-block text-center font-bold text-xs shadow-md shadow-emerald-700/10">
                  AgriGenie AI
                </div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">Ref ID: {activeFarm?.id || "FARM-GENIE-987"}</div>
              </div>
            </div>

            {/* Metrics quick display */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-gray-100 dark:border-slate-800">
              <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <Sprout className="w-3 h-3 text-emerald-600" /> {labels.plotSize}
                </span>
                <span className="text-sm font-extrabold text-gray-700 dark:text-slate-200 block mt-1">{activeFarm?.area || "2.5"} {t.acres}</span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" /> {labels.activeCrop}
                </span>
                <span className="text-sm font-extrabold text-gray-700 dark:text-slate-200 block mt-1 truncate">
                  {crops[0] ? (
                    lang === "te" && crops[0].cropName === "Rice Paddy" ? "వరి పంట" :
                    lang === "hi" && crops[0].cropName === "Rice Paddy" ? "धान" :
                    crops[0].cropName
                  ) : (
                    lang === "te" ? "వరి పంట" : lang === "hi" ? "धान" : "Rice Paddy"
                  )}
                </span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-600" /> {labels.operationalCosts}
                </span>
                <span className="text-sm font-extrabold text-gray-700 dark:text-slate-200 block mt-1">₹{(totalExpenses || 28400).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" /> {labels.forecastYield}
                </span>
                <span className="text-sm font-extrabold text-gray-700 dark:text-slate-200 block mt-1">₹{(predictions[0]?.expectedProfit || 120000).toLocaleString()} {labels.est}</span>
              </div>
            </div>

            {/* AI Auditor Executive Summary */}
            <div className="py-6 space-y-3">
              <h3 className="font-extrabold text-gray-800 dark:text-slate-200 text-sm flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                {labels.aiEvaluation}
              </h3>
              <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed bg-emerald-50/20 dark:bg-emerald-950/5 p-4 rounded-xl border border-emerald-50 dark:border-slate-800">
                {report.summary}
              </p>
            </div>

            {/* Directives / Suggestions List */}
            <div className="py-6 border-t border-gray-100 dark:border-slate-800 space-y-4">
              <h3 className="font-extrabold text-gray-800 dark:text-slate-200 text-sm flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                {labels.criticalAdvisory}
              </h3>
              <div className="space-y-3">
                {report.aiSuggestions.map((sug: string, idx: number) => (
                  <div key={idx} className="flex gap-3 items-start text-xs text-gray-600 dark:text-slate-300">
                    <span className="w-5 h-5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 rounded-full font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{sug}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase">
              <div>
                <span>{labels.compiledVia}</span>
              </div>
              <div className="text-right">
                <div className="w-24 h-1 border-b border-emerald-800 mb-2" />
                <span>{labels.authorizedSign}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
