import { Button, Divider, Form, Input, Select, Typography, message } from 'antd';
import React, { useCallback, useState } from 'react';
import { useUnmount } from 'usehooks-ts';

import { ServiceTemplate } from '@/client';
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
import {
  MindshareFieldValues,
  useMindshareFormValidate,
} from './useMindshareFormValidate';

const { Text } = Typography;
const { Option } = Select;

const SetupHeader = () => (
  <Text>
    Set up your Mindshare agent configuration. Configure your API keys for Etherscan, 
    CoinGecko, and Trendmoon services, and set your risk tolerance level.
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
  const {
    submitButtonText,
    updateSubmitButtonText,
    validateForm,
  } = useMindshareFormValidate();

  const onFinish = useCallback(
    async (values: MindshareFieldValues) => {
      if (!defaultStakingProgramId) return;

      try {
        setIsSubmitting(true);

        // wait for agent setup to complete
        updateSubmitButtonText('Setting up agent...');

        const isFormValid = await validateForm(values);
        if (!isFormValid) return;

        const overriddenServiceConfig: ServiceTemplate = {
          ...serviceTemplate,
          env_variables: {
            ...serviceTemplate.env_variables,
            ETHERSCAN_API_KEY: {
              ...serviceTemplate.env_variables.ETHERSCAN_API_KEY,
              value: values.etherscanApiKey,
            },
            COINGECKO_API_KEY: {
              ...serviceTemplate.env_variables.COINGECKO_API_KEY,
              value: values.coingeckoApiKey,
            },
            TRENDMOON_API_KEY: {
              ...serviceTemplate.env_variables.TRENDMOON_API_KEY,
              value: values.trendmoonApiKey,
            },
            RISK_LEVEL: {
              ...serviceTemplate.env_variables.RISK_LEVEL,
              value: values.riskLevel,
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
          riskLevel: 'balanced'
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
          name="coingeckoApiKey"
          label="CoinGecko API Key"
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
          {...requiredFieldProps}
          rules={requiredRules}
        >
          <Select placeholder="Select risk level">
            <Option value="balanced">Balanced</Option>
            <Option value="conservative">Conservative</Option>
            <Option value="high">High</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isSubmitting}
            disabled={canSubmitForm}
          >
            {submitButtonText}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};
