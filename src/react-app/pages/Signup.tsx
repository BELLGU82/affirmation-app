import { useState } from "react";
import { useNavigate } from "react-router";
import GradientBackground from "@/react-app/components/GradientBackground";
import Button from "@/react-app/components/Button";
import { Mail, User } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store userId for future use
        localStorage.setItem("userId", data.userId);
        navigate("/questions/1");
      } else {
        setError(data.error || "Failed to create account");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen px-6 py-12">
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/25">
              <img
                src="/logo.png"
                alt="Affirm Logo"
                className="w-10 h-10 opacity-90"
              />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Welcome to Affirm
            </h1>
            <p className="text-gray-600">
              Let's create your personalized affirmation experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-gray-800 placeholder-gray-500"
                  required
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-gray-800 placeholder-gray-500"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4 pt-4">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
                disabled={loading}
              >
                Continue
              </Button>

              <p className="text-xs text-gray-500 text-center leading-relaxed">
                By continuing, you agree to our Terms of Service and Privacy
                Policy. We'll send you personalized affirmations and updates.
              </p>
            </div>
          </form>
        </div>
      </div>
    </GradientBackground>
  );
}
