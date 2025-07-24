"use client"

import { useState, useEffect } from "react"
import Header from "./Header"
import Sidebar from "./Sidebar"
import "./Layout.scss"

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768) // Adjust breakpoint as needed
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarVisible(!mobileSidebarVisible)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const closeMobileSidebar = () => {
    setMobileSidebarVisible(false)
  }

  return (
    <div className="layout">
      <Header toggleSidebar={toggleSidebar} />
      <div className="layout__container">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          mobileVisible={mobileSidebarVisible}
          onClose={closeMobileSidebar}
        />
        {mobileSidebarVisible && (
          <div className="sidebar-backdrop" onClick={closeMobileSidebar} />
        )}
        <main className={`layout__main ${sidebarCollapsed ? "layout__main--collapsed" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout