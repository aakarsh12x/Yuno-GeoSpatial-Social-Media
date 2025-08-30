import { io, Socket } from 'socket.io-client';

interface UserData {
  id: number;
  name: string;
  email: string;
  age: number;
  city: string;
  school?: string;
  college?: string;
  workplace?: string;
  interests: string[];
}

interface NearbyUser {
  socketId: string;
  userId: number;
  userData: UserData;
  distance: number;
  latitude: number;
  longitude: number;
}

interface LocationUpdate {
  type: string;
  userId: number;
  userData: UserData;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

class GeospatialService {
  private socket: Socket | null = null;
  private userLocation: { latitude: number; longitude: number } | null = null;
  private nearbyUsers: NearbyUser[] = [];
  private onNearbyUsersUpdate: ((users: NearbyUser[]) => void) | null = null;
  private onNewUserNearby: ((user: NearbyUser) => void) | null = null;
  private onUserLeft: ((userId: number) => void) | null = null;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    this.socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: false
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🌍 Geospatial service connected');
    });

    this.socket.on('disconnect', () => {
      console.log('🌍 Geospatial service disconnected');
    });

    this.socket.on('nearby_users', (data: { users: NearbyUser[]; radius: number; timestamp: Date }) => {
      console.log('🔍 Received nearby users:', data.users.length);
      this.nearbyUsers = data.users;
      this.onNearbyUsersUpdate?.(data.users);
    });

    this.socket.on('nearby_user_update', (data: LocationUpdate) => {
      console.log('📍 New user nearby:', data.userData.name);
      const nearbyUser: NearbyUser = {
        socketId: '', // Will be filled by discover request
        userId: data.userId,
        userData: data.userData,
        distance: 0, // Will be calculated
        latitude: data.latitude,
        longitude: data.longitude
      };
      this.onNewUserNearby?.(nearbyUser);
    });

    this.socket.on('user_disconnected', (data: { userId: string; timestamp: Date }) => {
      console.log('👤 User left:', data.userId);
      this.onUserLeft?.(parseInt(data.userId));
    });
  }

  // Connect to geospatial service
  connect() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  // Disconnect from geospatial service
  disconnect() {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }

  // Update user location and broadcast to nearby users
  updateLocation(latitude: number, longitude: number, userId: number, userData: UserData) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot update location');
      return;
    }

    this.userLocation = { latitude, longitude };
    
    this.socket.emit('update_location', {
      latitude,
      longitude,
      userId,
      userData
    });

    console.log('📍 Location updated:', latitude, longitude);
  }

  // Discover nearby users in real-time
  discoverNearby(latitude: number, longitude: number, radius: number = 20) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot discover nearby users');
      return;
    }

    this.socket.emit('discover_nearby', {
      latitude,
      longitude,
      radius
    });

    console.log('🔍 Discovering nearby users within', radius, 'km');
  }

  // Get current nearby users
  getNearbyUsers(): NearbyUser[] {
    return this.nearbyUsers;
  }

  // Get user's current location
  getUserLocation() {
    return this.userLocation;
  }

  // Set callback for when nearby users list updates
  onNearbyUsersUpdateCallback(callback: (users: NearbyUser[]) => void) {
    this.onNearbyUsersUpdate = callback;
  }

  // Set callback for when new user comes nearby
  onNewUserNearbyCallback(callback: (user: NearbyUser) => void) {
    this.onNewUserNearby = callback;
  }

  // Set callback for when user leaves
  onUserLeftCallback(callback: (userId: number) => void) {
    this.onUserLeft = callback;
  }

  // Get browser location and update
  async getBrowserLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Start real-time location tracking
  startLocationTracking(userId: number, userData: UserData, intervalMs: number = 30000) {
    const updateLocation = async () => {
      try {
        const location = await this.getBrowserLocation();
        this.updateLocation(location.latitude, location.longitude, userId, userData);
      } catch (error) {
        console.error('Failed to update location:', error);
      }
    };

    // Update immediately
    updateLocation();

    // Set up periodic updates
    const intervalId = setInterval(updateLocation, intervalMs);

    // Return function to stop tracking
    return () => {
      clearInterval(intervalId);
    };
  }
}

// Export singleton instance
export const geospatialService = new GeospatialService();
