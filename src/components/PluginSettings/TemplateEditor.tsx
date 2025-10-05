import { useState } from 'react';
import { StandardEditorProps, TimeRange, LoadingState } from '@grafana/data';
import { useStyles2, Collapse } from '@grafana/ui';
import { css } from '@emotion/css';
import { FlowVisualization } from '../FlowVisualization/FlowVisualization';
import { FlowOptions } from '../../types';

const getStyles = (theme: any) => ({
    wrapper: css`
        height: 250px;
        border: 1px solid ${theme.colors.border.weak};
        border-radius: 4px;
        padding: 8px;
    `,
});

export const TemplateEditor = ({ value, onChange }: StandardEditorProps<string>) => {
    const [isOpen, setIsOpen] = useState(false);
    const styles = useStyles2(getStyles);

    // Mock panel props for the FlowVisualization component
    const mockPanelProps = {
        id: 1,
        data: {
            series: [],
            state: LoadingState.Done,
            timeRange: {} as TimeRange,
        },
        timeRange: {} as TimeRange,
        timeZone: 'browser',
        options: {
            title: '',
            aboveArrow: '',
            belowArrow: '',
            details: '',
            sourceLabel: '',
            destinationLabel: '',
            source: '',
            destination: '',
            sortoption: 'none' as const,
            colorGenerator: '',
            showbody: false
        } as FlowOptions,
        width: 400,
        height: 250,
        transparent: false,
        fieldConfig: { defaults: {}, overrides: [] },
        onOptionsChange: () => {},
        onFieldConfigChange: () => {},
        replaceVariables: (str: string) => str,
        onChangeTimeRange: () => {},
        eventBus: {} as any,
        renderCounter: 1,
        title: 'Template Preview',
    };

    return <Collapse label="Template" isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)}>
        <div className={styles.wrapper}>
            <FlowVisualization {...mockPanelProps} />
        </div>
    </Collapse>;
}
