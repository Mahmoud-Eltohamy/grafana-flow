import React, { useCallback } from 'react';
import { css, cx } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, useTheme2 } from '@grafana/ui';

interface FlowItemProps {
  item: {
    hash: string;
    source: string;
    destination: string;
    sourcePosition: number;
    destinationPosition: number;
    timestamp?: string;
    method?: string;
    callid?: string;
    labels?: any;
    messageID: number;
    [key: string]: any;
  };
  index: number;
  isSimplify?: boolean;
  isGroupByAlias?: boolean;
  isAbsolute?: boolean;
  onItemClick?: (hash: string, event: MouseEvent, item: any) => void;
}

const getStyles = (theme: GrafanaTheme2) => ({
  flowItem: css`
    position: relative;
    display: flex;
    align-items: center;
    min-height: 50px;
    padding: 8px 16px;
    border-bottom: 1px solid ${theme.colors.border.weak};
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: ${theme.colors.background.secondary};
      border-left: 3px solid ${theme.colors.primary.main};
    }
  `,
  messageIndex: css`
    min-width: 40px;
    font-size: 0.8rem;
    color: ${theme.colors.text.secondary};
    margin-right: 12px;
  `,
  flowLine: css`
    flex: 1;
    position: relative;
    height: 2px;
    background: ${theme.colors.border.medium};
    margin: 0 8px;
    border-radius: 1px;
  `,
  flowArrow: css`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-style: solid;
  `,
  flowArrowRight: css`
    right: -6px;
    border-left: 6px solid ${theme.colors.primary.main};
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
  `,
  flowArrowLeft: css`
    left: -6px;
    border-right: 6px solid ${theme.colors.primary.main};
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
  `,
  flowArrowBidirectional: css`
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 8px;
    height: 8px;
    background: ${theme.colors.primary.main};
    border-radius: 50%;
  `,
  sourceLabel: css`
    min-width: 120px;
    text-align: right;
    padding-right: 8px;
    font-size: 0.9rem;
    color: ${theme.colors.text.primary};
    font-weight: 500;
  `,
  destinationLabel: css`
    min-width: 120px;
    text-align: left;
    padding-left: 8px;
    font-size: 0.9rem;
    color: ${theme.colors.text.primary};
    font-weight: 500;
  `,
  messageDetails: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 100px;
    gap: 2px;
  `,
  methodLabel: css`
    font-size: 0.8rem;
    font-weight: bold;
    color: ${theme.colors.text.primary};
    background: ${theme.colors.background.secondary};
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid ${theme.colors.border.weak};
  `,
  timestampLabel: css`
    font-size: 0.7rem;
    color: ${theme.colors.text.secondary};
  `,
  callidLabel: css`
    font-size: 0.7rem;
    color: ${theme.colors.text.secondary};
    font-style: italic;
  `,
  simplified: css`
    min-height: 35px;
    padding: 4px 12px;
    
    .${css`font-size`} {
      font-size: 0.8rem;
    }
  `
});

// Method color mapping for SIP methods
const getMethodColor = (method: string, theme: GrafanaTheme2): string => {
  const methodColors: { [key: string]: string } = {
    'INVITE': theme.colors.success.main,
    'BYE': theme.colors.error.main,
    'CANCEL': theme.colors.warning.main,
    'ACK': theme.colors.info.main,
    'REGISTER': theme.colors.primary.main,
    'OPTIONS': theme.colors.secondary.main,
    'PRACK': theme.colors.success.border,
    'UPDATE': theme.colors.warning.border,
    'REFER': theme.colors.info.border,
    'SUBSCRIBE': theme.colors.primary.border,
    'NOTIFY': theme.colors.secondary.border,
    'MESSAGE': theme.colors.text.primary,
  };
  
  return methodColors[method?.toUpperCase()] || theme.colors.text.secondary;
};

export const FlowItem: React.FC<FlowItemProps> = ({
  item,
  index,
  isSimplify = false,
  isGroupByAlias = false,
  isAbsolute = true,
  onItemClick
}) => {
  const theme = useTheme2();
  const styles = useStyles2(getStyles);

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (onItemClick) {
      onItemClick(item.hash, event.nativeEvent as MouseEvent, item);
    }
  }, [item, onItemClick]);

  const getArrowDirection = useCallback(() => {
    if (item.sourcePosition < item.destinationPosition) {
      return 'right';
    } else if (item.sourcePosition > item.destinationPosition) {
      return 'left';
    }
    return 'bidirectional';
  }, [item.sourcePosition, item.destinationPosition]);

  const formatTimestamp = useCallback((timestamp?: string) => {
    if (!timestamp) {return '';}
    
    try {
      const date = new Date(timestamp);
      if (isAbsolute) {
        return date.toLocaleTimeString();
      } else {
        // Relative time formatting could be implemented here
        return date.toLocaleTimeString();
      }
    } catch {
      return timestamp;
    }
  }, [isAbsolute]);

  const arrowDirection = getArrowDirection();
  const methodColor = getMethodColor(item.method || '', theme);

  return (
    <div
      className={cx(styles.flowItem, { [styles.simplified]: isSimplify })}
      onClick={handleClick}
      data-testid={`flow-item-${item.hash}`}
    >
      {/* Message index */}
      <div className={styles.messageIndex}>
        #{index + 1}
      </div>

      {/* Source label */}
      <div className={styles.sourceLabel}>
        {item.source}
      </div>

      {/* Flow line with arrow */}
      <div className={styles.flowLine}>
        <div
          className={cx(styles.flowArrow, {
            [styles.flowArrowRight]: arrowDirection === 'right',
            [styles.flowArrowLeft]: arrowDirection === 'left',
            [styles.flowArrowBidirectional]: arrowDirection === 'bidirectional'
          })}
        />
      </div>

      {/* Message details */}
      <div className={styles.messageDetails}>
        {item.method && (
          <div 
            className={styles.methodLabel}
            style={{ 
              color: methodColor,
              borderColor: methodColor + '40'
            }}
          >
            {item.method}
          </div>
        )}
        {!isSimplify && item.timestamp && (
          <div className={styles.timestampLabel}>
            {formatTimestamp(item.timestamp)}
          </div>
        )}
        {!isSimplify && item.callid && (
          <div className={styles.callidLabel}>
            Call-ID: {item.callid}
          </div>
        )}
      </div>

      {/* Destination label */}
      <div className={styles.destinationLabel}>
        {item.destination}
      </div>
    </div>
  );
};
