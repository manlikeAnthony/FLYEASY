import { AppCodes } from "../errors/AppCodes";
import { CustomError } from "../errors/CustomError";
import { HttpCodes } from "../errors/HttpCodes";
import User from "../auth/user.model";
import { checkPermissions } from "../utils";
import { UserQuery } from "../query/user/userQuery";

export const getAllUsersService = async (query: UserQuery) => {
  const { filters, pagination, sort } = query;

  const mongoQuery: any = {};
  if (filters.search) {
    mongoQuery.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }
  if (filters.role) {
    mongoQuery.role = filters.role;
  }
  if (filters.status) {
    mongoQuery.accountStatus = filters.status;
  }

  const users = await User.find(mongoQuery)
    .select("-password -verificationToken")
    .sort({ [sort.field]: sort.order })
    .skip(pagination.skip)
    .limit(pagination.limit);

  if (users.length === 0) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.USER_NOT_FOUND,
      "No Users found",
    );
  }
  return users;
};

// export const getAllAdminsService = async () => {
//   const admins = await User.find({ role: "ADMIN" }).select("-password");
//   if (admins.length === 0) {
//     CustomError.throwError(
//       HttpCodes.NOT_FOUND,
//       AppCodes.USER_NOT_FOUND,
//       "No Admins found",
//     );
//   }
//   return admins;
// };

export const getCurrentUserService = async (userId: string) => {
  const user = await User.findById(userId).select(
    "-password -verificationToken",
  );

  if (!user) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.USER_NOT_FOUND,
      "User not found",
    );
  }

  return user;
};

export const getSingleUserService = async (userId: string) => {
  const user = await User.findById(userId).select(
    "-password -verificationToken",
  );

  if (!user) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.USER_NOT_FOUND,
      "User not found",
    );
  }
  return user;
};

export const getUserStatsService = async (days = 14) => {
  const total = await User.countDocuments();
  const verified = await User.countDocuments({ isVerified: true });

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  const perDayAgg = await User.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(end.getDate() - i);
    map.set(d.toISOString().slice(0, 10), 0);
  }
  perDayAgg.forEach((r: any) => map.set(r._id, r.count));

  const perDay = Array.from(map.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name email createdAt isVerified")
    .lean();

  return {
    total,
    verified,
    perDay,
    recentUsers,
  };
};
