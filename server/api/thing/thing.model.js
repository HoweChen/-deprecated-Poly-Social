'use strict';

import mongoose from 'mongoose';

var mongoSchema = mongoose.Schema;

var ThingSchema = new mongoose.Schema({
  name: String,
  user: {
    type: mongoSchema.ObjectId,
    ref: 'User'
  },
  info: String,
  active: Boolean
}, {
  timestamps: true
});

export default mongoose.model('Thing', ThingSchema);
