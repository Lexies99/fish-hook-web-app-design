"use server"

// No redirect here, return data
export async function signup(
  _prevState: { success: boolean; message: string; userType?: string } | null,
  formData: FormData,
) {
  // `_prevState` is supplied automatically by `useActionState`,
  // we don't need it here so it's prefixed with `_` to avoid ESLint warnings.
  const userType = formData.get("userType") as string
  const name = formData.get("name") as string
  const username = formData.get("username") as string
  const dob = formData.get("dob") as string
  const gender = formData.get("gender") as string
  const email = formData.get("email") as string
  const telephone = formData.get("telephone") as string
  const region = formData.get("region") as string
  const bodyType = formData.get("bodyType") as string | null // Only for models
  const password = formData.get("password") as string

  // --- Simulate Validation ---
  if (!name || !username || !dob || !gender || !email || !telephone || !region || !password) {
    return { success: false, message: "All fields are required." }
  }

  // Simulate age verification
  const birthDate = new Date(dob)
  const ageDiffMs = Date.now() - birthDate.getTime()
  const ageDate = new Date(ageDiffMs)
  const age = Math.abs(ageDate.getUTCFullYear() - 1970)

  if (age < 18) {
    return { success: false, message: "You must be at least 18 years old to sign up." }
  }

  // Simulate telephone number verification (e.g., sending an OTP)
  console.log(`Simulating OTP sent to ${telephone} for verification.`)

  // --- Simulate User Creation / Database Save ---
  console.log("Attempting to create user with data:", {
    userType,
    name,
    username,
    dob,
    gender,
    email,
    telephone,
    region,
    bodyType: userType === "model" ? bodyType : "N/A", // Log body type only for models
    password: "[HASHED_PASSWORD_SIMULATED]", // Never log raw password
  })

  // Simulate a delay for network request
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Simulate successful signup
  console.log(`User ${username} (${userType}) signed up successfully!`)

  // Return success and userType to the client
  return { success: true, message: `Welcome, ${username}!`, userType: userType }
}
