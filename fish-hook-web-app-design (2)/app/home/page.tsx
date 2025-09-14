"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PostCard } from "@/components/post-card"
import { CreatePostForm } from "@/components/create-post-form"
import Link from "next/link"
import { DUMMY_MODEL_DATA } from "@/lib/dummy-data" // Import dummy data

interface Comment {
  id: string
  username: string
  content: string
}

interface Post {
  id: string
  username: string
  avatarUrl: string
  content: string
  imageUrl?: string
  videoUrl?: string // Added videoUrl
  likes: number
  comments: number // Total comment count
  commentsList: Comment[] // List of actual comments
  authorId: string // Added authorId
  authorType: "user" | "model" // Added authorType
}

export default function HomePage() {
  const [userType, setUserType] = useState<"user" | "model" | null>(null)
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      username: "ModelSarah",
      avatarUrl: "/placeholder.svg?height=40&width=40",
      content: "Had a fantastic photoshoot today! Feeling great.",
      imageUrl: "/placeholder.svg?height=300&width=500",
      likes: 120,
      comments: 2,
      commentsList: [
        { id: "c1", username: "UserFan1", content: "Amazing shots, Sarah!" },
        { id: "c2", username: "PhotogPro", content: "The lighting is perfect!" },
      ],
      authorId: "m1", // Example model ID
      authorType: "model",
    },
    {
      id: "2",
      username: "UserAlex",
      avatarUrl: "/placeholder.svg?height=40&width=40",
      content: "Loving the new FishHook app! So many cool people.",
      likes: 45,
      comments: 1,
      commentsList: [{ id: "c3", username: "AppLover", content: "Me too! It's awesome." }],
      authorId: "userA_id", // Example user ID
      authorType: "user",
    },
    {
      id: "3",
      username: "InfluencerMike",
      avatarUrl: "/placeholder.svg?height=40&width=40",
      content: "Just finished a live stream. Thanks for tuning in!",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Example video URL
      likes: 88,
      comments: 0,
      commentsList: [],
      authorId: "m3", // Example model ID
      authorType: "model",
    },
  ])
  const router = useRouter()

  useEffect(() => {
    const storedUserType = localStorage.getItem("fishhook_user_type") as "user" | "model" | null
    if (!storedUserType) {
      // If no user type is found, redirect to signup
      router.push("/auth/signup")
    } else {
      setUserType(storedUserType)
    }
  }, [router])

  const handleCreatePost = (content: string, imageUrl?: string, videoUrl?: string) => {
    const newPost: Post = {
      id: String(posts.length + 1),
      username: DUMMY_MODEL_DATA.username, // Use dummy model's username
      avatarUrl: DUMMY_MODEL_DATA.profilePictureUrl, // Use dummy model's avatar
      content,
      imageUrl,
      videoUrl,
      likes: 0,
      comments: 0,
      commentsList: [], // New posts start with no comments
      authorId: DUMMY_MODEL_DATA.id, // Assign current model's ID
      authorType: "model", // Posts are created by models
    }
    setPosts([newPost, ...posts]) // Add new post to the top
  }

  if (userType === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <p>Loading user data...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-transparent p-4">
      <header className="flex w-full max-w-xl items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <img src="/images/fishhook-logo.jpeg" alt="FishHook Logo" className="h-8 w-8 object-contain" />
          <h1 className="text-3xl font-bold text-primary">FishHook</h1>
        </div>
        <div className="flex gap-2">
          {userType === "user" && (
            <Button
              asChild
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
            >
              <Link href="/search">Search Models</Link>
            </Button>
          )}
          <Button
            asChild
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
          >
            <Link href={`/profile/${userType}`}>Profile</Link>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.removeItem("fishhook_user_type")
              router.push("/auth/signup")
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="flex w-full max-w-xl flex-col items-center gap-6 py-8">
        {userType === "model" && <CreatePostForm onCreatePost={handleCreatePost} />}

        <h2 className="text-2xl font-semibold text-foreground">Feed</h2>
        {posts.map((post) => (
          <PostCard key={post.id} {...post} userRole={userType} />
        ))}
      </main>
    </div>
  )
}
