# Fireflies Clone

A full-stack meeting intelligence workspace inspired by Fireflies.ai.

The application provides a meeting library, interactive meeting transcripts, a simulated media player with transcript synchronization, meeting summaries, action-item management, topic/chapter navigation, search, filtering, sorting, and persistent meeting data.

> This project was built as a functional Fireflies.ai clone. Real-time audio transcription, authentication, and third-party integrations are intentionally outside the scope of this implementation.

---

## Features

### Meetings Library

- Browse all meetings in a Fireflies-inspired workspace.
- Search meetings by title.
- Filter meetings by participant and date.
- Sort meetings by:
  - Newest
  - Oldest
  - Title
  - Duration
- View meeting metadata including:
  - Title
  - Date and time
  - Duration
  - Participants
  - Summary
  - Action-item progress
- Create new meetings.
- Edit meeting information.
- Delete meetings.

### Interactive Meeting Detail

- Meeting information and participants.
- Interactive transcript with:
  - Speaker labels
  - Timestamps
  - Transcript segments
- Simulated media player.
- Play/pause controls.
- Progress timeline and seeking.
- Playback-speed controls.
- Transcript-to-player synchronization.
- Player-to-transcript synchronization.
- Automatically highlights the active transcript segment.
- Transcript search with:
  - Case-insensitive search
  - Speaker search
  - Highlighted matches
  - Match count
  - Previous/next result navigation

### Meeting Summary and Topics

- Meeting summary section.
- Key topics / chapters.
- Topic timeline.
- Clicking a chapter seeks the simulated player to the corresponding timestamp.
- Active chapter updates as the player progresses.

### Action Items

- View meeting action items.
- Create action items.
- Edit action items.
- Delete action items.
- Mark action items as completed/incomplete.
- Track completion progress.
- Persist action-item changes in SQLite.

### Responsive UI

The application is designed to work across:

- Desktop
- Tablet
- Mobile

---

## Tech Stack

### Frontend

- Next.js
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Lucide React
- TanStack Query
- date-fns
- Sonner

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- SQLite
- Uvicorn

---

## Architecture

    Next.js Frontend
           |
           v
    Frontend API Layer
           |
           v
    FastAPI Routes
           |
           v
    Service Layer
           |
           v
    SQLAlchemy ORM
           |
           v
    SQLite Database

The frontend uses a dedicated API layer so HTTP communication is separated from UI components.

The backend separates HTTP routes from business/database operations using service modules.

---

## Project Structure

    fireflies-clone/
    |
    +-- README.md
    |
    +-- frontend/
    |   +-- app/
    |   |   +-- meetings/
    |   |   +-- action-items/
    |   |   +-- analytics/
    |   |   +-- integrations/
    |   |   +-- settings/
    |   |
    |   +-- components/
    |   |   +-- action-items/
    |   |   +-- layout/
    |   |   +-- meetings/
    |   |   +-- topics/
    |   |   +-- ui/
    |   |
    |   +-- hooks/
    |   |
    |   +-- lib/
    |   |   +-- api/
    |   |   |   +-- meetings.ts
    |   |   |   +-- action-items.ts
    |   |   |   +-- chapters.ts
    |   |   +-- format.ts
    |   |   +-- utils.ts
    |   |
    |   +-- types/
    |
    +-- backend/
        +-- app/
        |   +-- models/
        |   +-- routes/
        |   +-- schemas/
        |   +-- services/
        |   +-- database.py
        |   +-- main.py
        |
        +-- data/
        |   +-- fireflies.db
        |
        +-- seed.py
        +-- requirements.txt
        +-- .env.example

---

## Backend Architecture

### Routes

FastAPI route modules handle HTTP requests and responses.

    backend/app/routes/
    +-- meetings.py
    +-- action_items.py
    +-- chapters.py

### Services

Business and database operations are handled by service modules.

    backend/app/services/
    +-- meetings.py
    +-- transcripts.py
    +-- action_items.py
    +-- chapters.py

### Models

SQLAlchemy models represent the database entities.

    backend/app/models/
    +-- meeting.py
    +-- transcript.py
    +-- action_item.py
    +-- chapter.py

### Schemas

Pydantic schemas define request and response structures.

    backend/app/schemas/
    +-- meeting.py
    +-- transcript.py
    +-- action_item.py
    +-- chapter.py

---

## Database Schema

The application uses SQLite with SQLAlchemy.

### Meetings

Stores the main meeting information.

