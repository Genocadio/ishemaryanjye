"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"
import { BookOpen, Heart, Info, User } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"
import Link from "next/link"
import { CardViewer } from "@/components/card-viewer"
import { DecorativeCards } from "@/components/decorative-cards"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SupportChat } from "@/components/support-chat"

export default function GameInfo() {
  const { t, language } = useLanguage()

  const rules = {
    en: {
      "Game Overview": [
        "The game follows standard card game rules.",
        "Can be played between 2, 4, 6 players.",
        "Cards contain different symbols (images) teaching reproductive health, gender-based violence, and promoting equality.",
        "This card game is mainly for youth aged 10-24."
      ],
      "Game Setup": [
        "It's good to read this book and other materials about reproductive health before playing.",
        "Teams can use this book and other approved materials to find answers."
      ],
      "Gameplay Rules": [
        "The goal is to answer questions correctly about the cards.",
        "When a team wins, they ask a question to the losing team.",
        "If the answer is correct, the goal is removed or becomes dead.",
        "If the answer is wrong, the goal is counted.",
        "When there's a tie, use another knowledgeable person in the team.",
        "You can ask any question related to the card's image or numbers.",
        "The game ends when all cards are played."
      ],
      "Special Card Rules": [
        "When Mr. takes Queen, the person with Queen asks questions.",
        "When three cards of the same suit are played first, the player asks questions.",
        "When Ace is played first, use rules similar to Mr. and Queen."
      ],
      "Scoring": [
        "Two goals are scored when a team can't play (15 points in 2 or 6 player game or 30 in 4 player game).",
        "Other goals can be created during the game.",
        "If teams tie, play again with the winning team scoring two goals."
      ]
    },
    fr: {
      "Aperçu du Jeu": [
        "Le jeu suit les règles standard des jeux de cartes.",
        "Peut être joué entre 2, 4, 6 joueurs.",
        "Les cartes contiennent différents symboles (images) enseignant la santé reproductive, la violence basée sur le genre, et promouvant l'égalité.",
        "Ce jeu de cartes est principalement pour les jeunes de 10-24 ans."
      ],
      "Préparation du Jeu": [
        "Il est bon de lire ce livre et d'autres documents sur la santé reproductive avant de jouer.",
        "Les équipes peuvent utiliser ce livre et d'autres documents approuvés pour trouver des réponses."
      ],
      "Règles de Jeu": [
        "Le but est de répondre correctement aux questions sur les cartes.",
        "Quand une équipe gagne, elle pose une question à l'équipe perdante.",
        "Si la réponse est correcte, le but est retiré ou devient mort.",
        "Si la réponse est incorrecte, le but est compté.",
        "En cas d'égalité, utilisez une autre personne compétente dans l'équipe.",
        "Vous pouvez poser n'importe quelle question liée à l'image ou aux nombres sur la carte.",
        "Le jeu se termine lorsque toutes les cartes sont jouées."
      ],
      "Règles des Cartes Spéciales": [
        "Quand Monsieur prend la Reine, la personne avec la Reine pose des questions.",
        "Quand trois cartes de la même couleur sont jouées en premier, le joueur pose des questions.",
        "Quand l'As est joué en premier, utilisez des règles similaires à Monsieur et Reine."
      ],
      "Marquage des Points": [
        "Deux buts sont marqués quand une équipe ne peut pas jouer (15 points dans un jeu de 2 ou 6 joueurs ou 30 dans un jeu de 4 joueurs).",
        "D'autres buts peuvent être créés pendant le jeu.",
        "Si les équipes sont à égalité, rejouez avec l'équipe gagnante marquant deux buts."
      ]
    },
    rw: {
      "Ibyerekeye Umukino": [
        "Umukino w'aya makarita ukurikiza amabwiriza y'amakarita asanzwe.",
        "Uyu mukino ushobora gukinwa hagati y'abantu babiri 2, 4, 6.",
        "Aya makarita ariho ibimenyetso (amashusho) bitandukanye byose byigisha ubuzima bw'imyororokere, ihohotera rishingiye ku gitsina ndetse no guteza imbere uburinganire.",
        "Uyu mukino w'amakarita 'Ishema Ryanjye' ugenewe cyane cyane urubyiruko rufite y'imyaka hagati 10 na 24."
      ],
      "Gutegura Umukino": [
        "Ni byiza gukina uyu mukino wabanje gusoma aka gatabo n'ibindi bitabo byigisha ubuzima bw'imyororokere.",
        "Ikipe ibaza cyangwa umuntu ubaza yemerewe gukoresha aka gatabo k'Ishema Ryanjye n'ibindi bitabo byizewe."
      ],
      "Amabwiriza y'Umukino": [
        "Igitego ni ugusubiza neza ibibazo bijyanye n'amakarita.",
        "Igihe ikipe itsinze ibaza ikipe itsinzwe ikibazo.",
        "Iyo bagisubije neza igitego kiburizwamo/kivaho cyangwa kiba gipfuye.",
        "Iyo kibananiye nibwo habarwa igitego.",
        "Igihe ikibazo kinaniye uwabajijwe, hifashishwa undi muntu ukizi mu ikipe.",
        "Wemerewe kubaza ikibazo cyose ushaka gifite aho gihurira n'igishushanyo cyangwa imibare bigaragara ku ikarita.",
        "Umukino urangiye igihe amakarita yose ashize."
      ],
      "Amabwiriza y'Amakarita Asanzwe": [
        "Igihe Bwana yafashe Seti, uwari ufite Bwana wishe Seti abaza ikibazo.",
        "Igihe nganda tatu y'iturufu iriye ku mukino wa mbere, uwarishije nganda tatu abaza ikibazo.",
        "Igihe hariye ipigu ku mukino wa mbere, hakoreshwa amategeko cyangwa habazwa ibibazo ku makarita yicanye."
      ],
      "Gupima Ibitego": [
        "Ibitego bibiri bibaho iyo mukinnye umukino ukarangira ikipe ntibashe kuwuva (amanota 15 mu mukino w'abantu babiri  na batandatu cyangwa 30 mu mukino w'abantu 4).",
        "Ibindi bitego biboneka hagati mu mukino.",
        "Igihe ikipe zombi zinganyije amanota umukino urangiye, basubiramo umukino ariko ikipe itsinze ibara ibitego bibiri."
      ]
    }
  }

  // Define a deck of cards
  const deck = [
    "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH", "AH",
    "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD", "AD",
    "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC", "AC",
    "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS", "AS"
  ];

  // Function to randomly select two cards
  const selectRandomCards = () => {
    const shuffledDeck = [...deck].sort(() => 0.5 - Math.random());
    return shuffledDeck.slice(0, 2);
  };

  // Example usage of the random card selection
  const [card1, card2] = selectRandomCards();
  console.log(`Selected cards: ${card1}, ${card2}`);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full">
        <div className="relative w-full">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-green-50 to-white -z-10" />
          
          {/* Decorative cards */}
          <DecorativeCards />
          
          <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("game.title")}</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t("game.title")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Info className="h-5 w-5" />
                    {t("game.rules.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">{t("game.rules.description")}</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        {t("game.rules.button")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold mb-4 text-green-600">{t("game.rules.title")}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-8">
                        {Object.entries(rules[language]).map(([section, items]) => (
                          <div key={section} className="space-y-2">
                            <h3 className="text-xl font-semibold text-gray-900">{section}</h3>
                            <div className="space-y-2 pl-4">
                              {items.map((rule, index) => (
                                <p key={index} className="text-gray-700">
                                  {index + 1}. {rule}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Heart className="h-5 w-5" />
                    {t("game.health.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">{t("game.health.description")}</p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    {t("game.health.button")}
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <BookOpen className="h-5 w-5" />
                    {t("game.cards.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">{t("game.cards.description")}</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        {t("game.cards.button")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold mb-4 text-green-600">
                          {t("game.cards.title")}
                        </DialogTitle>
                      </DialogHeader>
                      <CardViewer />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <SupportChat />
    </div>
  )
} 