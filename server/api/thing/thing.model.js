'use strict';

import mongoose from 'mongoose';

var mongoSchema = mongoose.Schema;

var ThingSchema = new mongoose.Schema({
  name: String,
  user: {
    type: mongoSchema.ObjectId,
    ref: 'User'
  },
  // info: String,
  active: Boolean,
  timeline: Array
}, {
  timestamps: true
});

ThingSchema.pre('find', function(next) {
  this.populate('user', 'name');
  next();
});
ThingSchema.pre('findOne', function(next) {
  this.populate('user', 'name');
  next();
});

export default mongoose.model('Thing', ThingSchema);
