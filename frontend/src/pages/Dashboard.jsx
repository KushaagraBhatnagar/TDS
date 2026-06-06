import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MetricCards from '../components/MetricCards';
import ClientKanban from '../components/ClientKanban';
import ClientTable from '../components/ClientTable';
import { Kanban, List, RefreshCw, X, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { apiCall } = useAuth();
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'directory'
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  // Toast Alerts State
  const [toast, setToast] = useState({ type: null, message: '' });

  const triggerToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast({ type: null, message: '' });
    }, 4000);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch stats
      const statsRes = await apiCall('/api/clients/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch clients (with query params)
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (genderFilter) queryParams.append('gender', genderFilter);
      if (stageFilter) queryParams.append('stage', stageFilter);

      const clientsRes = await apiCall(`/api/clients?${queryParams.toString()}`);
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      triggerToast('error', 'Failed to reload dashboard information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [search, genderFilter, stageFilter]); // Re-fetch on filter changes

  // Update client stage (from Kanban drag & drop)
  const handleStageChange = async (clientId, targetStage) => {
    try {
      const response = await apiCall(`/api/clients/${clientId}/stage`, {
        method: 'PUT',
        body: JSON.stringify({ stage: targetStage })
      });
      const data = await response.json();
      if (response.ok) {
        triggerToast('success', `Client status updated to ${targetStage}!`);
        // Refresh stats and client list
        fetchDashboardData();
      } else {
        triggerToast('error', data.error || 'Failed to update stage');
      }
    } catch (error) {
      console.error('Error shifting stage:', error);
      triggerToast('error', 'Network error moving client card');
    }
  };

  return (
    <div className="space-y-8 select-none font-sans relative">
      
      {/* Toast Alert */}
      {toast.type && (
        <div className={`fixed top-24 right-8 z-50 p-4 rounded-xl border shadow-xl flex items-center gap-3 max-w-sm animate-slide-in bg-white ${
          toast.type === 'success' ? 'border-emerald-200 text-emerald-800' : 'border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' ? (
            <span className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">&#10003;</span>
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600" />
          )}
          <p className="text-xs font-semibold leading-relaxed flex-grow">{toast.message}</p>
          <button onClick={() => setToast({ type: null, message: '' })} className="text-tdc-charcoal/30 hover:text-tdc-charcoal">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-tdc-green-dark">Matchmaker Dashboard</h1>
          <p className="text-xs text-tdc-charcoal/60 font-sans font-medium mt-0.5">
            Monitor client journey pipelines, update schedules, and coordinate algorithmic profile matches.
          </p>
        </div>

        {/* View Mode Toggle Controls */}
        <div className="flex items-center gap-2 bg-white border border-tdc-cream-dark/50 p-1.5 rounded-xl shadow-sm">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg smooth-transition ${
              viewMode === 'kanban' 
                ? 'bg-tdc-green text-white shadow-sm' 
                : 'text-tdc-charcoal/60 hover:text-tdc-green hover:bg-tdc-cream/20'
            }`}
          >
            <Kanban className="h-4 w-4" />
            <span>Kanban Pipeline</span>
          </button>
          <button
            onClick={() => setViewMode('directory')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg smooth-transition ${
              viewMode === 'directory' 
                ? 'bg-tdc-green text-white shadow-sm' 
                : 'text-tdc-charcoal/60 hover:text-tdc-green hover:bg-tdc-cream/20'
            }`}
          >
            <List className="h-4 w-4" />
            <span>Client Directory</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Stats */}
      <MetricCards stats={stats} />

      {/* Main Content Area */}
      {loading && clients.length === 0 ? (
        <div className="py-32 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tdc-gold mx-auto mb-4"></div>
          <p className="font-serif text-lg text-tdc-green italic">Loading Portfolio Data...</p>
        </div>
      ) : (
        <div className="animate-fade-in">
          {viewMode === 'kanban' ? (
            <div className="space-y-6">
              {/* Kanban Filters */}
              <div className="bg-white p-4 rounded-xl border border-tdc-cream-dark/30 shadow-[0_2px_15px_-4px_rgba(29,38,35,0.02)] flex flex-wrap gap-3 items-center">
                <span className="text-xs font-bold text-tdc-green uppercase tracking-wider mr-auto">Pipeline Stages Overview</span>
                
                <input
                  type="text"
                  placeholder="Search name, city, caste..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs font-sans bg-tdc-beige/30 border border-tdc-cream-dark px-3 py-1.5 rounded-lg outline-none focus:border-tdc-gold w-full sm:w-56"
                />

                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="text-xs font-sans bg-white border border-tdc-cream-dark px-2.5 py-1.5 rounded-lg outline-none focus:border-tdc-gold cursor-pointer"
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                
                <button 
                  onClick={() => { setSearch(''); setGenderFilter(''); setStageFilter(''); }}
                  className="p-1.5 hover:bg-tdc-cream/30 text-tdc-charcoal/50 hover:text-tdc-green rounded-lg smooth-transition border border-transparent hover:border-tdc-cream-dark/50"
                  title="Reset Filters"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>

              <ClientKanban 
                clients={clients} 
                onStageChange={handleStageChange} 
              />
            </div>
          ) : (
            <ClientTable
              clients={clients}
              search={search}
              setSearch={setSearch}
              genderFilter={genderFilter}
              setGenderFilter={setGenderFilter}
              stageFilter={stageFilter}
              setStageFilter={setStageFilter}
            />
          )}
        </div>
      )}

    </div>
  );
};

export default Dashboard;
