const express = require('express');
const { listPublicServices, listBranches, quickBook } = require('../controllers/publicController');

const router = express.Router();

router.get('/services', listPublicServices);
router.get('/branches', listBranches);
router.post('/quick-book', quickBook);

module.exports = router;
