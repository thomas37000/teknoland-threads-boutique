
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CartItem } from '@/types/cart';

export const createCheckoutSession = async (cartItems: CartItem[]) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Vous devez être connecté pour passer commande');
      return;
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total: total
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      toast.error('Erreur lors de la création de la commande');
      return;
    }

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
      size: item.size || null,
      color: item.color || null
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      toast.error('Erreur lors de la création des articles de commande');
      return;
    }

    // Call Stripe checkout function
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { 
        cartItems: cartItems.map(item => ({
          product: item.product,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        orderId: order.id
      }
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Erreur lors de la création de la session de paiement');
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error('Checkout error:', error);
    toast.error('Une erreur est survenue lors du checkout');
  }
};
