/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  LayoutDashboard, 
  Sprout, 
  Camera, 
  Droplet, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  Globe
} from "lucide-react";
import { UserProfile } from "../types";
import { translations } from "../translations";

export type ViewType = 
  | "dashboard" 
  | "farm-management" 
  | "disease" 
  | "irrigation" 
  | "yield" 
  | "chat" 
  | "reports" 
  | "notifications" 
  | "profile" 
  | "settings";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  userProfile: UserProfile;
  onLogout: () => void;
  unreadCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLanguageChange?: (lang: "en" | "te" | "hi") => void;
}

export default function Sidebar({ 
  currentView, 
  onViewChange, 
  userProfile, 
  onLogout,
  unreadCount,
  darkMode,
  onToggleDarkMode,
  onLanguageChange
}: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const lang = userProfile.language || "en";
  const t = translations[lang] || translations.en;

  const menuItems: Array<{ id: ViewType; label: string; icon: any; badge?: number }> = [
    { id: "dashboard", label: t.dashboard, icon: LayoutDashboard },
    { id: "farm-management", label: t.farmManagement, icon: Sprout },
    { id: "disease", label: t.diseaseDetection, icon: Camera },
    { id: "irrigation", label: t.smartIrrigation, icon: Droplet },
    { id: "yield", label: t.yieldPrediction, icon: TrendingUp },
    { id: "chat", label: t.aiAssistant, icon: MessageSquare },
    { id: "reports", label: t.aiReports, icon: FileText },
    { id: "notifications", label: t.notifications, icon: Bell, badge: unreadCount },
    { id: "profile", label: t.profile, icon: User },
    { id: "settings", label: t.settings, icon: Settings },
  ];

  const handleNav = (viewId: ViewType) => {
    onViewChange(viewId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="lg:hidden h-16 bg-white/40 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/20 dark:border-white/10 px-4 flex items-center justify-between sticky top-0 z-30 shadow-xs w-full">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#2E7D32] rounded-lg text-white shadow-md">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg text-[#1B4332] dark:text-emerald-400 tracking-tight">{t.appName}</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Quick Language Cycle button on Mobile header */}
          <button
            onClick={() => {
              const languages: Array<"en" | "te" | "hi"> = ["en", "te", "hi"];
              const nextIndex = (languages.indexOf(lang as any) + 1) % languages.length;
              onLanguageChange?.(languages[nextIndex]);
            }}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-[#2E7D32] dark:hover:text-emerald-400 focus:outline-none cursor-pointer flex items-center gap-1"
            title="Cycle Language"
          >
            <Globe className="w-4 h-4 text-[#2E7D32] dark:text-emerald-400" />
            <span className="text-[10px] font-bold uppercase">{lang}</span>
          </button>
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-[#2E7D32] dark:hover:text-emerald-400 focus:outline-none cursor-pointer"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-[#2E7D32] dark:hover:text-emerald-400 focus:outline-none"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/10 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar Panel (Desktop persistent, Mobile drawer) */}
      <aside className={`
        fixed top-16 lg:top-0 bottom-0 left-0 z-40 bg-white/40 dark:bg-[#0F172A]/80 backdrop-blur-xl border-r border-white/30 dark:border-white/10 flex flex-col justify-between transition-all duration-300 lg:shadow-none
        ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
        ${collapsed ? "lg:w-20" : "lg:w-64"}
      `}>
        {/* Branding (Desktop Only) */}
        <div className="hidden lg:flex h-20 px-6 border-b border-white/20 dark:border-white/10 items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2.5 bg-[#2E7D32] rounded-xl text-white shrink-0 shadow-lg shadow-[#2E7D32]/10">
              <Sprout className="w-6 h-6" />
            </div>
            {!collapsed && (
              <span className="font-extrabold text-xl text-[#1B4332] dark:text-emerald-400 tracking-tight whitespace-nowrap font-display">
                {t.appName}
              </span>
            )}
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-[#2E7D32] dark:hover:text-emerald-400 hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id as ViewType)}
                className={`
                  w-full flex items-center gap-3.5 py-3 px-3.5 rounded-xl text-sm font-medium transition-all group relative border cursor-pointer
                  ${isActive 
                    ? "bg-white/60 dark:bg-slate-800/60 text-[#2E7D32] dark:text-emerald-400 border-white/40 dark:border-white/10 shadow-xs font-semibold" 
                    : "text-slate-600 dark:text-slate-400 border-transparent hover:text-[#2E7D32] dark:hover:text-emerald-400 hover:bg-white/40 dark:hover:bg-slate-800/40"}
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[#2E7D32] dark:text-emerald-400" : "text-slate-400 dark:text-slate-500 group-hover:text-[#2E7D32] dark:group-hover:text-emerald-400"}`} />
                
                {(!collapsed || mobileOpen) && (
                  <span className="truncate">{item.label}</span>
                )}

                {/* Badge indicator */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`
                    absolute right-3 top-3 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none shrink-0
                    ${isActive ? "bg-[#2E7D32] text-white" : "bg-red-500 text-white"}
                    ${collapsed && !mobileOpen ? "right-1.5 top-1.5" : ""}
                  `}>
                    {item.badge}
                  </span>
                )}

                {/* Tooltip for collapsed mode */}
                {collapsed && !mobileOpen && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-md">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Gemini Status Banner */}
        {!collapsed && (
          <div className="px-4 py-2">
            <div className="bg-[#2E7D32] dark:bg-[#1B4332]/80 border dark:border-white/10 p-4 rounded-2xl text-white shadow-md">
              <p className="text-[10px] opacity-80 uppercase font-bold tracking-widest font-display">Gemini AI Status</p>
              <p className="text-xs font-medium mt-1.5 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Online & Analyzing
              </p>
            </div>
          </div>
        )}

        {/* Theme & Language Selectors (Desktop) */}
        {/* Language Selection Panel */}
        <div className="px-4 py-1.5">
          <div className="relative group w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl text-sm font-medium transition-all border bg-white/20 dark:bg-slate-800/20 text-slate-600 dark:text-slate-300 border-white/10 dark:border-white/5 hover:bg-white/40 dark:hover:bg-slate-800/40">
            <Globe className="w-5 h-5 shrink-0 text-[#2E7D32] dark:text-emerald-400" />
            
            {(!collapsed || mobileOpen) ? (
              <div className="flex-1 flex items-center justify-between gap-1 overflow-hidden">
                <span className="text-[10px] font-bold uppercase text-[#2E7D32] dark:text-emerald-400">{t.language}:</span>
                <select
                  value={lang}
                  onChange={(e) => onLanguageChange?.(e.target.value as "en" | "te" | "hi")}
                  className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer p-0 select-none min-w-[70px]"
                >
                  <option value="en" className="dark:bg-slate-900 dark:text-slate-100">English</option>
                  <option value="te" className="dark:bg-slate-900 dark:text-slate-100">తెలుగు</option>
                  <option value="hi" className="dark:bg-slate-900 dark:text-slate-100">हिन्दी</option>
                </select>
              </div>
            ) : (
              <button
                onClick={() => {
                  const languages: Array<"en" | "te" | "hi"> = ["en", "te", "hi"];
                  const nextIndex = (languages.indexOf(lang as any) + 1) % languages.length;
                  onLanguageChange?.(languages[nextIndex]);
                }}
                className="absolute inset-0 w-full h-full cursor-pointer rounded-xl"
                title="Cycle Language"
              />
            )}

            {/* Tooltip for collapsed mode */}
            {collapsed && !mobileOpen && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-md">
                {lang === "en" ? "English" : lang === "te" ? "తెలుగు" : "हिन्दी"}
              </div>
            )}
          </div>
        </div>

        {/* Theme Toggle Panel (Desktop) */}
        <div className="px-4 py-1.5">
          <button
            onClick={onToggleDarkMode}
            className={`
              w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl text-sm font-medium transition-all group relative border cursor-pointer
              bg-white/20 dark:bg-slate-800/20 text-slate-600 dark:text-slate-300 border-white/10 dark:border-white/5 hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-[#2E7D32] dark:hover:text-emerald-400
            `}
          >
            {darkMode ? (
              <>
                <Sun className="w-5 h-5 shrink-0 text-amber-500" />
                {(!collapsed || mobileOpen) && <span className="truncate">{t.lightTheme}</span>}
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 shrink-0 text-blue-400" />
                {(!collapsed || mobileOpen) && <span className="truncate">{t.darkTheme}</span>}
              </>
            )}

            {/* Tooltip for collapsed mode */}
            {collapsed && !mobileOpen && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-md">
                {darkMode ? t.lightTheme : t.darkTheme}
              </div>
            )}
          </button>
        </div>

        {/* User Card & Logout Button */}
        <div className="p-4 border-t border-white/20 dark:border-white/10 bg-white/20 dark:bg-slate-900/40 backdrop-blur-md shrink-0">
          {!collapsed || mobileOpen ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2E7D32] text-white font-bold flex items-center justify-center shadow-inner font-display">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{userProfile.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userProfile.location}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full py-2.5 px-3 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/50 dark:bg-slate-800/40"
              >
                <LogOut className="w-4 h-4" />
                {t.signOut}
              </button>
            </div>
          ) : (
            <button
              onClick={onLogout}
              className="w-full py-2.5 text-red-500 hover:text-red-700 hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-xl flex items-center justify-center transition-all group relative cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-md">
                {t.signOut}
              </div>
            </button>
          )}
        </div>
      </aside>
    </>
  );

}
