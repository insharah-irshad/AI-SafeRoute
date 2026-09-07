# AI SafeRoute

### AI-Powered Safer Route Recommendation for Women

AI SafeRoute is an AI-powered women's mobility safety platform designed to help users compare alternative routes based on **community-reported safety experiences and route-specific risk analysis**.

Instead of simply choosing the fastest route, AI SafeRoute follows a **Safety First** approach: when two routes are available, the route with the higher safety score is recommended, even if it takes longer.

> **Safety over speed. Every route tells a story.**

---

## Problem

Navigation systems traditionally optimize for factors such as distance and travel time.

For women travelling through unfamiliar or potentially unsafe areas, however, the fastest route is not always the safest route.

A road may be shorter but pass through areas where users have reported:

* Poor lighting
* Isolated surroundings
* Harassment
* Other safety concerns

AI SafeRoute addresses this gap by combining route information with community safety experiences to provide a more safety-aware route comparison.

---

## Solution

AI SafeRoute allows a user to enter an origin and destination and receive multiple possible routes.

Each route is evaluated using nearby community safety reports.

The system then:

1. Retrieves alternative routes.
2. Finds safety reports near each route.
3. Calculates a route-specific safety score.
4. Determines the associated risk level.
5. Compares the available routes.
6. Recommends the safest route.
7. Generates a human-readable explanation for the recommendation.

The system prioritizes **safety score over travel time**.

If two routes have exactly the same safety score, travel time is used only as a tie-breaker.

---

## Key Features

### Safety-First Route Comparison

Users can compare multiple routes using:

* Estimated travel time
* Distance
* Safety score
* Risk level
* Number of nearby safety reports
* Reported safety concerns

### Community Safety Reports

Users can submit experiences about locations they have travelled through.

Reports can include:

* Location
* Travel time/context
* Transport method
* Safety rating
* Description of the experience

These reports become part of the safety data used for route analysis.

### Route-Specific Risk Analysis

Safety reports are matched against the actual route path rather than treating the entire city as equally risky.

Reports closer to a route have a stronger influence on its safety score.

### AI-Powered Explanation

The system uses an AI model to transform the route analysis into a clear explanation that tells the user why a particular route was recommended.

The AI does not decide the safety winner itself. The safety-first route selection is determined by the scoring logic, while AI is used to communicate the result.

### Interactive Safety Map

The application provides a map-based view of available community safety reports and their associated risk information.

### Safety Over Speed

A slower route can still be recommended when it has a significantly better safety score.

This is a core design principle of AI SafeRoute.

---

## How It Works

```text
                    USER
                      │
                      ▼
             Enter Origin & Destination
                      │
                      ▼
              n8n Compare Workflow
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
    Geocode Locations       Community Reports
          │                       │
          ▼                       ▼
     Routing API             Safety Analysis
          │                       │
          └───────────┬───────────┘
                      ▼
             Route-Specific Scoring
                      │
                      ▼
                Safety-First
               Route Selection
                      │
                      ▼
                AI Explanation
                      │
                      ▼
                 Frontend
                      │
                      ▼
             Recommended Route
```


# System Architecture

AI SafeRoute consists of a React frontend, n8n automation workflows, a PostgreSQL-compatible database, routing services, and an AI model.

### Frontend

The frontend is built with:

* React
* Vite
* Tailwind CSS
* JavaScript

It provides the user interface for:

* Route comparison
* Safety report submission
* Safety map visualization

### Backend / Automation

The backend logic is implemented using **n8n workflows**.

n8n handles:

* Webhook requests
* Location processing
* Routing API requests
* Database queries
* Safety scoring
* AI recommendation generation
* API responses

### Database

Community safety reports are stored in a PostgreSQL-compatible database.

The database contains information such as:

* Location
* Coordinates
* Safety rating
* Travel context
* Transport method
* User description
* Risk analysis

### Routing

Alternative driving routes are generated using the OpenRouteService Directions API.

### AI

The AI layer is used to generate a natural-language explanation of the route recommendation.

The deterministic safety-scoring logic remains the authority for selecting the safest route.

---

