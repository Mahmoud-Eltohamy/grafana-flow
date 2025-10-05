import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { css } from '@emotion/css';
import { PanelProps } from '@grafana/data';
import { useStyles2, Button, HorizontalGroup } from '@grafana/ui';
import { FlowOptions } from '../../types';
import { FlowItem } from './FlowItem';
import { FilterPanel } from './FilterPanel';

interface FlowVisualizationProps extends PanelProps<FlowOptions> {
  // Additional props specific to flow visualization
}

interface FilterOptions {
  searchTerm: string;
  methodFilter: string[];
  sourceFilter: string;
  destinationFilter: string;
  callidFilter: string;
  showOnlyErrors: boolean;
}



const getStyles = (theme: any) => ({
  wrapper: css`
    position: relative;
    height: 100%;
    width: 100%;
    overflow: hidden;
  `,
  container: css`
    height: 100%;
    display: flex;
    flex-direction: column;
    background: ${theme.colors.background.primary};
  `,
  header: css`
    padding: 8px 16px;
    border-bottom: 1px solid ${theme.colors.border.weak};
    background: ${theme.colors.background.secondary};
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  headerTitle: css`
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: ${theme.colors.text.primary};
  `,
  content: css`
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  `,
  hostContainer: css`
    display: flex;
    justify-content: space-between;
    margin: 16px 20px 20px 20px;
    padding: 0 60px; /* Account for message index and spacing */
    position: sticky;
    top: 0;
    background: ${theme.colors.background.primary};
    z-index: 10;
    border-bottom: 2px solid ${theme.colors.border.medium};
    padding-bottom: 8px;
  `,
  host: css`
    padding: 8px 16px;
    background: ${theme.colors.background.secondary};
    border: 1px solid ${theme.colors.border.medium};
    border-radius: 4px;
    font-weight: 600;
    color: ${theme.colors.text.primary};
    box-shadow: ${theme.shadows.z1};
    min-width: 120px;
    text-align: center;
  `,
  flowContainer: css`
    flex: 1;
    min-height: 400px;
    padding: 0 8px;
  `,
  emptyState: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: ${theme.colors.text.secondary};
    font-size: 1.1rem;
  `,
  exportActions: css`
    display: flex;
    gap: 8px;
  `,
  statsInfo: css`
    font-size: 0.9rem;
    color: ${theme.colors.text.secondary};
  `
});

