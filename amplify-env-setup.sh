# Set environment variables via Amplify CLI

# Install Amplify CLI if not installed
npm install -g @aws-amplify/cli

# Configure Amplify CLI (run once)
amplify configure

# Add environment variables
amplify env add

# Or update existing environment
amplify env update

# Set the environment variables
amplify env set VITE_OPENAI_API_KEY your-openai-key-here
amplify env set VITE_GEMINI_API_KEY your-gemini-key-here

# Push changes
amplify push