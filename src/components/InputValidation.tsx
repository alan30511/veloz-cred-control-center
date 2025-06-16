
import { useState } from 'react';
import { validateCPF, validateEmail, validatePhone, sanitizeInput } from '@/utils/inputValidation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ValidationMessageProps {
  message: string;
}

export const ValidationMessage = ({ message }: ValidationMessageProps) => (
  <Alert variant="destructive" className="mt-2">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

interface ValidatedInputProps {
  value: string;
  onChange: (value: string) => void;
  validator: (value: string) => boolean;
  errorMessage: string;
  placeholder?: string;
  type?: string;
}

export const ValidatedInput = ({ 
  value, 
  onChange, 
  validator, 
  errorMessage, 
  placeholder, 
  type = "text" 
}: ValidatedInputProps) => {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    onChange(sanitizedValue);
    
    if (touched && sanitizedValue && !validator(sanitizedValue)) {
      setError(errorMessage);
    } else {
      setError('');
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (value && !validator(value)) {
      setError(errorMessage);
    }
  };

  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md ${
          error ? 'border-red-500' : 'border-gray-300'
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
      />
      {error && <ValidationMessage message={error} />}
    </div>
  );
};

// Pre-configured validation components
export const CPFInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <ValidatedInput
    value={value}
    onChange={onChange}
    validator={validateCPF}
    errorMessage="CPF inválido. Digite um CPF válido com 11 dígitos."
    placeholder="000.000.000-00"
  />
);

export const EmailInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <ValidatedInput
    value={value}
    onChange={onChange}
    validator={validateEmail}
    errorMessage="Email inválido. Digite um email válido."
    placeholder="exemplo@email.com"
    type="email"
  />
);

export const PhoneInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <ValidatedInput
    value={value}
    onChange={onChange}
    validator={validatePhone}
    errorMessage="Telefone inválido. Digite um número válido."
    placeholder="(11) 99999-9999"
    type="tel"
  />
);
