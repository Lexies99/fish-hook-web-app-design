"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react" // Import useRef and useEffect
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CreatePostFormProps {
  onCreatePost: (content: string, imageUrl?: string, videoUrl?: string) => void // Updated prop
}

export function CreatePostForm({ onCreatePost }: CreatePostFormProps) {
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null) // State for image file
  const [videoFile, setVideoFile] = useState<File | null>(null) // State for video file
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>(undefined)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | undefined>(undefined)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Effect to create and revoke object URLs for image preview
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      setImagePreviewUrl(url)
      return () => URL.revokeObjectURL(url) // Clean up on unmount or file change
    } else {
      setImagePreviewUrl(undefined)
    }
  }, [imageFile])

  // Effect to create and revoke object URLs for video preview
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile)
      setVideoPreviewUrl(url)
      return () => URL.revokeObjectURL(url) // Clean up on unmount or file change
    } else {
      setVideoPreviewUrl(undefined)
    }
  }, [videoFile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim() || imageFile || videoFile) {
      onCreatePost(content, imagePreviewUrl, videoPreviewUrl) // Pass preview URLs
      setContent("")
      setImageFile(null)
      setVideoFile(null)
      if (imageInputRef.current) imageInputRef.current.value = "" // Clear file input
      if (videoInputRef.current) videoInputRef.current.value = "" // Clear file input
    }
  }

  const isFormEmpty = !content.trim() && !imageFile && !videoFile

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-primary">Create New Post</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Image (Optional)
            </label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
              ref={imageInputRef}
            />
            {imagePreviewUrl && (
              <img
                src={imagePreviewUrl || "/placeholder.svg"}
                alt="Image preview"
                className="mt-2 w-full h-48 object-cover rounded-md"
              />
            )}
          </div>
          <div>
            <label htmlFor="video-upload" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Video (Optional, max 1 min)
            </label>
            <Input
              id="video-upload"
              type="file"
              accept="video/mp4,video/webm"
              onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)}
              ref={videoInputRef}
            />
            {videoPreviewUrl && (
              <video controls src={videoPreviewUrl} className="mt-2 w-full h-48 object-cover rounded-md" />
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isFormEmpty}>
            Post
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
