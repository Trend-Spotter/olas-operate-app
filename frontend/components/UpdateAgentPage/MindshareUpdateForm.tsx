import { Button, Form, Input, Select, Typography } from 'antd';
import { get, isEqual, isUndefined, omitBy } from 'lodash';
import { useCallback, useContext, useMemo, useState } from 'react';

import { Pages } from '@/enums/Pages';
import { usePageState } from '@/hooks/usePageState';
import { useServices } from '@/hooks/useServices';
import { Nullable } from '@/types/Util';

import { CardLayout } from './CardLayout';
import { UpdateAgentContext } from './context/UpdateAgentProvider';

const { Text } = Typography;
const { Option } = Select;

type MindshareFieldValues = {
  etherscanApiKey: string;
  coingeckoApiKey: string;
  trendmoonApiKey: string;
  riskLevel: 'balanced' | 'conservative' | 'high';
};

const FormHeader = () => (
  <Text>
    Update your Mindshare agent configuration. Configure your API keys for Etherscan, 
    CoinGecko, and Trendmoon services, and set your risk tolerance level.
  </Text>
);

const MindshareUpdateForm = ({
  initialFormValues,
  onSubmit,
}: {
  initialFormValues?: Nullable<MindshareFieldValues>;
  onSubmit: (values: MindshareFieldValues) => Promise<void>;
}) => {
  const [form] = Form.useForm<MindshareFieldValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = useCallback(
    async (values: MindshareFieldValues) => {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit],
  );

  return (
    <>
      <FormHeader />
      
      <Form<MindshareFieldValues>
        form={form}
        name="update-mindshare-agent"
        layout="vertical"
        onFinish={handleFinish}
        disabled={isSubmitting}
        initialValues={initialFormValues || undefined}
        style={{ marginTop: 16 }}
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
            Update Agent
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

/**
 * Form for updating Mindshare agent.
 */
export const MindshareUpdatePage = () => {
  const { goto } = usePageState();
  const { selectedService } = useServices();
  const { unsavedModal, form } = useContext(UpdateAgentContext);

  const initialValues = useMemo<Nullable<MindshareFieldValues>>(() => {
    if (!selectedService?.env_variables) return null;

    const envEntries = Object.entries(selectedService.env_variables);

    return envEntries.reduce(
      (acc, [key, { value }]) => {
        if (key === 'ETHERSCAN_API_KEY') {
          acc.etherscanApiKey = value;
        } else if (key === 'COINGECKO_API_KEY') {
          acc.coingeckoApiKey = value;
        } else if (key === 'TRENDMOON_API_KEY') {
          acc.trendmoonApiKey = value;
        } else if (key === 'RISK_LEVEL') {
          acc.riskLevel = value as 'balanced' | 'conservative' | 'high';
        }

        return acc;
      },
      {} as MindshareFieldValues,
    );
  }, [selectedService?.env_variables]);

  const handleBackClick = useCallback(() => {
    // Check if there are unsaved changes and omit empty fields
    const unsavedFields = omitBy(
      form?.getFieldsValue(),
      (value) => isUndefined(value),
    );
    const previousValues = initialValues;

    const hasUnsavedChanges = !isEqual(unsavedFields, previousValues);
    if (hasUnsavedChanges) {
      unsavedModal.openModal();
    } else {
      goto(Pages.Main);
    }
  }, [initialValues, form, unsavedModal, goto]);

  const handleSubmit = useCallback(async (values: MindshareFieldValues) => {
    // This would typically update the service configuration
    // For now, just a placeholder implementation
    console.log('Updating Mindshare agent with values:', values);
  }, []);

  return (
    <CardLayout onClickBack={handleBackClick}>
      <MindshareUpdateForm 
        initialFormValues={initialValues} 
        onSubmit={handleSubmit}
      />
    </CardLayout>
  );
};
