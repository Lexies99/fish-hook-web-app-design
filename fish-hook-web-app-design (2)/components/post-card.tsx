"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { HeartIcon, MessageCircleIcon, Share2Icon } from "lucide-react"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import Link from "next/link" // Import Link

interface Comment {
  id: string
  username: string
  content: string
}

interface PostCardProps {
  username: string
  avatarUrl: string
  content: string
  imageUrl?: string
  videoUrl?: string // Added videoUrl
  likes: number
  comments: number // Total comment count
  commentsList: Comment[] // List of actual comments
  userRole: "user" | "model" // To conditionally render buttons
  authorId: string // Added authorId
  authorType: "user" | "model" // Added authorType
}

export function PostCard({
  username,
  avatarUrl,
  content,
  imageUrl,
  videoUrl,
  likes,
  comments,
  commentsList, // Destructure new prop
  userRole,
  authorId, // Destructure new props
  authorType, // Destructure new props
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [currentComments, setCurrentComments] = useState<Comment[]>(commentsList) // State for comments

  const profileLink = `/profile/${authorType}/${authorId}`

  const handlePostComment = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: String(currentComments.length + 1), // Simple ID generation
        username: userRole === "user" ? "CurrentUser" : "CurrentModel", // Replace with actual logged-in user/model
        content: commentText.trim(),
      }
      setCurrentComments((prevComments) => [...prevComments, newComment])
      setCommentText("")
      // In a real app, you'd send this to a server and update the comments count
    }
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2">
        <Link href={profileLink} className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} />
            <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="font-semibold">{username}</div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="mb-4">{content}</p>
        {videoUrl && ( // Render video if videoUrl exists
          <video width="100%" controls className="mb-4 rounded-md">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
        {!videoUrl &&
          imageUrl && ( // Render image only if no videoUrl is present
            <img src={imageUrl || "/placeholder.svg"} alt="Post image" className="w-full rounded-md object-cover" />
          )}
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => setIsLiked(!isLiked)}>
            <HeartIcon className={cn("h-4 w-4", isLiked && "fill-primary text-primary")} /> {likes + (isLiked ? 1 : 0)}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircleIcon className="h-4 w-4" /> {currentComments.length}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => alert("Share functionality coming soon!")}
        >
          <Share2Icon className="h-4 w-4" /> Share
        </Button>
      </CardFooter>
      {showComments && (
        <CardFooter className="flex flex-col items-start p-4 pt-0">
          <div className="w-full space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={2}
              className="w-full"
            />
            <Button size="sm" className="w-full" onClick={handlePostComment} disabled={!commentText.trim()}>
              Post Comment
            </Button>
          </div>
          <div className="mt-4 w-full space-y-3 text-sm">
            {currentComments.length > 0 ? (
              currentComments.map((comment) => (
                <div key={comment.id} className="border-t pt-3">
                  <span className="font-semibold">{comment.username}:</span> {comment.content}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
