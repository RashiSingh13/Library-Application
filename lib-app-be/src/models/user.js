const { model, Schema } = require("mongoose");
const { isEmail, trim, isLowercase } = require("validator");
const { encryptPassword, checkPassword } = require("../bcrypt");
const { generateToken } = require("../jwt");

const UserSchema = new Schema(
  {
    firstName: { type: String, trim: true, requird: true },
    lastName: { type: String, trim: true, requird: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
      unique: true,
      validate: {
        validator(email) {
          return isEmail(email);
        },
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate: {
        validator(pass) {
          if (
            pass.includes(" ") ||
            pass.includes("\n") ||
            pass.includes("\t")
          ) {
            throw new Error(
              "Password must not contain space/tab.newline character."
            );
          }
          return true;
        },
      },
    },
    type: {
      type: String,
      enum: ["STUDENT", "LIBRARIAN"],
      default: "STUDENT",
    },
    tokens: {
      type: [{ token: String }],
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.modifiedPaths().includes("password")) {
    user.password = await encryptPassword(user.password);
  }
  next();
});

UserSchema.statics.findByEmailAndPasswordForAuth = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(`Login Failed!`);
    }
    const encryptPassword = user.password;
    const isMatch = await checkPassword(password, encryptPassword);
    if (!isMatch) {
      throw new Error("Login Failed!");
    }
    console.log("Login Success!");
    return user;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

UserSchema.methods.generateToken = function () {
  const user = this;
  const token = generateToken(user);
  user.tokens.push({ token });
  user.save();
  return token;
};

UserSchema.methods.toJSON = function () {
  let user = this.toObject();
  delete user.tokens;
  return user;
};

const User = model("User", UserSchema);
module.exports = User;
