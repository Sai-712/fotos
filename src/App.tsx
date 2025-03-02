import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Camera, Image, Upload, Check, X, ChevronDown, Menu, X as Close } from 'lucide-react';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import { GoogleAuthConfig } from './config/auth';
import { UserProvider, useUser } from './context/UserContext';
import UploadImage from './components/UploadImage';
import UploadSelfie from './components/UploadSelfie';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useUser();
  if (!profile) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <UserProvider>
      <GoogleAuthConfig>
        <Router>
          <div className="min-h-screen bg-white">
            <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
            <Routes>
              <Route path="/" element={
                <main className="container mx-auto px-4 py-8">
                  {useUser().profile ? (
                    <div className="max-w-2xl mx-auto space-y-8">
                      <div className="bg-white p-8 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Options</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <a href="/upload" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50 transition-colors">
                            <h3 className="text-xl font-semibold mb-2">Upload Images</h3>
                            <p className="text-gray-600">Upload your photos and get a QR code for selfie verification</p>
                          </a>
                          <a href="/upload_selfie" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50 transition-colors">
                            <h3 className="text-xl font-semibold mb-2">Upload Selfie</h3>
                            <p className="text-gray-600">Take a selfie to find your photos</p>
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Hero />
                  )}
                </main>
              } />
              <Route path="/upload" element={
                <ProtectedRoute>
                  <UploadImage />
                </ProtectedRoute>
              } />
              <Route path="/upload_selfie" element={
                <ProtectedRoute>
                  <UploadSelfie />
                </ProtectedRoute>
              } />
            </Routes>
            <Footer />
          </div>
        </Router>
      </GoogleAuthConfig>
    </UserProvider>
  );
}

export default App;