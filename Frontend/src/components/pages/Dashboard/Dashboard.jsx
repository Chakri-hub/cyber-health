import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../../services/userService';
import TableResizer from './TableResizer';
import DeviceInfo from './DeviceInfo';
import UserDevices from './UserDevices';
import ReportsSection from './ReportsSection';
import ImageCropper from '../../common/ImageCropper';
import './Dashboard.css';

const Dashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeSection, setActiveSection] = useState('reports');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // User role management state
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    admins: 0,
    regularUsers: 0
  });
  const [userList, setUserList] = useState([]);
  const [filteredUserList, setFilteredUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // New state for user details modal
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterValue, setFilterValue] = useState('all');
  const [userInfoSaved, setUserInfoSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: '',
    dob: '',
    bloodGroup: '',
    emergencyContact: '',
    height: '',
    weight: ''
  });
  
  // Access management tabs state
  const [accessTab, setAccessTab] = useState('users');
  
  // New state for image cropper
  const [showImageCropperModal, setShowImageCropperModal] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Check if the user is an admin or super-admin
  useEffect(() => {
    if (user) {
      // Remove or comment out these console logs
      // console.log('User data in Dashboard:', user);
      // console.log('User ID type:', typeof user.id, 'Value:', user.id);
      
      // Check for super-admin (protected account)
      if (user.email === 'pchakradhar91@gmail.com' || user.is_superuser === true) {
        setIsAdmin(true);
        setIsSuperAdmin(true);
      } else if (user.role === 'admin' || user.is_staff === true) {
        // Check both role property and is_staff property
        setIsAdmin(true);
        setIsSuperAdmin(false);
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
    }
  }, [user]);
  
  // Initialize form values when user data is available
  useEffect(() => {
    if (user) {
      // Remove or comment out these console logs
      // console.log('Initializing form values with user data:', user);
      // console.log('DOB from user data:', user.dob);
      
      setFormValues({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || '',
        dob: user.dob || '',
        bloodGroup: user.bloodGroup || '',
        emergencyContact: user.emergencyContact || '',
        height: user.height || '',
        weight: user.weight || ''
      });
    }
  }, [user]);
  
  // Load user profile picture if exists
  useEffect(() => {
    if (user && user.profilePictureUrl) {
      setProfilePictureUrl(user.profilePictureUrl);
    }
  }, [user]);
  
  // Health metrics and other dashboard data (existing code)
  const healthMetrics = {
    securityScore: 85,
    vulnerabilities: 3,
    lastScan: '2023-06-15',
    devicesProtected: 4,
    threatsPrevented: 12
  };

  const recentAlerts = [
    { id: 1, type: 'warning', message: 'Outdated software detected on Device 2', date: '2023-06-10' },
    { id: 2, type: 'critical', message: 'Suspicious login attempt blocked', date: '2023-06-08' },
    { id: 3, type: 'info', message: 'Weekly security scan completed', date: '2023-06-01' }
  ];

  const upcomingTasks = [
    { id: 1, task: 'Update antivirus definitions', dueDate: '2023-06-20' },
    { id: 2, task: 'Backup important documents', dueDate: '2023-06-25' },
    { id: 3, task: 'Review security settings', dueDate: '2023-07-01' }
  ];
  
  // Load user data when in access management section
  useEffect(() => {
    if (activeSection === 'access') {
      // Fetch users from the backend
      const fetchUsers = async () => {
        try {
          const users = await userService.getAllUsers(token);
          
          setUserList(users);
          setFilteredUserList(users);
          
          // Calculate stats
          const admins = users.filter(u => u.role === 'admin' || u.role === 'super-admin').length;
          setUserStats({
            totalUsers: users.length,
            admins: admins,
            regularUsers: users.length - admins
          });
          
          // Initialize table resizer after data is loaded
          // Use setTimeout to ensure the table is rendered
          setTimeout(() => {
            TableResizer.init('.user-table');
          }, 100);
        } catch (error) {
          console.error('Error fetching users:', error);
          // Handle error - could set an error state here
        }
      };
      
      fetchUsers();
    }
  }, [activeSection, token]);
  
  // Reset column widths when leaving access section
  useEffect(() => {
    return () => {
      if (activeSection !== 'access') {
        TableResizer.resetColumnWidths();
      }
    };
  }, [activeSection]);
  
  // Filter users based on search term and filter category
  useEffect(() => {
    if (userList.length > 0) {
      let filtered = [...userList];
      
      // Apply search term filter
      if (searchTerm) {
        filtered = filtered.filter(user => {
          const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
          return (
            fullName.includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      }
      
      // Apply category filter
      if (filterCategory !== 'all' && filterValue !== 'all') {
        filtered = filtered.filter(user => {
          switch (filterCategory) {
            case 'role':
              return user.role === filterValue;
            case 'gender':
              return user.gender === filterValue;
            case 'verified':
              return filterValue === 'yes' ? user.isEmailVerified : !user.isEmailVerified;
            default:
              return true;
          }
        });
      }
      
      setFilteredUserList(filtered);
    }
  }, [userList, searchTerm, filterCategory, filterValue]);
  
  // Handle user deletion
  const handleDeleteUser = async (userId, userEmail) => {
    // Prevent deleting super admin
    if (userEmail === 'pchakradhar91@gmail.com') {
      alert('Cannot delete super admin account');
      return;
    }
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete user with email ${userEmail}?`)) {
      return;
    }
    
    try {
      await userService.deleteUser(userId, token);
      
      // Update user list after successful deletion
      const updatedUsers = userList.filter(user => user.id !== userId);
      setUserList(updatedUsers);
      
      // Recalculate stats
      const admins = updatedUsers.filter(u => u.role === 'admin' || u.role === 'super-admin').length;
      setUserStats({
        totalUsers: updatedUsers.length,
        admins: admins,
        regularUsers: updatedUsers.length - admins
      });
      
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error.message}`);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle filter category change
  const handleFilterCategoryChange = (e) => {
    setFilterCategory(e.target.value);
    setFilterValue('all'); // Reset filter value when category changes
  };
  
  // Handle filter value change
  const handleFilterValueChange = (e) => {
    setFilterValue(e.target.value);
  };

  // Handle section change
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };
  
  // Handle role change for a user
  const handleRoleChange = async (userId, newRole) => {
    // Find the user to update
    const userToUpdate = userList.find(u => u.id === userId);
    
    // Prevent changing role of super-admin
    if (userToUpdate.email === 'pchakradhar91@gmail.com') {
      alert('This account is protected and cannot be modified.');
      return;
    }
    
    // Only super admin can change roles
    if (!isSuperAdmin) {
      alert('Only super admin can change user roles. Admins can only view roles.');
      return;
    }
    
    try {
      // Make API call to update the user's role
      await userService.changeUserRole(userId, newRole, token);
      
      // Update the user's role in the UI
      const updatedUsers = userList.map(user => {
        if (user.id === userId) {
          return { ...user, role: newRole };
        }
        return user;
      });
      
      setUserList(updatedUsers);
      
      // Recalculate stats
      const admins = updatedUsers.filter(u => u.role === 'admin' || u.role === 'super-admin').length;
      setUserStats({
        totalUsers: updatedUsers.length,
        admins: admins,
        regularUsers: updatedUsers.length - admins
      });
      
      alert(`User ${userToUpdate.firstName} ${userToUpdate.lastName}'s role updated to ${newRole}`);
    } catch (error) {
      console.error('Error changing user role:', error);
      alert(`Failed to change user role: ${error.message}`);
    }
  };

  // Input change handlers to validate and prevent invalid characters
  const handleNameChange = (e) => {
    const { id, value } = e.target;
    // Only allow letters and spaces in names
    const nameRegex = /^[A-Za-z\s]*$/;
    if (nameRegex.test(value)) {
      setFormValues({
        ...formValues,
        [id]: value
      });
    }
  };
  
  const handlePhoneChange = (e) => {
    const { id, value } = e.target;
    // Only allow numbers in phone fields
    const numericRegex = /^[0-9]*$/;
    if (numericRegex.test(value)) {
      setFormValues({
        ...formValues,
        [id]: value
      });
    }
  };
  
  const handleNumberInputChange = (e) => {
    const { id, value } = e.target;
    
    // For height
    if (id === 'height') {
      // Only allow numbers and decimal point
      if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
        const numValue = parseFloat(value);
        if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 300)) {
          setFormValues({
            ...formValues,
            [id]: value
          });
        }
      }
      return;
    }
    
    // For weight
    if (id === 'weight') {
      // Only allow numbers and decimal point
      if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
        const numValue = parseFloat(value);
        if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 500)) {
          setFormValues({
            ...formValues,
            [id]: value
          });
        }
      }
      return;
    }
    
    // Update all other fields normally
    setFormValues({
      ...formValues,
      [id]: value
    });
  };
  
  // Handle date input change
  const handleDateChange = (e) => {
    const { id, value } = e.target;
    console.log('Date change event value:', value);
    console.log('Date change parsed date:', new Date(value));
    
    // Validate and format the date
    if (!value) {
      setFormValues({
        ...formValues,
        [id]: ''
      });
      return;
    }
    
    // Validate date is not in the future
    const selectedDate = new Date(value);
    const currentDate = new Date();
    
    if (selectedDate <= currentDate) {
      console.log('Setting date value to:', value);
      setFormValues({
        ...formValues,
        [id]: value  // Store directly in YYYY-MM-DD format
      });
    } else {
      // Don't update if date is in the future
      setValidationError('Date of birth cannot be in the future.');
    }
  };

  // Handle user information save
  const handleSaveUserInfo = async (e) => {
    e.preventDefault();
    
    // Reset validation error
    setValidationError('');
    
    // Check if user ID is available
    if (!user) {
      setValidationError('User information not available. Please log in again.');
      return;
    }
    
    // Get user ID, falling back to the one stored in localStorage if needed
    let userId = user.id;
    if (!userId) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      userId = storedUser?.id;
      console.log('Using user ID from localStorage:', userId);
    }
    
    // If still no ID, show error
    if (!userId) {
      setValidationError('User ID not available. Please log out and log in again.');
      return;
    }
    
    // Validate input values
    const firstName = formValues.firstName.trim();
    const lastName = formValues.lastName.trim();
    const phoneNumber = formValues.phoneNumber.trim();
    const emergencyContact = formValues.emergencyContact.trim();
    const height = formValues.height;
    const weight = formValues.weight;
    const dob = formValues.dob;
    const gender = formValues.gender;
    const bloodGroup = formValues.bloodGroup;
    
    console.log('Date of birth before submission:', dob);
    
    // Name validation
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!firstName) {
      setValidationError('First name is required.');
      return;
    }
    
    if (!nameRegex.test(firstName)) {
      setValidationError('First name should only contain letters and spaces.');
      return;
    }
    
    if (!lastName) {
      setValidationError('Last name is required.');
      return;
    }
    
    if (!nameRegex.test(lastName)) {
      setValidationError('Last name should only contain letters and spaces.');
      return;
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]+$/;
    if (phoneNumber && !phoneRegex.test(phoneNumber)) {
      setValidationError('Phone number should only contain digits.');
      return;
    }
    
    if (emergencyContact && !phoneRegex.test(emergencyContact)) {
      setValidationError('Emergency contact should only contain digits.');
      return;
    }
    
    // Date of birth validation
    if (dob) {
      const currentDate = new Date();
      const selectedDate = new Date(dob);
      
      if (selectedDate > currentDate) {
        setValidationError('Date of birth cannot be in the future.');
        return;
      }
    }
    
    // Height and weight validation
    if (height && (isNaN(height) || height <= 0 || height > 300)) {
      setValidationError('Height must be a number between 1 and 300 cm.');
      return;
    }
    
    if (weight && (isNaN(weight) || weight <= 0 || weight > 500)) {
      setValidationError('Weight must be a number between 1 and 500 kg.');
      return;
    }
    
    // Format DOB for the API
    let formattedDob = null;
    if (dob) {
      // Ensure it's in YYYY-MM-DD format
      formattedDob = dob;
    }
    
    // Get form data
    const formData = {
      // Convert to snake_case for the backend API
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      gender: gender,
      dob: formattedDob,
      blood_group: bloodGroup,
      emergency_contact: emergencyContact,
      height: height || null,
      weight: weight || null
    };
    
    console.log('Sending date of birth to API:', formData.dob);
    
    try {
      // Show loading state
      setIsLoading(true);
      setUserInfoSaved(false);
      
      console.log('User ID:', userId);
      console.log('Sending user data to API:', formData);
      
      // Make API call to update the user's information
      const response = await userService.updateUserInfo(userId, formData, token);
      
      console.log('API response:', response);
      
      // Update the local user data in Redux store or localStorage
      if (response.success) {
        // Use the processed data from the response if available
        const processedData = response.processedData || formData;
        console.log('Using processed data for user update:', processedData);
        
        // For now, update the user in local storage
        const updatedUser = { 
          ...user, 
          id: userId, // Ensure ID is included
          firstName: processedData.first_name,
          lastName: processedData.last_name,
          phoneNumber: processedData.phone_number,
          gender: processedData.gender,
          dob: processedData.dob,
          bloodGroup: processedData.blood_group,
          emergencyContact: processedData.emergency_contact,
          height: processedData.height,
          weight: processedData.weight
        };
        
        console.log('Updating user in localStorage with DOB:', updatedUser.dob);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update form values to reflect saved data
        setFormValues({
          firstName: processedData.first_name,
          lastName: processedData.last_name,
          phoneNumber: processedData.phone_number,
          gender: processedData.gender,
          dob: processedData.dob || '',
          bloodGroup: processedData.blood_group,
          emergencyContact: processedData.emergency_contact,
          height: processedData.height || '',
          weight: processedData.weight || ''
        });
        
        // Show success message
        setUserInfoSaved(true);
        setTimeout(() => setUserInfoSaved(false), 3000);
      } else {
        // Handle unsuccessful response
        throw new Error(response.message || 'Failed to update user information');
      }
    } catch (error) {
      console.error('Error saving user information:', error);
      setValidationError(`Failed to save user information. ${error.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch and show user details
  const handleViewUserDetails = async (userId) => {
    try {
      setIsLoadingDetails(true);
      // Use the token from Redux store
      const details = await userService.getUserDetails(userId, token);
      
      console.log("User details retrieved:", details);
      console.log("Devices data:", details.devices);
      
      setUserDetails(details);
      setShowUserDetailsModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Failed to fetch user details. Please try again.');
    } finally {
      setIsLoadingDetails(false);
    }
  };
  
  // Function to close user details modal
  const handleCloseDetailsModal = () => {
    setShowUserDetailsModal(false);
    setUserDetails(null);
  };

  const handleProfilePictureClick = () => {
    setShowImageCropperModal(true);
  };

  const handleCloseCropperModal = () => {
    setShowImageCropperModal(false);
  };

  const handleRemoveProfilePicture = async () => {
    if (!user || !user.id) {
      return;
    }

    try {
      const response = await userService.removeProfilePicture(
        user.id,
        localStorage.getItem('token')
      );

      if (response.success) {
        setProfilePictureUrl('');
        
        // Update user in store or session if needed
        const updatedUser = {
          ...user,
          profilePictureUrl: null
        };
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        console.error('Failed to remove profile picture:', response.error);
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
    }
  };

  const handleCropComplete = async (croppedImage) => {
    if (!user || !user.id) {
      setUploadError('User information not available');
      return;
    }

    setIsUploadingProfilePic(true);
    setUploadError('');

    try {
      const response = await userService.uploadProfilePicture(
        user.id, 
        croppedImage,
        localStorage.getItem('token')
      );

      if (response.success) {
        setProfilePictureUrl(response.profile_picture_url);
        setShowImageCropperModal(false);
        
        // Update user in store or session if needed
        const updatedUser = {
          ...user,
          profilePictureUrl: response.profile_picture_url
        };
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        throw new Error(response.error || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setUploadError(error.message || 'Failed to upload profile picture');
    } finally {
      setIsUploadingProfilePic(false);
    }
  };

  // Render the correct component based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'devices':
        return <DeviceInfo />;
      case 'reports':
        return <div>Reports content goes here</div>;
      case 'manageAccess':
        return renderAccessManagement();
      default:
        return <div>Settings content goes here</div>;
    }
  };
  
  // Render access management content with tabs
  const renderAccessManagement = () => {
    return (
      <div className="access-management-container">
        <h2>Access Management</h2>
        <p className="section-description">Manage user roles and permissions for the application.</p>
        
        <div className="access-tabs">
          <button 
            className={`tab-button ${accessTab === 'users' ? 'active' : ''}`}
            onClick={() => setAccessTab('users')}
          >
            Users
          </button>
          <button 
            className={`tab-button ${accessTab === 'devices' ? 'active' : ''}`}
            onClick={() => setAccessTab('devices')}
          >
            Devices
          </button>
        </div>
        
        {accessTab === 'users' ? (
          // User management content
          <div className="user-management">
            <div className="stats-cards">
              <div className="stat-card">
                <h3>Total Users</h3>
                <div className="stat-value">{userStats.totalUsers}</div>
              </div>
              <div className="stat-card">
                <h3>Admins</h3>
                <div className="stat-value">{userStats.admins}</div>
              </div>
              <div className="stat-card">
                <h3>Regular Users</h3>
                <div className="stat-value">{userStats.regularUsers}</div>
              </div>
            </div>
            
            <div className="user-management-section">
              <h3>User List</h3>
              
              <div className="user-filters">
                <div className="search-filter">
                  <input 
                    type="text" 
                    placeholder="Search by name, email or phone..." 
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                </div>
                
                <div className="category-filters">
                  <div className="filter-group">
                    <label htmlFor="filterCategory">Filter by:</label>
                    <select 
                      id="filterCategory" 
                      value={filterCategory}
                      onChange={handleFilterCategoryChange}
                      className="filter-select"
                    >
                      <option value="all">All Categories</option>
                      <option value="role">Role</option>
                      <option value="gender">Gender</option>
                      <option value="verified">Email Verified</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <button 
                      className="role-button"
                      onClick={() => TableResizer.resetColumnWidths()}
                      title="Reset column widths to default"
                    >
                      Reset Columns
                    </button>
                  </div>
                  
                  {filterCategory === 'role' && (
                    <div className="filter-group">
                      <label htmlFor="roleFilter">Role:</label>
                      <select 
                        id="roleFilter" 
                        value={filterValue}
                        onChange={handleFilterValueChange}
                        className="filter-select"
                      >
                        <option value="all">All Roles</option>
                        <option value="super-admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </select>
                    </div>
                  )}
                  
                  {filterCategory === 'gender' && (
                    <div className="filter-group">
                      <label htmlFor="genderFilter">Gender:</label>
                      <select 
                        id="genderFilter" 
                        value={filterValue}
                        onChange={handleFilterValueChange}
                        className="filter-select"
                      >
                        <option value="all">All Genders</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                        <option value="">Not Specified</option>
                      </select>
                    </div>
                  )}
                  
                  {filterCategory === 'verified' && (
                    <div className="filter-group">
                      <label htmlFor="verifiedFilter">Verified:</label>
                      <select 
                        id="verifiedFilter" 
                        value={filterValue}
                        onChange={handleFilterValueChange}
                        className="filter-select"
                      >
                        <option value="all">All</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="user-list">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Gender</th>
                      <th>Current Role</th>
                      <th>Date Joined</th>
                      <th>Last Login</th>
                      <th>Email Verified</th>
                      <th>Account Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUserList.map(user => (
                      <tr key={user.id} className={user.email === 'pchakradhar91@gmail.com' ? 'super-admin-row' : ''}>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{user.phoneNumber}</td>
                        <td>{user.gender === 'M' ? 'Male' : 
                             user.gender === 'F' ? 'Female' : 
                             user.gender === 'O' ? 'Other' : 'Not Specified'}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role === 'super-admin' ? 'Super Admin' : 
                             user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td>{user.dateJoined}</td>
                        <td>{user.lastLogin}</td>
                        <td>{user.isEmailVerified ? 'Yes' : 'No'}</td>
                        <td>{user.createdAt}</td>
                        <td>
                          {user.email === 'pchakradhar91@gmail.com' ? (
                            <span className="protected-account">Protected Account</span>
                          ) : (
                            <div className="role-actions">
                              <button 
                                className="role-button info-button"
                                onClick={() => handleViewUserDetails(user.id)}
                                disabled={isLoadingDetails}
                              >
                                {isLoadingDetails ? 'Loading...' : 'View Details'}
                              </button>
                              {isSuperAdmin && (
                                <>
                                  <button 
                                    className={`role-button ${user.role === 'admin' ? 'active' : ''}`}
                                    onClick={() => handleRoleChange(user.id, 'admin')}
                                    disabled={user.role === 'admin'}
                                  >
                                    Make Admin
                                  </button>
                                  <button 
                                    className={`role-button ${user.role === 'user' ? 'active' : ''}`}
                                    onClick={() => handleRoleChange(user.id, 'user')}
                                    disabled={user.role === 'user'}
                                  >
                                    Make User
                                  </button>
                                </>
                              )}
                              {isAdmin && !isSuperAdmin && (
                                <span className="role-info">View only - cannot change roles</span>
                              )}
                              <button 
                                className="role-button delete-button"
                                onClick={() => handleDeleteUser(user.id, user.email)}
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="access-management-note">
                <p><strong>Note:</strong> The account with email 'pchakradhar91@gmail.com' is designated as a super-admin and cannot be modified by other administrators.</p>
                <p><strong>Role Permissions:</strong></p>
                <ul>
                  <li><strong>Super Admin:</strong> Can view all users, change user roles, and remove users.</li>
                  <li><strong>Admin:</strong> Can view all users and their roles but cannot change roles. Admins can remove users.</li>
                  <li><strong>Regular User:</strong> Cannot access user management features.</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          // Device management content
          <UserDevices />
        )}
      </div>
    );
  };

  if (!user) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="user-profile">
          <div 
            className="user-avatar" 
            onClick={handleProfilePictureClick}
          >
            {profilePictureUrl ? (
              <img 
                src={profilePictureUrl} 
                alt={`${user.firstName} ${user.lastName}`} 
                className="profile-picture"
              />
            ) : (
              <>
                {user.firstName ? user.firstName.charAt(0) : ''}{user.lastName ? user.lastName.charAt(0) : ''}
                <div className="avatar-upload-icon">+</div>
              </>
            )}
          </div>
          <div className="user-info">
            <h3>{user.firstName} {user.lastName}</h3>
            <p>{user.email}</p>
            {isSuperAdmin ? (
              <span className="admin-badge super-admin">Super Admin</span>
            ) : isAdmin ? (
              <span className="admin-badge admin">Admin</span>
            ) : (
              <span className="admin-badge user">User</span>
            )}
          </div>
        </div>
        
        <nav className="dashboard-nav">
          <ul>
            <li className={activeSection === 'settings' ? 'active' : ''}>
              <button onClick={() => handleSectionChange('settings')}>
                <i className="nav-icon settings-icon"></i>
                Settings
              </button>
            </li>
            <li className={activeSection === 'devices' ? 'active' : ''}>
              <button onClick={() => handleSectionChange('devices')}>
                <i className="nav-icon devices-icon"></i>
                Devices
              </button>
            </li>
            <li className={activeSection === 'reports' ? 'active' : ''}>
              <button onClick={() => handleSectionChange('reports')}>
                <i className="nav-icon reports-icon"></i>
                Reports
              </button>
            </li>
            {isAdmin && (
              <>
                <li className={activeSection === 'access' ? 'active' : ''}>
                  <button onClick={() => handleSectionChange('access')}>
                    <i className="nav-icon users-icon"></i>
                    Manage Access
                  </button>
                </li>
                {/* Tips button removed from sidebar navigation */}
              </>
            )}
          </ul>
        </nav>
      </div>
      
      <div className="dashboard-main">
        <header className="dashboard-header">
          <h1>My Dashboard</h1>
          <div className="header-actions">
            {/* Search bar and notification elements removed */}
          </div>
        </header>
        
        <div className="dashboard-content">
          {activeSection === 'reports' && (
            <ReportsSection user={user} />
          )}          
          {activeSection === 'security' && (
            <>
              <p>Security information has been moved to a different section.</p>
            </>
          )}
          
          {activeSection === 'devices' && (
            <DeviceInfo />
          )}
          
          {activeSection === 'reports' && (
            <>
              <h2 style={{ color: 'white' }}>Reports & Analytics</h2>
              <p>Security reports and analytics will be displayed here.</p>
            </>
          )}
          
          {activeSection === 'settings' && (
            <>
              <h2 style={{ color: 'white', textAlign: 'center' }}>User Settings</h2>
              <div className="settings-container">
                <div className="settings-card">
                  <h3>Personal Information</h3>
                  <form className="settings-form" onSubmit={handleSaveUserInfo}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input 
                          type="text" 
                          id="firstName" 
                          value={formValues.firstName}
                          onChange={handleNameChange}
                          className="form-control"
                          pattern="^[A-Za-z\s]+$"
                          title="Only letters and spaces are allowed"
                          required
                          style={{ color: 'black' }}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input 
                          type="text" 
                          id="lastName" 
                          value={formValues.lastName}
                          onChange={handleNameChange}
                          className="form-control"
                          pattern="^[A-Za-z\s]+$"
                          title="Only letters and spaces are allowed"
                          required
                          style={{ color: 'black' }}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        defaultValue={user.email || ''}
                        className="form-control"
                        disabled
                        style={{ color: 'black' }}
                      />
                      <small>Email cannot be changed</small>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input 
                        type="tel" 
                        id="phoneNumber"
                        value={formValues.phoneNumber}
                        onChange={handlePhoneChange}
                        className="form-control"
                        pattern="^[0-9]+$"
                        title="Only numbers are allowed"
                        style={{ color: 'black' }}
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="gender">Gender</label>
                        <select 
                          id="gender" 
                          value={formValues.gender} 
                          onChange={handleNumberInputChange}
                          className="form-control"
                          style={{ color: 'black' }}
                        >
                          <option value="">Select Gender</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="dob">Date of Birth</label>
                        <input 
                          type="date" 
                          id="dob" 
                          value={formValues.dob || ''}
                          onChange={handleDateChange}
                          className="form-control"
                          max={new Date().toISOString().split('T')[0]}
                          style={{ color: 'black' }}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="bloodGroup">Blood Group</label>
                        <select 
                          id="bloodGroup" 
                          value={formValues.bloodGroup}
                          onChange={handleNumberInputChange}
                          className="form-control"
                          style={{ color: 'black' }}
                        >
                          <option value="">Select Blood Group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="emergencyContact">Emergency Contact</label>
                        <input 
                          type="tel" 
                          id="emergencyContact" 
                          value={formValues.emergencyContact}
                          onChange={handlePhoneChange}
                          className="form-control"
                          pattern="^[0-9]+$"
                          title="Only numbers are allowed"
                          style={{ color: 'black' }}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="height">Height (cm)</label>
                        <input 
                          type="text" 
                          id="height" 
                          value={formValues.height}
                          onChange={handleNumberInputChange}
                          className="form-control"
                          placeholder="Enter height (cm)"
                          pattern="^[0-9]*\.?[0-9]*$"
                          title="Only numeric values allowed"
                          style={{ color: 'black' }}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="weight">Weight (kg)</label>
                        <input 
                          type="text" 
                          id="weight" 
                          value={formValues.weight}
                          onChange={handleNumberInputChange}
                          className="form-control"
                          placeholder="Enter weight (kg)"
                          pattern="^[0-9]*\.?[0-9]*$"
                          title="Only numeric values allowed"
                          style={{ color: 'black' }}
                        />
                      </div>
                    </div>
                    
                    {userInfoSaved && (
                      <div className="success-message">Information saved successfully!</div>
                    )}
                    
                    {validationError && (
                      <div className="error-message">{validationError}</div>
                    )}
                    
                    <button 
                      type="submit" 
                      className="primary-button"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Information'}
                    </button>
                  </form>
                </div>
                
                <div className="settings-card system-info-card">
                  <h3>System Information</h3>
                  <div className="system-info">
                    <div className="info-item">
                      <span className="info-label">Registration Date</span>
                      <span className="info-value">{user.dateJoined || user.createdAt || 'Not available'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Last Login</span>
                      <span className="info-value">{user.lastLogin || 'Not available'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Last Logout</span>
                      <span className="info-value">{user.lastLogout || 'Not available'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Account Type</span>
                      <span className="info-value">
                        {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : 'Regular User'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Account Status</span>
                      <span className="info-value status-active">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {activeSection === 'tips' && isAdmin && (
            <>
              <h2>Cybersecurity Tips Management</h2>
              <p>Create and manage cybersecurity tips for users.</p>
              <button 
                className="primary-button" 
                onClick={() => navigate('/tips')}
              >
                Go to Tips Management
              </button>
            </>
          )}
          
          {activeSection === 'access' && isAdmin && (
            <>
              <h2 style={{ color: 'white' }}>User Access Management</h2>
              <p>Manage user roles and permissions for the application.</p>
              
              <div className="stats-cards">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <div className="stat-value">{userStats.totalUsers}</div>
                </div>
                <div className="stat-card">
                  <h3>Admins</h3>
                  <div className="stat-value">{userStats.admins}</div>
                </div>
                <div className="stat-card">
                  <h3>Regular Users</h3>
                  <div className="stat-value">{userStats.regularUsers}</div>
                </div>
              </div>
              
              <div className="user-management-section">
                <h3>User List</h3>
                
                <div className="user-filters">
                  <div className="search-filter">
                    <input 
                      type="text" 
                      placeholder="Search by name, email or phone..." 
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="search-input"
                    />
                  </div>
                  
                  <div className="category-filters">
                    <div className="filter-group">
                      <label htmlFor="filterCategory">Filter by:</label>
                      <select 
                        id="filterCategory" 
                        value={filterCategory}
                        onChange={handleFilterCategoryChange}
                        className="filter-select"
                      >
                        <option value="all">All Categories</option>
                        <option value="role">Role</option>
                        <option value="gender">Gender</option>
                        <option value="verified">Email Verified</option>
                      </select>
                    </div>
                    
                    <div className="filter-group">
                      <button 
                        className="role-button"
                        onClick={() => TableResizer.resetColumnWidths()}
                        title="Reset column widths to default"
                      >
                        Reset Columns
                      </button>
                    </div>
                    
                    {filterCategory === 'role' && (
                      <div className="filter-group">
                        <label htmlFor="roleFilter">Role:</label>
                        <select 
                          id="roleFilter" 
                          value={filterValue}
                          onChange={handleFilterValueChange}
                          className="filter-select"
                        >
                          <option value="all">All Roles</option>
                          <option value="super-admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="user">User</option>
                        </select>
                      </div>
                    )}
                    
                    {filterCategory === 'gender' && (
                      <div className="filter-group">
                        <label htmlFor="genderFilter">Gender:</label>
                        <select 
                          id="genderFilter" 
                          value={filterValue}
                          onChange={handleFilterValueChange}
                          className="filter-select"
                        >
                          <option value="all">All Genders</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                          <option value="">Not Specified</option>
                        </select>
                      </div>
                    )}
                    
                    {filterCategory === 'verified' && (
                      <div className="filter-group">
                        <label htmlFor="verifiedFilter">Verified:</label>
                        <select 
                          id="verifiedFilter" 
                          value={filterValue}
                          onChange={handleFilterValueChange}
                          className="filter-select"
                        >
                          <option value="all">All</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="user-list">
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Gender</th>
                        <th>Current Role</th>
                        <th>Date Joined</th>
                        <th>Last Login</th>
                        <th>Email Verified</th>
                        <th>Account Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUserList.map(user => (
                        <tr key={user.id} className={user.email === 'pchakradhar91@gmail.com' ? 'super-admin-row' : ''}>
                          <td>{user.firstName} {user.lastName}</td>
                          <td>{user.email}</td>
                          <td>{user.phoneNumber}</td>
                          <td>{user.gender === 'M' ? 'Male' : 
                               user.gender === 'F' ? 'Female' : 
                               user.gender === 'O' ? 'Other' : 'Not Specified'}</td>
                          <td>
                            <span className={`role-badge ${user.role}`}>
                              {user.role === 'super-admin' ? 'Super Admin' : 
                               user.role === 'admin' ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td>{user.dateJoined}</td>
                          <td>{user.lastLogin}</td>
                          <td>{user.isEmailVerified ? 'Yes' : 'No'}</td>
                          <td>{user.createdAt}</td>
                          <td>
                            {user.email === 'pchakradhar91@gmail.com' ? (
                              <span className="protected-account">Protected Account</span>
                            ) : (
                              <div className="role-actions">
                                <button 
                                  className="role-button info-button"
                                  onClick={() => handleViewUserDetails(user.id)}
                                  disabled={isLoadingDetails}
                                >
                                  {isLoadingDetails ? 'Loading...' : 'View Details'}
                                </button>
                                {isSuperAdmin && (
                                  <>
                                    <button 
                                      className={`role-button ${user.role === 'admin' ? 'active' : ''}`}
                                      onClick={() => handleRoleChange(user.id, 'admin')}
                                      disabled={user.role === 'admin'}
                                    >
                                      Make Admin
                                    </button>
                                    <button 
                                      className={`role-button ${user.role === 'user' ? 'active' : ''}`}
                                      onClick={() => handleRoleChange(user.id, 'user')}
                                      disabled={user.role === 'user'}
                                    >
                                      Make User
                                    </button>
                                  </>
                                )}
                                {isAdmin && !isSuperAdmin && (
                                  <span className="role-info">View only - cannot change roles</span>
                                )}
                                <button 
                                  className="role-button delete-button"
                                  onClick={() => handleDeleteUser(user.id, user.email)}
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="access-management-note">
                  <p><strong>Note:</strong> The account with email 'pchakradhar91@gmail.com' is designated as a super-admin and cannot be modified by other administrators.</p>
                  <p><strong>Role Permissions:</strong></p>
                  <ul>
                    <li><strong>Super Admin:</strong> Can view all users, change user roles, and remove users.</li>
                    <li><strong>Admin:</strong> Can view all users and their roles but cannot change roles. Admins can remove users.</li>
                    <li><strong>Regular User:</strong> Cannot access user management features.</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* User Details Modal */}
      {showUserDetailsModal && userDetails && (
        <div className="modal-overlay">
          <div className="modal-container user-details-modal">
            <div className="modal-header">
              <h2>User Details: {userDetails.personal_info.first_name} {userDetails.personal_info.last_name}</h2>
              <button className="close-button" onClick={handleCloseDetailsModal}>×</button>
            </div>
            <div className="modal-content">
              <div className="details-section">
                <h3>Personal Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Full Name:</span>
                    <span className="detail-value">{userDetails.personal_info.first_name} {userDetails.personal_info.last_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{userDetails.personal_info.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone Number:</span>
                    <span className="detail-value">{userDetails.personal_info.phone_number || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Gender:</span>
                    <span className="detail-value">
                      {userDetails.personal_info.gender === 'M' ? 'Male' : 
                       userDetails.personal_info.gender === 'F' ? 'Female' : 
                       userDetails.personal_info.gender === 'O' ? 'Other' : 'Not specified'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date of Birth:</span>
                    <span className="detail-value">{userDetails.personal_info.dob || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Blood Group:</span>
                    <span className="detail-value">{userDetails.personal_info.blood_group || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Height:</span>
                    <span className="detail-value">{userDetails.personal_info.height ? `${userDetails.personal_info.height} cm` : 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Weight:</span>
                    <span className="detail-value">{userDetails.personal_info.weight ? `${userDetails.personal_info.weight} kg` : 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Emergency Contact:</span>
                    <span className="detail-value">{userDetails.personal_info.emergency_contact || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email Verified:</span>
                    <span className="detail-value">{userDetails.personal_info.is_email_verified ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              
              <div className="details-section">
                <h3>System Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Last Login:</span>
                    <span className="detail-value">{userDetails.system_info.last_login_time}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account Created:</span>
                    <span className="detail-value">{userDetails.system_info.account_created}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account Status:</span>
                    <span className="detail-value">{userDetails.system_info.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">User Role:</span>
                    <span className="detail-value">
                      {userDetails.system_info.is_superuser ? 'Super Admin' : 
                       userDetails.system_info.is_staff ? 'Admin' : 'Regular User'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Login IP:</span>
                    <span className="detail-value">{userDetails.system_info.login_ip}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">User Agent:</span>
                    <span className="detail-value">{userDetails.system_info.user_agent}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">OS Information:</span>
                    <span className="detail-value">{userDetails.system_info.os_info}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Browser Information:</span>
                    <span className="detail-value">{userDetails.system_info.browser_info}</span>
                  </div>
                </div>
              </div>
              
              {/* Device Information Section */}
              <div className="section-title">
                <h3>Device Information</h3>
              </div>
              <div className="devices-table-container">
                {userDetails.devices && userDetails.devices.length > 0 ? (
                  <table className="devices-table">
                    <thead>
                      <tr>
                        <th width="15%">Device Type</th>
                        <th width="15%">Browser</th>
                        <th width="15%">OS</th>
                        <th width="15%">IP Address</th>
                        <th width="15%">Location</th>
                        <th width="12.5%">First Seen</th>
                        <th width="12.5%">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userDetails.devices.map((device, index) => (
                        <tr key={device._id || `device-${index}`}>
                          <td>{device.device_type || 'Unknown'}</td>
                          <td>{device.browser || 'Unknown'}</td>
                          <td>{device.os || 'Unknown'}</td>
                          <td>{device.ip_address || 'Unknown'}</td>
                          <td>{device.location || 'Unknown'}</td>
                          <td>
                            {device.created_at 
                              ? new Date(device.created_at).toLocaleString() 
                              : 'Unknown'}
                          </td>
                          <td>
                            {device.last_seen 
                              ? new Date(device.last_seen).toLocaleString() 
                              : 'Unknown'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-devices-message">
                    No device information available for this user.
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="primary-button" onClick={handleCloseDetailsModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showImageCropperModal && (
        <ImageCropper
          onCropComplete={handleCropComplete}
          onClose={handleCloseCropperModal}
          onRemove={handleRemoveProfilePicture}
          hasExistingImage={!!profilePictureUrl}
          existingImageUrl={profilePictureUrl}
        />
      )}
    </div>
  );
};

export default Dashboard;