export const FlowVisualization: React.FC<FlowVisualizationProps> = ({ 
  data, 
  options, 
  width, 
  height 
}) => {
  const styles = useStyles2(getStyles);
  
  // State management
  const [flowData, setFlowData] = useState<any[]>([]);
  const [hosts, setHosts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    methodFilter: [],
    sourceFilter: '',
    destinationFilter: '',
    callidFilter: '',
    showOnlyErrors: false
  });

  // Process data from Grafana
  const processedData = useMemo(() => {
    if (!data?.series?.length) {return [];}
    
    const series = data.series[0];
    const messages: any[] = [];
    
    // Extract flow data from the series
    series.fields.forEach((field, index) => {
      if (field.values?.length) {
        field.values.forEach((value, rowIndex) => {
          if (!messages[rowIndex]) {
            messages[rowIndex] = { messageID: rowIndex };
          }
          messages[rowIndex][field.name || `field_${index}`] = value;
        });
      }
    });
    
    // Add position information for hosts
    const hostPositions = new Map<string, number>();
    const uniqueHosts = new Set<string>();
    
    messages.forEach(msg => {
      if (msg.source) {uniqueHosts.add(msg.source);}
      if (msg.destination) {uniqueHosts.add(msg.destination);}
    });
    
    Array.from(uniqueHosts).sort().forEach((host, index) => {
      hostPositions.set(host, index);
    });
    
    // Add position data to messages
    messages.forEach(msg => {
      msg.sourcePosition = hostPositions.get(msg.source) || 0;
      msg.destinationPosition = hostPositions.get(msg.destination) || 0;
      msg.hash = msg.hash || `msg_${msg.messageID}_${Date.now()}`;
    });
    
    return messages.filter(msg => msg && Object.keys(msg).length > 1);
  }, [data]);

  // Extract unique hosts and methods from data
  const { extractedHosts, availableMethods } = useMemo(() => {
    const hostSet = new Set<string>();
    const methodSet = new Set<string>();
    
    processedData.forEach(item => {
      if (item.source) {hostSet.add(item.source);}
      if (item.destination) {hostSet.add(item.destination);}
      if (item.method) {methodSet.add(item.method);}
    });
    
    return {
      extractedHosts: Array.from(hostSet).sort(),
      availableMethods: Array.from(methodSet).sort()
    };
  }, [processedData]);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    return processedData.filter(item => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchableText = `${item.method || ''} ${item.source || ''} ${item.destination || ''} ${item.callid || ''}`.toLowerCase();
        if (!searchableText.includes(searchLower)) {return false;}
      }
      
      // Method filter
      if (filters.methodFilter.length > 0 && !filters.methodFilter.includes(item.method)) {
        return false;
      }
      
      // Source filter
      if (filters.sourceFilter && item.source !== filters.sourceFilter) {
        return false;
      }
      
      // Destination filter
      if (filters.destinationFilter && item.destination !== filters.destinationFilter) {
        return false;
      }
      
      // Call-ID filter
      if (filters.callidFilter && !item.callid?.includes(filters.callidFilter)) {
        return false;
      }
      
      // Error responses filter
      if (filters.showOnlyErrors) {
        const responseCode = parseInt(item.response_code || '0', 10);
        if (responseCode < 400) {return false;}
      }
      
      return true;
    });
  }, [processedData, filters]);

  // Update state when data changes
  useEffect(() => {
    setFlowData(filteredData);
    setHosts(extractedHosts);
  }, [filteredData, extractedHosts]);

  // Handle message click
  const handleMessageClick = useCallback((hash: string, event: MouseEvent, item: any) => {
    // Emit custom event for flow item click
    const customEvent = new CustomEvent('flow-item-click', {
      detail: { hash, item }
    });
    window.dispatchEvent(customEvent);
  }, []);

  // Handle export functionality
  const handleExport = useCallback((format: string) => {
    const customEvent = new CustomEvent(`export-flow-as-${format}`, {
      detail: { data: flowData }
    });
    window.dispatchEvent(customEvent);
  }, [flowData]);

  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  return (
    <div className={styles.wrapper} style={{ width, height }}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.headerTitle}>
            Flow Diagram
            <span className={styles.statsInfo}>
              {' '}({filteredData.length} of {processedData.length} messages)
            </span>
          </h3>
          
          <HorizontalGroup spacing="sm">
            <div className={styles.exportActions}>
              <Button size="sm" variant="secondary" onClick={() => handleExport('png')}>
                Export PNG
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleExport('txt')}>
                Export TXT
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleExport('pcap')}>
                Export PCAP
              </Button>
            </div>
            <Button size="sm" variant="secondary" onClick={toggleFilters}>
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </HorizontalGroup>
        </div>
        
        <div className={styles.content}>
          {/* Filter Panel */}
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            availableMethods={availableMethods}
            availableSources={extractedHosts}
            availableDestinations={extractedHosts}
            isVisible={showFilters}
            onToggleVisibility={toggleFilters}
          />
          
          {/* Host headers */}
          {hosts.length > 0 && (
            <div className={styles.hostContainer}>
              {hosts.map(host => (
                <div key={host} className={styles.host}>
                  {host}
                </div>
              ))}
            </div>
          )}
          
          {/* Flow messages */}
          <div className={styles.flowContainer}>
            {flowData.length === 0 ? (
              <div className={styles.emptyState}>
                <div>No flow data available</div>
                <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                  {processedData.length === 0 
                    ? 'No data received from query' 
                    : 'All messages filtered out'
                  }
                </div>
              </div>
            ) : (
              flowData.map((item, index) => (
                <FlowItem
                  key={item.hash}
                  item={item}
                  index={index}
                  isSimplify={options.isSimplify}
                  onItemClick={handleMessageClick}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
