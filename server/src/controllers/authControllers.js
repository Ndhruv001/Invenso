// controllers/auth.controller.js
import { loginUser, logoutUser } from "../services/authServices.js";
import asyncHandler from "../utils/asyncHandlerUtils.js";
import { successResponse } from "../utils/responseUtils.js";

const login = asyncHandler(async (req, res) => {
  const {username, password} = req.body;

  const { token, user } = await loginUser(username, password);
  
  // set cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000
  });

  return successResponse(
    res,
    "User logged in successfully",
    { id: user.id, username: user.username },
    200
  );
});
const logout = asyncHandler(async (req, res) => {
  await logoutUser();

  res.clearCookie("token");
  return successResponse(res, "User logged out successfully", null, 200);
});

export default { login, logout };
export { login, logout };
