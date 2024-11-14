import { decrypt, encrypt } from "../../middlewares/auth/Encryptions.js";
import Card from "../../models/users/cards.js";
import User from "../../models/users/user.js";
import { getRandomColor } from "../../util/randomcolor.js";

export const addCard = async (req, res) => {
  try {
    const { userId } = req.user;
    const { cardHolderName, cardNumber, expiryYear, expiryMonth } = req.body;

    const encryptedCardNumber = encrypt(cardNumber);

    const user = await User.findById(userId).populate("cards");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cardExists = await Promise.all(
      user.cards.map(async (cardId) => {
        const card = await Card.findById(cardId);
        if (card) {
          const decryptedCardNumber = decrypt(card.cardNumber);
          return decryptedCardNumber === cardNumber;
        }
        return false;
      })
    ).then((results) => results.includes(true));

    if (cardExists) {
      return res.status(400).json({ message: "Card already exists" });
    }

    const randomColor = getRandomColor();

    const newCard = new Card({
      cardHolderName,
      cardNumber: encryptedCardNumber,
      expiryYear,
      expiryMonth,
      color: randomColor,
    });

    await newCard.save();

    user.cards.push(newCard._id);
    await user.save();

    return res.status(201).json({ message: "Card added successfully" });
  } catch (error) {
    console.error("Error adding card:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllCards = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId).populate("cards");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cards = user.cards.map((card) => {
      const decryptedCardNumber = decrypt(card.cardNumber);
      return {
        ...card.toJSON(),
        cardNumber: decryptedCardNumber.slice(-4),
      };
    });

    return res.status(200).json({ cards });
  } catch (error) {
    console.error("Error fetching cards:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { cardHolderName, cardNumber, expiryYear, expiryMonth } = req.body;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    card.cardHolderName = cardHolderName;
    card.cardNumber = cardNumber;
    card.expiryYear = expiryYear;
    
  

    await card.save();

    return res.status(200).json({ message: "Card updated successfully", card });
  } catch (error) {
    console.error("Error updating card:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const { userId } = req.user;
    const { cardId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.cards.findIndex((card) => card.toString() === cardId);
    if (index === -1) {
      return res.status(404).json({ message: "Card not found" });
    }

    user.cards.splice(index, 1);
    await user.save();

    await Card.findByIdAndDelete(cardId);

    return res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error("Error deleting card:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
