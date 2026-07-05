/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, Globe, AlertCircle, Bot, CornerDownLeft, RefreshCw } from "lucide-react";
import { UserProfile, Farm, CropManagement, DiseaseRecord, YieldPrediction } from "../types";

// Quick Starter Prompts for Farmers (Fallback)
const SUGGESTED_PROMPTS_EN = [
  { text: "Best natural fertilizer for organic Rice?", tag: "Organic" },
  { text: "How do I prevent early blight in Tomato?", tag: "Protection" },
  { text: "Govt subsidy schemes for drip irrigation?", tag: "Finance" },
  { text: "What is the optimal sowing time for Wheat?", tag: "Sowing" }
];

interface AIAssistantProps {
  userProfile: UserProfile;
  farms: Farm[];
  crops: CropManagement[];
  diseases: DiseaseRecord[];
  predictions: YieldPrediction[];
  weatherData: any;
}

export default function AIAssistant({
  userProfile,
  farms,
  crops,
  diseases,
  predictions,
  weatherData
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; content: string; timestamp: string }>>([]);

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLanguage, setChatLanguage] = useState<"en" | "te" | "hi">(userProfile.language || "en");

  const chatEndRef = useRef<HTMLDivElement>(null);

  const lang = userProfile.language || "en";

  // Dynamic localization of starter prompts
  const localizedPrompts = lang === "te" ? [
    { text: "సేంద్రీయ వరి కోసం ఉత్తమ సహజ ఎరువు ఏది?", tag: "సేంద్రీయ" },
    { text: "టమోటాలో ముందస్తు తెగులును ఎలా నివారించాలి?", tag: "రక్షణ" },
    { text: "డ్రిప్ నీటిపారుదల కోసం ప్రభుత్వ రాయితీ పథకాలు?", tag: "ఆర్థిక" },
    { text: "గోధుమల నాటడానికి సరైన సమయం ఏది?", tag: "నాటడం" }
  ] : lang === "hi" ? [
    { text: "जैविक धान के लिए सबसे अच्छा प्राकृतिक उर्वरक कौन सा है?", tag: "जैविक" },
    { text: "टमाटर में अगेती झुलसा रोग से कैसे बचाव करें?", tag: "सुरक्षा" },
    { text: "ड्रिप सिंचाई के लिए सरकारी सब्सिडी योजनाएं?", tag: "वित्त" },
    { text: "गेहूं की बुआई का सही समय क्या है?", tag: "बुआई" }
  ] : SUGGESTED_PROMPTS_EN;

  // Sync active language selection from global profile
  useEffect(() => {
    setChatLanguage(lang);
  }, [lang]);

  // Sync / translate initial bot welcome message
  useEffect(() => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].role === "ai")) {
      const greeting = lang === "te"
        ? `హలో ${userProfile.name}! నేను అగ్రిజెనీని, మీ వ్యక్తిగత స్మార్ట్ వ్యవసాయ సహాయకుడిని. నేను **${userProfile.location}** లోని మీ వ్యవసాయ వివరాలతో అనుసంధానించబడ్జాను. పంట ప్రణాళిక, నేల పోషణ, క్రిమిసంహారకాలు లేదా ప్రభుత్వ పథకాల గురించి నన్ను ఏదైనా అడగండి.`
        : lang === "hi"
        ? `नमस्ते ${userProfile.name}! मैं एग्रीजीनी हूं, आपका व्यक्तिगत स्मार्ट कृषि सहायक। मैं **${userProfile.location}** में आपके खेत के विवरण के साथ सिंक्रनाइज़ हूं। मुझसे फसल योजना, मिट्टी संवर्धन, कीट नियंत्रण या सरकारी कृषि सब्सिडी के बारे में कोई भी प्रश्न पूछें।`
        : `Hello ${userProfile.name}! I am AgriGenie, your personal smart farming intelligence assistant. I have synchronized with your current farm coordinates in **${userProfile.location}**. Ask me any questions about crop planning, soil enrichment, pest controls, or government farming subsidies.`;

      setMessages([
        {
          role: "ai",
          content: greeting,
          timestamp: new Date().toISOString(),
        }
      ]);
    }
  }, [lang, userProfile.name, userProfile.location]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    // Add user message
    const userMsg = {
      role: "user" as const,
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      // Assemble full contextual information payload to send to the backend Express route
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role === "user" ? "user" : "model", content: m.content })),
          farmerDetails: {
            ...userProfile,
            language: chatLanguage // override with active chat selection
          },
          farmDetails: farms,
          weather: weatherData,
          currentCrops: crops,
          diseases: diseases,
          yieldPredictions: predictions,
        }),
      });

      if (!response.ok) {
        throw new Error("Assistant response failed");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: data.content,
          timestamp: new Date().toISOString(),
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: lang === "te"
            ? "క్షమించండి, నా ఉపగ్రహ అనుసంధానానికి అంతరాయం కలిగింది. దయచేసి కాసేపటి తర్వాత మళ్లీ ప్రయత్నించండి."
            : lang === "hi"
            ? "क्षमा करें, मेरा सैटेलाइट कनेक्शन बाधित हो गया है। कृपया कुछ क्षणों के बाद पुनः प्रयास करें।"
            : "I apologize, my satellite connection is slightly interrupted. Check back in a few moments, or ask simple questions.",
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col justify-between bg-white/60 backdrop-blur-lg border border-white/50 rounded-3xl shadow-sm overflow-hidden">
      {/* Active Header bar with language selection */}
      <div className="p-4 border-b border-white/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#2E7D32] rounded-xl text-white shadow-lg shadow-[#2E7D32]/10">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm font-display">
              {lang === "te" ? "అగ్రిజెనీ సెంట్రల్ ఇంటెలిజెన్స్" : lang === "hi" ? "एग्रीजीनी सेंट्रल इंटेलिजेंस" : "AgriGenie Central Intelligence"}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-ping" />
              <span className="text-[10px] text-slate-500 font-medium">
                {lang === "te" ? "వ్యవసాయ నిపుణులు ఆన్‌లైన్‌లో ఉన్నారు" : lang === "hi" ? "कृषि विशेषज्ञ ऑनलाइन" : "Farming Expert Online"}
              </span>
            </div>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1.5 bg-white/50 p-1.5 rounded-xl border border-white/40 backdrop-blur-xs">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <button
            onClick={() => setChatLanguage("en")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${chatLanguage === "en" ? "bg-[#2E7D32] text-white" : "text-slate-500 hover:bg-white/40"}`}
          >
            English
          </button>
          <button
            onClick={() => setChatLanguage("te")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${chatLanguage === "te" ? "bg-[#2E7D32] text-white" : "text-slate-500 hover:bg-white/40"}`}
          >
            తెలుగు
          </button>
          <button
            onClick={() => setChatLanguage("hi")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${chatLanguage === "hi" ? "bg-[#2E7D32] text-white" : "text-slate-500 hover:bg-white/40"}`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {/* Messages Scroll viewport */}
      <div className="flex-1 p-5 overflow-y-auto bg-slate-100/10 space-y-5">
        {messages.map((m, idx) => {
          const isAI = m.role === "ai";
          return (
            <div 
              key={idx} 
              className={`flex gap-3 max-w-2xl ${isAI ? "" : "ml-auto flex-row-reverse"}`}
            >
              <div className={`p-2.5 rounded-full shrink-0 flex items-center justify-center w-10 h-10 shadow-sm ${isAI ? "bg-[#2E7D32] text-white" : "bg-[#81C784] text-[#1B4332] font-bold"}`}>
                {isAI ? <Bot className="w-5 h-5" /> : userProfile.name.charAt(0).toUpperCase()}
              </div>

              <div className={`space-y-1 ${isAI ? "" : "text-right"}`}>
                <div className={`
                  p-4 rounded-2xl shadow-xs text-xs leading-relaxed whitespace-pre-line
                  ${isAI 
                    ? "bg-white/80 border border-white/40 text-slate-700 rounded-tl-none font-medium backdrop-blur-md" 
                    : "bg-[#2E7D32] text-white rounded-tr-none font-medium text-left shadow-sm"}
                `}>
                  {m.content}
                </div>
                <span className="text-[9px] text-slate-400 px-1 font-mono">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-2xl">
            <div className="p-2.5 rounded-full bg-[#2E7D32] text-white shrink-0 flex items-center justify-center w-10 h-10 shadow-sm">
              <Bot className="w-5 h-5 animate-spin" />
            </div>
            <div className="bg-white/85 border border-white/40 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-xs backdrop-blur-md">
              <span className="text-xs text-slate-500 font-bold">
                {lang === "te" ? "అగ్రిజెనీ సమాచారాన్ని అధ్యయనం చేస్తోంది..." : lang === "hi" ? "एग्रीजीनी संदर्भ का अध्ययन कर रहा है..." : "AgriGenie is studying context..."}
              </span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-bounce delay-200" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-bounce delay-300" />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      {messages.length === 1 && (
        <div className="px-5 py-3 border-t border-white/20 bg-white/30 backdrop-blur-md flex flex-col gap-2 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {lang === "te" ? "సాధారణ ప్రశ్నలు" : lang === "hi" ? "आम सवाल" : "Common Questions"}
          </span>
          <div className="flex flex-wrap gap-2">
            {localizedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt.text)}
                className="py-1.5 px-3 bg-white/50 hover:bg-white/80 text-[#2E7D32] text-[10px] font-bold rounded-xl border border-white/40 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span>{prompt.text}</span>
                <span className="text-[9px] text-emerald-500 font-extrabold uppercase">({prompt.tag})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message input bar */}
      <div className="p-4 border-t border-white/20 bg-white/30 backdrop-blur-md shrink-0">
        <div className="relative flex items-center bg-white/60 border border-white/50 focus-within:border-[#2E7D32] focus-within:ring-2 focus-within:ring-[#2E7D32]/20 rounded-2xl p-1.5 transition-all">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              lang === "te" 
                ? "అగ్రిజెనీని తెలుగులో అడగండి..." 
                : lang === "hi" 
                ? "एग्रीजीनी से हिन्दी में पूछें..." 
                : "Ask AgriGenie in English..."
            }
            className="flex-1 px-4 bg-transparent focus:outline-none text-xs text-slate-800 placeholder-slate-400"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || loading}
            className="p-3 bg-[#2E7D32] hover:bg-[#1B4332] disabled:bg-slate-200/50 disabled:text-slate-400 text-white rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 px-1">
          <span>
            {lang === "te" 
              ? "కేంద్ర వ్యవసాయ నిపుణుడు సక్రియంగా ఉన్నారు • పూర్తిగా స్థానికీకరించిన సలహా" 
              : lang === "hi" 
              ? "केंद्रीय कृषि विशेषज्ञ सक्रिय हैं • पूरी तरह से स्थानीयकृत सलाह" 
              : "Central agronomical expert active • Fully localized advice"}
          </span>
          <span className="flex items-center gap-1 text-[#2E7D32] font-bold">
            <CornerDownLeft className="w-3 h-3" />
            {lang === "te" ? "పంపడానికి ఎంటర్ చేయండి" : lang === "hi" ? "भेजने के लिए एंटर दबाएं" : "Enter to Send"}
          </span>
        </div>
      </div>
    </div>
  );
}
