const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a complaint title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Road & Infrastructure',
      'Water Supply',
      'Electricity',
      'Sanitation & Waste',
      'Public Safety',
      'Healthcare',
      'Education',
      'Parks & Recreation',
      'Traffic & Transportation',
      'Others'
    ]
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide the location address']
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  images: [{
    type: String,
    url: String,
    public_id: String
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    isOfficial: {
      type: Boolean,
      default: false
    }
  }],
  resolutionDetails: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolutionNotes: String,
    resolvedAt: Date,
    beforeImage: String,
    afterImage: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  estimatedResolutionTime: Date,
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

// Update the updatedAt field before saving
ComplaintSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Complaint', ComplaintSchema);