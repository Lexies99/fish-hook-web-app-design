"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { getDistance } from "@/lib/utils" // Import the distance utility
import { MapPinIcon, DollarSignIcon, RulerIcon } from "lucide-react"
import Link from "next/link"
import { DUMMY_MODELS } from "@/lib/dummy-data" // Import DUMMY_MODELS

interface Model {
  id: string
  name: string
  username: string
  bodyType: string
  region: string
  pricePerHour: number // Model's net price
  isOnline: boolean
  coordinates: { lat: number; lon: number }
  avatarUrl: string
}

export default function SearchPage() {
  const [userType, setUserType] = useState<"user" | "model" | null>(null)
  const router = useRouter()

  const [searchName, setSearchName] = useState("")
  const [searchBodyType, setSearchBodyType] = useState("")
  const [searchRegion, setSearchRegion] = useState("")
  const [searchPrice, setSearchPrice] = useState("")
  const [searchResults, setSearchResults] = useState<Model[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isSearchingRandom, setIsSearchingRandom] = useState(false)

  useEffect(() => {
    const storedUserType = localStorage.getItem("fishhook_user_type") as "user" | "model" | null
    if (storedUserType !== "user") {
      // Only users can access this page
      router.push("/home")
    } else {
      setUserType(storedUserType)
    }
  }, [router])

  useEffect(() => {
    // Initial search or when filters change
    handleSearch()
  }, [searchName, searchBodyType, searchRegion, searchPrice]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    setIsSearchingRandom(false)
    const filtered = DUMMY_MODELS.filter((model) => {
      const nameMatch = searchName
        ? model.name.toLowerCase().includes(searchName.toLowerCase()) ||
          model.username.toLowerCase().includes(searchName.toLowerCase())
        : true
      const bodyTypeMatch = searchBodyType === "any" ? true : searchBodyType ? model.bodyType === searchBodyType : true
      const regionMatch = searchRegion ? model.region.toLowerCase().includes(searchRegion.toLowerCase()) : true
      const priceMatch = searchPrice ? model.pricePerHour * 1.15 <= Number.parseFloat(searchPrice) : true // Use marked-up price for search
      return nameMatch && bodyTypeMatch && regionMatch && priceMatch
    })
    setSearchResults(filtered)
  }

  const handleRandomSearch = () => {
    setIsSearchingRandom(true)
    setLocationError(null)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lon: longitude })

          const nearbyModels = DUMMY_MODELS.filter((model) => {
            if (!model.isOnline) return false // Only online models
            const distance = getDistance(latitude, longitude, model.coordinates.lat, model.coordinates.lon)
            return distance <= 30 // Within 30km radius
          })
          setSearchResults(nearbyModels)
        },
        (error) => {
          console.error("Geolocation error:", error)
          setLocationError("Unable to retrieve your location. Please enable GPS and try again.")
          setSearchResults([])
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    } else {
      setLocationError("Geolocation is not supported by your browser.")
      setSearchResults([])
    }
  }

  if (userType === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Loading user data...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-transparent p-4">
      <header className="flex w-full max-w-3xl items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <img src="/images/fishhook-logo.jpeg" alt="FishHook Logo" className="h-8 w-8 object-contain" />
          <h1 className="text-3xl font-bold text-primary">FishHook - Search Models</h1>
        </div>
        <Button asChild variant="ghost" onClick={() => router.push("/home")}>
          <Link href="/home">Back to Home</Link>
        </Button>
      </header>

      <main className="w-full max-w-3xl space-y-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Search by Filters</CardTitle>
            <CardDescription>Find models by name, body type, region, or price.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Model Name/Username"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <Select value={searchBodyType} onValueChange={setSearchBodyType}>
              <SelectTrigger>
                <SelectValue placeholder="Body Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Body Type</SelectItem>
                <SelectItem value="Athletic">Athletic</SelectItem>
                <SelectItem value="Curvy">Curvy</SelectItem>
                <SelectItem value="Slim">Slim</SelectItem>
                <SelectItem value="Average">Average</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Region (e.g., Accra)"
              value={searchRegion}
              onChange={(e) => setSearchRegion(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max Price/Hour (GHS)"
              value={searchPrice}
              onChange={(e) => setSearchPrice(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Random Search (Online & Nearby)</CardTitle>
            <CardDescription>Find online models within 30km of your current location.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRandomSearch} className="w-full" disabled={isSearchingRandom}>
              {isSearchingRandom ? "Searching..." : "Search Nearby Models"}
            </Button>
            {locationError && <p className="mt-2 text-sm text-destructive">{locationError}</p>}
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold text-foreground">Search Results</h2>
        {searchResults.length === 0 && !isSearchingRandom && (
          <p className="text-center text-muted-foreground">No models found matching your criteria.</p>
        )}
        {searchResults.length === 0 && isSearchingRandom && !locationError && (
          <p className="text-center text-muted-foreground">No online models found within 30km radius.</p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((model) => (
            <Card key={model.id} className="flex flex-col items-center p-4 text-center">
              <img
                src={model.avatarUrl || "/placeholder.svg"}
                alt={model.name}
                className="mb-3 h-20 w-20 rounded-full object-cover"
              />
              <h3 className="text-lg font-semibold">{model.name}</h3>
              <p className="text-sm text-muted-foreground">@{model.username}</p>
              <div className="mt-2 space-y-1 text-sm">
                <p className="flex items-center gap-1">
                  <RulerIcon className="h-4 w-4 text-primary" /> {model.bodyType}
                </p>
                <p className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4 text-primary" /> {model.region}
                </p>
                <p className="flex items-center gap-1">
                  <DollarSignIcon className="h-4 w-4 text-primary" /> ₵{(model.pricePerHour * 1.15).toFixed(2)}/hr (User
                  Price)
                </p>
                <p className={`font-medium ${model.isOnline ? "text-green-600" : "text-destructive"}`}>
                  {model.isOnline ? "Online" : "Offline"}
                </p>
              </div>
              <Button asChild className="mt-4 w-full">
                <Link href={`/profile/model/${model.id}`}>Book Now</Link>
              </Button>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
