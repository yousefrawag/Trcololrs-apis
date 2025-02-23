const userSchema = require("../model/userSchema");
const cloudinary = require("../middleware/cloudinary");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const path = require("path");
const { log } = require("console");
const customerSchema = require("../model/customerSchema")
const logo = path.join(__dirname, "../images/logo2.jpg");
exports.getUsers = (req, res, next) => {
  const {field , searTerm} = req.query
  let fillter = {}
  if(["fullName" , "email" , "job"].includes(field) && searTerm) {
    fillter[field] = { $regex: new RegExp(searTerm, 'i') }
  }
  userSchema
    .find(fillter)
    .populate("role")
    .sort({ createdAt: -1 })
    .select("-password")
    .then((data) => {
      if (!data.length) {
        res.status(404).json({ message: "there is no users" });
      }
      res.status(200).json({ data });
    })
    .catch((err) => next(err));
};
exports.Selectusers = async (req , res , next) => {
  const findusers  = await  userSchema
  .find({})
  .populate("role")
  .select("-password")
  const users = findusers.filter((item) => item._id !== 1)
  res.status(200).json({users})
}



exports.addUser = async (req, res, next) => {
  console.log(req.body)
  try {
    let user = new userSchema(req.body);

    if (req.file) {
      const { imageURL, imageID } = await cloudinary.upload(
        req.file.path,
        "userImages"
      );
      user.imageURL = imageURL;
      user.imageID = imageID;
    }
    
    await user.save();

    // Create the transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASS,
      },
    });



    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: user.email,
      subject: "🎉 تم إنشاء حسابك بنجاح!",
      html: `
        <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 10px; color: #333; line-height: 1.8;">
          <!-- شعار الشركة -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:logo" alt="شعار الشركة" style="width: 150px; border-radius: 10px;">
          </div>

          <h2 style="color: #218bc7;">🎉 مرحبًا ${user.name}!</h2>
          <p>تم إنشاء حسابك بنجاح على منصتنا  ألوان المسافر. يمكنك الآن تسجيل الدخول باستخدام التفاصيل التالية:</p>

          <p><strong>✉️ البريد الإلكتروني:</strong> ${user.email}</p>
          <p><strong>🔑 كلمة المرور:</strong> ${req.body.password}</p>

          <p style="color: #d9534f;"><strong>⚠️ ملاحظة:</strong> يُرجى تغيير كلمة المرور فور تسجيل الدخول لحماية حسابك.</p>

          <p>يمكنك تسجيل الدخول إلى حسابك عبر الرابط التالي:</p>

          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.CLIENT_URL}" 
              style="display: inline-block; padding: 12px 24px; background-color: #218bc7; color: white; text-decoration: none; font-size: 16px; border-radius: 5px;">
              🔐 تسجيل الدخول إلى الحساب
            </a>
          </div>

          <p style="margin-top: 20px; font-size: 12px; color: #888;">📌 هذا البريد مرسل تلقائيًا، لا ترد عليه.</p>
        </div>
      `,
      attachments: [
        {
          filename: "logo2.jpg",
          path: logo, // ✅ Ensure this path is correct
          cid: "logo",
        },
      ],
    };

    // Send Email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ action: "تم إنشاء الحساب وإرسال البريد الإلكتروني بنجاح" });

  } catch (error) {
    next(error);
  }
};


exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    let user = await userSchema.findById(id);
    if (!user) {
      return res.status(404).json({ message: "This user desn't exist" });
    }
    if (req.file) {
      if (user.imageID) await cloudinary.delete(user.imageID);
      const { imageURL, imageID } = await cloudinary.upload(
        req.file.path,
        "userImages"
      );
      updateData.imageURL = imageURL;
      updateData.imageID = imageID;
    }
    const updatedUesr = await userSchema.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.status(200).json({ message: "User updated successfully", updatedUesr });
  } catch (error) {
    next(error);
  }
};

