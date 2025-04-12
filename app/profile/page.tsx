"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, User, Mail, Phone, AtSign, Save } from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    profilePicture: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth")
    } else if (status === "authenticated") {
      fetchProfileData()
    }
  }, [status, router])

  const fetchProfileData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/profile")
      if (!response.ok) {
        throw new Error("Failed to fetch profile data")
      }
      const data = await response.json()
      setProfileData({
        name: data.name || "",
        email: data.email || "",
        username: data.username || "",
        phone: data.phone || "",
        profilePicture: data.profilePicture || "",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsLoading(true)
        const formData = new FormData()
        formData.append("file", file)
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error("Failed to upload image")
        }
        
        const data = await response.json()
        setProfileData((prev) => ({
          ...prev,
          profilePicture: data.url,
        }))
        toast.success("Profile picture updated successfully")
      } catch (error) {
        console.error("Error uploading image:", error)
        toast.error("Failed to upload profile picture")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      console.log('Updating profile with data:', profileData) // Debug log

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Profile update failed:', data) // Debug log
        throw new Error(data.error || "Failed to update profile")
      }

      console.log('Profile updated successfully:', data) // Debug log
      setProfileData(data)
      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 w-full">
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <p className="text-gray-500">View and edit your personal information</p>
      </div>

      <div className="grid md:grid-cols-[1fr_2fr] gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="w-32 h-32 border-4 border-green-100">
                {profileData.profilePicture ? (
                  <AvatarImage src={profileData.profilePicture} alt={profileData.name} />
                ) : (
                  <AvatarFallback className="bg-green-100 text-green-800 text-4xl">
                    {profileData.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              {isEditing && (
                <label
                  htmlFor="profile-picture"
                  className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    id="profile-picture"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                  />
                </label>
              )}
            </div>
            <div className="text-center">
              <h3 className="font-medium text-lg">{profileData.name}</h3>
              <p className="text-gray-500 text-sm">@{profileData.username}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? "" : "bg-green-600 hover:bg-green-700"}
              disabled={isLoading}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                disabled={!isEditing || isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profileData.email}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center">
                <AtSign className="h-4 w-4 mr-2 text-gray-400" />
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={profileData.username}
                onChange={handleInputChange}
                disabled={!isEditing || isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                disabled={!isEditing || isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            {isEditing && (
              <Button 
                onClick={handleSave} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
    </main>
    <Footer />
    </div>
  )
}
