
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Minimum length check
  if (password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères");
  }
  
  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre majuscule");
  }
  
  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre minuscule");
  }
  
  // Check for numbers
  if (!/[0-9]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  }
  
  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un caractère spécial");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
