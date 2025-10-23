# **App Name**: ERPsim Dashboard

## Core Features:

- Real-time KPI Dashboard: Display key performance indicators (KPIs) such as Company Valuation, Net Income, Inventory Value, and Total Emissions, updated in real-time using Firestore. Show trendlines and peer comparison.
- User Authentication: Allow users to select a profile (e.g., 'Jeremy', 'Nawrin') to sign in anonymously using Firebase Authentication. Manage user state globally.
- Scenario Simulation Tool: Simulate outcomes based on user-defined scenarios and the current game state, powered by a Genkit flow connected to the Gemini model.
- Strategic Advisor Tool: Analyze the current game state and team strategy to provide actionable recommendations, powered by a Genkit flow connected to the Gemini model.
- End-of-Round Debriefing Tool: Generate a summary report based on performance data, competitor analysis, and action items using a Genkit flow connected to the Gemini model.
- Action Items Management: A personal to-do list for the logged-in user, stored and updated in real-time using Firestore. Link action items to AI Debriefing.
- Competitor Analysis Log: A shared log for team members to add notes about other teams, stored and updated in real-time using Firestore.
- Contextual AI Chatbot/Copilot: Implement a chat window where users can ask questions directly to a Gemini-powered copilot.

## Style Guidelines:

- Primary color: Indigo (#3F51B5) to convey professionalism and clarity.
- Background color: Light grey-blue (#E8EAF6) for a clean and calming interface.
- Accent color: Vibrant yellow (#FFB300) for highlighting interactive elements and important information.
- Body and headline font: 'Inter', a grotesque-style sans-serif for a modern, neutral look.
- Code font: 'Source Code Pro' for displaying code snippets.
- Responsive layout with a collapsible sidebar for navigation and a header displaying the current page title and user avatar.
- Use clean and modern icons from ShadCN UI components to represent various data points and actions.