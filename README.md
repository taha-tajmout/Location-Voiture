# Mehdi Luxury Cars — Site de location de voitures et motos

Site vitrine + réservation par WhatsApp, avec un espace administrateur complet
(voitures, motos, prix, photos, disponibilité, numéros de réservation, Instagram, TikTok).

- **Frontend** : React 18 + Vite + React Router (noir & or, responsive)
- **Backend** : Spring Boot 3.3 (Java 17) + base H2 en fichier (aucune installation de base de données)

---

## 1. Identifiants administrateur

| | |
|---|---|
| Identifiant | `admin` |
| Mot de passe | `MehdiLuxury2026` |
| Page de connexion | http://localhost:5173/admin/login |

> Changez le mot de passe dès la première connexion : **Admin → Mot de passe**.

---

## 2. Démarrer le site (méthode simple)

Double-cliquez sur les fichiers, **dans cet ordre**, et laissez les fenêtres noires ouvertes :

0. `0-TOUT-ARRETER.bat` → **à lancer d'abord si vous aviez déjà essayé de démarrer** (libère les ports)
1. `1-DEMARRER-BACKEND.bat` → attendez le message `Started MehdiLuxuryApplication` (~25 s la 1re fois)
2. `2-DEMARRER-SITE.bat` → le navigateur s'ouvre tout seul

Puis dans Chrome :

- Site public : **http://localhost:5173**
- Espace admin : **http://localhost:5173/admin/login**

Pour arrêter : fermez les deux fenêtres (ou `Ctrl + C` dans chacune).

---

## 3. Démarrer à la main (terminal)

Deux terminaux séparés, ouverts tous les deux.

**Terminal 1 — backend :**

```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 — frontend :**

```bash
cd frontend
npm install
npm run dev
```

---

## 4. Ça ne marche pas dans Chrome ?

**Dans 9 cas sur 10, la solution est : fermer toutes les fenêtres noires, lancer `0-TOUT-ARRETER.bat`, puis reprendre à l'étape 1.**

| Symptôme | Cause | Solution |
|---|---|---|
| `The file is locked: ...mehdiluxury.mv.db` | Un backend tourne **déjà** | `0-TOUT-ARRETER.bat` puis relancer |
| `Database may be already in use` | Idem | Idem |
| `Port 5173 is in use, trying another one` → 5174 | Un site tourne **déjà** | `0-TOUT-ARRETER.bat` puis relancer |
| `Port 8080 already in use` | Idem côté backend | Idem |
| « Ce site est inaccessible » sur :5173 | Le frontend n'est pas lancé | Lancez `2-DEMARRER-SITE.bat` |
| Le site s'affiche mais **aucune voiture** | Le backend n'est pas lancé | Lancez `1-DEMARRER-BACKEND.bat` |
| « Erreur 500 » à la connexion admin | Backend non démarré | Idem |
| `Invalid CORS request` à la connexion | Backend démarré avant la correction CORS | Redémarrez `1-DEMARRER-BACKEND.bat` |
| Page noire / vide | Cache navigateur | `Ctrl + Shift + R` |
| `.\mvnw : n'est pas reconnu` | Wrapper absent (corrigé) | `mvn spring-boot:run` marche aussi |

L'image de fond de l'accueil et la police viennent d'Internet : **sans connexion**, le haut
de la page apparaît noir, mais le texte et les véhicules restent visibles. Vous pouvez
remplacer cette image dans **Admin → Paramètres → Image de fond**.

Ne tapez pas juste `localhost` : il faut **http://localhost:5173** (avec le port).

---

## 5. Ce que l'admin peut modifier

**Admin → Voitures & motos**
- Ajouter / modifier / supprimer une voiture ou une moto
- Prix par jour, par semaine, par mois, caution
- Photos (téléversement depuis le PC **ou** URL) + galerie
- Marque, catégorie, année, boîte, carburant, places, portes, cylindrée
- Disponible / indisponible (bascule en un clic dans la liste)
- Mise en avant sur la page d'accueil, ordre d'affichage

**Admin → Paramètres du site**
- Les **deux numéros de réservation** (0661536755 et 0645424295) + indicatif pays
- Message WhatsApp pré-rempli
- Instagram, TikTok, Facebook, email, adresse, horaires
- Titre, sous-titre et image de la page d'accueil, texte de présentation
- Bandeau d'annonce (promo) en haut du site

**Admin → Réservations**
- Toutes les demandes envoyées depuis le site
- Statut : Nouvelle / Confirmée / Terminée / Annulée
- Bouton WhatsApp pour répondre directement au client

---

## 6. Le parcours client

1. Il parcourt les voitures ou les motos et ouvre une fiche
2. Il remplit le formulaire (nom, téléphone, dates, lieu) — l'estimation du prix s'affiche
3. Il clique sur **Réserver sur WhatsApp** → WhatsApp s'ouvre avec le message pré-rempli
4. La demande est aussi enregistrée dans **Admin → Réservations**

Le bouton WhatsApp flottant (en bas à droite) et la page Contact laissent choisir
entre les deux numéros.

---

## 7. Mettre votre vrai logo

Enregistrez votre logo sous **`frontend/public/logo.png`**.
Il est utilisé automatiquement partout (menu, pied de page, page de connexion).
Sans ce fichier, un logo vectoriel de secours aux mêmes couleurs est affiché.

---

## 8. Structure du projet

```
MehdiLuxuryCar/
├── 1-DEMARRER-BACKEND.bat
├── 2-DEMARRER-SITE.bat
├── backend/
│   ├── pom.xml
│   ├── data/                 <- base H2 (créée au 1er démarrage)
│   ├── uploads/              <- photos téléversées
│   └── src/main/java/com/mehdiluxury/
│       ├── model/            Vehicle, SiteSettings, Reservation, AdminUser
│       ├── repo/             accès base de données
│       ├── security/         jetons signés + filtre /api/admin/**
│       ├── controller/       Auth, Public, Admin, Upload
│       └── config/           CORS, images statiques, données de départ
└── frontend/
    ├── public/logo-mark.svg  <- logo de secours
    └── src/
        ├── pages/            Accueil, Voitures, Motos, Fiche, Contact
        ├── admin/            Connexion, Tableau de bord, Véhicules, Réservations, Paramètres
        ├── components/       Navbar, Footer, Carte véhicule, WhatsApp flottant
        └── utils/format.js   prix, téléphones, liens WhatsApp
```

---

## 9. Configuration

Tout est dans `backend/src/main/resources/application.properties` :

```properties
app.admin.username=admin
app.admin.password=MehdiLuxury2026
app.auth.secret=...          # à changer avant une mise en ligne
server.port=8080
```

> Le compte admin n'est créé qu'au **tout premier** démarrage.
> Pour repartir de zéro (données + compte), supprimez le dossier `backend/data/`.

Base de données consultable : http://localhost:8080/h2-console
(JDBC URL `jdbc:h2:file:./data/mehdiluxury`, utilisateur `sa`, sans mot de passe)

---

## 10. Mise en ligne (plus tard)

```bash
cd frontend && npm run build      # génère frontend/dist/
cd backend  && mvn clean package  # génère backend/target/*.jar
```

Il faudra alors :
- remplacer `app.auth.secret` par une valeur secrète,
- changer le mot de passe admin,
- servir `frontend/dist/` derrière le même domaine que l'API (ou ajuster `app.cors.origins`).
