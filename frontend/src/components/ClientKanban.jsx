import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, UserCheck, Briefcase, HelpCircle, RefreshCw } from 'lucide-react';

const COLUMNS = [
  { 
    id: 'Lead', 
    label: 'Lead', 
    tooltip: 'Newly registered profile undergoing initial vetting and screening.',
    bg: 'bg-slate-50',
    headerBg: 'bg-slate-100 text-slate-800 border-slate-300'
  },
  { 
    id: 'Onboarding', 
    label: 'Onboarding', 
    tooltip: 'Gathering deep biodata, horoscope details, and lifestyle values.',
    bg: 'bg-amber-50/40',
    headerBg: 'bg-amber-100/60 text-amber-800 border-amber-200'
  },
  { 
    id: 'Searching', 
    label: 'Searching', 
    tooltip: 'Active matching pool. Running algorithms and custom weight tuning.',
    bg: 'bg-blue-50/40',
    headerBg: 'bg-blue-100/60 text-blue-800 border-blue-200'
  },
  { 
    id: 'Matched', 
    label: 'Matched', 
    tooltip: 'Recommendations generated. Introduction emails sent to clients.',
    bg: 'bg-emerald-50/40',
    headerBg: 'bg-emerald-100/60 text-emerald-800 border-emerald-200'
  },
  { 
    id: 'Inactive', 
    label: 'Inactive', 
    tooltip: 'Completed match journey successfully, or account paused.',
    bg: 'bg-neutral-50',
    headerBg: 'bg-neutral-100 text-neutral-600 border-neutral-200'
  }
];

const ClientKanban = ({ clients, onStageChange }) => {
  const [draggedClientId, setDraggedClientId] = useState(null);
  const [hoveredColumnId, setHoveredColumnId] = useState(null);

  const handleDragStart = (e, clientId) => {
    setDraggedClientId(clientId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setHoveredColumnId(columnId);
  };

  const handleDragLeave = () => {
    setHoveredColumnId(null);
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    setHoveredColumnId(null);
    if (draggedClientId) {
      onStageChange(draggedClientId, targetStage);
      setDraggedClientId(null);
    }
  };

  // Group clients by stage
  const clientsByStage = COLUMNS.reduce((acc, col) => {
    acc[col.id] = clients.filter(c => c.journeyStage === col.id);
    return acc;
  }, {});

  const getAge = (dob) => {
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-6 overflow-x-auto select-none min-h-[600px] pb-6">
      {COLUMNS.map((column) => {
        const columnClients = clientsByStage[column.id] || [];
        const isHovered = hoveredColumnId === column.id;

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`flex flex-col rounded-xl border border-tdc-cream-dark/30 p-3 min-w-[220px] transition-all duration-200 ${
              isHovered ? 'bg-tdc-cream border-tdc-gold shadow-md' : column.bg
            }`}
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between p-2.5 rounded-lg border font-serif text-sm font-semibold mb-4 relative group cursor-help z-20 ${column.headerBg}`}>
              <div className="flex items-center gap-1.5">
                <span>{column.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/70 shadow-sm font-sans font-medium">
                  {columnClients.length}
                </span>
              </div>
              <HelpCircle className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              
              {/* Tooltip on Hover */}
              <div className="absolute top-full left-0 mt-2 w-56 p-2.5 bg-tdc-charcoal text-white text-[11px] leading-relaxed rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 font-sans font-normal border border-tdc-charcoal-light">
                <div className="font-semibold text-tdc-gold mb-1">{column.label} Stage</div>
                {column.tooltip}
              </div>
            </div>

            {/* Column Body (Cards List) */}
            <div className="flex-grow flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-1">
              {columnClients.length === 0 ? (
                <div className="flex-grow border-2 border-dashed border-tdc-cream-dark/20 rounded-xl flex items-center justify-center py-12 px-4 text-center">
                  <p className="text-xs text-tdc-charcoal/40 font-sans italic">Drag profiles here</p>
                </div>
              ) : (
                columnClients.map((client) => {
                  const clientAge = getAge(client.dob);
                  return (
                    <div
                      key={client._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, client._id)}
                      className={`bg-white p-4 rounded-xl border shadow-[0_2px_10px_-3px_rgba(29,38,35,0.03)] cursor-grab active:cursor-grabbing hover:border-tdc-gold transition-all duration-200 group relative ${
                        client.gender === 'male' 
                          ? 'border-l-4 border-l-tdc-green-light border-tdc-cream-dark/30' 
                          : 'border-l-4 border-l-tdc-gold border-tdc-cream-dark/30'
                      }`}
                    >
                      <Link to={`/clients/${client._id}`} className="block">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="font-serif font-semibold text-tdc-green text-sm group-hover:text-tdc-gold transition-colors">
                            {client.firstName} {client.lastName}
                          </p>
                          <span className={`text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            client.gender === 'male' 
                              ? 'bg-tdc-green/10 text-tdc-green-light' 
                              : 'bg-tdc-gold/15 text-tdc-gold-dark'
                          }`}>
                            {client.gender === 'male' ? 'M' : 'F'}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-[11px] text-tdc-charcoal/60 font-sans">
                          <p>{clientAge} yrs &bull; {client.city}</p>
                          <p className="font-medium text-tdc-charcoal/70 truncate">{client.religion} &bull; {client.caste}</p>
                          <p className="italic text-[10px] truncate">"{client.designation} at {client.company}"</p>
                        </div>

                        {/* Matches count tag */}
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-tdc-cream-dark/30 text-[10px] text-tdc-charcoal/40 font-sans">
                          <span>Diet: <b>{client.diet}</b></span>
                          {client.matchesSent?.length > 0 && (
                            <span className="flex items-center gap-0.5 text-tdc-gold font-semibold">
                              <Heart className="h-3 w-3 fill-tdc-gold" />
                              <span>{client.matchesSent.length} Sent</span>
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClientKanban;
