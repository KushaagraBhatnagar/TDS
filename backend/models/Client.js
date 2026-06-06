import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  sentiment: {
    type: String,
    enum: ['Positive', 'Neutral', 'Negative'],
    default: 'Neutral'
  },
  concerns: [
    {
      type: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const clientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  height: {
    type: Number, // Height in cm
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  college: {
    type: String,
    required: true,
    trim: true
  },
  degree: {
    type: String,
    required: true,
    trim: true
  },
  income: {
    type: Number, // Annual income (e.g. in INR or USD)
    required: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  maritalStatus: {
    type: String,
    enum: ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'],
    required: true
  },
  languagesKnown: [
    {
      type: String
    }
  ],
  siblings: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    default: ''
  },
  journeyStage: {
    type: String,
    enum: ['Lead', 'Onboarding', 'Searching', 'Matched', 'Inactive'],
    default: 'Lead'
  },
  assignedMatchmaker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Matchmaker',
    required: true
  },
  matchesSent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    }
  ],
  notes: [noteSchema],
  customWeights: {
    age: { type: Number, default: 5 },
    location: { type: Number, default: 5 },
    income: { type: Number, default: 5 },
    diet: { type: Number, default: 5 },
    values: { type: Number, default: 5 },
    education: { type: Number, default: 5 },
    religion: { type: Number, default: 5 }
  },
  partnerPreferences: {
    minAge: { type: Number, default: 21 },
    maxAge: { type: Number, default: 45 },
    minHeight: { type: Number, default: 140 },
    maxHeight: { type: Number, default: 210 },
    minIncome: { type: Number, default: 0 },
    religionFlexible: { type: String, enum: ['Yes', 'No', 'Maybe'], default: 'Yes' },
    preferredReligion: { type: String, default: '' }
  },
  // Indian Matchmaking Fields
  religion: {
    type: String,
    required: true,
    trim: true
  },
  caste: {
    type: String,
    required: true,
    trim: true
  },
  subCaste: {
    type: String,
    default: '',
    trim: true
  },
  gotra: {
    type: String,
    default: '',
    trim: true
  },
  manglikStatus: {
    type: String,
    enum: ['Manglik', 'Non-Manglik', 'Partial-Manglik', 'Anshik-Manglik', 'Unknown'],
    default: 'Non-Manglik'
  },
  horoscopeNakshatra: {
    type: String,
    default: '',
    trim: true
  },
  horoscopeRashi: {
    type: String,
    default: '',
    trim: true
  },
  dobTime: {
    type: String,
    default: '',
    trim: true
  },
  dobPlace: {
    type: String,
    default: '',
    trim: true
  },
  diet: {
    type: String,
    enum: ['Veg', 'Pure Veg', 'Jain', 'Eggitarian', 'Non-Veg'],
    required: true
  },
  smokingHabit: {
    type: String,
    enum: ['Yes', 'No', 'Occasionally'],
    default: 'No'
  },
  drinkingHabit: {
    type: String,
    enum: ['Yes', 'No', 'Occasionally'],
    default: 'No'
  },
  familyType: {
    type: String,
    enum: ['Nuclear', 'Joint', 'Other'],
    default: 'Nuclear'
  },
  familyValues: {
    type: String,
    enum: ['Traditional', 'Moderate', 'Liberal'],
    default: 'Moderate'
  },
  fatherOccupation: {
    type: String,
    default: '',
    trim: true
  },
  motherOccupation: {
    type: String,
    default: '',
    trim: true
  },
  wantKids: {
    type: String,
    enum: ['Yes', 'No', 'Maybe'],
    default: 'Maybe'
  },
  openToRelocate: {
    type: String,
    enum: ['Yes', 'No', 'Maybe'],
    default: 'Maybe'
  },
  openToPets: {
    type: String,
    enum: ['Yes', 'No', 'Maybe'],
    default: 'Maybe'
  }
}, {
  timestamps: true
});

const Client = mongoose.model('Client', clientSchema);
export default Client;
