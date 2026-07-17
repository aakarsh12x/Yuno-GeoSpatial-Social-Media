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
import { UserAPI } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface SettingsState {
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
  const [activeTab, setActiveTab] = useState('privacy')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [settings, setSettings] = useState<SettingsState>({
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
      const payload = {
        // Here you would add other global settings if needed
      }
      
      const { data } = await UserAPI.updateProfile(payload)
      
      if (data.success) {
        toast.success('Settings saved successfully!')
      }
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error(error.response?.data?.message || 'Failed to save settings')
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
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'app', name: 'App Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-[#231b15] mb-2 font-display italic font-medium">Settings</h1>
          <p className="text-[#54433a]/80 text-sm">Manage your account preferences and privacy</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1.5 mb-8 bg-white/60 border border-[#e0d7d0] rounded-xl p-1 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#b5511b] text-white shadow-sm font-bold'
                    : 'text-[#54433a] hover:text-[#231b15] hover:bg-[#5d4037]/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Settings Content */}
        <div className="yuno-card p-6">

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-xl text-[#231b15] mb-4 font-display italic font-medium">Privacy Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-[#5d4037]/10 rounded-xl bg-white/40">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#b5511b]" />
                    <div>
                      <h3 className="font-bold text-[#231b15] text-sm">Show Location</h3>
                      <p className="text-xs text-[#54433a]/75">Allow others to see your approximate location</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showLocation}
                      onChange={(e) => handleSettingChange('showLocation', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/40 border border-[#e0d7d0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b5511b]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#5d4037]/10 rounded-xl bg-white/40">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-[#b5511b]" />
                    <div>
                      <h3 className="font-bold text-[#231b15] text-sm">Public Profile</h3>
                      <p className="text-xs text-[#54433a]/75">Make your profile visible to everyone</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showProfile}
                      onChange={(e) => handleSettingChange('showProfile', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/40 border border-[#e0d7d0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b5511b]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#5d4037]/10 rounded-xl bg-white/40">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#b5511b]" />
                    <div>
                      <h3 className="font-bold text-[#231b15] text-sm">Allow Sparks</h3>
                      <p className="text-xs text-[#54433a]/75">Let others send you friend requests</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowSparks}
                      onChange={(e) => handleSettingChange('allowSparks', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/40 border border-[#e0d7d0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b5511b]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#5d4037]/10 rounded-xl bg-white/40">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#b5511b]" />
                    <div>
                      <h3 className="font-bold text-[#231b15] text-sm">Online Status</h3>
                      <p className="text-xs text-[#54433a]/75">Show when you're online</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showOnlineStatus}
                      onChange={(e) => handleSettingChange('showOnlineStatus', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/40 border border-[#e0d7d0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b5511b]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl text-[#231b15] mb-4 font-display italic font-medium">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-[#5d4037]/10 rounded-xl bg-white/40">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#b5511b]" />
                    <div>
                      <h3 className="font-bold text-[#231b15] text-sm">Email Notifications</h3>
                      <p className="text-xs text-[#54433a]/75">Receive notifications via email</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/40 border border-[#e0d7d0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b5511b]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#5d4037]/10 rounded-xl bg-white/40">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#b5511b]" />
                    <div>
                      <h3 className="font-bold text-[#231b15] text-sm">Push Notifications</h3>
                      <p className="text-xs text-[#54433a]/75">Receive push notifications on your device</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/40 border border-[#e0d7d0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b5511b]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#5d4037]/10 rounded-xl bg-white/40">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#b5511b]" />
                    <div>
                      <h3 className="font-bold text-[#231b15] text-sm">Spark Notifications</h3>
                      <p className="text-xs text-[#54433a]/75">Get notified when someone sends you a spark</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.sparkNotifications}
                      onChange={(e) => handleSettingChange('sparkNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/40 border border-[#e0d7d0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b5511b]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#5d4037]/10 rounded-xl bg-white/40">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#b5511b]" />
                    <div>
                      <h3 className="font-bold text-[#231b15] text-sm">Chat Notifications</h3>
                      <p className="text-xs text-[#54433a]/75">Get notified for new messages</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.chatNotifications}
                      onChange={(e) => handleSettingChange('chatNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/40 border border-[#e0d7d0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b5511b]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'app' && (
            <div className="space-y-6">
              <h2 className="text-xl text-[#231b15] mb-4 font-display italic font-medium">App Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-[#5d4037]/10 rounded-xl bg-white/40">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#b5511b]" />
                    <div>
                      <h3 className="font-bold text-[#231b15] text-sm">Auto Location</h3>
                      <p className="text-xs text-[#54433a]/75">Automatically update your location</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoLocation}
                      onChange={(e) => handleSettingChange('autoLocation', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/40 border border-[#e0d7d0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b5511b]"></div>
                  </label>
                </div>

                <div className="p-4 border border-[#5d4037]/10 rounded-xl bg-white/40">
                  <label className="block text-xs font-bold text-[#231b15] uppercase tracking-wider mb-2">
                    Discovery Radius ({settings.discoveryRadius}km)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={settings.discoveryRadius}
                    onChange={(e) => handleSettingChange('discoveryRadius', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/40 border border-[#e0d7d0] rounded-lg appearance-none cursor-pointer accent-[#b5511b]"
                  />
                  <div className="flex justify-between text-[10px] text-[#54433a]/70 font-mono mt-1">
                    <span>1km</span>
                    <span>50km</span>
                  </div>
                </div>

                <div className="p-4 border border-[#5d4037]/10 rounded-xl bg-white/40">
                  <label className="block text-xs font-bold text-[#231b15] uppercase tracking-wider mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-[#e0d7d0] rounded-lg bg-white/60 text-[#231b15] focus:outline-none focus:ring-1 focus:ring-[#5d4037]/45 text-sm"
                  >
                    <option value="English" className="bg-white text-[#231b15]">English</option>
                    <option value="Spanish" className="bg-white text-[#231b15]">Spanish</option>
                    <option value="French" className="bg-white text-[#231b15]">French</option>
                    <option value="German" className="bg-white text-[#231b15]">German</option>
                    <option value="Hindi" className="bg-white text-[#231b15]">Hindi</option>
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
            className="flex items-center gap-2 px-6 py-2.5 bg-[#b5511b] hover:bg-[#943b0d] text-white text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : 'Save Settings'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-2.5 border border-[#e0d7d0] text-[#231b15] hover:bg-[#5d4037]/5 bg-white/45 text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>

          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>

        {/* Data Export/Import */}
        <div className="mt-8 p-6 yuno-card">
          <h3 className="text-lg text-[#231b15] mb-4 font-display italic font-medium">Data Management</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-[#e0d7d0] text-[#231b15] hover:bg-[#5d4037]/5 bg-white/45 text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition-all">
              <Download className="w-4 h-4 text-[#b5511b]" />
              <span>Export Data</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-[#e0d7d0] text-[#231b15] hover:bg-[#5d4037]/5 bg-white/45 text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition-all">
              <Upload className="w-4 h-4 text-[#b5511b]" />
              <span>Import Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
