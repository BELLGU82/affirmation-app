interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function GradientBackground({ children, className = '' }: GradientBackgroundProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-50 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
