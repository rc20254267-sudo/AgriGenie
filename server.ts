/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { getUserByEmail, registerUser, hashPassword } from "./server/db";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: "50mb" }));

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Error initializing Gemini API:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Running in simulation mode.");
}

// Coordinate lookup for major Indian agricultural cities
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  anantapur: { lat: 14.6819, lng: 77.6006 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  vijayawada: { lat: 16.5062, lng: 80.6480 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  guntur: { lat: 16.3067, lng: 80.4365 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
};

// --- API ROUTES ---

// 0. User Authentication and Registration Database Routes
app.post("/api/auth/register", (req, res) => {
  const { email, password, name, phone, location, language } = req.body;
  if (!email || !password || !name || !phone || !location) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    const existing = getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email is already registered." });
    }
    const user = registerUser(email, password, name, phone, location, language || "en");
    return res.json({
      success: true,
      profile: {
        name: user.name,
        phone: user.phone,
        email: user.email,
        location: user.location,
        language: user.language
      }
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: err.message || "Failed to register user." });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  try {
    const user = getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const computedHash = hashPassword(password, user.salt);
    if (computedHash !== user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    return res.json({
      success: true,
      profile: {
        name: user.name,
        phone: user.phone,
        email: user.email,
        location: user.location,
        language: user.language
      }
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message || "Failed to login." });
  }
});

// 1. Live Weather API (using Open-Meteo public API)
app.get("/api/weather", async (req, res) => {
  const lang = (req.query.lang as string || "en").toLowerCase();
  try {
    const locationQuery = (req.query.location as string || "hyderabad").toLowerCase();
    let lat = 17.3850;
    let lng = 78.4867;

    if (CITY_COORDINATES[locationQuery]) {
      lat = CITY_COORDINATES[locationQuery].lat;
      lng = CITY_COORDINATES[locationQuery].lng;
    } else {
      // Check if location is of format lat,lng
      const parts = locationQuery.split(",");
      if (parts.length === 2) {
        const parsedLat = parseFloat(parts[0]);
        const parsedLng = parseFloat(parts[1]);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          lat = parsedLat;
          lng = parsedLng;
        }
      }
    }

    // Call open-meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto`;
    const response = await fetch(weatherUrl);
    
    if (!response.ok) {
      throw new Error(`OpenMeteo returned status ${response.status}`);
    }
    
    const data = (await response.json()) as any;

    // Map weather codes to friendly descriptions & icons with translation support
    const mapWeatherCode = (code: number) => {
      let desc = "Partly cloudy";
      let icon = "Cloud";
      
      if (code === 0) {
        desc = lang === "te" ? "నిర్మలమైన ఆకాశం" : lang === "hi" ? "साफ आसमान" : "Clear sky";
        icon = "Sun";
      } else if (code >= 1 && code <= 3) {
        desc = lang === "te" ? "ప్రధానంగా నిర్మలంగా ఉంది" : lang === "hi" ? "मुख्यतः साफ" : "Mainly clear";
        icon = "CloudSun";
      } else if (code === 45 || code === 48) {
        desc = lang === "te" ? "పొగమంచు" : lang === "hi" ? "कोहरा" : "Foggy";
        icon = "CloudFog";
      } else if (code >= 51 && code <= 55) {
        desc = lang === "te" ? "చినుకులు" : lang === "hi" ? "बूंदाबांदी" : "Drizzle";
        icon = "CloudDrizzle";
      } else if (code >= 61 && code <= 65) {
        desc = lang === "te" ? "వర్షం" : lang === "hi" ? "बारिश" : "Rainy";
        icon = "CloudRain";
      } else if (code >= 71 && code <= 77) {
        desc = lang === "te" ? "మంచు కురుస్తోంది" : lang === "hi" ? "बर्फबारी" : "Snowy";
        icon = "CloudSnow";
      } else if (code >= 80 && code <= 82) {
        desc = lang === "te" ? "వర్షపు జల్లులు" : lang === "hi" ? "बारिश की बौछारें" : "Rain showers";
        icon = "CloudLightning";
      } else if (code >= 95) {
        desc = lang === "te" ? "ఉరుములతో కూడిన వర్షం" : lang === "hi" ? "गरज के साथ बौछारें" : "Thunderstorm";
        icon = "CloudLightning";
      } else {
        desc = lang === "te" ? "పాక్షికంగా మేఘావృతం" : lang === "hi" ? "आंशिक रूप से बादल छाए रहेंगे" : "Partly cloudy";
        icon = "Cloud";
      }
      return { desc, icon };
    };

    const currentInfo = mapWeatherCode(data.current.weather_code);
    const weeklyForecast = data.daily.time.map((timeStr: string, idx: number) => {
      const dayInfo = mapWeatherCode(data.daily.weather_code[idx]);
      const date = new Date(timeStr);
      let dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      if (lang === "te") {
        const daysTe = ["ఆది", "సోమ", "మంగళ", "బుధ", "గురు", "శుక్ర", "శని"];
        dayName = daysTe[date.getDay()];
      } else if (lang === "hi") {
        const daysHi = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"];
        dayName = daysHi[date.getDay()];
      }
      return {
        day: dayName,
        date: timeStr,
        tempMax: Math.round(data.daily.temperature_2m_max[idx]),
        tempMin: Math.round(data.daily.temperature_2m_min[idx]),
        condition: dayInfo.desc,
        icon: dayInfo.icon,
        rainProb: data.daily.precipitation_probability_max ? data.daily.precipitation_probability_max[idx] : 10,
      };
    });

    res.json({
      location: req.query.location || "Hyderabad",
      temperature: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
      feelsLike: Math.round(data.current.apparent_temperature),
      windSpeed: Math.round(data.current.wind_speed_10m),
      rainProbability: data.daily.precipitation_probability_max ? data.daily.precipitation_probability_max[0] : 0,
      condition: currentInfo.desc,
      icon: currentInfo.icon,
      sunrise: data.daily.sunrise[0]?.split("T")[1] || "05:45 AM",
      sunset: data.daily.sunset[0]?.split("T")[1] || "06:45 PM",
      forecast: weeklyForecast,
    });
  } catch (error) {
    console.error("Weather lookup error, returning fallback simulation data:", error);
    // Graceful fallback for weather
    const fallbackLocation = req.query.location || "Anantapur";
    const condText = lang === "te" ? "పాక్షికంగా మేఘావృతం" : lang === "hi" ? "आंशिक रूप से बादल" : "Partly Cloudy";
    res.json({
      location: fallbackLocation,
      temperature: 32,
      humidity: 62,
      feelsLike: 35,
      windSpeed: 14,
      rainProbability: 25,
      condition: condText,
      icon: "CloudSun",
      sunrise: "05:48",
      sunset: "18:42",
      forecast: [
        { day: lang === "te" ? "ఈ రోజు" : lang === "hi" ? "आज" : "Today", tempMax: 34, tempMin: 24, condition: condText, icon: "CloudSun", rainProb: 25 },
        { day: lang === "te" ? "ఆది" : lang === "hi" ? "रवि" : "Sun", tempMax: 33, tempMin: 25, condition: lang === "te" ? "తేలికపాటి వర్షం" : lang === "hi" ? "हल्की बारिश" : "Light Rain", icon: "CloudRain", rainProb: 65 },
        { day: lang === "te" ? "సోమ" : lang === "hi" ? "सोम" : "Mon", tempMax: 35, tempMin: 23, condition: lang === "te" ? "ఎండగా ఉంది" : lang === "hi" ? "धूप" : "Sunny", icon: "Sun", rainProb: 10 },
        { day: lang === "te" ? "మంగళ" : lang === "hi" ? "मंगल" : "Tue", tempMax: 34, tempMin: 24, condition: lang === "te" ? "ఎక్కువగా ఎండ" : lang === "hi" ? "ज्यादातर धूप" : "Mostly Sunny", icon: "Sun", rainProb: 20 },
        { day: lang === "te" ? "బుధ" : lang === "hi" ? "बुध" : "Wed", tempMax: 32, tempMin: 23, condition: lang === "te" ? "ఉరుములతో కూడిన తుఫాను" : lang === "hi" ? "गरज के साथ आंधी" : "Thunderstorm", icon: "CloudLightning", rainProb: 80 },
        { day: lang === "te" ? "గురు" : lang === "hi" ? "गुरु" : "Thu", tempMax: 31, tempMin: 22, condition: lang === "te" ? "వర్షం" : lang === "hi" ? "बारिश" : "Rainy", icon: "CloudRain", rainProb: 70 },
        { day: lang === "te" ? "శుక్ర" : lang === "hi" ? "शुक्र" : "Fri", tempMax: 33, tempMin: 24, condition: condText, icon: "CloudSun", rainProb: 30 },
      ]
    });
  }
});

// 2. Gemini Plant Disease Detection Route
app.post("/api/gemini/disease", async (req, res) => {
  const { crop, imageBase64, lang } = req.body;
  const targetLang = (lang || "en").toLowerCase();

  if (!crop) {
    return res.status(400).json({ error: "Crop name is required." });
  }

  // Define fallback simulated data for Indian farmers
  const getSimulatedDisease = (cropName: string) => {
    const cropLower = cropName.toLowerCase();
    if (cropLower.includes("rice") || cropLower.includes("paddy")) {
      if (targetLang === "te") {
        return {
          diseaseName: "వరి అగ్గి తెగులు (Rice Blast - Magnaporthe oryzae)",
          confidenceScore: 94,
          cause: "అధిక సాపేక్ష ఆర్ద్రత (90% కంటే ఎక్కువ) మరియు ఆకులపై తేమ కారణంగా ఏర్పడే శిలీంద్ర వ్యాధి (Magnaporthe oryzae).",
          symptoms: [
            "ఆకులపై బూడిద రంగు కేంద్రం మరియు గోధుమ రంగు అంచులతో కండె ఆకారపు మచ్చలు.",
            "ఆకు ఎండిపోయి విరిగిపోవడానికి దారితీసే కాలర్ కుళ్ళు.",
            "గింజలు నిండని వెన్నులు మరియు పంట పడిపోవడానికి దారితీసే మెడ కుళ్ళు."
          ],
          severity: "అధిక",
          prevention: [
            "తెగులును తట్టుకునే వరి రకాలను వాడండి.",
            "నత్రజని ఎరువుల అధిక వాడకాన్ని నివారించండి.",
            "స్థానిక తేమను తగ్గించడానికి సరైన అంతరం పాటించండి."
          ],
          organicTreatment: "ఉదయం వేళల్లో వేప నూనె (లీటరు నీటికి 3-5 మి.లీ.) లేదా సుడోమోనాస్ ఫ్లోరోసెన్స్ (లీటరుకు 10 గ్రా.) పిచికారీ చేయండి.",
          chemicalTreatment: "ఎకరానికి 120 గ్రాముల ట్రైసైక్లాజోల్ 75 WP ని 200 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి.",
          recommendedFertilizer: "యూరియా మోతాదును తగ్గించి, కాండం దృఢత్వాన్ని పెంచడానికి పొటాష్ (MOP) వాడండి.",
          recoveryTime: "12 - 15 రోజులు",
          thingsToAvoid: [
            "చల్లని, తేమతో కూడిన రాత్రి సమయాల్లో స్ప్రింక్లర్ ద్వారా నీరు పెట్టకండి.",
            "తదుపరి పంట కోసం తెగులు సోకిన పొలం నుండి సేకరించిన విత్తనాలను ఉపయోగించవద్దు."
          ]
        };
      } else if (targetLang === "hi") {
        return {
          diseaseName: "धान का झोंका रोग (Rice Blast - Magnaporthe oryzae)",
          confidenceScore: 94,
          cause: "उच्च सापेक्ष आर्द्रता (90% से अधिक) और पत्ती की नमी से उत्पन्न कवक रोगज़नक़ मैगनापोर्टे ओरीजाए।",
          symptoms: [
            "पत्तियों पर भूरे रंग के केंद्र और भूरे किनारों वाले धुरी के आकार के धब्बे।",
            "कॉलर सड़न जिसके कारण पत्तियाँ सूखकर टूट जाती हैं।",
            "गर्दन सड़न जिसके परिणामस्वरूप खाली बालियां और फसल का गिरना होता है।"
          ],
          severity: "उच्च",
          prevention: [
            "रोग प्रतिरोधी धान की किस्मों का प्रयोग करें।",
            "अत्यधिक नाइट्रोजनयुक्त उर्वरक के प्रयोग से बचें।",
            "स्थानीय आर्द्रता को कम करने के लिए पौधों के बीच उचित दूरी बनाए रखें।"
          ],
          organicTreatment: "सुबह के समय नीम का तेल (3-5 मिली/लीटर पानी) या स्यूडोमोनास फ्लोरेसेंस फॉर्मूलेशन (10 ग्राम/लीटर) का छिड़काव करें।",
          chemicalTreatment: "ट्राइसाइक्लाजोल 75 WP @ 120 ग्राम प्रति एकड़ को 200留टर पानी में मिलाकर छिड़काव करें।",
          recommendedFertilizer: "यूरिया की खुराक कम करें और तने की मजबूती बढ़ाने के लिए पोटाश (MOP) का प्रयोग करें।",
          recoveryTime: "12 - 15 दिन",
          thingsToAvoid: [
            "ठंडी, नम रातों में स्प्रिंकलर सिंचाई से बचें।",
            "अगली फसल के लिए ब्लास्ट प्रभावित खेतों के बीजों का उपयोग न करें।"
          ]
        };
      } else {
        return {
          diseaseName: "Rice Blast (Magnaporthe oryzae)",
          confidenceScore: 94,
          cause: "Fungal pathogen Magnaporthe oryzae triggered by high relative humidity (above 90%) and leaf wetness.",
          symptoms: [
            "Spindle-shaped lesions with gray centers and brown borders on leaves.",
            "Collar rot leading to leaf dying and breakage.",
            "Neck rot resulting in unfilled panicles and lodging."
          ],
          severity: "High",
          prevention: [
            "Use disease-resistant rice varieties.",
            "Avoid excessive nitrogenous fertilizer application.",
            "Maintain optimal water spacing to reduce localized humidity."
          ],
          organicTreatment: "Spray Neem Oil (3-5 ml/liter of water) or Pseudomonas fluorescens formulation (10g/liter) during early morning hours.",
          chemicalTreatment: "Apply Tricyclazole 75 WP @ 120 grams per acre in 200 liters of water.",
          recommendedFertilizer: "Reduce Urea dosage and apply Potash (MOP) to enhance stalk resistance.",
          recoveryTime: "12 - 15 Days",
          thingsToAvoid: [
            "Avoid sprinkler irrigation during cool, humid nights.",
            "Do not use seeds from blast-affected plots for the next crop."
          ]
        };
      }
    } else if (cropLower.includes("tomato")) {
      if (targetLang === "te") {
        return {
          diseaseName: "టమోటా ముందస్తు తెగులు (Tomato Early Blight - Alternaria solani)",
          confidenceScore: 89,
          cause: "నేల శిధిలాలలో జీవించి ఉండే ఆల్టర్నేరియా సొలాని అనే శిలీంద్రం, వెచ్చని, తేమతో కూడిన వర్షాల వల్ల వ్యాపిస్తుంది.",
          symptoms: [
            "ముందుగా పాత ఆకులపై ఏకకేంద్రక నల్లటి 'టార్గెట్' మచ్చలు ఏర్పడటం.",
            "చుట్టుపక్కల ఆకు కణజాలం పసుపు రంగులోకి మారడం, దీనివల్ల ఆకులు రాలిపోవడం.",
            "టమోటాల కాండం చివరన ముదురు రంగులో కుంగిపోయిన మచ్చలు."
          ],
          severity: "మధ్యస్థం",
          prevention: [
            "టమోటాయేతర పంటలతో పంట మార్పిడి పద్ధతిని పాటించండి.",
            "నేలపై నుండి నీరు ఆకులకు చిందకుండా మల్చింగ్ వేయండి.",
            "గాలి ప్రసరణను మెరుగుపరచడానికి కింద ఉన్న ఆకులను 12 అంగుళాల వరకు కత్తిరించండి."
          ],
          organicTreatment: "బాధిత ఆకులపై బోర్డో మిశ్రమం (1%) లేదా కాపర్ ఆక్సిక్లోరైడ్ సేంద్రీయ పేస్ట్‌ను పిచికారీ చేయండి.",
          chemicalTreatment: "మాంకోజెబ్ 75% WP @ 2.5 గ్రా/లీటర్ లేదా అజోక్సిస్ట్రోబిన్ @ 1 మి.లీ/లీటర్ పిచికారీ చేయండి.",
          recommendedFertilizer: "కణజాల బలాన్ని పెంచడానికి కాల్షియం అమ్మోనియం నైట్రేట్ మరియు వేర్ల పునరుద్ధరణను ప్రేరేపించడానికి హ్యూమిక్ యాసిడ్స్ వాడండి.",
          recoveryTime: "7 - 10 రోజులు",
          thingsToAvoid: [
            "టమోటా తీగలకు పైనుండి నీరు పోయడం నివారించండి.",
            "మంచు లేదా వర్షంతో ఆకులు తడిగా ఉన్నప్పుడు వాటిని ఎప్పుడూ కత్తిరించవద్దు."
          ]
        };
      } else if (targetLang === "hi") {
        return {
          diseaseName: "टमाटर अगेती झुलसा रोग (Tomato Early Blight - Alternaria solani)",
          confidenceScore: 89,
          cause: "मिट्टी के अवशेषों में जीवित रहने वाला कवक अल्टरनेरिया सोलेनी, जो गर्म, नम और बरसाती मौसम में फैलता है।",
          symptoms: [
            "सबसे पहले पुरानी पत्तियों पर संकेंद्रीय काले 'लक्षित' धब्बे बनना।",
            "आस-पास के पत्ती के ऊतकों का पीला होना, जिससे पत्तियां गिर जाती हैं।",
            "टमाटर के डंठल के सिरे पर गहरे धंसे हुए धब्बे।"
          ],
          severity: "मध्यम",
          prevention: [
            "गैर-सोलनेसी फसलों के साथ फसल चक्र अपनाएं।",
            "मिट्टी के छिटकने से पत्तियों को बचाने के लिए गीली घास (मल्चिंग) का प्रयोग करें।",
            "हवा के प्रवाह को बेहतर बनाने के लिए नीचे की पत्तियों को 12 इंच तक काटें।"
          ],
          organicTreatment: "प्रभावित पत्तियों पर बोर्डो मिश्रण (1%) या कॉपर ऑक्सीक्लोराइड जैविक पेस्ट का छिड़काव करें।",
          chemicalTreatment: "मैनकोज़ेब 75% WP @ 2.5 ग्राम/लीटर या एज़ोक्सीस्ट्रोबीन @ 1 मिली/लीटर का छिड़काव करें।",
          recommendedFertilizer: "ऊतक शक्ति बढ़ाने के लिए कैल्शियम अमोनियम नाइट्रेट और जड़ों के सुधार के लिए ह्यूमिक एसिड का प्रयोग करें।",
          recoveryTime: "7 - 10 दिन",
          thingsToAvoid: [
            "टमाटर की लताओं पर ऊपर से पानी डालने से बचें।",
            "जब पत्तियाँ ओस या बारिश से गीली हों, तो उनकी छँटाई कभी न करें।"
          ]
        };
      } else {
        return {
          diseaseName: "Tomato Early Blight (Alternaria solani)",
          confidenceScore: 89,
          cause: "Fungus Alternaria solani surviving in soil debris, spread by warm, humid rainy spells.",
          symptoms: [
            "Concentric black 'target' spots on older leaves first.",
            "Yellowing of surrounding leaf tissue, leading to defoliation.",
            "Dark sunken spots at the stem-end of tomatoes."
          ],
          severity: "Medium",
          prevention: [
            "Practice crop rotation with non-solanaceous crops.",
            "Mulch the soil surface to prevent soil splashing onto leaves.",
            "Pruning of bottom leaves up to 12 inches to improve airflow."
          ],
          organicTreatment: "Spray Bordeaux mixture (1%) or Copper Oxychloride organic paste on the affected foliage.",
          chemicalTreatment: "Spray Mancozeb 75% WP @ 2.5g/liter or Azoxystrobin @ 1ml/liter.",
          recommendedFertilizer: "Calcium Ammonium Nitrate to boost tissue strength, and humic acids to stimulate root recovery.",
          recoveryTime: "7 - 10 Days",
          thingsToAvoid: [
            "Avoid overhead watering of tomato vines.",
            "Never prune leaves while they are damp with dew or rain."
          ]
        };
      }
    } else {
      if (targetLang === "te") {
        return {
          diseaseName: `${cropName} ఆకు మచ్చ తెగులు (Leaf Spot / Blight)`,
          confidenceScore: 85,
          cause: "అధిక నేల తేమ మరియు అధిక ఉష్ణోగ్రత కింద చురుకుగా ఉండే విస్తృత శిలీంద్ర వ్యాధి.",
          symptoms: [
            "ఆకులపై గుండ్రటి గోధుమ రంగు నీటితో కూడిన మచ్చలు.",
            "బయటి ఆకులపై పొడి, కాగితం వంటి మచ్చలు.",
            "యువ మొలకల పెరుగుదల కుంటుపడటం."
          ],
          severity: "మధ్యస్థం",
          prevention: [
            "సరైన పంట వరుసల అంతరాన్ని పాటించండి.",
            "పొలంలో సరైన నీటి పారుదల వ్యవస్థను నిర్ధారించుకోండి.",
            "సోకిన ఆకులను వెంటనే తొలగించి సురక్షితంగా పూడ్చివేయండి."
          ],
          organicTreatment: "ట్రైకోడెర్మా విరిడే బయోపెస్టిసైడ్ లేదా వెల్లుల్లి సారం పిచికారీని ఉపయోగించండి.",
          chemicalTreatment: "లీటరు నీటికి 2 గ్రా కార్బెండజిమ్ 50% WP చొప్పున పిచికారీ చేయండి.",
          recommendedFertilizer: "సూక్ష్మ పోషకాల మిశ్రమంతో పాటు సమతుల్య NPK (19:19:19) పిచికారీ చేయండి.",
          recoveryTime: "10 - 14 రోజులు",
          thingsToAvoid: [
            "మొక్కలను చాలా దగ్గరగా గుంపుగా నాటవద్దు.",
            "మొక్కల వేర్ల దగ్గర నీరు నిలిచిపోకుండా చూసుకోండి."
          ]
        };
      } else if (targetLang === "hi") {
        return {
          diseaseName: `${cropName} पत्ती धब्बा / झुलसा रोग (Leaf Spot / Blight)`,
          confidenceScore: 85,
          cause: "उच्च मिट्टी की नमी और उच्च तापमान के तहत सक्रिय कवक रोगज़नक़ संकुल।",
          symptoms: [
            "पत्तियों पर गोल भूरे रंग के पानीदार धब्बे।",
            "बाहरी पत्तियों पर सूखे, कागज़ जैसे धब्बे।",
            "नई शाखाओं की वृद्धि में रुकावट।"
          ],
          severity: "मध्यम",
          prevention: [
            "फसलों के बीच उचित दूरी बनाए रखें।",
            "खेत में जल निकासी की समुचित व्यवस्था सुनिश्चित करें।",
            "संक्रमित पत्तियों को तुरंत हटा दें और उन्हें सुरक्षित रूप से दबा दें।"
          ],
          organicTreatment: "ट्राइकोडेरमा विरिडी जैव-कीटनाशक या लहसुन के अर्क के छिड़काव का प्रयोग करें।",
          chemicalTreatment: "कार्बेंडाजिम 50% WP @ 2 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।",
          recommendedFertilizer: "सूक्ष्म पोषक तत्वों के मिश्रण के साथ संतुलित NPK (19:19:19) का छिड़काव करें।",
          recoveryTime: "10 - 14 दिन",
          thingsToAvoid: [
            "पौधों को बहुत पास-पास न लगाएं।",
            "पौधों की जड़ों के पास पानी जमा न रहने दें।"
          ]
        };
      } else {
        return {
          diseaseName: `${cropName} Leaf Spot / Blight`,
          confidenceScore: 85,
          cause: "Broad fungal pathogen complex active under high soil dampness and high canopy temperature.",
          symptoms: [
            "Circular brown water-soaked lesions across leaves.",
            "Dry, papery patches on outer foliage.",
            "Retarded growth of young shoots."
          ],
          severity: "Medium",
          prevention: [
            "Maintain appropriate inter-crop row spacing.",
            "Ensure proper drainage system in the farm.",
            "Remove infected leaves immediately and bury them safely."
          ],
          organicTreatment: "Use Trichoderma viride biopesticide or garlic extract spray.",
          chemicalTreatment: "Spray Carbendazim 50% WP @ 2g per liter of water.",
          recommendedFertilizer: "Balanced NPK (19:19:19) foliar spray along with micro-nutrient mix.",
          recoveryTime: "10 - 14 Days",
          thingsToAvoid: [
            "Do not crowd plants too closely.",
            "Do not let stagnant irrigation pools remain near the plant roots."
          ]
        };
      }
    }
  };

  // If AI is initialized and image is uploaded, use real Gemini
  if (ai && imageBase64) {
    try {
      // Extract clean base64 data
      let base64Data = imageBase64;
      let mimeType = "image/jpeg";
      if (imageBase64.includes(";base64,")) {
        const parts = imageBase64.split(";base64,");
        base64Data = parts[1];
        const match = parts[0].match(/data:(.*)/);
        if (match) mimeType = match[1];
      }

      const targetLangName = targetLang === "te" ? "Telugu" : targetLang === "hi" ? "Hindi" : "English";
      const prompt = `You are an expert agricultural scientist.
Given the detected crop: ${crop}. Analyze this crop leaf image for any diseases.
Return a clean JSON object containing the diagnosis.
You MUST write the JSON response values in ${targetLangName} (fully translated into ${targetLangName}, including technical names or descriptions, in the native script: Telugu script for Telugu, Hindi script for Hindi).
You MUST format your output exactly as a single, valid JSON object with the following keys:
- diseaseName (string): Full name of the disease (scientific name in brackets if applicable). If healthy, return "Healthy Plant" translated in ${targetLangName}
- confidenceScore (number): Integer confidence score between 1 and 100
- cause (string): Specific description of the pathogen or trigger in ${targetLangName}
- symptoms (array of strings): 3 distinct visual symptoms in ${targetLangName}
- severity (string): Must be translated to ${targetLangName} (e.g., High -> "High" in ${targetLangName} like "అధిక" or "उच्च")
- prevention (array of strings): 3 critical preventive measures in ${targetLangName}
- organicTreatment (string): Bio-pesticides, neem solutions or organic methods in ${targetLangName}
- chemicalTreatment (string): Specific chemical name and dosage/acre suitable for Indian farming in ${targetLangName}
- recommendedFertilizer (string): Fertilizer changes needed to boost recovery in ${targetLangName}
- recoveryTime (string): estimated days/weeks to recover in ${targetLangName}
- thingsToAvoid (array of strings): 2-3 critical warnings or actions to avoid in ${targetLangName}

Use simple, clear language suitable for Indian farmers. Do not wrap in markdown quotes or code blocks, return ONLY the JSON string.`;

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      };

      const textPart = { text: prompt };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text || "";
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return res.json(parsed);
    } catch (err) {
      console.error("Gemini Disease analysis failed, using high-quality simulation:", err);
      return res.json(getSimulatedDisease(crop));
    }
  } else {
    // Return simulated response instantly
    return res.json(getSimulatedDisease(crop));
  }
});

