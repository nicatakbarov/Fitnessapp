import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MyProgramsPage from "./pages/MyProgramsPage";
import ProgramDetailPage from "./pages/ProgramDetailPage";
import DayWorkoutPage from "./pages/DayWorkoutPage";

function App() {
  return (
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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
