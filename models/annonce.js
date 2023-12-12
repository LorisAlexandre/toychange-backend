const mongoose = require('mongoose');

const announceSchema = mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['donation', 'exchange'], required: true },
  deliveryMethod: { type: String, enum: ['inPerson', 'postalDelivery'], required: true },
  address: { type: String },
  images: [{ type: String }], // Array of strings to store multiple images
  category: { type: String, required: true },
  condition: { type: String, enum: ['new', 'likeNew', 'good', 'defects'], required: true },
  description: { type: String, required: true },
  exchangeProposal: { type: String },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Announce = mongoose.model('announces', announceSchema);

module.exports = Announce ;
