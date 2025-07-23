import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const isHomePage = location.pathname === '/';
  const { isAuthenticated, user, logout } = useAuth();
  
  // Handle smooth scroll when clicking on nav links
  const scrollToSection = (sectionId) => {
    // Only attempt to scroll if we're on the home page
    if (isHomePage) {
      const element = document.getElementById(sectionId);
      if (element) {
        // Set the active section
        setActiveSection(sectionId);
        
        // Scroll smoothly to the element
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // If not on home page, navigate to home page with hash
      window.location.href = `/#${sectionId}`;
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Track scroll position to update active section
  useEffect(() => {
    // Only set up scroll tracking on the home page
    if (!isHomePage) return;
    
    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'features', 'contact'];
      const scrollPosition = window.scrollY + 100; // Offset to trigger earlier
      
      // Find the current section based on scroll position
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Initial check when component mounts
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);
  
  // When location changes, check if there's a hash in the URL to update active section
  useEffect(() => {
    if (location.hash && isHomePage) {
      const sectionId = location.hash.substring(1); // Remove the # character
      setActiveSection(sectionId);
      
      // Small delay to ensure the DOM has updated
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location, isHomePage]);
  
  return (
    <header className="header">
      <Link to="/" className="logo">
        <div className="logo-img">
          <img src="/assets/healthconnect-logo.svg" alt="HealthConnect Logo" height="24" />
        </div>
        <div className="logo-text">HEALTH CONNECT</div>
      </Link>
      
      <div className="main-nav">
        <a 
          href="#home" 
          className={activeSection === 'home' ? 'active' : ''} 
          onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}
        >
          Trang chủ
        </a>
        <a 
          href="#about" 
          className={activeSection === 'about' ? 'active' : ''} 
          onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
        >
          Giới thiệu
        </a>
        <a 
          href="#services" 
          className={activeSection === 'services' ? 'active' : ''} 
          onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}
        >
          Dịch vụ
        </a>
        <a 
          href="#features" 
          className={activeSection === 'features' ? 'active' : ''} 
          onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}
        >
          Tin tức y tế
        </a>
        <a 
          href="#contact" 
          className={activeSection === 'contact' ? 'active' : ''} 
          onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
        >
          Liên hệ
        </a>
      </div>
      
      <div className="header-actions">
        <button className="request-btn">Yêu cầu tư vấn</button>
        
        {isAuthenticated ? (
          <div className="user-menu">
            <span className="user-greeting">
              <i className="fas fa-user-circle"></i> {user?.name || 'Người dùng'}
            </span>
            <button onClick={handleLogout} className="logout-btn">
              <i className="fas fa-sign-out-alt"></i> Đăng xuất
            </button>
          </div>
        ) : (
          <a href="/login" className="login-link">
            <i className="fas fa-user-circle"></i> Đăng nhập
          </a>
        )}
        
        <button className="search-btn">
          <i className="fas fa-search"></i>
        </button>
      </div>    </header>
  );
};

export default Navbar;