exports.updateUserOwnInfo = async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);

  try {
    const id = req.token.id;
    const updateData = { ...req.body };
    let user = await userSchema.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "This user desn't exist" });
    }
    if (req.file) {
      if (user.imageID) await cloudinary.delete(user.imageID);
      const { imageURL, imageID } = await cloudinary.upload(
        req.file.path,
        "userImages"
      );
      updateData.imageURL = imageURL;
      updateData.imageID = imageID;
    }
    const updatedUesr = await userSchema
      .findByIdAndUpdate(id, updateData, {
        new: true,
      })
      .populate("role");
    res.status(200).json({ message: "User updated successfully", updatedUesr });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = (req, res, next) => {
  const { id } = req.params;

  userSchema
    .findByIdAndDelete(id)
    .then(async (user) => {
      if (!user) {
        return res.status(404).json("User doesn't exist");
      }
      if (user.imageID) await cloudinary.delete(user.imageID);
      res.status(200).json({ message: "User deleted successfully" });
    })
    .catch((err) => next(err));
};

exports.getUserById = async (req, res, next) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;

  // Validate the user ID (ensure it's a number)
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  // Convert id to a number
  const userId = Number(id);

  // Validate the date range (if provided)
  if (startDate && isNaN(new Date(startDate))) {
    return res.status(400).json({ message: "Invalid start date" });
  }
  if (endDate && isNaN(new Date(endDate))) {
    return res.status(400).json({ message: "Invalid end date" });
  }

  // Calculate default date ranges if not provided
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the current month

  // Use provided dates or default to the current month
  const dateFilter = {
    $gte: startDate ? new Date(startDate) : startOfMonth, // Default to start of the month
    $lte: endDate ? new Date(endDate) : now, // Default to the current time
  };

  try {
    // Log the userId and date range for debugging
    console.log("Fetching data for user ID:", userId);
    console.log("Date range:", dateFilter);

    // Fetch payment type totals for the user
    const TotalpyemtyypeforEachuser = await customerSchema.aggregate([
      {
        $match: { addBy: userId  , createdAt:dateFilter}, // Filter by user using addBy (directly use the number)
      },
      {
        $group: {
          _id: "$Paymenttype", // Group by payment type
          totalAmount: { $sum: "$total" }, // Sum of total amounts for each payment type
          totalArrivedCash: { $sum: "$Arrievcashe" }, // Sum of arrivedCash
          totalInProcessCash: { $sum: "$inprocessCashe" }, // Sum of inProcessCash
        },
      },
    ]);

    // Log the payment type totals for debugging
    console.log("Payment type totals:", TotalpyemtyypeforEachuser);

    // Fetch financial totals for the specified date range
    const TotalFince = await customerSchema.aggregate([
      {
        $match: {
          addBy: userId, // Filter by user using addBy (directly use the number)
          createdAt: dateFilter, // Use the calculated date range
        },
      },
      {
        $group: {
          _id: null, // Group all documents
          totalArrivedCash: { $sum: "$Arrievcashe" }, // Sum of arrivedCash
          totalInProcessCash: { $sum: "$inprocessCashe" }, // Sum of inProcessCash
          totalAmount: { $sum: "$total" }, // Sum of all amounts
        },
      },
    ]);

    // Log the financial totals for debugging
    console.log("Financial totals:", TotalFince);

    // Fetch user details
    const user = await userSchema.findById(userId).populate("role").select("-password");

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the response
    res.status(200).json({
      data: user,
      TotalFince: TotalFince[0] || {
        totalArrivedCash: 0,
        totalInProcessCash: 0,
        totalAmount: 0,
      },
      TotalpyemtyypeforEachuser,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.changePassword = async (req, res, next) => {
  let { id, oldPassword, newPassword } = req.body;

  try {
    const user = await userSchema.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(403).json({ message: "Incorrect password" });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await userSchema.findByIdAndUpdate(id, { password: hashedPassword });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentLoggedUser = (req, res, next) => {
  userSchema
    .findById(req.token.id)
    .populate("role")
    .select("-password")
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: "User doesn't exist" });
      }
      res.status(200).json({ user });
    })
    .catch((err) => next(err));
};
exports.getusersAdmin = async (req , res , nex) => {
  const {field , searTerm} = req.query
  let fillter = {type:"admin"}
  if(["fullName" , "email" , "job"].includes(field) && searTerm) {
    fillter[field] = { $regex: new RegExp(searTerm, 'i') }
  }
  const admins = await userSchema.find(fillter).sort({ createdAt: -1 })
  const checkuser = admins.filter((item) => item._id !== 1)
  res.status(200).json({checkuser})
}
