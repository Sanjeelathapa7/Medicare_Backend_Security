

const Users = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const ResetCode = require("../model/resetcodeModel");
const cloudinary = require("cloudinary");
require('dotenv').config();

const resetCode = Math.floor(1000 + Math.random() * 8000);

const mailConfig = () => {
  console.log(process.env.USEREMAIL);
  console.log(process.env.PASSWORD);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USEREMAIL,
      pass: process.env.PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Ignore SSL errors
    },
  });

  return transporter;
};

const evaluatePasswordStrength = (password) => {
  let strength = "Weak";
  const lengthRequirement = /.{8,12}/;
  const uppercaseRequirement = /[A-Z]/;
  const lowercaseRequirement = /[a-z]/;
  const numberRequirement = /[0-9]/;
  const specialCharRequirement = /[!@#$%^&*]/;

  if (
    lengthRequirement.test(password) &&
    uppercaseRequirement.test(password) &&
    lowercaseRequirement.test(password) &&
    numberRequirement.test(password) &&
    specialCharRequirement.test(password)
  ) {
    strength = "Strong";
  } else if (
    lengthRequirement.test(password) &&
    (uppercaseRequirement.test(password) ||
      lowercaseRequirement.test(password)) &&
    (numberRequirement.test(password) || specialCharRequirement.test(password))
  ) {
    strength = "Medium";
  }

  return strength;
};

const createUser = async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields.",
    });
  }

  if (!email.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format.",
    });
  }

  const passwordStrength = evaluatePasswordStrength(password);

  if (passwordStrength === "Weak") {
    return res.status(400).json({
      success: false,
      message: "Password is too weak. It must be 8-12 characters long and include uppercase and lowercase letters, numbers, and special characters.",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match.",
    });
  }

  try {
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new Users({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      passwordHistory: [{
        password: hashedPassword,
        changedAt: new Date()
      }],
      lastPasswordChangeDate: new Date(),
    });

    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User created successfully.",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields.",
    });
  }

  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist.",
      });
    }

// Check if account is locked
if (user.accountLocked) {
  const lockoutDurationMillis = Date.now() - user.lastFailedLoginAttempt;
  const lockoutDurationSeconds = lockoutDurationMillis / 1000; // convert to seconds

  if (lockoutDurationSeconds >= 120) { // 2 minutes in seconds
      // Unlock the account
      user.accountLocked = false;
      user.failedLoginAttempts = 0;
      await user.save();
  } else {
      const timeRemainingSeconds = 120 - lockoutDurationSeconds;
      const minutes = Math.floor(timeRemainingSeconds / 60);
      const seconds = Math.floor(timeRemainingSeconds % 60);

      return res.status(400).json({
          success: false,
          message: `Account is locked. Please try again later after ${minutes} minutes and ${seconds} seconds.`
      });
  }
}
  // Check password expiry
  const checkPasswordExpiry = (user) => {
    const passwordExpiryDays = 90; // Set the password expiry duration in days
    const currentDate = new Date();
    const lastPasswordChangeDate = user.passwordChangeDate || user.createdAt;

    const daysSinceLastChange = Math.floor(
        (currentDate - lastPasswordChangeDate) / (1000 * 60 * 60 * 24)
    );

    const daysRemaining = passwordExpiryDays - daysSinceLastChange;

    if (daysRemaining <= 3 && daysRemaining > 0) {
        const message = `Your password will expire in ${daysRemaining} days. Please change your password.`;
        return {
            expired: false,
            daysRemaining: daysRemaining,
            message: message
          };
        }

        return {
            expired: daysSinceLastChange >= passwordExpiryDays,
            daysRemaining: daysRemaining,
            message: null
        };
    };
 // Compare password
 const isPasswordValid = await bcrypt.compare(password, user.password);
 if (!isPasswordValid) {
     // Increment failed login attempts and update last failed login timestamp
     user.failedLoginAttempts += 1;
     user.lastFailedLoginAttempt = Date.now();

     // Check if the maximum allowed failed attempts is reached
     if (user.failedLoginAttempts >= 4) {
         // Lock the account
         user.accountLocked = true;
         await user.save();
         return res.json({
             success: false,
             message: "Account is locked. Please try again later."
         });
     }
     await user.save();
     return res.json({
         success: false,
         message: "Incorrect Password."
     });
 }

 // Reset failed login attempts and last failed login timestamp on successful login
 user.failedLoginAttempts = 0;
 user.lastFailedLoginAttempt = null;
 await user.save();

 // Check if the account is still locked after successful login
 if (user.accountLocked) {
     return res.json({
         success: false,
         message: "Account is locked. Please try again later."
     });
 }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      token: token,
      userData: user,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const resetPassword = async (req, res) => {
  const UserData = req.body;
  console.log(UserData)
  const user = await Users.findOne({ email: UserData?.email });
  const OTP = resetCode;
  console.log(OTP);
  await ResetCode.findOneAndUpdate({
    userId: user.id
  }, {
    resetCode: OTP
  }, { upsert: true })
  console.log(user);
  const MailConfig = mailConfig();

  const mailOptions = {
    from: 'Medicare', // Replace with your email
    to: UserData?.email,
    subject: 'Password Reset Code',
    text: `Your password reset code is: ${OTP}`
  };

  try {
    await MailConfig.sendMail(mailOptions);
    return res.json({
      success: true,
      message: "Reset code email sent successfully!"
    })
    // console.log('Reset code email sent successfully!');
  } catch (error) {
    console.log(error)
    return res.json({
      success: false,
      message: 'Error sending reset code email:' + error.message,
    })
  }
}

const verifyResetCode = async (req, res) => {

  const { resetCode, email } = req.body;
  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found with the provided email."
      });
    } else {
      const savedResetCode = await ResetCode.findOne({ userId: user._id });
      if (!savedResetCode || savedResetCode.resetCode != resetCode) {
        return res.json({
          success: false,
          message: "Invalid reset code."
        });
      } else {
        return res.json({
          success: true,
          message: "Reset code verified successfully."
        });
      }
    }
  } catch (error) {
    console.error("Error in verifyResetCode:", error);
    return res.json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }    //set opt code null
};


const updatePassword = async (req, res) => {
  const { email, password } = req.body;
  // console.log(email, password);

  try {
    // Update the user's password
    const randomSalt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, randomSalt);

    await Users.findOneAndUpdate({ email }, { password: encryptedPassword });

    return res.json({
      success: true,
      message: "Password reset successfully."
    });

  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};


// //Profile

const getUserProfile = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decodedToken.id;
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      userProfile: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contact: user.contact,
        location: user.location,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};
const updateUserProfile = async (req, res) => {
  console.log(req.files);
  try {
    // Check if user object exists in the request
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated.",
      });
    }

    const user = await Users.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const { firstName, lastName, email, contact, location, profileImage } =
      req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (contact) user.contact = contact;
    if (location) user.location = location;
    if (req.files) {
      const uploadedImage = await cloudinary.v2.uploader.upload(
        req.files.profileImage.path,
        {
          folder: "profile_images",
          crop: "scale",
        }
      );
      user.profileImage = uploadedImage.secure_url;
    }
    await user.save();

    // Return the updated user profile data
    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      userProfile: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contact: user.contact,
        location: user.location,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  resetPassword,
  verifyResetCode,
  updatePassword,
  updateUserProfile,
  getUserProfile,
  resetCode,
  mailConfig,
};
