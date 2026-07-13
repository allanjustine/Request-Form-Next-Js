"use client";

import { useEffect, useState } from "react";
import building from "@/assets/building.jpg";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import BounceLoader from "react-spinners/ClipLoader";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../../../context/AuthContext";
import { useRouter } from "next/navigation";
import guestPage from "@/lib/guestPage";
import { EyeIcon, EyeSlashIcon, XCircleIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";

type UserCredentials = z.infer<typeof schema>;

const schema = z.object({
  email: z.string().min(3).max(50),
  password: z.string().min(5).max(20),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, error, setError } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserCredentials>({
    resolver: zodResolver(schema),
  });
  const router = useRouter();

  useEffect(() => {
    Swal.close();
  }, []);

  const submitData: SubmitHandler<UserCredentials> = async (data) => {
    setLoading(true);
    try {
      await login(data);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="relative flex items-center justify-center w-full lg:w-1/2 p-6">
        {/* Mobile background */}
        <Image
          className="absolute inset-0 z-0 object-cover w-full h-full lg:hidden"
          fill
          src={building}
          alt="background"
        />
        <div className="absolute inset-0 z-0 bg-black/40 lg:hidden" />

        <div className="relative z-10 w-full max-w-lg border border-base-300 rounded-2xl">
          {/* Card */}
          <div className="bg-base-100 rounded-2xl shadow-2xl p-8 lg:p-10">
            {/* Header */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-primary hover:opacity-70 transition-opacity mb-6 flex items-center gap-1 text-xs font-medium"
              >
                ← Back to home
              </button>
              <h1 className="text-2xl font-bold text-base-content">
                Welcome back
              </h1>
              <p className="text-sm text-base-content/50 mt-1">
                Sign in to your account to continue
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 px-4 py-3 mb-6 text-error bg-error/10 border border-error/30 rounded-xl">
                <XCircleIcon className="w-5 h-5 text-error mt-0.5 shrink-0" />
                <span className="text-sm flex-1">{error}</span>
                <button
                  onClick={() => setError("")}
                  className="text-error/60 hover:text-error transition-colors"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit(submitData)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Email / Username / Employee ID
                </label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value:
                        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
                      message: "Invalid email address",
                    },
                  })}
                  placeholder="Enter your email / username / employee ID"
                  className={`w-full h-11 px-4 rounded-xl bg-base-200 border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base-content placeholder:text-base-content/40 autofill-input ${
                    errors.email ? "border-error" : "border-transparent"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-error">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-base-content">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Enter your password"
                    className={`w-full h-11 px-4 pr-11 rounded-xl bg-base-200 border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base-content placeholder:text-base-content/40 autofill-input ${
                      errors.password ? "border-error" : "border-transparent"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-error">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                className="w-full h-11 bg-primary hover:opacity-90 active:scale-[0.98] text-primary-content font-semibold rounded-xl transition-all flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading || !!errors.email || !!errors.password}
              >
                {loading ? (
                  <BounceLoader color="#FFFFFF" size={20} />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-base-content/50">
              Don't have an account?{" "}
              <Link
                href="/registration"
                className="text-primary font-semibold hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — decorative image */}
      <div className="hidden lg:block w-1/2 relative">
        <Image
          fill
          className="object-cover rounded-l-[150px]"
          src={building}
          alt="decorative"
          priority
        />
        <div className="absolute inset-0 bg-primary/10 rounded-l-[150px]" />
      </div>
    </div>
  );
};

export default guestPage(Login);
