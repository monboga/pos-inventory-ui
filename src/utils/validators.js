export const PASSWORD_RULES = [
    { id: 1, text: "Mínimo 12 caracteres", regex: /^.{12,}$/ },
    { id: 2, text: "Al menos una mayúscula", regex: /[A-Z]/ },
    { id: 3, text: "Al menos un número", regex: /[0-9]/ },
    { id: 4, text: "Al menos un carácter especial (!@#$)", regex: /[!@#$%^&*(),.?":{}|<>]/ },
];

export const validatePassword = (password) => {
    for (const rule of PASSWORD_RULES) {
        if (!rule.regex.test(password)) {
            return { isValid: false, message: rule.text };
        }
    }
    return { isValid: true };
};