import React, { useState, useEffect } from 'react';
import { Sliders, Sparkles, Heart, Brain, Mail, Send, Award, Compass, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

const MatchPanel = ({ client, apiCall, onMatchSent, triggerToast }) => {
  const [weights, setWeights] = useState({
    age: 5,
    location: 5,
    income: 5,
    diet: 5,
    values: 5,
    education: 5,
    religion: 5
  });

  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [initializingWeights, setInitializingWeights] = useState(false);
  const [updatingWeights, setUpdatingWeights] = useState(false);
  
  // AI Compatibility Modal States
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [aiReasoning, setAiReasoning] = useState(null);
  const [loadingReasoning, setLoadingReasoning] = useState(false);
  const [reasoningModalOpen, setReasoningModalOpen] = useState(false);

  // Email Intro Modal States
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState({ subject: '', body: '' });
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [lastPreviewUrl, setLastPreviewUrl] = useState(null);

  // Weights Modal State
  const [weightsModalOpen, setWeightsModalOpen] = useState(false);

  // Load initial weights
  useEffect(() => {
    if (client?.customWeights) {
      setWeights(client.customWeights);
    }
  }, [client]);

  // Load matches
  const fetchMatches = async () => {
    if (!client?._id) return;
    setLoadingMatches(true);
    try {
      const response = await apiCall(`/api/matches/${client._id}/matches`);
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [client?._id]);

  // Handle weight slider changes
  const handleWeightChange = (key, value) => {
    setWeights(prev => ({ ...prev, [key]: Number(value) }));
  };

  // Recalculate matches in real-time when sliders change
  // We save the weights to DB after a short delay (debounce) or when button is clicked. Let's make it so they can drag, see scores change, and click Save or let it save automatically on mouse up!
  const handleSliderMouseUp = async () => {
    setUpdatingWeights(true);
    try {
      const response = await apiCall(`/api/clients/${client._id}/weights`, {
        method: 'PUT',
        body: JSON.stringify({ weights })
      });
      if (response.ok) {
        await fetchMatches(); // Reload matches with new weights
      }
    } catch (error) {
      console.error('Error saving weights:', error);
    } finally {
      setUpdatingWeights(false);
    }
  };

  // Initialize weights using AI Co-pilot
  const handleAiInitializeWeights = async () => {
    if (!client?.bio) {
      triggerToast('error', 'Client needs a biography to analyze weights!');
      return;
    }
    
    setInitializingWeights(true);
    try {
      const response = await apiCall(`/api/matches/${client._id}/ai-weights`, {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        setWeights(data.weights);
        triggerToast('success', 'Weights successfully initialized from bio by AI Matchmaker Co-Pilot!');
        // Reload matches
        const matchesRes = await apiCall(`/api/matches/${client._id}/matches`);
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          setMatches(matchesData);
        }
      } else {
        triggerToast('error', data.error || 'AI weights extraction failed');
      }
    } catch (error) {
      console.error('Error running AI weights:', error);
      triggerToast('error', 'Failed to connect to AI Co-pilot');
    } finally {
      setInitializingWeights(false);
    }
  };

  // View AI compatibility analysis
  const handleViewCompatibility = async (match) => {
    setSelectedMatch(match.profile);
    setReasoningModalOpen(true);
    setLoadingReasoning(true);
    setAiReasoning(null);
    try {
      const response = await apiCall(`/api/matches/reasoning`, {
        method: 'POST',
        body: JSON.stringify({
          clientId: client._id,
          candidateId: match.profile._id
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAiReasoning(data);
      }
    } catch (error) {
      console.error('Error fetching compatibility details:', error);
      triggerToast('error', 'Failed to load AI details');
    } finally {
      setLoadingReasoning(false);
    }
  };

  // Initialize email composer
  const handleOpenEmailModal = async (match, compatibility) => {
    setSelectedMatch(match.profile);
    setEmailModalOpen(true);
    setLoadingEmail(true);
    try {
      const response = await apiCall(`/api/matches/email-intro`, {
        method: 'POST',
        body: JSON.stringify({
          clientId: client._id,
          candidateId: match.profile._id,
          compatibilitySummary: compatibility?.summary || ''
        })
      });
      if (response.ok) {
        const data = await response.json();
        setEmailDraft(data);
      }
    } catch (error) {
      console.error('Error generating email draft:', error);
      triggerToast('error', 'Failed to generate pitch email');
    } finally {
      setLoadingEmail(false);
    }
  };

  // Send email (calls backend send endpoints)
  const handleSendMatch = async () => {
    if (!selectedMatch?._id) return;
    setSendingEmail(true);
    try {
      const response = await apiCall(`/api/matches/send`, {
        method: 'POST',
        body: JSON.stringify({
          clientId: client._id,
          candidateId: selectedMatch._id,
          subject: emailDraft.subject,
          body: emailDraft.body
        })
      });
      const data = await response.json();
      if (response.ok) {
        if (data.emailResult?.previewUrl) {
          setLastPreviewUrl(data.emailResult.previewUrl);
          window.open(data.emailResult.previewUrl, '_blank');
        }
        triggerToast('success', `Match proposal sent to ${client.firstName}!`);
        setEmailModalOpen(false);
        onMatchSent(); // Refresh client state (e.g. stage, matchesSent array)
        fetchMatches(); // Reload matches list to update badge
      } else {
        triggerToast('error', data.error || 'Failed to send match recommendation');
      }
    } catch (error) {
      console.error('Error sending match:', error);
      triggerToast('error', 'Failed to complete transaction');
    } finally {
      setSendingEmail(false);
    }
  };

  const getAge = (dob) => {
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const getScoreBarColor = (score) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-tdc-sage';
  };

  return (
    <div className="space-y-5 font-sans">
      
      {/* Recommended Matches Pool Header Panel with inline Set Weights button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-tdc-cream-dark/30 shadow-[0_2px_15px_-4px_rgba(29,38,35,0.02)]">
        <div>
          <h3 className="font-serif text-lg font-bold text-tdc-green">
            Recommended Matches Pool
          </h3>
          <p className="text-xs text-tdc-charcoal/60 font-medium font-sans mt-0.5">
            Showing opposite gender candidates sorted by AI compatibility score (&gt; 50%).
          </p>
        </div>
        <button
          onClick={() => setWeightsModalOpen(true)}
          className="bg-tdc-green hover:bg-tdc-gold text-white hover:text-tdc-green-dark py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 font-semibold text-xs uppercase tracking-wider border border-tdc-gold/30 hover:border-tdc-gold smooth-transition flex-shrink-0"
        >
          <Sliders className="h-3.5 w-3.5 text-tdc-gold" />
          <span>Set Weights</span>
        </button>
      </div>

      <div className="space-y-4">

        {lastPreviewUrl && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Email sent successfully!</strong> You can review the sent email pitch on Ethereal.
              </span>
            </div>
            <a 
              href={lastPreviewUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg smooth-transition flex-shrink-0"
            >
              Open Ethereal Preview ↗
            </a>
          </div>
        )}

        {loadingMatches ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tdc-gold mx-auto mb-4"></div>
            <p className="font-serif text-tdc-green italic">Recalculating Match Percentages...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-tdc-cream-dark/35">
            <p className="font-serif text-tdc-charcoal/50 italic">No matching candidates available in the pool.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {matches.map((match) => {
              const age = getAge(match.profile.dob);
              const isSent = client.matchesSent?.includes(match.profile._id);

              return (
                <div 
                  key={match.profile._id} 
                  className={`bg-white p-5 rounded-xl border flex flex-col gap-4 transition-all duration-300 shadow-[0_2px_15px_-4px_rgba(29,38,35,0.02)] hover:shadow-[0_8px_25px_-5px_rgba(29,38,35,0.06)] hover:border-tdc-gold/60 ${
                    isSent ? 'border-emerald-100 bg-emerald-50/5' : 'border-tdc-cream-dark/30'
                  }`}
                >
                  <div className="space-y-1.5 w-full">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-serif font-bold text-base text-tdc-green hover:text-tdc-gold transition-colors">
                        {match.profile.firstName} {match.profile.lastName}
                      </h4>
                      <span className="text-xs text-tdc-charcoal/50 font-medium">&bull; {age} yrs &bull; {match.profile.city}</span>
                      {isSent && (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Recommended
                        </span>
                      )}
                    </div>
                    
                    {/* details line */}
                    <p className="text-xs text-tdc-charcoal/70 font-sans leading-relaxed truncate">
                      <b>{match.profile.religion} &bull; {match.profile.caste}</b> | {match.profile.degree} &bull; {match.profile.designation} at {match.profile.company}
                    </p>
                    
                    <p className="text-[11px] text-tdc-charcoal/50 italic font-sans leading-relaxed line-clamp-1">
                      "{match.profile.bio}"
                    </p>
                    
                    {/* Score Bar */}
                    <div className="pt-2 flex items-center gap-2 w-full">
                      <div className="flex-grow bg-tdc-cream rounded-full h-1.5 overflow-hidden border border-tdc-cream-dark/30">
                        <div className={`h-full ${getScoreBarColor(match.score)}`} style={{ width: `${match.score}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-tdc-charcoal/70">{match.score}% match</span>
                    </div>

                    {/* AI Insights Summary */}
                    {match.compatibility?.summary && (
                      <div className="mt-3 text-xs text-tdc-charcoal/80 bg-tdc-cream/20 p-3 rounded-lg border border-tdc-cream-dark/30">
                        <p className="font-semibold text-tdc-green mb-0.5">AI Compatibility Summary:</p>
                        <p className="leading-relaxed">{match.compatibility.summary}</p>
                      </div>
                    )}

                    {/* Key points removed from card view (accessible via Deep AI Co-Pilot modal) */}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center gap-3 pt-3 border-t border-tdc-cream-dark/30 w-full">
                    {/* Compatibility reasoning button */}
                    <button
                      onClick={() => handleViewCompatibility(match)}
                      className="flex-1 bg-tdc-cream hover:bg-tdc-gold/20 text-tdc-green-dark border border-tdc-cream-dark font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 smooth-transition"
                    >
                      <Brain className="h-3.5 w-3.5 text-tdc-gold fill-tdc-gold" />
                      <span>Deep AI Co-Pilot</span>
                    </button>

                    {/* Email Intro button */}
                    <button
                      onClick={() => handleOpenEmailModal(match, match.compatibility)}
                      className="flex-1 bg-tdc-green hover:bg-tdc-gold text-white hover:text-tdc-green-dark border border-tdc-green/10 hover:border-tdc-gold font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 smooth-transition"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>{isSent ? 'Resend Pitch' : 'Send Match'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 3. AI COMPATIBILITY INSIGHTS MODAL */}
      {reasoningModalOpen && (
        <div className="fixed inset-0 bg-tdc-charcoal/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full border-2 border-tdc-gold shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up font-sans">
            {/* Header */}
            <div className="bg-tdc-green text-white p-5 border-b-2 border-tdc-gold flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-tdc-gold fill-tdc-gold" />
                <h3 className="font-serif text-lg font-bold text-tdc-beige">
                  AI Compatibility Co-Pilot Insights
                </h3>
              </div>
              <button 
                onClick={() => setReasoningModalOpen(false)}
                className="text-tdc-cream/60 hover:text-white text-xl font-bold transition-colors outline-none"
              >
                &times;
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              {loadingReasoning ? (
                <div className="py-16 text-center space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tdc-gold mx-auto"></div>
                  <p className="font-serif text-tdc-green italic">Analyzing profiles compatibility index...</p>
                </div>
              ) : aiReasoning ? (
                <>
                  {/* Summary Score Callout */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-tdc-cream/30 p-5 rounded-xl border border-tdc-cream-dark/40">
                    <div className="w-20 h-20 rounded-full border-4 border-tdc-gold flex items-center justify-center bg-white shadow-md font-serif text-2xl font-bold text-tdc-green-dark flex-shrink-0">
                      {aiReasoning.score}%
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-tdc-green text-base">Compatibility Overview</h4>
                      <p className="text-xs text-tdc-charcoal/85 leading-relaxed mt-1">{aiReasoning.summary}</p>
                    </div>
                  </div>

                  {/* Bullet Key Points */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-tdc-sage-dark border-b border-tdc-cream-dark pb-1.5">Compatibility Parameters</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiReasoning.keyPoints?.map((pt, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-tdc-cream-dark/30 shadow-sm bg-white space-y-1">
                          <div className="flex items-center gap-1.5">
                            {pt.status === 'good' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                            {pt.status === 'warning' && <ShieldAlert className="h-4 w-4 text-amber-600" />}
                            {pt.status === 'bad' && <ShieldAlert className="h-4 w-4 text-rose-600" />}
                            <span className="text-xs font-bold text-tdc-green-dark">{pt.label}</span>
                          </div>
                          <p className="text-[11px] text-tdc-charcoal/60 leading-relaxed font-medium">{pt.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-xs text-tdc-charcoal/50 italic">Failed to analyze compatibility reasoning.</p>
              )}
            </div>

            {/* Footer */}
            <div className="bg-tdc-cream/30 p-4 border-t border-tdc-cream-dark/40 flex justify-end gap-3">
              <button
                onClick={() => setReasoningModalOpen(false)}
                className="bg-white border border-tdc-cream-dark font-semibold text-xs text-tdc-charcoal px-5 py-2.5 rounded-lg hover:bg-tdc-cream smooth-transition"
              >
                Close Insights
              </button>
              {aiReasoning && (
                <button
                  onClick={() => {
                    setReasoningModalOpen(false);
                    handleOpenEmailModal({ profile: selectedMatch }, aiReasoning);
                  }}
                  className="bg-tdc-green hover:bg-tdc-gold text-white hover:text-tdc-green-dark border border-tdc-green/10 hover:border-tdc-gold font-semibold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 smooth-transition"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Draft Intro Pitch</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. EMAIL DRAFT PITCH COMPOSER MODAL */}
      {emailModalOpen && (
        <div className="fixed inset-0 bg-tdc-charcoal/60 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full border-2 border-tdc-gold shadow-2xl overflow-hidden flex flex-col max-h-[92vh] md:max-h-[85vh] animate-scale-up font-sans">
            {/* Header */}
            <div className="bg-tdc-green text-white p-4 sm:p-5 border-b-2 border-tdc-gold flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-tdc-gold" />
                <h3 className="font-serif text-base sm:text-lg font-bold text-tdc-beige">
                  Draft Profile Pitch Email
                </h3>
              </div>
              <button 
                onClick={() => setEmailModalOpen(false)}
                className="text-tdc-cream/60 hover:text-white text-xl font-bold transition-colors outline-none"
              >
                &times;
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-grow">
              {loadingEmail ? (
                <div className="py-16 text-center space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tdc-gold mx-auto"></div>
                  <p className="font-serif text-tdc-green italic">AI Matchmaker Co-Pilot is crafting your personalized pitch email...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* From / To Info headers */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4 text-xs font-semibold text-tdc-charcoal/80 bg-tdc-cream/30 p-3 sm:p-4 rounded-xl border border-tdc-cream-dark/30">
                    <div className="border-b sm:border-b-0 pb-2.5 sm:pb-0 border-tdc-cream-dark/20">
                      <p className="text-tdc-charcoal/40 text-[10px] uppercase">Recipient Client</p>
                      <p className="text-tdc-green font-serif font-bold text-sm mt-0.5">{client.firstName} {client.lastName}</p>
                      <p className="text-[10px] select-all break-all">{client.email}</p>
                    </div>
                    <div>
                      <p className="text-tdc-charcoal/40 text-[10px] uppercase">Recommended Profile</p>
                      <p className="text-tdc-green font-serif font-bold text-sm mt-0.5">{selectedMatch?.firstName} {selectedMatch?.lastName}</p>
                      <p className="text-[10px] select-all break-all">{selectedMatch?.email}</p>
                    </div>
                  </div>

                  {/* Subject input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-tdc-charcoal uppercase tracking-wider">Email Subject</label>
                    <input
                      type="text"
                      value={emailDraft.subject}
                      onChange={(e) => setEmailDraft(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full text-xs sm:text-sm font-sans bg-white border border-tdc-cream-dark px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg outline-none focus:border-tdc-gold smooth-transition"
                    />
                  </div>

                  {/* Body textarea */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-tdc-charcoal uppercase tracking-wider">Email Content</label>
                    <textarea
                      rows="6"
                      value={emailDraft.body}
                      onChange={(e) => setEmailDraft(prev => ({ ...prev, body: e.target.value }))}
                      className="w-full text-xs sm:text-sm font-sans bg-white border border-tdc-cream-dark px-3 sm:px-4 py-2 sm:py-3 rounded-lg outline-none focus:border-tdc-gold smooth-transition font-mono resize-none leading-relaxed h-44 sm:h-60"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-tdc-cream/30 p-4 border-t border-tdc-cream-dark/40 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
              <p className="text-[9px] sm:text-[10px] text-tdc-charcoal/40 max-w-full sm:max-w-xs leading-relaxed italic text-center sm:text-left">
                * Clicking "Send Match Pitch" will record this recommendation as dispatched and update client journey stage.
              </p>
              <div className="flex gap-2.5 sm:gap-3 w-full sm:w-auto justify-end flex-shrink-0">
                <button
                  onClick={() => setEmailModalOpen(false)}
                  className="flex-1 sm:flex-initial bg-white border border-tdc-cream-dark font-semibold text-xs text-tdc-charcoal px-4 sm:px-5 py-2.5 rounded-lg hover:bg-tdc-cream smooth-transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMatch}
                  disabled={loadingEmail || sendingEmail}
                  className="flex-1 sm:flex-initial bg-tdc-green hover:bg-tdc-gold text-white hover:text-tdc-green-dark border border-tdc-green/10 hover:border-tdc-gold font-semibold text-xs px-4 sm:px-5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 smooth-transition disabled:opacity-50"
                >
                  {sendingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                      <span>Sending Pitch...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Match Pitch</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MATCH WEIGHTS CUSTOMIZER MODAL */}
      {weightsModalOpen && (
        <div 
          className="fixed inset-0 bg-tdc-charcoal/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in"
          onClick={() => setWeightsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-3xl w-full border-2 border-tdc-gold shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[85vh] animate-scale-up font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-tdc-green text-white p-4 border-b-2 border-tdc-gold flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-tdc-gold" />
                <h3 className="font-serif text-base font-bold text-tdc-beige">
                  Match Weight Customizer
                </h3>
              </div>
              <button 
                onClick={() => setWeightsModalOpen(false)}
                className="text-tdc-cream/60 hover:text-white text-xl font-bold transition-colors outline-none"
              >
                &times;
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-grow">
              <div className="flex items-center justify-between bg-tdc-cream/20 p-2.5 rounded-lg border border-tdc-cream-dark/30">
                <div className="text-[11px] text-tdc-charcoal/70">
                  <p className="font-bold text-tdc-green text-xs">Optimize Matching Focus</p>
                  <p className="mt-0.5">Initialize weights via AI or modify values manually.</p>
                </div>
                <button
                  onClick={handleAiInitializeWeights}
                  disabled={initializingWeights}
                  className="bg-tdc-green hover:bg-tdc-gold text-white hover:text-tdc-green-dark py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 font-semibold text-[10px] uppercase tracking-wider border border-tdc-gold/30 hover:border-tdc-gold smooth-transition disabled:opacity-50 flex-shrink-0"
                >
                  {initializingWeights ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-tdc-gold fill-tdc-gold" />
                      <span>AI Co-Pilot</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sliders in a 3-column no-scroll grid layout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(weights).map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-1 p-2 rounded-lg border border-tdc-cream-dark/20 bg-slate-50/50">
                    <div className="flex justify-between items-center text-[11px] font-semibold text-tdc-charcoal">
                      <span className="capitalize">{key}</span>
                      <span className="text-[10px] text-tdc-gold-dark font-bold bg-tdc-cream px-1.5 py-0.5 rounded border border-tdc-cream-dark/30">
                        {val}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={val}
                      onChange={(e) => handleWeightChange(key, e.target.value)}
                      onMouseUp={handleSliderMouseUp}
                      onTouchEnd={handleSliderMouseUp}
                      className="w-full h-1 bg-tdc-cream-dark/30 rounded-lg appearance-none cursor-pointer accent-tdc-gold focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-tdc-charcoal/40 leading-relaxed font-medium italic text-center">
                * Drag weight sliders to trigger real-time candidate list recalculation.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-tdc-cream/30 p-3.5 border-t border-tdc-cream-dark/40 flex justify-between items-center">
              {updatingWeights ? (
                <span className="text-[10px] text-tdc-sage font-bold animate-pulse uppercase tracking-wider pl-1">
                  Recalculating Scores...
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider pl-1">
                  Changes Saved
                </span>
              )}
              <button
                onClick={() => setWeightsModalOpen(false)}
                className="bg-tdc-green hover:bg-tdc-gold text-white hover:text-tdc-green-dark border border-tdc-green/10 hover:border-tdc-gold font-semibold text-xs px-6 py-2.5 rounded-lg smooth-transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MatchPanel;
