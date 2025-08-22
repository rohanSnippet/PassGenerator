import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./AuthContext";
import "./index.css"; // Assuming you have a basic CSS file or use Tailwind CSS
import MultistepForm from "./components/MutlistepForm";
import Review from "./components/Review";
import PdfDownloader from "./components/PdfDownloader";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/multistep-form"
              element={
                <ProtectedRoute>
                  <MultistepForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review"
              element={
                <ProtectedRoute>
                  <Review />
                </ProtectedRoute>
              }
            />
            <Route
              path="/download-pdf"
              element={
                <ProtectedRoute>
                  <PdfDownloader />
                </ProtectedRoute>
              }
            />

            {/* Default redirect to login */}
            <Route path="*" element={<Login />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
};

export default App;
