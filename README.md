# The Date Crew (TDC) - Matchmaker Co-Pilot & Dashboard MVP

Welcome to the internal dashboard and matchmaking co-pilot MVP for **The Date Crew (TDC)**. This internal tool helps matchmakers manage client lifecycles, perform gender-specific profile matching with dynamic weight customization, obtain AI compatibility insights, analyze timeline interaction sentiment, and draft intro pitch emails.

Built as a high-fidelity full-stack application with a **Node.js/Express backend**, a **MongoDB Atlas database**, and a **React/Vite/Tailwind CSS frontend**.

---

## 🌟 Key & Standout Features

1. **AI-Driven Dynamic Match Weight Suggestions**:
   - Instead of static or arbitrary parameters, the matchmaker can trigger the **AI Matchmaker Co-Pilot** to read a client's biographical statement and profile details. The AI automatically parses their values and expectations and initializes matching weights on the sliders.
2. **Horizontal Client Journey Kanban Board**:
   - A drag-and-drop workflow tracker mapping clients through stages: `Lead`, `Onboarding`, `Searching`, `Matched`, and `Inactive`.
   - Hovering over column headers displays a structured tooltip explanation of that stage.
3. **Call & Meeting Timeline with AI Sentiment Analysis**:
   - Matchmakers type in manual feedback and call notes. When logged, the AI scans the text to extract the overall sentiment (`Positive 😊`, `Neutral 😐`, or `Negative 😞`) and flags specific topics raised (like `Location`, `Diet`, `Age Gap`, or `Relocation`).
4. **Rich Indian Matrimonial Fields**:
   - Extra deep parameters critical to Indian matchmaking, including gotra, rashi, nakshatra, manglik status, diet choices, family values (traditional, moderate, liberal), and parent occupations.
5. **Smart Dual-Client AI Adaptability & Local Fallback**:
   - Automatically supports **Google Gemini API** or **OpenAI API** depending on which key is entered in the `.env` file.
   - Includes a full, rule-based matching and reasoning engine that acts as a local fallback if no API keys are supplied, ensuring the application works perfectly out-of-the-box.

---

## ⚙️ Tech Stack & Architecture

- **Frontend**: React (Vite), Tailwind CSS, Lucide React (Icons), React Router (Navigation), standard Fetch API with silent access token refresh interceptor.
- **Backend**: Node.js, Express, Mongoose (MongoDB ODM), JWT (`jsonwebtoken` + Access/Refresh token rotation), `bcryptjs` (secure password hashing).
- **Database**: MongoDB Atlas.

---

## 🧮 Matching Algorithm Logic

Matching computations are performed on the server and sorted in descending order:
- **Male Clients**: Filtered against females. Bonus points awarded for candidate profiles that are younger (ideal gap: 1-5 years younger), shorter (ideal gap: 5-15 cm shorter), and share the same children preferences.
- **Female Clients**: Filtered against males. Scored on professional/earning parity, relocation willingness, values alignment (kids, pets), and shared spoken languages.
- **Sagotra Warning**: For Hindu clients, matching profiles with the exact same Gotra triggers a penalty check, discouraging Sagotra unions in traditional matches.
- **Diet Matches**: Pure Veg or Jain clients matched with Non-Veg profiles trigger strict compatibility warnings and score penalties.
- **Dynamic Weights**: Sub-scores are aggregated into a final matching percentage dynamically using weight multipliers (`1` to `10`) tuned on the matchmaker's sliders.

---

## 🚀 Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- A MongoDB Atlas Database cluster

### 2. Configure Environment Variables
Create or edit the `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=tdc_jwt_access_secret_key_987654321_luxury
JWT_REFRESH_SECRET=tdc_jwt_refresh_secret_key_123456789_luxury

# Optional (Put one or both to activate live AI generation)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. Install All Dependencies
From the workspace root directory, run:
```bash
npm run install-all
```
*This command will install modules for the root, backend, and frontend folders concurrently.*

### 4. Seed the Database
Seed the database with the default matchmaker account and 110 diverse client profiles (55 males, 55 females):
```bash
npm run seed
```

### 5. Launch Local Dev Servers
Start both the Express backend server (port 5000) and the React Vite dev server (port 3000) together:
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔑 Test Credentials

Use these credentials to sign in and review the application:
- **Username**: `matchmaker1`
- **Password**: `password123`
