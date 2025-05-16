# BlogCraft

A modern, full-stack blogging platform with a seamless user experience, elegant UI, and robust backend.

## 🚀 Tech Stack

### Frontend
- **React 19** - Latest version of the React library for building user interfaces
- **TypeScript** - For type-safe code and better developer experience
- **Vite** - Fast and efficient build tool and development server
- **TailwindCSS** - Utility-first CSS framework for rapid UI development
- **shadcn/ui** - High-quality UI components built with Radix UI and Tailwind
- **Framer Motion** - Animation library for creating fluid UI transitions
- **React Router** - Declarative routing for React applications
- **Axios** - Promise-based HTTP client for making API requests
- **React Hot Toast** - Lightweight notification library
- **React Icons** - Popular icons as React components

### Backend
- **Node.js** - JavaScript runtime for server-side logic
- **Express** - Web framework for Node.js
- **TypeScript** - For type-safe backend code
- **PostgreSQL** - Robust relational database
- **Prisma** - Next-generation ORM for Node.js and TypeScript
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Library for hashing passwords
- **dotenv** - Environment variable management
- **cookie-parser** - Middleware for parsing cookies

## ✨ Features

### Authentication & Authorization
- **User Registration** - Create a new account with email and password
- **User Login** - Secure authentication with JWT
- **Protected Routes** - Authenticated access to dashboard and blog management
- **Persistent Sessions** - Stay logged in with HTTP-only cookies and localStorage

### Blog Management
- **Create Blogs** - Write new blog posts with a title, content, and tags
- **Save Drafts** - Automatically save blog drafts while writing
- **Edit Blogs** - Update existing blog posts
- **Publish Blogs** - Convert drafts to published posts
- **Delete Blogs** - Remove unwanted blog posts
- **Organize with Tags** - Categorize blogs with custom tags

### User Interface
- **Responsive Design** - Fully responsive layout that works on all devices
- **Dark/Light Mode** - Toggle between dark and light themes
- **Modern Design** - Clean and modern UI with glass morphism effects
- **Animated Transitions** - Smooth animations between pages and components
- **Toast Notifications** - User-friendly notifications for actions
- **Loading States** - Elegant loading indicators during data fetching

## 🏁 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL database
- npm or yarn

### Installation

#### Clone the Repository
```bash
git clone https://github.com/yourusername/blogcraft.git
cd blogcraft
```

#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd blog/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your database URL and JWT secret:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres"
   JWT_SECRET="your_super_secret_key_for_jwt_authentication"
   FRONTEND_URL="http://localhost:5173"
   PORT=5000
   ```

4. Set up the database:
   ```bash
   npm run db
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

#### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd blog/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Visit `http://localhost:5173` in your browser

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login an existing user
- `POST /api/auth/logout` - Logout the current user

### Blog Management
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/:id` - Get a specific blog by ID
- `POST /api/blogs/save-draft` - Create or update a draft blog
- `POST /api/blogs/publish` - Publish a blog
- `DELETE /api/blogs/:id` - Delete a blog

## 🛠️ Project Structure

### Backend

