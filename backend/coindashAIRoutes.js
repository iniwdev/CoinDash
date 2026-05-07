const express = require('express');
const router = express.Router();

// Deprecated AI route.
// The active AI endpoint is /api/ai/chat in backend/routes/aiRoutes.js.
router.post('/coindash-ai', (req, res) => {
  res.status(410).json({
    error: 'This route is deprecated. Use /api/ai/chat instead.'
  });
});

module.exports = router;
