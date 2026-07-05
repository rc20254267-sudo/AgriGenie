/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { User, Settings, Save, Globe, Phone, Mail, MapPin, CheckCircle, Bell, Shield, Sliders } from "lucide-react";
import { translations } from "../translations";

interface ProfileSettingsProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function ProfileSettings({ userProfile, onUpdateProfile }: ProfileSettingsProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");

  const lang = userProfile.language || "en";
  const t = translations[lang] || translations.en;

  // Profile Form states
  const [name, setName] = useState(userProfile.name);
  const [phone, setPhone] = useState(userProfile.phone);
  const [email, setEmail] = useState(userProfile.email);
  const [location, setLocation] = useState(userProfile.location);
  const [language, setLanguage] = useState<"en" | "te" | "hi">(userProfile.language);

  // Keep state in sync with updated props
  useEffect(() => {
    setName(userProfile.name);
    setPhone(userProfile.phone);
    setEmail(userProfile.email);
    setLocation(userProfile.location);
    setLanguage(userProfile.language || "en");
  }, [userProfile]);

  // Settings states
  const [rainAlerts, setRainAlerts] = useState(true);
  const [diseaseAlerts, setDiseaseAlerts] = useState(true);
  const [irrigationReminders, setIrrigationReminders] = useState(true);
  const [tempUnit, setTempUnit] = useState<"c" | "f">("c");

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      phone,
      email,
      location,
      language
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Title */}
      <div className="pb-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
            {lang === "te" ? "రైతు ప్రొఫైల్ & కాన్ఫిగరేషన్లు" : lang === "hi" ? "किसान प्रोफाइल और सेटिंग्स" : "Farmer Profile & Configurations"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === "te" 
              ? "ప్రొఫైల్ వివరాలు, నోటిఫికేషన్లు మరియు వాతావరణ ప్రదర్శన పారామితులను ఇక్కడ సెట్ చేయండి." 
              : lang === "hi" 
              ? "यहां प्रोफाइल विवरण, नोटिफिकेशन और मौसम प्रदर्शन पैरामीटर सेट करें।" 
              : "Configure profile coordinates, notifications, and meteorological display parameters."}
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 text-xs rounded-xl flex items-center gap-2 animate-pulse">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>
            {lang === "te" 
              ? "వ్యవసాయ ప్రొఫైల్ విజయవంతంగా సేవ్ చేయబడింది!" 
              : lang === "hi" 
              ? "कृषि प्रोफाइल सफलतापूर्वक सहेज लिया गया है!" 
              : "Farming configuration profile saved successfully!"}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === "profile" ? "bg-emerald-700 text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        >
          <User className="w-4 h-4" />
          {lang === "te" ? "రైతు ప్రొఫైల్ వివరాలు" : lang === "hi" ? "किसान प्रोफ़ाइल विवरण" : "Farmer Profile Details"}
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === "settings" ? "bg-emerald-700 text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        >
          <Settings className="w-4 h-4" />
          {lang === "te" ? "వ్యవస్థ సెట్టింగ్లు" : lang === "hi" ? "सिस्टम सेटिंग्स" : "System Settings"}
        </button>
      </div>

      {/* Profile Form */}
      {activeTab === "profile" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-emerald-50/40 dark:border-slate-800 shadow-sm">
          <form onSubmit={handleSubmitProfile} className="space-y-5">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm pb-2 border-b border-gray-50 dark:border-slate-800">
              {lang === "te" ? "భౌగోళిక రిజిస్ట్రీ సమాచారం" : lang === "hi" ? "भौगोलिक रजिस्ट्री जानकारी" : "Geological Registry Information"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {lang === "te" ? "రైతు పూర్తి పేరు" : lang === "hi" ? "किसान का पूरा नाम" : "Farmer Full Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {lang === "te" ? "ఫోన్ కాంటాక్ట్ నంబర్" : lang === "hi" ? "फ़ोन संपर्क नंबर" : "Phone Contact Number"}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {lang === "te" ? "ఇమెయిల్ చిరునామా" : lang === "hi" ? "ईमेल पता" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {lang === "te" ? "ప్రాథమిక వ్యవసాయ స్థానం" : lang === "hi" ? "प्राथमिक खेत का स्थान" : "Primary Farm Location"}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {lang === "te" ? "ప్రాధాన్య భాష" : lang === "hi" ? "पसंदीदा भाषा" : "Preferred Language"}
              </label>
              <div className="relative max-w-xs">
                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "en" | "te" | "hi")}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="en" className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">English (default)</option>
                  <option value="te" className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">తెలుగు (Telugu)</option>
                  <option value="hi" className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">हिन्दी (Hindi)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {lang === "te" ? "ప్రొఫైల్ సేవ్ చేయి" : lang === "hi" ? "प्रोफ़ाइल सहेजें" : "Save Profile Info"}
            </button>
          </form>
        </div>
      )}

      {/* Settings Form */}
      {activeTab === "settings" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-emerald-50/40 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm pb-2 border-b border-gray-50 dark:border-slate-800 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              {lang === "te" ? "పుష్ నోటిఫికేషన్లు & హెచ్చరికలు" : lang === "hi" ? "पुश नोटिफिकेशन और अलर्ट" : "Push Notifications & Telemetry Alerts"}
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 block">
                    {lang === "te" ? "వర్షపాత సూచన హెచ్చరికలు" : lang === "hi" ? "बारिश की संभावना की चेतावनी" : "Rain Probability Warnings"}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {lang === "te" ? "వర్షం పడే అవకాశం 60% దాటినప్పుడు హెచ్చరికలను పంపండి" : lang === "hi" ? "बारिश की संभावना 60% से अधिक होने पर चेतावनी दें" : "Trigger warnings when rain chance exceeds 60%"}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={rainAlerts}
                  onChange={() => setRainAlerts(!rainAlerts)}
                  className="w-4 h-4 text-emerald-600 bg-gray-100 rounded border-gray-300 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between py-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-gray-50 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 block">
                    {lang === "te" ? "తెగుళ్లు మరియు వ్యాధుల వ్యాప్తి" : lang === "hi" ? "रोग का प्रकोप" : "Pathological Disease Outbreaks"}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {lang === "te" ? "మీ ప్రాంతం సమీపంలో పంట తెగుళ్ల గుర్తులు కనిపించినప్పుడు తక్షణ హెచ్చరికలను పొందండి" : lang === "hi" ? "फसल रोग पाए जाने पर तुरंत अलर्ट प्राप्त करें" : "Receive instant alerts if crop spores are found near coordinates"}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={diseaseAlerts}
                  onChange={() => setDiseaseAlerts(!diseaseAlerts)}
                  className="w-4 h-4 text-emerald-600 bg-gray-100 rounded border-gray-300 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between py-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-gray-50 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 block">
                    {lang === "te" ? "నీటిపారుదల రిమైండర్లు" : lang === "hi" ? "सिंचाई रिमाइंडर" : "Irrigation Reminders"}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {lang === "te" ? "నేలలో తేమ శాతం తగ్గినప్పుడు ఉదయాన్నే నీటిపారుదల రిమైండర్‌లను పొందండి" : lang === "hi" ? "मिट्टी की नमी कम होने पर सुबह सिंचाई अलर्ट प्राप्त करें" : "Receive morning reminder alerts when soil moisture falls below thresholds"}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={irrigationReminders}
                  onChange={() => setIrrigationReminders(!irrigationReminders)}
                  className="w-4 h-4 text-emerald-600 bg-gray-100 rounded border-gray-300 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm pb-2 border-b border-gray-50 dark:border-slate-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              {lang === "te" ? "వాతావరణ ప్రదర్శనలు" : lang === "hi" ? "मौसम विज्ञान प्रदर्शन" : "Meteorological Displays"}
            </h3>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-200 block">
                  {lang === "te" ? "ఉష్ణోగ్రత కొలతలు" : lang === "hi" ? "तापमान मेट्रिक्स" : "Temperature Metrics"}
                </span>
                <span className="text-[10px] text-gray-400">
                  {lang === "te" ? "ఉష్ణోగ్రత ప్రదర్శన యూనిట్‌ను ఎంచుకోండి" : lang === "hi" ? "तापमान प्रदर्शन इकाई का चयन करें" : "Select display unit for heat indices"}
                </span>
              </div>
              <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTempUnit("c")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${tempUnit === "c" ? "bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-400 shadow-xs" : "text-gray-500"}`}
                >
                  {lang === "te" ? "సెల్సియస్ (°C)" : lang === "hi" ? "सेल्सियस (°C)" : "Celsius (°C)"}
                </button>
                <button
                  type="button"
                  onClick={() => setTempUnit("f")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${tempUnit === "f" ? "bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-400 shadow-xs" : "text-gray-500"}`}
                >
                  {lang === "te" ? "ఫారెన్‌హీట్ (°F)" : lang === "hi" ? "फ़ारेनहाइट (°F)" : "Fahrenheit (°F)"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-50 dark:border-emerald-900/40 rounded-2xl flex gap-3 text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed">
            <Shield className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                {lang === "te" ? "వ్యక్తిగత డేటా రక్షణ & భద్రత హామీ" : lang === "hi" ? "गोपनीयता और सुरक्षा गारंटी" : "Privacy & Security Guarantee"}
              </span>
              <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-1">
                {lang === "te" 
                  ? "మీ వ్యవసాయ రిజిస్టర్లు, నేల పరిస్థితులు మరియు తెగుళ్ల చరిత్ర సమాచారం సురక్షితంగా భద్రపరచబడతాయి. మీ వ్యక్తిగత వివరాలు ఎప్పుడూ బహిరంగ పరచబడవు." 
                  : lang === "hi" 
                  ? "आपके खेत के रिकॉर्ड, मिट्टी की स्थिति और रोग इतिहास का डेटा सुरक्षित रूप से संग्रहीत किया जाता है और इसे कभी भी सार्वजनिक रूप से साझा नहीं किया जाएगा।" 
                  : "Your farm registers, soil conditions, and disease history data is stored securely in compliance with regional agricultural parameters. Your local settings will never be exported to public registries."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
