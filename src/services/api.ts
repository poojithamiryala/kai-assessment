import axios from 'axios';

// API configuration for large file
const API_URL = '/ui_demo.json';

// Create axios instance with timeout for large files
const apiClient = axios.create({
  timeout: 300000, // 5 minutes timeout for 371MB file
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to fetch vulnerability data
export const fetchVulnerabilityData = async () => {
  try {
    console.log('Starting to fetch vulnerability data...');
    const response = await apiClient.get(API_URL);
    console.log('Data fetched successfully!');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to load vulnerability data');
  }
};
