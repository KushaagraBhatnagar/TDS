import React, { useState } from 'react';
import { User, Briefcase, Heart, Compass, MapPin, Calendar, Mail, Phone, Award, DollarSign, Users, Shield, BookOpen, Info } from 'lucide-react';

const ProfileDetail = ({ client }) => {
  const [activeTab, setActiveTab] = useState('personal');

  const getAge = (dob) => {
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  // Convert height in cm to feet and inches
  const formatHeight = (cm) => {
    const inchesTotal = cm / 2.54;
    const feet = Math.floor(inchesTotal / 12);
    const inches = Math.round(inchesTotal % 12);
    return `${cm} cm (${feet}'${inches}")`;
  };

  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'career', label: 'Career & Education', icon: Briefcase },
    { id: 'lifestyle', label: 'Lifestyle & Values', icon: Heart },
    { id: 'matrimony', label: 'Indian Matrimony', icon: Compass },
    { id: 'preferences', label: 'Partner Preferences', icon: Shield }
  ];

  return (
    <div className="bg-white rounded-xl border border-tdc-cream-dark/30 shadow-[0_4px_20px_-4px_rgba(29,38,35,0.03)] overflow-hidden flex flex-col h-full">
      {/* Header Info */}
      <div className="p-6 bg-tdc-green text-white border-b-2 border-tdc-gold flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-tdc-gold font-sans">
            Client Profile Biodata
          </span>
          <h2 className="font-serif text-2xl font-bold text-tdc-beige mt-1">
            {client.firstName} {client.lastName}
          </h2>
          <p className="text-sm text-tdc-cream/70 font-sans mt-0.5">
            {getAge(client.dob)} years old &bull; {client.city}, {client.country}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10 text-xs font-sans font-medium uppercase tracking-wider text-tdc-gold">
          <span className="h-2 w-2 rounded-full bg-tdc-gold animate-pulse"></span>
          {client.journeyStage}
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-tdc-cream-dark/35 bg-tdc-cream/15 font-sans overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all duration-200 outline-none ${isActive
                  ? 'border-tdc-gold text-tdc-green bg-white'
                  : 'border-transparent text-tdc-charcoal/50 hover:text-tdc-green hover:bg-tdc-cream/10'
                }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="p-6 flex-grow overflow-y-auto max-h-[500px]">

        {/* Personal Details Panel */}
         {activeTab === 'personal' && (
          <div className="space-y-6 font-sans">
            {/* Identity & Contact */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-tdc-sage-dark border-b border-tdc-cream-dark pb-2">Identity & Contact</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-tdc-cream/10 p-3 rounded-xl border border-tdc-cream-dark/25 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-tdc-charcoal/45">
                    <User className="h-3.5 w-3.5 text-tdc-gold" />
                    <span>Full Name</span>
                  </div>
                  <div className="text-sm font-semibold text-tdc-green-dark pl-5">{client.firstName} {client.lastName}</div>
                </div>

                <div className="bg-tdc-cream/10 p-3 rounded-xl border border-tdc-cream-dark/25 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-tdc-charcoal/45">
                    <Calendar className="h-3.5 w-3.5 text-tdc-gold" />
                    <span>Date of Birth</span>
                  </div>
                  <div className="text-sm font-semibold text-tdc-green-dark pl-5">
                    {new Date(client.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                <div className="bg-tdc-cream/10 p-3 rounded-xl border border-tdc-cream-dark/25 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-tdc-charcoal/45">
                    <Mail className="h-3.5 w-3.5 text-tdc-gold" />
                    <span>Email Address</span>
                  </div>
                  <div className="text-sm font-semibold text-tdc-green-dark pl-5 select-all break-all">{client.email}</div>
                </div>

                <div className="bg-tdc-cream/10 p-3 rounded-xl border border-tdc-cream-dark/25 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-tdc-charcoal/45">
                    <Phone className="h-3.5 w-3.5 text-tdc-gold" />
                    <span>Phone Number</span>
                  </div>
                  <div className="text-sm font-semibold text-tdc-green-dark pl-5 select-all">{client.phone}</div>
                </div>
              </div>
            </div>

            {/* Physical & Family Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-tdc-sage-dark border-b border-tdc-cream-dark pb-2">Physical & Family Info</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-tdc-cream/10 p-3 rounded-xl border border-tdc-cream-dark/25 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-tdc-charcoal/45">
                    <Compass className="h-3.5 w-3.5 text-tdc-gold" />
                    <span>Gender</span>
                  </div>
                  <div className="text-sm font-semibold text-tdc-green-dark pl-5 capitalize">{client.gender}</div>
                </div>

                <div className="bg-tdc-cream/10 p-3 rounded-xl border border-tdc-cream-dark/25 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-tdc-charcoal/45">
                    <Compass className="h-3.5 w-3.5 text-tdc-gold" />
                    <span>Height</span>
                  </div>
                  <div className="text-sm font-semibold text-tdc-green-dark pl-5">{formatHeight(client.height)}</div>
                </div>

                <div className="bg-tdc-cream/10 p-3 rounded-xl border border-tdc-cream-dark/25 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-tdc-charcoal/45">
                    <MapPin className="h-3.5 w-3.5 text-tdc-gold" />
                    <span>Current City</span>
                  </div>
                  <div className="text-sm font-semibold text-tdc-green-dark pl-5 truncate" title={`${client.city}, ${client.country}`}>{client.city}, {client.country}</div>
                </div>

                <div className="bg-tdc-cream/10 p-3 rounded-xl border border-tdc-cream-dark/25 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-tdc-charcoal/45">
                    <Users className="h-3.5 w-3.5 text-tdc-gold" />
                    <span>Siblings</span>
                  </div>
                  <div className="text-sm font-semibold text-tdc-green-dark pl-5">{client.siblings}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Career & Education Panel */}
        {activeTab === 'career' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-tdc-sage-dark border-b border-tdc-cream-dark pb-2 mb-3">Education</h4>
              <div className="flex items-start gap-3 text-sm">
                <Award className="h-4 w-4 text-tdc-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-tdc-charcoal/60 text-xs">Degree</p>
                  <p className="font-semibold text-tdc-charcoal">{client.degree}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <BookOpen className="h-4 w-4 text-tdc-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-tdc-charcoal/60 text-xs">Undergraduate College / University</p>
                  <p className="font-semibold text-tdc-charcoal">{client.college}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-tdc-sage-dark border-b border-tdc-cream-dark pb-2 mb-3">Employment & Finances</h4>
              <div className="flex items-start gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-tdc-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-tdc-charcoal/60 text-xs">Designation & Company</p>
                  <p className="font-semibold text-tdc-charcoal">{client.designation}</p>
                  <p className="text-xs text-tdc-charcoal/60">{client.company}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <DollarSign className="h-4 w-4 text-tdc-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-tdc-charcoal/60 text-xs">Annual Income</p>
                  <p className="font-semibold text-tdc-green text-base">
                    &#8377; {Number(client.income).toLocaleString('en-IN')} LPA
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lifestyle & Values Panel */}
        {activeTab === 'lifestyle' && (
          <div className="space-y-6 font-sans">
            {/* Bio Callout */}
            <div className="bg-tdc-beige/40 p-4 rounded-xl border border-tdc-cream-dark/30 italic text-tdc-charcoal/85 text-sm font-sans flex items-start gap-3">
              <Info className="h-5 w-5 text-tdc-gold flex-shrink-0 mt-0.5" />
              <p>"{client.bio || 'No personal bio listed.'}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-tdc-sage-dark border-b border-tdc-cream-dark pb-2 mb-3">Core Status & Habits</h4>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                  <span className="text-tdc-charcoal/60 w-28">Marital Status:</span>
                  <span className="font-semibold text-tdc-charcoal">{client.maritalStatus}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Heart className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                  <span className="text-tdc-charcoal/60 w-28">Diet:</span>
                  <span className="font-semibold text-tdc-charcoal">{client.diet}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Compass className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                  <span className="text-tdc-charcoal/60 w-28">Smoking Habit:</span>
                  <span className="font-medium text-tdc-charcoal">{client.smokingHabit}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Compass className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                  <span className="text-tdc-charcoal/60 w-28">Drinking Habit:</span>
                  <span className="font-medium text-tdc-charcoal">{client.drinkingHabit}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-tdc-sage-dark border-b border-tdc-cream-dark pb-2 mb-3">Lifestyles Preferences</h4>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                  <span className="text-tdc-charcoal/60 w-32">Want Kids:</span>
                  <span className="font-semibold text-tdc-charcoal">{client.wantKids}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                  <span className="text-tdc-charcoal/60 w-32">Open to Relocate:</span>
                  <span className="font-semibold text-tdc-charcoal">{client.openToRelocate}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Heart className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                  <span className="text-tdc-charcoal/60 w-32">Open to Pets:</span>
                  <span className="font-semibold text-tdc-charcoal">{client.openToPets}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <BookOpen className="h-4 w-4 text-tdc-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-tdc-charcoal/60 text-xs">Languages Known</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {client.languagesKnown?.map((lang, idx) => (
                        <span key={idx} className="bg-tdc-cream text-tdc-green-dark text-[10px] font-bold px-2 py-0.5 rounded border border-tdc-cream-dark/50">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Indian Matrimony Panel */}
        {activeTab === 'matrimony' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-tdc-sage-dark border-b border-tdc-cream-dark pb-2 mb-3">Community & Horoscope</h4>
              <div className="flex items-center gap-3 text-sm">
                <Compass className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                <span className="text-tdc-charcoal/60 w-32">Religion:</span>
                <span className="font-semibold text-tdc-charcoal">{client.religion}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Compass className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                <span className="text-tdc-charcoal/60 w-32">Caste / Sub-caste:</span>
                <span className="font-semibold text-tdc-charcoal">{client.caste} {client.subCaste ? `(${client.subCaste})` : ''}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Compass className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                <span className="text-tdc-charcoal/60 w-32">Gotra / Sect:</span>
                <span className="font-medium text-tdc-charcoal">{client.gotra || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                <span className="text-tdc-charcoal/60 w-32">Manglik Status:</span>
                <span className={`font-semibold px-2 py-0.5 rounded text-xs ${client.manglikStatus === 'Manglik'
                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  }`}>{client.manglikStatus}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                <span className="text-tdc-charcoal/60 w-32">Horoscope Time/Place:</span>
                <span className="font-medium text-tdc-charcoal">
                  {client.dobTime ? `${client.dobTime}` : ''} {client.dobPlace ? `at ${client.dobPlace}` : 'No details'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Compass className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                <span className="text-tdc-charcoal/60 w-32">Rashi / Nakshatra:</span>
                <span className="font-medium text-tdc-charcoal">
                  {client.horoscopeRashi ? `${client.horoscopeRashi}` : 'N/A'} {client.horoscopeNakshatra ? `/ ${client.horoscopeNakshatra}` : ''}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-tdc-sage-dark border-b border-tdc-cream-dark pb-2 mb-3">Family Profile</h4>
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                <span className="text-tdc-charcoal/60 w-32">Family Type:</span>
                <span className="font-semibold text-tdc-charcoal">{client.familyType}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Heart className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                <span className="text-tdc-charcoal/60 w-32">Family Values:</span>
                <span className="font-semibold text-tdc-charcoal">{client.familyValues}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-tdc-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-tdc-charcoal/60 text-xs">Father's Occupation</p>
                  <p className="font-semibold text-tdc-charcoal">{client.fatherOccupation || 'Not Listed'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-tdc-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-tdc-charcoal/60 text-xs">Mother's Occupation</p>
                  <p className="font-semibold text-tdc-charcoal">{client.motherOccupation || 'Not Listed'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Partner Preferences Panel */}
        {activeTab === 'preferences' && client.partnerPreferences && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-tdc-sage-dark border-b border-tdc-cream-dark pb-2 mb-3">Demographics & Budget</h4>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                <span className="text-tdc-charcoal/60 w-32">Age Preference:</span>
                <span className="font-semibold text-tdc-charcoal">{client.partnerPreferences.minAge} - {client.partnerPreferences.maxAge} years</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Compass className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                <span className="text-tdc-charcoal/60 w-32">Height Preference:</span>
                <span className="font-semibold text-tdc-charcoal">{client.partnerPreferences.minHeight} - {client.partnerPreferences.maxHeight} cm</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                <span className="text-tdc-charcoal/60 w-32">Min Income:</span>
                <span className="font-semibold text-tdc-green">&#8377; {Number(client.partnerPreferences.minIncome).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-tdc-sage-dark border-b border-tdc-cream-dark pb-2 mb-3">Community & Beliefs</h4>
              <div className="flex items-center gap-3 text-sm">
                <Compass className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                <span className="text-tdc-charcoal/60 w-32">Preferred Religion:</span>
                <span className="font-semibold text-tdc-charcoal">{client.partnerPreferences.preferredReligion || 'Any Religion'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-tdc-gold flex-shrink-0" />
                <span className="text-tdc-charcoal/60 w-32">Religion Flexible:</span>
                <span className={`font-semibold px-2 py-0.5 rounded text-xs ${client.partnerPreferences.religionFlexible === 'Yes'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>{client.partnerPreferences.religionFlexible}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfileDetail;
