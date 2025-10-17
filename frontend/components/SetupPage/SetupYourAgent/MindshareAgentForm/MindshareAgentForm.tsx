import {
  Button,
  Divider,
  Form,
  Input,
  message,
  Select,
  Typography,
} from 'antd';
import React, { useCallback, useState } from 'react';
import { useUnmount } from 'usehooks-ts';

import { ServiceTemplate } from '@/client';
import { COINGECKO_URL, ETHERSCAN_URL, TRENDMOON_URL } from '@/constants/urls';
import { SetupScreen } from '@/enums/SetupScreen';
import { useSetup } from '@/hooks/useSetup';
import { useStakingProgram } from '@/hooks/useStakingProgram';
import { onDummyServiceCreation } from '@/utils/service';

import {
  requiredFieldProps,
  requiredRules,
  validateApiKey,
  validateMessages,
} from '../../../AgentForms/common/formUtils';
import { CoinGeckoApiKeyLabel } from '../../../AgentForms/common/labels';
import {
  MindshareFieldValues,
  useMindshareFormValidate,
} from './useMindshareFormValidate';

const { Text } = Typography;
const { Option } = Select;

const SetupHeader = () => (
  <Text>
    Set up your agent and provide a{' '}
    <a target="_blank" href={COINGECKO_URL}>
      CoinGecko API key
    </a>
    as a price source, and a{' '}
    <a target="_blank" href={ETHERSCAN_URL}>
      Etherscan API key
    </a>
    as a blockchain explorer, and a{' '}
    <a target="_blank" href={TRENDMOON_URL}>
      Trendmoon API key
    </a>
    as a mindshare data source.
  </Text>
);

type MindshareAgentFormProps = { serviceTemplate: ServiceTemplate };

export const MindshareAgentForm = ({
  serviceTemplate,
}: MindshareAgentFormProps) => {
  const { goto } = useSetup();
  const { defaultStakingProgramId } = useStakingProgram();

  const [form] = Form.useForm<MindshareFieldValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitButtonText, updateSubmitButtonText, validateForm } =
    useMindshareFormValidate();

  const onFinish = useCallback(
    async (values: MindshareFieldValues) => {
      if (!defaultStakingProgramId) return;

      try {
        setIsSubmitting(true);

        updateSubmitButtonText('Setting up agent...');

        const isFormValid = await validateForm(values);
        if (!isFormValid) return;

        const overriddenServiceConfig: ServiceTemplate = {
          ...serviceTemplate,
          env_variables: {
            ...serviceTemplate.env_variables,
            CONNECTION_DCXT_CONFIG_EXCHANGES_0_ETHERSCAN_API_KEY: {
              ...serviceTemplate.env_variables
                .CONNECTION_DCXT_CONFIG_EXCHANGES_0_ETHERSCAN_API_KEY,
              value: values.etherscanApiKey,
            },
            SKILL_MINDSHARE_APP_MODELS_PARAMS_ARGS_COINGECKO_API_KEY: {
              ...serviceTemplate.env_variables
                .SKILL_MINDSHARE_APP_MODELS_PARAMS_ARGS_COINGECKO_API_KEY,
              value: values.coinGeckoApiKey,
            },
            SKILL_MINDSHARE_APP_MODELS_PARAMS_ARGS_TRENDMOON_API_KEY: {
              ...serviceTemplate.env_variables
                .SKILL_MINDSHARE_APP_MODELS_PARAMS_ARGS_TRENDMOON_API_KEY,
              value: values.trendmoonApiKey,
            },
          },
        };

        await onDummyServiceCreation(
          defaultStakingProgramId,
          overriddenServiceConfig,
        );

        message.success('Agent setup complete');

        // move to next page
        goto(SetupScreen.SetupEoaFunding);
      } catch (error) {
        message.error('Something went wrong. Please try again.');
        console.error(error);
      } finally {
        setIsSubmitting(false);
        updateSubmitButtonText('Continue');
      }
    },
    [
      defaultStakingProgramId,
      serviceTemplate,
      validateForm,
      updateSubmitButtonText,
      goto,
    ],
  );

  // Clean up
  useUnmount(async () => {
    setIsSubmitting(false);
    updateSubmitButtonText('Continue');
  });

  const canSubmitForm = isSubmitting || !defaultStakingProgramId;

  return (
    <>
      <SetupHeader />
      <Divider style={{ margin: '8px 0' }} />

      <Form<MindshareFieldValues>
        form={form}
        name="setup-mindshare-agent"
        layout="vertical"
        onFinish={onFinish}
        validateMessages={validateMessages}
        disabled={canSubmitForm}
        initialValues={{
          riskLevel: 'balanced',
        }}
      >
        <Form.Item
          name="etherscanApiKey"
          label="Etherscan API Key"
          {...requiredFieldProps}
          rules={[...requiredRules, { validator: validateApiKey }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="coinGeckoApiKey"
          label={<CoinGeckoApiKeyLabel />}
          {...requiredFieldProps}
          rules={[...requiredRules, { validator: validateApiKey }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="trendmoonApiKey"
          label="Trendmoon API Key"
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

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {submitButtonText}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};
