```markdown
<div align="center">

# 🕵️‍♂️ NetWatcher / Network Data Analyzer
### Real-time network interception and AI analysis extension
### Extension d'interception réseau et d'analyse IA en temps réel

[🇫🇷 Version Française (French Version)](#-version-française) | [🇬🇧 English Version](#-english-version)

</div>

---

<a name="-english-version"></a>
## 🇬🇧 English Version

**NetWatcher** is a powerful browser extension designed for real-time data flow interception. It extracts textual content and network requests from web pages and sends them to a local Python backend powered by AI (Ollama/Qwen) for automated analysis and problem-solving.

### 🏗 Technical Architecture

The ecosystem consists of two main components:

#### 1. Chrome Extension (Frontend)
- **Background Script:** Handles persistent communication with the API, retries, and "Keep-Alive" mechanisms to prevent timeouts.
- **Content Script:** Manages DOM extraction (OCR-like), handles local state, and injects the Shadow DOM UI overlay.
- **Injector Script:** Injected at the page level to intercept native `Fetch` and `XMLHttpRequest` calls.
- **UI:** A non-intrusive overlay built with Shadow DOM to avoid CSS conflicts.

#### 2. Python Backend (Backend)
- **FastAPI Server:** High-performance async server (`server.py`).
- **AI Integration:** Connects to a local LLM via **Ollama** (Model: `qwen3-coder:30b`).
- **Smart Prompting:** Uses dynamic context-aware prompts to solve code or math problems extracted from the browser.

### 📂 Project Structure

```text
.
├── extension/              # Chrome Extension Source Code
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── injector.js
│   └── icons/
├── server.py               # Python Backend Entry Point
├── requirements.txt        # Python Dependencies
└── README.md

```

### 🚀 Installation Guide

#### Prerequisites

1. **Python 3.8+** installed.
2. **[Ollama](https://ollama.com/)** installed and running.
3. Google Chrome (or any Chromium-based browser).

#### Step 1: Backend Setup (The Brain)

1. **Install Python dependencies:**
```bash
pip install fastapi uvicorn httpx pydantic

```


2. **Download the AI Model:**
Ensure Ollama is running, then pull the model used by the server:
```bash
ollama pull qwen3-coder:30b

```


3. **Start the Server:**
```bash
python server.py

```


*The server will start on `http://0.0.0.0:5000`.*

#### Step 2: Extension Setup (The Eyes)

1. Open Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** (top right corner).
3. Click **Load unpacked**.
4. Select the folder containing the extension files (where `manifest.json` is located).

### ⚙️ Configuration

* **API Key:** The system is secured via an API Key defined in `server.py` (`ndAnPZTLY32KMCwSADQUdPM`). This key is automatically injected into the extension storage.
* **Localhost:** The extension communicates with `http://localhost:5000`. Ensure port 5000 is free.

### ⚡ Usage

1. Start the Python server.
2. Navigate to a web page (e.g., an exercise or coding problem).
3. The extension automatically scans the content.
4. **Result:** An overlay appears at the bottom of the screen with the AI's solution or analysis.

---

<a name="-version-française"></a>

## 🇫🇷 Version Française

**NetWatcher** est une solution avancée d'analyse et d'interception de flux de données sous forme d'extension de navigateur. Elle capture le contenu textuel et les requêtes réseau d'une page, puis délègue l'analyse à une Intelligence Artificielle locale (Ollama/Qwen) via un serveur Python dédié.

### 🏗 Architecture Technique

L'écosystème repose sur deux briques principales :

#### 1. L'Extension Chrome (Frontend)

* **Background Script :** Gère la persistance de la connexion avec l'API et empêche la mise en veille du service (Keep-Alive).
* **Content Script :** Orchestre l'extraction "intelligente" du texte (nettoyage du bruit), gère l'interface et le verrouillage anti-spam.
* **Injector Script :** S'exécute au cœur de la page pour intercepter les appels `Fetch` et `XMLHttpRequest` avant qu'ils n'atteignent le réseau.
* **Interface :** Une interface "Shadow DOM" isolée qui se superpose au site sans casser son design.

#### 2. Le Serveur Python (Backend)

* **FastAPI :** Serveur asynchrone ultra-rapide (`server.py`).
* **Intelligence Artificielle :** Intégration avec **Ollama** (Modèle : `qwen3-coder:30b`) pour résoudre des problèmes complexes.
* **Prompt Engineering :** Utilisation de prompts dynamiques ("Solveur Autonome", "Développeur Dynamique") pour s'adapter au contexte (Maths vs Code).

### 🚀 Guide d'Installation

#### Prérequis

1. **Python 3.8+** installé.
2. **[Ollama](https://ollama.com/)** installé et lancé.
3. Google Chrome (ou navigateur Chromium).

#### Étape 1 : Installation du Serveur (Le Cerveau)

1. **Installez les dépendances Python :**
```bash
pip install fastapi uvicorn httpx pydantic

```


2. **Récupérez le modèle IA :**
Assurez-vous qu'Ollama tourne, puis téléchargez le modèle requis :
```bash
ollama pull qwen3-coder:30b

```


3. **Lancez le serveur :**
```bash
python server.py

```


*Le serveur écoutera sur `http://0.0.0.0:5000`.*

#### Étape 2 : Installation de l'Extension (Les Yeux)

1. Ouvrez Chrome et allez sur `chrome://extensions/`.
2. Activez le **Mode développeur** (en haut à droite).
3. Cliquez sur **Charger l'extension non empaquetée** (Load unpacked).
4. Sélectionnez le dossier contenant les fichiers de l'extension (là où se trouve `manifest.json`).

### ⚙️ Configuration

* **Clé API :** Le système est sécurisé par une clé définie dans `server.py` (`ndAnPZTLY32KMCwSADQUdPM`). Elle est codée en dur dans l'extension pour une connexion immédiate.
* **Réseau :** L'extension tape sur `http://localhost:5000`. Assurez-vous que ce port est libre.

### ⚡ Utilisation

1. Lancez le serveur Python (`python server.py`).
2. Naviguez sur une page contenant un exercice ou du code.
3. L'extension scanne automatiquement (détection de changement ou de réseau).
4. **Résultat :** Une fenêtre discrète apparaît en bas de l'écran avec la solution générée par l'IA.
* *Note : Vous pouvez scroller dans la fenêtre de résultat sans perdre le focus de la page principale.*



---

<div align="center">
Made with ❤️ & Python
</div>

```

```
