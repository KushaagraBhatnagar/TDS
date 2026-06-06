import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';

// Load Environment variables depending on CWD context
if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
} else if (fs.existsSync('../.env')) {
  dotenv.config({ path: '../.env' });
} else {
  dotenv.config();
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY not found in environment variables");
}

const groq = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

// Parse JSON response from LLM
function cleanAndParseJSON(text, fallback) {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/, '');
    }
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Failed to parse JSON from AI response:', text, error);
    return fallback;
  }
}

// Query LLM api
async function callLLM(prompt, systemInstruction = '', jsonResponse = true) {
  try {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      response_format: jsonResponse ? { type: "json_object" } : undefined,
      messages,
      temperature: 0.2,
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error('Groq API execution error:', err);
    return null;
  }
}

// Match weight analyzer from bio and notes
export async function extractWeightsFromBio(bio, clientDetails) {
  const fallbackWeights = { age: 5, location: 5, income: 5, diet: 5, values: 5, education: 5, religion: 5 };

  // Format notes array into a clean string for the LLM
  const formattedNotes = clientDetails.notes && Array.isArray(clientDetails.notes) && clientDetails.notes.length > 0
    ? clientDetails.notes.map(n => `- ${n.text}`).join('\n  ')
    : 'None';

  const systemInstruction = 'You are a professional matchmaker AI. Your task is to analyze a client\'s bio, profile details, and matchmaker interaction logs/notes to extract their matching importance weights on a scale from 1 (lowest importance) to 10 (highest importance) for matching criteria. Output your analysis strictly in JSON format.';
  const prompt = `
  Analyze this client's profile details, biography, and interaction notes. Based on their preferences, values, career focus, religious references, lifestyle statements, or direct feedback logged in their notes, allocate weights from 1 to 10 for how important these criteria are to them for finding a partner:
  - age
  - location
  - income
  - diet
  - values (family values/liberalism)
  - education
  - religion

  CRITICAL GUIDELINES FOR NOTES INTERPRETATION:
  - Read the interaction notes carefully for direct preferences or signs of flexibility.
  - If notes indicate they are very strict or focused on a topic (e.g., "over-focused on religion" or "insists on matching caste"), INCREASE the weight for that category (e.g., religion weight -> 8-10).
  - If notes indicate flexibility (e.g., "open to relocate" or "fine with any income bracket"), DECREASE the weight for that category because it is less of a strict constraint (e.g., location weight -> 2-4).

  Client Info:
  - Bio: "${bio}"
  - Education: ${clientDetails.degree} from ${clientDetails.college}
  - Income: ${clientDetails.income}
  - Religion: ${clientDetails.religion}
  - Diet: ${clientDetails.diet}
  - Family Values: ${clientDetails.familyValues}
  - Interaction Notes:
  ${formattedNotes}

  Return a JSON object exactly with this format:
  {
    "age": 5,
    "location": 6,
    "income": 4,
    "diet": 7,
    "values": 5,
    "education": 8,
    "religion": 5
  }
  `;

  const responseText = await callLLM(prompt, systemInstruction, true);
  if (responseText) {
    return cleanAndParseJSON(responseText, fallbackWeights);
  }

  // Fallback to keyword scoring
  console.log('Using local rules for bio weights...');
  const weights = { ...fallbackWeights };
  const bioLower = bio.toLowerCase();

  if (bioLower.includes('career') || bioLower.includes('ambitious') || bioLower.includes('settled') || bioLower.includes('well off') || bioLower.includes('income')) {
    weights.income = 8;
    weights.education = 8;
  }
  if (bioLower.includes('traditional') || bioLower.includes('family values') || bioLower.includes('gotra') || bioLower.includes('horoscope') || bioLower.includes('kundali')) {
    weights.religion = 8;
    weights.values = 9;
  }
  if (bioLower.includes('veg') || bioLower.includes('vegetarian') || bioLower.includes('jain') || bioLower.includes('food')) {
    weights.diet = 9;
  }
  if (bioLower.includes('relocate') || bioLower.includes('city') || bioLower.includes('local') || bioLower.includes('mumbai') || bioLower.includes('delhi')) {
    weights.location = 8;
  }
  if (bioLower.includes('age') || bioLower.includes('mature') || bioLower.includes('young')) {
    weights.age = 7;
  }

  return weights;
}

