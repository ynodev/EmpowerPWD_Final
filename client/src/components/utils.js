import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';


/**
 * Merge class names with tailwind classes and handle conditional classes
 * @param {...string} inputs - Class names to merge
 * @returns {string} - Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Format date to local string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Truncate text with ellipsis
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated string
 */
export function truncateText(str, length) {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

/**
 * Generate random ID
 * @param {number} length - Length of ID (default: 8)
 * @returns {string} - Random ID
 */
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, length + 2)
}

/**
 * Check if string is valid email
 * @param {string} email - Email to validate
 * @returns {boolean} - Is valid email
 */
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Convert file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} - Is empty object
 */
export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get query params from URL
 * @param {string} [url] - URL to parse (default: window.location.search)
 * @returns {Object} - Query params object
 */
export function getQueryParams(url) {
  const urlParams = new URLSearchParams(url || window.location.search)
  const params = {}
  for (const [key, value] of urlParams.entries()) {
    params[key] = value
  }
  return params
}