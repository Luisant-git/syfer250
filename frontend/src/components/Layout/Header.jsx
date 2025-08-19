"use client";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, User, Search, Settings, LogOut } from "lucide-react";
import "./Header.scss";

const Header = ({ toggleSidebar }) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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
    navigate("/login");
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
          {!isMobile && <span className="header__notification-badge">3</span>}
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
          onClick={isMobile ? () => setIsUserDropdownOpen(!isUserDropdownOpen) : undefined}
          onMouseEnter={!isMobile ? () => {
            setClosing(false);
            setIsUserDropdownOpen(true);
          } : undefined}
          onMouseLeave={!isMobile ? handleMouseLeave : undefined}
        >
          <User size={20} />
          {!isMobile && <span>Anesh</span>}
          {isUserDropdownOpen && (
            <div
              className={`user-dropdown ${closing ? "closing" : ""} ${isMobile ? "mobile" : ""}`}
              ref={dropdownRef}
              onMouseEnter={!isMobile ? () => setClosing(false) : undefined}
              onMouseLeave={!isMobile ? handleMouseLeave : undefined}
            >
              <div className="user-dropdown__header">
                <div className="user-dropdown__avatar">
                  <User size={40} />
                </div>
                <div>
                  <div className="user-dropdown__name">Anesh</div>
                  <div className="user-dropdown__email">
                    anesh@browsecontacts.com
                  </div>
                </div>
              </div>
              <div className="user-dropdown__credits">
                <div className="user-dropdown__label">
                  Your credit usage detail
                </div>
                <div className="user-dropdown__progress">
                  <div className="user-dropdown__progress-label">
                    Active Leads: 11/10,000
                  </div>
                  <div className="user-dropdown__progress-bar">
                    <div style={{ width: "0.11%" }} />
                  </div>
                </div>
                <div className="user-dropdown__progress">
                  <div className="user-dropdown__progress-label">
                    Email Credits: 0/40,000
                  </div>
                  <div className="user-dropdown__progress-bar">
                    <div style={{ width: "0%" }} />
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