// Scan meeting notes for user concerns
export async function analyzeNoteSentiment(text) {
  const fallback = { concerns: [] };
  const systemInstruction = 'You are an AI note analyzer. Evaluate matchmaker notes to identify specific client concerns mentioned.';
  const prompt = `
  Analyze this matchmaker interaction note.
  Note text: "${text}"

  Identify primary concerns from the text. The concern categories are: "Location", "Age Gap", "Diet", "Horoscope", "Income", "Marital Status", "Family", "Pets", "Relocation", "Communication", "Religion".
  If no concerns are raised, return an empty array.

  FEW-SHOT EXAMPLES FOR GUIDANCE:
  - Note: "The client wants a Jain family."
    Concerns: ["Religion", "Family"]  (Explanation: "Jain" is a religion, and "family" points to family values/concerns.)
  - Note: "It is looking for income over 5 lakhs per month."
    Concerns: ["Income"]
  - Note: "Must run Kundali/Horoscope verification before anything else."
    Concerns: ["Horoscope"]
  - Note: "Open to relocate but wants a local in Mumbai if possible."
    Concerns: ["Relocation", "Location"]
  - Note: "Disappointed that the last candidate was not pure vegetarian."
    Concerns: ["Diet"]

  Return a JSON object exactly like this:
  {
    "concerns": ["Location", "Diet"]
  }
  `;

  const responseText = await callLLM(prompt, systemInstruction, true);
  if (responseText) {
    const parsed = cleanAndParseJSON(responseText, fallback);
    return {
      concerns: parsed.concerns || []
    };
  }

  // Fallback keyword scanning
  console.log('Using local rules for note concerns...');
  const textLower = text.toLowerCase();
  const concerns = [];

  // Concern categories
  if (textLower.includes('location') || textLower.includes('city') || textLower.includes('distance') || textLower.includes('far')) concerns.push('Location');
  if (textLower.includes('age') || textLower.includes('young') || textLower.includes('old')) concerns.push('Age Gap');
  if (textLower.includes('diet') || textLower.includes('veg') || textLower.includes('food')) concerns.push('Diet');
  if (textLower.includes('horoscope') || textLower.includes('kundali') || textLower.includes('manglik')) concerns.push('Horoscope');
  if (textLower.includes('money') || textLower.includes('income') || textLower.includes('salary') || textLower.includes('earn') || textLower.includes('lakh')) concerns.push('Income');
  if (textLower.includes('divorced') || textLower.includes('marital') || textLower.includes('married')) concerns.push('Marital Status');
  if (textLower.includes('family') || textLower.includes('parents') || textLower.includes('siblings')) concerns.push('Family');
  if (textLower.includes('pet') || textLower.includes('dog') || textLower.includes('cat')) concerns.push('Pets');
  if (textLower.includes('relocate') || textLower.includes('move')) concerns.push('Relocation');
  if (textLower.includes('religion') || textLower.includes('caste') || textLower.includes('jain') || textLower.includes('hindu') || textLower.includes('muslim') || textLower.includes('sikh')) concerns.push('Religion');

  return { concerns };
}

