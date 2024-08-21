const userSchema = require("../model/userSchema");
const cloudinary = require("../middleware/cloudinary");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
exports.getUsers = (req, res, next) => {
  userSchema
    .find({})
    .populate("role")
    .select("-password")
    .then((users) => {
      if (!users.length) {
        res.status(404).json({ message: "there is no users" });
      }
      res.status(200).json({ users });
    })
    .catch((err) => next(err));
};

exports.addUser = async (req, res, next) => {
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
      subject: "User Credantials",
      text: `
      Dear ${req.body.fullName},
          Your account created and you can use it now 
          Email: ${user.email}
          password: ${req.body.password}
      
      Make sure to change the default password to more secure one `,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({ action: "user added successfully" });
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
      await cloudinary.delete(user.imageID);
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
  try {
    const { id } = req.token.id;
    console.log(req.body)
 
    const updateData = { ...req.body };
    let user = await userSchema.findOne({_id:id});
    if (!user) {
      return res.status(404).json({ message: "This user desn't exist" });
    }
    if (req.file) {
      await cloudinary.delete(user.imageID);
      const { imageURL, imageID } = await cloudinary.upload(
        req.file.path,
        "userImages"
      );
      updateData.imageURL = imageURL;
      updateData.imageID = imageID;
    }
    const updatedUesr = await userSchema.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("role");
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

exports.getUserById = (req, res, next) => {
  const { id } = req.params;

  userSchema
    .findById(id)
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
