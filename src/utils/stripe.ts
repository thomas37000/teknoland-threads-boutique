
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";

export const createCheckoutSession = async (
  product: Product,
  quantity: number,
  size?: string,
  color?: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        productId: product.id,
        quantity,
        size,
        color,
      },
    });

    if (error) {
      console.error("Error creating checkout session:", error);
      throw new Error("Could not create checkout session");
    }

    return data;
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    throw error;
  }
};
