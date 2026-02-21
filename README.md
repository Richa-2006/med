MedScan 🎯
Basic Details
Team Name: HackPack
Team Members
Member 1: Akshaya Sunny V - Muthoot Institute Of TEchnology and Science
Member 2: Richa Reji - Muthoot Institute Of TEchnology and Science
Hosted Project Link
https://med-rho-seven.vercel.app/login.html

Project Description
MedSCan is a web based apllication designed to provide accurate and easy to understand information about medicines, including their uses, dosage details, and potential side effects. The platfoorm helps users make informed healthcare decisions by offering quick access to reliable medication data.

The Problem statement
Many people consume medicines without fully understanding their purpose, correct dosage, potential side effects, or safety precautions. Accessing reliable and simplified medication information can be difficult, especially for individuals without medical knowledge. This lack of awareness may lead to misuse, overdosing, harmful drug interactions, or serious health complications.
There is a need for a user-friendly digital platform that provides accurate, accessible, and easy-to-understand information about medicines to help individuals make informed and safer healthcare decisions.

The Solution
MedScan is a web-based platform developed to provide users with accurate, reliable, and easy-to-understand information about medicines. The system allows users to search for a specific medicine and instantly access details such as its purpose, recommended dosage, possible side effects, and important safety precautions. Designed with a simple and user-friendly interface, MedScan ensures that even individuals without medical knowledge can easily understand essential drug information. By centralizing and simplifying medication details in one accessible platform, the solution helps reduce medicine misuse, increase awareness, and support safer and more informed healthcare decisions.

Technical Details
Technologies/Components Used
For Software:

Languages used: HTML, CSS, JavaScript
Tools used: VS Code, Git, GitHub, Web Browser

Features
List the key features of your project:

Feature 1: Medicine Search – Quickly search for any medicine by name.
Feature 2: Detailed Medicine Information – Provides purpose, usage, and recommended dosage.
Feature 3: Side Effects Information – Lists possible side effects for safe usage.
Feature 4: Safety Precautions – Includes warnings and important precautions.

Project Documentation
For Software:
Screenshots (Add at least 3)
<img width="1882" height="983" alt="Screenshot 2026-02-21 082326" src="https://github.com/user-attachments/assets/1630e787-783a-44c4-bf04-b38018219e9c" />
The front page is a clean, modern login screen for MedScan featuring branding, email and password fields, a sign-in button, and a sign-up option.

<img width="1882" height="991" alt="Screenshot 2026-02-21 082553" src="https://github.com/user-attachments/assets/5d0c43f7-e6f9-4366-ba71-85e57cdee7d7" />
The page is MedScan’s main dashboard featuring a bold medicine search bar, FDA-verified database highlight, and options to analyze, compare, and save drugs.

<img width="1884" height="989" alt="Screenshot 2026-02-21 082524" src="https://github.com/user-attachments/assets/ce0896eb-daa2-4846-8283-a159c60acdd3" />
The page displays detailed safety information for Amlodipine Besylate, including side effects, warnings, drug interactions, and contraindications.

Diagrams
System Architecture:
medscan/
  ├── index.html       → Main app (protected, requires login)
  ├── login.html       → Login page
  ├── register.html    → Registration page
  ├── auth.js          → Firebase auth helper functions
  ├── script.js        → All app logic (search, tabs, compare, etc.)
  └── style.css        → All styling + dark mode

Architecture Diagram Explain your system architecture - components, data flow, tech stack interaction

Application Workflow:

1. User Opens App
→ Firebase silently checks if the user is already logged in.

2. Auth Gate
Logged in?
   YES → Go to main app
   NO  → Redirect to login.html
→ Nobody can reach the medicine search without an account.

3. Login / Register
New user → register.html → Firebase creates account
Returning → login.html  → Firebase verifies password
Both → land on index.html ✅
→ Passwords are hashed and stored securely by Firebase — never plain text.

4. Main App Loads
Name shown in navbar
Recent searches restored
Saved favourites count restored
→ Data comes from the browser's localStorage — no database needed for personal preferences.

5. Search a Medicine
User types name → Autocomplete shows suggestions
                         ↓
              Click "Analyze"
                         ↓
         Try FDA API (brand name)
         Try FDA API (generic name)
         Try FDA API (substance name)
                         ↓
         Found → Show results
         Not found → Show error + suggestions
→ Three attempts maximise the chance of finding the medicine regardless of what name the user types.

6. Results in 4 Tabs
Overview  → Purpose, Ingredients
Safety    → Side Effects, Warnings, Interactions
Dosage    → Instructions, Weight Calculator
Tools     → Pill Identifier, Interaction Checker
→ Medical jargon is auto-translated to plain English e.g. "myalgia" → "myalgia (muscle pain)".

7. Extra Actions
♡ Save     → stored in localStorage
⊕ Compare  → compare up to 3 medicines side by side
↗ Share    → copies a URL with the medicine name in it
→ Everything is saved locally in the browser — no server, no database, no cost.

8. Sign Out
Click Sign Out → Firebase clears session
              → Redirected to login.html
              → App is locked again
→ Next visit to index.html will redirect straight back to login.

Workflow Add caption explaining your workflow

Project Demo
Video
[Add your demo video link here - YouTube, Google Drive, etc.]

Explain what the video demonstrates - key features, user flow, technical highlights
Opening 
Show the login page loading in the browser. Briefly explain MedScan is a medicine information app that uses the FDA database. Sets context for the viewer.

Registration 
Click "Sign up free", fill in name, email and password, hit Create Account. Shows the account creation works and redirects to the main app automatically.

Auth Guard Demo
Click Sign Out, then try to visit index.html directly. Show it redirects back to login.html. Proves the app is protected and no one can bypass the login.

Login 
Log back in with the registered credentials. Shows the redirect to main app works and the user's name appears in the navbar.

Medicine Search
Type "ibuprofen" in the search bar, show autocomplete appearing, click Analyze. Walk through each of the 4 tabs — Overview, Safety, Dosage, Tools. This is the core feature so spend the most time here.

Extra Features 
Quickly demo Save, Compare two medicines side by side, and the Dosage Calculator with a sample weight. Shows the app goes beyond basic search.


AI Tools Used (Optional - For Transparency Bonus)
If you used AI tools during development, document them here for transparency:

Tool Used: Chatgpt, Claude
Purpose: [What you used it for]

Example: "Generated boilerplate React components"
Example: "Debugging assistance for async functions"
Example: "Code review and optimization suggestions"
Key Prompts Used:

"Create a REST API endpoint for user authentication"
"Debug this async function that's causing race conditions"
"Optimize this database query for better performance"
Percentage of AI-generated code: [Approximately X%]

Human Contributions:

Architecture design and planning
Custom business logic implementation
Integration and testing
UI/UX design decisions
Note: Proper documentation of AI usage demonstrates transparency and earns bonus points in evaluation!

Team Contributions
Akshaya Sunny V:  Core App & Features Handle index.html, script.js — the medicine search, FDA API, tabs, dosage calculator, pill identifier, compare, and favourite
Richa Reji: Authentication & UI Handle login.html, register.html, auth.js, style.css — everything related to user login, registration, and the overall look and feel.
