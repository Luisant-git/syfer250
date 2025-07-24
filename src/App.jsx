import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout/Layout"
import Dashboard from "./pages/Dashboard/Dashboard"
// import Campaigns from "./pages/Campaigns/Campaigns"
import NewCampaign from "./pages/NewCampaign/NewCampaign"
// import Templates from "./pages/Templates/Templates"
import MasterInbox from "./pages/MasterInbox/MasterInbox"
// import Analytics from "./pages/Analytics/Analytics"
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
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/campaigns" element={<Campaigns />} /> */}
          <Route path="/campaigns/new" element={<NewCampaign />} />
          {/* <Route path="/templates" element={<Templates />} /> */}
          <Route path="/inbox" element={<MasterInbox />} />
          {/* <Route path="/analytics" element={<Analytics />} /> */}
          {/* <Route path="/contacts" element={<Contacts />} /> */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/security" element={<Security />} />
          <Route path="/global-block-list" element={<GlobalBlockList />} />
          <Route path="/plans-billing" element={<PlansAndBilling />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
