<div align="center">

# 🕵️‍♂️ NetWatcher - Network Data Analyzer

### 🚀 Extension Chrome d'interception réseau & analyse IA en temps réel
### Real-time network interception and AI analysis Chrome extension

[![Made with Python](https://img.shields.io/badge/Made%20with-Python-blue? style=for-the-badge&logo=python)](https://www.python.org/)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green?style=for-the-badge&logo=googlechrome)](https://www.google.com/chrome/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Ollama](https://img.shields.io/badge/Ollama-AI-orange?style=for-the-badge)](https://ollama.com/)

[🇫🇷 Version Française](#-version-française) | [🇬🇧 English Version](#-english-version)

</div>

---

<a name="-english-version"></a>
## 🇬🇧 English Version

### 📖 Overview

**NetWatcher** is a powerful browser extension designed for real-time data flow interception. It extracts textual content and network requests from web pages and sends them to a local Python backend powered by AI (Ollama) to solve coding challenges, math problems, and analyze complex content automatically.

### ✨ Key Features

- 🔍 **Intelligent Content Extraction** - Automatically scans and extracts relevant text from web pages
- 🌐 **Network Request Interception** - Captures `fetch` and `XMLHttpRequest` calls in real-time
- 🤖 **AI-Powered Analysis** - Uses Ollama's `qwen3-coder:30b` model for intelligent problem-solving
- ⚡ **Real-time Processing** - Instant analysis and solution display via overlay UI
- 🎨 **Non-intrusive UI** - Shadow DOM overlay that doesn't conflict with existing page styles
- 🔐 **API Key Security** - Secure communication between extension and backend

### 🏗 Technical Architecture

The ecosystem consists of two main components:

#### 1. 🎯 Chrome Extension (Frontend)

| Component | Description |
|-----------|-------------|
| **Background Script** | Handles persistent communication with the API, retries, and "Keep-Alive" mechanisms |
| **Content Script** | Manages DOM extraction, local state, and injects the Shadow DOM UI overlay |
| **Injector Script** | Intercepts native `Fetch` and `XMLHttpRequest` calls at the page level |
| **UI Overlay** | Non-intrusive Shadow DOM interface for displaying results |

#### 2. 🧠 Python Backend (Backend)

| Component | Description |
|-----------|-------------|
| **FastAPI Server** | High-performance async server handling requests |
| **AI Integration** | Connects to local LLM via Ollama (Model: `qwen3-coder:30b`) |
| **Smart Prompting** | Dynamic context-aware prompts for solving code or math problems |

### 📂 Project Structure

```text
Scan-texte-extension-chrome/
├── extension/              # Chrome Extension Source Code
│   ├── manifest.json       # Extension configuration
│   ├── background. js       # Background service worker
│   ├── content. js          # Content script for DOM manipulation
│   ├── injector.js         # Network interception script
│   └── icons/              # Extension icons
├── server. py               # Python Backend Entry Point
├── requirements.txt        # Python Dependencies
└── README.md               # This file
```

### 🚀 Installation Guide

#### Prerequisites

- ✅ **Python 3.8+** installed
- ✅ **[Ollama](https://ollama.com/)** installed and running
- ✅ **Google Chrome** (or any Chromium-based browser)

#### Step 1: 🧠 Backend Setup (The Brain)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Cezar277/Scan-texte-extension-chrome.git
   cd Scan-texte-extension-chrome
   ```

2. **Install Python dependencies:**
   ```bash
   pip install fastapi uvicorn httpx pydantic
   ```

3. **Download the AI Model:**
   
   Ensure Ollama is running, then pull the required model:
   ```bash
   ollama pull qwen3-coder:30b
   ```

4. **Start the Server:**
   ```bash
   python server.py
   ```
   
   ✅ *The server will start on `http://0.0.0.0:5000`*

#### Step 2: 👁️ Extension Setup (The Eyes)

1. Open Chrome and navigate to `chrome://extensions/`
2. Toggle **Developer mode** (top right corner)
3. Click **Load unpacked**
4. Select the `extension/` folder containing `manifest.json`

### ⚙️ Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| **API Key** | `ndAnPZTLY32KMCwSADQUdPM` | Security key defined in `server.py` |
| **Backend URL** | `http://localhost:5000` | Local server endpoint |
| **AI Model** | `qwen3-coder:30b` | Ollama model for analysis |

> ⚠️ **Note:** Ensure port 5000 is available before starting the server.

### ⚡ Usage

1. ▶️ Start the Python server:  `python server.py`
2. 🌐 Navigate to a web page (e.g., coding exercise, math problem)
3. 🔍 The extension automatically scans the content
4. 💡 **Result:** An overlay appears at the bottom with the AI's solution or analysis

### 🎥 Demo

> 📸 *Add screenshots or GIF demonstrations here to show the extension in action*

### 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Server won't start | Check if port 5000 is in use:  `lsof -i :5000` |
| No AI response | Verify Ollama is running:  `ollama list` |
| Extension not loading | Check for errors in `chrome://extensions/` |

### 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests

### 📄 License

This project is open source.  Please check the repository for license details.

---

<a name="-version-française"></a>
## 🇫🇷 Version Française

### 📖 Présentation

**NetWatcher** est une solution avancée d'analyse et d'interception de flux de données sous forme d'extension de navigateur. Elle capture le contenu textuel et les requêtes réseau d'une page, puis les envoie à un backend Python alimenté par une IA (Ollama) pour résoudre automatiquement des défis de programmation, des problèmes mathématiques et analyser du contenu complexe. 

### ✨ Fonctionnalités Principales

- 🔍 **Extraction Intelligente** - Scan automatique et extraction du contenu pertinent des pages web
- 🌐 **Interception Réseau** - Capture des appels `fetch` et `XMLHttpRequest` en temps réel
- 🤖 **Analyse IA** - Utilise le modèle `qwen3-coder:30b` d'Ollama pour résoudre des problèmes complexes
- ⚡ **Traitement en Temps Réel** - Analyse instantanée et affichage via interface overlay
- 🎨 **Interface Non-Intrusive** - Overlay en Shadow DOM qui ne perturbe pas le design du site
- 🔐 **Sécurité par Clé API** - Communication sécurisée entre l'extension et le backend

### 🏗 Architecture Technique

L'écosystème repose sur deux briques principales :

#### 1. 🎯 Extension Chrome (Frontend)

| Composant | Description |
|-----------|-------------|
| **Background Script** | Gère la persistance de connexion avec l'API et le Keep-Alive |
| **Content Script** | Orchestre l'extraction du texte, gère l'interface et le verrouillage anti-spam |
| **Injector Script** | Intercepte les appels `Fetch` et `XMLHttpRequest` avant qu'ils n'atteignent le réseau |
| **Interface Overlay** | Interface Shadow DOM isolée superposée au site |

#### 2. 🧠 Serveur Python (Backend)

| Composant | Description |
|-----------|-------------|
| **FastAPI** | Serveur asynchrone ultra-rapide |
| **Intelligence Artificielle** | Intégration avec Ollama (Modèle : `qwen3-coder:30b`) |
| **Prompt Engineering** | Prompts dynamiques adaptés au contexte (Maths vs Code) |

### 📂 Structure du Projet

```text
Scan-texte-extension-chrome/
├── extension/              # Code source de l'extension Chrome
│   ├── manifest. json       # Configuration de l'extension
│   ├── background. js       # Service worker en arrière-plan
│   ├── content.js          # Script de contenu pour le DOM
│   ├── injector.js         # Script d'interception réseau
│   └── icons/              # Icônes de l'extension
├── server.py               # Point d'entrée du backend Python
├── requirements.txt        # Dépendances Python
└── README.md               # Ce fichier
```

### 🚀 Guide d'Installation

#### Prérequis

- ✅ **Python 3.8+** installé
- ✅ **[Ollama](https://ollama.com/)** installé et lancé
- ✅ **Google Chrome** (ou navigateur Chromium)

#### Étape 1 : 🧠 Installation du Serveur (Le Cerveau)

1. **Clonez le dépôt :**
   ```bash
   git clone https://github.com/Cezar277/Scan-texte-extension-chrome.git
   cd Scan-texte-extension-chrome
   ```

2. **Installez les dépendances Python :**
   ```bash
   pip install fastapi uvicorn httpx pydantic
   ```

3. **Récupérez le modèle IA :**
   
   Assurez-vous qu'Ollama tourne, puis téléchargez le modèle requis :
   ```bash
   ollama pull qwen3-coder:30b
   ```

4. **Lancez le serveur :**
   ```bash
   python server.py
   ```
   
   ✅ *Le serveur écoutera sur `http://0.0.0.0:5000`*

#### Étape 2 : 👁️ Installation de l'Extension (Les Yeux)

1. Ouvrez Chrome et allez sur `chrome://extensions/`
2. Activez le **Mode développeur** (en haut à droite)
3. Cliquez sur **Charger l'extension non empaquetée**
4. Sélectionnez le dossier `extension/` contenant `manifest.json`

### ⚙️ Configuration

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| **Clé API** | `ndAnPZTLY32KMCwSADQUdPM` | Clé de sécurité définie dans `server.py` |
| **URL Backend** | `http://localhost:5000` | Point de terminaison du serveur local |
| **Modèle IA** | `qwen3-coder:30b` | Modèle Ollama pour l'analyse |

> ⚠️ **Note :** Assurez-vous que le port 5000 est disponible. 

### ⚡ Utilisation

1. ▶️ Lancez le serveur Python : `python server.py`
2. 🌐 Naviguez sur une page contenant un exercice ou du code
3. 🔍 L'extension scanne automatiquement le contenu
4. 💡 **Résultat :** Une fenêtre discrète apparaît en bas de l'écran avec la solution générée par l'IA

> 📝 *Note : Vous pouvez scroller dans la fenêtre de résultat sans perdre le focus de la page principale.*

### 🎥 Démonstration

> 📸 *Ajoutez des captures d'écran ou GIF de démonstration ici*

### 🛠️ Dépannage

| Problème | Solution |
|----------|----------|
| Le serveur ne démarre pas | Vérifiez si le port 5000 est utilisé : `lsof -i :5000` |
| Pas de réponse IA | Vérifiez qu'Ollama tourne : `ollama list` |
| L'extension ne charge pas | Vérifiez les erreurs dans `chrome://extensions/` |

### 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à : 
- 🐛 Signaler des bugs
- 💡 Suggérer de nouvelles fonctionnalités
- 🔧 Soumettre des pull requests

### 📄 Licence

Ce projet est open source.  Veuillez consulter le dépôt pour les détails de la licence.

---

<div align="center">

### 🌟 Si ce projet vous plaît, n'oubliez pas de mettre une étoile ! ⭐

Made with ❤️ using Python, FastAPI & Ollama

</div>
