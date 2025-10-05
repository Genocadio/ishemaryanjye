"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"
import { Mail, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface ContactFormData {
  requestType: "person" | "organization"
  name: string
  district: string
  sector: string
  street: string
  email: string
  phone: string
  notes: string
  agreeToTerms: boolean
}

export function ContactForm() {
  const { t } = useLanguage()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<ContactFormData>({
    requestType: "person",
    name: "",
    district: "",
    sector: "",
    street: "",
    email: "",
    phone: "",
    notes: "",
    agreeToTerms: false
  })

  const handleInputChange = (field: keyof ContactFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!formData.agreeToTerms) {
      toast.error(t("contact.form.termsRequired"))
      return
    }

    if (!formData.name || !formData.district || !formData.sector || !formData.email) {
      toast.error(t("contact.form.requiredFields"))
      return
    }

    setIsSubmitting(true)

    try {
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
      
      if (!accessKey || accessKey === "your_access_key_here") {
        toast.error("Form configuration error. Please contact support.")
        console.error("Web3Forms access key not configured. Please set NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY in .env.local")
        return
      }

      // Create clean data object excluding agreeToTerms and empty fields
      const cleanData: Record<string, string> = {
        requestType: formData.requestType === "person" ? "Individual" : "Organization",
        name: formData.name,
        district: formData.district,
        sector: formData.sector,
        email: formData.email
      }

      // Only add optional fields if they have values
      if (formData.street.trim()) {
        cleanData.street = formData.street
      }
      if (formData.phone.trim()) {
        cleanData.phone = formData.phone
      }
      if (formData.notes.trim()) {
        cleanData.notes = formData.notes
      }

      const submitData = {
        ...cleanData,
        access_key: accessKey,
        subject: `Physical Ishema Ryanjye Cards Request - ${cleanData.requestType}`,
        message: `
Dear Ishema Ryanjye Team,

I am writing to request physical copies of the Ishema Ryanjye card game for educational and personal use.

REQUEST DETAILS:
${Object.entries(cleanData)
  .filter(([key]) => key !== 'access_key' && key !== 'subject')
  .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
  .join('\n')}

I understand and agree that these cards will be used for personal, teaching, or leisure purposes only, and not for commercial use.

Thank you for your consideration.

Best regards,
${cleanData.name}
        `.trim()
      }

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()
      
      if (result.success) {
        setIsSubmitted(true)
        toast.success(t("contact.form.success"))
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            requestType: "person",
            name: "",
            district: "",
            sector: "",
            street: "",
            email: "",
            phone: "",
            notes: "",
            agreeToTerms: false
          })
          setIsSubmitted(false)
          setIsDialogOpen(false)
        }, 3000)
      } else {
        toast.error(t("contact.form.error"))
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error(t("contact.form.error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            {t("contact.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              {t("contact.form.submitted")}
            </h3>
            <p className="text-gray-600">
              {t("contact.form.submittedMessage")}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <Mail className="h-5 w-5" />
          {t("contact.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-6">{t("contact.description")}</p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              {t("contact.button")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[80vw] sm:w-[80vw] max-h-[90vh] h-[90vh] sm:max-h-[85vh] sm:h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold mb-4 text-green-600">
                {t("contact.form.title")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Request Type */}
              <div className="space-y-2">
                <Label className="text-base font-medium">{t("contact.form.requestType")}</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="requestType"
                      value="person"
                      checked={formData.requestType === "person"}
                      onChange={(e) => handleInputChange("requestType", e.target.value as "person" | "organization")}
                      className="text-green-600"
                    />
                    <span>{t("contact.form.person")}</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="requestType"
                      value="organization"
                      checked={formData.requestType === "organization"}
                      onChange={(e) => handleInputChange("requestType", e.target.value as "person" | "organization")}
                      className="text-green-600"
                    />
                    <span>{t("contact.form.organization")}</span>
                  </label>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium">
                  {formData.requestType === "person" ? t("contact.form.fullName") : t("contact.form.organizationName")} *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={formData.requestType === "person" ? t("contact.form.fullNamePlaceholder") : t("contact.form.organizationNamePlaceholder")}
                  required
                />
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-base font-medium">
                    {t("contact.form.district")} *
                  </Label>
                  <Input
                    id="district"
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                    placeholder={t("contact.form.districtPlaceholder")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector" className="text-base font-medium">
                    {t("contact.form.sector")} *
                  </Label>
                  <Input
                    id="sector"
                    type="text"
                    value={formData.sector}
                    onChange={(e) => handleInputChange("sector", e.target.value)}
                    placeholder={t("contact.form.sectorPlaceholder")}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street" className="text-base font-medium">
                  {t("contact.form.street")}
                </Label>
                <Input
                  id="street"
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange("street", e.target.value)}
                  placeholder={t("contact.form.streetPlaceholder")}
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">
                    {t("contact.form.email")} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder={t("contact.form.emailPlaceholder")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-medium">
                    {t("contact.form.phone")}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder={t("contact.form.phonePlaceholder")}
                  />
                </div>
              </div>

              {/* Notes Field */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base font-medium">
                  {t("contact.form.notes")}
                </Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder={t("contact.form.notesPlaceholder")}
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                />
              </div>

              {/* Terms Agreement */}
              <div className="space-y-2">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                    className="mt-1 text-green-600"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    {t("contact.form.termsAgreement")}
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  {t("contact.form.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("contact.form.submitting")}
                    </>
                  ) : (
                    t("contact.form.submit")
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
