import { useState } from 'react'
import './App.css'
import API_CONFIG from './config'
const uuid = require('uuid')

function App() {
  const [image, setImage] = useState(null)
  const [uploadResultMessage, setUploadResultMessage] = useState(
    'Upload your photo to verify your identity'
  )
  const [ImgName, setImageName] = useState('placeholder.jpeg')
  const [isAuth, setAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  function sendImage(e) {
    e.preventDefault()
    if (!image) {
      setUploadResultMessage('Please select an image before authentication.')
      setAuth(false)
      setHasError(true)
      return
    }

    setIsLoading(true)
    setHasError(false)
    setUploadResultMessage('Authenticating...')
    setImageName(image.name)
    const visitorImageName = uuid.v4()

    fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD_IMAGE(`${visitorImageName}.jpeg`)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg',
        },
        body: image,
      }
    )
      .then(async (uploadResponse) => {
        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`)
        }
        console.log('Image uploaded successfully')
        
        const response = await authenticate(visitorImageName)
        if (response.Message === 'Success') {
          setAuth(true)
          setHasError(false)
          setUploadResultMessage(
            `Welcome back, ${response['firstName']} ${response['lastName']}! Have a wonderful day at work.`
          )
        } else {
          setAuth(false) 
          setHasError(true)
          setUploadResultMessage(
            'Authentication failed. You are not recognized as an employee.'
          )
        }
      })
      .catch((error) => {
        setAuth(false)
        setHasError(true)
        setUploadResultMessage(
          'Authentication error occurred. Please try again.'
        )
        console.error(error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  async function authenticate(visitorImageName) {
    const requestUrl =
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTHENTICATE}?` +
      new URLSearchParams({
        objectKey: `${visitorImageName}.jpeg`,
      })
    return await fetch(requestUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        return data
      })
      .catch((error) => console.error(error))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setAuth(false)
      setHasError(false)
      setUploadResultMessage('Image selected. Click authenticate to verify your identity.')
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="title">
            Employee Authentication System
          </h1>
          <p className="subtitle">Secure facial recognition access control</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="auth-container">
          <div className="upload-section">
            <h2 className="section-title">Identity Verification</h2>
            
            <form onSubmit={sendImage} className="upload-form">
              <div className="file-input-wrapper">
                <input
                  type="file"
                  name="image"
                  id="imageInput"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="imageInput" className="file-input-label">
                  <span className="file-input-text">
                    {image ? 'Change Photo' : 'Select Photo'}
                  </span>
                </label>
              </div>
              
              <button 
                type="submit" 
                className={`auth-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Authenticate
                  </>
                )}
              </button>
            </form>

            {/* Status Message */}
            <div className={`status-message ${
              isAuth ? 'success' : 
              hasError ? 'error' : 
              isLoading ? 'loading' : 'info'
            }`}>
              <div className="status-content">
                <span className={`status-icon ${
                  isAuth ? 'success' : 
                  hasError ? 'error' : 
                  isLoading ? 'loading' : 'info'
                }`}>
                  {isAuth ? '✅' : 
                   hasError ? '❌' : 
                   isLoading ? '⏳' : '💡'}
                </span>
                <p className="status-text">{uploadResultMessage}</p>
              </div>
            </div>
          </div>

          {/* Image Preview */}
          <div className="preview-section">
            <div className="image-container">
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Selected photo for verification"
                  className="preview-image uploaded"
                />
              ) : (
                <img
                  src={require(`./visitors/${ImgName}`)}
                  alt="Default placeholder"
                  className="preview-image placeholder"
                />
              )}
              <div className="image-overlay">
                <span className="overlay-text">
                  {image ? 'Ready for verification' : 'No image selected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">
          Powered by AWS Rekognition
        </p>
      </footer>
    </div>
  )
}

export default App