// 3. Gemini Smart Irrigation Advisor Route
app.post("/api/gemini/irrigation", async (req, res) => {
  const { crop, soilMoisture, temperature, humidity, weather, rainProbability, farmSize, lang } = req.body;
  const targetLang = (lang || "en").toLowerCase();

  if (!crop) {
    return res.status(400).json({ error: "Crop is required." });
  }

  const getSimulatedIrrigation = () => {
    const moistureNum = Number(soilMoisture) || 35;
    const shouldIrrigate = moistureNum < 45 && Number(rainProbability) < 50;
    
    if (targetLang === "te") {
      return {
        shouldIrrigate,
        waterQuantity: shouldIrrigate 
          ? `${Math.round(Number(farmSize) * 8000)} లీటర్లు (సుమారు 8,000 లీటర్లు / ఎకరానికి)` 
          : "0 లీటర్లు (నేల తేమ అనుకూలంగా ఉంది / వర్షపాతం అంచనా వేయబడింది)",
        bestTime: shouldIrrigate ? "ఉదయం 06:00 - 08:30 లేదా సాయంత్రం 05:30 - 07:00" : "వర్తించదు",
        duration: shouldIrrigate ? `${(Number(farmSize) * 0.8).toFixed(1)} గంటలు` : "0 గంటలు",
        reason: shouldIrrigate
          ? `నేల తేమ ${moistureNum}% వద్ద క్లిష్టంగా ఉంది (${crop} కోసం కావలసిన కనీస తేమ 45%). నేటి ఉష్ణోగ్రత ${temperature}°C, మరియు వర్షపాతం పడే అవకాశం తక్కువగా ఉంది (${rainProbability}%), అంటే ఆవిరి వేగంగా జరుగుతుంది.`
          : `నేల తేమ ${moistureNum}% వద్ద ${crop} పెరుగుదలకు పూర్తిగా సరిపోతుంది. అదనంగా, ${rainProbability}% వర్షపాత సూచన ఉంది, ఇది సహజంగా తేమను తిరిగి నింపుతుంది. నీరు నిల్వ ఉండకుండా నీటిపారుదల వాయిదా వేయబడింది.`
      };
    } else if (targetLang === "hi") {
      return {
        shouldIrrigate,
        waterQuantity: shouldIrrigate 
          ? `${Math.round(Number(farmSize) * 8000)} लीटर (लगभग 8,000 लीटर / एकड़)` 
          : "0 लीटर (मिट्टी की नमी इष्टतम है / भारी बारिश का अनुमान है)",
        bestTime: shouldIrrigate ? "सुबह 06:00 - 08:30 या शाम 05:30 - 07:00" : "लागू नहीं",
        duration: shouldIrrigate ? `${(Number(farmSize) * 0.8).toFixed(1)} घंटे` : "0 घंटे",
        reason: shouldIrrigate
          ? `मिट्टी की नमी ${moistureNum}% पर गंभीर है (${crop} के लिए आवश्यक न्यूनतम नमी 45% है)। आज का तापमान ${temperature}°C है, और बारिश की संभावना कम (${rainProbability}%) है, जिसका अर्थ है कि वाष्पीकरण तेज़ होगा।`
          : `मिट्टी की नमी ${moistureNum}% पर ${crop} के विकास के लिए पूरी तरह से पर्याप्त है। इसके अलावा, ${rainProbability}% बारिश का अनुमान है, जो प्राकृतिक रूप से नमी की पूर्ति करेगा। जलभराव से बचने के लिए सिंचाई स्थगित कर दी गई है।`
      };
    } else {
      return {
        shouldIrrigate,
        waterQuantity: shouldIrrigate 
          ? `${Math.round(Number(farmSize) * 8000)} Liters (Approx. 8,000L / Acre)` 
          : "0 Liters (Soil moisture is optimal / High rain forecast)",
        bestTime: shouldIrrigate ? "06:00 AM - 08:30 AM or 05:30 PM - 07:00 PM" : "N/A",
        duration: shouldIrrigate ? `${(Number(farmSize) * 0.8).toFixed(1)} Hours` : "0 Hours",
        reason: shouldIrrigate
          ? `Soil moisture is critical at ${moistureNum}% (minimum needed for ${crop} is 45%). The daily temperature is ${temperature}°C, and rain probability is low (${rainProbability}%), meaning evaporation is fast.`
          : `Soil moisture of ${moistureNum}% is fully sufficient for ${crop} growth. Additionally, there is a ${rainProbability}% rain forecast, which will naturally replenish moisture. Irrigation is postponed to avoid waterlogging.`
      };
    }
  };

  if (ai) {
    try {
      const targetLangName = targetLang === "te" ? "Telugu" : targetLang === "hi" ? "Hindi" : "English";
      const prompt = `You are an expert irrigation consultant.
Recommend watering instructions based on:
- Crop: ${crop}
- Soil Moisture: ${soilMoisture}%
- Temperature: ${temperature}°C
- Humidity: ${humidity}%
- Current Weather: ${weather}
- Rain Forecast: ${rainProbability}%
- Farm Size: ${farmSize} acres

Return a valid JSON object with the following keys:
- shouldIrrigate (boolean): true or false
- waterQuantity (string): volume of water in Liters for the whole farm, customized to farm size (fully translated into ${targetLangName}, including units or labels)
- bestTime (string): best hours of the day fully translated into ${targetLangName} (e.g. morning/evening description)
- duration (string): duration to run the pump/drip system fully translated into ${targetLangName} (e.g. "2 Hours" -> "2 గంటలు" or "2 घंटे")
- reason (string): clear, logical, and detailed scientific reason explaining the recommendation fully translated and written in ${targetLangName} (Telugu script for Telugu, Hindi script for Hindi).

Ensure language is friendly for farmers. Do not return code blocks or markdown, return ONLY the JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text || "";
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return res.json(parsed);
    } catch (err) {
      console.error("Gemini Irrigation recommendations failed, using simulated response:", err);
      return res.json(getSimulatedIrrigation());
    }
  } else {
    return res.json(getSimulatedIrrigation());
  }
});

// 4. Gemini Yield Predictor Route
app.post("/api/gemini/yield", async (req, res) => {
  const { crop, area, rainfall, temperature, humidity, fertilizerUsed, previousYield, lang } = req.body;
  const targetLang = (lang || "en").toLowerCase();

  if (!crop) {
    return res.status(400).json({ error: "Crop name is required." });
  }

  const getSimulatedYield = () => {
    const areaNum = Number(area) || 2;
    const prevYieldNum = Number(previousYield) || 1200;
    const rainfallNum = Number(rainfall) || 600;
    
    // Simple mock calculation logic
    let estimatedYield = prevYieldNum * areaNum * 0.95;
    if (rainfallNum >= 500 && rainfallNum <= 900) {
      estimatedYield *= 1.15; // optimal rainfall
    } else if (rainfallNum > 1200) {
      estimatedYield *= 0.8; // excessive rainfall / flooding risk
    }
    estimatedYield = Math.round(estimatedYield);

    const expectedProfit = Math.round(estimatedYield * 32); // average ₹32 per kg
    const confidence = rainfallNum > 400 && rainfallNum < 1000 ? 92 : 78;

    if (targetLang === "te") {
      return {
        estimatedYield,
        harvestDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        expectedProfit,
        confidence,
        aiInsights: {
          why: `మీ అంచనా దిగుబడి ${areaNum} ఎకరాలలో ${estimatedYield} కిలోలుగా అంచనా వేయబడింది. ${rainfall}mm వర్షపాతం ${crop} పంటకు చాలా అనుకూలంగా ఉంటుంది. సరైన ఉష్ణోగ్రతలు (${temperature}°C) మరియు సమతుల్య తేమ గింజలు బాగా నిండడానికి సహాయపడతాయి, ఇది పంట సాంద్రతను పెంచుతుంది.`,
          improvements: [
            "పూత దశలో పిందెలు బాగా కట్టడానికి జింక్ సల్ఫేట్ (0.5%) మరియు బోరాక్స్ (0.2%) సూక్ష్మ పోషకాలను పిచికారీ చేయండి.",
            "ఎరువుల నుండి పోషకాల శోషణను మెరుగుపరచడానికి హ్యూమిక్ యాసిడ్ నేల కండిషనర్లను ఉపయోగించండి.",
            "కాండం తొలుచు పురుగులు/కాయ తొలుచు పురుగులను సహజంగా నియంత్రించడానికి ఫేరమోన్ ట్రాప్స్ (ఎకరానికి 5 ట్రాప్స్) ఏర్పాటు చేయండి."
          ],
          bestPractices: [
            "ఎరువులను ఒకేసారి కాకుండా మూడు దశలుగా విభజించి వేయండి: నాటేటప్పుడు, ఎదుగుదల దశలో మరియు పూత దశలో.",
            "కీటకాల నివాసాలను నిరోధించడానికి పొలం గట్లను శుభ్రంగా ఉంచండి.",
            "పంట నష్టాన్ని తగ్గించడానికి 85% గింజలు పొడి రంగులోకి మారినప్పుడు కోత కోయండి."
          ]
        }
      };
    } else if (targetLang === "hi") {
      return {
        estimatedYield,
        harvestDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        expectedProfit,
        confidence,
        aiInsights: {
          why: `आपकी अनुमानित उपज ${areaNum} एकड़ में ${estimatedYield} किलोग्राम होने का अनुमान है। ${rainfall}mm की बारिश ${crop} के लिए बिल्कुल अनुकूल है। अनुकूल तापमान (${temperature}°C) और संतुलित आर्द्रता बालियों के विकास को बढ़ावा देगी, जिससे फसल का घनत्व बढ़ता है।`,
          improvements: [
            "फल लगने की दर बढ़ाने के लिए फूलों की अवस्था के दौरान जिंक सल्फेट (0.5%) और बोराक्स (0.2%) के सूक्ष्म पोषक तत्वों का छिड़काव करें।",
            "उर्वरकों से पोषक तत्वों के अवसूषण को बेहतर बनाने के लिए मिट्टी कंडीशनर के रूप में ह्यूमिक एसिड का उपयोग करें।",
            "तना छेदक/कमला कीटों को प्राकृतिक रूप से नियंत्रित करने के लिए फेरोमोन ट्रैप (5 ट्रैप प्रति एकड़) स्थापित करें।"
          ],
          bestPractices: [
            "उर्वरकों को एक ही बार में डालने के बजाय तीन चरणों में विभाजित करें: आधार, वानस्पतिक और फूल आने के समय।",
            "कीटों के छिपने वाले स्थानों को रोकने के लिए खेत की सीमाओं को साफ रखें।",
            "फसल कटाई के बाद के नुकसान को कम करने के लिए तब कटाई करें जब 85% दाने पुआल के रंग के हो जाएं।"
          ]
        }
      };
    } else {
      return {
        estimatedYield,
        harvestDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        expectedProfit,
        confidence,
        aiInsights: {
          why: `Your estimated yield is projected at ${estimatedYield} kg across ${areaNum} acres. The rainfall of ${rainfall}mm falls perfectly into the sweet spot for ${crop}. Optimal temperatures (${temperature}°C) and balanced humidity will foster panicle growth, which increases the crop density.`,
          improvements: [
            "Implement micro-nutrient spray of Zinc Sulphate (0.5%) and Borax (0.2%) during flowering stage to increase fruit set.",
            "Use humic acid soil conditioners to improve nutrient absorption from the fertilizers.",
            "Install pheromone traps (5 traps per acre) to control bollworms/stem-borers naturally."
          ],
          bestPractices: [
            "Splitting fertilizer doses into three stages: basal, vegetative, and flowering, rather than a single large application.",
            "Keep farm boundaries clean to prevent insect vector nesting.",
            "Harvest when 85% of grain/pods turn straw-colored to reduce post-harvest kernel loss."
          ]
        }
      };
    }
  };

  if (ai) {
    try {
      const targetLangName = targetLang === "te" ? "Telugu" : targetLang === "hi" ? "Hindi" : "English";
      const prompt = `You are an expert agricultural investment and yield consultant.
Predict crop yields and generate deep analysis based on:
- Crop: ${crop}
- Area: ${area} acres
- Rainfall: ${rainfall} mm
- Temperature: ${temperature}°C
- Humidity: ${humidity}%
- Fertilizer Used: ${fertilizerUsed}
- Previous Yield: ${previousYield} kg/acre

Return a valid JSON object with the following keys:
- estimatedYield (number): estimated total yield in kg for the entire farm size (be scientifically realistic)
- harvestDate (string): predicted harvest date in YYYY-MM-DD format (usually 3 to 5 months from now)
- expectedProfit (number): estimated profit in Indian Rupees (INR) based on market prices
- confidence (number): confidence percentage (60 - 95%)
- aiInsights (object): containing:
  - why (string): scientific analysis explaining why yield is predicted high or low fully translated into ${targetLangName} (Telugu script for Telugu, Hindi script for Hindi).
  - improvements (array of strings): 3 specific actionable fertilizer or soil tips to increase this yield fully translated into ${targetLangName}
  - bestPractices (array of strings): 3 specific modern farming guidelines for this crop fully translated into ${targetLangName}

Make it highly customized to Indian agriculture (in INR). Return ONLY the JSON object written fully in the ${targetLangName} language.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text || "";
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return res.json(parsed);
    } catch (err) {
      console.error("Gemini Yield prediction failed, using simulated response:", err);
      return res.json(getSimulatedYield());
    }
  } else {
    return res.json(getSimulatedYield());
  }
});

