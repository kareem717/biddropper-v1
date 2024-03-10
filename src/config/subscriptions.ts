import { env } from "@/lib/env.mjs";

export interface SubscriptionPlan {
  name: string;
  description: string;
  features: string[];
  stripePriceId: string;
}

export const freePlan: SubscriptionPlan = {
  name: "Free",
  description: "The free plan is limited to 3 posts.",
  features: ["Up to 3 posts", "Limited support"],
  stripePriceId: "",
};

export const proPlan: SubscriptionPlan = {
  name: "Pro",
  description: "The Pro plan has unlimited posts.",
  features: ["Unlimited posts", "Priority support"],
  stripePriceId: "",
};

export const subscriptionPlans = [freePlan, proPlan];