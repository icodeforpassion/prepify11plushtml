#!/bin/bash

# Prepify11Plus - GitHub Deployment Script
# This script will help you commit and push all files to your GitHub repository

echo "🎓 Prepify11Plus - GitHub Deployment Script"
echo "============================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Navigate to project directory
cd "$(dirname "$0")"

echo "📁 Current directory: $(pwd)"
echo ""

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Create .gitignore file
echo "📝 Creating .gitignore file..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
ENV/

# OS
.DS_Store
Thumbs.db
EOF

echo "✅ .gitignore created"
echo ""

# Add all files
echo "📦 Adding files to git..."
git add .
echo "✅ Files added"
echo ""

# Check status
echo "📊 Git status:"
git status
echo ""

# Commit
echo "💾 Creating commit..."
read -p "Enter commit message (or press Enter for default): " commit_message
if [ -z "$commit_message" ]; then
    commit_message="Initial commit: Prepify11Plus - Complete 11+ exam preparation platform with static question bank and 3D Study Buddy"
fi

git commit -m "$commit_message"
echo "✅ Commit created"
echo ""

# Ask for repository URL
echo "🔗 GitHub Repository Setup"
echo "-------------------------"
echo "Do you already have a GitHub repository created?"
echo "1) Yes, I have a repository URL"
echo "2) No, I need to create one first"
read -p "Enter your choice (1 or 2): " repo_choice

if [ "$repo_choice" = "1" ]; then
    read -p "Enter your GitHub repository URL (e.g., https://github.com/username/prepify11plus.git): " repo_url
    
    # Check if remote already exists
    if git remote | grep -q "origin"; then
        echo "🔧 Updating remote origin..."
        git remote set-url origin "$repo_url"
    else
        echo "🔧 Adding remote origin..."
        git remote add origin "$repo_url"
    fi
    
    echo "✅ Remote repository configured"
    echo ""
    
    # Ask about branch name
    read -p "Enter branch name (default: main): " branch_name
    branch_name=${branch_name:-main}
    
    # Rename branch if needed
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "$branch_name" ]; then
        git branch -M "$branch_name"
        echo "✅ Branch renamed to $branch_name"
    fi
    
    # Push to GitHub
    echo "🚀 Pushing to GitHub..."
    git push -u origin "$branch_name"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS! Your code has been pushed to GitHub!"
        echo "📍 Repository: $repo_url"
        echo ""
        echo "Next steps:"
        echo "1. Visit your repository on GitHub"
        echo "2. Set up GitHub Pages or deploy to Vercel/Netlify"
        echo "3. Share your Prepify11Plus platform!"
    else
        echo ""
        echo "❌ Push failed. This might be because:"
        echo "1. You need to authenticate with GitHub"
        echo "2. The repository doesn't exist yet"
        echo "3. You don't have permission to push"
        echo ""
        echo "Try running: git push -u origin $branch_name"
    fi
    
elif [ "$repo_choice" = "2" ]; then
    echo ""
    echo "📝 To create a new repository:"
    echo "1. Go to https://github.com/new"
    echo "2. Name it 'prepify11plus' (or your preferred name)"
    echo "3. Make it Public or Private"
    echo "4. Do NOT initialize with README, .gitignore, or license"
    echo "5. Click 'Create repository'"
    echo ""
    echo "Then run this script again and choose option 1"
else
    echo "❌ Invalid choice"
    exit 1
fi

echo ""
echo "📚 Documentation available in README.md"
echo "🤖 Study Buddy ready to help students!"
echo ""
