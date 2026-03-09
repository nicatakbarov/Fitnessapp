import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MyProgramsPage from "./pages/MyProgramsPage";
import ProgramDetailPage from "./pages/ProgramDetailPage";
import DayWorkoutPage from "./pages/DayWorkoutPage";
import NutritionPage from "./pages/NutritionPage";
import ProgressPage from "./pages/ProgressPage";
import BrowseProgramsPage from "./pages/BrowseProgramsPage";
import OnboardingPage from "./pages/OnboardingPage";

function App() {
  useEffect(() => {
    const platform = Capacitor.getPlatform();
    if (platform === 'ios' || platform === 'android') {
      document.body.classList.add('safe-area-padding');
    }
  }, []);
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-programs" element={<MyProgramsPage />} />
          <Route path="/program/:id" element={<ProgramDetailPage />} />
          <Route path="/program/:id/day/:dayId" element={<DayWorkoutPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/browse" element={<BrowseProgramsPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
