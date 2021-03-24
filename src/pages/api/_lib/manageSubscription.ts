import { stripe } from "./../../../services/stripe";
import { query as q } from "faunadb";
import { fauna } from "../../../services/fauna";

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction: boolean = false
) {
  const userRef = await fauna.query(
    q.Select(
      "ref",
      q.Get(q.Match(q.Index("user_by_stripe_customer_id"), customerId))
    )
  );

  const subscripton = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptonData = {
    id: subscripton.id,
    userId: userRef,
    status: subscripton.status,
    price_id: subscripton.items.data[0].price.id,
  };

  if (createAction) {
    await fauna.query(q.Create("subscriptions", { data: subscriptonData }));
  } else {
    await fauna.query(
      q.Replace(
        q.Select(
          "ref",
          q.Get(q.Match(q.Index("subscription_by_id"), subscriptionId))
        ),
        { data: subscriptonData }
      )
    );
  }
}
