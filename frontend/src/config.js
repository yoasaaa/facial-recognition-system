// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://9un5km3hz5.execute-api.us-west-1.amazonaws.com/dev',
  ENDPOINTS: {
    UPLOAD_IMAGE: (filename) => `/face-recognition-visitor-image/${filename}`,
    AUTHENTICATE: '/employee'
  }
}

export default API_CONFIG 