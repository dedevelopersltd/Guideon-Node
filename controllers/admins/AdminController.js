import Admin from "../../models/Admins/AdminUser.js";
import generateToken from "../../util/tokengenrator.js";

// Signup Admin
export const signupAdmin = async (req, res) => {
  const { name, lastname, email, password, profilepic } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const newAdmin = new Admin({
      name,
      lastname,
      email,
      password,
      profilepic,
      isAdmin: true,
      role: "SubAdmin",
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.error("Error signing up admin:", error);
  }
};

// Login Admin
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await admin.isValidPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken({
      email: admin.email,
      id: admin._id,
      isAdmin: admin.isAdmin,
      role: admin.role,
    });

    if (!token) {
      return res.status(500).json({ message: "Error generating token" });
    }

    const adminWithoutPassword = {
      email: admin.email,
      name: admin.name,
      lastname: admin.lastname,
      id: admin._id,
      isAdmin: admin.isAdmin,
      pic: admin.profilepic,
      role: admin.role,
    };

    res
      .status(200)
      .json({
        admin: adminWithoutPassword,
        token,
        message: "Login successful",
      });
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get all admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}, { password: 0 });
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.error("Error fetching admins:", error);
  }
};

// Update Admins
export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, lastname, email, profilepic, password } = req.body;

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (email !== admin.email) {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res
          .status(400)
          .json({ message: "Email already exists for another admin" });
      }
    }

    admin.name = name || admin.name;
    admin.lastname = lastname || admin.lastname;
    admin.email = email || admin.email;
    admin.password = password || admin.password;
    admin.profilepic = profilepic || admin.profilepic;

    await admin.save();

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error("Error updating admin:", error);
  }
};

// Delete Admins

export const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role === "SuperAdmin") {
      return res
        .status(403)
        .json({ message: "Super Admin cannot delete itself" });
    }

    if (req.user.role === "SuperAdmin") {
      await Admin.findByIdAndDelete(id);
      return res.status(200).json({ message: "Admin deleted successfully" });
    }

    return res
      .status(403)
      .json({ message: "Access denied. Only Super Admins can delete admins" });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error("Error deleting admin:", error);
  }
};

export const getAdminById = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findById(id, "-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.error("Error fetching admin:", error);
  }
};
