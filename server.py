import uvicorn
import httpx
import json
import logging
from fastapi import FastAPI, HTTPException, Header, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any, Union

API_SECRET = "ndAnPZTLY32KMCwSADQUdPM"
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "qwen3-coder:30b"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NetWatcher")

app = FastAPI()

@app.get("/")
async def root():
    return {
        "status": "OK", 
        "service": "NetWatcher API",
        "model": MODEL_NAME,
        "routes": ["/analyze"]
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]  # ← Ajoute ça
)

# Ajoute une fonction pour forcer les headers CORS
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# Ajoute un handler pour OPTIONS (preflight)
@app.options("/analyze")
async def options_analyze():
    return JSONResponse(
        content={"status": "ok"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods":  "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        }
    )

class Payload(BaseModel):
    url: str
    data: Union[Dict[str, Any], str]
    dataType: str

@app.post("/analyze")
async def analyze(payload: Payload, x_api_key: Optional[str] = Header(None)):
    url = payload.url
    data = payload.data
    data_type = payload.dataType

    # Conversion en string
    if data_type == 'json':
        data_str = json.dumps(data, ensure_ascii=False, indent=2)
    else:  # html, text, etc.
        data_str = str(data)

    print(f"\n{'='*60}")
    print(f"[CAPTURE] TYPE: {data_type.upper()}")
    print(f"[CAPTURE] SOURCE: {url}")
    print(f"[CAPTURE] TAILLE:  {len(data_str)} chars")
    print(f"[CAPTURE] APERÇU:")
    print(data_str[: 800])  # Affiche plus pour debug
    print(f"{'='*60}\n")

    # Vérification API Key
    if x_api_key != API_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")

    # 🔥 DÉTECTION AMÉLIORÉE :  Ne skip que les pages vraiment inutiles
    useless_keywords = ['loading', 'modal', 'template', 'navigation', 'menu', 'header', 'footer']
    if all(keyword not in data_str.lower() for keyword in ['question', 'exercise', 'problem', 'task', 'implement', 'write', 'create', 'function', 'class', 'code']):
        # Si aucun mot-clé pertinent → probable que c'est inutile
        if any(uk in data_str.lower() for uk in useless_keywords) and len(data_str) < 1000:
            print(f"[VIGILE] Page inutile détectée -> R.A.S")
            return {"result": "R.A.S"}

    # Troncature
    limit = 5000  # Réduit pour éviter la surcharge
    if len(data_str) > limit:
        print(f"[WARN] Données TRONQUÉES ({len(data_str)} > {limit})")
        data_str = data_str[:limit] + "\n\n[... CONTENU TRONQUÉ]"

    print(f"[IA] Envoi à {MODEL_NAME}...")

    # 🔥 PROMPT UNIVERSEL AMÉLIORÉ
    # Prompt "Chirurgical" - Optimisé pour Qwen/Ollama
    # Prompt "Chercheur d'Or" - Analyse Sémantique (Pas de lignes fixes)
    # Prompt "Clean Print" - Affiche les résultats proprement via des print()
    # Prompt "Solveur Autonome" - Génère la solution depuis zéro
    # Prompt "Développeur Dynamique" - Force l'IA à coder la logique, pas le résultat
    prompt = f"""
    [RÔLE]
    Tu es un développeur Python Senior qui passe un test technique automatisé.
    Le code que tu produis sera testé sur DES MILLIERS de cas différents.

    [CONTENU_BRUT]
    {data_str}
    [/CONTENU_BRUT]

    [RÈGLES D'OR DU CODE]
    1. LOGIQUE GÉNÉRIQUE OBLIGATOIRE : 
       - Ne devine jamais les valeurs. Si l'énoncé dit "Prendre les 4 premiers", tu codes `liste[:4]`, tu n'écris PAS `['Carte1', 'Carte2']`.
       - Ton code doit fonctionner même si la liste d'entrée change totalement.

    2. GESTION DES VARIABLES D'ENTRÉE :
       - Repère la variable donnée dans l'énoncé (ex: `deck`, `n`, `tableau`).
       - CONSIDÈRE QU'ELLE EXISTE DÉJÀ. Ne la redéfinis pas (sinon tu écrases les données du testeur !).
       - Utilise cette variable directement dans ton code.

    3. GESTION DES SORTIES :
       - Crée exactement les variables demandées (`starting_hand`, `res`, etc.).
       - Si l'énoncé demande d'afficher, utilise `print()`.

    [SCÉNARIO TYPE]
    Énoncé : "À partir de la liste L, créez sub contenant les 2 premiers éléments."
    
    ❌ MAUVAISE RÉPONSE (Zéro pointé) :
    L = [1, 2, 3]  # Tu écrases l'entrée du prof !
    sub = [1, 2]   # Tu hardcodes le résultat !

    ✅ BONNE RÉPONSE (100%) :
    # Je suppose que L existe déjà
    sub = L[:2]

    [TA MISSION]
    Extrais l'énoncé du contenu ci-dessus et génère le code Python dynamique correspondant.
    Réponds UNIQUEMENT par le bloc de code.
    """

    async with httpx.AsyncClient(timeout=600.0) as client:
        try:
            resp = await client.post(OLLAMA_URL, json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "keep_alive": "30m",
                "options": {
                    "temperature": 0.2,
                    "num_ctx": 8192,
                    "top_p": 0.9
                }
            })
           
            if resp.status_code != 200:
                print(f"[ERROR] Ollama HTTP {resp.status_code}")
                return {"result": "Erreur Ollama"}
           
            ai_text = resp.json().get("response", "R.A.S").strip()
           
            print(f"\n[IA] RÉPONSE ({len(ai_text)} chars):")
            print(ai_text[:500])
            print("\n")
           
            # Si réponse trop courte ou vide
            if len(ai_text) < 5:
                return {"result": "R.A.S"}
           
            return {"result": ai_text}
           
        except Exception as e:
            print(f"[ERROR] {str(e)}")
            return {"result": f"Erreur: {str(e)}"}

if __name__ == "__main__":
    print("[🚀 SERVER] Démarrage sur http://0.0.0.0:5000")
    print(f"[🤖 IA] Modèle: {MODEL_NAME}")
    print(f"[🔑 API] Clé requise: {API_SECRET}\n")
    uvicorn.run(app, host="0.0.0.0", port=5000)
