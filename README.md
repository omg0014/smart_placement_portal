# Smart Job Portal 💼

A full-stack **MERN** (MongoDB, Express, React, Node.js) job portal where **Job Seekers** can browse and apply to jobs, and **Recruiters** can post and manage listings.

---

## Features

| Seeker | Recruiter |
|---|---|
| Browse & search jobs | Post new jobs |
| Apply to jobs | Edit / delete jobs |
| Save / bookmark jobs | View applicants |
| Upload resume | Update application status |
| Track application status | — |

---

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios, CSS Modules
- **Backend:** Node.js, Express, Mongoose, JWT, bcrypt, Multer
- **Database:** MongoDB

---

## Folder Structure

```
smart_placement_portal/
├── backend/
│   ├── controllers/       # Route handlers
│   ├── middleware/         # Auth, role, file upload
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── uploads/resumes/   # Uploaded resume files
│   ├── server.js          # Entry point
│   ├── .env               # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios config
│   │   ├── components/    # Navbar, JobCard, ProtectedRoute
│   │   ├── context/       # AuthContext
│   │   ├── pages/         # All page components
│   │   ├── App.jsx        # Route definitions
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v16+ installed
- **MongoDB** running locally (or a MongoDB Atlas URI)

### 1. Clone / enter the project

```bash
cd smart_placement_portal
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env   # edit .env with your MONGO_URI and JWT_SECRET
npm install
npm start              # runs on http://localhost:5000
```

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev            # runs on http://localhost:5173
```

### 4. Open in browser

Go to **http://localhost:5173** — Sign up as a Recruiter or Job Seeker and start using the portal!

---

## Environment Variables (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/smart-job-portal` |
| `JWT_SECRET` | Secret key for JWT signing | `your_super_secret_key` |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (protected) |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/jobs` | List all jobs (search/filter) |
| GET | `/api/jobs/:id` | Get job details |
| POST | `/api/jobs` | Create job (recruiter) |
| PUT | `/api/jobs/:id` | Update job (recruiter) |
| DELETE | `/api/jobs/:id` | Delete job (recruiter) |
| GET | `/api/jobs/my/posted` | Get recruiter's jobs |

### Applications
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/applications` | Apply to job (seeker) |
| GET | `/api/applications` | My applications (seeker) |
| POST | `/api/applications/upload-resume` | Upload resume (seeker) |
| POST | `/api/applications/save-job` | Save/unsave job (seeker) |
| GET | `/api/applications/saved-jobs` | Get saved jobs (seeker) |
| GET | `/api/applications/job/:jobId` | View applicants (recruiter) |
| PUT | `/api/applications/:id/status` | Update status (recruiter) |

---

## License

This project is for educational purposes.
