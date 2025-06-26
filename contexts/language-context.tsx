"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "fr" | "rw"

type TranslationKeys = {
  // Navigation
  "nav.about": string;
  "nav.features": string;
  "nav.getStarted": string;
  "nav.profile": string;
  "nav.dashboard": string;
  "nav.logout": string;

  // Hero
  "hero.title": string;
  "hero.subtitle": string;
  "hero.description": string;
  "hero.playNow": string;
  "hero.learnMore": string;

  // Cards
  "card.knowledge": string;
  "card.action": string;
  "card.equality": string;
  "card.health": string;
  "card.knowledge.text": string;
  "card.action.text": string;
  "card.equality.text": string;
  "card.health.text": string;

  // About
  "about.title": string;
  "about.description": string;

  // Features
  "features.title": string;
  "features.subtitle": string;
  "features.purpose.title": string;
  "features.purpose.description": string;
  "features.experts.title": string;
  "features.experts.description": string;
  "features.fun.title": string;
  "features.fun.description": string;

  // CTA
  "cta.title": string;
  "cta.description": string;
  "cta.button": string;

  // Footer
  "footer.copyright": string;
  "footer.terms": string;
  "footer.privacy": string;

  // Language
  "language": string;

  // Auth
  "auth.title": string;
  "auth.subtitle": string;
  "auth.signin": string;
  "auth.register": string;
  "auth.name": string;
  "auth.email": string;
  "auth.password": string;
  "auth.confirmPassword": string;
  "auth.forgotPassword": string;
  "auth.noAccount": string;
  "auth.haveAccount": string;
  "auth.createAccount": string;
  "auth.signInButton": string;
  "auth.registerButton": string;
  "auth.or": string;
  "auth.privacyNotice": string;
  "auth.namePlaceholder": string;
  "auth.emailPlaceholder": string;
  "auth.passwordPlaceholder": string;
  "auth.username"?: string;
  "auth.usernamePlaceholder"?: string;
  "auth.phone"?: string;
  "auth.phonePlaceholder"?: string;

  // Profile
  "profile.title": string;
  "profile.subtitle": string;
  "profile.personalInfo": string;
  "profile.accountSettings": string;
  "profile.fullName": string;
  "profile.email": string;
  "profile.username": string;
  "profile.phone": string;
  "profile.changePhoto": string;
  "profile.uploadPhoto": string;
  "profile.removePhoto": string;
  "profile.saveChanges": string;
  "profile.cancel": string;
  "profile.changesSaved": string;
  "profile.accountCreated": string;
  "profile.lastLogin": string;
  "profile.deleteAccount": string;
  "profile.deleteWarning": string;
  "profile.phonePlaceholder": string;
  "profile.usernamePlaceholder": string;

  // Dashboard
  "dashboard.title": string;
  "dashboard.subtitle": string;
  "dashboard.overview": string;
  "dashboard.statistics": string;
  "dashboard.recentGames": string;
  "dashboard.totalGames": string;
  "dashboard.wins": string;
  "dashboard.losses": string;
  "dashboard.winRate": string;
  "dashboard.byDifficulty": string;
  "dashboard.easy": string;
  "dashboard.medium": string;
  "dashboard.hard": string;
  "dashboard.playAgain": string;
  "dashboard.viewAll": string;
  "dashboard.date": string;
  "dashboard.opponent": string;
  "dashboard.result": string;
  "dashboard.score": string;
  "dashboard.won": string;
  "dashboard.lost": string;
  "dashboard.cardsMatched": string;
  "dashboard.timeSpent": string;
  "dashboard.knowledgeCards": string;
  "dashboard.actionCards": string;
  "dashboard.equalityCards": string;
  "dashboard.healthCards": string;
  "dashboard.minutes": string;
  "dashboard.noGames": string;
  "dashboard.startPlaying": string;

  // Game
  "game.title": string;
  "game.rules.title": string;
  "game.rules.description": string;
  "game.rules.button": string;
  "game.health.title": string;
  "game.health.description": string;
  "game.health.button": string;
  "game.health.downloadPrompt": string;
  "game.health.downloadSuccess": string;
  "game.cards.title": string;
  "game.cards.description": string;
  "game.cards.button": string;

  // Waiting Room
  "waitingRoom.title": string;
  "waitingRoom.allConnected": string;
  "waitingRoom.waiting": string;
  "waitingRoom.playerGame": string;
  "waitingRoom.playersConnected": string;
  "waitingRoom.timeWaiting": string;
  "waitingRoom.cancel": string;
  "waitingRoom.startGame": string;
  "waitingRoom.starting": string;
  "waitingRoom.waiting_btn": string;
  "waitingRoom.connectedPlayers": string;
  "waitingRoom.allJoined": string;
  "waitingRoom.waitingToJoin": string;
  "waitingRoom.you": string;
  "waitingRoom.connected": string;
  "waitingRoom.readyToPlay": string;
  "waitingRoom.player": string;
  "waitingRoom.connecting": string;

  // Common
  "common.cancel": string;
  "common.download": string;

  // Connect
  "connect.title": string;
  "connect.description": string;
  "connect.createMatch": string;
  "connect.joinMatch": string;
  "connect.enterCode": string;
  "connect.connectionCode": string;
  "connect.join": string;
  "common.back": string;
}

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: keyof TranslationKeys) => string
}

