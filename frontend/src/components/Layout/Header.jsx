"use client";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, User, Search, Settings, LogOut } from "lucide-react";
import apiService from "../../services/api";
import "./Header.scss";

const Header = ({ toggleSidebar }) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const dropdownRef = useRef(null);
  const userButtonRef = useRef(null);
  const [closing, setClosing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const userResponse = await apiService.getUserProfile();
      if (userResponse.success) {
        setUser(userResponse.data);
      }
      
      // Fetch dashboard stats for credits/usage
      const statsResponse = await apiService.getDashboardStats();
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      
      // Set notifications count (mock for now)
      setNotifications(3);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Fallback to default user data
      setUser({ email: 'user@example.com', firstName: 'User' });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseLeave = () => {
    setClosing(true);
    setTimeout(() => {
      if (closing) {
        setIsUserDropdownOpen(false);
        setClosing(false);
      }
    }, 500);
  };

  const handleDropdownClose = () => {
    setIsUserDropdownOpen(false);
  };

  const goToProfile = () => {
    handleDropdownClose();
    navigate("/profile");
  };

  const goToSettings = () => {
    handleDropdownClose();
    navigate("/settings");
  };

  const goToLogout = () => {
    handleDropdownClose();
    // Clear user data and token
    apiService.removeToken();
    setUser(null);
    navigate("/login");
  };

  const getUserName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getUserEmail = () => {
    return user?.email || 'user@example.com';
  };

  const getActiveLeads = () => {
    return stats?.totalRecipients || 0;
  };

  const getEmailCredits = () => {
    return stats?.sentCampaigns || 0;
  };

  return (
    <header className="header">
      <div className="header__left">
        <button className="header__menu-btn" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <div className="header__logo">
          <h1>Syfer250</h1>
        </div>
      </div>

      <div className="header__center">
        {/* <div className="header__search">
          <Search size={16} />
          <input type="text" placeholder="Search campaigns, contacts..." />
        </div> */}
      </div>

      <div className="header__right">
        <button className="header__notification">
          <Bell size={20} />
          {!isMobile && notifications > 0 && <span className="header__notification-badge">{notifications}</span>}
        </button>
        
        <button 
          className="header__action-btn"
          onClick={goToSettings}
        >
          <Settings size={20} />
          {/* {!isMobile && <span>Settings</span>} */}
        </button>
        
        <div
          className="header__user"
          ref={userButtonRef}
          onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
        >
          <User size={20} />
          {!isMobile && <span>{getUserName()}</span>}
          {isUserDropdownOpen && (
            <div
              className={`user-dropdown ${closing ? "closing" : ""} ${isMobile ? "mobile" : ""}`}
              ref={dropdownRef}
            >
              <div className="user-dropdown__header">
                <div className="user-dropdown__avatar">
                  <User size={40} />
                </div>
                <div>
                  <div className="user-dropdown__name">{getUserName()}</div>
                  <div className="user-dropdown__email">
                    {getUserEmail()}
                  </div>
                </div>
              </div>
              <div className="user-dropdown__credits">
                <div className="user-dropdown__label">
                  Your credit usage detail
                </div>
                <div className="user-dropdown__progress">
                  <div className="user-dropdown__progress-label">
                    Active Leads: {getActiveLeads()}/10,000
                  </div>
                  <div className="user-dropdown__progress-bar">
                    <div style={{ width: `${Math.min((getActiveLeads() / 10000) * 100, 100)}%` }} />
                  </div>
                </div>
                <div className="user-dropdown__progress">
                  <div className="user-dropdown__progress-label">
                    Email Credits: {getEmailCredits()}/40,000
                  </div>
                  <div className="user-dropdown__progress-bar">
                    <div style={{ width: `${Math.min((getEmailCredits() / 40000) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
              <div className="user-dropdown__actions">
                <button
                  type="button"
                  onClick={goToProfile}
                  className="user-dropdown__action-btn"
                >
                  <User size={18} />
                  <span>Profile</span>
                </button>
                <button
                  type="button"
                  onClick={goToLogout}
                  className="user-dropdown__action-btn"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;