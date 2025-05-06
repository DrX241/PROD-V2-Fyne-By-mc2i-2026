# Architecture Overview

## 1. Overview

The application is an AI-powered platform designed to provide cyber security education, training, and simulation capabilities. It leverages OpenAI's GPT models (primarily GPT-4o and GPT-4o-mini) to create interactive learning experiences, cyber security simulations, and decision-based training scenarios.

The platform consists of a React-based single-page application (SPA) frontend and a Node.js/Express backend, with PostgreSQL database storage managed through the Drizzle ORM. The architecture follows a client-server model with RESTful API communication.

Key features include:
- Custom AI assistants specialized in cybersecurity, AMOA (Assistance to Project Ownership), and other domains
- Interactive learning modules and scenarios
- Cyber security investigation simulations
- Code generation and analysis
- Decision-based training for cybersecurity responses

## 2. System Architecture

The application follows a layered architecture:

1. **Presentation Layer**: React-based SPA with Shadcn UI components
2. **API Layer**: Express.js REST API endpoints
3. **Business Logic Layer**: Service-based architecture with specialized controllers for different features
4. **Data Access Layer**: Drizzle ORM for database operations
5. **External Services Layer**: Integration with OpenAI and other third-party APIs

### Core Architectural Decisions

- **Modular Backend Design**: The server code is organized into domain-specific controllers (like `cyberExpertController`, `cyberDefenseController`, etc.) to maintain separation of concerns.
- **Service Pattern**: Common functionality is extracted into services (like `openAIService`, `cacheService`, `rateLimiterService`) to enable reuse and consistent behavior.
- **Stateful User Sessions**: The application maintains stateful user sessions for chatbots and simulations using in-memory Maps, with optional persistence to the database.
- **API-Driven Communication**: The frontend and backend communicate exclusively through RESTful API endpoints.
- **Hybrid Data Storage**: Using both database storage (via Neon Postgres) and in-memory cache for performance optimization.

## 3. Key Components

### Frontend Components

The frontend is built with React and uses Shadcn UI components with Tailwind CSS for styling. The architecture appears to follow a context-based state management approach.

Key frontend files and components:
- Custom UI components under `client/src/components/ui`
- Page components under `client/src/pages`
- Context providers under `client/src/contexts` (including `ChatContext.tsx`)
- Tailwind CSS for styling with a custom theme

### Backend Components

The backend is structured into specialized controllers, each handling different features of the application:

1. **Core API Controllers**:
   - `customAssistantsController.ts`: Manages custom AI assistants
   - `cyberExpertController.ts`: Handles the cybersecurity expert chat functionality
   - `cyberDefenseController.ts`: Manages cyber defense simulations
   - `cyberInvestigatorController.ts`: Handles investigation scenarios
   - `brainHackerController.ts`: Manages social engineering simulation
   - `codeGeneratorController.ts`: Provides AI-powered code generation

2. **Service Layer**:
   - `openai.ts`: Core service for OpenAI API integration
   - `enhancedOpenAIService.ts`: Extended OpenAI service with caching and rate limiting
   - `cacheService.ts`: Caching service to reduce API calls
   - `rateLimiterService.ts`: Rate limiting to prevent API abuse
   - `codeSandboxService.ts`: Secure code execution environment
   - `assistantLogger.ts`: Logging service for assistant interactions
   - `promptBackupService.ts`: Service to backup and restore system prompts

3. **Database Layer**:
   - `db.ts`: Database connection and Drizzle ORM setup
   - `schema.ts`: Database schema definitions using Drizzle ORM

4. **Routing Layer**:
   - `routes.ts`: Main route definitions
   - Specialized route modules under `server/routes/`

### Database Schema

The database schema is defined using Drizzle ORM in `shared/schema.ts` and includes:

1. **Core tables**:
   - `users`: User authentication information
   - `user_profiles`: Extended user profile information
   - `custom_assistants`: Custom AI assistant configurations
   - `assistant_templates`: Templates for new assistants
   - `assistant_conversations`: Conversation history with assistants