| Field | Description |
|---|---|
| `id` | Primary key |
| `title` | Meeting title |
| `meeting_date` | Meeting date/time |
| `duration_seconds` | Meeting duration |
| `participants` | Meeting participant data |
| `summary` | Meeting summary |

### Transcript Segments

Stores individual transcript lines.

| Field | Description |
|---|---|
| `id` | Primary key |
| `meeting_id` | Related meeting |
| `sequence` | Transcript ordering |
| `speaker` | Speaker name |
| `start_time_seconds` | Segment start time |
| `end_time_seconds` | Segment end time |
| `text` | Transcript content |

### Action Items

Stores tasks associated with meetings.

| Field | Description |
|---|---|
| `id` | Primary key |
| `meeting_id` | Related meeting |
| `task` | Action-item description |
| `assignee` | Assigned person |
| `due_date` | Optional due date |
| `completed` | Completion status |

### Chapters

Stores meeting topics/chapters.

| Field | Description |
|---|---|
| `id` | Primary key |
| `meeting_id` | Related meeting |
| `title` | Chapter/topic title |
| `start_time_seconds` | Chapter start position |

---

## API

Base URL:

    http://localhost:8000

### Health

    GET /
    GET /health

### Meetings

    GET    /api/meetings
    GET    /api/meetings/{meeting_id}
    POST   /api/meetings
    PUT    /api/meetings/{meeting_id}
    DELETE /api/meetings/{meeting_id}

The meetings list endpoint supports:

- Search
- Sorting
- Date filtering
- Participant filtering
- Pagination

Example:

    GET /api/meetings?q=product&sort=newest

### Transcript

    GET /api/meetings/{meeting_id}/transcript

### Meeting Action Items

    GET  /api/meetings/{meeting_id}/action-items
    POST /api/meetings/{meeting_id}/action-items

### Action Item Management

    PUT    /api/action-items/{action_item_id}
    DELETE /api/action-items/{action_item_id}

### Chapters

    GET /api/meetings/{meeting_id}/chapters

---

## Local Development

### Prerequisites

Install:

- Python 3.12+
- Node.js
- npm

### 1. Clone the Repository

    git clone https://github.com/PremChand1601/fireflies-clone.git
    cd fireflies-clone

### 2. Start the Backend

Open a terminal:

    cd backend
    python -m venv .venv

Activate the virtual environment on Windows:

    .venv\Scripts\activate

Install dependencies:

    pip install -r requirements.txt

Create the environment file:

    copy .env.example .env

Start FastAPI:

    uvicorn app.main:app --reload --port 8000

Backend:

    http://localhost:8000

Health check:

    http://localhost:8000/health

FastAPI documentation:

    http://localhost:8000/docs

### 3. Start the Frontend

Open a second terminal:

    cd frontend

Create the local environment file:

    copy .env.local.example .env.local

Install dependencies:

    npm install

Start the development server:

    npm run dev

Frontend:

    http://localhost:3000

---

## Environment Variables

### Backend

The backend uses:

    FRONTEND_URL=http://localhost:3000

Environment template:

    backend/.env.example

### Frontend

The frontend API URL is configured through:

    NEXT_PUBLIC_API_URL=http://localhost:8000

Environment template:

    frontend/.env.local.example

---

## Seed Data

The project includes seeded meeting data for demonstrating the application without requiring real audio transcription.

The seed dataset contains:

- 6 meetings
- 57 transcript segments
- 19 action items
- 20 chapters

Example meeting scenarios include:

- Product planning
- Team standup
- Client renewal
- Marketing kickoff
- Sprint planning
- Hiring debrief

The database is initialized when the backend starts. Existing meeting data is preserved rather than duplicated.

---

## Design Decisions and Assumptions

### Mocked Transcription

Real-time speech-to-text processing is intentionally not implemented.

Transcript data is seeded in the database so the complete post-meeting workflow can be demonstrated.

### Simulated Media Player

The assignment does not require real audio transcription or processing.

The player therefore uses a simulated timeline while maintaining the expected meeting-player interaction model.

    Player Position
          |
          v
    Active Transcript Segment
          |
          v
    Active Chapter

Selecting a transcript segment or chapter seeks the player to its timestamp.

### Meeting Summary

Meeting summaries are seeded/deterministic rather than dependent on an external LLM API.

This keeps the project self-contained and avoids requiring external API keys.

### Authentication

Real authentication is outside the scope of the implementation.

