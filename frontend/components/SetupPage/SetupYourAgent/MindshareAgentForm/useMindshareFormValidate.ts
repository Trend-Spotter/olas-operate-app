import { useCallback, useState } from 'react';

export type MindshareFieldValues = {
  etherscanApiKey: string;
  coinGeckoApiKey: string;
  trendmoonApiKey: string;
  riskLevel: 'balanced' | 'conservative' | 'high';
};

export const useMindshareFormValidate = (
  defaultSubmitButtonText = 'Continue',
) => {
  const [isValidating, setIsValidating] = useState(false);
  const [submitButtonText, setSubmitButtonText] = useState(
    defaultSubmitButtonText,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleValidate = useCallback(async (_values: MindshareFieldValues) => {
    setIsValidating(true);
    setSubmitButtonText('Validating...');

    try {
      // All API keys are validated via Ant Design form validators
      // No additional async validation needed like Gemini API key in Modius

      return true;
    } catch (error) {
      console.error('Error validating mindshare form:', error);
      return false;
    } finally {
      setIsValidating(false);
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
