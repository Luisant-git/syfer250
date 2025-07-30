import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Send,
  Plus,
  FileText,
  Inbox,
  BarChart3,
  Users,
  Settings,
  User,
  Shield,
  Ban,
  CreditCard,
  Menu,
  X
} from "lucide-react";
import "./Sidebar.scss";

const Sidebar = ({ collapsed }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    // { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/dashboard", icon: Send, label: "Campaigns" },
    // { path: "/campaigns/new", icon: Plus, label: "New Campaign" },
    // { path: "/templates", icon: FileText, label: "Templates" },
    { path: "/inbox", icon: Inbox, label: "Master Inbox" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
    // { path: "/contacts", icon: Users, label: "Contacts" },
    { path: "/settings", icon: Settings, label: "Settings" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/security", icon: Shield, label: "Security" },
    { path: "/global-block-list", icon: Ban, label: "Global Block List" },
    { path: "/plans-billing", icon: CreditCard, label: "Plans & Billing" },
  ];

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="sidebar__mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside 
        className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${
          mobileOpen ? "sidebar--mobile-open" : ""
        }`}
      >
        <nav className="sidebar__nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
              onClick={closeMobileMenu}
            >
              <item.icon size={20} />
              <span className="sidebar__link-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;