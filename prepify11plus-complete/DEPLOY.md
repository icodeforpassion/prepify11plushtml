# 🚀 Quick Start: Deploy to GitHub

## Option 1: Automated Script (Recommended - Easiest!)

```bash
cd /home/claude/prepify11plus
./deploy-to-github.sh
```

The script will guide you through the entire process!

---

## Option 2: Manual Steps

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `prepify11plus`
3. Description: "Complete 11+ exam preparation platform"
4. Choose Public or Private
5. **DO NOT** check "Initialize with README"
6. Click "Create repository"

### Step 2: Commit Your Code

```bash
# Navigate to project directory
cd /home/claude/prepify11plus

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Prepify11Plus platform with question bank and 3D Study Buddy"

# Rename branch to main
git branch -M main

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/prepify11plus.git

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

### Step 3: Verify

Visit your repository: `https://github.com/YOUR_USERNAME/prepify11plus`

You should see all your files!

---

## 🌐 Deploy to Production

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /home/claude/prepify11plus
vercel
```

Follow the prompts. Your site will be live in ~2 minutes!

### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=build
```

### Option C: GitHub Pages

1. Go to your repository settings
2. Click "Pages" in left sidebar
3. Source: Deploy from branch
4. Branch: main, folder: /(root)
5. Save

Then run:
```bash
npm install --save-dev gh-pages

# Add to package.json scripts:
# "predeploy": "npm run build",
# "deploy": "gh-pages -d build"

npm run deploy
```

---

## 🔑 Authentication Issues?

If you get authentication errors:

### Using HTTPS:
```bash
# You'll be prompted for username and password
# Password = Personal Access Token (not your GitHub password)

# Create token at: https://github.com/settings/tokens
# Scopes needed: repo (all)
```

### Using SSH (Better):
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: https://github.com/settings/keys

# Change remote to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/prepify11plus.git

# Push
git push -u origin main
```

---

## ✅ Success Checklist

- [ ] Repository created on GitHub
- [ ] Code committed locally
- [ ] Code pushed to GitHub
- [ ] Repository visible on GitHub.com
- [ ] (Optional) Deployed to production

---

## 🆘 Troubleshooting

### "Permission denied"
→ Check your GitHub authentication (token or SSH key)

### "Repository not found"
→ Verify the repository URL is correct

### "Updates were rejected"
→ Someone else pushed changes. Run `git pull origin main` first

### "Nothing to commit"
→ Files already committed! Run `git status` to check

---

## 📞 Need Help?

- Check git status: `git status`
- View commit history: `git log --oneline`
- See remote URL: `git remote -v`

---

**Your Prepify11Plus platform is ready to go live! 🎉**
