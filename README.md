# ⚡ CodeCompare - CP Problem Matcher

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Chrome%20%7C%20Edge-green)
![License](https://img.shields.io/badge/license-MIT-orange)

A browser extension that finds **matching competitive programming problems** across LeetCode, GeeksforGeeks, Codeforces, and HackerRank.

## ✨ Features

- 🔍 **Smart Problem Matching** - Find same/similar problems across platforms
- 🤖 **ML-Powered Search** - Uses AI semantic matching (HuggingFace)
- 📊 **Confidence Scoring** - Shows match percentage with detailed breakdown
- 🎨 **Beautiful UI** - Modern floating panel with dark theme
- 💾 **Local Caching** - Fast results with offline support
- 👍 **User Feedback** - Confirm/reject matches to improve accuracy

## 🖥️ Supported Platforms

| Platform | Status |
|----------|--------|
| LeetCode | ✅ |
| GeeksforGeeks | ✅ |
| Codeforces | ✅ |
| HackerRank | ✅ |

## 📦 Installation

### From Edge Add-ons Store
*(Coming soon)*

### Manual Installation (Chrome/Edge)

1. Download or clone this repository
2. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge)
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `code_compare` folder

## ⚙️ Setup (Optional)

### Enable ML Search (Recommended)
1. Get a free API key from [HuggingFace](https://huggingface.co/settings/tokens)
2. Click the extension icon → Settings ⚙️
3. Paste your HuggingFace API key
4. Click "Save HF Key & Enable ML"

### Enable CLIST API (Optional)
1. Get a free API key from [CLIST.by](https://clist.by/api/v4/doc/)
2. Enter in Settings as `username:api_key`

## 🎯 How It Works

1. Visit any problem page on supported platforms
2. Extension automatically detects the problem
3. Click the ⚡ button to see matching problems
4. View confidence scores and visit matching problems

## 🔧 Tech Stack

- **Manifest V3** Chrome Extension
- **Vanilla JavaScript** - No frameworks
- **HuggingFace API** - ML embeddings (sentence-transformers)
- **CLIST.by API** - Problem database

## 📸 Screenshots

*Add screenshots of your extension here*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👤 Author

Made with ❤️ for competitive programmers

---

## 🔒 Privacy Policy

This extension:
- ✅ Only activates on supported coding platforms
- ✅ Stores API keys locally in your browser
- ✅ Does not collect or transmit personal data
- ✅ Caches problem data locally for performance
- ⚠️ Makes API calls to HuggingFace/CLIST.by when configured
