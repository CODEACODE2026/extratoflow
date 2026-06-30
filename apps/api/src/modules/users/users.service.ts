import bcrypt from "bcryptjs";
import { Prisma, RecordStatus, UserRole } from "@prisma/client";

import { prisma } from "../../database/prisma/client";
import { AppError } from "../../shared/errors/app-error";
import { presentUser } from "./user.presenter";

const PASSWORD_SALT_ROUNDS = 10;

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
};

type UpdateUserInput = {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const ensureValidRole = (role: string | undefined): UserRole | undefined => {
  if (!role) {
    return undefined;
  }

  if (!Object.values(UserRole).includes(role as UserRole)) {
    throw new AppError("Invalid user role.", 400, "INVALID_USER_ROLE");
  }

  return role as UserRole;
};

const ensureValidStatus = (status: string): RecordStatus => {
  if (!Object.values(RecordStatus).includes(status as RecordStatus)) {
    throw new AppError("Invalid user status.", 400, "INVALID_USER_STATUS");
  }

  return status as RecordStatus;
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

export const findActiveUserById = async (id: string) => {
  return prisma.user.findFirst({
    where: {
      id,
      status: RecordStatus.active
    }
  });
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email: normalizeEmail(email)
    }
  });
};

export const listUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: [{ name: "asc" }]
  });

  return users.map(presentUser);
};

export const getUser = async (id: string) => {
  const user = await findUserById(id);

  if (!user) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  return presentUser(user);
};

export const createUser = async (input: CreateUserInput) => {
  const email = normalizeEmail(input.email);

  if (!input.name.trim()) {
    throw new AppError("Name is required.", 400, "USER_NAME_REQUIRED");
  }

  if (!email) {
    throw new AppError("Email is required.", 400, "USER_EMAIL_REQUIRED");
  }

  if (input.password.length < 8) {
    throw new AppError("Password must have at least 8 characters.", 400, "WEAK_PASSWORD");
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError("Email already registered.", 409, "USER_EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      passwordHash,
      role: input.role ?? UserRole.operator
    }
  });

  return presentUser(user);
};

export const updateUser = async (id: string, input: UpdateUserInput) => {
  await getUser(id);

  const data: Prisma.UserUpdateInput = {};

  if (input.name !== undefined) {
    if (!input.name.trim()) {
      throw new AppError("Name is required.", 400, "USER_NAME_REQUIRED");
    }

    data.name = input.name.trim();
  }

  if (input.email !== undefined) {
    const email = normalizeEmail(input.email);

    if (!email) {
      throw new AppError("Email is required.", 400, "USER_EMAIL_REQUIRED");
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser && existingUser.id !== id) {
      throw new AppError("Email already registered.", 409, "USER_EMAIL_ALREADY_EXISTS");
    }

    data.email = email;
  }

  if (input.password !== undefined) {
    if (input.password.length < 8) {
      throw new AppError("Password must have at least 8 characters.", 400, "WEAK_PASSWORD");
    }

    data.passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);
  }

  if (input.role !== undefined) {
    data.role = ensureValidRole(input.role);
  }

  const user = await prisma.user.update({
    where: { id },
    data
  });

  return presentUser(user);
};

export const updateUserStatus = async (id: string, status: string) => {
  await getUser(id);

  const user = await prisma.user.update({
    where: { id },
    data: {
      status: ensureValidStatus(status)
    }
  });

  return presentUser(user);
};

export const parseUserRole = ensureValidRole;
