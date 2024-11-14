import Stripe from "stripe";
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const createStripeToken = async ({ cardNumber, expMonth, expYear, cvc }) => {
  try {
    const token = await stripe.tokens.create({
      card: {
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc: cvc,
      },
    });
    return token;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export { createStripeToken, stripe };
