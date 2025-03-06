import React from 'react';
import { Layout, LogOut, UserCircle, Loader2 } from 'lucide-react';
import { 
  useUser, 
  SignIn, 
  SignedIn, 
  SignedOut, 
  useClerk, 
  useAuth 
} from '@clerk/clerk-react';
import DetectionService from './components/monitoring/DetectionService';
import QuestionPanel from './components/test/QuestionPanel';
import Timer from './components/test/Timer';

function App() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const { isLoaded: isAuthLoaded } = useAuth();

  if (!isAuthLoaded || !isUserLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layout className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">Online Test Platform</span>
            </div>
            
            <SignedIn>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <UserCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {user?.fullName || user?.emailAddresses[0]?.emailAddress}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </SignedIn>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SignedIn>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <DetectionService />
            </div>
            <div className="lg:col-span-2">
              <QuestionPanel />
            </div>
          </div>
          <Timer />
        </SignedIn>
        
        <SignedOut>
          <div className="max-w-md mx-auto mt-20">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Welcome to Online Test Platform</h2>
              <p className="text-center text-gray-600 mb-8">Please sign in to access your test</p>
              <div className="w-full">
                <SignIn />
              </div>
            </div>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}

export default App;