import React, { useState } from 'react';
import { MessageSquare, Calendar, Send } from 'lucide-react';

const NoteTimeline = ({ client, apiCall, onNoteAdded, triggerToast }) => {
  const [noteText, setNoteText] = useState('');
  const [loggingNote, setLoggingNote] = useState(false);

  const handleLogNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setLoggingNote(true);
    try {
      const response = await apiCall(`/api/clients/${client._id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ text: noteText })
      });
      const data = await response.json();
      if (response.ok) {
        setNoteText('');
        triggerToast('success', 'Meeting note logged and concerns analyzed!');
        onNoteAdded(); // Refresh client details
      } else {
        triggerToast('error', data.error || 'Failed to log meeting note');
      }
    } catch (error) {
      console.error('Error logging notes:', error);
      triggerToast('error', 'Network error logging note');
    } finally {
      setLoggingNote(false);
    }
  };

  const sortedNotes = [...(client.notes || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="bg-white p-6 rounded-xl border border-tdc-cream-dark/30 shadow-[0_4px_20px_-4px_rgba(29,38,35,0.03)] flex flex-col h-full font-sans">
      <div className="flex items-center gap-2 border-b border-tdc-cream-dark pb-4 mb-4">
        <MessageSquare className="h-5 w-5 text-tdc-gold" />
        <h3 className="font-serif text-lg font-bold text-tdc-green">
          Interaction Call Logs & Notes
        </h3>
      </div>

      {/* Note Composer Form */}
      <form onSubmit={handleLogNote} className="space-y-3 mb-6">
        <textarea
          rows="3"
          placeholder="Log call details, client feedback on recommendations, or meeting summaries..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          disabled={loggingNote}
          className="w-full text-xs font-sans bg-white border border-tdc-cream-dark px-4 py-3 rounded-lg outline-none focus:border-tdc-gold smooth-transition resize-none leading-relaxed shadow-sm disabled:opacity-50"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loggingNote || !noteText.trim()}
            className="bg-tdc-green hover:bg-tdc-gold text-white hover:text-tdc-green-dark border border-tdc-green/10 hover:border-tdc-gold font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 smooth-transition disabled:opacity-50"
          >
            {loggingNote ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                <span>Logging Interaction Note...</span>
              </>
            ) : (
              <>
                <Send className="h-3 w-3" />
                <span>Log Interaction Note</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Notes Timeline */}
      <div className="flex-grow overflow-y-auto max-h-[380px] space-y-4 pr-1">
        {sortedNotes.length === 0 ? (
          <div className="py-12 border border-dashed border-tdc-cream-dark/40 rounded-xl text-center">
            <p className="text-xs text-tdc-charcoal/40 italic">No call logs registered for this client.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-tdc-cream pl-4 ml-2 space-y-6">
            {sortedNotes.map((note) => {
              return (
                <div key={note._id} className="relative">
                  {/* Bullet Node */}
                  <span className="absolute -left-[25px] mt-1 bg-white rounded-full border border-tdc-cream-dark flex items-center justify-center p-1 text-tdc-gold shadow-sm">
                    <MessageSquare className="h-3 w-3" />
                  </span>

                  {/* Card note content */}
                  <div className="bg-tdc-cream/10 p-4 rounded-xl border border-tdc-cream-dark/20 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-tdc-charcoal/40 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {new Date(note.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-tdc-charcoal/80 leading-relaxed font-sans font-medium whitespace-pre-line">
                      {note.text}
                    </p>

                    {/* Concern Tags */}
                    {note.concerns?.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5 border-t border-tdc-cream-dark/15">
                        <span className="text-[9px] font-bold text-tdc-charcoal/40 uppercase tracking-wide self-center mr-1">Concerns Raised:</span>
                        {note.concerns.map((con, idx) => (
                          <span key={idx} className="bg-rose-50 text-rose-800 text-[9px] font-bold px-2 py-0.5 rounded border border-rose-100 uppercase tracking-wider">
                            {con}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteTimeline;
