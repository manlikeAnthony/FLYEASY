import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export type Role = "USER" | "ADMIN";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;

  role: Role;

  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpirationDate?: Date;
  verifiedAt?: Date;

  passwordToken?: string;
  passwordTokenExpirationDate?: Date;

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },

    
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: String,

    verificationTokenExpirationDate: Date,

    verifiedAt: Date,

    passwordToken: String,

    passwordTokenExpirationDate: Date,
  },
  { timestamps: true }
);


UserSchema.pre<UserDocument>("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<UserDocument>("User", UserSchema);
export default User;