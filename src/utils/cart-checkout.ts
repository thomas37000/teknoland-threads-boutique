
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/cart";

export const createCheckoutSession = async (items: CartItem[]) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("You must be logged in to checkout");
    }

    // Transform cart items to the format expected by the edge function
    const cartItems = items.map(item => ({
      product: {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
      },
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));

    const { data, error } = await supabase.functions.invoke('create-cart-checkout', {
      body: {
        cartItems,
        metadata: {
          user_id: session.user.id,
        }
      }
    });

    if (error) {
      console.error('Checkout error:', error);
      throw error;
    }

    if (data?.url) {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } else {
      throw new Error('No checkout URL received');
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const saveCartToDatabase = async (items: CartItem[]) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return;
    }

    const cartData = items.map(item => ({
      user_id: session.user.id,
      product_id: item.id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));

    const { error } = await supabase
      .from('cart_items')
      .upsert(cartData, { 
        onConflict: 'user_id,product_id,size,color' 
      });

    if (error) {
      console.error('Error saving cart to database:', error);
    }
  } catch (error) {
    console.error('Error in saveCartToDatabase:', error);
  }
};
