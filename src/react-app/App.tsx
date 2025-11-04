import { BrowserRouter as Router, Routes, Route } from "react-router";
import { useEffect } from "react";
import Splash from "@/react-app/pages/Splash";
import Tutorial1 from "@/react-app/pages/Tutorial1";
import Tutorial2 from "@/react-app/pages/Tutorial2";
import Tutorial3 from "@/react-app/pages/Tutorial3";
import Signup from "@/react-app/pages/Signup";
import Questions1 from "@/react-app/pages/Questions1";
import Questions2 from "@/react-app/pages/Questions2";
import Questions3 from "@/react-app/pages/Questions3";
import Questions4 from "@/react-app/pages/Questions4";
import VoiceSetup from "@/react-app/pages/VoiceSetup";
import HomePage from "@/react-app/pages/Home";
import Player from "@/react-app/pages/Player";
import Favorites from "@/react-app/pages/Favorites";
import Settings from "@/react-app/pages/Settings";

export default function App() {
  // Clear all localStorage data on app start
  useEffect(() => {
    // List of all localStorage keys used in the app
    const keysToRemove = [
      "currentAffirmation",
      "selected_voice",
      "notification-settings",
      "preferred_tone",
      "emotional_state",
      "focus_areas",
      "style",
      "affirm-audio-settings",
    ];

    // Remove all keys
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Also clear any other localStorage items that might exist
    // (in case there are any we missed)
    const allKeys = Object.keys(localStorage);
    allKeys.forEach((key) => {
      if (
        key.startsWith("affirm-") ||
        key.includes("affirmation") ||
        key.includes("preference") ||
        key.includes("voice") ||
        key.includes("question")
      ) {
        localStorage.removeItem(key);
      }
    });

    console.log("LocalStorage cleared on app start");
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/tutorial/1" element={<Tutorial1 />} />
        <Route path="/tutorial/2" element={<Tutorial2 />} />
        <Route path="/tutorial/3" element={<Tutorial3 />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/questions/1" element={<Questions1 />} />
        <Route path="/questions/2" element={<Questions2 />} />
        <Route path="/questions/3" element={<Questions3 />} />
        <Route path="/questions/4" element={<Questions4 />} />
        <Route path="/voice-setup" element={<VoiceSetup />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/player" element={<Player />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}
