import React, { useState, useEffect } from 'react';
import { Music, Instagram, Youtube, Calendar, Mail, Edit2, Save, X, Send } from 'lucide-react';

const SUPABASE_URL = 'https://wytwlrxchwugrbifpzjc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5dHdscnhjaHd1Z3JiaWZwempjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNjE1NDksImV4cCI6MjA4NTczNzU0OX0.Z8WYWDRPDbqAAGV2Ob_pRXK8LEbes0LT1_TApySXLl0';

export default function ArtistLandingPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  const [content, setContent] = useState({
    artistName: 'Livalil',
    tagline: 'Singer · Songwriter · Producer',
    bio: 'Creating music that touches the soul. Blending indie pop with electronic elements to tell stories that resonate.',
    email: 'booking@livalil.music',
    instagram: 'https://instagram.com/liv.a.lil',
    youtube: 'https://youtube.com/@lunarose',
    spotifyEmbed: 'https://open.spotify.com/artist/7BLm6ST1GFRn73L7ghEMEw?si=uSgsGmTcRqqfp7e3kwRhZw',
    heroImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=600&fit=crop',
    shows: [
      { date: '2026-02-15', venue: 'The Echo, Los Angeles', tickets: 'https://tickets.example.com' },
      { date: '2026-03-20', venue: 'Bowery Ballroom, NYC', tickets: 'https://tickets.example.com' }
    ]
  });

  const [editContent, setEditContent] = useState(content);

  useEffect(() => {
    loadContent();
  }, []);

  const supabaseFetch = async (endpoint, options = {}) => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      ...options,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`Supabase error: ${response.statusText}`);
    }
    
    return response.json();
  };

  const loadContent = async () => {
    try {
      const data = await supabaseFetch('artist_content?id=eq.main-content&select=*');
      
      if (data && data.length > 0) {
        const saved = JSON.parse(data[0].value);
        setContent(saved);
        setEditContent(saved);
      }
    } catch (error) {
      console.log('Using default content:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    try {
      const contentStr = JSON.stringify(editContent);
      
      // Try to update first
      const checkData = await supabaseFetch('artist_content?id=eq.main-content&select=id');
      
      if (checkData && checkData.length > 0) {
        // Update existing
        await supabaseFetch('artist_content?id=eq.main-content', {
          method: 'PATCH',
          body: JSON.stringify({
            value: contentStr,
            updated_at: new Date().toISOString()
          })
        });
      } else {
        // Insert new
        await supabaseFetch('artist_content', {
          method: 'POST',
          body: JSON.stringify({
            id: 'main-content',
            value: contentStr
          })
        });
      }
      
      setContent(editContent);
      setIsEditing(false);
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save content. Please try again.');
    }
  };

  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAdmin(true);
      setShowLogin(false);
      setPassword('');
    } else {
      alert('Incorrect password');
    }
  };

  const addShow = () => {
    setEditContent({
      ...editContent,
      shows: [...editContent.shows, { date: '', venue: '', tickets: '' }]
    });
  };

  const updateShow = (index, field, value) => {
    const newShows = [...editContent.shows];
    newShows[index][field] = value;
    setEditContent({ ...editContent, shows: newShows });
  };

  const removeShow = (index) => {
    setEditContent({
      ...editContent,
      shows: editContent.shows.filter((_, i) => i !== index)
    });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSendingEmail(true);

    try {
      // EmailJS configuration - replace these with your actual values
      const serviceID = 'YOUR_SERVICE_ID';
      const templateID = 'YOUR_TEMPLATE_ID';
      const publicKey = 'YOUR_PUBLIC_KEY';

      const templateParams = {
        from_name: contactForm.name,
        from_email: contactForm.email,
        message: contactForm.message,
        to_email: content.email
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: serviceID,
          template_id: templateID,
          user_id: publicKey,
          template_params: templateParams
        })
      });

      if (response.ok) {
        alert('Message sent successfully!');
        setContactForm({ name: '', email: '', message: '' });
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      console.error('Email error:', error);
      alert('Failed to send message. Please try again or email directly.');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black text-white">
      {/* Admin Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {!isAdmin ? (
          <button
            onClick={() => setShowLogin(true)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-all"
          >
            Admin
          </button>
        ) : (
          <>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
              >
                <Edit2 size={16} />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={saveContent}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                >
                  <Save size={16} />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(content);
                  }}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                >
                  <X size={16} />
                  Cancel
                </button>
              </>
            )}
            <button
              onClick={() => {
                setIsAdmin(false);
                setIsEditing(false);
                setEditContent(content);
              }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-all"
            >
              Logout
            </button>
          </>
        )}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-2xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
            <p className="text-gray-400 mb-4 text-sm">Default password: admin123</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter password"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleLogin}
                className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition-all"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setShowLogin(false);
                  setPassword('');
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${isEditing ? editContent.heroImage : content.heroImage})`,
            filter: 'brightness(0.4)'
          }}
        />
        <div className="relative h-full flex flex-col items-center justify-center px-4">
          {isEditing ? (
            <div className="max-w-2xl w-full space-y-4">
              <input
                value={editContent.artistName}
                onChange={(e) => setEditContent({ ...editContent, artistName: e.target.value })}
                className="w-full text-6xl font-bold text-center bg-white/10 border border-white/30 rounded-lg px-4 py-2"
              />
              <input
                value={editContent.tagline}
                onChange={(e) => setEditContent({ ...editContent, tagline: e.target.value })}
                className="w-full text-2xl text-center bg-white/10 border border-white/30 rounded-lg px-4 py-2"
              />
              <input
                value={editContent.heroImage}
                onChange={(e) => setEditContent({ ...editContent, heroImage: e.target.value })}
                placeholder="Hero image URL"
                className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-sm"
              />
            </div>
          ) : (
            <>
              <h1 className="text-7xl font-bold mb-4 animate-fade-in">{content.artistName}</h1>
              <p className="text-2xl text-purple-300 mb-8">{content.tagline}</p>
            </>
          )}
          <div className="flex gap-6 mt-8">
            <a href={content.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
              <Instagram size={32} />
            </a>
            <a href={content.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
              <Youtube size={32} />
            </a>
            <a href={`mailto:${content.email}`} className="hover:text-purple-400 transition-colors">
              <Mail size={32} />
            </a>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="flex items-center gap-3 mb-6">
          <Music className="text-purple-400" size={32} />
          <h2 className="text-4xl font-bold">About</h2>
        </div>
        {isEditing ? (
          <textarea
            value={editContent.bio}
            onChange={(e) => setEditContent({ ...editContent, bio: e.target.value })}
            rows={4}
            className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-lg"
          />
        ) : (
          <p className="text-xl text-gray-300 leading-relaxed">{content.bio}</p>
        )}
      </div>

      {/* Music Section */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-8">Latest Music</h2>
        {isEditing ? (
          <input
            value={editContent.spotifyEmbed}
            onChange={(e) => setEditContent({ ...editContent, spotifyEmbed: e.target.value })}
            placeholder="Spotify embed URL"
            className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 mb-4"
          />
        ) : null}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4">
          <iframe
            src={isEditing ? editContent.spotifyEmbed : content.spotifyEmbed}
            width="100%"
            height="380"
            frameBorder="0"
            allow="encrypted-media"
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Shows Section */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="text-purple-400" size={32} />
            <h2 className="text-4xl font-bold">Upcoming Shows</h2>
          </div>
          {isEditing && (
            <button
              onClick={addShow}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-all"
            >
              Add Show
            </button>
          )}
        </div>
        <div className="space-y-4">
          {(isEditing ? editContent.shows : content.shows).map((show, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={show.date}
                      onChange={(e) => updateShow(idx, 'date', e.target.value)}
                      className="flex-1 bg-white/10 border border-white/30 rounded-lg px-3 py-2"
                    />
                    <button
                      onClick={() => removeShow(idx)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    value={show.venue}
                    onChange={(e) => updateShow(idx, 'venue', e.target.value)}
                    placeholder="Venue name and location"
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2"
                  />
                  <input
                    value={show.tickets}
                    onChange={(e) => updateShow(idx, 'tickets', e.target.value)}
                    placeholder="Ticket URL"
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2"
                  />
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-purple-400 font-semibold text-lg">
                      {new Date(show.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xl mt-1">{show.venue}</p>
                  </div>
                  <a
                    href={show.tickets}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Get Tickets
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-8">Get in Touch</h2>
        
        {isEditing ? (
          <div className="space-y-4">
            <input
              value={editContent.email}
              onChange={(e) => setEditContent({ ...editContent, email: e.target.value })}
              placeholder="Email"
              className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3"
            />
            <input
              value={editContent.instagram}
              onChange={(e) => setEditContent({ ...editContent, instagram: e.target.value })}
              placeholder="Instagram URL"
              className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3"
            />
            <input
              value={editContent.youtube}
              onChange={(e) => setEditContent({ ...editContent, youtube: e.target.value })}
              placeholder="YouTube URL"
              className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3"
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-xl text-gray-300 mb-6">
                For bookings and inquiries:{' '}
                <a href={`mailto:${content.email}`} className="text-purple-400 hover:text-purple-300 transition-colors">
                  {content.email}
                </a>
              </p>
              <div className="flex gap-4">
                <a href={content.instagram} target="_blank" rel="noopener noreferrer" 
                   className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all">
                  <Instagram size={24} />
                </a>
                <a href={content.youtube} target="_blank" rel="noopener noreferrer"
                   className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all">
                  <Youtube size={24} />
                </a>
              </div>
            </div>
            
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                required
                className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                required
                className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <textarea
                placeholder="Your Message"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
                rows={4}
                className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={sendingEmail}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                {sendingEmail ? 'Sending...' : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
