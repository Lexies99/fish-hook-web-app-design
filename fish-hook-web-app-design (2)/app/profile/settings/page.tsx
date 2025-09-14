import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SettingsIcon } from "lucide-react"

export default function AccountSettingsPage() {
  return (
    <div className="w-full max-w-2xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/fishhook-logo.jpeg" alt="FishHook Logo" className="h-8 w-8 object-contain" />
            <SettingsIcon className="h-6 w-6 text-primary" />
            <CardTitle className="text-primary">Account Settings</CardTitle>
          </div>
          <Button asChild variant="ghost">
            <Link href="/profile/user">Back to Profile</Link>{" "}
            {/* This link will need dynamic adjustment in a real app */}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>Manage your account preferences and privacy settings here.</CardDescription>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">General Settings</h3>
            <p className="text-muted-foreground">
              This is a placeholder for general account settings like email preferences, notifications, etc.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Privacy Settings</h3>
            <p className="text-muted-foreground">
              This is a placeholder for privacy-related settings like data sharing, profile visibility, etc.
            </p>
          </div>
          <Button className="w-full">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}
