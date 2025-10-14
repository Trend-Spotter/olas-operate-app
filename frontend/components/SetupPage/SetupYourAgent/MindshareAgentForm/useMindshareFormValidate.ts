import { useCallback, useState } from 'react';

export type ValidationStatus = 'valid' | 'invalid' | 'unknown';

export type MindshareFieldValues = {
  etherscanApiKey: string;
  coingeckoApiKey: string;
  trendmoonApiKey: string;
  riskLevel: 'balanced' | 'conservative' | 'high';
};

/**
 * Simple validation to check that an API key has been provided
 */
const validateApiKey = (apiKey: string): boolean => {
  if (!apiKey || !apiKey.trim()) return false;
  
  // Basic format validation - API keys are typically alphanumeric with some special chars
  // Most API keys are at least 10 characters long
  return apiKey.trim().length >= 10;
};

export const useMindshareFormValidate = (
  defaultSubmitButtonText = 'Continue',
) => {
  const [isValidating, setIsValidating] = useState(false);
  const [submitButtonText, setSubmitButtonText] = useState(
    defaultSubmitButtonText,
  );
  const [etherscanApiKeyValidationStatus, setEtherscanApiKeyValidationStatus] =
    useState<ValidationStatus>('unknown');
  const [coinGeckoApiKeyValidationStatus, setCoinGeckoApiKeyValidationStatus] =
    useState<ValidationStatus>('unknown');
  const [trendmoonApiKeyValidationStatus, setTrendmoonApiKeyValidationStatus] =
    useState<ValidationStatus>('unknown');

  const handleValidate = useCallback(async (values: MindshareFieldValues) => {
    setIsValidating(true);

    setEtherscanApiKeyValidationStatus('unknown');
    setCoinGeckoApiKeyValidationStatus('unknown');
    setTrendmoonApiKeyValidationStatus('unknown');
    setSubmitButtonText('Validating...');

    try {
      // Simple validation - just check that API keys are provided and have reasonable length
      const isEtherscanApiValid = validateApiKey(values.etherscanApiKey);
      setEtherscanApiKeyValidationStatus(isEtherscanApiValid ? 'valid' : 'invalid');
      if (!isEtherscanApiValid) return false;

      const isCoinGeckoApiValid = validateApiKey(values.coingeckoApiKey);
      setCoinGeckoApiKeyValidationStatus(isCoinGeckoApiValid ? 'valid' : 'invalid');
      if (!isCoinGeckoApiValid) return false;

      const isTrendmoonApiValid = validateApiKey(values.trendmoonApiKey);
      setTrendmoonApiKeyValidationStatus(isTrendmoonApiValid ? 'valid' : 'invalid');
      if (!isTrendmoonApiValid) return false;

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
    etherscanApiKeyValidationStatus,
    coinGeckoApiKeyValidationStatus,
    trendmoonApiKeyValidationStatus,
    submitButtonText,
    updateSubmitButtonText,
    validateForm: handleValidate,
  };
};