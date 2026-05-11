"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, LockKeyholeIcon } from "lucide-react";
import { isAxiosError } from "@/utils/errorHandlers";
import { GoogleCredentialResponse, GoogleLogin } from "@react-oauth/google";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    loginWithGoogle,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push("/");
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.error ||
            "Login failed. Please check your credentials.",
        );
      } else if (error instanceof Error) {
        toast.error(
          "Login failed. Invalid email or password. Please try again.",
        );
      } else {
        toast.error("Login failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: GoogleCredentialResponse,
  ) => {
    if (credentialResponse.credential) {
      setLoading(true);
      try {
        await loginWithGoogle(credentialResponse.credential);
        router.push("/");
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          toast.error(
            error.response?.data?.error ||
              "Login failed. Please check your credentials.",
          );
        } else if (error instanceof Error) {
          toast.error(
            "Login failed. Invalid email or password. Please try again.",
          );
        } else {
          toast.error("Login failed. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 transition-colors">
      <div className="w-full max-w-sm">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-900 dark:bg-zinc-100 rounded-xl shadow-sm mb-6">
            <LockKeyholeIcon className="w-6 h-6 text-white dark:text-zinc-900" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Time to Lock In!
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
              Email
            </label>
            <div className="relative group">
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent outline-none transition-all placeholder:text-zinc-400 text-sm"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
              Password
            </label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent outline-none transition-all placeholder:text-zinc-400 text-sm pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-600 dark:text-zinc-400 select-none">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 bg-transparent"
              />
              Remember me
            </label>
            <button
              type="button"
              className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <div className="pt-2 flex items-start gap-2 group">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
              <label htmlFor="terms-checkbox" className="cursor-pointer">
                By continuing with an account, you agree to our{" "}
              </label>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-zinc-900 dark:text-zinc-100 hover:underline font-medium"
                  >
                    Terms of Service
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Terms of Service</DialogTitle>
                    <DialogDescription>
                      Please read these terms carefully before using our
                      application.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="text-sm text-zinc-600 dark:text-zinc-300 space-y-4 mt-4">
                    <p>
                      <strong>1. Acceptance of Terms</strong>
                      <br />
                      By accessing or using our service, you agree to be bound
                      by these Terms of Service.
                    </p>
                    <p>
                      <strong>2. Use of Service</strong>
                      <br />
                      You agree to use the service only for lawful purposes and
                      in a way that does not infringe the rights of others.
                    </p>
                    <p>
                      <strong>3. Privacy</strong>
                      <br />
                      Your use of the service is also governed by our Privacy
                      Policy. Please review it to understand our practices.
                    </p>
                    <p>
                      <strong>4. Account Security</strong>
                      <br />
                      You are responsible for safeguarding your account password
                      and any activities or actions under your account.
                    </p>
                    <p>
                      <strong>5. Modifications</strong>
                      <br />
                      We reserve the right to modify or replace these terms at
                      any time. Changes will be effective upon posting.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>{" "}
              and{" "}
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-zinc-900 dark:text-zinc-100 hover:underline font-medium"
                  >
                    Privacy Policy
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Privacy Policy</DialogTitle>
                    <DialogDescription>
                      How we collect, use, and protect your data.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="text-sm text-zinc-600 dark:text-zinc-300 space-y-4 mt-4">
                    <p>
                      <strong>1. Information Collection</strong>
                      <br />
                      We collect information you provide directly to us, such as
                      your name, email address, and habit tracking data.
                    </p>
                    <p>
                      <strong>2. Use of Information</strong>
                      <br />
                      We use the information to provide, maintain, and improve
                      our services, as well as to communicate with you.
                    </p>
                    <p>
                      <strong>3. Information Sharing</strong>
                      <br />
                      We do not share your personal information with third
                      parties except as necessary to provide our services or
                      comply with the law.
                    </p>
                    <p>
                      <strong>4. Data Security</strong>
                      <br />
                      We implement appropriate security measures to protect your
                      personal information from unauthorized access.
                    </p>
                    <p>
                      <strong>5. Your Rights</strong>
                      <br />
                      You have the right to access, update, or delete your
                      personal information at any time through your account
                      settings.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-2 text-sm shadow-sm"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-50 dark:bg-zinc-950 px-2 text-zinc-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Login */}
        <div className="w-full flex justify-center">
          <div className="w-full rounded-xl overflow-hidden flex justify-center border border-zinc-200 dark:border-zinc-800 shadow-sm [&>div]:w-full [&_iframe]:w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                toast.error("Google Login failed");
              }}
              useOneTap
              shape="rectangular"
              theme="outline"
              text="signin_with"
              size="large"
              width="400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline decoration-zinc-900/20 underline-offset-4"
            >
              Create account
            </Link>
          </p>

          {/* Demo Account (Optional styling update) */}
          <div className="text-xs text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-900/50 py-3 px-4 rounded-lg inline-block text-left mx-auto border border-zinc-200 dark:border-zinc-800">
            <div className="font-medium mb-1 text-zinc-500">Demo Account:</div>
            <div className="font-mono">laz@mail.com / 12345678</div>
          </div>
        </div>
      </div>
    </div>
  );
}
