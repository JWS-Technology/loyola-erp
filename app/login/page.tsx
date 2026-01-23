"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, Building2 } from "lucide-react";

// Curated high-quality business images
const backgroundImages = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1950&q=80", // Bright office
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1950&q=80", // Skyscraper bottom view
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1950&q=80", // Modern lobby
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1950&q=80", // Meeting room
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1950&q=80", // Corporate hallway
];

export default function LoginPage() {
  const router = useRouter();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Slideshow State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Cycle images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Simulate API delay (remove in production)
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      if (data.deviceId) localStorage.setItem("deviceId", data.deviceId);

      router.push("/attendance/details");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      
      {/* --- LEFT SIDE: LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 z-20 bg-white shadow-xl lg:shadow-none">
        <div className="w-full max-w-[440px] space-y-8">
          
          {/* Brand / Header */}
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-6">
               <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Building2 className="text-white h-7 w-7" />
               </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Please enter your staff credentials to access the portal.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 sm:text-sm"
                    placeholder="staff@company.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 sm:text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors outline-none focus:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 pt-6">
            &copy; {new Date().getFullYear()} Enterprise Systems Inc. <br/>Authorized personnel only.
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: SLIDESHOW VISUALS --- */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 relative justify-center items-center overflow-hidden">
        
        {/* Slideshow Logic: Map through all images and cross-fade opacity */}
        {backgroundImages.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url('${img}')` }}
          />
        ))}

        {/* Dark Overlay (Stays on top of images) */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-gray-900/50 z-10" />
        
        {/* Content Overlay */}
        <div className="relative z-20 p-12 text-white max-w-lg select-none">
          <div className="mb-8">
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight leading-tight drop-shadow-lg">
              Enterprise <br/>Resource Portal
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed font-light drop-shadow-md">
              Streamline operations, access secure data, and collaborate efficiently across departments.
            </p>
          </div>
          
           {/* Status Card */}
           <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 inline-flex items-center shadow-lg">
            <span className="relative flex h-3 w-3 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-100 text-sm font-medium tracking-wide">Secure Connection Established</span>
          </div>
        </div>
      </div>
    </div>
  );
}