'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { 
  User, 
  Shield, 
  Bell, 
  Settings, 
  MapPin, 
  Eye, 
  EyeOff,
  Save,
  LogOut,
  Trash2,
  Download,
  Upload
} from 'lucide-react'

interface SettingsState {
  // Profile Settings
  name: string
  email: string
  bio: string
  city: string
  
  // Privacy Settings
  showLocation: boolean
  showProfile: boolean
  allowSparks: boolean
  showOnlineStatus: boolean
  
  // Notification Settings
  emailNotifications: boolean
  pushNotifications: boolean
  sparkNotifications: boolean
  chatNotifications: boolean
  
  // App Settings
  autoLocation: boolean
  discoveryRadius: number
  language: string
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [settings, setSettings] = useState<SettingsState>({
    // Profile Settings
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    city: user?.city || '',
    
    // Privacy Settings
    showLocation: true,
    showProfile: true,
    allowSparks: true,
    showOnlineStatus: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    sparkNotifications: true,
    chatNotifications: true,
    
    // App Settings
    autoLocation: true,
    discoveryRadius: 20,
    language: 'English'
  })

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Settings saved:', settings)
      // Here you would make an API call to save settings
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Handle account deletion
      console.log('Account deletion requested')
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'app', name: 'App Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
          <p className="text-text-muted">Manage your account preferences and privacy</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-card-surface rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-card-surface/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Settings Content */}
        <div className="bg-card-surface rounded-lg p-6 shadow-elegant">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Profile Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => handleSettingChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleSettingChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Bio
                </label>
                <textarea
                  value={settings.bio}
                  onChange={(e) => handleSettingChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={settings.city}
                  onChange={(e) => handleSettingChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your city"
                />
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Privacy Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-text-primary">Show Location</h3>
                      <p className="text-sm text-text-muted">Allow others to see your approximate location</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showLocation}
                      onChange={(e) => handleSettingChange('showLocation', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-text-primary">Public Profile</h3>
                      <p className="text-sm text-text-muted">Make your profile visible to everyone</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showProfile}
                      onChange={(e) => handleSettingChange('showProfile', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-text-primary">Allow Sparks</h3>
                      <p className="text-sm text-text-muted">Let others send you friend requests</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowSparks}
                      onChange={(e) => handleSettingChange('allowSparks', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-text-primary">Online Status</h3>
                      <p className="text-sm text-text-muted">Show when you're online</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showOnlineStatus}
                      onChange={(e) => handleSettingChange('showOnlineStatus', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-text-primary">Email Notifications</h3>
                      <p className="text-sm text-text-muted">Receive notifications via email</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-text-primary">Push Notifications</h3>
                      <p className="text-sm text-text-muted">Receive push notifications on your device</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-text-primary">Spark Notifications</h3>
                      <p className="text-sm text-text-muted">Get notified when someone sends you a spark</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.sparkNotifications}
                      onChange={(e) => handleSettingChange('sparkNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-text-primary">Chat Notifications</h3>
                      <p className="text-sm text-text-muted">Get notified for new messages</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.chatNotifications}
                      onChange={(e) => handleSettingChange('chatNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'app' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">App Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-text-primary">Auto Location</h3>
                      <p className="text-sm text-text-muted">Automatically update your location</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoLocation}
                      onChange={(e) => handleSettingChange('autoLocation', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Discovery Radius ({settings.discoveryRadius}km)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={settings.discoveryRadius}
                    onChange={(e) => handleSettingChange('discoveryRadius', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-text-muted mt-1">
                    <span>1km</span>
                    <span>50km</span>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2 px-6 py-3"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>

          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2 px-6 py-3"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>

          <button
            onClick={handleDeleteAccount}
            className="btn-danger flex items-center gap-2 px-6 py-3"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>

        {/* Data Export/Import */}
        <div className="mt-8 p-4 border border-border rounded-lg bg-card-surface">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Data Management</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="btn-secondary flex items-center gap-2 px-4 py-2">
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button className="btn-secondary flex items-center gap-2 px-4 py-2">
              <Upload className="w-4 h-4" />
              Import Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
