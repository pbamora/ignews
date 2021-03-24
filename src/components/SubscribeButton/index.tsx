import { signIn, useSession } from "next-auth/client";
import { useRouter } from "next/dist/client/router";
import { api } from "../../services/api";
import { getStripeJs } from "../../services/stripe-js";
import styles from "./styles.module.scss";

interface SubcribeButtonProps {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubcribeButtonProps) {
  const [session] = useSession();
  const router = useRouter();

  async function handleSubscribedSessions() {
    if (!session) {
      signIn("github");
      return;
    }

    if (session?.activeSubscription) {
      router.push("/posts");
      return;
    }

    try {
      const response = await api.post("/subscribe");

      const { sessionId } = response.data;

      const stripe = await getStripeJs();

      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSubscribedSessions}
      className={styles.subscribeButton}
    >
      Subscribe now
    </button>
  );
}
