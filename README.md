# 🌿 Inside Mana — A Calm Space for Reflection

Mana's interface is designed to reduce cognitive load and guide you into a quiet, thoughtful state before you write.

## 🎨 Key UI Features

* **Mood Check-Ins:** Easily select how you feel (*Calm*, *Anxious*, *Happy*, *Overwhelmed*, *Reflective*) to ground your entry.
* **Guided Starter Prompts:** Tap ready-to-use prompts like *"What am I grateful for right now?"* or *"What is one thing you learned today?"* to spark meaningful thoughts.
* **Distraction-Free Journaling:** A clean, minimal canvas asking *"What is resting on your mind?"* for freeform expression.
* **Reflect with Mana:** A single button that transitions you from writing into a calm breathing exercise before delivering gentle AI insights.

## 🛠️ Tech Stack & Infrastructure

* **Frontend:** React.js, TypeScript, Tailwind CSS
* **Backend & Database:** Firebase Firestore (Friction-Free Guest Access for Judges)
* **AI Engine:** Google Gemini API
* **Cloud Hosting:** Google Cloud Run

## ☁️ Deployment (Google Cloud Run)

This app is deployed on Google Cloud Run.

### Prerequisites

* Google Cloud project with billing enabled
* Firebase project linked to the same project
* Gemini API key stored in Google Cloud Secret Manager

### Steps

1. Clone the repo
2. Set environment variables (see `.env.example`)
3. Build the container image
4. Deploy to Cloud Run
5. **Live app:** [https://mana-38367492666.us-west1.run.app](https://mana-38367492666.us-west1.run.app)