// Override dynamic scores with strict partner preference rules
function applyPreferenceRules(result, clientA, clientB) {
  // If partnerPreferences doesn't exist, use default fallback values
  const prefs = clientA.partnerPreferences || {
    minAge: 21,
    maxAge: 45,
    minHeight: 140,
    maxHeight: 210,
    minIncome: 0,
    religionFlexible: 'Yes',
    preferredReligion: ''
  };

  let totalScoreModifier = 0;
  const keyPoints = [];

  // 1. Age Preference Comparison
  const ageB = new Date().getFullYear() - new Date(clientB.dob).getFullYear();
  let ageStatus = 'good';
  let ageDetails = '';
  
  if (ageB >= prefs.minAge && ageB <= prefs.maxAge) {
    totalScoreModifier += 10;
    ageStatus = 'good';
    ageDetails = `Client B's age (${ageB} years) is perfectly within Client A's preferred range of ${prefs.minAge}-${prefs.maxAge} years.`;
  } else {
    const diff = ageB < prefs.minAge ? (prefs.minAge - ageB) : (ageB - prefs.maxAge);
    if (diff <= 2) {
      totalScoreModifier -= 5;
      ageStatus = 'warning';
      ageDetails = `Client B's age (${ageB} years) is slightly outside the preferred range of ${prefs.minAge}-${prefs.maxAge} years.`;
    } else if (diff <= 5) {
      totalScoreModifier -= 15;
      ageStatus = 'warning';
      ageDetails = `Client B's age (${ageB} years) is outside the preferred range of ${prefs.minAge}-${prefs.maxAge} years.`;
    } else {
      totalScoreModifier -= 30;
      ageStatus = 'bad';
      ageDetails = `Significant age discrepancy: Client B's age (${ageB} years) is far from the preferred range of ${prefs.minAge}-${prefs.maxAge} years.`;
    }
  }
  keyPoints.push({ label: 'Age Preference Fit', status: ageStatus, details: ageDetails });

  // 2. Height Preference Comparison
  let heightStatus = 'good';
  let heightDetails = '';

  if (clientB.height >= prefs.minHeight && clientB.height <= prefs.maxHeight) {
    heightStatus = 'good';
    heightDetails = `Client B's height (${clientB.height} cm) is within Client A's preferred range of ${prefs.minHeight}-${prefs.maxHeight} cm.`;
  } else {
    const diff = clientB.height < prefs.minHeight ? (prefs.minHeight - clientB.height) : (clientB.height - prefs.maxHeight);
    if (diff <= 5) {
      totalScoreModifier -= 5;
      heightStatus = 'warning';
      heightDetails = `Client B's height (${clientB.height} cm) is slightly outside the preferred range of ${prefs.minHeight}-${prefs.maxHeight} cm.`;
    } else if (diff <= 10) {
      totalScoreModifier -= 15;
      heightStatus = 'warning';
      heightDetails = `Client B's height (${clientB.height} cm) is outside the preferred range of ${prefs.minHeight}-${prefs.maxHeight} cm.`;
    } else {
      totalScoreModifier -= 30;
      heightStatus = 'bad';
      heightDetails = `Significant height discrepancy: Client B's height (${clientB.height} cm) is far from the preferred range of ${prefs.minHeight}-${prefs.maxHeight} cm.`;
    }
  }
  keyPoints.push({ label: 'Height Preference Fit', status: heightStatus, details: heightDetails });

  // 3. Income Preference Comparison
  let incomeStatus = 'good';
  let incomeDetails = '';
  
  if (clientB.income >= prefs.minIncome) {
    incomeStatus = 'good';
    incomeDetails = `Client B's income (\u20B9${Number(clientB.income).toLocaleString('en-IN')}) meets Client A's minimum expectation of \u20B9${Number(prefs.minIncome).toLocaleString('en-IN')}.`;
  } else {
    const baseMin = prefs.minIncome || 1;
    const diffPercent = (prefs.minIncome - clientB.income) / baseMin;
    if (diffPercent <= 0.2) {
      totalScoreModifier -= 5;
      incomeStatus = 'warning';
      incomeDetails = `Client B's income (\u20B9${Number(clientB.income).toLocaleString('en-IN')}) is slightly below the preferred minimum of \u20B9${Number(prefs.minIncome).toLocaleString('en-IN')}.`;
    } else if (diffPercent <= 0.5) {
      totalScoreModifier -= 15;
      incomeStatus = 'warning';
      incomeDetails = `Client B's income (\u20B9${Number(clientB.income).toLocaleString('en-IN')}) is below the preferred minimum of \u20B9${Number(prefs.minIncome).toLocaleString('en-IN')}.`;
    } else {
      totalScoreModifier -= 30;
      incomeStatus = 'bad';
      incomeDetails = `Significant income discrepancy: Client B's income (\u20B9${Number(clientB.income).toLocaleString('en-IN')}) is far below the preferred minimum of \u20B9${Number(prefs.minIncome).toLocaleString('en-IN')}.`;
    }
  }
  keyPoints.push({ label: 'Income Preference Fit', status: incomeStatus, details: incomeDetails });

  // 4. Religion Preference Comparison
  let religionStatus = 'good';
  let religionDetails = '';
  
  const preferredRel = (prefs.preferredReligion || '').trim().toLowerCase();
  const candidateRel = (clientB.religion || '').trim().toLowerCase();

  if (!preferredRel || preferredRel === 'any' || prefs.religionFlexible === 'Yes' || preferredRel === candidateRel) {
    religionStatus = 'good';
    religionDetails = `Excellent religion alignment: Client B shares a compatible belief system (${clientB.religion}).`;
  } else {
    if (prefs.religionFlexible === 'Maybe') {
      totalScoreModifier -= 10;
      religionStatus = 'warning';
      religionDetails = `Religion mismatch: Client B's religion (${clientB.religion}) does not match preferred (${prefs.preferredReligion}), but Client A is flexible.`;
    } else {
      totalScoreModifier -= 30;
      religionStatus = 'bad';
      religionDetails = `Religion mismatch: Client B's religion (${clientB.religion}) does not match preferred (${prefs.preferredReligion}) and Client A is strict.`;
    }
  }
  keyPoints.push({ label: 'Religion Preference Fit', status: religionStatus, details: religionDetails });

  // Apply score modification to existing score
  result.score = Math.max(10, Math.min(98, result.score + totalScoreModifier));

  // Merge keyPoints: Keep non-preference ones from result (like diet, career) if they exist,
  // but insert preference ones at the beginning.
  if (!result.keyPoints) {
    result.keyPoints = [];
  }
  
  const otherKeyPoints = result.keyPoints.filter(kp => 
    !kp.label.toLowerCase().includes('age') &&
    !kp.label.toLowerCase().includes('height') &&
    !kp.label.toLowerCase().includes('income') &&
    !kp.label.toLowerCase().includes('religion')
  );

  result.keyPoints = [...keyPoints, ...otherKeyPoints];

  return result;
}

