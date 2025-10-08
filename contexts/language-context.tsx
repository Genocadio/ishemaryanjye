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
  "hero.readHealthInfo": string;

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

  // Game Rules Content
  "game.rules.gameOverview": string;
  "game.rules.gameSetup": string;
  "game.rules.gameplayRules": string;
  "game.rules.specialCardRules": string;
  "game.rules.scoring": string;
  "game.rules.overview1": string;
  "game.rules.overview2": string;
  "game.rules.overview3": string;
  "game.rules.overview4": string;
  "game.rules.setup1": string;
  "game.rules.setup2": string;
  "game.rules.gameplay1": string;
  "game.rules.gameplay2": string;
  "game.rules.gameplay3": string;
  "game.rules.gameplay4": string;
  "game.rules.gameplay5": string;
  "game.rules.gameplay6": string;
  "game.rules.gameplay7": string;
  "game.rules.special1": string;
  "game.rules.special2": string;
  "game.rules.special3": string;
  "game.rules.scoring1": string;
  "game.rules.scoring2": string;
  "game.rules.scoring3": string;

  // Health Information Content
  "game.health.modalTitle": string;
  "game.health.subtopic": string;
  "game.health.subtopics": string;
  "game.health.primary": string;
  "game.health.tags": string;
  "game.health.type": string;
  "game.health.card": string;
  "game.health.views": string;
  "game.health.subtopicDetails": string;
  "game.health.contentType": string;
  "game.health.difficulty": string;
  "game.health.cardAssociation": string;
  "game.health.totalViews": string;
  "game.health.items": string;
  "game.health.noContent": string;
  "game.health.close": string;

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
  "common.loading": string;

  // Connect
  "connect.title": string;
  "connect.description": string;
  "connect.createMatch": string;
  "connect.joinMatch": string;
  "connect.enterCode": string;
  "connect.connectionCode": string;
  "connect.join": string;
  "connect.resumeGame": string;
  "connect.creating": string;

  // Game Selection
  "gameSelection.title": string;
  "gameSelection.singlePlayer": string;
  "gameSelection.singlePlayerDescription": string;
  "gameSelection.playerVsAi": string;
  "gameSelection.quickGame": string;
  "gameSelection.playImmediately": string;
  "gameSelection.multiplayer": string;
  "gameSelection.multiplayerDescription": string;
  "gameSelection.players": string;
  "gameSelection.quickDuel": string;
  "gameSelection.standardTeamGame": string;
  "gameSelection.largeGroupMatch": string;
  "gameSelection.playWithFriends": string;
  "gameSelection.requiresSignIn": string;
  "gameSelection.loading": string;

  // Multiplayer
  "multiplayer.title": string;
  "multiplayer.lobby": string;
  "multiplayer.matchId": string;
  "multiplayer.waitingForPlayers": string;
  "multiplayer.startingGame": string;
  "multiplayer.inviteCodes": string;
  "multiplayer.shareCode": string;
  "multiplayer.team1": string;
  "multiplayer.team2": string;
  "multiplayer.team": string;
  "multiplayer.waitingForPlayersToJoin": string;
  "multiplayer.connected": string;
  "multiplayer.disconnected": string;
  "multiplayer.matchPaused": string;
  "multiplayer.matchResumed": string;
  "multiplayer.reconnecting": string;
  "multiplayer.exitGame": string;
  "multiplayer.playAgain": string;
  "multiplayer.matchOver": string;
  "multiplayer.congratulations": string;
  "multiplayer.yourTeamWon": string;
  "multiplayer.yourTeamLost": string;
  "multiplayer.yourScore": string;
  "multiplayer.opponentScore": string;
  "multiplayer.chooseCard": string;
  "multiplayer.answerQuestion": string;
  "multiplayer.questionCompleted": string;
  "multiplayer.readyForAnotherMatch": string;
  "multiplayer.funFact": string;
  "multiplayer.close": string;
  "multiplayer.submitAnswer": string;
  "multiplayer.cancel": string;
  "multiplayer.selectCorrectAnswers": string;
  "multiplayer.correct": string;
  "multiplayer.incorrect": string;
  "multiplayer.earnedMarks": string;
  "multiplayer.correctAnswer": string;

  // Contact Form
  "contact.title": string;
  "contact.description": string;
  "contact.button": string;
  "contact.form.title": string;
  "contact.form.requestType": string;
  "contact.form.person": string;
  "contact.form.organization": string;
  "contact.form.fullName": string;
  "contact.form.organizationName": string;
  "contact.form.fullNamePlaceholder": string;
  "contact.form.organizationNamePlaceholder": string;
  "contact.form.district": string;
  "contact.form.sector": string;
  "contact.form.street": string;
  "contact.form.email": string;
  "contact.form.phone": string;
  "contact.form.notes": string;
  "contact.form.districtPlaceholder": string;
  "contact.form.sectorPlaceholder": string;
  "contact.form.streetPlaceholder": string;
  "contact.form.emailPlaceholder": string;
  "contact.form.phonePlaceholder": string;
  "contact.form.notesPlaceholder": string;
  "contact.form.termsAgreement": string;
  "contact.form.submit": string;
  "contact.form.cancel": string;
  "contact.form.submitting": string;
  "contact.form.success": string;
  "contact.form.error": string;
  "contact.form.submitted": string;
  "contact.form.submittedMessage": string;
  "contact.form.requiredFields": string;
  "contact.form.termsRequired": string;

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
    "hero.title": "Ishema Ryanjye ",
    "hero.subtitle": "Play While Learning",
    "hero.description":
      "A fun, interactive card game that empowers young people with life-changing knowledge about reproductive health and gender equality.",
    "hero.playNow": "👉 Play Now",
    "hero.learnMore": "🎓 Learn More",
    "hero.readHealthInfo": "🏥 Read Health Info",

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
    "game.health.title": "Health Information",
    "game.health.description": "Access comprehensive educational content about reproductive health, gender equality, and well-being.",
    "game.health.button": "Read Information",
    "game.health.downloadPrompt": "Would you like to download the Ishema Ryanjye handbook?",
    "game.health.downloadSuccess": "Handbook download started!",
    "game.cards.title": "Card Meanings",
    "game.cards.description": "Understand the meaning and significance of each card in the game.",
    "game.cards.button": "View Cards",

    // Game Rules Content
    "game.rules.gameOverview": "Game Overview",
    "game.rules.gameSetup": "Game Setup",
    "game.rules.gameplayRules": "Gameplay Rules",
    "game.rules.specialCardRules": "Special Card Rules",
    "game.rules.scoring": "Scoring",
    "game.rules.overview1": "The game follows standard card game rules.",
    "game.rules.overview2": "Can be played between 2, 4, 6 players.",
    "game.rules.overview3": "Cards contain different symbols (images) teaching reproductive health, gender-based violence, and promoting equality.",
    "game.rules.overview4": "This card game is mainly for youth aged 10-24.",
    "game.rules.setup1": "It's good to read this book and other materials about reproductive health before playing.",
    "game.rules.setup2": "Teams can use this book and other approved materials to find answers.",
    "game.rules.gameplay1": "The goal is to answer questions correctly about the cards.",
    "game.rules.gameplay2": "When a team wins, they ask a question to the losing team.",
    "game.rules.gameplay3": "If the answer is correct, the goal is removed or becomes dead.",
    "game.rules.gameplay4": "If the answer is wrong, the goal is counted.",
    "game.rules.gameplay5": "When there's a tie, use another knowledgeable person in the team.",
    "game.rules.gameplay6": "You can ask any question related to the card's image or numbers.",
    "game.rules.gameplay7": "The game ends when all cards are played.",
    "game.rules.special1": "When Mr. takes Queen, the person with Queen asks questions.",
    "game.rules.special2": "When three cards of the same suit are played first, the player asks questions.",
    "game.rules.special3": "When Ace is played first, use rules similar to Mr. and Queen.",
    "game.rules.scoring1": "Two goals are scored when a team can't play (15 points in 2 or 6 player game or 30 in 4 player game).",
    "game.rules.scoring2": "Other goals can be created during the game.",
    "game.rules.scoring3": "If teams tie, play again with the winning team scoring two goals.",

    // Health Information Content
    "game.health.modalTitle": "Game Information & Educational Content",
    "game.health.subtopic": "subtopic",
    "game.health.subtopics": "subtopics",
    "game.health.primary": "Primary",
    "game.health.tags": "Tags:",
    "game.health.type": "Type:",
    "game.health.card": "Card:",
    "game.health.views": "Views:",
    "game.health.subtopicDetails": "Subtopic Details",
    "game.health.contentType": "Content Type:",
    "game.health.difficulty": "Difficulty:",
    "game.health.cardAssociation": "Card Association:",
    "game.health.totalViews": "Total Views:",
    "game.health.items": "Items:",
    "game.health.noContent": "No content available at the moment.",
    "game.health.close": "Close",

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
    "common.loading": "Loading...",
    "common.back": "Back",

    // Connect
    "connect.title": "Connect to a Game",
    "connect.description": "Create a new match or join an existing one.",
    "connect.createMatch": "Create a New Match",
    "connect.joinMatch": "Join a Match",
    "connect.enterCode": "Enter the connection code to join an existing game.",
    "connect.connectionCode": "Connection Code",
    "connect.join": "Join",
    "connect.resumeGame": "Resume Game",
    "connect.creating": "Creating...",

    // Game Selection
    "gameSelection.title": "Choose Your Game Mode",
    "gameSelection.singlePlayer": "Single Player",
    "gameSelection.singlePlayerDescription": "Sharpen your skills against our AI opponent.",
    "gameSelection.playerVsAi": "Player vs AI",
    "gameSelection.quickGame": "A quick game to test your wit.",
    "gameSelection.playImmediately": "Play immediately",
    "gameSelection.multiplayer": "Multiplayer",
    "gameSelection.multiplayerDescription": "Challenge your friends in a game of Ishema Ryanjye.",
    "gameSelection.players": "Players",
    "gameSelection.quickDuel": "A quick duel",
    "gameSelection.standardTeamGame": "Standard team game",
    "gameSelection.largeGroupMatch": "Large group match",
    "gameSelection.playWithFriends": "Play with friends",
    "gameSelection.requiresSignIn": "Requires sign in",
    "gameSelection.loading": "Loading...",

    // Multiplayer
    "multiplayer.title": "Multiplayer Game",
    "multiplayer.lobby": "Multiplayer Lobby",
    "multiplayer.matchId": "Match ID",
    "multiplayer.waitingForPlayers": "Waiting for players to join...",
    "multiplayer.startingGame": "Starting game...",
    "multiplayer.inviteCodes": "Invite Code",
    "multiplayer.shareCode": "Share this code with the next player joining.",
    "multiplayer.team1": "Team 1",
    "multiplayer.team2": "Team 2",
    "multiplayer.team": "Team",
    "multiplayer.waitingForPlayersToJoin": "Waiting for players to join...",
    "multiplayer.connected": "Connected",
    "multiplayer.disconnected": "Disconnected",
    "multiplayer.matchPaused": "Match Paused",
    "multiplayer.matchResumed": "Match Resumed",
    "multiplayer.reconnecting": "Reconnecting...",
    "multiplayer.exitGame": "Exit Game",
    "multiplayer.playAgain": "Play Again",
    "multiplayer.matchOver": "Match Over",
    "multiplayer.congratulations": "Congratulations!",
    "multiplayer.yourTeamWon": "Your team won the match!",
    "multiplayer.yourTeamLost": "Your team lost to",
    "multiplayer.yourScore": "Your Team's Score",
    "multiplayer.opponentScore": "Opponent's Score",
    "multiplayer.chooseCard": "Choose a card from the last round to answer a question for a chance to win.",
    "multiplayer.answerQuestion": "Answer the question to continue to the next match.",
    "multiplayer.questionCompleted": "Question completed! Ready for another match?",
    "multiplayer.readyForAnotherMatch": "Ready for another match?",
    "multiplayer.funFact": "Fun Fact?",
    "multiplayer.close": "Close",
    "multiplayer.submitAnswer": "Submit Answer",
    "multiplayer.cancel": "Cancel",
    "multiplayer.selectCorrectAnswers": "Select correct answer",
    "multiplayer.correct": "Correct!",
    "multiplayer.incorrect": "Incorrect.",
    "multiplayer.earnedMarks": "You earned mark(s).",
    "multiplayer.correctAnswer": "The correct answer was:",

    // Contact Form
    "contact.title": "Request Physical Cards",
    "contact.description": "Get physical Ishema Ryanjye cards delivered to your address for personal, teaching, or leisure use.",
    "contact.button": "Request Physical Cards",
    "contact.form.title": "Request Physical Cards",
    "contact.form.requestType": "Request Type",
    "contact.form.person": "Individual",
    "contact.form.organization": "Organization",
    "contact.form.fullName": "Full Name",
    "contact.form.organizationName": "Organization Name",
    "contact.form.fullNamePlaceholder": "Enter your full name",
    "contact.form.organizationNamePlaceholder": "Enter organization name",
    "contact.form.district": "District",
    "contact.form.sector": "Sector",
    "contact.form.street": "Street",
    "contact.form.email": "Email",
    "contact.form.phone": "Phone",
    "contact.form.notes": "Notes",
    "contact.form.districtPlaceholder": "Enter district",
    "contact.form.sectorPlaceholder": "Enter sector",
    "contact.form.streetPlaceholder": "Enter street address",
    "contact.form.emailPlaceholder": "Enter your email",
    "contact.form.phonePlaceholder": "Enter your phone number",
    "contact.form.notesPlaceholder": "Any additional information or special requests...",
    "contact.form.termsAgreement": "I agree to use the cards for personal, teaching, or leisure purposes only, not for commercial use.",
    "contact.form.submit": "Submit Request",
    "contact.form.cancel": "Cancel",
    "contact.form.submitting": "Submitting...",
    "contact.form.success": "Request submitted successfully!",
    "contact.form.error": "Failed to submit request. Please try again.",
    "contact.form.submitted": "Request Submitted!",
    "contact.form.submittedMessage": "Thank you for your request. We will contact you soon with delivery details.",
    "contact.form.requiredFields": "Please fill in all required fields.",
    "contact.form.termsRequired": "You must agree to the terms of use.",
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
    "hero.title": "Ishema Ryanjye",
    "hero.subtitle": "Jouer et apprendre",
    "hero.description":
      "Un jeu de cartes amusant et interactif qui donne aux jeunes des connaissances qui changent leur vie sur la santé reproductive et l'égalité des sexes.",
    "hero.playNow": "👉 Jouer maintenant",
    "hero.learnMore": "🎓 En savoir plus",
    "hero.readHealthInfo": "🏥 Lire les infos santé",

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
    "game.health.title": "Informations sur la Santé",
    "game.health.description": "Accédez à un contenu éducatif complet sur la santé reproductive, l'égalité des sexes et le bien-être.",
    "game.health.button": "Lire les Informations",
    "game.health.downloadPrompt": "Voulez-vous télécharger le manuel Ishema Ryanjye ?",
    "game.health.downloadSuccess": "Téléchargement du manuel en cours...",
    "game.cards.title": "Signification des Cartes",
    "game.cards.description": "Comprenez la signification et l'importance de chaque carte dans le jeu.",
    "game.cards.button": "Voir les Cartes",

    // Game Rules Content
    "game.rules.gameOverview": "Aperçu du Jeu",
    "game.rules.gameSetup": "Configuration du Jeu",
    "game.rules.gameplayRules": "Règles de Jeu",
    "game.rules.specialCardRules": "Règles de Cartes Spéciales",
    "game.rules.scoring": "Marquage",
    "game.rules.overview1": "Le jeu suit les règles standard des jeux de cartes.",
    "game.rules.overview2": "Peut être joué entre 2, 4, 6 joueurs.",
    "game.rules.overview3": "Les cartes contiennent différents symboles (images) enseignant la santé reproductive, la violence basée sur le genre, et promouvant l'égalité.",
    "game.rules.overview4": "Ce jeu de cartes est principalement pour les jeunes âgés de 10-24 ans.",
    "game.rules.setup1": "Il est bon de lire ce livre et d'autres matériaux sur la santé reproductive avant de jouer.",
    "game.rules.setup2": "Les équipes peuvent utiliser ce livre et d'autres matériaux approuvés pour trouver des réponses.",
    "game.rules.gameplay1": "L'objectif est de répondre correctement aux questions sur les cartes.",
    "game.rules.gameplay2": "Quand une équipe gagne, elle pose une question à l'équipe perdante.",
    "game.rules.gameplay3": "Si la réponse est correcte, l'objectif est retiré ou devient mort.",
    "game.rules.gameplay4": "Si la réponse est fausse, l'objectif est compté.",
    "game.rules.gameplay5": "En cas d'égalité, utilisez une autre personne compétente dans l'équipe.",
    "game.rules.gameplay6": "Vous pouvez poser toute question liée à l'image de la carte ou aux chiffres.",
    "game.rules.gameplay7": "Le jeu se termine quand toutes les cartes sont jouées.",
    "game.rules.special1": "Quand Monsieur prend Dame, la personne avec Dame pose des questions.",
    "game.rules.special2": "Quand trois cartes de la même couleur sont jouées en premier, le joueur pose des questions.",
    "game.rules.special3": "Quand As est joué en premier, utilisez des règles similaires à Monsieur et Dame.",
    "game.rules.scoring1": "Deux buts sont marqués quand une équipe ne peut pas jouer (15 points dans un jeu à 2 ou 6 joueurs ou 30 dans un jeu à 4 joueurs).",
    "game.rules.scoring2": "D'autres buts peuvent être créés pendant le jeu.",
    "game.rules.scoring3": "Si les équipes sont à égalité, rejouez avec l'équipe gagnante marquant deux buts.",

    // Health Information Content
    "game.health.modalTitle": "Informations sur le Jeu et Contenu Éducatif",
    "game.health.subtopic": "sous-sujet",
    "game.health.subtopics": "sous-sujets",
    "game.health.primary": "Primaire",
    "game.health.tags": "Étiquettes:",
    "game.health.type": "Type:",
    "game.health.card": "Carte:",
    "game.health.views": "Vues:",
    "game.health.subtopicDetails": "Détails du Sous-sujet",
    "game.health.contentType": "Type de Contenu:",
    "game.health.difficulty": "Difficulté:",
    "game.health.cardAssociation": "Association de Carte:",
    "game.health.totalViews": "Total des Vues:",
    "game.health.items": "Éléments:",
    "game.health.noContent": "Aucun contenu disponible pour le moment.",
    "game.health.close": "Fermer",

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
    "common.loading": "Chargement...",
    "common.back": "Retour",

    // Connect
    "connect.title": "Se connecter à une partie",
    "connect.description": "Créez une nouvelle partie ou rejoignez-en une existante.",
    "connect.createMatch": "Créer une nouvelle partie",
    "connect.joinMatch": "Rejoindre une partie",
    "connect.enterCode": "Entrez le code de connexion pour rejoindre une partie existante.",
    "connect.connectionCode": "Code de connexion",
    "connect.join": "Rejoindre",
    "connect.resumeGame": "Reprendre la partie",
    "connect.creating": "Création...",

    // Game Selection
    "gameSelection.title": "Choisissez votre mode de jeu",
    "gameSelection.singlePlayer": "Joueur unique",
    "gameSelection.singlePlayerDescription": "Améliorez vos compétences contre notre adversaire IA.",
    "gameSelection.playerVsAi": "Joueur contre IA",
    "gameSelection.quickGame": "Un jeu rapide pour tester votre esprit.",
    "gameSelection.playImmediately": "Jouer immédiatement",
    "gameSelection.multiplayer": "Multijoueur",
    "gameSelection.multiplayerDescription": "Défiez vos amis dans une partie d'Ishema Ryanjye.",
    "gameSelection.players": "Joueurs",
    "gameSelection.quickDuel": "Un duel rapide",
    "gameSelection.standardTeamGame": "Jeu d'équipe standard",
    "gameSelection.largeGroupMatch": "Match de grand groupe",
    "gameSelection.playWithFriends": "Jouer avec des amis",
    "gameSelection.requiresSignIn": "Nécessite une connexion",
    "gameSelection.loading": "Chargement...",

    // Multiplayer
    "multiplayer.title": "Jeu multijoueur",
    "multiplayer.lobby": "Lobby multijoueur",
    "multiplayer.matchId": "ID de match",
    "multiplayer.waitingForPlayers": "En attente de joueurs...",
    "multiplayer.startingGame": "Démarrage du jeu...",
    "multiplayer.inviteCodes": "Code d'invitation",
    "multiplayer.shareCode": "Partagez ce code avec le prochain joueur.",
    "multiplayer.team1": "Équipe 1",
    "multiplayer.team2": "Équipe 2",
    "multiplayer.team": "Équipe",
    "multiplayer.waitingForPlayersToJoin": "En attente de joueurs...",
    "multiplayer.connected": "Connecté",
    "multiplayer.disconnected": "Déconnecté",
    "multiplayer.matchPaused": "Match en pause",
    "multiplayer.matchResumed": "Match repris",
    "multiplayer.reconnecting": "Reconnexion...",
    "multiplayer.exitGame": "Quitter le jeu",
    "multiplayer.playAgain": "Rejouer",
    "multiplayer.matchOver": "Match terminé",
    "multiplayer.congratulations": "Félicitations !",
    "multiplayer.yourTeamWon": "Votre équipe a gagné le match !",
    "multiplayer.yourTeamLost": "Votre équipe a perdu contre",
    "multiplayer.yourScore": "Score de votre équipe",
    "multiplayer.opponentScore": "Score de l'adversaire",
    "multiplayer.chooseCard": "Choisissez une carte du dernier tour pour répondre à une question et avoir une chance de gagner.",
    "multiplayer.answerQuestion": "Répondez à la question pour continuer au match suivant.",
    "multiplayer.questionCompleted": "Question terminée ! Prêt pour un autre match ?",
    "multiplayer.readyForAnotherMatch": "Prêt pour un autre match ?",
    "multiplayer.funFact": "Fait amusant ?",
    "multiplayer.close": "Fermer",
    "multiplayer.submitAnswer": "Soumettre la réponse",
    "multiplayer.cancel": "Annuler",
    "multiplayer.selectCorrectAnswers": "Sélectionnez la bonne réponse",
    "multiplayer.correct": "Correct !",
    "multiplayer.incorrect": "Incorrect.",
    "multiplayer.earnedMarks": "Vous avez gagné point(s).",
    "multiplayer.correctAnswer": "La bonne réponse était :",

    // Contact Form
    "contact.title": "Demander des Cartes Physiques",
    "contact.description": "Obtenez des cartes physiques Ishema Ryanjye livrées à votre adresse pour un usage personnel, éducatif ou de loisir.",
    "contact.button": "Demander des Cartes",
    "contact.form.title": "Demander des Cartes Physiques",
    "contact.form.requestType": "Type de Demande",
    "contact.form.person": "Individu",
    "contact.form.organization": "Organisation",
    "contact.form.fullName": "Nom Complet",
    "contact.form.organizationName": "Nom de l'Organisation",
    "contact.form.fullNamePlaceholder": "Entrez votre nom complet",
    "contact.form.organizationNamePlaceholder": "Entrez le nom de l'organisation",
    "contact.form.district": "District",
    "contact.form.sector": "Secteur",
    "contact.form.street": "Rue",
    "contact.form.email": "Email",
    "contact.form.phone": "Téléphone",
    "contact.form.notes": "Notes",
    "contact.form.districtPlaceholder": "Entrez le district",
    "contact.form.sectorPlaceholder": "Entrez le secteur",
    "contact.form.streetPlaceholder": "Entrez l'adresse de la rue",
    "contact.form.emailPlaceholder": "Entrez votre email",
    "contact.form.phonePlaceholder": "Entrez votre numéro de téléphone",
    "contact.form.notesPlaceholder": "Toute information supplémentaire ou demande spéciale...",
    "contact.form.termsAgreement": "J'accepte d'utiliser les cartes uniquement à des fins personnelles, éducatives ou de loisir, et non à des fins commerciales.",
    "contact.form.submit": "Soumettre la Demande",
    "contact.form.cancel": "Annuler",
    "contact.form.submitting": "Soumission...",
    "contact.form.success": "Demande soumise avec succès !",
    "contact.form.error": "Échec de la soumission. Veuillez réessayer.",
    "contact.form.submitted": "Demande Soumise !",
    "contact.form.submittedMessage": "Merci pour votre demande. Nous vous contacterons bientôt avec les détails de livraison.",
    "contact.form.requiredFields": "Veuillez remplir tous les champs obligatoires.",
    "contact.form.termsRequired": "Vous devez accepter les conditions d'utilisation.",
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
    "hero.title": "Ishema Ryanjye",
    "hero.subtitle": "Kina Wiga",
    "hero.description":
      "Umukino w'amakarita ushimishije kandi ufite ubushobozi bwo guha urubyiruko ubumenyi bugira ingaruka ku buzima bw'imyororokere n'uburinganire.",
    "hero.playNow": "👉 Kina Nonaha",
    "hero.learnMore": "🎓 Menya Byinshi",
    "hero.readHealthInfo": "🏥 Soma Amakuru y'Ubuzima",

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
    "game.health.title": "Amakuru y'Ubuzima",
    "game.health.description": "Gera kuri amakuru yuzuye yo kwiga ku buzima bw'imyororokere, uburinganire bw'igitsina, n'ubuzima bwiza.",
    "game.health.button": "Soma Amakuru",
    "game.health.downloadPrompt": "Urashaka gukuramo igitabo cy'Ishema Ryanjye?",
    "game.health.downloadSuccess": "byatangiy!",
    "game.cards.title": "Ibisobanuro by'Amakarita",
    "game.cards.description": "Sobanukirwa ibisobanuro n'ingaruka z'amakarita yose muri uyu mukino.",
    "game.cards.button": "Reba Amakarita",

    // Game Rules Content
    "game.rules.gameOverview": "Incamake y'Umukino",
    "game.rules.gameSetup": "Gutegura Umukino",
    "game.rules.gameplayRules": "Amabwiriza y'Umukino",
    "game.rules.specialCardRules": "Amabwiriza y'Amakarita Adasanzwe",
    "game.rules.scoring": "Gupima Amanota",
    "game.rules.overview1": "Umukino ukurikira amabwiriza rusange y'amakarita.",
    "game.rules.overview2": "Ushobora gukinwa hagati y'abakinnyi 2, 4, 6.",
    "game.rules.overview3": "Amakarita afite ibimenyetso bitandukanye (amashusho) yigisha ku buzima bw'imyororokere, ihohoterwa rishingiye ku gitsina, no guteza imbere uburinganire.",
    "game.rules.overview4": "Uyu mukino w'amakarita ni wo w'ingenzi ku rubyiruko rufite imyaka 10-24.",
    "game.rules.setup1": "Ni byiza gusoma iki gitabo n'ibindi bikoresho byerekeye ubuzima bw'imyororokere mbere yo gukina.",
    "game.rules.setup2": "Amatsinda arashobora gukoresha iki gitabo n'ibindi bikoresho byemewe kugira ngo abone ibisubizo.",
    "game.rules.gameplay1": "Intego ni uko usubiza neza ibibazo byerekeye amakarita.",
    "game.rules.gameplay2": "Igihe itsinda ritsinza, ryibaza ikibazo ku tsinda ryatsinzwe.",
    "game.rules.gameplay3": "Niba igisubizo ni cyo, intego irahagarikwa cyangwa ikaba yapfuye.",
    "game.rules.gameplay4": "Niba igisubizo si cyo, intego irabarwa.",
    "game.rules.gameplay5": "Igihe habaho uburinganiye, koresha umuntu undi ufite ubumenyi mu tsinda.",
    "game.rules.gameplay6": "Urashobora kubaza ikibazo cyose cyerekeye ishusho y'akarita cyangwa imibare.",
    "game.rules.gameplay7": "Umukino urahangira iyo amakarita yose yakinnye.",
    "game.rules.special1": "Igihe Monsieur atora Queen, uwo ufite Queen abaza ibibazo.",
    "game.rules.special2": "Igihe amakarita atatu y'ubwoko bumwe akinnye mbere, umukinnyi abaza ibibazo.",
    "game.rules.special3": "Igihe Ace akinnye mbere, koresha amabwiriza asa na Monsieur na Queen.",
    "game.rules.scoring1": "Intego ebyiri zirangurwa igihe itsinda ritashobora gukina (amanota 15 mu mukino w'abakinnyi 2 cyangwa 6 cyangwa 30 mu mukino w'abakinnyi 4).",
    "game.rules.scoring2": "Izindi ntego zishobora gukoreshwa mu gihe cy'umukino.",
    "game.rules.scoring3": "Niba amatsinda ari uburinganiye, ongera ukine n'itsinda ryatsinze rikangurira intego ebyiri.",

    // Health Information Content
    "game.health.modalTitle": "Amakuru y'Umukino n'Ubwiyongere",
    "game.health.subtopic": "icyigice",
    "game.health.subtopics": "ibyigice",
    "game.health.primary": "Uwibanze",
    "game.health.tags": "Icyita:",
    "game.health.type": "Ubwoko:",
    "game.health.card": "Akarita:",
    "game.health.views": "Reba:",
    "game.health.subtopicDetails": "Ibyigice by'Icyigice",
    "game.health.contentType": "Ubwoko bw'Ubwiyongere:",
    "game.health.difficulty": "Ubukana:",
    "game.health.cardAssociation": "Ihuza ry'Akarita:",
    "game.health.totalViews": "Reba Byose:",
    "game.health.items": "Ibintu:",
    "game.health.noContent": "Nta bwiyongere buraboneka ubu.",
    "game.health.close": "Funga",

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
    "common.loading": "Birimo gutangizwa...",
    "common.back": "Subira inyuma",

    // Connect
    "connect.title": "Injira mu mukino",
    "connect.description": "Kora umukino mushya cyangwa winjire mu watangiye.",
    "connect.createMatch": "Kora umukino mushya",
    "connect.joinMatch": "Injira mu mukino",
    "connect.enterCode": "Shyiramo kode kugirango winjire mu mukino.",
    "connect.connectionCode": "Kode y'umukino",
    "connect.join": "Injira",
    "connect.resumeGame": "Ongera ukine",
    "connect.creating": "Birimo gukora...",

    // Game Selection
    "gameSelection.title": "Hitamo uburyo bwo gukina",
    "gameSelection.singlePlayer": "Umukinnyi umwe",
    "gameSelection.singlePlayerDescription": "Kongera ubushobozi bwawe ukina na AI.",
    "gameSelection.playerVsAi": "Umukinnyi na AI",
    "gameSelection.quickGame": "Umukino wo vuba wo gusuzuma ubwoba bwawe.",
    "gameSelection.playImmediately": "Kina nonaha",
    "gameSelection.multiplayer": "Abakinnyi benshi",
    "gameSelection.multiplayerDescription": "Hangana n'inshuti zawe mu mukino wa Ishema Ryanjye.",
    "gameSelection.players": "Abakinnyi",
    "gameSelection.quickDuel": "Intambara yo vuba",
    "gameSelection.standardTeamGame": "Umukino w'itsinda rusange",
    "gameSelection.largeGroupMatch": "Umukino w'itsinda rinini",
    "gameSelection.playWithFriends": "Kina n'inshuti",
    "gameSelection.requiresSignIn": "Bakeneye kwiyandikisha",
    "gameSelection.loading": "Birimo gutangizwa...",

    // Multiplayer
    "multiplayer.title": "Umukino w'abakinnyi benshi",
    "multiplayer.lobby": "Icyumba cy'abakinnyi benshi",
    "multiplayer.matchId": "ID y'umukino",
    "multiplayer.waitingForPlayers": "Gutegereza abakinnyi...",
    "multiplayer.startingGame": "Gutangira umukino...",
    "multiplayer.inviteCodes": "Kode yo gutumira",
    "multiplayer.shareCode": "Sangira iyi kode n'umukinnyi ukurikira.",
    "multiplayer.team1": "Itsinda 1",
    "multiplayer.team2": "Itsinda 2",
    "multiplayer.team": "Itsinda",
    "multiplayer.waitingForPlayersToJoin": "Gutegereza abakinnyi...",
    "multiplayer.connected": "Wahuye",
    "multiplayer.disconnected": "Wahakuye",
    "multiplayer.matchPaused": "Umukino wakayemo",
    "multiplayer.matchResumed": "Umukino wongeye",
    "multiplayer.reconnecting": "Ongera uhuze...",
    "multiplayer.exitGame": "Sohoka mu mukino",
    "multiplayer.playAgain": "Ongera ukine",
    "multiplayer.matchOver": "Umukino warangiye",
    "multiplayer.congratulations": "Twishimiye!",
    "multiplayer.yourTeamWon": "Itsinda ryawe ryatsinze umukino!",
    "multiplayer.yourTeamLost": "Itsinda ryawe ryatsinzwe na",
    "multiplayer.yourScore": "Amanota y'itsinda ryawe",
    "multiplayer.opponentScore": "Amanota y'uwo muhanganye",
    "multiplayer.chooseCard": "Hitamo karita yo mu gice cyanyuma kugirango usubize ikibazo kugira ngo ugire amahirwe yo gutsinda.",
    "multiplayer.answerQuestion": "Subiza ikibazo kugira ngo ukomeze ku mukino ukurikira.",
    "multiplayer.questionCompleted": "Ikibazo cyarangiye! Witeguye ku mukino ukurikira?",
    "multiplayer.readyForAnotherMatch": "Witeguye ku mukino ukurikira?",
    "multiplayer.funFact": "Ikintu gishimishije?",
    "multiplayer.close": "Funga",
    "multiplayer.submitAnswer": "Ohereza igisubizo",
    "multiplayer.cancel": "Kureka",
    "multiplayer.selectCorrectAnswers": "Hitamo igisubizo cy'ukuri",
    "multiplayer.correct": "Ni cyo!",
    "multiplayer.incorrect": "Ntabwo ari cyo.",
    "multiplayer.earnedMarks": "Wungutse amanota.",
    "multiplayer.correctAnswer": "Igisubizo cy'ukuri cyari:",

    // Contact Form
    "contact.title": "Gusaba Amakarita y'Ishema Ryanjye",
    "contact.description": "Bona amakarita y'Ishema Ryanjye yahaguruka ku muhanda wawe witeguye gukoreshwa mu buryo bwite, bwo kwigisha, cyangwa bwo kwidagadura.",
    "contact.button": "Saba Amakarita",
    "contact.form.title": "Gusaba Amakarita y'Ishema Ryanjye",
    "contact.form.requestType": "Ubwoko bwo Gusaba",
    "contact.form.person": "Umuntu",
    "contact.form.organization": "Ishyirahamwe",
    "contact.form.fullName": "Amazina Yose",
    "contact.form.organizationName": "Izina ry'Ishyirahamwe",
    "contact.form.fullNamePlaceholder": "Andika amazina yawe yose",
    "contact.form.organizationNamePlaceholder": "Andika izina ry'ishyirahamwe",
    "contact.form.district": "Akarere",
    "contact.form.sector": "Umurenge",
    "contact.form.street": "Umuhanda",
    "contact.form.email": "Imeri",
    "contact.form.phone": "Telefone",
    "contact.form.notes": "Ibyanditswe",
    "contact.form.districtPlaceholder": "Andika akarere",
    "contact.form.sectorPlaceholder": "Andika umurenge",
    "contact.form.streetPlaceholder": "Andika aho uba",
    "contact.form.emailPlaceholder": "Andika imeri yawe",
    "contact.form.phonePlaceholder": "Andika numero ya telefone",
    "contact.form.notesPlaceholder": "Amakuru yose yongeraho cyangwa ibyo usaba...",
    "contact.form.termsAgreement": "Nemerera gukoresha amakarita gusa mu buryo bwite, bwo kwigisha, cyangwa bwo kwidagadura, ntabwo mu buryo bwo kwishora.",
    "contact.form.submit": "Ohereza Gusaba",
    "contact.form.cancel": "Kureka",
    "contact.form.submitting": "Ohereza...",
    "contact.form.success": "Gusaba cyoherejwe neza!",
    "contact.form.error": "Gusaba ntabwo cyoherejwe. Ongera ugerageze.",
    "contact.form.submitted": "Gusaba Cyoherejwe!",
    "contact.form.submittedMessage": "Murakoze gusaba. Tuzabagana vuba tuzabagenera amakuru y'uko tuzabagenera amakarita.",
    "contact.form.requiredFields": "Nyamuneka uzuzure byose bikenerwa.",
    "contact.form.termsRequired": "Ugomba kwemera amabwiriza yo gukoresha.",
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
