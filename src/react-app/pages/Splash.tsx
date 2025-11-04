import { useEffect } from "react";
import { useNavigate } from "react-router";
import GradientBackground from "@/react-app/components/GradientBackground";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/tutorial/1");
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <GradientBackground>
      {/* --- MAIN CONTAINER --- */}
      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
        {/* --- BACKGROUND GRADIENT (soft mist + indigo + lavender) --- */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#CFE4F6] via-[#cdd9fa] to-[#a9c0fd] blur-3xl opacity-70" />

        {/* --- GLASS OVERLAY for subtle frosted effect --- */}
        <div className="absolute inset-0 backdrop-blur-[60px] bg-white/20" />

        {/* --- CENTERED LOGO SPHERE --- */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          {/* glowing orb */}
          <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-[#cdd9fa] to-[#CFE4F6] shadow-[inset_8px_8px_20px_rgba(255,255,255,0.4),inset_-8px_-8px_20px_rgba(0,0,0,0.05)] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#a9c0fd]/50 to-transparent opacity-50 blur-2xl" />
            <img
              src="/logo.png"
              alt="Affirm Logo"
              className="relative w-24 h-24 object-contain opacity-95 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
            />
          </div>

          {/* text content */}
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold text-[#2C2C34] tracking-wide mb-2">
              Affirm
            </h1>
            <p className="text-[#4A4A56] font-medium text-base opacity-90">
              AI affirmations that evolve with you
            </p>
          </div>
        </div>

        {/* --- FLOATING PULSE ELEMENT BELOW --- */}
        <div className="absolute bottom-20 animate-bounce">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CFE4F6] to-[#a9c0fd] opacity-70 blur-md shadow-inner shadow-white/30" />
        </div>
      </div>
    </GradientBackground>
  );
}
