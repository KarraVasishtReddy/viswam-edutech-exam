# EduGuard Pro - AI Proctoring Exam Portal

A robust, full-stack examination portal with integrated AI proctoring, real-time activity monitoring, and anti-cheating measures. Built with React, Express, and Tailwind CSS.

## Features

- **AI Proctoring**: Real-time monitoring of browser tab switching, window focus loss, and window resizing.
- **Anti-Cheating**: Disables copy/paste and right-click functionality during exams.
- **Dynamic Exam Management**: Create, edit, and publish examination programs from a central library.
- **Live Admin Monitor**: Real-time dashboard for administrators to track student progress and security alerts.
- **Integrity Audit Logs**: Detailed logs and risk assessment for every student submission.
- **Student Portal**: Secure interface for students to take assessments with auto-registration.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Motion
- **Backend**: Node.js, Express
- **State Management**: React Context (StudentContext, ExamContext, AuthContext)
- **Icons**: Lucide React
- **Persistence**: LocalStorage (scaffolded for Firebase/Firestore integration)

## Getting Started

### Prerequisites

- Node.js (v22+ recommended for native TypeScript support)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd <repo-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   - Copy `.env.example` to `.env`
   - Add your [Gemini API Key](https://aistudio.google.com/app/apikey)
   ```bash
   cp .env.example .env
   ```

### Running the Application

- **Development Mode**: Starts the Express server with Vite middleware and hot reloading.
  ```bash
  npm run dev
  ```

- **Production Mode**: Builds the frontend assets and starts the standalone Express server.
  ```bash
  npm run build
  npm start
  ```

## Project Structure

- `src/`: React frontend source code.
- `src/components/`: Reusable UI components and main views.
- `src/context/`: Context providers for global state management.
- `src/hooks/`: Custom hooks, including the `useAntiCheat` proctoring logic.
- `server.ts`: Express backend serving the API and static frontend assets.

## Deployment

The application is configured to run on port `3000` and is ready for deployment to platforms like Google Cloud Run or Heroku.

## License

MIT
