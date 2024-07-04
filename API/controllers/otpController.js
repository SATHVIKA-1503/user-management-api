const otpGenerator = require('otp-generator');
const OTP = require('../models/otpModel');
const User = require('../models/userModel');
const mailSender = require('../mailers/mailSender');

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user is already present
    const checkUserPresent = await User.findOne({ email });
    // If user found with provided email
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: 'User is already registered',
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let result = await OTP.findOne({ otp: otp });
    while (result) {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
        });
        result = await OTP.findOne({ otp: otp });
      }
      
      const otpPayload = { email, otp };
      const otpBody = `Your OTP is ${otp}. Please enter this OTP to complete the registration process.`;
      await mailSender(email, 'OTP for Registration', otpBody);
      
      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
      });
      } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, error: error.message });
      }
      };