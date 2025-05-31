import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { deviceService } from '../../../services/apiService';
import './Dashboard.css';
import CustomLoader from '../../shared/Loading Animation/CustomLoader';

const UserDevices = () => {
  const { token } = useSelector((state) => state.auth);
  const [userDevices, setUserDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [devicesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [actionStatus, setActionStatus] = useState({
    message: '',
    isSuccess: false,
    isVisible: false
  });

  useEffect(() => {
    fetchAllUserDevices();
  }, [token]);

  const fetchAllUserDevices = async () => {
    setIsLoading(true);
    try {
      const response = await deviceService.getAllDevices();
      
      if (response.data.success) {
        setUserDevices(response.data.devices);
        setSelectedUserId(null);
        setError(null);
      } else {
        setError('Failed to fetch user devices');
      }
    } catch (err) {
      console.error('Error fetching user devices:', err);
      setError('Failed to fetch user devices. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchUserDevices = async (userId) => {
    setIsLoading(true);
    try {
      const response = await deviceService.getUserDevices(userId);
      
      if (response.data.success) {
        setUserDevices(response.data.devices);
        setSelectedUserId(userId);
        setError(null);
      } else {
        setError('Failed to fetch user devices');
      }
    } catch (err) {
      console.error('Error fetching user devices:', err);
      setError('Failed to fetch user devices. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteDevice = async (deviceId) => {
    try {
      const response = await deviceService.deleteDevice(deviceId);
      
      if (response.data.success) {
        // Update the devices list
        setUserDevices(userDevices.filter(device => device._id !== deviceId));
        
        setActionStatus({
          message: 'Device deleted successfully',
          isSuccess: true,
          isVisible: true
        });
      } else {
        setActionStatus({
          message: 'Failed to delete device',
          isSuccess: false,
          isVisible: true
        });
      }
    } catch (err) {
      console.error('Error deleting device:', err);
      setActionStatus({
        message: 'Error deleting device',
        isSuccess: false,
        isVisible: true
      });
    } finally {
      setConfirmDelete(null);
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setActionStatus(prev => ({ ...prev, isVisible: false }));
      }, 5000);
    }
  };
  
  // Filter devices based on search term and filter field
  const filteredDevices = userDevices.filter(device => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    if (filterField === 'all') {
      return (
        (device.user_name && device.user_name.toLowerCase().includes(searchLower)) ||
        (device.user_email && device.user_email.toLowerCase().includes(searchLower)) ||
        (device.device_type && device.device_type.toLowerCase().includes(searchLower)) ||
        (device.browser && device.browser.toLowerCase().includes(searchLower)) ||
        (device.os && device.os.toLowerCase().includes(searchLower)) ||
        (device.ip_address && device.ip_address.toLowerCase().includes(searchLower)) ||
        (device.location && device.location.toLowerCase().includes(searchLower))
      );
    } else {
      return device[filterField] && device[filterField].toLowerCase().includes(searchLower);
    }
  });
  
  // Get current devices for pagination
  const indexOfLastDevice = currentPage * devicesPerPage;
  const indexOfFirstDevice = indexOfLastDevice - devicesPerPage;
  const currentDevices = filteredDevices.slice(indexOfFirstDevice, indexOfLastDevice);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  if (isLoading) {
    return (
      <div className="device-info-loading">
        <CustomLoader />
        <p>Loading connected devices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-devices-error">
        <p>{error}</p>
        <button className="primary-button" onClick={fetchAllUserDevices}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="user-devices-container">
      <h2>User Devices</h2>
      
      {actionStatus.isVisible && (
        <div className={`info-alert ${actionStatus.isSuccess ? 'success' : 'error'}`}>
          <p>{actionStatus.message}</p>
        </div>
      )}
      
      <div className="user-devices-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
          >
            <option value="all">All Fields</option>
            <option value="user_name">User Name</option>
            <option value="user_email">Email</option>
            <option value="device_type">Device Type</option>
            <option value="os">Operating System</option>
            <option value="browser">Browser</option>
            <option value="ip_address">IP Address</option>
            <option value="location">Location</option>
          </select>
        </div>
        
        <div className="view-options">
          <button 
            className={`role-button ${!selectedUserId ? 'active' : ''}`} 
            onClick={fetchAllUserDevices}
          >
            All Devices
          </button>
          {selectedUserId && (
            <button className="role-button active" onClick={() => fetchAllUserDevices()}>
              Clear User Filter
            </button>
          )}
        </div>
      </div>
      
      {userDevices.length === 0 ? (
        <div className="no-devices">
          <p>No device information found</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="user-devices-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Device</th>
                  <th>Browser</th>
                  <th>OS</th>
                  <th>IP Address</th>
                  <th>Location</th>
                  <th>First Seen</th>
                  <th>Last Seen</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentDevices.map((device) => (
                  <tr key={device._id}>
                    <td>
                      <div className="user-info">
                        <span className="user-name">{device.user_name || 'Unknown'}</span>
                        <span className="user-email">{device.user_email || 'Unknown'}</span>
                      </div>
                    </td>
                    <td>{device.device_type || 'Unknown'}</td>
                    <td>{device.browser || 'Unknown'}</td>
                    <td>{device.os || 'Unknown'}</td>
                    <td>{device.ip_address || 'Unknown'}</td>
                    <td>{device.location || 'Unknown'}</td>
                    <td>{formatDate(device.created_at)}</td>
                    <td>{formatDate(device.last_seen)}</td>
                    <td>
                      <div className="device-actions">
                        <button 
                          className="role-button delete-button"
                          onClick={() => setConfirmDelete(device._id)}
                        >
                          Delete
                        </button>
                        <button 
                          className="role-button"
                          onClick={() => fetchUserDevices(device.user_id)}
                        >
                          View User
                        </button>
                      </div>
                      
                      {confirmDelete === device._id && (
                        <div className="confirm-dialog">
                          <p>Are you sure?</p>
                          <div className="confirm-actions">
                            <button 
                              className="role-button delete-button"
                              onClick={() => handleDeleteDevice(device._id)}
                            >
                              Yes
                            </button>
                            <button 
                              className="role-button"
                              onClick={() => setConfirmDelete(null)}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredDevices.length > devicesPerPage && (
            <div className="pagination">
              {Array.from({ length: Math.ceil(filteredDevices.length / devicesPerPage) }, (_, i) => (
                <button
                  key={i}
                  className={`page-button ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      
      <div className="user-devices-note">
        <p><strong>Note:</strong> This page displays all user device information collected for security monitoring. This data helps identify suspicious login attempts and ensure account security.</p>
      </div>
    </div>
  );
};

export default UserDevices; 