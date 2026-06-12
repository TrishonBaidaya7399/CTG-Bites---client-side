"use server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  // TODO: replace with real DB auth when MongoDB is wired
  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // Mock: accept any valid-looking credentials — swap for bcrypt + DB check
  if (password.length < 6) {
    return { error: "Invalid email or password." };
  }

  // On success, redirect to order page (where auth is required)
  redirect("/order");
}

export async function registerAction(formData: FormData) {
  const name     = formData.get("name")     as string;
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  // TODO: hash password with bcrypt + insert into MongoDB
  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  // Mock: simulate existing email conflict
  if (email === "taken@ctgbites.com") {
    return { error: "An account with this email already exists." };
  }

  // On success, redirect to order page
  redirect("/order");
}
