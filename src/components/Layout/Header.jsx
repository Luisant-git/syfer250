"use client";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import navigate hook
import { Menu, Bell, User, Search, Settings, LogOut } from "lucide-react";
import "./Header.scss";

const Header = ({ toggleSidebar }) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userButtonRef = useRef(null);
  const [closing, setClosing] = useState(false);
  const navigate = useNavigate(); // Initialize navigate hook

  // Close dropdown when clicking outside
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

  // Smooth close animation
  const handleMouseLeave = () => {
    setClosing(true);
    setTimeout(() => {
      if (closing) {
        setIsUserDropdownOpen(false);
        setClosing(false);
      }
    }, 500); // Match this with your CSS transition duration
  };

  const handleDropdownClose = () => {
    setIsUserDropdownOpen(false);
  };

  const goToSettings = () => {
    handleDropdownClose();
    navigate("/profile"); // Navigate to settings page
  };

  const goToLogout = () => {
    handleDropdownClose();
    navigate("/logout"); // Navigate to logout page
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
        <div className="header__search">
          <Search size={16} />
          <input type="text" placeholder="Search campaigns, contacts..." />
        </div>
      </div>

      <div className="header__right">
        <button className="header__notification">
          <Bell size={20} />
          <span className="header__notification-badge">3</span>
        </button>
        <div
          className="header__user"
          ref={userButtonRef}
          onMouseEnter={() => {
            setClosing(false);
            setIsUserDropdownOpen(true);
          }}
          onMouseLeave={handleMouseLeave}
        >
          <User size={20} />
          <span>Anesh</span>
          {isUserDropdownOpen && (
            <div
              className={`user-dropdown ${closing ? "closing" : ""}`}
              ref={dropdownRef}
              onMouseEnter={() => setClosing(false)}
              onMouseLeave={handleMouseLeave}
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
                  onClick={goToSettings}
                  className="user-dropdown__action-btn"
                >
                  <Settings size={18} />
                  <span>Settings</span>
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
