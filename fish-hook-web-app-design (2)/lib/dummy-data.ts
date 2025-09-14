/**
 * Shared mock data that can be imported by both
 * client components and server actions.
 */

export const DUMMY_USER_DATA = {
  id: "current_user_id", // Added for booking actions
  username: "johndoe",
  profilePictureUrl: "/placeholder.svg?height=150&width=150&text=User", // Added for user profile picture
  bookHistory: [
    {
      id: "b1",
      modelId: "m1",
      modelName: "ModelSarah",
      date: "2023-10-26",
      time: "10:00",
      status: "completed_payment_released", // Updated status
      price: 1500, // Model's base price in GHS
      totalPrice: 1725, // User's paid price (1500 * 1.15) in GHS
      isPaid: true,
      userLocation: "East Legon, Accra",
      liveLocationLink: "https://maps.app.goo.gl/example1",
      callerLine: "+233241234567",
      userConfirmed: true,
      modelConfirmed: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "b2",
      modelId: "m3",
      modelName: "InfluencerMike",
      date: "2024-01-10",
      time: "14:00",
      status: "pending",
      price: 800,
      totalPrice: 920, // 800 * 1.15
      isPaid: false,
      userLocation: "Adenta, Accra",
      liveLocationLink: "https://maps.app.goo.gl/example2",
      callerLine: "+233551234567",
      userConfirmed: false,
      modelConfirmed: false,
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
    },
    {
      id: "b4",
      modelId: "m1",
      modelName: "ModelSarah",
      date: "2024-07-15",
      time: "16:00",
      status: "accepted",
      price: 1500,
      totalPrice: 1725,
      isPaid: true,
      userLocation: "Tema Community 1",
      liveLocationLink: "https://maps.app.goo.gl/example3",
      callerLine: "+233201234567",
      userConfirmed: false,
      modelConfirmed: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: "b5",
      modelId: "m1",
      modelName: "ModelSarah",
      date: "2024-07-18",
      time: "11:00",
      status: "user_cancelled",
      price: 1500,
      totalPrice: 1725,
      isPaid: true,
      userLocation: "Kumasi, Ashanti Region",
      liveLocationLink: "https://maps.app.goo.gl/example4",
      callerLine: "+233271234567",
      userConfirmed: false,
      modelConfirmed: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
  ],
  following: 12,
}

export const DUMMY_MODELS = [
  {
    id: "m1",
    name: "Alice Wonderland",
    username: "alice_w",
    bodyType: "Athletic",
    region: "Accra, Ghana",
    pricePerHour: 1500, // Model's net price in GHS
    isOnline: true,
    coordinates: { lat: 5.6037, lon: -0.187 }, // Accra
    avatarUrl: "/placeholder.svg?height=50&width=50",
  },
  {
    id: "m2",
    name: "Bob The Builder",
    username: "bob_b",
    bodyType: "Curvy",
    region: "Kumasi, Ghana",
    pricePerHour: 2000,
    isOnline: false,
    coordinates: { lat: 6.6885, lon: -1.6244 }, // Kumasi
    avatarUrl: "/placeholder.svg?height=50&width=50",
  },
  {
    id: "m3",
    name: "Charlie Chaplin",
    username: "charlie_c",
    bodyType: "Slim",
    region: "Accra, Ghana",
    pricePerHour: 1000,
    isOnline: true,
    coordinates: { lat: 5.61, lon: -0.19 }, // Near Accra
    avatarUrl: "/placeholder.svg?height=50&width=50",
  },
  {
    id: "m4",
    name: "Diana Prince",
    username: "diana_p",
    bodyType: "Average",
    region: "Tema, Ghana",
    pricePerHour: 1800,
    isOnline: true,
    coordinates: { lat: 5.675, lon: 0.0 }, // Tema
    avatarUrl: "/placeholder.svg?height=50&width=50",
  },
  {
    id: "m5",
    name: "Eve Harrington",
    username: "eve_h",
    bodyType: "Athletic",
    region: "Accra, Ghana",
    pricePerHour: 1600,
    isOnline: true,
    coordinates: { lat: 5.59, lon: -0.2 }, // Near Accra
    avatarUrl: "/placeholder.svg?height=50&width=50",
  },
]

export const DUMMY_MODEL_DATA = {
  id: "m1", // This model's ID
  username: "model_sarah",
  earnings: 52000, // Adjusted for GHS
  pricePerHour: 1500, // Model's net price in GHS
  profilePictureUrl: "/placeholder.svg?height=150&width=150",
  followers: 1500,
  bookings: [
    {
      id: "bk1",
      userId: "userA_id",
      userName: "UserA",
      date: "2024-07-20",
      time: "14:00",
      status: "pending",
      userGPS: "geo:5.6037,-0.187", // Accra
      userLocation: "UserA's Home Address, Accra",
      liveLocationLink: "https://maps.app.goo.gl/userA_live",
      callerLine: "+233241234567",
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
      isPaid: true,
      totalPrice: 1725, // 1500 * 1.15
      userConfirmed: false,
      modelConfirmed: false,
    },
    {
      id: "bk2",
      userId: "userB_id",
      userName: "UserB",
      date: "2024-07-22",
      time: "10:00",
      status: "accepted",
      userGPS: "geo:6.6885,-1.6244", // Kumasi
      userLocation: "UserB's Office, Kumasi",
      liveLocationLink: "https://maps.app.goo.gl/userB_live",
      callerLine: "+233551234567",
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      isPaid: true,
      totalPrice: 2300, // 2000 * 1.15 (assuming model's base price was 2000)
      userConfirmed: false,
      modelConfirmed: false,
    },
    {
      id: "bk3",
      userId: "userC_id",
      userName: "UserC",
      date: "2024-07-25",
      time: "16:00",
      status: "pending",
      userGPS: "geo:5.675,0.000", // Tema
      userLocation: "UserC's Cafe, Tema",
      liveLocationLink: "https://maps.app.goo.gl/userC_live",
      callerLine: "+233201234567",
      createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(), // 40 mins ago (should be auto-cancelled)
      isPaid: false,
      totalPrice: 1150, // 1000 * 1.15
      userConfirmed: false,
      modelConfirmed: false,
    },
    {
      id: "bk4",
      userId: "userD_id",
      userName: "UserD",
      date: "2024-07-28",
      time: "11:00",
      status: "user_cancelled", // Example of user cancelled
      userGPS: "geo:5.6037,-0.187",
      userLocation: "UserD's Studio, Accra",
      liveLocationLink: "https://maps.app.goo.gl/userD_live",
      callerLine: "+233271112222",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      isPaid: true,
      totalPrice: 2070, // 1800 * 1.15
      userConfirmed: false,
      modelConfirmed: false,
    },
  ],
}
