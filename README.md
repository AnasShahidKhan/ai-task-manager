# AI-Powered MERN Task Manager
**Live Demo:** [**https://your-vercel-url-goes-here.vercel.app**](https://ai-task-manager-teal.vercel.app/)


> **Note on My Development Process:**
>
> My goal for this project was to build a full-stack, AI-powered application from scratch, focusing on the backend architecture and end-to-end integration.
>
> To accelerate the build, I used **Generative AI as a "copilot"** to help me scaffold the initial 2-column React layout and polish the final CSS.
>
> This allowed me to focus my time on the more complex engineering tasks:
> * Architecting the full **MERN** stack (MongoDB, Express, React, Node.js).
> * Building a full-featured **REST API** with full CRUD (Create, Read, Update, Delete) functionality.
> * Integrating the **Google Gemini API** for *two* separate features (task generation and conversational chat).
> * Writing **secure, "jailproof" prompts** to handle AI responses, parse JSON, and manage different user intents.
> * Debugging the entire system end-to-end, including CORS, API, and parsing errors.
>
> The commit history reflects this rapid, AI-assisted integration process.

---

### Core Features
* **Full-Stack MERN:** Built with a React frontend, a Node.js/Express.js backend, and a MongoDB (Atlas) database.
* **AI Conversational Chat:** An AI assistant (in the sidebar) that can understand natural language. It distinguishes between "chat" and "task creation" intents.
* **AI Task Parsing:** The AI can parse dates and tasks from prompts (e.g., "Call the bank tomorrow at 10am") and add them to the correct date.
* **Full CRUD & Calendar:** A full-featured calendar where users can click a date to see, create, update (complete), and delete tasks.
* **AI Sub-task Generation:** A "Generate" button on each task calls the AI to break it down into smaller, actionable sub-tasks.

---

### Tech Stack

* **Frontend:** React (with Vite), `axios`, `react-calendar`, `date-fns`
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (with Mongoose)
* **Generative AI:** Google Gemini API (`@google/generative-ai`)
* **DevOps:** `dotenv`, `cors`, `nodemon`

---

### How to Run Locally

1.  **Set up the Server:**
    ```bash
    cd server
    npm install
    # Create a .env file with your MONGODB_URI and GEMINI_API_KEY
    npm start
    ```

2.  **Set up the Client (in a new terminal):**
    ```bash
    cd client
    npm install
    npm run dev
    ```

---

### Key Challenges & Engineering Solutions

Building a full-stack AI app in a short sprint presented several technical challenges. Here are the key problems I solved:

1.  **AI Response Contamination & Crashing**
    * **Problem:** The Gemini API would sometimes return a string wrapped in markdown backticks (e.g., ` ```json ... ``` `) instead of pure JSON. My server would fail to parse this, crashing the API with a `500 - Internal Server Error`.
    * **Solution:** I engineered a robust "JSON Extractor" on the backend. It uses a regular expression (`.match(/{[\s\S]*}/)`) to find and extract the valid JSON object from the raw text, *even if* it's contaminated. This made the AI integration resilient to "dirty" responses.

2.  **AI Intent & Security**
    * **Problem:** The AI was "too helpful." When a user chatted ("Hi"), the AI would try to create a task named "Hi." When asked an unsupported question ("Can you delete a task?"), it would "leak" its internal prompt, creating a poor user experience and a potential security issue.
    * **Solution:** I re-engineered the AI prompt into a 3-intent classifier (`chat`, `creating_task`, `unsupported_request`). The Node.js backend now analyzes the AI's "intent" first. If the type is `unsupported_request`, the server *discards* the AI's chatty response and sends back a hard-coded, safe message ("Sorry, I can only add new tasks."). This makes the AI's behavior controlled, secure, and professional.

3.  **Full-Stack State Management**
    * **Problem:** The UI needed to update *instantly* across multiple components. If the AI Chat created a task for "next Friday," the `TaskList` component (which was focused on "today") wouldn't know.
    * **Solution:** I lifted all state (`selectedDate`, `tasks`) into the main `App.jsx` component. I then passed handler functions (like `onTaskCreated`) down to the children. When the `AISupporter` (chat) successfully creates a task, it calls `onTaskCreated`, which tells the `App.jsx` "brain" to change the `selectedDate` to "next Friday," triggering a re-fetch of tasks and making the new task appear on the calendar *immediately*.
