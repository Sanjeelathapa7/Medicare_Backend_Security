const mongoose = require('mongoose');
 
const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
 
    isAdmin: {
        type:Boolean,
        default :false,
 
    },
    contact:{
        type:String,
        required:false,
      },
      location:{
        type:String,
        required:false,
      },
      profileImage: {
        type: String,
        required: false,
    },
    userImageUrl: {
        type: String,
        required: false,
    },
    token: {
        type: String,
        default:''
    }
})
 
const Users = mongoose.model('users', userSchema);
module.exports = Users;

