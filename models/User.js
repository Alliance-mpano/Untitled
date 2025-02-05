const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
   type: String,
   required: true,
   unique: true
  },
  password: {
    type: String,
    required:true
  },
  googleId: String,
  verified: {
    type: Boolean,
    default: false
  },
  photo: {
    type: String,
    required: false
  },
  
},{
    timestamps: true
})
userSchema.methods.verifyPassword = function(password){
  return bcrypt.compareSync(password, this.password);
}
const User = mongoose.model("user", userSchema);
module.exports = User;