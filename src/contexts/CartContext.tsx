
import React, { createContext } from 'react';
import { CartContextType } from '@/types/cart';

export const CartContext = createContext<CartContextType | undefined>(undefined);
