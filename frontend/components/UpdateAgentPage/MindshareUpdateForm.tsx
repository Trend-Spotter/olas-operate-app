import { Button, Form, Input, Select } from 'antd';
import { get, isEqual, isUndefined, omitBy } from 'lodash';
import { useCallback, useContext, useMemo } from 'react';

import { Pages } from '@/enums/Pages';
import { usePageState } from '@/hooks/usePageState';
import { useServices } from '@/hooks/useServices';
import { Nullable } from '@/types/Util';

import {
  requiredFieldProps,
  requiredRules,
  validateApiKey,
  validateMessages,
} from '../AgentForms/common/formUtils';
import {
  CoinGeckoApiKeyLabel,
  TrendmoonApiKeyLabel,
} from '../AgentForms/common/labels';
import { useMindshareFormValidate } from '../SetupPage/SetupYourAgent/MindshareAgentForm/useMindshareFormValidate';
import { CardLayout } from './CardLayout';
import { UpdateAgentContext } from './context/UpdateAgentProvider';

const { Option } = Select;

type MindshareFormValues = {
  env_variables: {
    CONNECTION_DCXT_CONFIG_EXCHANGES_0_ETHERSCAN_API_KEY: string;
    SKILL_MINDSHARE_APP_MODELS_PARAMS_ARGS_COINGECKO_API_KEY: string;
    SKILL_MINDSHARE_APP_MODELS_PARAMS_ARGS_TRENDMOON_API_KEY: string;
  };
  riskLevel: 'balanced' | 'conservative' | 'high';
};

type MindshareUpdateFormProps = {
  initialFormValues: Nullable<MindshareFormValues>;
};
// const FormHeader = () => (
//   <Text>
//     Update your Mindshare agent configuration. Configure your API keys for Etherscan,
//     CoinGecko, and Trendmoon services, and set your risk tolerance level.
//   </Text>
// );

const MindshareUpdateForm = ({
  initialFormValues,
}: MindshareUpdateFormProps) => {
  const {
    isEditing,
    form,
    confirmUpdateModal: confirmModal,
  } = useContext(UpdateAgentContext);

  const { submitButtonText, updateSubmitButtonText, validateForm } =
    useMindshareFormValidate('Save Changes');

  const handleFinish = useCallback(
    async (values: MindshareFormValues) => {
      try {
        const envVariables = values.env_variables;
        const userInputs = {
          etherscanApiKey:
            envVariables.CONNECTION_DCXT_CONFIG_EXCHANGES_0_ETHERSCAN_API_KEY,
          coinGeckoApiKey:
            envVariables.SKILL_MINDSHARE_APP_MODELS_PARAMS_ARGS_COINGECKO_API_KEY,
          trendmoonApiKey:
            envVariables.SKILL_MINDSHARE_APP_MODELS_PARAMS_ARGS_TRENDMOON_API_KEY,
          riskLevel: values.riskLevel,
        };
        const isFormValid = await validateForm(userInputs);
        if (!isFormValid) return;

        updateSubmitButtonText('Updating agent...');
        confirmModal.openModal();
      } catch (error) {
        console.error('Error validating form:', error);
      } finally {
        updateSubmitButtonText('Save Changes');
      }
    },
    [validateForm, confirmModal, updateSubmitButtonText],
  );

  return (
    <Form<MindshareFormValues>
      form={form}
      layout="vertical"
      disabled={!isEditing}
      onFinish={handleFinish}
      validateMessages={validateMessages}
      initialValues={{ ...initialFormValues }}
    >
      <Form.Item
        label="Etherscan API Key"
        name={[
          'env_variables',
          'CONNECTION_DCXT_CONFIG_EXCHANGES_0_ETHERSCAN_API_KEY',
        ]}
        {...requiredFieldProps}
        rules={[...requiredRules, { validator: validateApiKey }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label={<CoinGeckoApiKeyLabel />}
        name={[
          'env_variables',
          'SKILL_MINDSHARE_APP_MODELS_PARAMS_ARGS_COINGECKO_API_KEY',
        ]}
        {...requiredFieldProps}
        rules={[...requiredRules, { validator: validateApiKey }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label={<TrendmoonApiKeyLabel />}
        name={[
          'env_variables',
          'SKILL_MINDSHARE_APP_MODELS_PARAMS_ARGS_TRENDMOON_API_KEY',
        ]}
        {...requiredFieldProps}
        rules={[...requiredRules, { validator: validateApiKey }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="riskLevel"
        label="Risk Level"
        rules={[{ required: true, message: 'Please select a risk level' }]}
      >
        <Select placeholder="Select risk level">
          <Option value="balanced">Balanced</Option>
          <Option value="conservative" disabled>
            Conservative
          </Option>
          <Option value="high" disabled>
            High
          </Option>
        </Select>
      </Form.Item>

      <Form.Item hidden={!isEditing}>
        <Button size="large" type="primary" htmlType="submit" block>
          {submitButtonText}
        </Button>
      </Form.Item>
    </Form>
  );
};

/**
 * Form for updating Mindshare agent.
 */
export const MindshareUpdatePage = () => {
  const { goto } = usePageState();
  const { selectedService } = useServices();
  const { unsavedModal, form } = useContext(UpdateAgentContext);

  const initialValues = useMemo<Nullable<MindshareFormValues>>(() => {
    if (!selectedService?.env_variables) return null;

    const envEntries = Object.entries(selectedService.env_variables);

    return envEntries.reduce(
      (acc, [key, { value }]) => {
        if (key === 'CONNECTION_DCXT_CONFIG_EXCHANGES_0_ETHERSCAN_API_KEY') {
          acc.env_variables.CONNECTION_DCXT_CONFIG_EXCHANGES_0_ETHERSCAN_API_KEY =
            value;
        } else if (
          key === 'SKILL_MINDSHARE_APP_MODELS_PARAMS_ARGS_COINGECKO_API_KEY'
        ) {
          acc.env_variables.SKILL_MINDSHARE_APP_MODELS_PARAMS_ARGS_COINGECKO_API_KEY =
            value;
        } else if (
          key === 'SKILL_MINDSHARE_APP_MODELS_PARAMS_ARGS_TRENDMOON_API_KEY'
        ) {
          acc.env_variables.SKILL_MINDSHARE_APP_MODELS_PARAMS_ARGS_TRENDMOON_API_KEY =
            value;
        }
        return acc;
      },
      { env_variables: {} } as MindshareFormValues,
    );
  }, [selectedService?.env_variables]);

  const handleBackClick = useCallback(() => {
    // Check if there are unsaved changes and omit empty fields
    const unsavedFields = omitBy(
      get(form?.getFieldsValue(), 'env_variables'),
      (value) => isUndefined(value),
    );
    const previousValues = initialValues?.env_variables;

    const hasUnsavedChanges = !isEqual(unsavedFields, previousValues);
    if (hasUnsavedChanges) {
      unsavedModal.openModal();
    } else {
      goto(Pages.Main);
    }
  }, [initialValues, form, unsavedModal, goto]);

  return (
    <CardLayout onClickBack={handleBackClick}>
      <MindshareUpdateForm initialFormValues={initialValues} />
    </CardLayout>
  );
};
