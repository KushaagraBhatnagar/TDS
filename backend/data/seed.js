import mongoose from 'mongoose';
import dns from 'dns';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Matchmaker from '../models/Matchmaker.js';
import Client from '../models/Client.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: '../.env' }); // load from parent directory .env

const MALE_FIRST_NAMES = [
  'Aarav', 'Rahul', 'Arjun', 'Kabir', 'Vivaan', 'Ishan', 'Vihaan', 'Rohan', 'Aditya', 'Dev',
  'Sai', 'Kshitij', 'Anay', 'Reyansh', 'Samar', 'Ahaan', 'Siddharth', 'Yash', 'Amit', 'Priyansh',
  'Pranav', 'Nikhil', 'Ritvik', 'Varun', 'Rohit', 'Manish', 'Karan', 'Abhishek', 'Ayush', 'Rudra',
  'Dhruv', 'Kunwar', 'Rishi', 'Madhav', 'Gaurav', 'Vikram', 'Aniket', 'Ishwar', 'Sanjay', 'Sameer',
  'Harsh', 'Tushar', 'Akash', 'Shreyas', 'Alok', 'Prateek', 'Vivek', 'Utkarsh', 'Mayank', 'Chirag'
];

const FEMALE_FIRST_NAMES = [
  'Anya', 'Isha', 'Ananya', 'Diya', 'Kiara', 'Myra', 'Navya', 'Riya', 'Saisha', 'Samaira',
  'Siya', 'Tara', 'Vanya', 'Shruti', 'Pooja', 'Sneha', 'Aditi', 'Kavya', 'Meera', 'Priya',
  'Tanvi', 'Ritu', 'Neha', 'Aisha', 'Riddhi', 'Siddhi', 'Kriti', 'Divya', 'Sanya', 'Ishita',
  'Kareena', 'Preity', 'Alia', 'Deepika', 'Priyanka', 'Katrina', 'Anushka', 'Sonam', 'Janhvi', 'Sara',
  'Radhika', 'Nisha', 'Shreya', 'Anjali', 'Komal', 'Sheetal', 'Jyoti', 'Poonam', 'Swati', 'Preeti'
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Gupta', 'Mehta', 'Iyer', 'Joshi', 'Nair', 'Reddy', 'Rao', 'Verma',
  'Mishra', 'Singh', 'Kapoor', 'Malhotra', 'Sen', 'Banerjee', 'Chatterjee', 'Trivedi', 'Bhatia', 'Khanna',
  'Choudhury', 'Dubey', 'Pandey', 'Saxena', 'Deshmukh', 'Kulkarni', 'Bose', 'Mukherjee', 'Pillai', 'Shetty'
];

const CITIES = [
  { name: 'Mumbai', country: 'India' },
  { name: 'Delhi', country: 'India' },
  { name: 'Bengaluru', country: 'India' },
  { name: 'Hyderabad', country: 'India' },
  { name: 'Pune', country: 'India' },
  { name: 'Chennai', country: 'India' },
  { name: 'Kolkata', country: 'India' },
  { name: 'Ahmedabad', country: 'India' },
  { name: 'Jaipur', country: 'India' },
  { name: 'Lucknow', country: 'India' }
];

const CAREERS = [
  { designation: 'Software Engineer', company: 'Google', college: 'IIT Bombay', degree: 'B.Tech Computer Science' },
  { designation: 'Product Manager', company: 'Microsoft', college: 'BITS Pilani', degree: 'B.E. Electrical' },
  { designation: 'Investment Banker', company: 'Goldman Sachs', college: 'IIM Ahmedabad', degree: 'MBA Finance' },
  { designation: 'Management Consultant', company: 'McKinsey & Company', college: 'IIM Bangalore', degree: 'MBA General' },
  { designation: 'UX Designer', company: 'Zomato', college: 'NID Ahmedabad', degree: 'B.Des Interaction Design' },
  { designation: 'Data Scientist', company: 'Amazon', college: 'IIT Delhi', degree: 'M.Tech Data Science' },
  { designation: 'Marketing Manager', company: 'Unilever', college: 'FMS Delhi', degree: 'MBA Marketing' },
  { designation: 'Founder', company: 'Stealth Startup', college: 'IIT Madras', degree: 'B.Tech Mechanical' },
  { designation: 'HR Director', company: 'Deloitte', college: 'XLRI Jamshedpur', degree: 'MBA Human Resources' },
  { designation: 'Design Architect', company: 'Sanjay Puri Architects', college: 'SPA Delhi', degree: 'B.Arch' }
];

