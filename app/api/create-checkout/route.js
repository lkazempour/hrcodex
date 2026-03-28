import Stripe from "stripe";

export async function POST(request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeKey) {
    return Response.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);

  try {
    const { state, answers, profile } = await request.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `HR Codex - ${state} Complete Compliance Report`,
            description: `Detailed compliance analysis with remediation steps for ${state}`,
          },
          unit_amount: 4700,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://hrcodex.vercel.app"}?success=true&state=${state}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://hrcodex.vercel.app"}?cancelled=true`,
      metadata: {
        state,
        employeeCount: profile?.employees || "",
        industry: profile?.industry || "",
      },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return Response.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