# n8n Workflows

The backend contains four exported n8n workflows.

They are located in:

```text
Backend/
└── workflows/
    ├── W0 - Google Form Import.json
    ├── W1 - Submit Report (In-App).json
    ├── W2 - Get Map Data.json
    └── W3 - Compare Routes.json
```

## W0 — Google Form Import

Imports community safety experiences collected through a Google Form into the safety-report database.

This provides the initial community-generated safety dataset used by the application.

---

## W1 — Submit Report (In-App)

Handles safety reports submitted directly through the application.

The workflow receives the user's report and stores the relevant information for future route analysis.

---

## W2 — Get Map Data

Retrieves available safety reports and their risk information for visualization in the application's safety map.

---

## W3 — Compare Routes

This is the main route-analysis workflow.

The workflow:

```text
Receive Route Request
        ↓
Geocode Locations
        ↓
Call Routing API
        ↓
Parse Routes
        ↓
Get City Safety Stats
        ↓
Match Safety Reports to Routes
        ↓
Calculate Route Safety Scores
        ↓
Build AI Prompt
        ↓
Generate AI Explanation
        ↓
Parse AI Recommendation
        ↓
Send Response
```
---

# Safety Scoring

AI SafeRoute uses route-specific community reports to estimate the relative safety of available routes.

Each safety report is matched to a route based on geographic distance.

Reports closer to a route receive greater influence in the scoring process.

The prototype uses the following concept:

```text
Closer report
     ↓
Higher influence

Further report
     ↓
Lower influence
```

The resulting route score is normalized to a 0–100 scale.

Risk information from the associated reports is also considered when determining the route's final risk level.

The application is designed to communicate the result as a relative safety assessment based on the available community data.

---

## Safety Risk Levels

AI SafeRoute presents route risk using three simple levels:

| Risk Level   | Indicator | Meaning                                                                |
| ------------ | --------- | ---------------------------------------------------------------------- |
| **Safe**     | 🟢 Green  | Available safety data indicates relatively lower risk                  |
| **Moderate** | 🟡 Yellow | Some safety concerns have been reported in or around the route         |
| **Risky**    | 🔴 Red    | Available reports indicate a relatively higher level of safety concern |

The risk level is based on the available community safety reports and route-specific analysis.

> **Note:** A "Safe" rating does not guarantee that a route is completely safe. It represents a lower relative risk based on the available data.


# Safety-First Recommendation Logic

The recommendation system follows a strict priority order:

```text
1. Higher safety score
        ↓
2. If scores are equal → shorter travel time
```

For example:

```text
Route 1
Safety: 82/100
Time:   8 minutes

Route 2
Safety: 65/100
Time:   5 minutes
```

The system recommends **Route 1**.

The faster route does not override the higher safety score.

This makes safety the primary decision criterion rather than travel speed.

---

# AI Recommendation Layer

The AI layer receives the calculated route information and produces a natural-language explanation.

The AI is instructed to:

* Explain why the recommended route was selected.
* Mention the safety score.
* Mention nearby safety reports.
* Mention relevant reported concerns when available.
* Compare the recommended route with alternatives.
* Treat travel time as secondary information.
* Never prioritize speed over safety.
* Never invent safety data.

The route-selection logic remains deterministic so that the AI cannot override the safety-first decision.

---

# Frontend

The React application contains the following major pages:

### Compare

Allows users to enter an origin and destination and compare available routes.

The page displays:

* Recommended route
* Travel time
* Distance
* Safety score
* Risk level
* Number of supporting reports
* Nearby safety concerns
* Recommendation explanation

<img width="1348" height="601" alt="image" src="https://github.com/user-attachments/assets/cff53e07-7716-4c14-8d4d-63a351bceec9" />
<img width="1353" height="551" alt="image" src="https://github.com/user-attachments/assets/20449741-7482-43f6-9306-b7a1343f5779" />
<img width="1343" height="552" alt="image" src="https://github.com/user-attachments/assets/adde47ea-d022-4689-80de-7d2adc7584ae" />

---

### Safety Map

Displays community safety information geographically.

