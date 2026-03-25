# Smart Job Portal 💼

Welcome to the **Smart Job Portal**, a modern, full-stack application designed to connect top talent with great companies. 

**Live Demo:** [Click here to view the live app!](https://smart-placement-portal-three.vercel.app)

---

## What is this?

This is a complete platform built for two types of users:
1. **Job Seekers:** Browse job listings, upload your resume securely, apply to jobs in one click, and track your application status.
2. **Recruiters:** Post new job openings, view submitted resumes, and update the status of your applicants (e.g., Shortlisted, Accepted, Rejected).

---

## Technology Stack

This application is built using the **MERN** stack, featuring a premium UI design.
- **Frontend:** React.js + Vite (Hosted on Vercel)
- **Backend:** Node.js + Express (Hosted on Render)
- **Database:** MongoDB Atlas
- **Storage:** Cloudinary (for secure, permanent resume storage)

---

##  How to use the Live App!

You don't need to download any code to try it out. Just head over to the live link:
 **[Smart Placement Portal](https://smart-placement-portal-three.vercel.app)**

* **To test as a Recruiter:** Sign up, select "Recruiter", and try posting a new job!
* **To test as a Job Seeker:** Sign up, select "Job Seeker", upload a test PDF resume to your dashboard, and apply for a job!

---

## 💻 Running it Locally

If you want to run the code on your own machine:

1. **Clone the repo:**
   ```bash
   git clone https://github.com/omg0014/smart_placement_portal.git
   cd smart_placement_portal
   ```

2. **Start the Backend:**
   Create a `.env` file in the `backend` folder with your MongoDB URI, JWT Secret, and Cloudinary API keys.
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser!
