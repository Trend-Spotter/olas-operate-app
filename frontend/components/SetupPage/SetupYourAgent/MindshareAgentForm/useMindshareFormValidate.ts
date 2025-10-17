import { useCallback, useState } from 'react';

export type MindshareFieldValues = {
  etherscanApiKey: string;
  coingeckoApiKey: string;
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

  const handleValidate = useCallback(async (values: MindshareFieldValues) => {
    setIsValidating(true);
    setSubmitButtonText('Validating...');

    try {
      // Basic validation - check that all required fields are provided
      if (!values.etherscanApiKey || !values.coingeckoApiKey || !values.trendmoonApiKey) {
        return false;
      }
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