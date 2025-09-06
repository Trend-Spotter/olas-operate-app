import { useCallback, useState } from 'react';

export type MindshareFieldValues = {
  staking: string;
  initialDeposit: string;
  nativeTxnFees: string;
  riskLevel: 'balanced' | 'conservative' | 'high';
};

export const useMindshareFormValidate = (defaultSubmitButtonText = 'Next') => {
  const [isValidating, setIsValidating] = useState(false);
  const [submitButtonText, setSubmitButtonText] = useState(
    defaultSubmitButtonText,
  );

  const handleValidate = useCallback(async (values: MindshareFieldValues) => {
    setIsValidating(true);
    setSubmitButtonText('Validating...');

    try {
      // Simple boilerplate validation - just check that fields are not empty
      if (!values.staking?.trim() || !values.initialDeposit?.trim() || 
          !values.nativeTxnFees?.trim() || !values.riskLevel) {
        return false;
      }

      // For boilerplate, we don't need complex validation
      return true;
    } catch (error) {
      console.error('Error validating mindshare form:', error);
      return false;
    } finally {
      setIsValidating(false);
      setSubmitButtonText('Next');
    }
  }, []);

  const updateSubmitButtonText = useCallback((value: string) => {
    setSubmitButtonText(value);
  }, []);

  return {
    isValidating,
    submitButtonText,
    updateSubmitButtonText,
    validateForm: handleValidate,
  };
};
