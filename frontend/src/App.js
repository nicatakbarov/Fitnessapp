import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MyProgramsPage from "./pages/MyProgramsPage";
import ProgramDetailPage from "./pages/ProgramDetailPage";
import DayWorkoutPage from "./pages/DayWorkoutPage";
import AIChatPage from "./pages/AIChatPage";
import ProgressPage from "./pages/ProgressPage";
import BrowseProgramsPage from "./pages/BrowseProgramsPage";
import CreateCustomPlanPage from "./pages/CreateCustomPlanPage";
import HomeSetupPage from "./pages/HomeSetupPage";
import GeneratingPage from "./pages/GeneratingPage";
import PersonalPlanPage from "./pages/PersonalPlanPage";
import CaloriePage from "./pages/CaloriePage";
import ProfilePage from "./pages/ProfilePage";

// "/" route-unda: ilk açılışda onboarding, sonra landing page
const RootRedirect = () => {
  const onboardingDone = localStorage.getItem('onboarding_done');
  const user = localStorage.getItem('user');
  if (user) return <Navigate to="/dashboard" replace />;
  if (!onboardingDone) return <Navigate to="/onboarding" replace />;
  return <LandingPage />;
};

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/my-programs" element={<MyProgramsPage />} />
            <Route path="/program/:id" element={<ProgramDetailPage />} />
            <Route path="/program/:id/day/:dayId" element={<DayWorkoutPage />} />
            <Route path="/nutrition" element={<AIChatPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/browse" element={<BrowseProgramsPage />} />
            <Route path="/create-plan" element={<CreateCustomPlanPage />} />
            <Route path="/home-setup" element={<HomeSetupPage />} />
            <Route path="/generating" element={<GeneratingPage />} />
            <Route path="/personal-plan" element={<PersonalPlanPage />} />
            <Route path="/calorie" element={<CaloriePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </LanguageProvider>
  );
}

export default App;
