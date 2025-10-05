import { css } from "@emotion/css";
import { InlineLabel, useStyles2 } from "@grafana/ui";
import { CopyText } from "components/CopyText/CopyText";
import "@alenaksu/json-viewer";
const getStyles = () => {
    return {

        label: css`
      background-color: rgba(128, 128, 128, 0.1);
      padding: 3px;
    `,
        pre: css`
      white-space: pre-wrap;
      padding-right: 35px;
    `
    };
};
interface Props {
    item: any;
    theme: string;
    tooltip?: string;
}
export const DetailItem = ({ item, theme, tooltip }: Props): JSX.Element | null => {
    let [key, value]: any = item;
    let isJSON = false;
    const styles = useStyles2(getStyles);
    const isTimestamp = (new Date(value)).getTime() > 0;
    if (isTimestamp) {
        value = `${new Date(value).toISOString()} | ${value}`;
    }
    try {
        isJSON = typeof JSON.parse(value) === 'object';
    } catch (e) { }
    const isMultiLine = !!value?.includes('\n') || value?.length > 50;
    return (<div>
        {value && (
            (isJSON || isMultiLine) ?
                <>
                    <InlineLabel tooltip={tooltip} style={{ height: '41px', borderRadius: '4px', marginBottom: '4px' }}>
                        {key}
                    </InlineLabel>
            {isJSON ?
                <div style={{ position: 'relative' }}>
                    <json-viewer 
                        data={value}
                        theme={theme === 'Dark' ? 'dark' : 'light'}
                    />
                    <span style={{ position: 'absolute', right: 15, top: 5 }}>
                        <CopyText text={value} />
                    </span>
                </div> :
                <span style={{ position: 'relative' }}>
                    <pre className={styles.pre}>
                        {value}
                    </pre>
                    <span style={{ position: 'absolute', right: 15, top: 32 }}>

                        <CopyText text={value} />
                    </span>
                </span>
            }
                </> :
                <>
                    <span style={{ display: 'grid', gridTemplateColumns: '20% 80%', columnGap: '5px' }}>
                        <InlineLabel tooltip={key.length > 15 ? `${key}: ${tooltip}` : tooltip} style={{ height: '41px', borderRadius: '4px' }}>
                            {key.length > 15 ? key.slice(0, 12) + '...' : key}
                        </InlineLabel>
                        <span style={{ position: 'relative' }}>
                            <pre className={styles.pre} style={{ height: '41px' }}>
                                {value}
                            </pre>
                            <span style={{ position: 'absolute', right: 15, top: 0, bottom: 20, display: 'flex', alignItems: 'center' }}>

                                <CopyText text={value} />
                            </span>
                        </span>
                    </span>
                </>)
        }

    </div>);
}