<img width="1353" height="605" alt="image" src="https://github.com/user-attachments/assets/d48798e6-f1d8-406b-90a0-b729aded1cb8" />


---

### Submit Report

Allows users to submit a new safety experience.
<img width="1342" height="605" alt="image" src="https://github.com/user-attachments/assets/3315eff4-4fff-404f-b3ab-e4fec5145bfb" />


---

# Demo

A demo scenario can be used to demonstrate the safety-first recommendation.

For example:

```text
Origin:      Nazimabad
Destination: Gulshan
```

The system generates alternative routes and evaluates each route against available community safety reports.

The recommended route is selected based on its safety score.


<img width="1351" height="542" alt="image" src="https://github.com/user-attachments/assets/5668761c-523f-4e15-ab45-0f077a1004d6" />
<img width="1355" height="611" alt="image" src="https://github.com/user-attachments/assets/5d9f1797-3346-44d0-b4aa-1ca5c3396eeb" />
<img width="406" height="310" alt="image" src="https://github.com/user-attachments/assets/8204cd3f-f36a-4cd9-a0e1-4019adb1beca" />


---

# Project Structure

```text
AI-SafeRoute/
│
├── Backend/
│   └── workflows/
│       ├── W0 - Google Form Import.json
│       ├── W1 - Submit Report (In-App).json
│       ├── W2 - Get Map Data.json
│       └── W3 - Compare Routes.json
│
├── Ai-model/
│
├── Dataset/
│
├── src/
│   ├── api/
│   │   └── client.js
│   ├── components/
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── Compare.jsx
│   │   ├── MapView.jsx
│   │   └── Survey.jsx
│   ├── utils/
│   │   └── risk.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

# Tech Stack

| Layer                  | Technology                           |
| ---------------------- | ------------------------------------ |
| Frontend               | React                                |
| Build Tool             | Vite                                 |
| Styling                | Tailwind CSS                         |
| Backend Automation     | n8n                                  |
| Database               | PostgreSQL-compatible database       |
| Routing                | OpenRouteService                     |
| AI                     | Google Gemini                        |
| API Communication      | REST / Webhooks                      |
| Deployment / Tunneling | ngrok for prototype backend exposure |
| Version Control        | Git & GitHub                         |

---
## Database

AI SafeRoute uses **PostgreSQL** as its relational database, hosted and managed through **Supabase**.

The database stores community-submitted safety experiences and their AI-generated risk analysis.

### Database Structure

The main tables are:

* **`reports`** — Stores submitted safety experiences, including location, safety rating, travel context, transport method, and description.
* **`report_analysis`** — Stores the analyzed risk level, reported safety issues, and time context associated with each report.

The `report_analysis` table is linked to `reports` through the report ID, allowing the application to combine community experiences with AI-based safety analysis.

### Database Exports

For reproducibility and project demonstration, database exports are included in the repository:

```text
Database/
├── reports_rows.csv
└── report_analysis_rows.csv
```

These files represent the database records used by the application during development and demonstration.

> **Note:** The live Supabase database credentials and connection secrets are not included in this repository.

# Running the Project

## 1. Clone the repository

```bash
git clone https://github.com/insharah-irshad/AI-SafeRoute.git
cd AI-SafeRoute
```

---

## 2. Install frontend dependencies

```bash
npm install
```

---

## 3. Configure the backend URL

Create a `.env` file based on `.env.example`.

```env
VITE_N8N_BASE_URL=YOUR_N8N_WEBHOOK_BASE_URL
```

The frontend uses this base URL to communicate with the n8n backend.

---

## 4. Start the frontend

```bash
npm run dev
```

Vite will provide a local development URL.

---

## 5. Import n8n workflows

Import the four workflow JSON files from:

```text
Backend/workflows/
```

into your n8n instance.

Activate the required workflows and configure the necessary credentials for:

* Database
* OpenRouteService
* Google Gemini
* Google Forms / Sheets where applicable

---

## 6. Expose the local n8n backend

For the hackathon prototype, the local n8n instance can be exposed using ngrok.

The resulting webhook base URL should be placed in `.env`.

> The ngrok URL may change whenever a new tunnel is created.

---

# API Endpoints

The frontend communicates with the n8n backend through the following endpoints:

```text
POST /report
GET  /reports
POST /compare
```

### POST /compare

Receives origin and destination information and returns route comparison results.

Example request:

```json
{
  "origin": "Nazimabad",
  "destination": "Gulshan"
}
```

The response includes route information, safety scores, risk levels, nearby reports, and the recommended route.

---

# Data Flow

Community experiences enter the system through either:

```text
Google Form
     │
     ▼
