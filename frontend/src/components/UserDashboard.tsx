import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { pickupService } from '../services/pickupService';
import { User, PickupRequest } from '../types';

const UserDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PickupRequest | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    itemType: 'laptop',
    quantity: 1,
    condition: 'working',
    pickupAddress: '',
    preferredDate: '',
    notes: ''
  });

  useEffect(() => {
    const authData = authService.getAuthData();
    if (!authData || authData.role !== 'user') {
      navigate('/login');
      return;
    }
    setUser(authData.user as User);
    fetchPickupRequests();
  }, [navigate]);

  const fetchPickupRequests = async () => {
    try {
      const response = await pickupService.getMyRequests();
      setPickupRequests(response.pickupRequests);
    } catch (error) {
      console.error('Error fetching pickup requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRequest) {
        await pickupService.updateRequest(editingRequest._id, formData);
      } else {
        await pickupService.createRequest(formData);
      }
      
      // Reset form
      setFormData({
        itemType: 'laptop',
        quantity: 1,
        condition: 'working',
        pickupAddress: '',
        preferredDate: '',
        notes: ''
      });
      setShowForm(false);
      setEditingRequest(null);
      fetchPickupRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving pickup request');
    }
  };

  const handleEdit = (request: PickupRequest) => {
    if (request.status !== 'pending') {
      alert('Only pending requests can be edited');
      return;
    }
    
    setFormData({
      itemType: request.itemType,
      quantity: request.quantity,
      condition: request.condition,
      pickupAddress: request.pickupAddress,
      preferredDate: new Date(request.preferredDate).toISOString().split('T')[0],
      notes: request.notes || ''
    });
    setEditingRequest(request);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return;
    }

    try {
      await pickupService.deleteRequest(id);
      fetchPickupRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting pickup request');
    }
  };

  const handleLogout = () => {
    authService.clearAuthData();
    navigate('/login');
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
            <h2>User Dashboard</h2>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>

          {user && (
            <div className="card mb-4">
              <div className="card-body">
                <h5>Welcome, {user.name}!</h5>
                <p className="mb-1"><strong>Email:</strong> {user.email}</p>
                <p className="mb-1"><strong>Phone:</strong> {user.phone}</p>
                <p className="mb-1"><strong>Address:</strong> {user.address}</p>
                <p className="mb-0"><strong>Reward Points:</strong> <span className="badge bg-success">{user.rewardPoints}</span></p>
              </div>
            </div>
          )}

          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Pickup Requests</h5>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingRequest(null);
                  setFormData({
                    itemType: 'laptop',
                    quantity: 1,
                    condition: 'working',
                    pickupAddress: user?.address || '',
                    preferredDate: '',
                    notes: ''
                  });
                }}
              >
                {showForm ? 'Cancel' : 'New Request'}
              </button>
            </div>
            <div className="card-body">
              {showForm && (
                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Item Type</label>
                      <select className="form-select" name="itemType" value={formData.itemType} onChange={handleChange}>
                        <option value="laptop">Laptop</option>
                        <option value="desktop">Desktop</option>
                        <option value="mobile">Mobile</option>
                        <option value="tablet">Tablet</option>
                        <option value="printer">Printer</option>
                        <option value="monitor">Monitor</option>
                        <option value="keyboard">Keyboard</option>
                        <option value="mouse">Mouse</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Quantity</label>
                      <input type="number" className="form-control" name="quantity" value={formData.quantity} onChange={handleChange} min="1" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Condition</label>
                      <select className="form-select" name="condition" value={formData.condition} onChange={handleChange}>
                        <option value="working">Working</option>
                        <option value="not_working">Not Working</option>
                        <option value="partially_working">Partially Working</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Preferred Date</label>
                      <input type="date" className="form-control" name="preferredDate" value={formData.preferredDate} onChange={handleChange} required />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Pickup Address</label>
                      <textarea className="form-control" name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} rows={2} required />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Notes (Optional)</label>
                      <textarea className="form-control" name="notes" value={formData.notes} onChange={handleChange} rows={2} />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-success">
                        {editingRequest ? 'Update Request' : 'Submit Request'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {pickupRequests.length === 0 ? (
                <p className="text-muted">No pickup requests found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Item Type</th>
                        <th>Quantity</th>
                        <th>Condition</th>
                        <th>Status</th>
                        <th>Preferred Date</th>
                        <th>Reward Points</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pickupRequests.map((request) => (
                        <tr key={request._id}>
                          <td>{request.itemType}</td>
                          <td>{request.quantity}</td>
                          <td>{request.condition.replace('_', ' ')}</td>
                          <td><span className={`badge ${getStatusBadge(request.status)}`}>{request.status}</span></td>
                          <td>{new Date(request.preferredDate).toLocaleDateString()}</td>
                          <td>{request.rewardPoints}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-info me-2"
                              onClick={() => handleEdit(request)}
                              disabled={request.status !== 'pending'}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(request._id)}
                              disabled={request.status !== 'pending'}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