const RELIGIONS = [
  { name: 'Hindu', castes: ['Brahmin', 'Kshatriya', 'Vaishya', 'Kayastha', 'Khatri', 'Maratha'] },
  { name: 'Sikh', castes: ['Jat', 'Khatri', 'Ramgarhia', 'Arora'] },
  { name: 'Jain', castes: ['Oswal', 'Agarwal', 'Khandelwal'] },
  { name: 'Christian', castes: ['Roman Catholic', 'Protestant', 'Syrian Christian'] },
  { name: 'Muslim', castes: ['Sunni', 'Shia', 'Sayyid'] }
];

const GOTRAS = ['Kashyap', 'Bharadwaj', 'Vashishta', 'Sandilya', 'Gautam', 'Atsa', 'Garg', 'Parashar', 'Atri', 'Angiras'];
const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha'];
const RASHIS = ['Aries (Mesh)', 'Taurus (Vrishabha)', 'Gemini (Mithuna)', 'Cancer (Karka)', 'Leo (Simha)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrishchika)', 'Sagittarius (Dhanu)', 'Capricorn (Makara)', 'Aquarius (Kumbha)', 'Pisces (Meena)'];

const BIOS_MALE = [
  'Tech professional who loves coding by day and cooking gourmet meals by night. Looking for a partner who shares a zest for life, travel, and deep conversations. Values family values.',
  'Ambitious investment banker based in Mumbai. I enjoy playing tennis and reading history. Looking for an independent, educated partner who is family-oriented and has a positive outlook.',
  'Creative designer who loves arts, indie music, and exploring city cafes. Looking for an open-minded partner with whom I can build a warm home filled with laughter and pets.',
  'Fitness enthusiast and software engineer. I value honesty and a simple lifestyle. Looking for a vegetarian partner who is compassionate, loves yoga, and believes in traditional family values.',
  'Entrepreneur who enjoys traveling, scaling businesses, and weekend trekking. Seeking a supportive and intellectual partner with strong career ambitions and modern yet moderate values.'
];

const BIOS_FEMALE = [
  'Passionate software developer who loves photography and road trips. Looking for an understanding partner who is career-focused, respects family traditions, and enjoys weekend hikes.',
  'Marketing consultant who loves reading, classical music, and visiting museums. Looking for an educated, progressive partner who is supportive of my career and values shared growth.',
  'UX designer who loves painting, pottery, and visiting pet cafes. Seeking a kind-hearted, independent partner with whom I can share travel stories and a life of mutual respect.',
  'Research scientist who believes in simple living and high thinking. Looking for a pure vegetarian partner with moderate values, solid credentials, and a good sense of humor.',
  'HR professional who is bubbly, loves cinema, and enjoys cooking for friends. Seeking a warm, family-oriented partner who values mutual respect, communication, and small moments in life.'
];

