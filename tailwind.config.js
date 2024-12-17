module.exports = {
  // ... other config
  theme: {
    extend: {
      // ... other extensions
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'scale-up': {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 }
        }
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'scale-up': 'scale-up 0.2s ease-out'
      }
    }
  }
}; 