import { motion } from "framer-motion";
import { X, User, Bell, LogOut, Moon, Sun, Monitor } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface SettingsModalProps {
  onClose: () => void;
  onLogout: () => void;
}

export default function SettingsModal({ onClose, onLogout }: SettingsModalProps) {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Prevent hydration mismatch for next-themes
  useEffect(() => setMounted(true), []);

  // Disable body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/40 backdrop-blur-sm"
    >
      <div
        className="fixed inset-0 z-0"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative z-10 w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-zinc-50 dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Account Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Account
            </h3>
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700/50">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {user?.email || "No email provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Preferences
            </h3>
            
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Appearance</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Customize your theme</p>
                </div>
              </div>
              
              {mounted && (
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 border border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={() => setTheme("light")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      theme === "light" 
                        ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100" 
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      theme === "system" 
                        ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100" 
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      theme === "dark" 
                        ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100" 
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Notifications</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Daily reminders</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
                  notificationsEnabled ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notificationsEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-2xl transition-colors font-semibold text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
