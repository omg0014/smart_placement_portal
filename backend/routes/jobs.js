const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
} = require('../controllers/jobController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// public routes — anyone can browse jobs
router.get('/', getJobs);
router.get('/my/posted', auth, role('recruiter'), getMyJobs);
router.get('/:id', getJobById);

// recruiter-only routes
router.post('/', auth, role('recruiter'), createJob);
router.put('/:id', auth, role('recruiter'), updateJob);
router.delete('/:id', auth, role('recruiter'), deleteJob);

module.exports = router;
