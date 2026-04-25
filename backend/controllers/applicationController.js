const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/email');

// POST /api/applications — apply to a job (seeker only)
const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    // check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // check if already applied
    const alreadyApplied = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // use the user's saved resume path (if any)
    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      resume: req.user.resume || '',
    });

    // --- Notification & Email System for Recruiter ---
    const recruiter = await User.findById(job.postedBy);
    if (recruiter) {
      const message = `New applicant: ${req.user.name || 'A job seeker'} applied for ${job.title} role.`;
      
      // 1. Create DB Notification
      const notif = await Notification.create({
        userId: recruiter._id,
        title: 'New Applicant',
        message,
        type: 'new_applicant',
      });

      // 2. Real-time Socket Event
      const socketId = req.userSockets?.get(recruiter._id.toString());
      if (socketId) {
        req.io.to(socketId).emit('new_notification', notif);
      }

      // 3. Email Recruiter
      await sendEmail({
        email: recruiter.email,
        subject: `New Applicant for ${job.title}`,
        message: `Hello ${recruiter.name},\n\n${message}\n\nPlease check your dashboard to review their resume.`,
      });
    }

    res.status(201).json({ message: 'Application submitted!', application });
  } catch (error) {
    console.error('Apply error:', error.message);
    res.status(500).json({ message: 'Could not submit application' });
  }
};

// GET /api/applications — get my applications (seeker)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: 'job',
        populate: { path: 'postedBy', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Get my applications error:', error.message);
    res.status(500).json({ message: 'Could not fetch applications' });
  }
};

// GET /api/applications/job/:jobId — get all applicants for a job (recruiter)
const getApplicantsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // verify the job belongs to this recruiter
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these applicants' });
    }

    const applications = await Application.find({ job: jobId })
      .populate('applicant', '-password')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Get applicants error:', error.message);
    res.status(500).json({ message: 'Could not fetch applicants' });
  }
};

// PUT /api/applications/:id/status — update application status (recruiter)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // only the recruiter who posted the job can update status
    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    // --- Notification & Email System for Job Seeker ---
    const seeker = await User.findById(application.applicant);
    if (seeker) {
      const message = `Your application for ${application.job.title} at ${application.job.company} has been ${status}.`;

      // 1. Create DB Notification
      const notif = await Notification.create({
        userId: seeker._id,
        title: 'Application Status Updated',
        message,
        type: 'application_status',
      });

      // 2. Real-time Socket Event
      const socketId = req.userSockets?.get(seeker._id.toString());
      if (socketId) {
        req.io.to(socketId).emit('new_notification', notif);
      }

      // 3. Email Seeker
      await sendEmail({
        email: seeker.email,
        subject: `Update on your application for ${application.job.title}`,
        message: `Hello ${seeker.name},\n\n${message}\n\nGood luck!`,
      });
    }

    res.json({ message: 'Application status updated', application });
  } catch (error) {
    console.error('Update status error:', error.message);
    res.status(500).json({ message: 'Could not update application status' });
  }
};

// POST /api/applications/upload-resume — upload/update resume (seeker)
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // save the file Cloudinary path to the user's profile
    const user = await User.findById(req.user._id);
    user.resume = req.file.path; // Cloudinary returns the full URL directly in path
    await user.save();

    res.json({ message: 'Resume uploaded successfully', resume: req.file.path });
  } catch (error) {
    console.error('Upload resume error:', error.message);
    res.status(500).json({ message: 'Could not upload resume' });
  }
};

// POST /api/applications/save-job — save/unsave a job (toggle)
const toggleSaveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const user = await User.findById(req.user._id);

    const index = user.savedJobs.indexOf(jobId);
    if (index === -1) {
      // not saved yet — add it
      user.savedJobs.push(jobId);
      await user.save();
      res.json({ message: 'Job saved', saved: true });
    } else {
      // already saved — remove it
      user.savedJobs.splice(index, 1);
      await user.save();
      res.json({ message: 'Job unsaved', saved: false });
    }
  } catch (error) {
    console.error('Save job error:', error.message);
    res.status(500).json({ message: 'Could not save/unsave job' });
  }
};

// GET /api/applications/saved-jobs — get saved jobs (seeker)
const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs',
      populate: { path: 'postedBy', select: 'name email' },
    });
    res.json({ savedJobs: user.savedJobs });
  } catch (error) {
    console.error('Get saved jobs error:', error.message);
    res.status(500).json({ message: 'Could not fetch saved jobs' });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
  uploadResume,
  toggleSaveJob,
  getSavedJobs,
};
