import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileDetail from '../components/ProfileDetail';
import MatchPanel from '../components/MatchPanel';
import NoteTimeline from '../components/NoteTimeline';
import { ArrowLeft, Check, AlertCircle, X, ChevronRight, Settings } from 'lucide-react';

const ClientDetails = () => {
  const { id } = useParams();
  const { apiCall } = useAuth();
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stageUpdating, setStageUpdating] = useState(false);

  // Toast Alerts State
  const [toast, setToast] = useState({ type: null, message: '' });

  const triggerToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast({ type: null, message: '' });
    }, 4500);
  };

  const fetchClientDetails = async () => {
    try {
      const response = await apiCall(`/api/clients/${id}`);
      if (response.ok) {
        const data = await response.json();
        setClient(data);
      } else {
        triggerToast('error', 'Failed to retrieve client profile details.');
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
      triggerToast('error', 'Network error retrieving profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDetails();
  }, [id]);

  // Stage Switcher
  const handleStageChange = async (e) => {
    const targetStage = e.target.value;
    if (!targetStage) return;

    setStageUpdating(true);
    try {
      const response = await apiCall(`/api/clients/${client._id}/stage`, {
        method: 'PUT',
        body: JSON.stringify({ stage: targetStage })
      });
      if (response.ok) {
        triggerToast('success', `Journey stage changed to ${targetStage}!`);
        fetchClientDetails(); // Reload client details
      } else {
        triggerToast('error', 'Failed to update client status');
      }
    } catch (error) {
      console.error('Error updating stage:', error);
      triggerToast('error', 'Failed to save stage change');
    } finally {
      setStageUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tdc-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tdc-gold mx-auto mb-4"></div>
          <p className="font-serif text-lg text-tdc-green italic">Loading Matchmaker Co-Pilot Console...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-tdc-beige flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-600 animate-bounce" />
        <h2 className="font-serif text-2xl font-bold text-tdc-green-dark">Profile Not Found</h2>
        <Link to="/" className="text-sm font-semibold text-tdc-gold hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans relative">
      
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

      {/* Breadcrumbs & Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-tdc-cream-dark/30 shadow-[0_2px_15px_-4px_rgba(29,38,35,0.02)]">
        
        {/* Navigation back */}
        <div className="flex items-center gap-2 text-xs font-semibold text-tdc-charcoal/60">
          <Link to="/" className="hover:text-tdc-gold flex items-center gap-1 smooth-transition">
            <span>Dashboard</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-55" />
          <span className="text-tdc-green font-bold">Client Matchmaking Co-Pilot</span>
        </div>

        {/* Action Controls: Stage Switcher */}
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-tdc-cream-dark/30">
          <span className="text-xs font-bold text-tdc-charcoal/70 uppercase whitespace-nowrap">Journey Stage:</span>
          <div className="relative flex-grow sm:flex-initial">
            <select
              value={client.journeyStage}
              onChange={handleStageChange}
              disabled={stageUpdating}
              className="w-full text-xs font-bold font-sans bg-tdc-cream border border-tdc-cream-dark px-4 py-2 rounded-lg outline-none focus:border-tdc-gold cursor-pointer smooth-transition text-tdc-green-dark"
            >
              <option value="Lead">Lead Stage</option>
              <option value="Onboarding">Onboarding Stage</option>
              <option value="Searching">Searching Stage</option>
              <option value="Matched">Matched Stage</option>
              <option value="Inactive">Inactive Stage</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Layout splits: Profile + Timeline (Left) & Matchmaking (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand: Profile & Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Detailed Tabbed Biodata card */}
          <ProfileDetail client={client} />
          
          {/* Sentiment Log Note timeline */}
          <NoteTimeline
            client={client}
            apiCall={apiCall}
            onNoteAdded={fetchClientDetails}
            triggerToast={triggerToast}
          />
        </div>

        {/* Right Hand: Matchmaking Algo sliders & Recommendations Pool (7 cols) */}
        <div className="lg:col-span-7">
          <MatchPanel
            client={client}
            apiCall={apiCall}
            onMatchSent={fetchClientDetails}
            triggerToast={triggerToast}
          />
        </div>

      </div>

    </div>
  );
};

export default ClientDetails;
