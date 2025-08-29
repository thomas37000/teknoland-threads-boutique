// Mapping des noms de couleurs français vers les codes couleurs
export const getColorCode = (colorName: string): string => {
  const colorMapping: { [key: string]: string } = {
    // Noms français
    'noir': '#000000',
    'blanc': '#ffffff',
    'rouge': '#ff0000',
    'vert': '#008000',
    'bleu': '#0000ff',
    'jaune': '#ffff00',
    'rose': '#ff69b4',
    'violet': '#800080',
    'orange': '#ffa500',
    'marron': '#8b4513',
    'gris': '#808080',
    'beige': '#f5f5dc',
    'marine': '#000080',
    'bordeaux': '#800020',
    'turquoise': '#40e0d0',
    'kaki': '#f0e68c',
    'crème': '#fffdd0',
    'or': '#ffd700',
    'argent': '#c0c0c0',
    'bronze': '#cd7f32',
    
    // Noms anglais (au cas où)
    'black': '#000000',
    'white': '#ffffff',
    'red': '#ff0000',
    'green': '#008000',
    'blue': '#0000ff',
    'yellow': '#ffff00',
    'pink': '#ff69b4',
    'purple': '#800080',
    'brown': '#8b4513',
    'gray': '#808080',
    'grey': '#808080',
    'navy': '#000080',
    'khaki': '#f0e68c',
    'cream': '#fffdd0',
    'gold': '#ffd700',
    'silver': '#c0c0c0'
  };

  const normalizedName = colorName.toLowerCase().trim();
  
  // Si c'est déjà un code couleur hex, le retourner
  if (normalizedName.startsWith('#')) {
    return normalizedName;
  }
  
  // Sinon, chercher dans le mapping
  return colorMapping[normalizedName] || '#cccccc'; // Couleur par défaut grise
};