2. **Learning and Progress**:
   - `user_learning_progress`: Tracks user progress in learning modules
   - `investigation_progress`: Tracks progress in investigation scenarios

3. **Logging and History**:
   - `assistant_operation_logs`: Logs interactions with assistants
   - `prompt_backups`: Stores historical versions of system prompts

The schema uses PostgreSQL enums for constrained fields like `assistant_personality`, `assistant_domain`, `gamification_level`, and `share_access`.

## 4. Data Flow

The application follows several key data flows:

### Authentication Flow

1. User provides username (simplified authentication for demo purposes)
2. Backend creates or retrieves user from database
3. User ID is returned to frontend for subsequent requests

### Assistant Interaction Flow

1. User creates or selects a custom assistant
2. System constructs appropriate prompts based on assistant configuration
3. User messages are sent to backend via API
4. Backend enriches messages with system prompts and context
5. OpenAI API processes the conversation
6. Response is returned to user and stored in conversation history

### Learning Session Flow

1. User selects a learning module or scenario
2. Backend prepares appropriate content and context
3. User progresses through interactive content
4. Progress is tracked and stored in the database
5. AI generates personalized feedback and evaluations

### Investigation Simulation Flow

1. User selects an investigation scenario
2. Backend generates or retrieves scenario details
3. User analyzes evidence and makes decisions
4. Backend evaluates decisions against expected outcomes
5. User receives feedback and progress is updated

## 5. External Dependencies

### API Integrations

1. **OpenAI API (Primary)**:
   - Used for generating responses, evaluations, and content
   - Both GPT-4o and GPT-4o-mini models are utilized depending on complexity
   - Configurable through environment variables

2. **Azure OpenAI API (Alternative)**:
   - Alternative deployment of OpenAI models
   - Used when specified in configuration

3. **SendGrid**:
   - Email service for sending reports and evaluations
   - Used in interview simulation reports

### Third-Party Libraries

1. **Frontend**:
   - React for UI components
   - Tailwind CSS for styling
   - Shadcn UI component library
   - Framer Motion for animations
   - dnd-kit for drag-and-drop functionality

2. **Backend**:
   - Express.js for API server
   - Drizzle ORM for database operations
   - Neon PostgreSQL for serverless database
   - Axios for HTTP requests
   - ws for WebSocket support

## 6. Deployment Strategy

The application is configured for deployment on Replit, as evidenced by the `.replit` configuration file and various Replit-specific plugins in the `vite.config.ts`.

### Development Environment

- Uses Vite for frontend development with hot module replacement
- Supports TypeScript with incremental compilation
- Runs both frontend and backend in development mode using `npm run dev`

### Production Deployment

1. **Build Process**:
   - Frontend: Vite builds optimized assets to `dist/public`
   - Backend: esbuild compiles TypeScript to JavaScript in `dist`

2. **Runtime**:
   - Node.js serves both the API and static frontend assets
   - Express handles API routes and serves the SPA
   - Environment variables configure OpenAI API keys and database connections

3. **Database**:
   - Uses Neon PostgreSQL with the serverless driver
   - WebSocket connections for database communication
   - Schema is managed through Drizzle ORM

### Scaling Considerations

- The current architecture relies on in-memory storage for some session data, which may limit horizontal scaling
- Rate limiting and caching services help manage API usage and costs
- The application is designed for Replit's autoscaling deployment target

## 7. Security Considerations

1. **API Key Management**:
   - OpenAI API keys are stored in environment variables
   - Secondary/fallback API keys are configured for reliability

2. **Code Execution**:
   - Uses VM2 for secure code execution in isolated environments
   - Implements timeouts and resource limits

3. **Data Protection**:
   - Sensitive user data is stored in the database with proper constraints
   - Session data is kept in memory to avoid persisting sensitive information

4. **Authentication**:
   - Currently implements a simplified authentication system
   - Uses UUIDs for session identification