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
    type: Boolean,
    default: false,

  },
  contact: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: false,
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
    default: ''
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  accountLocked: {
    type: Boolean,
    default: false,
  },
  lastFailedLoginAttempt: {
    type: Date,
    default: null,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  passwordHistory: [
    {
      password: { type: String, required: true },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  lastPasswordChange: {
    type: Date,
    default: Date.now,
  },
    
    
});
const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
  }

  try {
      const user = await Users.findById(req.user.id);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Check if the new password is in the password history
      const isReused = await user.isPasswordInHistory(newPassword);
      if (isReused) {
          return res.status(400).json({ message: 'You cannot reuse a recent password. Please choose a different password.' });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update the user's password history
      await user.updatePasswordHistory(newPassword);

      // Save the updated user document
      user.lastPasswordChange = Date.now(); // Update the last password change date
      await user.save();

      res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};


const updatePassword = async (req, res) => {
  const { email, password } = req.body;

  try {
      // Find the user by email
      const user = await Users.findOne({ email });

      if (!user) {
          return res.json({
              success: false,
              message: "User not found.",
          });
      }

      // Check if the new password is in the user's password history
      const isReused = await user.isPasswordInHistory(password);
      if (isReused) {
          return res.json({
              success: false,
              message: "You cannot reuse a recent password. Please choose a different password.",
          });
      }

      // If not reused, proceed to update the password
      const randomSalt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, randomSalt);

      // Update the user's password and add it to the password history
      user.password = encryptedPassword;
      await user.updatePasswordHistory(password);
      await user.save();

      return res.json({
          success: true,
          message: "Password reset successfully.",
      });

  } catch (error) {
      console.log(error);
      return res.json({
          success: false,
          message: 'Server Error: ' + error.message,
      });
  }
};



const Users = mongoose.model('users', userSchema);
module.exports = Users;


