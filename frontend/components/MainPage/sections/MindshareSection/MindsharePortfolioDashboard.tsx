import { Button, Card, Flex, Typography } from 'antd';
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';

import { COLOR } from '@/constants/colors';

const { Title, Text } = Typography;

// Styled components for the chart
const ChartContainer = styled.div`
  position: relative;
  height: 200px;
  margin: 20px 0;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
`;

const ChartSvg = styled.svg`
  width: 100%;
  height: 100%;
`;

const ChartPath = styled.path`
  fill: none;
  stroke: #52c41a;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const TimeButton = styled(Button)<{ $active: boolean }>`
  && {
    border: 1px solid ${props => props.$active ? COLOR.PURPLE : '#d9d9d9'};
    color: ${props => props.$active ? COLOR.PURPLE : '#666'};
    background: ${props => props.$active ? '#f6f4ff' : 'white'};
    font-size: 12px;
    height: 28px;
    padding: 0 12px;
    
    &:hover {
      border-color: ${COLOR.PURPLE};
      color: ${COLOR.PURPLE};
    }
  }
`;

const MetricCard = styled(Card)`
  && {
    .ant-card-body {
      padding: 16px;
    }
  }
`;

// Generate realistic portfolio data for 1 year
const generatePortfolioData = () => {
  const data = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  
  let baseValue = 15000; // Starting portfolio value
  const volatility = 0.02; // Daily volatility
  const trend = 0.0003; // Slight upward trend per day
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Add random walk with slight upward bias
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const trendChange = trend;
    baseValue *= (1 + randomChange + trendChange);
    
    // Add some realistic market cycles
    const cycleFactor = Math.sin(i / 30) * 0.01; // Monthly cycles
    baseValue *= (1 + cycleFactor);
    
    data.push({
      date,
      value: Math.max(baseValue, 10000), // Don't go below 10k
      timestamp: date.getTime(),
    });
  }
  
  return data;
};

type TimePeriod = '1D' | '1W' | '1M' | '1Y' | 'ALL';

export const MindsharePortfolioDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('ALL');
  
  const fullData = useMemo(() => generatePortfolioData(), []);
  
  const filteredData = useMemo(() => {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case '1D':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case '1W':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'ALL':
      default:
        return fullData;
    }
    
    return fullData.filter(point => point.date >= cutoffDate);
  }, [fullData, selectedPeriod]);
  
  const currentValue = fullData[fullData.length - 1]?.value || 0;
  const startValue = filteredData[0]?.value || currentValue;
  const change = currentValue - startValue;
  const changePercent = startValue > 0 ? (change / startValue) * 100 : 0;
  
  // Generate SVG path for the chart
  const generatePath = (data: typeof filteredData) => {
    if (data.length === 0) return '';
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const valueRange = maxValue - minValue;
    
    const width = 400; // SVG viewBox width
    const height = 150; // SVG viewBox height
    const padding = 20;
    
    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((point.value - minValue) / valueRange) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };
  
  const chartPath = generatePath(filteredData);
  
  const netDeposits = 9800; // Static value as shown in the image
  const riskLevel = 'Moderate'; // Static value as shown in the image
  
  return (
    <Card style={{ margin: '16px 0' }}>
      <Flex vertical gap={16}>
        {/* Header */}
        <Title level={3} style={{ margin: 0, textAlign: 'center' }}>
          Mindshare Dashboard
        </Title>
        
        {/* Portfolio Value */}
        <Flex vertical gap={4}>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Portfolio
          </Text>
          <Title level={2} style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
            ${currentValue.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </Title>
          <Text style={{ 
            color: change >= 0 ? '#52c41a' : '#ff4d4f',
            fontSize: '14px'
          }}>
            {change >= 0 ? '+' : ''}{change.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })} ({changePercent.toFixed(2)}%) all-time
          </Text>
        </Flex>
        
        {/* Chart */}
        <ChartContainer>
          <ChartSvg viewBox="0 0 400 150" preserveAspectRatio="none">
            <ChartPath d={chartPath} />
          </ChartSvg>
        </ChartContainer>
        
        {/* Time Period Buttons */}
        <Flex justify="center" gap={8}>
          {(['1D', '1W', '1M', '1Y', 'ALL'] as TimePeriod[]).map((period) => (
            <TimeButton
              key={period}
              size="small"
              $active={selectedPeriod === period}
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </TimeButton>
          ))}
        </Flex>
        
        {/* Metrics Row - exactly as shown in the image */}
        <Flex gap={16}>
          <MetricCard style={{ flex: 1 }}>
            <Flex vertical gap={4}>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Net deposits
              </Text>
              <Title level={4} style={{ margin: 0 }}>
                ${netDeposits.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </Title>
            </Flex>
          </MetricCard>
          
          <MetricCard style={{ flex: 1 }}>
            <Flex vertical gap={4}>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Risk level
              </Text>
              <Title level={4} style={{ margin: 0 }}>
                {riskLevel}
              </Title>
            </Flex>
          </MetricCard>
        </Flex>
        
        {/* CTA Button */}
        <Button 
          type="primary" 
          size="large" 
          block
          style={{ 
            height: '48px',
            fontSize: '16px',
            fontWeight: '500'
          }}
          onClick={() => {
            console.log('CTA button clicked - functionality to be implemented');
          }}
        >
          CTA
        </Button>
      </Flex>
    </Card>
  );
};
