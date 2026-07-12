import { motion, AnimatePresence } from "framer-motion";
import { X, User, Bell, LogOut, LogIn, Moon, Sun, Monitor, Clock, Send, XCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback } from "react";
import { notificationAPI } from "@/lib/api";
import {
  isPushSupported,
  getPermissionStatus,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribedToPush,
} from "@/lib/notifications";
import { toast } from "sonner";

interface SettingsModalProps {
  onClose: () => void;
  onLogout: () => void;
}

export default function SettingsModal({ onClose, onLogout }: SettingsModalProps) {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | "unsupported">("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSavingTime, setIsSavingTime] = useState(false);

  // Prevent hydration mismatch for next-themes
  useEffect(() => setMounted(true), []);

  // Disable body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Load notification preferences and status on mount
  useEffect(() => {
    const loadNotificationState = async () => {
      // Check browser support & permission
      setPermissionStatus(getPermissionStatus());
      const subscribed = await isSubscribedToPush();
      setIsSubscribed(subscribed);

      // Load preferences from backend
      try {
        const response = await notificationAPI.getPreferences();
        const prefs = response.data.preferences;
        setNotificationsEnabled(prefs.notificationEnabled);
        if (prefs.reminderTime) {
          // Format to HH:MM
          setReminderTime(prefs.reminderTime.substring(0, 5));
        }
      } catch (error) {
        console.error("Failed to load notification preferences:", error);
      }
    };

    loadNotificationState();
  }, []);

  /**
   * Toggle notification subscription on/off
   */
  const handleToggleNotifications = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    // Simpan state lama untuk rollback
    const prevEnabled = notificationsEnabled;
    const prevSubscribed = isSubscribed;

    // Optimistic Update: Langsung ubah UI sebelum proses selesai
    setNotificationsEnabled(!prevEnabled);
    setIsSubscribed(!prevEnabled);

    try {
      if (prevEnabled) {
        // --- Turning OFF ---
        // Unsubscribe from push
        const endpoint = await unsubscribeFromPush();
        if (endpoint) {
          await notificationAPI.unsubscribe(endpoint);
        }

        // Update backend preference
        await notificationAPI.updatePreferences({ notificationEnabled: false });
        toast.success("Notifications disabled");
      } else {
        // --- Turning ON ---
        if (!isPushSupported()) {
          // Rollback
          setNotificationsEnabled(prevEnabled);
          setIsSubscribed(prevSubscribed);
          toast.error("Browser kamu tidak mendukung push notifications");
          setIsLoading(false);
          return;
        }

        // Request permission & subscribe
        const subscriptionData = await subscribeToPush();

        if (!subscriptionData) {
          // Rollback
          setNotificationsEnabled(prevEnabled);
          setIsSubscribed(prevSubscribed);
          setPermissionStatus(getPermissionStatus());
          if (getPermissionStatus() === "denied") {
            toast.error("Notification permission ditolak. Silakan aktifkan di settings browser.");
          } else {
            toast.error("Gagal mengaktifkan notifications");
          }
          setIsLoading(false);
          return;
        }

        // Send subscription to backend
        await notificationAPI.subscribe(subscriptionData);

        // Update backend preference
        await notificationAPI.updatePreferences({ notificationEnabled: true });
        setPermissionStatus("granted");
        toast.success("Notifications enabled! 🔔");
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      // Rollback jika terjadi error di backend atau API
      setNotificationsEnabled(prevEnabled);
      setIsSubscribed(prevSubscribed);
      toast.error("Gagal mengubah pengaturan notifikasi");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, notificationsEnabled, isSubscribed]);

  /**
   * Save reminder time to backend
   */
  const handleReminderTimeChange = useCallback(async (newTime: string) => {
    setReminderTime(newTime);
    setIsSavingTime(true);
    try {
      await notificationAPI.updatePreferences({ reminderTime: newTime });
      toast.success(`Reminder time set to ${newTime}`);
    } catch (error) {
      console.error("Failed to update reminder time:", error);
      toast.error("Gagal menyimpan waktu reminder");
    } finally {
      setIsSavingTime(false);
    }
  }, []);

  /**
   * Send a test notification
   */
  const handleSendTest = useCallback(async () => {
    if (isSendingTest) return;
    setIsSendingTest(true);
    try {
      await notificationAPI.sendTest();
      toast.success("Test notification sent! 🔔");
    } catch (error) {
      console.error("Failed to send test notification:", error);
      toast.error("Gagal mengirim test notification");
    } finally {
      setIsSendingTest(false);
    }
  }, [isSendingTest]);

  /**
   * Render permission status badge
   */
  const renderPermissionBadge = () => {
    if (!isPushSupported()) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <XCircle className="w-3.5 h-3.5 text-red-500" />
          Not supported
        </div>
      );
    }
  };

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
        className="relative z-10 w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/10 flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/20 dark:border-white/10 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl rounded-t-3xl sm:rounded-t-2xl shadow-sm">
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
            <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-zinc-800/40 backdrop-blur-md rounded-2xl border border-white/40 dark:border-white/5 shadow-sm">
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
            <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-zinc-800/40 backdrop-blur-md rounded-2xl border border-white/40 dark:border-white/5 shadow-sm">
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

            {/* ============ NOTIFICATIONS SECTION ============ */}
            <div className="space-y-3 p-4 bg-white/60 dark:bg-zinc-800/40 backdrop-blur-md rounded-2xl border border-white/40 dark:border-white/5 shadow-sm">
              
              {/* Main toggle row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Notifications</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Daily reminders</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {renderPermissionBadge()}
                  <button
                    type="button"
                    onClick={handleToggleNotifications}
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
                      notificationsEnabled && isSubscribed
                        ? "bg-blue-600 dark:bg-blue-500"
                        : "bg-zinc-200 dark:bg-zinc-700"
                    }`}
                  >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
                          notificationsEnabled && isSubscribed ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                  </button>
                </div>
              </div>

              {/* Expanded notification settings */}
              <AnimatePresence>
                {notificationsEnabled && isSubscribed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 space-y-3 border-t border-zinc-100 dark:border-zinc-700/50">
                      
                      {/* Reminder Time Picker */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-zinc-400" />
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">Reminder Time</span>
                        </div>
                        <div className="relative flex items-center gap-2">
                          {isSavingTime && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                          )}
                          <input
                            type="time"
                            value={reminderTime}
                            onChange={(e) => handleReminderTimeChange(e.target.value)}
                            className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all [&::-webkit-calendar-picker-indicator]:dark:invert"
                          />
                        </div>
                      </div>

                      {/* Send Test Notification */}
                      <button
                        onClick={handleSendTest}
                        disabled={isSendingTest}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {isSendingTest ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {isSendingTest ? "Sending..." : "Send Test Notification"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Blocked permission hint */}
              {permissionStatus === "denied" && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                  Notifications blocked. Buka browser settings → Site Settings → Notifications untuk mengaktifkan.
                </p>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            {user?.isAnonymous ? (
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 p-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl transition-colors font-semibold text-sm"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            ) : (
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-2xl transition-colors font-semibold text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