const STAGES = ['Lead', 'Onboarding', 'Searching', 'Matched', 'Inactive'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateClient(gender, idx, matchmakerId) {
  const isMale = gender === 'male';
  const firstName = isMale ? MALE_FIRST_NAMES[idx % MALE_FIRST_NAMES.length] : FEMALE_FIRST_NAMES[idx % FEMALE_FIRST_NAMES.length];
  // Add variation to name if index exceeds array length
  const finalFirstName = idx >= 50 ? `${firstName} II` : firstName;
  const lastName = getRandomItem(LAST_NAMES);
  const email = `${finalFirstName.toLowerCase().replace(/[^a-z]/g, '')}.${lastName.toLowerCase()}@example.com`;
  
  const age = getRandomInt(24, 34);
  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - age);
  dob.setMonth(getRandomInt(0, 11));
  dob.setDate(getRandomInt(1, 28));

  const cityObj = getRandomItem(CITIES);
  const careerObj = getRandomItem(CAREERS);
  const relObj = getRandomItem(RELIGIONS);
  const caste = getRandomItem(relObj.castes);

  // Height: Male 165 - 190 cm, Female 150 - 175 cm
  const height = isMale ? getRandomInt(165, 190) : getRandomInt(150, 175);
  
  // Income in LPA (Lakhs Per Annum)
  const income = getRandomInt(6, 45) * 100000;

  // Diet
  const diet = getRandomItem(['Veg', 'Pure Veg', 'Jain', 'Eggitarian', 'Non-Veg']);
  
  // Custom weights setup (randomized slightly around baseline 5)
  const customWeights = {
    age: getRandomInt(3, 8),
    location: getRandomInt(4, 9),
    income: getRandomInt(3, 8),
    diet: getRandomInt(3, 9),
    values: getRandomInt(4, 9),
    education: getRandomInt(4, 8),
    religion: getRandomInt(3, 9)
  };

  const bio = isMale ? BIOS_MALE[idx % BIOS_MALE.length] : BIOS_FEMALE[idx % BIOS_FEMALE.length];

  // Notes seeding (add 1-2 notes for some clients)
  const notes = [];
  if (idx % 3 === 0) {
    notes.push({
      text: 'Had an onboarding call. Client is excited about finding a partner who shares their enthusiasm for career and traveling.',
      sentiment: 'Positive',
      concerns: [],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });
  }
  if (idx % 5 === 0) {
    notes.push({
      text: 'Client mentioned they are strictly looking for someone located in Mumbai. Tense about relocating.',
      sentiment: 'Negative',
      concerns: ['Location', 'Relocation'],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });
  }

  return {
    firstName: finalFirstName,
    lastName,
    gender,
    dob,
    country: cityObj.country,
    city: cityObj.name,
    height,
    email,
    phone: `+91 ${getRandomInt(70000, 99999)} ${getRandomInt(10000, 99999)}`,
    college: careerObj.college,
    degree: careerObj.degree,
    income,
    company: careerObj.company,
    designation: careerObj.designation,
    maritalStatus: getRandomItem(['Never Married', 'Never Married', 'Never Married', 'Divorced']), // mostly Never Married
    languagesKnown: isMale ? ['English', 'Hindi', 'Marathi'] : ['English', 'Hindi', 'Gujarati'],
    siblings: getRandomInt(0, 3),
    bio,
    journeyStage: getRandomItem(STAGES),
    assignedMatchmaker: matchmakerId,
    notes,
    customWeights,
    // Indian Matchmaking
    religion: relObj.name,
    caste,
    subCaste: `${caste} Sect`,
    gotra: relObj.name === 'Hindu' ? getRandomItem(GOTRAS) : 'N/A',
    manglikStatus: getRandomItem(['Manglik', 'Non-Manglik', 'Non-Manglik', 'Non-Manglik', 'Partial-Manglik']),
    horoscopeNakshatra: getRandomItem(NAKSHATRAS),
    horoscopeRashi: getRandomItem(RASHIS),
    dobTime: `${getRandomInt(0, 23).toString().padStart(2, '0')}:${getRandomInt(0, 59).toString().padStart(2, '0')}`,
    dobPlace: cityObj.name,
    diet,
    smokingHabit: getRandomItem(['No', 'No', 'Occasionally']),
    drinkingHabit: getRandomItem(['No', 'No', 'Occasionally', 'Yes']),
    familyType: getRandomItem(['Nuclear', 'Joint', 'Nuclear']),
    familyValues: getRandomItem(['Traditional', 'Moderate', 'Moderate', 'Liberal']),
    fatherOccupation: getRandomItem(['Business Owner', 'Retired Officer', 'Doctor', 'Engineer', 'Banker']),
    motherOccupation: getRandomItem(['Homemaker', 'Homemaker', 'Teacher', 'Doctor', 'Artist']),
    wantKids: getRandomItem(['Yes', 'Yes', 'Maybe', 'No']),
    openToRelocate: getRandomItem(['Yes', 'Maybe', 'No']),
    openToPets: getRandomItem(['Yes', 'Maybe', 'No']),
    partnerPreferences: {
      minAge: isMale ? Math.max(21, age - 5) : Math.max(21, age - 1),
      maxAge: isMale ? Math.max(21, age + 1) : Math.max(21, age + 5),
      minHeight: isMale ? 150 : height + 2,
      maxHeight: isMale ? height - 2 : 195,
      minIncome: isMale ? getRandomItem([0, 300000]) : Math.max(0, income - 300000),
      religionFlexible: getRandomItem(['Yes', 'Maybe', 'No']),
      preferredReligion: getRandomItem(['', relObj.name])
    }
  };
}

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is missing from the environment variables!');
    process.exit(1);
  }

  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Database connected successfully!');

    // Clear existing data
    await Matchmaker.deleteMany({});
    await Client.deleteMany({});
    console.log('Existing Matchmakers and Clients cleared!');

    // Create a default matchmaker
    const defaultMatchmaker = new Matchmaker({
      username: 'matchmaker1',
      email: 'admin@thedatecrew.com',
      password: 'password123' // Will be hashed automatically by pre-save middleware
    });
    await defaultMatchmaker.save();
    console.log(`Default Matchmaker created: username "matchmaker1", password "password123"`);

    // Generate 50 Males and 50 Females (Total 100+ profiles)
    const clientsData = [];
    
    // Seeding 55 Males
    for (let i = 0; i < 55; i++) {
      clientsData.push(generateClient('male', i, defaultMatchmaker._id));
    }

    // Seeding 55 Females
    for (let i = 0; i < 55; i++) {
      clientsData.push(generateClient('female', i, defaultMatchmaker._id));
    }

    console.log(`Generating and inserting ${clientsData.length} client profiles...`);
    await Client.insertMany(clientsData);
    console.log('Client profiles seeded successfully!');

    mongoose.disconnect();
    console.log('Database disconnected. Seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
}

seed();