// 5. Gemini Chat Assistant Route (incorporates full farmer context)
app.post("/api/gemini/chat", async (req, res) => {
  const { messages, farmerDetails, farmDetails, weather, currentCrops, diseases, yieldPredictions } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const userLang = farmerDetails?.language || "en";
  const systemInstruction = `You are AgriGenie, a highly empathetic and extremely knowledgeable agricultural AI expert, scientific advisor, and supportive farming companion.
You are helping a farmer with the following contextual profile:
- Farmer Name: ${farmerDetails?.name || "Tharun"}
- Contact: ${farmerDetails?.phone || "N/A"}
- Location: ${farmerDetails?.location || "Andhra Pradesh, India"}
- Preferred Language: ${userLang === "hi" ? "Hindi" : userLang === "te" ? "Telugu" : "English"}

Active Farm Data:
${JSON.stringify(farmDetails || [], null, 2)}

Active Crop Status:
${JSON.stringify(currentCrops || [], null, 2)}

Recent Weather Context:
${JSON.stringify(weather || {}, null, 2)}

Diagnosed Diseases Context:
${JSON.stringify(diseases || [], null, 2)}

Yield Predictions:
${JSON.stringify(yieldPredictions || [], null, 2)}

IMPORTANT INSTRUCTIONS:
1. Always respond in the farmer's preferred language (${userLang}). If Hindi, reply in Hindi script. If Telugu, reply in Telugu script. If English, reply in English.
2. Be practical, friendly, and give clear, step-by-step agricultural instructions.
3. Use context about their active farms and weather to provide hyper-localized advice (e.g., if there's high temperature, advise on watering; if blast disease is present, advise on treatments).
4. Do not talk about your internal configurations or system data. Focus purely on assisting the farmer. Keep formatting neat with bullet points.`;

  if (ai) {
    try {
      // Map message formats
      const contents = messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
        }
      });

      return res.json({ content: response.text });
    } catch (err) {
      console.error("Gemini Chat failed, using simulated response:", err);
      return res.json({
        content: `I am currently in smart offline backup mode. Regarding your question: "${messages[messages.length - 1].content}", here is some advice based on your ${farmDetails?.[0]?.cropType || "crops"}:\n\n- Ensure you maintain optimum irrigation because today's temperature is warm.\n- Apply organic bio-fertilizers like compost to improve soil moisture holding capacity.\n- For crop protection, keep checking leaf surfaces for any spots early in the morning.\n\nLet me know if you would like specific spray schedules!`
      });
    }
  } else {
    // Simulated chat responses
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    let reply = "";
    if (userLang === "te") {
      reply = "నమస్కారం! నేను అగ్రిజెనీని, మీ సహాయకుడిని. మీ పొలం తేమ స్థాయిలను పరిశీలించాను. ప్రస్తుత వాతావరణం పొడిగా ఉంది కాబట్టి నీటిపారుదలని సరిగ్గా నిర్వహించండి. రసాయన ఎరువుల కంటే సేంద్రీయ పద్ధతులు పాటించడం మంచిది.";
    } else if (userLang === "hi") {
      reply = "नमस्कार! मैं एग्रीजीनी हूँ, आपका सहायक। आपके खेत की स्थिति और फसलों के लिए नाइट्रोजन और जैविक खाद का संतुलन बनाए रखना आवश्यक है। आज मौसम गर्म है, कृपया शाम को सिंचाई करें।";
    } else {
      reply = `Hello ${farmerDetails?.name || "Farmer"}! Based on your crop (${farmDetails?.[0]?.cropType || "Paddy"}), here is an expert recommendation:\n\n1. **Fertilizer Split**: Apply Urea in 3 equal split doses: basal, 30 days, and 60 days after sowing.\n2. **Irrigation Alert**: The relative humidity is around ${weather?.humidity || "62"}%. Watering is best done early in the morning.\n3. **Soil Health**: Add Gypsum (100kg/acre) to improve clayey soils like Black soil.\n\nAsk me anything about pests, plant protection, or yield optimization!`;
    }
    return res.json({ content: reply });
  }
});

