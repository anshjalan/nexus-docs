const Document = require("../models/Document");
const User = require("../models/User");
require("dotenv").config();

exports.createDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const newDoc = await Document.create({
      owner: userId
    });

    await User.findByIdAndUpdate(userId, {
      $push: { createdDocuments: newDoc._id }
    });

    return res.status(201).json({
      success: true,
      data: newDoc
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create document"
    });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const userId = req.user._id;

    const documents = await Document.find({
      $or: [
        { owner: userId },
        { collaborators: userId }
      ]
    }).sort({ updatedAt: -1 });

    return res.json({
      success: true,
      data: documents
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents"
    });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    const isOwner = document.owner.toString() === userId.toString();
    const isCollaborator = document.collaborators.some((id) => id.toString() === userId.toString());
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    return res.json({
      success: true,
      data: document
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch document"
    });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, title } = req.body;
    const userId = req.user._id;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    const isOwner = document.owner.toString() === userId.toString();
    const isCollaborator = document.collaborators.some((id) => id.toString() === userId.toString());
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    if (content !== undefined) document.content = content;
    if (title !== undefined) document.title = title;

    await document.save();

    return res.json({
      success: true,
      data: document
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update document"
    });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    if (document.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only owner can delete this document"
      });
    }

    await Document.findByIdAndDelete(id);
    await User.updateMany(
      { $or: [{ createdDocuments: id }, { sharedDocuments: id }] },
      { $pull: { createdDocuments: id, sharedDocuments: id } }
    );

    return res.json({
      success: true,
      message: "Document deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete document"
    });
  }
};

exports.addCollaborator = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const userId = req.user._id;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    if (document.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only owner can add collaborators"
      });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (document.collaborators.some((colId) => colId.toString() === userToAdd._id.toString())) {
      return res.status(400).json({
        success: false,    
        message: "User already a collaborator"
      });
    }

    document.collaborators.push(userToAdd._id);
    await document.save();

    await User.findByIdAndUpdate(userToAdd._id, {
      $addToSet: { sharedDocuments: document._id }
    });

    return res.status(200).json({
      success: true,    
      message: "Collaborator added"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add collaborator"
    });
  }
};

exports.removeCollaborator = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const userId = req.user._id;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    if (document.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only owner can remove collaborators"
      });
    }

    const userToRemove = await User.findOne({ email });
    if (!userToRemove) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    document.collaborators = document.collaborators.filter(
      (collaboratorId) => collaboratorId.toString() !== userToRemove._id.toString()
    );

    await document.save();

    await User.findByIdAndUpdate(userToRemove._id, {
      $pull: { sharedDocuments: document._id }
    });

    return res.status(200).json({
      success: true,    
      message: "Collaborator removed"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove collaborator"
    });
  }
};