const translations: Record<Language, TranslationKeys> = {
  en: {
    // Header
    "nav.about": "About",
    "nav.features": "Features",
    "nav.getStarted": "Get Started",
    "nav.profile": "Profile",
    "nav.dashboard": "Dashboard",
    "nav.logout": "Log Out",

    // Hero
    "hero.title": "🎴 Ishema Ryanjye ",
    "hero.subtitle": "Learn, Play, Grow!",
    "hero.description":
      "A fun, interactive card game that empowers young people with life-changing knowledge about reproductive health and gender equality.",
    "hero.playNow": "👉 Play Now",
    "hero.learnMore": "🎓 Learn More",

    // Cards
    "card.knowledge": "KNOWLEDGE",
    "card.action": "ACTION",
    "card.equality": "EQUALITY",
    "card.health": "HEALTH",
    "card.knowledge.text": "What are three ways to prevent STIs?",
    "card.action.text": "Role play: Discussing consent with a partner",
    "card.equality.text": "Name two gender stereotypes and how to challenge them",
    "card.health.text": "List three signs that indicate you should see a doctor",

    // About
    "about.title": "What is Ishema Ryanjye?",
    "about.description":
      "Ishema Ryanjye is more than just a card game — it's an engaging tool for learning about sexual and reproductive health, preventing STIs and unplanned pregnancies, and standing up against gender-based violence. Designed for teens and youth, it makes learning fun, safe, and social.",

    // Features
    "features.title": "Why It's Unique",
    "features.subtitle": "Discover what makes Ishema Ryanjye special",
    "features.purpose.title": "Designed with purpose",
    "features.purpose.description": "Each card carries visuals and prompts that encourage reflection and conversation.",
    "features.experts.title": "Backed by experts",
    "features.experts.description":
      "Developed by the Health Promotion Organization in partnership with Rwanda Biomedical Centre (RBC) and the World Health Organization (WHO).",
    "features.fun.title": "Educational and fun",
    "features.fun.description": "Players gain knowledge while enjoying meaningful gameplay.",

    // CTA
    "cta.title": "Ready to Learn While Playing?",
    "cta.description": "Join thousands of young people who are learning essential life skills through Ishema Ryanjye.",
    "cta.button": "Get Started Today",

    // Footer
    "footer.copyright": "© 2025 HPO. All rights reserved.",
    "footer.terms": "Terms of Service",
    "footer.privacy": "Privacy",

    // Language
    language: "Language",

    // Auth
    "auth.title": "Sign In or Create Account",
    "auth.subtitle": "Access your Ishema Ryanjye account",
    "auth.signin": "Sign In",
    "auth.register": "Register",
    "auth.name": "Name",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.forgotPassword": "Forgot Password?",
    "auth.noAccount": "Don't have an account?",
    "auth.haveAccount": "Already have an account?",
    "auth.createAccount": "Create Account",
    "auth.signInButton": "Sign In",
    "auth.registerButton": "Register",
    "auth.or": "OR",
    "auth.privacyNotice": "By signing up, you agree to our Terms of Service and Privacy Policy",
    "auth.namePlaceholder": "Enter your name",
    "auth.emailPlaceholder": "Enter your email",
    "auth.passwordPlaceholder": "Enter your password",
    "auth.username": "Username",
    "auth.usernamePlaceholder": "Choose a username",
    "auth.phone": "Phone",
    "auth.phonePlaceholder": "Enter your phone number",

       // Profile
       "profile.title": "Your Profile",
       "profile.subtitle": "Manage your personal information",
       "profile.personalInfo": "Personal Information",
       "profile.accountSettings": "Account Settings",
       "profile.fullName": "Full Name",
       "profile.email": "Email Address",
       "profile.username": "Username",
       "profile.phone": "Phone Number",
       "profile.changePhoto": "Change Photo",
       "profile.uploadPhoto": "Upload Photo",
       "profile.removePhoto": "Remove",
       "profile.saveChanges": "Save Changes",
       "profile.cancel": "Cancel",
       "profile.changesSaved": "Your changes have been saved",
       "profile.accountCreated": "Account created",
       "profile.lastLogin": "Last login",
       "profile.deleteAccount": "Delete Account",
       "profile.deleteWarning":
         "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
       "profile.phonePlaceholder": "Enter your phone number",
       "profile.usernamePlaceholder": "Choose a username",
   
       // Dashboard
       "dashboard.title": "Your Game Dashboard",
       "dashboard.subtitle": "Track your progress and achievements",
       "dashboard.overview": "Overview",
       "dashboard.statistics": "Game Statistics",
       "dashboard.recentGames": "Recent Games",
       "dashboard.totalGames": "Total Won Games",
       "dashboard.wins": "Wins",
       "dashboard.losses": "Losses",
       "dashboard.winRate": "Win Rate",
       "dashboard.byDifficulty": "Performance by Difficulty",
       "dashboard.easy": "Easy",
       "dashboard.medium": "Medium",
       "dashboard.hard": "Hard",
       "dashboard.playAgain": "Play Again",
       "dashboard.viewAll": "View All",
       "dashboard.date": "Date",
       "dashboard.opponent": "Opponent",
       "dashboard.result": "Result",
       "dashboard.score": "Score",
       "dashboard.won": "Won",
       "dashboard.lost": "Lost",
       "dashboard.cardsMatched": "Cards Matched",
       "dashboard.timeSpent": "Time Spent",
       "dashboard.knowledgeCards": "Knowledge Cards",
       "dashboard.actionCards": "Action Cards",
       "dashboard.equalityCards": "Equality Cards",
       "dashboard.healthCards": "Health Cards",
       "dashboard.minutes": "minutes",
       "dashboard.noGames": "You haven't played any games yet",
       "dashboard.startPlaying": "Start Playing",

    // Game
    "game.title": "Ishema Ryanjye",
    "game.rules.title": "Game Rules",
    "game.rules.description": "Learn how to play Ishema Ryanjye and understand the game mechanics.",
    "game.rules.button": "View Rules",
    "game.health.title": "Get Ishema Handbook",
    "game.health.description": "Download the complete Ishema Ryanjye handbook to learn more about reproductive health and well-being.",
    "game.health.button": "Get Handbook",
    "game.health.downloadPrompt": "Would you like to download the Ishema Ryanjye handbook?",
    "game.health.downloadSuccess": "Handbook download started!",
    "game.cards.title": "Card Meanings",
    "game.cards.description": "Understand the meaning and significance of each card in the game.",
    "game.cards.button": "View Cards",

       // Waiting Room
       "waitingRoom.title": "Waiting Room",
       "waitingRoom.allConnected": "All players connected! Starting game...",
       "waitingRoom.waiting": "Waiting for {0} more player{1} to join",
       "waitingRoom.playerGame": "{0}-Player Game",
       "waitingRoom.playersConnected": "Players Connected",
       "waitingRoom.timeWaiting": "Time Waiting",
       "waitingRoom.cancel": "Cancel",
       "waitingRoom.startGame": "Start Game",
       "waitingRoom.starting": "Starting Game...",
       "waitingRoom.waiting_btn": "Waiting...",
       "waitingRoom.connectedPlayers": "Connected Players",
       "waitingRoom.allJoined": "All players have joined!",
       "waitingRoom.waitingToJoin": "Waiting for players to join...",
       "waitingRoom.you": "You",
       "waitingRoom.connected": "Connected",
       "waitingRoom.readyToPlay": "Ready to play",
       "waitingRoom.player": "Player {0}",
       "waitingRoom.connecting": "Connecting...",

    // Common
    "common.cancel": "Cancel",
    "common.download": "Download",
    "common.back": "Back",

    // Connect
    "connect.title": "Connect to a Game",
    "connect.description": "Create a new match or join an existing one.",
    "connect.createMatch": "Create a New Match",
    "connect.joinMatch": "Join a Match",
    "connect.enterCode": "Enter the connection code to join an existing game.",
    "connect.connectionCode": "Connection Code",
    "connect.join": "Join",
  },
  fr: {
    // Header
    "nav.about": "À propos",
    "nav.features": "Caractéristiques",
    "nav.getStarted": "Commencer",
    "nav.profile": "Profil",
    "nav.dashboard": "Tableau de bord",
    "nav.logout": "Déconnexion",

    // Hero
    "hero.title": "🎴 Ishema Ryanjye",
    "hero.subtitle": "Apprendre, Jouer, Grandir!",
    "hero.description":
      "Un jeu de cartes amusant et interactif qui donne aux jeunes des connaissances qui changent leur vie sur la santé reproductive et l'égalité des sexes.",
    "hero.playNow": "👉 Jouer maintenant",
    "hero.learnMore": "🎓 En savoir plus",

    // Cards
    "card.knowledge": "CONNAISSANCE",
    "card.action": "ACTION",
    "card.equality": "ÉGALITÉ",
    "card.health": "SANTÉ",
    "card.knowledge.text": "Quelles sont trois façons de prévenir les IST ?",
    "card.action.text": "Jeu de rôle : Discuter du consentement avec un partenaire",
    "card.equality.text": "Nommez deux stéréotypes de genre et comment les défier",
    "card.health.text": "Énumérez trois signes indiquant que vous devriez consulter un médecin",

    // About
    "about.title": "Qu'est-ce que Ishema Ryanjye ?",
    "about.description":
      "Ishema Ryanjye est plus qu'un simple jeu de cartes — c'est un outil engageant pour apprendre sur la santé sexuelle et reproductive, prévenir les IST et les grossesses non planifiées, et lutter contre la violence basée sur le genre. Conçu pour les adolescents et les jeunes, il rend l'apprentissage amusant, sûr et social.",

    // Features
    "features.title": "Pourquoi c'est unique",
    "features.subtitle": "Découvrez ce qui rend Ishema Ryanjye spécial",
    "features.purpose.title": "Conçu avec un objectif",
    "features.purpose.description":
      "Chaque carte contient des visuels et des questions qui encouragent la réflexion et la conversation.",
    "features.experts.title": "Soutenu par des experts",
    "features.experts.description":
      "Développé par l'Organisation de Promotion de la Santé en partenariat avec le Centre Biomédical du Rwanda (RBC) et l'Organisation Mondiale de la Santé (OMS).",
    "features.fun.title": "Éducatif et amusant",
    "features.fun.description": "Les joueurs acquièrent des connaissances tout en profitant d'un jeu significatif.",

    // CTA
    "cta.title": "Prêt à apprendre en jouant ?",
    "cta.description":
      "Rejoignez des milliers de jeunes qui apprennent des compétences de vie essentielles grâce à Ishema Ryanjye.",
    "cta.button": "Commencez aujourd'hui",

    // Footer
    "footer.copyright": "© 2025 HPO. Tous droits réservés.",
    "footer.terms": "Conditions d'utilisation",
    "footer.privacy": "Confidentialité",

    // Language
    language: "Langue",

     // Auth
     "auth.title": "Connexion ou Création de Compte",
     "auth.subtitle": "Accédez à votre compte Ishema Ryanjye",
     "auth.signin": "Connexion",
     "auth.register": "Inscription",
     "auth.name": "Nom",
     "auth.email": "Email",
     "auth.password": "Mot de passe",
     "auth.confirmPassword": "Confirmer le mot de passe",
     "auth.forgotPassword": "Mot de passe oublié ?",
     "auth.noAccount": "Vous n'avez pas de compte ?",
     "auth.haveAccount": "Vous avez déjà un compte ?",
     "auth.createAccount": "Créer un compte",
     "auth.signInButton": "Se connecter",
     "auth.registerButton": "S'inscrire",
     "auth.or": "OU",
     "auth.privacyNotice": "En vous inscrivant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité",
     "auth.namePlaceholder": "Entrez votre nom",
     "auth.emailPlaceholder": "Entrez votre email",
     "auth.passwordPlaceholder": "Entrez votre mot de passe",


       // Profile
    "profile.title": "Votre Profil",
    "profile.subtitle": "Gérez vos informations personnelles",
    "profile.personalInfo": "Informations Personnelles",
    "profile.accountSettings": "Paramètres du Compte",
    "profile.fullName": "Nom Complet",
    "profile.email": "Adresse Email",
    "profile.username": "Nom d'Utilisateur",
    "profile.phone": "Numéro de Téléphone",
    "profile.changePhoto": "Changer la Photo",
    "profile.uploadPhoto": "Télécharger une Photo",
    "profile.removePhoto": "Supprimer",
    "profile.saveChanges": "Enregistrer les Modifications",
    "profile.cancel": "Annuler",
    "profile.changesSaved": "Vos modifications ont été enregistrées",
    "profile.accountCreated": "Compte créé",
    "profile.lastLogin": "Dernière connexion",
    "profile.deleteAccount": "Supprimer le Compte",
    "profile.deleteWarning":
      "Cette action ne peut pas être annulée. Cela supprimera définitivement votre compte et supprimera vos données de nos serveurs.",
    "profile.phonePlaceholder": "Entrez votre numéro de télé",
    "profile.usernamePlaceholder": "Choisissez un nom d'utilisateur",

    // Dashboard
    "dashboard.title": "Votre Tableau de Bord",
    "dashboard.subtitle": "Suivez votre progression et vos réalisations",
    "dashboard.overview": "Vue d'ensemble",
    "dashboard.statistics": "Statistiques de Jeu",
    "dashboard.recentGames": "Parties Récentes",
    "dashboard.totalGames": "Total des Parties Gagnées",
    "dashboard.wins": "Victoires",
    "dashboard.losses": "Défaites",
    "dashboard.winRate": "Taux de Victoire",
    "dashboard.byDifficulty": "Performance par Difficulté",
    "dashboard.easy": "Facile",
    "dashboard.medium": "Moyen",
    "dashboard.hard": "Difficile",
    "dashboard.playAgain": "Jouer à Nouveau",
    "dashboard.viewAll": "Voir Tout",
    "dashboard.date": "Date",
    "dashboard.opponent": "Adversaire",
    "dashboard.result": "Résultat",
    "dashboard.score": "Score",
    "dashboard.won": "Gagné",
    "dashboard.lost": "Perdu",
    "dashboard.cardsMatched": "Cartes Associées",
    "dashboard.timeSpent": "Temps Passé",
    "dashboard.knowledgeCards": "Cartes de Connaissance",
    "dashboard.actionCards": "Cartes d'Action",
    "dashboard.equalityCards": "Cartes d'Égalité",
    "dashboard.healthCards": "Cartes de Santé",
    "dashboard.minutes": "minutes",
    "dashboard.noGames": "Vous n'avez pas encore joué",
    "dashboard.startPlaying": "Commencer à Jouer",

    // Game
    "game.title": "Ishema Ryanjye",
    "game.rules.title": "Règles du Jeu",
    "game.rules.description": "Apprenez à jouer à Ishema Ryanjye et comprenez les mécaniques du jeu.",
    "game.rules.button": "Voir les Règles",
    "game.health.title": "Obtenir le Manuel Ishema",
    "game.health.description": "Téléchargez le manuel complet d'Ishema Ryanjye pour en savoir plus sur la santé reproductive et le bien-être.",
    "game.health.button": "Obtenir le Manuel",
    "game.health.downloadPrompt": "Voulez-vous télécharger le manuel Ishema Ryanjye ?",
    "game.health.downloadSuccess": "Téléchargement du manuel en cours...",
    "game.cards.title": "Signification des Cartes",
    "game.cards.description": "Comprenez la signification et l'importance de chaque carte dans le jeu.",
    "game.cards.button": "Voir les Cartes",

     // Waiting Room
     "waitingRoom.title": "Salle d'Attente",
     "waitingRoom.allConnected": "Tous les joueurs sont connectés! Démarrage du jeu...",
     "waitingRoom.waiting": "En attente de {0} joueur{1} supplémentaire{1}",
     "waitingRoom.playerGame": "Partie à {0} Joueurs",
     "waitingRoom.playersConnected": "Joueurs Connectés",
     "waitingRoom.timeWaiting": "Temps d'Attente",
     "waitingRoom.cancel": "Annuler",
     "waitingRoom.startGame": "Commencer la Partie",
     "waitingRoom.starting": "Démarrage du Jeu...",
     "waitingRoom.waiting_btn": "En Attente...",
     "waitingRoom.connectedPlayers": "Joueurs Connectés",
     "waitingRoom.allJoined": "Tous les joueurs ont rejoint!",
     "waitingRoom.waitingToJoin": "En attente de joueurs...",
     "waitingRoom.you": "Vous",
     "waitingRoom.connected": "Connecté",
     "waitingRoom.readyToPlay": "Prêt à jouer",
     "waitingRoom.player": "Joueur {0}",
     "waitingRoom.connecting": "Connexion...",

    // Common
    "common.cancel": "Annuler",
    "common.download": "Télécharger",
    "common.back": "Retour",

    // Connect
    "connect.title": "Se connecter à une partie",
    "connect.description": "Créez une nouvelle partie ou rejoignez-en une existante.",
    "connect.createMatch": "Créer une nouvelle partie",
    "connect.joinMatch": "Rejoindre une partie",
    "connect.enterCode": "Entrez le code de connexion pour rejoindre une partie existante.",
    "connect.connectionCode": "Code de connexion",
    "connect.join": "Rejoindre",
  },
  rw: {
    // Header
    "nav.about": "Ibyerekeye",
    "nav.features": "Ibiranga",
    "nav.getStarted": "Tangira",
    "nav.profile": "Umwirondoro",
    "nav.dashboard": "Ahabanza",
    "nav.logout": "Gusohoka",

    // Hero
    "hero.title": "🎴 Ishema Ryanjye",
    "hero.subtitle": "Kwiga, Gukina, Gukura!",
    "hero.description":
      "Umukino w'amakarita ushimishije kandi ufite ubushobozi bwo guha urubyiruko ubumenyi bugira ingaruka ku buzima bw'imyororokere n'uburinganire.",
    "hero.playNow": "👉 Kina Nonaha",
    "hero.learnMore": "🎓 Menya Byinshi",

    // Cards
    "card.knowledge": "UBUMENYI",
    "card.action": "IGIKORWA",
    "card.equality": "UBURINGANIRE",
    "card.health": "UBUZIMA",
    "card.knowledge.text": "Ni ubuhe buryo butatu bwo kwirinda indwara zandurira mu mibonano mpuzabitsina?",
    "card.action.text": "Gukina uruhare: Kuganira ku bwumvikane n'uwo mufatanyije",
    "card.equality.text": "Vuga imyumvire ibiri y'igitsina n'uburyo bwo kuyihangana",
    "card.health.text": "Vuga ibimenyetso bitatu bigaragaza ko ukwiye kubona muganga",

    // About
    "about.title": "Ishema Ryanjye ni iki?",
    "about.description":
      "Ishema Ryanjye ni ikirenze umukino w'amakarita — ni igikoresho gishimishije cyo kwiga ku buzima bw'imyororokere, kwirinda indwara zandurira mu mibonano mpuzabitsina n'inda zitateganyijwe, no kurwanya ihohoterwa rishingiye ku gitsina. Ryateguriwe abangavu n'ingimbi, rituma kwiga biba ikintu gishimishije, gifite umutekano kandi mbonezamubano.",

    // Features
    "features.title": "Impamvu Ridasanzwe",
    "features.subtitle": "Menya icyatumye Ishema Ryanjye ridasanzwe",
    "features.purpose.title": "Ryateguwe ku ntego",
    "features.purpose.description": "Buri karita ifite amashusho n'ibibazo bishishikariza gutekereza no kuganira.",
    "features.experts.title": "Rishyigikiwe n'impuguke",
    "features.experts.description":
      "Ryateguwe n'Umuryango Uteza Imbere Ubuzima mu bufatanye na Rwanda Biomedical Centre (RBC) n'Umuryango w'Abibumbye Wita ku Buzima (WHO).",
    "features.fun.title": "Rifite inyigisho kandi rishimishije",
    "features.fun.description": "Abakinnyi bunguka ubumenyi mu gihe bishimira umukino ufite akamaro.",

    // CTA
    "cta.title": "Witeguye Kwiga Ukina?",
    "cta.description":
      "Ifatanye n'ibihumbi by'urubyiruko biga ubumenyi bw'ingenzi mu buzima binyuze muri Ishema Ryanjye.",
    "cta.button": "Tangira Uyu Munsi",

    // Footer
    "footer.copyright": "© 2025 HPO. Uburenganzira bwose bwihariwe.",
    "footer.terms": "Amabwiriza y'Imikorere",
    "footer.privacy": "Ibanga",

    // Language
    language: "Ururimi",

       // Auth
       "auth.title": "Injira cyangwa Iyandikishe",
       "auth.subtitle": "Injira mu konte yawe ya Ishema Ryanjye",
       "auth.signin": "Injira",
       "auth.register": "Iyandikishe",
       "auth.name": "Amazina Yombi",
       "auth.email": "Imeri",
       "auth.password": "Ijambo ry'ibanga",
       "auth.confirmPassword": "Emeza ijambo ry'ibanga",
       "auth.forgotPassword": "Wibagiwe ijambo ry'ibanga?",
       "auth.noAccount": "Nta konte ufite?",
       "auth.haveAccount": "Usanzwe ufite konte?",
       "auth.createAccount": "Fungura Konte",
       "auth.signInButton": "Injira",
       "auth.registerButton": "Iyandikishe",
       "auth.or": "cyangwa",
       "auth.privacyNotice": "Amakuru yawe abikwa mu buryo bwizewe kandi ntabwo asangirwa",
       "auth.namePlaceholder": "Amazina Yawe",
       "auth.emailPlaceholder": "wowe@imeri.com",
       "auth.passwordPlaceholder": "••••••••",
       "auth.username": "Izina ry'Ukoresha",
       "auth.usernamePlaceholder": "Hitamo izina ry'ukoresha",
       "auth.phone": "Nomero ya Telefoni",
       "auth.phonePlaceholder": "Andika nomero ya telefoni yawe",

        // Profile
        "profile.title": "Umwirondoro Wawe",
        "profile.subtitle": "Gucunga amakuru yawe bwite",
        "profile.personalInfo": "Amakuru Bwite",
        "profile.accountSettings": "Igenamiterere ry'Akaunti",
        "profile.fullName": "Amazina Yombi",
        "profile.email": "Aderesi ya Imeyili",
        "profile.username": "Izina ry'Ukoresha",
        "profile.phone": "Nomero ya Telefoni",
        "profile.changePhoto": "Guhindura Ifoto",
        "profile.uploadPhoto": "Kohereza Ifoto",
        "profile.removePhoto": "Gukuraho",
        "profile.saveChanges": "Kubika Impinduka",
        "profile.cancel": "Kureka",
        "profile.changesSaved": "Impinduka zawe zabitswe",
        "profile.accountCreated": "Konti yaremwe",
        "profile.lastLogin": "Igihe waheruka kwinjira",
        "profile.deleteAccount": "Gusiba Konti",
        "profile.deleteWarning":
          "Iki gikorwa ntikishobora gusubirwaho. Bizasiba burundu konti yawe kandi bikure amakuru yawe ku byuma byacu.",
        "profile.phonePlaceholder": "Andika nomero ya telefoni yawe",
        "profile.usernamePlaceholder": "Hitamo izina ry'ukoresha",
    
        // Dashboard
        "dashboard.title": "Ikibaho Cyawe cy'Imikino",
        "dashboard.subtitle": "Kurikirana iterambere n'ibyo wagezeho",
        "dashboard.overview": "Incamake",
        "dashboard.statistics": "Imibare y'Imikino",
        "dashboard.recentGames": "Imikino ya Vuba",
        "dashboard.totalGames": "Imikino watsinze",
        "dashboard.wins": "Intsinzi",
        "dashboard.losses": "Gutsindwa",
        "dashboard.winRate": "Igipimo cy'Intsinzi",
        "dashboard.byDifficulty": "Imikorere ku Rwego rw'Ubukana",
        "dashboard.easy": "Byoroshye",
        "dashboard.medium": "Biringaniye",
        "dashboard.hard": "Bigoye",
        "dashboard.playAgain": "Ongera Ukine",
        "dashboard.viewAll": "Reba Byose",
        "dashboard.date": "Itariki",
        "dashboard.opponent": "Uwo Muhanganye",
        "dashboard.result": "Igisubizo",
        "dashboard.score": "Amanota",
        "dashboard.won": "Watsinze",
        "dashboard.lost": "Watsinzwe",
        "dashboard.cardsMatched": "Amakarita Ahuje",
        "dashboard.timeSpent": "Igihe Cyakoreshejwe",
        "dashboard.knowledgeCards": "Amakarita y'Ubumenyi",
        "dashboard.actionCards": "Amakarita y'Ibikorwa",
        "dashboard.equalityCards": "Amakarita y'Uburinganire",
        "dashboard.healthCards": "Amakarita y'Ubuzima",
        "dashboard.minutes": "iminota",
        "dashboard.noGames": "Ntabwo wakinye imikino",
        "dashboard.startPlaying": "Tangira Gukina",

    // Game
    "game.title": "Ishema Ryanjye",
    "game.rules.title": "Amabwiriza y'Umukino",
    "game.rules.description": "Menya uburyo bwo gukina Ishema Ryanjye no gusobanukirwa imikorere y'umukino.",
    "game.rules.button": "Reba Amabwiriza",
    "game.health.title": "Gufata Igitabo cy'Ishema",
    "game.health.description": "Kuramo igitabo cyuzuye cy'Ishema Ryanjye kugirango wize byinshi ku buzima bw'imyororokere n'ubuzima bwiza.",
    "game.health.button": "Gufata Igitabo",
    "game.health.downloadPrompt": "Urashaka gukuramo igitabo cy'Ishema Ryanjye?",
    "game.health.downloadSuccess": "byatangiy!",
    "game.cards.title": "Ibisobanuro by'Amakarita",
    "game.cards.description": "Sobanukirwa ibisobanuro n'ingaruka z'amakarita yose muri uyu mukino.",
    "game.cards.button": "Reba Amakarita",

      // Waiting Room
      "waitingRoom.title": "Icyumba cyo Gutegereza",
      "waitingRoom.allConnected": "Abakinnyi bose bahuye! Gutangira umukino...",
      "waitingRoom.waiting": "Gutegereza {0} umukinnyi{1} ukenewe",
      "waitingRoom.playerGame": "Umukino w'Abakinnyi {0}",
      "waitingRoom.playersConnected": "Abakinnyi Bahuye",
      "waitingRoom.timeWaiting": "Igihe cyo Gutegereza",
      "waitingRoom.cancel": "Kureka",
      "waitingRoom.startGame": "Tangira Umukino",
      "waitingRoom.starting": "Gutangira Umukino...",
      "waitingRoom.waiting_btn": "Gutegereza...",
      "waitingRoom.connectedPlayers": "Abakinnyi Bahuye",
      "waitingRoom.allJoined": "Abakinnyi bose binjiye!",
      "waitingRoom.waitingToJoin": "Gutegereza abakinnyi kwinjira...",
      "waitingRoom.you": "Wowe",
      "waitingRoom.connected": "Wahuye",
      "waitingRoom.readyToPlay": "Witeguye gukina",
      "waitingRoom.player": "Umukinnyi {0}",
      "waitingRoom.connecting": "Kwinjira...",

    // Common
    "common.cancel": "Siba",
    "common.download": "Manura",
    "common.back": "Subira inyuma",

    // Connect
    "connect.title": "Injira mu mukino",
    "connect.description": "Kora umukino mushya cyangwa winjire mu watangiye.",
    "connect.createMatch": "Kora umukino mushya",
    "connect.joinMatch": "Injira mu mukino",
    "connect.enterCode": "Shyiramo kode kugirango winjire mu mukino.",
    "connect.connectionCode": "Kode y'umukino",
    "connect.join": "Injira",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && ["en", "fr", "rw"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  const t = (key: keyof TranslationKeys): string => {
    return (translations[language] as TranslationKeys)[key] || key;
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