// Evaluate client profile compatibility
export async function analyzeCompatibility(clientA, clientB, useLocalOnly = false) {
  const fallback = {
    score: 75,
    summary: 'These clients show moderate baseline compatibility in terms of location, education, and mutual values.',
    keyPoints: [
      { label: 'Demographics', status: 'good', details: 'Ages and heights are in standard ranges.' },
      { label: 'Diet & Lifestyle', status: 'warning', details: 'Check alignment on vegetarian vs non-vegetarian preferences.' }
    ]
  };

  const systemInstruction = 'You are an expert Indian matchmaking consultant AI. You analyze compatibility between two profiles and return structural, highly detailed compatibility insights.';
  const prefs = clientA.partnerPreferences || { minAge: 21, maxAge: 45, minHeight: 140, maxHeight: 210, minIncome: 0, religionFlexible: 'Yes', preferredReligion: '' };
  
  const prompt = `
  Perform a deep matchmaking compatibility analysis between Client A and Client B.
  
  Client A (Main Client):
  - Name: ${clientA.firstName} ${clientA.lastName} (${clientA.gender})
  - Age: ${new Date().getFullYear() - new Date(clientA.dob).getFullYear()}
  - Height: ${clientA.height} cm
  - Income: ${clientA.income}
  - Location: ${clientA.city}, ${clientA.country}
  - Marital Status: ${clientA.maritalStatus}
  - Diet: ${clientA.diet}
  - Religion/Caste: ${clientA.religion} / ${clientA.caste} (Gotra: ${clientA.gotra}, Manglik: ${clientA.manglikStatus})
  - Education/Career: ${clientA.degree} from ${clientA.college}, working as ${clientA.designation} at ${clientA.company}
  - Family Values: ${clientA.familyValues}
  - Kids/Relocation/Pets: Kids (${clientA.wantKids}), Relocate (${clientA.openToRelocate}), Pets (${clientA.openToPets})
  - Bio: "${clientA.bio}"

  Client A Partner Preferences:
  - Age Range: ${prefs.minAge} to ${prefs.maxAge} years
  - Height Range: ${prefs.minHeight} to ${prefs.maxHeight} cm
  - Min Income: \u20B9${Number(prefs.minIncome).toLocaleString('en-IN')}
  - Religion Preference: Preferred: ${prefs.preferredReligion || 'Any'}, Flexible: ${prefs.religionFlexible}

  Client B (Candidate Match):
  - Name: ${clientB.firstName} ${clientB.lastName} (${clientB.gender})
  - Age: ${new Date().getFullYear() - new Date(clientB.dob).getFullYear()}
  - Height: ${clientB.height} cm
  - Income: ${clientB.income}
  - Location: ${clientB.city}, ${clientB.country}
  - Marital Status: ${clientB.maritalStatus}
  - Diet: ${clientB.diet}
  - Religion/Caste: ${clientB.religion} / ${clientB.caste} (Gotra: ${clientB.gotra}, Manglik: ${clientB.manglikStatus})
  - Education/Career: ${clientB.degree} from ${clientB.college}, working as ${clientB.designation} at ${clientB.company}
  - Family Values: ${clientB.familyValues}
  - Kids/Relocation/Pets: Kids (${clientB.wantKids}), Relocate (${clientB.openToRelocate}), Pets (${clientB.openToPets})
  - Bio: "${clientB.bio}"

  Evaluate details:
  1. Score: Compute a percentage compatibility score (0-100) using these rules:
     - Directly compare Client B's characteristics to Client A's Partner Preferences.
     - Age Fit: Check if Client B's age (${new Date().getFullYear() - new Date(clientB.dob).getFullYear()}) is within the preferred range [${prefs.minAge}, ${prefs.maxAge}]. If inside, give a high score. If slightly outside (within 2 years), reduce slightly. If far outside, reduce heavily.
     - Height Fit: Check if Client B's height (${clientB.height} cm) is within the preferred range [${prefs.minHeight}, ${prefs.maxHeight}]. If inside, give a high score. If slightly outside (within 5 cm), reduce slightly. If far outside, reduce heavily.
     - Income Fit: Check if Client B's income (\u20B9${Number(clientB.income).toLocaleString('en-IN')}) meets Client A's min income (\u20B9${Number(prefs.minIncome).toLocaleString('en-IN')}). If it meets, give a high score. If it's up to 20% lower, reduce slightly. If it's far lower, reduce heavily.
     - Religion Fit: Check if Client B's religion (${clientB.religion}) aligns with preferred (${prefs.preferredReligion || 'Any'}). If mismatch and Client A is not flexible, reduce heavily.
  2. Summary: A written explanation (3-4 sentences) summarizing the fit, pros, and potential obstacles.
  3. Key Points: Array of objects with labels (e.g. "Age Preference Fit", "Height Preference Fit", "Income Preference Fit", "Religion Preference Fit", "Dietary Match", "Horoscope", "Lifestyle Preferences", "Career Alignment"), status ("good", "warning", "bad"), and a short description. Make sure there are "Age Preference Fit", "Height Preference Fit", and "Income Preference Fit" key points reflecting these rules.

  Return a JSON object exactly with this format:
  {
    "score": XX,
    "summary": "text here...",
    "keyPoints": [
      { "label": "Career Compatibility", "status": "good", "details": "Both are high-earning professionals with balanced schedules." },
      { "label": "Dietary Match", "status": "warning", "details": "Client A is Veg while Client B is Non-Veg but open to Veg partners." }
    ]
  }
  `;

  if (!useLocalOnly) {
    const responseText = await callLLM(prompt, systemInstruction, true);
    if (responseText) {
      let result = cleanAndParseJSON(responseText, fallback);
      result = applyPreferenceRules(result, clientA, clientB);
      return result;
    }
  }

  // Local logic fallback
  console.log('Using local rules for compatibility...');
  let score = 70;
  const keyPoints = [];

  // Diet compatibility
  if (clientA.diet === clientB.diet) {
    score += 10;
    keyPoints.push({ label: 'Dietary Habits', status: 'good', details: `Perfect match! Both prefer a ${clientA.diet} diet.` });
  } else if (
    (clientA.diet === 'Pure Veg' || clientA.diet === 'Jain') && 
    (clientB.diet === 'Non-Veg' || clientB.diet === 'Eggitarian')
  ) {
    score -= 10;
    keyPoints.push({ label: 'Dietary Habits', status: 'bad', details: `Potential conflict: ${clientA.firstName} is ${clientA.diet} while ${clientB.firstName} is ${clientB.diet}.` });
  } else {
    score += 2;
    keyPoints.push({ label: 'Dietary Habits', status: 'warning', details: `Slight difference: ${clientA.diet} matched with ${clientB.diet}.` });
  }

  // Religion/Caste compatibility
  if (clientA.religion === clientB.religion) {
    score += 10;
    if (clientA.caste === clientB.caste) {
      score += 5;
      keyPoints.push({ label: 'Community Fit', status: 'good', details: `Both share the same religion (${clientA.religion}) and caste (${clientA.caste}).` });
    } else {
      keyPoints.push({ label: 'Community Fit', status: 'good', details: `Same religion (${clientA.religion}), with different castes (${clientA.caste} and ${clientB.caste}).` });
    }
  } else {
    score -= 10;
    keyPoints.push({ label: 'Community Fit', status: 'warning', details: `Different religious traditions: ${clientA.religion} and ${clientB.religion}.` });
  }

  // Manglik compatibility
  if (clientA.manglikStatus === clientB.manglikStatus) {
    score += 5;
    keyPoints.push({ label: 'Horoscope / Manglik', status: 'good', details: `Manglik statuses are aligned (Both are ${clientA.manglikStatus}).` });
  } else if (
    (clientA.manglikStatus === 'Manglik' && clientB.manglikStatus === 'Non-Manglik') ||
    (clientA.manglikStatus === 'Non-Manglik' && clientB.manglikStatus === 'Manglik')
  ) {
    score -= 8;
    keyPoints.push({ label: 'Horoscope / Manglik', status: 'warning', details: `Manglik vs Non-Manglik match. Traditional families may request a Kundali review.` });
  } else {
    keyPoints.push({ label: 'Horoscope / Manglik', status: 'good', details: 'Partial alignment in horoscope compatibility.' });
  }

  // Location compatibility
  if (clientA.city.toLowerCase() === clientB.city.toLowerCase()) {
    score += 10;
    keyPoints.push({ label: 'Location Alignment', status: 'good', details: `Perfect geographical match! Both reside in ${clientA.city}.` });
  } else if (clientA.openToRelocate === 'Yes' || clientB.openToRelocate === 'Yes') {
    score += 5;
    keyPoints.push({ label: 'Location Alignment', status: 'good', details: `Living in different cities (${clientA.city} vs ${clientB.city}), but open to relocation.` });
  } else {
    score -= 10;
    keyPoints.push({ label: 'Location Alignment', status: 'bad', details: `Clients live in different cities (${clientA.city} and ${clientB.city}) and relocate preferences are strict.` });
  }

  let result = { score, keyPoints };
  result = applyPreferenceRules(result, clientA, clientB);

  let summary = `These clients have a compatibility score of ${result.score}%. `;
  if (result.score >= 85) {
    summary += `They show a high potential fit, sharing similar backgrounds in ${clientA.religion} traditions, compatible career trajectories as ${clientA.designation} and ${clientB.designation}, and aligned core family values.`;
  } else if (result.score >= 70) {
    summary += `They show a strong matching baseline. However, some minor adjustments might be needed regarding their preferences on ${clientA.diet !== clientB.diet ? 'dietary patterns' : 'city locations'}.`;
  } else {
    summary += `They have a lower match score due to fundamental differences in values, lifestyles, or locations. Recommend exploring alternative candidates unless specific criteria are waived by both parties.`;
  }
  result.summary = summary;

  return result;
}