### Integrations

Third-party integrations are outside the core scope and are represented by placeholder sections.

---

## Frontend Data Flow

The frontend uses TanStack Query for server-state management.

    React Component
          |
          v
    TanStack Query Hook
          |
          v
    Frontend API Module
          |
          v
    FastAPI Endpoint
          |
          v
    Service Layer
          |
          v
    SQLite

HTTP requests are centralized in:

    frontend/lib/api/

---

## Meeting Player Synchronization

The meeting detail page maintains player state including:

    currentTime
    duration
    isPlaying
    playbackRate

The active transcript segment is calculated from the current playback position.

Example:

    Current Time = 42s

    Transcript:
    00:35  Speaker A
    00:42  Speaker B  <- Active
    00:51  Speaker C

Selecting a transcript segment seeks the player to that timestamp.

Selecting a chapter also seeks the player to the chapter's starting timestamp.

---

## Error Handling

The application includes handling for:

- Failed API requests
- Invalid meeting IDs
- Validation errors
- Empty states
- Loading states
- Retry actions
- CRUD operation failures

User-facing operations also provide toast notifications where appropriate.

---

## Responsive Design

The application has been tested across:

- Desktop
- Tablet
- Mobile

The meeting dashboard, meeting detail page, transcript, player controls, action items, and navigation adapt to smaller screens.

---

## Testing and Verification

The following flows have been manually verified.

### Meetings

- Meeting list loading
- Meeting search
- Sorting
- Participant filtering
- Date filtering
- Meeting creation
- Meeting editing
- Meeting deletion

### Meeting Detail

- Meeting information
- Participants
- Player controls
- Play/pause
- Timeline seeking
- Playback speed
- Transcript display
- Transcript/player synchronization
- Transcript search
- Search highlighting
- Search result navigation
- Chapter/topic navigation

### Action Items

- Create action item
- Edit action item
- Delete action item
- Complete/incomplete action item
- Progress calculation
- Persistence after refresh

### Persistence

Meeting and action-item changes persist through the FastAPI + SQLite backend.

### API

The following API areas have been verified:

- Health endpoint
- Meetings list
- Meeting detail
- Transcript
- Action items
- Chapters
- Meeting CRUD
- Action-item CRUD
- Invalid resource handling

### Build

The Next.js production build completes successfully.

---

## Frontend Routes

    /
    /meetings
    /meetings/[id]
    /action-items
    /analytics
    /integrations
    /settings

---

## Backend Routes

    /api/meetings
    /api/meetings/{id}
    /api/meetings/{id}/transcript
    /api/meetings/{id}/action-items
    /api/meetings/{id}/chapters
    /api/action-items/{id}
    /health

---

## Project Status

### Implemented

- [x] Fireflies-inspired application shell
- [x] Meetings library
- [x] Meeting search
- [x] Meeting filters
- [x] Meeting sorting
- [x] Meeting creation
- [x] Meeting editing
- [x] Meeting deletion
- [x] Interactive transcript
- [x] Simulated media player
- [x] Transcript/player synchronization
- [x] Transcript search and highlighting
- [x] Meeting summary
- [x] Topics/chapters
- [x] Action-item CRUD
- [x] Action-item completion tracking
- [x] SQLite persistence
- [x] FastAPI backend
- [x] Layered backend architecture
- [x] Frontend API abstraction
- [x] Responsive UI
- [x] Error/loading/empty states

### Intentionally Out of Scope

- [ ] Real-time speech-to-text
- [ ] Real authentication
- [ ] Live meeting bot
- [ ] Third-party integrations
- [ ] Team collaboration backend

These areas are outside the core implementation scope.

---

## Repository

GitHub:

https://github.com/PremChand1601/fireflies-clone

---

## Deployment

The application is designed to be deployed as separate frontend and backend services.

Before deployment, configure:

    NEXT_PUBLIC_API_URL
    FRONTEND_URL

The deployed frontend URL must be added to the backend CORS configuration.

> Production deployment URL will be added after the frontend and backend are deployed and verified.

---

## Assignment Scope

This project implements the core post-meeting experience required by the Fireflies Clone assignment:

- Meeting library
- Transcript experience
- Meeting summaries
- Action items
- Topics/chapters
- Meeting CRUD
- Persistent database storage
- Fireflies-inspired UI and navigation

Real-time transcription and integrations are intentionally excluded.

---

## License

This project was created for educational and assessment purposes.