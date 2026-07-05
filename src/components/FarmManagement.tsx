/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Farm, CropManagement, Expense, UserProfile } from "../types";
import { translations, translateValue as globalTranslateValue } from "../translations";
import { 
  Plus, 
  Trash2, 
  Edit, 
  DollarSign, 
  Layers, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  TrendingDown, 
  Calculator,
  User,
  AlertCircle
} from "lucide-react";

interface FarmManagementProps {
  farms: Farm[];
  crops: CropManagement[];
  expenses: Expense[];
  onAddFarm: (farm: Farm) => void;
  onEditFarm: (farm: Farm) => void;
  onDeleteFarm: (id: string) => void;
  onAddCrop: (crop: CropManagement) => void;
  onAddExpense: (expense: Expense) => void;
  userProfile?: UserProfile;
}

export default function FarmManagement({
  farms,
  crops,
  expenses,
  onAddFarm,
  onEditFarm,
  onDeleteFarm,
  onAddCrop,
  onAddExpense,
  userProfile
}: FarmManagementProps) {
  const lang = userProfile?.language || "en";
  const t = translations[lang] || translations.en;

  const translateValue = (val: string) => {
    return globalTranslateValue(val, lang);
  };

  // UI states
  const [activeFarmId, setActiveFarmId] = useState<string>(farms[0]?.id || "");
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);

  // New Farm Form state
  const [farmName, setFarmName] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [farmArea, setFarmArea] = useState<number>(1);
  const [farmSoil, setFarmSoil] = useState("Black Soil");
  const [farmCrop, setFarmCrop] = useState("Rice Paddy");
  const [farmSowDate, setFarmSowDate] = useState("");

  // New Crop Form state
  const [cropName, setCropName] = useState("");
  const [cropStage, setCropStage] = useState<any>("Seedling");
  const [cropHarvestDate, setCropHarvestDate] = useState("");
  const [cropFertilizer, setCropFertilizer] = useState("");
  const [cropPesticide, setCropPesticide] = useState("");

  // New Expense Form state
  const [costSeed, setCostSeed] = useState<number>(0);
  const [costFert, setCostFert] = useState<number>(0);
  const [costLabor, setCostLabor] = useState<number>(0);
  const [costEquip, setCostEquip] = useState<number>(0);

  // Handle actions
  const handleFarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName || !farmLocation || !farmSowDate) return;

    if (editingFarm) {
      onEditFarm({
        ...editingFarm,
        name: farmName,
        location: farmLocation,
        area: Number(farmArea),
        soilType: farmSoil,
        cropType: farmCrop,
        plantingDate: farmSowDate
      });
      setEditingFarm(null);
    } else {
      const newFarm: Farm = {
        id: "farm-" + Date.now(),
        name: farmName,
        location: farmLocation,
        area: Number(farmArea),
        soilType: farmSoil,
        cropType: farmCrop,
        plantingDate: farmSowDate
      };
      onAddFarm(newFarm);
      setActiveFarmId(newFarm.id);
    }

    // Reset Form
    setFarmName("");
    setFarmLocation("");
    setFarmArea(1);
    setFarmSowDate("");
    setShowAddFarm(false);
  };

  const handleEditInit = (farm: Farm) => {
    setEditingFarm(farm);
    setFarmName(farm.name);
    setFarmLocation(farm.location);
    setFarmArea(farm.area);
    setFarmSoil(farm.soilType);
    setFarmCrop(farm.cropType);
    setFarmSowDate(farm.plantingDate);
    setShowAddFarm(true);
  };

  const handleCropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName || !cropHarvestDate || !activeFarmId) return;

    const newCrop: CropManagement = {
      id: "crop-" + Date.now(),
      farmId: activeFarmId,
      cropName,
      growthStage: cropStage,
      expectedHarvestDate: cropHarvestDate,
      fertilizerSchedule: cropFertilizer,
      pesticideSchedule: cropPesticide
    };

    onAddCrop(newCrop);
    setCropName("");
    setCropHarvestDate("");
    setCropFertilizer("");
    setCropPesticide("");
    setShowAddCrop(false);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarmId) return;

    const newExpense: Expense = {
      id: "expense-" + Date.now(),
      farmId: activeFarmId,
      seedCost: Number(costSeed),
      fertilizerCost: Number(costFert),
      laborCost: Number(costLabor),
      equipmentCost: Number(costEquip),
      timestamp: new Date().toISOString()
    };

    onAddExpense(newExpense);
    setCostSeed(0);
    setCostFert(0);
    setCostLabor(0);
    setCostEquip(0);
    setShowAddExpense(false);
  };

  // Filter crops & expenses for selected farm
  const activeCrops = crops.filter(c => c.farmId === activeFarmId);
  const activeExpenses = expenses.filter(e => e.farmId === activeFarmId);

  // Totals calculations
  const totalFarmExpenses = activeExpenses.reduce((acc, e) => {
    return acc + Number(e.seedCost) + Number(e.fertilizerCost) + Number(e.laborCost) + Number(e.equipmentCost);
  }, 0);

  const selectedFarm = farms.find(f => f.id === activeFarmId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{t.farmManagement}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === "te" 
              ? "మీ వ్యవసాయ ప్లాట్లు నమోదు చేయండి, పంటల క్యాలెండర్‌లను పర్యవేక్షించండి మరియు ఖర్చులను నమోదు చేయండి." 
              : lang === "hi" 
              ? "अपने खेतों को कॉन्फ़िगर करें, फसल कैलेंडर की निगरानी करें, और परिचालन खर्चों को दर्ज करें।" 
              : "Configure your farms, monitor localized crop calendars, and log operational expenses."}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingFarm(null);
            setShowAddFarm(!showAddFarm);
          }}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {lang === "te" ? "వ్యవసాయ ప్లాట్‌ను జోడించండి" : lang === "hi" ? "खेत का प्लॉट जोड़ें" : "Add Farm Plot"}
        </button>
      </div>

      {/* Add / Edit Farm Modal Overlay */}
      {showAddFarm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-gray-800 text-lg mb-4">
              {editingFarm 
                ? (lang === "te" ? "వ్యవసాయ పొలం వివరాలను సవరించండి" : lang === "hi" ? "खेत के भूखंड के विवरण को संपादित करें" : "Edit Farm Plot Details") 
                : (lang === "te" ? "కొత్త వ్యవసాయ పొలాన్ని నమోదు చేయండి" : lang === "hi" ? "नया खेत भूखंड पंजीकृत करें" : "Register New Farm Plot")}
            </h3>
            <form onSubmit={handleFarmSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {lang === "te" ? "వ్యవసాయ పొలం పేరు" : lang === "hi" ? "खेत का नाम" : "Farm Name"}
                </label>
                <input
                  type="text"
                  required
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder={lang === "te" ? "ఉదా: పశ్చిమ వరి పొలం" : lang === "hi" ? "जैसे: पश्चिमी धान का खेत" : "e.g. Rice Paddy West"}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-800 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {lang === "te" ? "ప్రాంతం (నగరం, రాష్ట్రం)" : lang === "hi" ? "स्थान (शहर, राज्य)" : "Location (City, State)"}
                  </label>
                  <input
                    type="text"
                    required
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    placeholder={lang === "te" ? "ఉదా: అనంతపురం" : lang === "hi" ? "जैसे: अनंतपुर" : "e.g. Anantapur"}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {lang === "te" ? "వైశాల్యం (ఎకరాలు)" : lang === "hi" ? "क्षेत्रफल (एकड़)" : "Area (Acres)"}
                  </label>
                  <input
                    type="number"
                    required
                    min={0.1}
                    step={0.1}
                    value={farmArea}
                    onChange={(e) => setFarmArea(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {lang === "te" ? "నేల వర్గం" : lang === "hi" ? "मिट्टी की श्रेणी" : "Soil Category"}
                  </label>
                  <select
                    value={farmSoil}
                    onChange={(e) => setFarmSoil(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  >
                    <option value="Black Soil">{lang === "te" ? "నల్ల రేగడి నేల (రెగూర్)" : lang === "hi" ? "काली मिट्टी (रेगुर)" : "Black Soil (Regur)"}</option>
                    <option value="Red Soil">{lang === "te" ? "ఎర్ర మట్టి నేల" : lang === "hi" ? "लाल मिट्टी" : "Red Clay Soil"}</option>
                    <option value="Alluvial Soil">{lang === "te" ? "ఒండ్రు నేల" : lang === "hi" ? "जलोढ़ मिट्टी" : "Alluvial Soil"}</option>
                    <option value="Sandy Soil">{lang === "te" ? "ఇసుక నేల" : lang === "hi" ? "बलुआ मिट्टी" : "Sandy Loam"}</option>
                    <option value="Laterite Soil">{lang === "te" ? "లేటరైట్ నేల" : lang === "hi" ? "लेटराइट मिट्टी" : "Laterite Soil"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {lang === "te" ? "ప్రధాన పంట రకం" : lang === "hi" ? "मुख्य फसल का प्रकार" : "Major Crop Type"}
                  </label>
                  <input
                    type="text"
                    required
                    value={farmCrop}
                    onChange={(e) => setFarmCrop(e.target.value)}
                    placeholder={lang === "te" ? "ఉదా: బాస్మతి వరి" : lang === "hi" ? "जैसे: बासमती चावल" : "e.g. Basmati Rice"}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {lang === "te" ? "నాటిన/విత్తిన తేదీ" : lang === "hi" ? "बोने/रोपने की तिथि" : "Sowing/Planting Date"}
                </label>
                <input
                  type="date"
                  required
                  value={farmSowDate}
                  onChange={(e) => setFarmSowDate(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFarm(false)}
                  className="flex-1 py-2 px-4 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  {lang === "te" ? "రద్దు చేయి" : lang === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {editingFarm 
                    ? (lang === "te" ? "వివరాలను సవరించు" : lang === "hi" ? "भूखंड अपडेट करें" : "Update Plot") 
                    : (lang === "te" ? "ప్లాట్‌ను నమోదు చేయి" : lang === "hi" ? "भूखंड पंजीकृत करें" : "Register Plot")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Crop Overlay */}
      {showAddCrop && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-emerald-50 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-gray-800 text-lg mb-4">
              {lang === "te" ? "పంట క్యాలెండర్ వివరాలను చేర్చండి" : lang === "hi" ? "फसल कैलेंडर प्रविष्टि जोड़ें" : "Add Crop Calendar Entry"}
            </h3>
            <form onSubmit={handleCropSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {lang === "te" ? "పంట పేరు / రకం" : lang === "hi" ? "फसल का नाम / विविधता" : "Crop Name / Variety"}
                </label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder={lang === "te" ? "ఉదా: సోనా మసూరి వరి" : lang === "hi" ? "जैसे: सोना मसूली चावल" : "e.g. Sona Masuri Rice"}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {lang === "te" ? "ప్రస్తుత దశ" : lang === "hi" ? "वर्तमान चरण" : "Current Stage"}
                  </label>
                  <select
                    value={cropStage}
                    onChange={(e) => setCropStage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  >
                    <option value="Seedling">{lang === "te" ? "మొలక దశ" : lang === "hi" ? "अंकुर" : "Seedling"}</option>
                    <option value="Vegetative">{lang === "te" ? "ఆకు దశ" : lang === "hi" ? "वानस्पतिक" : "Vegetative"}</option>
                    <option value="Flowering">{lang === "te" ? "పూత దశ" : lang === "hi" ? "फूल आना" : "Flowering"}</option>
                    <option value="Maturity">{lang === "te" ? "పక్వత దశ" : lang === "hi" ? "परिपक्वता" : "Maturity"}</option>
                    <option value="Harvested">{lang === "te" ? "కోత కోసినది" : lang === "hi" ? "कटाई की गई" : "Harvested"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {lang === "te" ? "ఆశించిన కోత తేదీ" : lang === "hi" ? "अपेक्षित कटाई की तारीख" : "Expected Harvest Date"}
                  </label>
                  <input
                    type="date"
                    required
                    value={cropHarvestDate}
                    onChange={(e) => setCropHarvestDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {lang === "te" ? "ఎరువుల షెడ్యూల్ సూచన" : lang === "hi" ? "उर्वरक अनुसूची निर्देश" : "Fertilizer Schedule Instruction"}
                </label>
                <textarea
                  value={cropFertilizer}
                  onChange={(e) => setCropFertilizer(e.target.value)}
                  placeholder={lang === "te" ? "ఉదా: 40 కేజీల యూరియా ప్రాథమిక మోతాదు, 30 రోజులకు పొటాష్ వేయండి." : lang === "hi" ? "जैसे: 40 किलो यूरिया बेसल खुराक, 30 दिनों पर पोटाश का उपयोग करें।" : "e.g. Apply 40kg Urea basal dose, potash at 30 days."}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs h-20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {lang === "te" ? "క్రిమిసంహారక స్ప్రే షెడ్యూల్" : lang === "hi" ? "कीटनाशक छिड़काव अनुसूची" : "Pesticide Spray Schedule"}
                </label>
                <textarea
                  value={cropPesticide}
                  onChange={(e) => setCropPesticide(e.target.value)}
                  placeholder={lang === "te" ? "ఉదా: 25 వ రోజున కాండం తొలిచే పురుగు కనిపిస్తే క్లోరోపైరిఫాస్ పిచికారీ చేయండి." : lang === "hi" ? "जैसे: 25 दिनों पर तना छेदक दिखने पर क्लोरपायरीफॉस का छिड़काव करें।" : "e.g. Spray Chlorpyriphos if stem borer is noticed at 25 days."}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs h-20"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCrop(false)}
                  className="flex-1 py-2 px-4 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  {lang === "te" ? "రద్దు చేయి" : lang === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {lang === "te" ? "క్యాలెండర్ సేవ్ చేయి" : lang === "hi" ? "कैलेंडर सहेजें" : "Save Calendar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Overlay */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-emerald-50 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-gray-800 text-lg mb-4">
              {lang === "te" ? "నిర్వహణ ఖర్చును నమోదు చేయండి" : lang === "hi" ? "परिचालन व्यय दर्ज करें" : "Log Operational Expense"}
            </h3>
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {lang === "te" ? "విత్తనాల ఖర్చు (₹)" : lang === "hi" ? "बीज लागत (₹)" : "Seed Cost (₹)"}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={costSeed}
                    onChange={(e) => setCostSeed(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {lang === "te" ? "ఎరువుల ఖర్చు (₹)" : lang === "hi" ? "उर्वरक लागत (₹)" : "Fertilizer Cost (₹)"}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={costFert}
                    onChange={(e) => setCostFert(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {lang === "te" ? "కూలీల ఖర్చు (₹)" : lang === "hi" ? "मजदूरी लागत (₹)" : "Labor Cost (₹)"}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={costLabor}
                    onChange={(e) => setCostLabor(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {lang === "te" ? "పరికరాల ఖర్చు (₹)" : lang === "hi" ? "उपकरण लागत (₹)" : "Equipment Cost (₹)"}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={costEquip}
                    onChange={(e) => setCostEquip(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="flex-1 py-2 px-4 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  {lang === "te" ? "రద్దు చేయి" : lang === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {lang === "te" ? "ఖర్చులను నమోదు చేయి" : lang === "hi" ? "व्यय दर्ज करें" : "Log Expenditures"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      {farms.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-emerald-100 rounded-2xl max-w-xl mx-auto flex flex-col items-center gap-4">
          <Layers className="w-12 h-12 text-emerald-300 animate-pulse" />
          <div>
            <h3 className="font-extrabold text-gray-800">
              {lang === "te" ? "ఇంకా ఎలాంటి వ్యవసాయ పొలాలు నమోదు కాలేదు" : lang === "hi" ? "अभी तक कोई खेत बोया नहीं गया है" : "No Farm Plots Sown Yet"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {lang === "te" ? "పంటలు మరియు ఖర్చులను పర్యవేక్షించడానికి మీ మొదటి వ్యవసాయ పొలాన్ని సృష్టించండి." : lang === "hi" ? "फसलों और खर्चों को ट्रैक करने के लिए अपना पहला कृषि क्षेत्र बनाकर शुरुआत करें।" : "Begin by creating your primary agricultural farm plot to track crops and expenses."}
            </p>
          </div>
          <button
            onClick={() => setShowAddFarm(true)}
            className="py-2.5 px-5 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            {lang === "te" ? "మొదటి పొలాన్ని సృష్టించండి" : lang === "hi" ? "अपना पहला खेत बनाएं" : "Create Your First Farm"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Farm Selector Panel */}
          <div className="xl:col-span-1 space-y-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-1">
              {lang === "te" ? "నమోదైన వ్యవసాయ ప్లాట్లు" : lang === "hi" ? "पंजीकृत खेत" : "Registered Land Plots"}
            </span>
            <div className="space-y-2">
              {farms.map((f) => {
                const isActive = f.id === activeFarmId;
                return (
                  <div
                    key={f.id}
                    onClick={() => setActiveFarmId(f.id)}
                    className={`
                      p-4 rounded-2xl border transition-all cursor-pointer relative group
                      ${isActive 
                        ? "bg-white border-emerald-600 shadow-md shadow-emerald-700/5" 
                        : "bg-white/60 hover:bg-white border-gray-100"}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-sm text-gray-800 truncate">{f.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="truncate">{f.location}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditInit(f);
                          }}
                          className="p-1 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFarm(f.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-50 text-[11px] text-gray-500">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-400">
                          {lang === "te" ? "నేల" : lang === "hi" ? "मिट्टी" : "Soil"}
                        </span>
                        <span className="font-semibold text-gray-700">{translateValue(f.soilType)}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-400">
                          {lang === "te" ? "వైశాల్యం" : lang === "hi" ? "क्षेत्र" : "Area"}
                        </span>
                        <span className="font-semibold text-gray-700">{f.area} {lang === "te" ? "ఎకరాలు" : lang === "hi" ? "एकड़" : "Acres"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detailed Panel */}
          <div className="xl:col-span-3 space-y-6">
            {selectedFarm && (
              <>
                {/* Active Farm Plot Summary Header */}
                <div className="bg-gradient-to-r from-emerald-50/50 to-emerald-100/10 border border-emerald-50 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-[10px] bg-emerald-700 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {lang === "te" ? "ఎంచుకున్న వ్యవసాయ ప్రొఫైల్" : lang === "hi" ? "चयनित खेत प्रोफाइल" : "Selected Farm Profile"}
                    </span>
                    <h3 className="text-xl font-extrabold text-gray-800 mt-2">{selectedFarm.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {lang === "te" ? "నాటిన తేదీ:" : lang === "hi" ? "बुआई की तारीख:" : "Sown on:"} <span className="font-bold text-gray-700">{new Date(selectedFarm.plantingDate).toLocaleDateString()}</span> • {lang === "te" ? "ప్రధాన పంట:" : lang === "hi" ? "मुख्य फसल:" : "Primary crop:"} <span className="font-semibold text-emerald-800">{translateValue(selectedFarm.cropType)}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setShowAddCrop(true)}
                      className="py-2 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      + {lang === "te" ? "క్యాలెండర్ ఎంట్రీ" : lang === "hi" ? "कैलेंडर प्रविष्टि" : "Calendar Entry"}
                    </button>
                    <button
                      onClick={() => setShowAddExpense(true)}
                      className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      + {lang === "te" ? "ఖర్చును నమోదు చేయి" : lang === "hi" ? "व्यय दर्ज करें" : "Log Expense"}
                    </button>
                  </div>
                </div>

                {/* Sub-grid of Crop calendar entries and Expenditure logs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Crop Calendars Schedule list */}
                  <div className="bg-white p-5 rounded-2xl border border-emerald-50/40 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-gray-800 text-base mb-4 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-emerald-700" />
                        {lang === "te" ? "పంట ఎదుగుదల & నిర్వహణ క్యాలెండర్లు" : lang === "hi" ? "फसल विकास और रखरखाव कैलेंडर" : "Crop Growth & Maintenance Calendars"}
                      </h4>

                      <div className="space-y-4">
                        {activeCrops.map((c) => (
                          <div key={c.id} className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-bold text-sm text-gray-800">{translateValue(c.cropName)}</h5>
                                <span className="text-[10px] text-gray-400 font-semibold block mt-1">
                                  {lang === "te" ? "అంచనా కోత తేదీ:" : lang === "hi" ? "अनुमानित कटाई:" : "Est. Harvest:"} {new Date(c.expectedHarvestDate).toLocaleDateString()}
                                </span>
                              </div>
                              <span className={`
                                px-2 py-0.5 rounded-full text-[10px] font-extrabold
                                ${c.growthStage === "Seedling" ? "bg-amber-50 text-amber-800" :
                                  c.growthStage === "Vegetative" ? "bg-blue-50 text-blue-800" :
                                  c.growthStage === "Flowering" ? "bg-rose-50 text-rose-800" :
                                  "bg-emerald-50 text-emerald-800"}
                              `}>
                                {translateValue(c.growthStage)}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100/60 text-[11px]">
                              <div>
                                <span className="font-bold text-gray-400 uppercase tracking-wider text-[9px] block">
                                  {lang === "te" ? "ఎరువుల ప్రణాళిక" : lang === "hi" ? "उर्वरक योजना" : "Fertilizer Plan"}
                                </span>
                                <p className="text-gray-600 mt-0.5 line-clamp-2">{c.fertilizerSchedule || (lang === "te" ? "ప్రామాణిక సేంద్రీయ ఎరువులు పిచికారీ సిఫార్సు చేయబడింది." : lang === "hi" ? "मानक जैविक बेसल स्प्रे की सिफारिश की जाती है।" : "Standard organic basal spray recommended.")}</p>
                              </div>
                              <div>
                                <span className="font-bold text-gray-400 uppercase tracking-wider text-[9px] block">
                                  {lang === "te" ? "క్రిమిసంహారక స్ప్రే షెడ్యూల్" : lang === "hi" ? "कीटनाशक छिड़काव अनुसूची" : "Pesticide Spray Schedule"}
                                </span>
                                <p className="text-gray-600 mt-0.5 line-clamp-2">{c.pesticideSchedule || (lang === "te" ? "ఏదీ ప్రణాళిక చేయబడలేదు. ప్రతిరోజూ ఆకులను తనిఖీ చేయండి." : lang === "hi" ? "कोई योजना नहीं है। प्रतिदिन पत्तियों का निरीक्षण करें।" : "None planned. Inspect leaves daily.")}</p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {activeCrops.length === 0 && (
                          <div className="text-center py-8 text-xs text-gray-400 flex flex-col items-center gap-1">
                            <Calendar className="w-8 h-8 text-gray-300" />
                            <span>{lang === "te" ? "ఈ ప్లాట్ కోసం పంట క్యాలెండర్లు ఏవీ లేవు." : lang === "hi" ? "इस भूखंड के लिए कोई फसल कैलेंडर तैयार नहीं है।" : "No crop calendars mapped for this plot."}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial tracker logs */}
                  <div className="bg-white p-5 rounded-2xl border border-emerald-50/40 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-extrabold text-gray-800 text-base flex items-center gap-1.5">
                          <DollarSign className="w-4.5 h-4.5 text-emerald-700" />
                          {lang === "te" ? "ఆర్థిక వ్యయ పట్టికలు" : lang === "hi" ? "वित्तीय लागत पत्रक" : "Financial Cost Sheets"}
                        </h4>
                        <div className="text-right">
                          <span className="text-[9px] uppercase text-gray-400 font-bold block">
                            {lang === "te" ? "మొత్తం నమోదైనది" : lang === "hi" ? "कुल दर्ज" : "Total logged"}
                          </span>
                          <span className="font-black text-emerald-700 text-lg">₹{totalFarmExpenses.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {activeExpenses.map((e) => {
                          const total = Number(e.seedCost) + Number(e.fertilizerCost) + Number(e.laborCost) + Number(e.equipmentCost);
                          return (
                            <div key={e.id} className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100 text-xs">
                              <div className="flex justify-between items-center pb-2 border-b border-gray-100/60 font-bold text-gray-600">
                                <span>{lang === "te" ? "నమోదైన తేదీ" : lang === "hi" ? "दर्ज तिथि" : "Logged on"} {new Date(e.timestamp).toLocaleDateString()}</span>
                                <span className="text-emerald-700 font-extrabold">₹{total.toLocaleString()}</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 pt-1 text-[11px] text-gray-500">
                                <div>
                                  <span className="text-[10px] font-semibold text-gray-400">{lang === "te" ? "విత్తనాలు" : lang === "hi" ? "बीज" : "Seeds"}</span>
                                  <div className="font-bold text-gray-700">₹{e.seedCost}</div>
                                </div>
                                <div>
                                  <span className="text-[10px] font-semibold text-gray-400">{lang === "te" ? "ఎరువులు" : lang === "hi" ? "उर्वरक" : "Fertilizer"}</span>
                                  <div className="font-bold text-gray-700">₹{e.fertilizerCost}</div>
                                </div>
                                <div>
                                  <span className="text-[10px] font-semibold text-gray-400">{lang === "te" ? "కూలీలు" : lang === "hi" ? "मजदूरी" : "Labor"}</span>
                                  <div className="font-bold text-gray-700">₹{e.laborCost}</div>
                                </div>
                                <div>
                                  <span className="text-[10px] font-semibold text-gray-400">{lang === "te" ? "యంత్రాలు" : lang === "hi" ? "मशीनरी" : "Machinery"}</span>
                                  <div className="font-bold text-gray-700">₹{e.equipmentCost}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {activeExpenses.length === 0 && (
                          <div className="text-center py-8 text-xs text-gray-400 flex flex-col items-center gap-1">
                            <Calculator className="w-8 h-8 text-gray-300 animate-bounce" />
                            <span>{lang === "te" ? "ఎలాంటి ఖర్చులు నమోదు కాలేదు. వ్యయాలను పర్యవేక్షించడానికి పైన ఉన్న \"+ ఖర్చును నమోదు చేయి\" బటన్‌ను క్లిక్ చేయండి." : lang === "hi" ? "कोई खर्च दर्ज नहीं किया गया। लागत को ट्रैक करने के लिए ऊपर \"+ व्यय दर्ज करें\" दबाएं।" : "No expenses logged. Press \"+ Log Expense\" above to track cost shares."}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
