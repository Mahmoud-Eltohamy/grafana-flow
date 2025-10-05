import React, { useCallback, useMemo } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { 
  useStyles2, 
  Input, 
  Select, 
  Button, 
  Checkbox, 
  Field,
  FieldSet,
  HorizontalGroup,
  VerticalGroup
} from '@grafana/ui';

interface FilterOptions {
  searchTerm: string;
  methodFilter: string[];
  sourceFilter: string;
  destinationFilter: string;
  callidFilter: string;
  showOnlyErrors: boolean;
  timeRange?: {
    from: string;
    to: string;
  };
}

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableMethods: string[];
  availableSources: string[];
  availableDestinations: string[];
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const getStyles = (theme: GrafanaTheme2) => ({
  filterPanel: css`
    background: ${theme.colors.background.primary};
    border: 1px solid ${theme.colors.border.weak};
    border-radius: ${theme.shape.borderRadius()};
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: ${theme.shadows.z1};
  `,
  filterHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid ${theme.colors.border.weak};
  `,
  filterTitle: css`
    font-size: 1.1rem;
    font-weight: 600;
    color: ${theme.colors.text.primary};
    margin: 0;
  `,
  filterGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  `,
  filterActions: css`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid ${theme.colors.border.weak};
  `,
  methodCheckboxGroup: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  `,
  methodCheckbox: css`
    margin-right: 12px;
    margin-bottom: 4px;
  `,
  collapsedPanel: css`
    padding: 8px 16px;
    cursor: pointer;
    
    &:hover {
      background: ${theme.colors.background.secondary};
    }
  `
});

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  availableMethods,
  availableSources,
  availableDestinations,
  isVisible,
  onToggleVisibility
}) => {
  const styles = useStyles2(getStyles);

  const sourceOptions = useMemo(() => 
    availableSources.map(source => ({ label: source, value: source })),
    [availableSources]
  );

  const destinationOptions = useMemo(() => 
    availableDestinations.map(dest => ({ label: dest, value: dest })),
    [availableDestinations]
  );

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchTerm: event.target.value
    });
  }, [filters, onFiltersChange]);

  const handleSourceChange = useCallback((value: string) => {
    onFiltersChange({
      ...filters,
      sourceFilter: value
    });
  }, [filters, onFiltersChange]);

  const handleDestinationChange = useCallback((value: string) => {
    onFiltersChange({
      ...filters,
      destinationFilter: value
    });
  }, [filters, onFiltersChange]);

  const handleCallidChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      callidFilter: event.target.value
    });
  }, [filters, onFiltersChange]);

  const handleMethodToggle = useCallback((method: string, checked: boolean) => {
    const newMethods = checked
      ? [...filters.methodFilter, method]
      : filters.methodFilter.filter(m => m !== method);
    
    onFiltersChange({
      ...filters,
      methodFilter: newMethods
    });
  }, [filters, onFiltersChange]);

  const handleErrorsOnlyToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      showOnlyErrors: event.target.checked
    });
  }, [filters, onFiltersChange]);

  const handleClearFilters = useCallback(() => {
    onFiltersChange({
      searchTerm: '',
      methodFilter: [],
      sourceFilter: '',
      destinationFilter: '',
      callidFilter: '',
      showOnlyErrors: false
    });
  }, [onFiltersChange]);

  const hasActiveFilters = useMemo(() => {
    return filters.searchTerm ||
           filters.methodFilter.length > 0 ||
           filters.sourceFilter ||
           filters.destinationFilter ||
           filters.callidFilter ||
           filters.showOnlyErrors;
  }, [filters]);

  if (!isVisible) {
    return (
      <div className={styles.collapsedPanel} onClick={onToggleVisibility}>
        <HorizontalGroup justify="space-between">
          <span>Filters {hasActiveFilters && '(Active)'}</span>
          <Button variant="secondary" size="sm" fill="text">
            Show Filters
          </Button>
        </HorizontalGroup>
      </div>
    );
  }

  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterHeader}>
        <h3 className={styles.filterTitle}>Flow Filters</h3>
        <Button variant="secondary" size="sm" onClick={onToggleVisibility}>
          Hide Filters
        </Button>
      </div>

      <div className={styles.filterGrid}>
        <Field label="Search">
          <Input
            placeholder="Search in messages..."
            value={filters.searchTerm}
            onChange={handleSearchChange}
          />
        </Field>

        <Field label="Source">
          <Select
            placeholder="All sources"
            value={filters.sourceFilter}
            onChange={(value) => handleSourceChange(value?.value || '')}
            options={[{ label: 'All sources', value: '' }, ...sourceOptions]}
            isClearable
          />
        </Field>

        <Field label="Destination">
          <Select
            placeholder="All destinations"
            value={filters.destinationFilter}
            onChange={(value) => handleDestinationChange(value?.value || '')}
            options={[{ label: 'All destinations', value: '' }, ...destinationOptions]}
            isClearable
          />
        </Field>

        <Field label="Call-ID">
          <Input
            placeholder="Filter by Call-ID..."
            value={filters.callidFilter}
            onChange={handleCallidChange}
          />
        </Field>
      </div>

      <FieldSet label="SIP Methods">
        <div className={styles.methodCheckboxGroup}>
          {availableMethods.map(method => (
            <div key={method} className={styles.methodCheckbox}>
              <Checkbox
                label={method}
                value={filters.methodFilter.includes(method)}
                onChange={(event) => handleMethodToggle(method, event.currentTarget.checked)}
              />
            </div>
          ))}
        </div>
      </FieldSet>

      <VerticalGroup spacing="sm">
        <Checkbox
          label="Show only error responses (4xx, 5xx, 6xx)"
          value={filters.showOnlyErrors}
          onChange={handleErrorsOnlyToggle}
        />
      </VerticalGroup>

      <div className={styles.filterActions}>
        <Button variant="secondary" onClick={handleClearFilters} disabled={!hasActiveFilters}>
          Clear All Filters
        </Button>
        <span style={{ color: hasActiveFilters ? '#52c41a' : '#8c8c8c', fontSize: '0.9rem' }}>
          {hasActiveFilters ? 'Filters Active' : 'No Filters Applied'}
        </span>
      </div>
    </div>
  );
};
