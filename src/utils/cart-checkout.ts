
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types";

export const createCartCheckoutSession = async (cartItems: CartItem[]) => {
  try {
    const { data, error } = await supabase.functions.invoke("create-cart-checkout", {
      body: {
        cartItems,
      },
    });

    if (error) {
      console.error("Error creating cart checkout session:", error);
      throw new Error("Could not create checkout session");
    }

    return data;
  } catch (error) {
    console.error("Failed to create cart checkout session:", error);
    throw error;
  }
};
