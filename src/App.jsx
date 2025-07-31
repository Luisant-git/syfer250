import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout/Layout"
import LoginPage from "./pages/Login/Login"
import SignupPage from "./pages/Login/Signup"
import Dashboard from "./pages/Dashboard/Dashboard"
// import Campaigns from "./pages/Campaigns/Campaigns"
import NewCampaign from "./pages/NewCampaign/NewCampaign"
// import Templates from "./pages/Templates/Templates"
import MasterInbox from "./pages/MasterInbox/MasterInbox"
import Report from "./pages/Analytics/Reports"
// import Contacts from "./pages/Contacts/Contacts"
import Settings from "./pages/Settings/Settings"
import Profile from "./pages/Profile/Profile"
import Security from "./pages/Security/Security"
import GlobalBlockList from "./pages/GlobalBlockList/GlobalBlockList"
import PlansAndBilling from "./pages/PlansAndBilling/PlansAndBilling"
import "./styles/global.scss"

function App() {
  return (
    <Router>
      <Routes>
        {/* Login route WITHOUT layout */}
        <Route path="/login" element={<LoginPage />} />
         <Route path="/signup" element={<SignupPage/>} />


        {/* All other routes WITH layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/campaigns" element={<Campaigns />} /> */}
          <Route path="/campaigns/new" element={<NewCampaign />} />
          {/* <Route path="/templates" element={<Templates />} /> */}
          <Route path="/inbox" element={<MasterInbox />} />
          <Route path="/report" element={<Report />} />
          {/* <Route path="/contacts" element={<Contacts />} /> */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/security" element={<Security />} />
          <Route path="/global-block-list" element={<GlobalBlockList />} />
          <Route path="/plans-billing" element={<PlansAndBilling />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
