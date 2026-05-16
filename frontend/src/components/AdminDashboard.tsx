import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';
import { pickupService } from '../services/pickupService';
import { Admin, PickupRequest, DashboardStats } from '../types';

const AdminDashboard: React.FC = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const authData = authService.getAuthData();
    if (!authData || authData.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    setAdmin(authData.user as Admin);
    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchPickupRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, statusFilter]);

  const fetchDashboardData = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setStats(response.statistics);
      setPickupRequests(response.recentRequests);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPickupRequests = async () => {
    try {
      const response = await pickupService.getAllRequests(statusFilter);
      setPickupRequests(response.pickupRequests);
    } catch (error) {
      console.error('Error fetching pickup requests:', error);
    }
  };

  const handleAssignRequest = async (id: string) => {
    try {
      await pickupService.assignRequest(id);
      fetchPickupRequests();
      fetchDashboardData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error assigning request');
    }
  };

  const handleCollectRequest = async (id: string) => {
    try {
      await pickupService.collectRequest(id);
      fetchPickupRequests();
      fetchDashboardData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error marking request as collected');
    }
  };

  const handleLogout = () => {
    authService.clearAuthData();
    navigate('/admin/login');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-warning',
      assigned: 'bg-info',
      collected: 'bg-success'
    };
    return badges[status as keyof typeof badges] || 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Admin Dashboard</h2>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>

          {admin && (
            <div className="card mb-4">
              <div className="card-body">
                <h5>Welcome, {admin.name}!</h5>
                <p className="mb-0"><strong>Email:</strong> {admin.email}</p>
              </div>
            </div>
          )}

          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                Pickup Requests
              </button>
            </li>
          </ul>

          {activeTab === 'dashboard' && stats && (
            <div className="row">
              <div className="col-md-3 mb-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">Total Users</h5>
                    <h2 className="text-primary">{stats.totalUsers}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">Total Requests</h5>
                    <h2 className="text-info">{stats.totalRequests}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">Pending</h5>
                    <h2 className="text-warning">{stats.pendingRequests}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">Collected</h5>
                    <h2 className="text-success">{stats.collectedRequests}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">Total Reward Points</h5>
                    <h2 className="text-success">{stats.totalRewardPoints}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">Assigned Requests</h5>
                    <h2 className="text-info">{stats.assignedRequests}</h2>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Recent Pickup Requests</h5>
              </div>
              <div className="card-body">
                {pickupRequests.length === 0 ? (
                  <p className="text-muted">No recent pickup requests found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Item Type</th>
                          <th>Quantity</th>
                          <th>Status</th>
                          <th>Preferred Date</th>
                          <th>Reward Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pickupRequests.map((request) => (
                          <tr key={request._id}>
                            <td>
                              {typeof request.user === 'object' ? request.user.name : 'N/A'}
                              <br />
                              <small className="text-muted">
                                {typeof request.user === 'object' ? request.user.email : ''}
                              </small>
                            </td>
                            <td>{request.itemType}</td>
                            <td>{request.quantity}</td>
                            <td><span className={`badge ${getStatusBadge(request.status)}`}>{request.status}</span></td>
                            <td>{new Date(request.preferredDate).toLocaleDateString()}</td>
                            <td>{request.rewardPoints}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">All Pickup Requests</h5>
                <select 
                  className="form-select w-auto"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="collected">Collected</option>
                </select>
              </div>
              <div className="card-body">
                {pickupRequests.length === 0 ? (
                  <p className="text-muted">No pickup requests found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Contact</th>
                          <th>Item Type</th>
                          <th>Quantity</th>
                          <th>Condition</th>
                          <th>Status</th>
                          <th>Pickup Address</th>
                          <th>Preferred Date</th>
                          <th>Reward Points</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pickupRequests.map((request) => (
                          <tr key={request._id}>
                            <td>
                              {typeof request.user === 'object' ? request.user.name : 'N/A'}
                            </td>
                            <td>
                              {typeof request.user === 'object' ? (
                                <>
                                  <div>{request.user.phone}</div>
                                  <small className="text-muted">{request.user.email}</small>
                                </>
                              ) : 'N/A'}
                            </td>
                            <td>{request.itemType}</td>
                            <td>{request.quantity}</td>
                            <td>{request.condition.replace('_', ' ')}</td>
                            <td><span className={`badge ${getStatusBadge(request.status)}`}>{request.status}</span></td>
                            <td>{request.pickupAddress}</td>
                            <td>{new Date(request.preferredDate).toLocaleDateString()}</td>
                            <td>{request.rewardPoints}</td>
                            <td>
                              {request.status === 'pending' && (
                                <button 
                                  className="btn btn-sm btn-primary me-2"
                                  onClick={() => handleAssignRequest(request._id)}
                                >
                                  Assign to Me
                                </button>
                              )}
                              {request.status === 'assigned' && (
                                <button 
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleCollectRequest(request._id)}
                                >
                                  Mark Collected
                                </button>
                              )}
                              {request.status === 'collected' && (
                                <span className="text-success">
                                  <i className="bi bi-check-circle"></i> Completed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