// Generate introduction email
export async function generateEmailIntro(clientA, clientB, compatibilitySummary, matchmakerName = 'Your TDC Matchmaker') {
  const fallback = {
    subject: `Intriguing Profile Recommendation from The Date Crew: Meet ${clientB.firstName}`,
    body: `Dear ${clientA.firstName},\n\nI hope you are doing well!\n\nI am excited to share a profile with you that caught my attention today. I believe they would be a wonderful fit for you.\n\nMeet ${clientB.firstName}, a ${clientB.designation} based in ${clientB.city}. They share a ${clientB.diet} diet, are highly educated (${clientB.degree}), and value family similarly. Based on our analysis, you both have high compatibility in your expectations.\n\nPlease let me know if you would like me to arrange an initial call between you two.\n\nWarm regards,\n${matchmakerName}`
  };

  const systemInstruction = `You are a warm, persuasive, and highly professional matchmaker at The Date Crew, a luxury matchmaking service. Write a personal introduction email pitching a candidate profile to your client. The email should be signed from "${matchmakerName}". Do not use placeholders; write complete, ready-to-send copy.`;
  const prompt = `
  Write a warm, luxury-feel email from the client's matchmaker introducing Profile B (the recommended match) to Client A (the main client).
  
  The email is from the matchmaker, whose name is "${matchmakerName}". Make sure the email concludes with a warm sign-off and is signed with "${matchmakerName}" instead of using any placeholder text like "[Your Name]" or "[Matchmaker Name]".

  Client A (Recipient):
  - Name: ${clientA.firstName} ${clientA.lastName}
  - Gender: ${clientA.gender}

  Profile B (Recommended Candidate):
  - Name: ${clientB.firstName} ${clientB.lastName}
  - Age: ${new Date().getFullYear() - new Date(clientB.dob).getFullYear()}
  - City: ${clientB.city}
  - Occupation: ${clientB.designation} at ${clientB.company}
  - Education: ${clientB.degree} from ${clientB.college}
  - Diet: ${clientB.diet}
  - Key Interests/Bio: "${clientB.bio}"

  Compatibility Summary:
  - "${compatibilitySummary}"

  Ensure the email:
  - Has a compelling, elegant subject line.
  - Highlights why this profile was handpicked, referencing shared details (like career ambitions, diet alignment, or similar values).
  - Keeps a high-end, exclusive tone suitable for a luxury service like The Date Crew.
  - Concludes with a sign-off from "${matchmakerName}"
  - Returns a JSON object with keys: "subject" and "body".
  `;

  const responseText = await callLLM(prompt, systemInstruction, true);
  if (responseText) {
    const result = cleanAndParseJSON(responseText, fallback);
    if (result && result.body) {
      // Replace fallback placeholders if any
      result.body = result.body
        .replace(/\[Your Name\]/gi, matchmakerName)
        .replace(/\[Matchmaker Name\]/gi, matchmakerName)
        .replace(/\[Matchmaker's Name\]/gi, matchmakerName);
    }
    return result;
  }

  // Local fallback pitch email
  console.log('Using local rules for email pitch...');
  const ageB = new Date().getFullYear() - new Date(clientB.dob).getFullYear();
  const subject = `Exclusive Recommendation: Meet ${clientB.firstName} | The Date Crew`;
  const body = `Dear ${clientA.firstName},

I hope this email finds you well.

I am writing to share an exceptional profile that has stood out as a high-potential match for you in our circle. Meet ${clientB.firstName}, a ${ageB}-year-old ${clientB.designation} who resides in ${clientB.city}.

In reviewing both of your details, I was particularly drawn to your shared backgrounds. ${clientB.firstName} completed their ${clientB.degree} at ${clientB.college} and is a grounded individual who values ${clientB.familyValues.toLowerCase()} traditions, much like yourself. Given that you both value a ${clientA.diet.toLowerCase()} diet and share complementary views on relocating and building a home together, I feel there is an authentic foundation here.

I have attached their details below for your review. If you feel inspired to take the next step, please let me know, and I will gladly share your profile with them and coordinate a private introduction.

Warmest regards,

${matchmakerName}
The Date Crew`;

  return { subject, body };
}
