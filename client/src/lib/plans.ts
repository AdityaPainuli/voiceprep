// Basic calculation for the price -
// 0.06/minute Real-time tokens cost
// 0.50 per animation and infra cost included for servers and other things.
// 25% profit margin (can be deducted based on infra maintainance)

export const PRICING_PLANS = [
  {
    title: "FREE",
    price: "$0",
    features: [
      "10 real-time minutes",
      "100 diagrams",
      "3 video generations",
      "Email support",
    ],
  },
  {
    title: "STARTER",
    price: "$29",
    period: "/mo",
    featured: true,
    features: [
      "240 real-time minutes",
      "Unlimited diagrams",
      "20 video generations",
      "Priority support",
    ],
  },
  {
    title: "PRO",
    price: "$49",
    period: "/mo",
    features: [
      "400 real-time minutes",
      "Unlimited diagrams",
      "40 video generations",
      "Advanced Custom requests",
      "Team collaboration",
      "Priority support",
    ],
  },
  {
    title: "UNLIMITED",
    price: "$99",
    period: "/mo",
    features: [
      "Unlimited real-time minutes",
      "Unlimited diagrams",
      "Unlimited videos",
      "Team collaboration",
      "Custom integrations",
      "Dedicated support",
    ],
  },
];
