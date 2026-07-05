/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserProfile } from "../types";
import { Sprout, LogIn, UserPlus, HelpCircle, ArrowRight, Loader2, Phone, Mail, MapPin, Globe, CheckCircle2 } from "lucide-react";
import { translations } from "../translations";

interface AuthProps {
  onLoginSuccess: (profile: UserProfile) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form States
  const [email, setEmail] = useState("yegraddytharun@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [registerPassword, setRegisterPassword] = useState("admin123");
  const [name, setName] = useState("Tharun G");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [location, setLocation] = useState("Anantapur, Andhra Pradesh");
  const [language, setLanguage] = useState<"en" | "te" | "hi">("en");

  const t = translations[language] || translations.en;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(
        language === "te"
          ? "దయచేసి అన్ని వివరాలను పూరించండి."
          : language === "hi"
          ? "कृपया सभी फ़ील्ड भरें।"
          : "Please fill in all fields."
      );
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      onLoginSuccess(data.profile);
    } catch (err: any) {
      setLoading(false);
      setError("Server connection failed. Please try again.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !registerPassword || !phone || !location) {
      setError(
        language === "te"
          ? "అన్ని వివరాలు అవసరం."
          : language === "hi"
          ? "सभी फ़ील्ड आवश्यक हैं।"
          : "All fields are required."
      );
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: registerPassword,
          name,
          phone,
          location,
          language,
        }),
      });
      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setSuccess(
        language === "te"
          ? "నమోదు విజయవంతమైంది! లాగిన్ అవుతోంది..."
          : language === "hi"
          ? "पंजीकरण सफल! लॉग इन किया जा रहा है..."
          : "Registration successful! Logging in..."
      );

      setTimeout(() => {
        onLoginSuccess(data.profile);
      }, 1000);
    } catch (err: any) {
      setLoading(false);
      setError("Server connection failed. Please try again.");
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(
        language === "te"
          ? "ఈమెయిల్ అవసరం."
          : language === "hi"
          ? "ईमेल आवश्यक है।"
          : "Email is required."
      );
      return;
    }
    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(
        language === "te"
          ? "మీ ఈమెయిల్ చిరునామాకు పాస్‌వర్డ్ రీసెట్ లింక్ పంపబడింది!"
          : language === "hi"
          ? "आपके ईमेल पते पर एक पासवर्ड रीसेट लिंक भेजा गया है!"
          : "A password reset link has been sent to your email address!"
      );
      setTimeout(() => {
        setSuccess("");
        setMode("login");
      }, 3000);
    }, 1000);
  };

  return (
    <div id="auth-container" className="min-h-screen bg-[#F0F4F0] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative blurred agriculture circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#81C784]/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#2E7D32]/10 blur-3xl pointer-events-none animate-pulse" />

      <div className="w-full max-w-lg bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden relative">
        {/* Language selector dropdown at top left corner of form */}
        <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-full px-2 py-1 border border-white/20 flex items-center gap-1 z-10">
          <Globe className="w-3.5 h-3.5 text-emerald-300" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "te" | "hi")}
            className="bg-transparent border-none text-[11px] font-bold text-white focus:outline-none cursor-pointer pr-1"
          >
            <option value="en" className="text-slate-800">English</option>
            <option value="te" className="text-slate-800">తెలుగు</option>
            <option value="hi" className="text-slate-800">हिन्दी</option>
          </select>
        </div>

        {/* Banner header */}
        <div className="bg-gradient-to-r from-[#1B4332]/90 to-[#2E7D32]/90 p-8 pt-16 text-white relative border-b border-white/10">
          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20">
            <Sprout className="w-6 h-6 text-emerald-300 animate-bounce" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display">{t.appName}</h1>
          <p className="text-emerald-100/90 mt-2 text-sm max-w-md leading-relaxed">
            {t.tagline}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-4 bg-red-50/70 backdrop-blur-sm text-red-800 p-3.5 rounded-2xl text-sm border border-red-100 flex items-start gap-2">
              <span className="font-bold">{language === "te" ? "లోపం:" : language === "hi" ? "त्रुटि:" : "Error:"}</span> {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-emerald-50/70 backdrop-blur-sm text-emerald-900 p-3.5 rounded-2xl text-sm border border-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2 font-display">
                <LogIn className="w-5 h-5 text-[#2E7D32]" />
                {t.login}
              </h2>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-sm text-slate-800 bg-white/60 focus:bg-white/90 transition-all placeholder:text-slate-400 shadow-xs"
                    placeholder={t.emailPlaceholder}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {language === "te" ? "పాస్‌వర్డ్" : language === "hi" ? "पासवर्ड" : "Password"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-[#2E7D32] hover:underline font-bold"
                  >
                    {t.forgotPass}
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-sm text-slate-800 bg-white/60 focus:bg-white/90 transition-all placeholder:text-slate-400 shadow-xs"
                  placeholder={t.passwordPlaceholder}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#2E7D32] to-[#1B4332] hover:from-[#1B4332] hover:to-[#2E7D32] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer font-display mt-6"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.signinBtn}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{t.newToApp}</span>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-[#2E7D32] font-bold hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {t.createAccount}
                </button>
              </div>

              {/* Demo quick login indicator */}
              <div className="mt-4 p-3 bg-[#2E7D32]/5 rounded-xl border border-white/30 text-center backdrop-blur-xs">
                <span className="text-xs text-[#1B4332] font-bold block">{t.demoActive}</span>
                <span className="text-[11px] text-slate-600 mt-1 block">
                  {language === "te" ? "ముందుగా అమర్చిన ఈమెయిల్" : language === "hi" ? "पूर्व-निर्धारित ईमेल" : "Preset email"}: <span className="font-mono bg-white/60 px-1 py-0.5 rounded border border-white/40 text-[#2E7D32]">yegraddytharun@gmail.com</span> / {language === "te" ? "పాస్‌వర్డ్" : language === "hi" ? "पासवर्ड" : "Password"}: <span className="font-mono bg-white/60 px-1 py-0.5 rounded border border-white/40 text-[#2E7D32]">admin123</span>
                </span>
              </div>
            </form>
          )}

          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2 font-display">
                <UserPlus className="w-5 h-5 text-[#2E7D32]" />
                {t.register}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.fullName}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-sm text-slate-800 bg-white/60 focus:bg-white/90 transition-all placeholder:text-slate-400 shadow-xs"
                    placeholder="Tharun G"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.phone}</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-sm text-slate-800 bg-white/60 focus:bg-white/90 transition-all placeholder:text-slate-400 shadow-xs"
                      placeholder={t.phonePlaceholder}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-sm text-slate-800 bg-white/60 focus:bg-white/90 transition-all placeholder:text-slate-400 shadow-xs"
                    placeholder={t.emailPlaceholder}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {language === "te" ? "పాస్‌వర్డ్" : language === "hi" ? "पासवर्ड" : "Password"}
                </label>
                <input
                  type="password"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-sm text-slate-800 bg-white/60 focus:bg-white/90 transition-all placeholder:text-slate-400 shadow-xs"
                  placeholder={t.passwordPlaceholder}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {language === "te" ? "ప్రధాన వ్యవసాయ ప్రాంతం" : language === "hi" ? "प्राथमिक कृषि स्थान" : "Primary Farm Location"}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-sm text-slate-800 bg-white/60 focus:bg-white/90 transition-all placeholder:text-slate-400 shadow-xs"
                    placeholder={t.locationPlaceholder}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.preferredLang}</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as "en" | "te" | "hi")}
                    className="w-full pl-10 pr-4 py-2.5 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-sm text-slate-800 bg-white/60 focus:bg-white/90 transition-all shadow-xs cursor-pointer appearance-none"
                  >
                    <option value="en">English (default)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#2E7D32] to-[#1B4332] hover:from-[#1B4332] hover:to-[#2E7D32] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer font-display mt-6"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.registerBtn}
              </button>

              <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{t.alreadyRegistered}</span>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-[#2E7D32] font-bold hover:underline"
                >
                  {t.loginHere}
                </button>
              </div>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2 font-display">
                <HelpCircle className="w-5 h-5 text-[#2E7D32]" />
                {language === "te" ? "పాస్‌వర్డ్ రీసెట్" : language === "hi" ? "पासवर्ड रीसेट करें" : "Reset Password"}
              </h2>
              <p className="text-slate-500 text-xs leading-relaxed">
                {language === "te" ? "మీరు నమోదు చేసుకున్న రైతు ఈమెయిల్ నమోదు చేయండి, మీ ఖాతాను పునరుద్ధరించడానికి మేము భద్రతా లింక్‌ను పంపుతాము." : language === "hi" ? "अपना पंजीकृत किसान ईमेल दर्ज करें, और हम आपकी क्रेडेंशियल्स को रीसेट करने के लिए एक पुनर्प्राप्ति सुरक्षा लिंक भेजेंगे।" : "Enter your registered farmer email, and we will dispatch a recovery security link to reset your credentials."}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-sm text-slate-800 bg-white/60 focus:bg-white/90 transition-all placeholder:text-slate-400 shadow-xs"
                    placeholder="farmer@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#2E7D32] to-[#1B4332] hover:from-[#1B4332] hover:to-[#2E7D32] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer font-display mt-6"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === "te" ? "రీసెట్ లింక్ పంపు" : language === "hi" ? "रीसेट लिंक भेजें" : "Send Reset Link")}
              </button>

              <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-[#2E7D32] font-bold hover:underline"
                >
                  {language === "te" ? "మళ్లీ లాగిన్ పేజీకి" : language === "hi" ? "लॉगिन पर वापस जाएं" : "Back to Log In"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

