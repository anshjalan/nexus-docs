const express = require('express');
const router = express.Router();

const { createDocument, getDocuments, getDocumentById, updateDocument, deleteDocument, addCollaborator, removeCollaborator } = require('../controllers/documentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/create', authMiddleware, createDocument);
router.get('/get', authMiddleware, getDocuments);
router.get("/:id", authMiddleware, getDocumentById);
router.patch("/:id", authMiddleware, updateDocument);
router.delete("/:id", authMiddleware, deleteDocument);
router.post("/:id/collaborators", authMiddleware, addCollaborator)
router.delete("/:id/collaborators", authMiddleware, removeCollaborator)

module.exports = router;