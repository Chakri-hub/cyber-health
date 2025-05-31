import React from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from './LoadingSpinner/LoadingSpinner';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-content-wrapper">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;