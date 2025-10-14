import { Button, Divider, Form, Input, Select, Typography, message } from 'antd';
import React, { useCallback, useState } from 'react';
import { useUnmount } from 'usehooks-ts';

import { ServiceTemplate } from '@/client';
import { Pages } from '@/enums/Pages';
import { SetupScreen } from '@/enums/SetupScreen';
import { usePageState } from '@/hooks/usePageState';
import { useSetup } from '@/hooks/useSetup';
import { useStakingProgram } from '@/hooks/useStakingProgram';
import { onDummyServiceCreation } from '@/utils/service';

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

export const MindshareAgentForm = ({ serviceTemplate }: MindshareAgentFormProps) => {
  const { goto } = useSetup();
  const { goto: gotoPage } = usePageState();
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
      try {
        setIsSubmitting(true);
        updateSubmitButtonText('Setting up agent...');

        // Simple validation - just check that all fields have values
        if (!values.etherscanApiKey?.trim() || !values.coingeckoApiKey?.trim() || 
            !values.trendmoonApiKey?.trim() || !values.riskLevel) {
          message.error('Please fill in all fields');
          return;
        }

        // Brief delay for UX (simulating setup process)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        message.success('Agent configuration saved');
        
        // For Mindshare boilerplate, go directly to the main page
        gotoPage(Pages.Main);
      } catch (error) {
        message.error('Something went wrong. Please try again.');
        console.error('Error with Mindshare form:', error);
      } finally {
        setIsSubmitting(false);
        updateSubmitButtonText('Next');
      }
    },
    [gotoPage, updateSubmitButtonText]
  );

  // Clean up
  useUnmount(async () => {
    setIsSubmitting(false);
    updateSubmitButtonText('Next');
  });

  return (
    <>
      <SetupHeader />
      <Divider style={{ margin: '8px 0' }} />

      <Form<MindshareFieldValues>
        form={form}
        name="setup-mindshare-agent"
        layout="vertical"
        onFinish={onFinish}
        disabled={isSubmitting}
        initialValues={{
          riskLevel: 'balanced'
        }}
      >
        <Form.Item
          name="etherscanApiKey"
          label="Etherscan API Key"
          rules={[{ required: true, message: 'Please enter Etherscan API key' }]}
        >
          <Input placeholder="Enter Etherscan API key" />
        </Form.Item>

        <Form.Item
          name="coingeckoApiKey"
          label="CoinGecko API Key"
          rules={[{ required: true, message: 'Please enter CoinGecko API key' }]}
        >
          <Input placeholder="Enter CoinGecko API key" />
        </Form.Item>

        <Form.Item
          name="trendmoonApiKey"
          label="Trendmoon API Key"
          rules={[{ required: true, message: 'Please enter Trendmoon API key' }]}
        >
          <Input placeholder="Enter Trendmoon API key" />
        </Form.Item>

        <Form.Item
          name="riskLevel"
          label="Risk Level"
          rules={[{ required: true, message: 'Please select a risk level' }]}
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
            loading={isSubmitting}
            disabled={isSubmitting}
            block
            size="large"
          >
            {submitButtonText}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};