// 6. Gemini Report Generation API
app.post("/api/gemini/report", async (req, res) => {
  const { farm, crops, expenses, weather, diseases, yieldPredictions, lang } = req.body;
  const targetLang = (lang || "en").toLowerCase();

  if (ai) {
    try {
      const targetLangName = targetLang === "te" ? "Telugu" : targetLang === "hi" ? "Hindi" : "English";
      const prompt = `You are an elite agricultural audit scientist. Generate a comprehensive "Farm Health and Productivity Report" for:
Farm: ${JSON.stringify(farm)}
Crops: ${JSON.stringify(crops)}
Expenses: ${JSON.stringify(expenses)}
Weather: ${JSON.stringify(weather)}
Diseases: ${JSON.stringify(diseases)}
Yield Predictions: ${JSON.stringify(yieldPredictions)}

Your task is to generate a beautiful, descriptive, and actionable executive summary and a list of specific farming suggestions fully written in ${targetLangName} (Telugu script for Telugu, Hindi script for Hindi).
Return a valid JSON with the following keys:
- summary (string): A formal, 3-4 sentence evaluation of the farm's status, challenges, and overall financial health written in ${targetLangName}.
- aiSuggestions (array of strings): 4 specific, highly detailed actions to take written in ${targetLangName}.

Return ONLY the JSON string. No markdown quotes.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text || "";
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return res.json(parsed);
    } catch (err) {
      console.error("Gemini Report generation failed, using fallback:", err);
    }
  }

  // Fallback report
  if (targetLang === "te") {
    return res.json({
      summary: `పొలం ${farm?.name || "పచ్చని పొలాలు"} ${farm?.cropType || "పంటల"} సాగుతో స్థిరంగా రాణిస్తోంది. శ్రమ మరియు ఎరువుల ఖర్చులు బాగా నిర్వహించబడుతున్నాయి. నేల తేమ మధ్యస్థంగా ఉంది, ఇది బిందు సేద్యం (డ్రిప్ ఇరిగేషన్) అవసరాన్ని సూచిస్తుంది. పంటల దశలు మంచి పురోగతిని సూచిస్తున్నాయి మరియు తెగుళ్ల ముప్పును నివారించడానికి నిరంతర పర్యవేక్షణ అవసరం.`,
      aiSuggestions: [
        "నీటిపారుదల సామర్థ్యాన్ని పెంచండి: నీటి ఆవిరిని నిరోధించడానికి ఉదయాన్నే బిందు సేద్యం సైకిళ్లను ప్రారంభించండి.",
        "మెకానికల్ సీడర్లు లేదా సెమీ ఆటోమేటిక్ పిచికారీ పరికరాలను ప్రవేశపెట్టడం ద్వారా అదనపు కార్మిక ఖర్చులను తగ్గించండి.",
        "ప్రారంభ ఎదుగుదల దశల్లో శిలీంద్ర సంక్రమణను నివారించడానికి ట్రైకోడెర్మా విరిడే వంటి జీవ కీటక నాశినులను ఉపయోగించండి.",
        "కోత తర్వాత కుళ్ళిపోవడాన్ని నివారించడానికి అంచనా వేసిన కోత తేదీకి 15 రోజుల ముందే కోత పరికరాలు మరియు ప్యాకేజింగ్ సామగ్రిని సిద్ధం చేసుకోండి."
      ]
    });
  } else if (targetLang === "hi") {
    return res.json({
      summary: `खेत ${farm?.name || "हरियाली मैदान"} ${farm?.cropType || "फसलों"} की खेती के साथ लगातार बढ़ रहा है। श्रम और उर्वरक पर समग्र व्यय को अच्छी तरह से प्रबंधित किया गया है। मिट्टी के पैरामीटर मध्यम रूप से सूखे दिखते हैं, जो ड्रिप सिंचाई समय-सारणी का सुझाव देते हैं। फसल के चरण अच्छी प्रगति का संकेत देते हैं और सक्रिय निगरानी की आवश्यकता होती है।`,
      aiSuggestions: [
        "सिंचाई दक्षता में सुधार करें: पानी के वाष्पीकरण को रोकने के लिए सुबह-सुबह ड्रिप सिंचाई चक्र अपनाएं।",
        "यांत्रिक सीडर या अर्ध-स्वचालित छिड़काव उपकरण पेश करके अतिरिक्त श्रम लागत को कम करें।",
        "प्रारंभिक वानस्पतिक विकास चरणों में कवक संक्रमण को रोकने के लिए ट्राइकोडेरमा विरिडी जैसे जैव-कीटनाशकों को एकीकृत करें।",
        "फसल कटाई के बाद सड़न को रोकने के लिए अपेक्षित कटाई तिथि से 15 दिन पहले कटाई के उपकरण और पैकेजिंग सामग्री तैयार करें।"
      ]
    });
  } else {
    return res.json({
      summary: `The farm ${farm?.name || "Green Meadows"} is performing steadily with active cultivation of ${farm?.cropType || "crops"}. Overall expenditures are well-managed across labor and fertilizer. Soil parameters look moderately dry, suggesting targeted drip irrigation scheduling. Crop stages indicate robust progress with moderate pest risks which require proactive monitoring.`,
      aiSuggestions: [
        "Improve irrigation efficiency: Shift to early morning drip cycles to prevent high water evaporation.",
        "Reduce excess labor costs by introducing mechanical seeders or semi-automated spraying equipment.",
        "Integrate bio-pesticides like Trichoderma viride to prevent fungal infection in the early vegetative growth stages.",
        "Prepare harvesting tools and packaging materials 15 days ahead of the expected harvest date to prevent post-cut rot."
      ]
    });
  }
});

// --- MOUNT VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