W0
     │
     ▼
Safety Database
```

or:

```text
Application Report Form
     │
     ▼
W1
     │
     ▼
Safety Database
```

The route comparison process then uses:

```text
User Route Request
        │
        ▼
W3
        │
        ├── Routing Data
        │
        └── Community Safety Data
                 │
                 ▼
          Route Safety Score
                 │
                 ▼
        Safety-First Selection
                 │
                 ▼
          AI Explanation
```

---

# Important Design Principle

AI SafeRoute is designed around one core principle:

> **A safer route should not be rejected simply because it takes longer.**

The prototype therefore separates:

**Decision-making**

from

**AI explanation.**

The deterministic scoring layer selects the safest route, while the AI layer explains that decision in natural language.

This helps keep the recommendation consistent with the project's safety-first objective.

---

# Limitations

This project is a hackathon prototype and has several limitations.

### Approximate Geocoding

The current prototype uses a combination of location handling and predefined area coordinates for some Karachi locations rather than a full production-grade geocoding system.

### Community Data Coverage

Safety scores depend on the number and quality of available community reports.

Areas with limited reports may have less reliable safety estimates.

### Prototype Route Matching

Route-to-report matching uses geographic proximity and should be further refined for production deployment.

### Backend Availability

The hackathon prototype uses a locally running n8n backend exposed through ngrok. The ngrok URL can change and is not intended as a permanent production deployment.

### Safety Information Is Indicative

The system provides a data-informed safety assessment based on available reports. It should not be interpreted as a guarantee that a route is completely safe.

---


## Team & Roles

AI SafeRoute was developed collaboratively by **Insharah Irshad** and **Aqsa**.

| Team Member         | Role                    | Responsibilities                                                                                                                                                                                                                            |
| ------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Insharah Irshad** | Backend & AI/Automation | Designed and implemented the n8n automation workflows, PostgreSQL/Supabase database integration, route-safety scoring logic, AI recommendation pipeline, API integration, safety-first route selection logic, and backend workflow testing. |
| **Aqsa**            | Frontend Developer      | Designed and developed the React/Vite frontend, including the route comparison interface, safety result cards, safety map, report submission interface, navigation, and overall user experience.                                            |

### Collaboration

The frontend and backend were integrated through API endpoints, allowing the React application to communicate with the n8n automation layer and PostgreSQL/Supabase database for real-time route comparison and safety analysis.


# Future Improvements

Potential future improvements include:

* Production-grade geocoding
* Larger and continuously updated community datasets
* More sophisticated spatial route matching
* Time-of-day risk modeling
* Historical safety trend analysis
* Real-time incident integration
* More granular neighborhood-level risk analysis
* Production backend deployment
* Improved anomaly detection for suspicious reports
* Personalized route-safety preferences
* Emergency assistance integrations

---


# Hackathon Project

AI SafeRoute was developed as a prototype focused on using AI, automation, routing data, and community experiences to improve safety-aware mobility for women.

The project combines:

**Community Data + Route Analysis + Automation + AI**

to provide a more safety-conscious alternative to conventional fastest-route navigation.

---

## Repository

The complete project source code, frontend, and exported n8n workflows are included in this repository.

```text
Frontend
   +
n8n Backend Workflows
   +
Safety Dataset
   +
AI Recommendation Layer
   =
AI SafeRoute
```

---

### Disclaimer

AI SafeRoute is a hackathon prototype. Safety scores and recommendations are based on available data and should be treated as informational rather than a guarantee of personal safety.



### By
Insharah Irshad & Aqsa Iftikhar
