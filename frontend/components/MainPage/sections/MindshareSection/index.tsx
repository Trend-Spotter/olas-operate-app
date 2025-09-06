import { AgentType } from '@/enums/Agent';
import { useServices } from '@/hooks/useServices';

import { MindsharePortfolioDashboard } from './MindsharePortfolioDashboard';

export const MindshareSection = () => {
  const { selectedAgentType } = useServices();
  
  // Only show the Mindshare dashboard for Mindshare agents
  if (selectedAgentType !== AgentType.Mindshare) {
    return null;
  }
  
  return <MindsharePortfolioDashboard />;
};
