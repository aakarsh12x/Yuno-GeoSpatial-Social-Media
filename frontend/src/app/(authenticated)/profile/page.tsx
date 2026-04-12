'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Heart, 
  BookOpen, 
  Languages, 
  Award, 
  Music, 
  Save,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    username: '',
    age: '',
    city: '',
    latitude: '',
    longitude: '',
    
    // Core Matching Info
    school: '',
    workplace: '',
    profession: '',
    hobbies: [] as string[],
    bio: '',
    
    // Optional Info
    languages: '',
    skills: '',
    clubs: '',
    favoriteShows: '',
    favoriteMovies: '',
    favoriteMusic: ''
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Auto-detect location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }))
          // You can add reverse geocoding here to get city name
        },
        (error) => {
          console.log('Location access denied:', error)
        }
      )
    }
  }, [])

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleHobbyToggle = (hobby: string) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobby)
        ? prev.hobbies.filter(h => h !== hobby)
        : [...prev.hobbies, hobby]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Profile data:', formData)
    setIsLoading(false)
    // Handle profile update logic here
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
        <User className="w-6 h-6 text-primary" />
        Basic Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 border border-border-medium rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Username *
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className="w-full px-4 py-3 border border-border-medium rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Choose a username"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Age *
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className="w-full px-4 py-3 border border-border-medium rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your age"
            min="13"
            max="100"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            City *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full px-4 py-3 border border-border-medium rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your city"
            required
          />
        </div>
      </div>
      
      <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2 text-sm text-primary">
          <MapPin className="w-4 h-4" />
          <span>Location detected automatically for nearby radius matching</span>
        </div>
      </div>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
        <Heart className="w-6 h-6 text-primary" />
        Core Matching Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            School/College
          </label>
          <input
            type="text"
            value={formData.school}
            onChange={(e) => handleInputChange('school', e.target.value)}
            className="w-full px-4 py-3 border border-border-medium rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Where do you study?"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Workplace
          </label>
          <input
            type="text"
            value={formData.workplace}
            onChange={(e) => handleInputChange('workplace', e.target.value)}
            className="w-full px-4 py-3 border border-border-medium rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Where do you work?"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Profession
          </label>
          <input
            type="text"
            value={formData.profession}
            onChange={(e) => handleInputChange('profession', e.target.value)}
            className="w-full px-4 py-3 border border-border-medium rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="What do you do?"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Hobbies & Interests *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Music', 'Sports', 'Reading', 'Gaming', 'Fitness', 'Cooking', 'Travel', 'Art', 'Photography', 'Dancing', 'Writing', 'Technology'].map((hobby) => (
            <button
              key={hobby}
              type="button"
              onClick={() => handleHobbyToggle(hobby)}
              className={`p-3 rounded-lg border transition-all ${
                formData.hobbies.includes(hobby)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface border-border-medium text-text-secondary hover:border-primary/50'
              }`}
            >
              {hobby}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Bio *
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-border-medium rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
          placeholder="Tell us about yourself in a few words..."
          required
        />
      </div>
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
        <Award className="w-6 h-6 text-primary" />
        Additional Information (Optional)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Languages
          </label>
          <input
            type="text"
            value={formData.languages}
            onChange={(e) => handleInputChange('languages', e.target.value)}
            className="w-full px-4 py-3 border border-border-medium rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="e.g., English, Spanish, French"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Skills / Field of Study
          </label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => handleInputChange('skills', e.target.value)}
            className="w-full px-4 py-3 border border-border-medium rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="e.g., Programming, Marketing, Medicine"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Clubs / Societies
          </label>
          <input
            type="text"
            value={formData.clubs}
            onChange={(e) => handleInputChange('clubs', e.target.value)}
            className="w-full px-4 py-3 border border-border-medium rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="e.g., Chess Club, Debate Team"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Favorite Shows
          </label>
          <input
            type="text"
            value={formData.favoriteShows}
            onChange={(e) => handleInputChange('favoriteShows', e.target.value)}
            className="w-full px-4 py-3 border border-border-medium rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="e.g., Breaking Bad, Friends, The Office"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Favorite Movies
          </label>
          <input
            type="text"
            value={formData.favoriteMovies}
            onChange={(e) => handleInputChange('favoriteMovies', e.target.value)}
            className="w-full px-4 py-3 border border-border-medium rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="e.g., Inception, The Godfather, Pulp Fiction"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Favorite Music
          </label>
          <input
            type="text"
            value={formData.favoriteMusic}
            onChange={(e) => handleInputChange('favoriteMusic', e.target.value)}
            className="w-full px-4 py-3 border border-border-medium rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="e.g., Rock, Pop, Jazz, Hip-Hop"
          />
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-2">
            Complete Your Profile
          </h1>
          <p className="text-text-secondary text-lg">
            Help us find the perfect connections by sharing a bit about yourself
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Step {currentStep} of 3</span>
            <span className="text-sm text-text-secondary">{Math.round((currentStep / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-border-medium rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card-surface p-6 md:p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-medium">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg border transition-all ${
                currentStep === 1
                  ? 'border-border-medium text-text-muted cursor-not-allowed'
                  : 'border-primary text-primary hover:bg-primary hover:text-white'
              }`}
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
