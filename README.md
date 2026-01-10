# Scan-texte-extension-chrome

Network Data Analyzer

Solution d'analyse et d'interception de flux de données en temps réel sous forme d'extension de navigateur. Ce système permet l'extraction de contenus textuels, l'interception de requêtes réseau et l'analyse automatisée via un backend distant.
Architecture technique

Le projet repose sur quatre composants principaux :

- Background Script : Gère la persistance de la communication avec l'API, les mécanismes de tentatives (retries) et le maintien de l'exécution du service worker.
- Content Script : Orchestre l'extraction du texte visible, gère l'état local (clés API, paramètres de scan) et injecte l'interface utilisateur.
- Injector Script : S'exécute directement dans le contexte de la page pour intercepter les appels Fetch et XMLHttpRequest via des proxies natifs.
- Manifest : Définit les permissions et les points d'entrée de l'extension.

Fonctionnalités principales
- Interception réseau : Capture des flux JSON et HTML circulant sur la page.
- Extraction optimisée : Algorithme de sélection de contenu pour traiter les documents volumineux sans saturation mémoire.
- Interface isolée : Utilisation du Shadow DOM pour garantir l'absence de conflits visuels avec les feuilles de style des sites hôtes.
- Mécanisme anti-doublon : Hachage de contenu intégré pour éviter l'analyse répétitive de données identiques.
- Discrétion : Masquage des entrées de performance liées à l'extension pour minimiser l'empreinte de détection.

Installation
- Télécharger les sources du projet dans un dossier local.
- Accéder à l'adresse chrome://extensions/ dans le navigateur.
- Activer le mode développeur.
- Sélectionner l'option "Charger l'extension non empaquetée" et pointer vers le dossier du projet.

Configuration

L'extension nécessite une URL de backend valide définie dans les constantes API_URL des fichiers sources. Une clé API doit également être renseignée dans l'interface de l'extension pour autoriser les requêtes vers le serveur d'analyse.
Utilisation

Une fois activée, l'extension analyse automatiquement les changements de contenu et les flux réseau. Les résultats de l'analyse sont affichés via une interface superposée discrète en bas de l'écran. Un verrou logiciel empêche l'envoi de nouvelles requêtes tant qu'une analyse est en cours de traitement.
