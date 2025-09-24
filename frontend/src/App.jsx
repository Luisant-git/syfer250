import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Layout from "./components/Layout/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import LoginPage from "./pages/Login/Login"
import SignupPage from "./pages/Login/Signup"
import Dashboard from "./pages/Dashboard/Dashboard"
import NewCampaign from "./pages/NewCampaign/NewCampaign"
import CampaignView from "./pages/Campaigns/CampaignView"
import CampaignEdit from "./pages/Campaigns/CampaignEdit"
import MasterInbox from "./pages/MasterInbox/MasterInbox"
import Report from "./pages/Analytics/Reports"
import Settings from "./pages/Settings/Settings"
import Profile from "./pages/Profile/Profile"
import Security from "./pages/Security/Security"
import GlobalBlockList from "./pages/GlobalBlockList/GlobalBlockList"
import PlansAndBilling from "./pages/PlansAndBilling/PlansAndBilling"
import ReceivedEmails from "./pages/Emails/ReceivedEmails"
import OAuthCallback from "./pages/OAuthCallback"
import "./styles/global.scss"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/campaigns/new" element={<NewCampaign />} />
            <Route path="/campaigns/:id" element={<CampaignView />} />
            <Route path="/campaigns/:id/edit" element={<CampaignEdit />} />
            <Route path="/inbox" element={<MasterInbox />} />
            <Route path="/report" element={<Report />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/security" element={<Security />} />
            <Route path="/global-block-list" element={<GlobalBlockList />} />
            <Route path="/plans-billing" element={<PlansAndBilling />} />
            <Route path="/emails" element={<ReceivedEmails />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
