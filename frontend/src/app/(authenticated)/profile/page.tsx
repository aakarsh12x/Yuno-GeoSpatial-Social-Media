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
import { UserAPI } from '@/lib/api'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

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
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { user, loading: authLoading } = useAuth()

  // Fetch complete profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await UserAPI.me()
        if (data.success && data.data.user) {
          const profile = data.data.user
          
          setFormData(prev => ({
            ...prev,
            name: profile.name || '',
            username: profile.username || '',
            age: profile.age ? profile.age.toString() : '',
            city: profile.city || '',
            latitude: profile.latitude?.toString() || '',
            longitude: profile.longitude?.toString() || '',
            school: profile.school || '',
            workplace: profile.workplace || '',
            profession: profile.profession || '',
            hobbies: profile.interests || [],
            bio: profile.bio || '',
            languages: profile.languages?.join(', ') || '',
            skills: profile.skills?.join(', ') || '',
            clubs: profile.clubs?.join(', ') || '',
            favoriteShows: profile.favorite_shows?.join(', ') || '',
            favoriteMovies: profile.favorite_movies?.join(', ') || '',
            favoriteMusic: profile.favorite_music?.join(', ') || ''
          }))

          // If core fields are missing, force edit mode
          if (!profile.name || !profile.city || !profile.bio) {
            setIsEditing(true)
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        toast.error('Failed to load your profile.')
        setIsEditing(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchProfile()
    }
  }, [user, authLoading])

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
    setIsSaving(true)
    
    try {
      // Map frontend fields to backend schema
      const rawPayload = {
        name: formData.name,
        username: formData.username,
        age: formData.age ? parseInt(formData.age) : undefined,
        city: formData.city,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        school: formData.school,
        workplace: formData.workplace,
        profession: formData.profession,
        interests: formData.hobbies,
        bio: formData.bio,
        languages: formData.languages ? formData.languages.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        clubs: formData.clubs ? formData.clubs.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        favorite_shows: formData.favoriteShows ? formData.favoriteShows.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        favorite_movies: formData.favoriteMovies ? formData.favoriteMovies.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        favorite_music: formData.favoriteMusic ? formData.favoriteMusic.split(',').map(s => s.trim()).filter(Boolean) : undefined
      };

      // Remove undefined, null, or empty string values to satisfy Joi validation
      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([_, v]) => v != null && v !== '' && (Array.isArray(v) ? v.length > 0 : true) && !Number.isNaN(v))
      );

      const { data } = await UserAPI.updateProfile(payload)
      
      if (data.success) {
        toast.success('Profile updated successfully!')
        setIsEditing(false) // Switch to view mode
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
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
      <h2 className="text-2xl text-[#231b15] mb-6 flex items-center gap-3 font-display italic font-medium">
        <User className="w-6 h-6 text-[#b5511b]" />
        Basic Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#54433a]/85 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 bg-white/60 border border-[#e0d7d0] rounded-lg text-[#231b15] placeholder-[#54433a]/60 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/45 transition-all"
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-[#54433a]/85 mb-2">
            Username *
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className="w-full px-4 py-3 bg-white/60 border border-[#e0d7d0] rounded-lg text-[#231b15] placeholder-[#54433a]/60 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/45 transition-all"
            placeholder="Choose a username"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-[#54433a]/85 mb-2">
            Age *
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className="w-full px-4 py-3 bg-white/60 border border-[#e0d7d0] rounded-lg text-[#231b15] placeholder-[#54433a]/60 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/45 transition-all"
            placeholder="Enter your age"
            min="13"
            max="100"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-[#54433a]/85 mb-2">
            City *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full px-4 py-3 bg-white/60 border border-[#e0d7d0] rounded-lg text-[#231b15] placeholder-[#54433a]/60 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/45 transition-all"
            placeholder="Enter your city"
            required
          />
        </div>
      </div>
      
      <div className="bg-[#5d4037]/5 p-4 rounded-lg border border-[#5d4037]/15">
        <div className="flex items-center gap-2 text-sm text-[#5d4037] font-medium">
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
      <h2 className="text-2xl text-[#231b15] mb-6 flex items-center gap-3 font-display italic font-medium">
        <Heart className="w-6 h-6 text-[#b5511b]" />
        Core Matching Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#54433a]/85 mb-2">
            School/College
          </label>
          <input
            type="text"
            value={formData.school}
            onChange={(e) => handleInputChange('school', e.target.value)}
            className="w-full px-4 py-3 bg-white/60 border border-[#e0d7d0] rounded-lg text-[#231b15] placeholder-[#54433a]/60 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/45 transition-all"
            placeholder="Where do you study?"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-[#54433a]/85 mb-2">
            Workplace
          </label>
          <input
            type="text"
            value={formData.workplace}
            onChange={(e) => handleInputChange('workplace', e.target.value)}
            className="w-full px-4 py-3 bg-white/60 border border-[#e0d7d0] rounded-lg text-[#231b15] placeholder-[#54433a]/60 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/45 transition-all"
            placeholder="Where do you work?"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-[#54433a]/85 mb-2">
            Profession
          </label>
          <input
            type="text"
            value={formData.profession}
            onChange={(e) => handleInputChange('profession', e.target.value)}
            className="w-full px-4 py-3 bg-white/60 border border-[#e0d7d0] rounded-lg text-[#231b15] placeholder-[#54433a]/60 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/45 transition-all"
            placeholder="What do you do?"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-[#54433a]/85 mb-3">
          Hobbies & Interests *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Music', 'Sports', 'Reading', 'Gaming', 'Fitness', 'Cooking', 'Travel', 'Art', 'Photography', 'Dancing', 'Writing', 'Technology'].map((hobby) => (
            <button
              key={hobby}
              type="button"
              onClick={() => handleHobbyToggle(hobby)}
              className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                formData.hobbies.includes(hobby)
                  ? 'bg-[#b5511b] text-white border-[#b5511b] shadow-sm'
                  : 'bg-white/60 border-[#e0d7d0] text-[#54433a]/80 hover:bg-white hover:border-[#5d4037]/35'
              }`}
            >
              {hobby}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-[#54433a]/85 mb-2">
          Bio *
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-white/60 border border-[#e0d7d0] rounded-lg text-[#231b15] placeholder-[#54433a]/60 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/45 transition-all resize-none"
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
      <h2 className="text-2xl text-[#231b15] mb-6 flex items-center gap-3 font-display italic font-medium">
        <Award className="w-6 h-6 text-[#b5511b]" />
        Additional Information (Optional)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#54433a]/85 mb-2">
            Languages
          </label>
          <input
            type="text"
            value={formData.languages}
            onChange={(e) => handleInputChange('languages', e.target.value)}
            className="w-full px-4 py-3 bg-white/60 border border-[#e0d7d0] rounded-lg text-[#231b15] placeholder-[#54433a]/60 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/45 transition-all"
            placeholder="e.g., English, Spanish, French"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-[#54433a]/85 mb-2">
            Skills / Field of Study
          </label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => handleInputChange('skills', e.target.value)}
            className="w-full px-4 py-3 bg-white/60 border border-[#e0d7d0] rounded-lg text-[#231b15] placeholder-[#54433a]/60 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/45 transition-all"
            placeholder="e.g., Programming, Marketing, Medicine"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-[#54433a]/85 mb-2">
            Clubs / Societies
          </label>
          <input
            type="text"
            value={formData.clubs}
            onChange={(e) => handleInputChange('clubs', e.target.value)}
            className="w-full px-4 py-3 bg-white/60 border border-[#e0d7d0] rounded-lg text-[#231b15] placeholder-[#54433a]/60 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/45 transition-all"
            placeholder="e.g., Chess Club, Debate Team"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#54433a]/85 mb-2">
            Favorite Shows
          </label>
          <input
            type="text"
            value={formData.favoriteShows}
            onChange={(e) => handleInputChange('favoriteShows', e.target.value)}
            className="w-full px-4 py-3 bg-white/60 border border-[#e0d7d0] rounded-lg text-[#231b15] placeholder-[#54433a]/60 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/45 transition-all"
            placeholder="e.g., Breaking Bad, Friends, The Office"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-[#54433a]/85 mb-2">
            Favorite Movies
          </label>
          <input
            type="text"
            value={formData.favoriteMovies}
            onChange={(e) => handleInputChange('favoriteMovies', e.target.value)}
            className="w-full px-4 py-3 bg-white/60 border border-[#e0d7d0] rounded-lg text-[#231b15] placeholder-[#54433a]/60 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/45 transition-all"
            placeholder="e.g., Inception, The Godfather, Pulp Fiction"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-[#54433a]/85 mb-2">
            Favorite Music
          </label>
          <input
            type="text"
            value={formData.favoriteMusic}
            onChange={(e) => handleInputChange('favoriteMusic', e.target.value)}
            className="w-full px-4 py-3 bg-white/60 border border-[#e0d7d0] rounded-lg text-[#231b15] placeholder-[#54433a]/60 focus:outline-none focus:ring-1 focus:ring-[#5d4037]/45 transition-all"
            placeholder="e.g., Rock, Pop, Jazz, Hip-Hop"
          />
        </div>
      </div>
    </motion.div>
  )

  const renderViewProfile = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Column: Avatar & Basic Info */}
        <div className="w-full md:w-1/3 flex flex-col items-center p-6 yuno-card">
          <div className="w-32 h-32 rounded-full bg-[#b5511b]/20 border border-[#b5511b]/35 flex items-center justify-center text-4xl font-bold text-[#b5511b] mb-4 shadow-sm">
            {formData.name.charAt(0) || '?'}
          </div>
          <h2 className="text-2xl text-[#231b15] text-center font-display italic font-medium">{formData.name}</h2>
          {formData.username && <p className="text-[#b5511b] font-mono mt-1">@{formData.username}</p>}
          {(formData.age || formData.city) && (
            <p className="text-[#54433a]/85 mt-2 flex justify-center items-center gap-1 text-sm font-medium">
              {formData.age} {formData.age && formData.city && '•'} {formData.city}
            </p>
          )}

          <button 
            type="button"
            onClick={() => setIsEditing(true)}
            className="mt-6 w-full py-2.5 px-4 rounded-lg bg-[#b5511b] text-white hover:bg-[#943b0d] font-mono uppercase tracking-wider text-xs font-bold transition-all shadow-sm"
          >
            Edit Profile
          </button>
        </div>

        {/* Right Column: Bio & Details */}
        <div className="w-full md:w-2/3 space-y-6">
          <div className="p-6 yuno-card">
            <h3 className="text-lg text-[#231b15] mb-3 flex items-center gap-2 font-display italic font-medium">
              <User className="w-5 h-5 text-[#b5511b]" /> About Me
            </h3>
            <p className="text-[#54433a]/95 text-sm leading-relaxed whitespace-pre-wrap">{formData.bio || 'No bio provided.'}</p>
          </div>

          <div className="p-6 yuno-card grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-[#231b15] mb-3 flex items-center gap-2 font-display italic font-medium">
                <Briefcase className="w-4 h-4 text-[#b5511b]" /> 
                Career & Education
              </h3>
              <ul className="space-y-2 text-sm text-[#54433a]/90">
                {formData.profession && <li>Profession: <span className="text-[#231b15] font-medium">{formData.profession}</span></li>}
                {formData.workplace && <li>Workplace: <span className="text-[#231b15] font-medium">{formData.workplace}</span></li>}
                {formData.school && <li>School: <span className="text-[#231b15] font-medium">{formData.school}</span></li>}
              </ul>
              {(!formData.profession && !formData.workplace && !formData.school) && <span className="text-sm text-[#54433a]/60">Not provided</span>}
            </div>

            <div>
              <h3 className="text-[#231b15] mb-3 flex items-center gap-2 font-display italic font-medium">
                <Heart className="w-4 h-4 text-[#b5511b]" /> 
                Interests & Hobbies
              </h3>
              {formData.hobbies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.hobbies.map(h => (
                    <span key={h} className="px-3 py-1 bg-white/60 border border-[#e0d7d0] rounded-lg text-xs text-[#231b15] font-medium">{h}</span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-[#54433a]/60">No hobbies added.</span>
              )}
            </div>
          </div>

          {(formData.languages || formData.skills || formData.clubs || formData.favoriteShows || formData.favoriteMovies || formData.favoriteMusic) && (
            <div className="p-6 yuno-card">
              <h3 className="text-lg text-[#231b15] mb-4 flex items-center gap-2 font-display italic font-medium">
                <Award className="w-5 h-5 text-[#b5511b]" /> Additional Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                {formData.languages && <div><span className="text-[#54433a]/80 block mb-1 text-xs uppercase tracking-wider font-semibold">Languages</span><span className="text-[#231b15] font-medium">{formData.languages}</span></div>}
                {formData.skills && <div><span className="text-[#54433a]/80 block mb-1 text-xs uppercase tracking-wider font-semibold">Skills</span><span className="text-[#231b15] font-medium">{formData.skills}</span></div>}
                {formData.clubs && <div><span className="text-[#54433a]/80 block mb-1 text-xs uppercase tracking-wider font-semibold">Clubs/Societies</span><span className="text-[#231b15] font-medium">{formData.clubs}</span></div>}
                {formData.favoriteShows && <div><span className="text-[#54433a]/80 block mb-1 text-xs uppercase tracking-wider font-semibold">Favorite Shows</span><span className="text-[#231b15] font-medium">{formData.favoriteShows}</span></div>}
                {formData.favoriteMovies && <div><span className="text-[#54433a]/80 block mb-1 text-xs uppercase tracking-wider font-semibold">Favorite Movies</span><span className="text-[#231b15] font-medium">{formData.favoriteMovies}</span></div>}
                {formData.favoriteMusic && <div><span className="text-[#54433a]/80 block mb-1 text-xs uppercase tracking-wider font-semibold">Favorite Music</span><span className="text-[#231b15] font-medium">{formData.favoriteMusic}</span></div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#b5511b] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-[#54433a]/80 hover:text-[#b5511b] transition-colors mb-4 font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-5xl text-[#231b15] mb-2 font-display italic font-medium">
            Complete Your Profile
          </h1>
          <p className="text-[#54433a]/80 text-lg">
            Help us find the perfect connections by sharing a bit about yourself
          </p>
        </div>

        {isEditing ? (
          <>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#54433a]/80 font-mono">Step {currentStep} of 3</span>
                <span className="text-sm text-[#54433a]/80 font-mono">{Math.round((currentStep / 3) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-white/60 border border-[#e0d7d0] rounded-full h-2">
                <motion.div
                  className="bg-[#b5511b] h-2 rounded-full transition-all duration-300 shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="yuno-card p-6 md:p-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#5d4037]/10">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2.5 rounded-lg border transition-all text-xs font-mono uppercase tracking-wider font-bold ${
                    currentStep === 1
                      ? 'border-[#e0d7d0] text-[#54433a]/40 cursor-not-allowed bg-white/10'
                      : 'border-[#b5511b] text-[#b5511b] hover:bg-[#b5511b] hover:text-white'
                  }`}
                >
                  Previous
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2.5 bg-[#b5511b] text-white rounded-lg hover:bg-[#943b0d] transition-all text-xs font-mono uppercase tracking-wider font-bold shadow-sm"
                  >
                    Next
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2.5 border border-[#e0d7d0] text-[#54433a] rounded-lg hover:bg-[#5d4037]/5 bg-white/45 transition-all text-xs font-mono uppercase tracking-wider font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-8 py-2.5 bg-[#b5511b] text-white rounded-lg hover:bg-[#943b0d] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-bold shadow-sm"
                    >
                      {isSaving ? (
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
                  </div>
                )}
              </div>
            </form>
          </>
        ) : (
          renderViewProfile()
        )}
      </div>
    </div>
  )
}
