const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
  uploadResume,
  toggleSaveJob,
  getSavedJobs,
} = require('../controllers/applicationController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');

// seeker routes
router.post('/', auth, role('seeker'), applyToJob);
router.get('/', auth, role('seeker'), getMyApplications);
router.post('/upload-resume', auth, role('seeker'), upload.single('resume'), uploadResume);
router.post('/save-job', auth, role('seeker'), toggleSaveJob);
router.get('/saved-jobs', auth, role('seeker'), getSavedJobs);

// recruiter routes
router.get('/job/:jobId', auth, role('recruiter'), getApplicantsForJob);
router.put('/:id/status', auth, role('recruiter'), updateApplicationStatus);

module.exports = router;
