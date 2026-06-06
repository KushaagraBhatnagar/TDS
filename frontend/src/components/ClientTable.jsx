import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowRight, CheckCircle2 } from 'lucide-react';

const ClientTable = ({ clients, search, setSearch, genderFilter, setGenderFilter, stageFilter, setStageFilter }) => {
  const getAge = (dob) => {
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  const getStageStyle = (stage) => {
    switch (stage) {
      case 'Lead':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Onboarding':
        return 'bg-amber-100/60 text-amber-800 border-amber-200';
      case 'Searching':
        return 'bg-blue-100/60 text-blue-800 border-blue-200';
      case 'Matched':
        return 'bg-emerald-100/60 text-emerald-800 border-emerald-200';
      case 'Inactive':
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-tdc-cream-dark/30 shadow-[0_4px_20px_-4px_rgba(29,38,35,0.03)] overflow-hidden mt-6">
      {/* Table Filters Header */}
      <div className="p-6 border-b border-tdc-cream-dark/30 flex flex-col md:flex-row gap-4 justify-between items-center bg-tdc-cream/20">
        <h3 className="font-serif text-lg font-bold text-tdc-green mr-auto">
          Client Directory
        </h3>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name, city, religion, caste..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow md:flex-initial text-sm font-sans bg-white border border-tdc-cream-dark px-4 py-2 rounded-lg outline-none focus:border-tdc-gold w-full md:w-72 smooth-transition shadow-sm"
          />

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="text-sm font-sans bg-white border border-tdc-cream-dark px-3 py-2 rounded-lg outline-none focus:border-tdc-gold cursor-pointer shadow-sm"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-sm font-sans bg-white border border-tdc-cream-dark px-3 py-2 rounded-lg outline-none focus:border-tdc-gold cursor-pointer shadow-sm"
          >
            <option value="">All Stages</option>
            <option value="Lead">Lead</option>
            <option value="Onboarding">Onboarding</option>
            <option value="Searching">Searching</option>
            <option value="Matched">Matched</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-tdc-cream-dark/30 text-left">
          <thead className="bg-tdc-cream/45 text-tdc-charcoal/70 uppercase text-[10px] tracking-wider font-semibold font-sans">
            <tr>
              <th scope="col" className="px-6 py-4">Client Name</th>
              <th scope="col" className="px-6 py-4">Gender</th>
              <th scope="col" className="px-6 py-4">Age</th>
              <th scope="col" className="px-6 py-4">City</th>
              <th scope="col" className="px-6 py-4">Religion & Caste</th>
              <th scope="col" className="px-6 py-4">Annual Income</th>
              <th scope="col" className="px-6 py-4">Journey Stage</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tdc-cream-dark/20 text-sm font-sans text-tdc-charcoal bg-white">
            {clients.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-12 text-tdc-charcoal/40 font-serif italic">
                  No matching client profiles found.
                </td>
              </tr>
            ) : (
              clients.map((client) => {
                const clientAge = getAge(client.dob);
                return (
                  <tr 
                    key={client._id} 
                    className="hover:bg-tdc-beige/30 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 font-semibold text-tdc-green whitespace-nowrap">
                      {client.firstName} {client.lastName}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        client.gender === 'male' 
                          ? 'bg-tdc-green/10 text-tdc-green-light' 
                          : 'bg-tdc-gold/15 text-tdc-gold-dark'
                      }`}>
                        {client.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4">{clientAge} yrs</td>
                    <td className="px-6 py-4 whitespace-nowrap">{client.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium">{client.religion}</span>
                      <span className="text-tdc-charcoal/50 text-xs block">{client.caste}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      &#8377; {Number(client.income).toLocaleString('en-IN')} / yr
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStageStyle(client.journeyStage)}`}>
                        {client.journeyStage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        to={`/clients/${client._id}`}
                        className="inline-flex items-center gap-1 bg-tdc-green/10 hover:bg-tdc-green text-tdc-green hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-tdc-green/10 transition-all duration-200"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Manage matches</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientTable;
