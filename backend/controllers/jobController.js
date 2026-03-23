const Job = require('../models/Job');

// GET /api/jobs — list all jobs (with optional search & filter)
const getJobs = async (req, res) => {
  try {
    const { search, location, jobType } = req.query;
    let filter = {};

    // search by title or company (case-insensitive)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (jobType) {
      filter.jobType = jobType;
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    console.error('Get jobs error:', error.message);
    res.status(500).json({ message: 'Could not fetch jobs' });
  }
};

// GET /api/jobs/:id — single job details
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    console.error('Get job error:', error.message);
    res.status(500).json({ message: 'Could not fetch job details' });
  }
};

// POST /api/jobs — create a new job (recruiter only)
const createJob = async (req, res) => {
  try {
    const { title, description, company, location, salary, jobType, requirements } = req.body;

    const job = await Job.create({
      title,
      description,
      company,
      location,
      salary,
      jobType,
      requirements,
      postedBy: req.user._id,
    });

    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    console.error('Create job error:', error.message);
    res.status(500).json({ message: 'Could not create job' });
  }
};

// PUT /api/jobs/:id — update a job (only the recruiter who posted it)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // make sure only the person who posted it can edit
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own job posts' });
    }

    // update only the fields that were sent
    const updates = req.body;
    Object.keys(updates).forEach((key) => {
      job[key] = updates[key];
    });

    await job.save();
    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error('Update job error:', error.message);
    res.status(500).json({ message: 'Could not update job' });
  }
};

// DELETE /api/jobs/:id — delete a job (only the recruiter who posted it)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own job posts' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error.message);
    res.status(500).json({ message: 'Could not delete job' });
  }
};

// GET /api/jobs/my/posted — get jobs posted by the logged-in recruiter
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (error) {
    console.error('Get my jobs error:', error.message);
    res.status(500).json({ message: 'Could not fetch your jobs' });
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs };
