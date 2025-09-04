"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { useHPOAuth } from "@/contexts/hpo-auth-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SupportChat } from "@/components/support-chat"
import { 
  Crown, 
  Star, 
  Users, 
  Video, 
  BookOpen, 
  Target, 
  Zap, 
  Shield, 
  Globe, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Store
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function PremiumPage() {
  const { t } = useLanguage()
  const { isAuthenticated, player } = useHPOAuth()
  const [activeTab, setActiveTab] = useState<'personal' | 'organization'>('personal')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Personal form state
  const [personalForm, setPersonalForm] = useState({
    name: '',
    email: ''
  })
  
  // Organization form state
  const [orgForm, setOrgForm] = useState({
    name: '',
    email: ''
  })

  const personalFeatures = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "More Lesson Contents",
      description: "Access to expanded library of educational content and lessons"
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Video Creation Tools",
      description: "Create and share educational videos with built-in tools"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Auto Pairing with Gamers",
      description: "Automatically match with other players for enhanced gaming experience"
    }
  ]

  const organizationFeatures = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Customized Content",
      description: "Tailored educational content for your organization's needs"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Community Easy Access",
      description: "Simplified access to community features and collaboration tools"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Promotion in Game Boards",
      description: "Enhanced visibility and promotion opportunities within game platforms"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Enhanced Lessons",
      description: "Advanced lesson features and interactive content"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Personalized Ishema Ryange Games",
      description: "Custom games and lessons designed specifically for your organization"
    }
  ]

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Console log the data
    console.log('Personal Premium Request:', {
      name: personalForm.name,
      email: personalForm.email,
      timestamp: new Date().toISOString()
    })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success("Thank you! HPO Rwanda will reach out to you soon via email or phone.")
    setPersonalForm({ name: '', email: '' })
    setIsSubmitting(false)
  }

  const handleOrganizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Console log the data
    console.log('Organization Premium Request:', {
      name: orgForm.name,
      email: orgForm.email,
      timestamp: new Date().toISOString()
    })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success("Thank you! HPO Rwanda will reach out to your organization soon via email or phone.")
    setOrgForm({ name: '', email: '' })
    setIsSubmitting(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="default" />
      
      <main className="flex-1 bg-gradient-to-b from-green-50 to-white">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-center mb-6"
              >
                <Crown className="h-12 w-12 text-yellow-500 mr-3" />
                <h1 className="text-4xl font-bold text-gray-900">Premium Features</h1>
              </motion.div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Unlock advanced features and personalized experiences for both individuals and organizations
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-12">
              <div className="bg-white rounded-lg p-1 shadow-lg">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`px-6 py-3 rounded-md font-medium transition-all ${
                    activeTab === 'personal'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Personal
                </button>
                <button
                  onClick={() => setActiveTab('organization')}
                  className={`px-6 py-3 rounded-md font-medium transition-all ${
                    activeTab === 'organization'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Organization
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {(activeTab === 'personal' ? personalFeatures : organizationFeatures).map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-green-100 p-3 rounded-lg mr-4">
                          {feature.icon}
                        </div>
                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                      </div>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center">
                    <Store className="h-6 w-6 mr-2 text-green-600" />
                    Get Premium Access
                  </CardTitle>
                  <CardDescription>
                    {activeTab === 'personal' 
                      ? 'Submit your details to get started with personal premium features'
                      : 'Submit your organization details to get started with organization premium features'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={activeTab === 'personal' ? handlePersonalSubmit : handleOrganizationSubmit}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">
                          {activeTab === 'personal' ? 'Your Name' : 'Organization Name'}
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={activeTab === 'personal' ? personalForm.name : orgForm.name}
                          onChange={(e) => {
                            if (activeTab === 'personal') {
                              setPersonalForm({ ...personalForm, name: e.target.value })
                            } else {
                              setOrgForm({ ...orgForm, name: e.target.value })
                            }
                          }}
                          placeholder={activeTab === 'personal' ? 'Enter your full name' : 'Enter organization name'}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={activeTab === 'personal' ? personalForm.email : orgForm.email}
                          onChange={(e) => {
                            if (activeTab === 'personal') {
                              setPersonalForm({ ...personalForm, email: e.target.value })
                            } else {
                              setOrgForm({ ...orgForm, email: e.target.value })
                            }
                          }}
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            Submit Request <ArrowRight className="ml-2 h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

          </div>
        </section>
      </main>
      
      <Footer />
      <SupportChat />
    </div>
  )
}
