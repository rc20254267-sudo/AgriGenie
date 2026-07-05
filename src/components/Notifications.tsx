/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Bell, CloudRain, AlertTriangle, Droplet, Sprout, Clock, Check, Trash2, Eye } from "lucide-react";
import { NotificationItem, UserProfile } from "../types";
import { translations } from "../translations";

interface NotificationsProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  userProfile?: UserProfile;
}

export default function Notifications({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  userProfile
}: NotificationsProps) {
  const lang = userProfile?.language || "en";
  const t = translations[lang] || translations.en;

  const [filter, setFilter] = useState<"all" | "unread" | "rain" | "disease">("all");

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "rain") return n.type === "rain";
    if (filter === "disease") return n.type === "disease";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{t.notifications}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === "te" 
              ? "వాతావరణ మార్పులు, తెగుళ్ల హెచ్చరికలు మరియు పంట నిర్వహణ నోటీసులతో అప్‌డేట్ అవ్వండి." 
              : lang === "hi" 
              ? "महत्वपूर्ण मौसम परिवर्तन, रोग संबंधी अलर्ट और फसल रखरखाव नोटिस के साथ अपडेट रहें।" 
              : "Stay updated with critical micro-weather changes, pathology alerts, and crop maintenance notices."}
          </p>
        </div>
        
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-extrabold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            {lang === "te" ? "అన్నీ చదివినట్లు గుర్తు పెట్టు" : lang === "hi" ? "सभी को पढ़ा हुआ मार्क करें" : "Mark All as Read"}
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 pb-2 overflow-x-auto border-b border-gray-100">
        <button
          onClick={() => setFilter("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === "all" ? "bg-emerald-700 text-white shadow-xs" : "text-gray-500 hover:bg-gray-100"}`}
        >
          {lang === "te" ? "అన్నీ" : lang === "hi" ? "सभी" : "All Reminders"} ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === "unread" ? "bg-emerald-700 text-white" : "text-gray-500 hover:bg-gray-100"}`}
        >
          {lang === "te" ? "చదవనివి" : lang === "hi" ? "बिना पढ़े" : "Unread Only"} ({notifications.filter(n => !n.isRead).length})
        </button>
        <button
          onClick={() => setFilter("rain")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === "rain" ? "bg-emerald-700 text-white" : "text-gray-500 hover:bg-gray-100"}`}
        >
          {lang === "te" ? "వర్ష సూచనలు" : lang === "hi" ? "बारिश का पूर्वानुमान" : "Rain Forecasts"}
        </button>
        <button
          onClick={() => setFilter("disease")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === "disease" ? "bg-emerald-700 text-white" : "text-gray-500 hover:bg-gray-100"}`}
        >
          {lang === "te" ? "తెగుళ్ల వ్యాప్తి" : lang === "hi" ? "रोग का प्रकोप" : "Disease Outbreaks"}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-w-3xl">
        {filteredNotifications.map((item) => (
          <div
            key={item.id}
            className={`
              p-4 rounded-2xl border transition-all flex justify-between items-start gap-4 relative group
              ${item.isRead 
                ? "bg-white border-gray-100" 
                : "bg-emerald-50/20 border-emerald-100/60 shadow-xs shadow-emerald-700/5"}
            `}
          >
            {/* Status blue-dot indicator */}
            {!item.isRead && (
              <span className="absolute top-4 left-4 w-2 h-2 rounded-full bg-emerald-600 block" />
            )}

            <div className={`flex gap-3.5 ${!item.isRead ? "pl-3" : ""}`}>
              {/* Type Icon */}
              <div className={`
                p-2.5 rounded-xl shrink-0
                ${item.type === "rain" ? "bg-blue-50 text-blue-600" :
                  item.type === "disease" ? "bg-rose-50 text-rose-600" :
                  item.type === "irrigation" ? "bg-cyan-50 text-cyan-600" :
                  "bg-amber-50 text-amber-600"}
              `}>
                {item.type === "rain" ? <CloudRain className="w-5 h-5" /> :
                 item.type === "disease" ? <AlertTriangle className="w-5 h-5" /> :
                 item.type === "irrigation" ? <Droplet className="w-5 h-5" /> :
                 item.type === "fertilizer" ? <Sprout className="w-5 h-5" /> :
                 <Clock className="w-5 h-5" />}
              </div>

              <div>
                <h4 className="font-extrabold text-gray-800 text-sm leading-snug">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.message}</p>
                <span className="text-[10px] text-gray-400 block mt-2">
                  {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!item.isRead && (
                <button
                  onClick={() => onMarkAsRead(item.id)}
                  title="Mark as read"
                  className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onDeleteNotification(item.id)}
                title="Delete notification"
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 flex flex-col items-center gap-3">
            <Bell className="w-10 h-10 text-gray-300" />
            <span className="text-xs text-gray-400">
              {lang === "te" ? "అన్నీ చదివేశారు! ఏ కొత్త నోటిఫికేషన్లు లేవు." : lang === "hi" ? "सभी सूचनाएं पढ़ ली गई हैं! कोई नई सूचना नहीं है।" : "All caught up! No reminders matching the filter criteria."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
