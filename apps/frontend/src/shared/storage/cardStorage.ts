import { authStorage } from "../api/authStorage";

export interface StoredCard {
  id: string;
  number: string;
  holder: string;
  expiry: string;
  type: "visa" | "mastercard" | "amex";
  createdAt: string;
}

const CARDS_STORAGE_KEY = "user_cards";

const getUserCardsKey = (): string => {
  const user = authStorage.getUser();
  return user ? `${CARDS_STORAGE_KEY}_${user.id}` : CARDS_STORAGE_KEY;
};

export const cardStorage = {
  getCards(): StoredCard[] {
    const key = getUserCardsKey();
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveCards(cards: StoredCard[]): void {
    const key = getUserCardsKey();
    localStorage.setItem(key, JSON.stringify(cards));
  },

  addCard(card: Omit<StoredCard, "id" | "createdAt">): StoredCard {
    const cards = this.getCards();
    const newCard: StoredCard = {
      ...card,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.saveCards([...cards, newCard]);
    return newCard;
  },

  deleteCard(cardId: string): void {
    const cards = this.getCards();
    this.saveCards(cards.filter((card) => card.id !== cardId));
  },

  clearCards(): void {
    const key = getUserCardsKey();
    localStorage.removeItem(key);
  },
};
