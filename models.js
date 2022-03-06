const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  TF_PASS: {
    type: Number,
    required: true,
  },
  TF_FAIL: {
    type: Number,
    default: 0,
  },
  PAAS_PASS: {
    type: Number,
    required: true,
  },
  PAAS_FAIL: {
    type: Number,
    required: true,
  },
  DSD_PASS: {
    type: Number,
    required: true,
  },
  DSD_FAIL: {
    type: Number,
    required: true,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
