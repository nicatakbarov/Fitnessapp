import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
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
import CreateCustomPlanPage from "./pages/CreateCustomPlanPage";
import HomeSetupPage from "./pages/HomeSetupPage";
import GeneratingPage from "./pages/GeneratingPage";

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/my-programs" element={<MyProgramsPage />} />
            <Route path="/program/:id" element={<ProgramDetailPage />} />
            <Route path="/program/:id/day/:dayId" element={<DayWorkoutPage />} />
            <Route path="/nutrition" element={<NutritionPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/browse" element={<BrowseProgramsPage />} />
            <Route path="/create-plan" element={<CreateCustomPlanPage />} />
            <Route path="/home-setup" element={<HomeSetupPage />} />
            <Route path="/generating" element={<GeneratingPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </LanguageProvider>
  );
}

export default App;
