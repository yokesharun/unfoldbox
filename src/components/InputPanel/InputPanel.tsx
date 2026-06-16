import { Form, InputNumber, Segmented, Divider, Collapse, Typography, Tag } from 'antd';
import type { BoxDimensions, Unit } from '../../utils/geometry';
import { convertDimensions } from '../../utils/geometry';

const { Text } = Typography;

interface Props {
  dims: BoxDimensions;
  onChange: (d: BoxDimensions) => void;
}

function stepForUnit(unit: Unit) {
  switch (unit) {
    case 'cm':   return 0.1;
    case 'inch': return 0.1;
    case 'mm':   return 1;
    default:     return 1; // px
  }
}

export default function InputPanel({ dims, onChange }: Props) {
  function set(key: keyof BoxDimensions, value: number | string | null) {
    if (value === null) return;
    onChange({ ...dims, [key]: value });
  }

  function handleUnitChange(newUnit: Unit) {
    onChange(convertDimensions(dims, newUnit));
  }

  const unitSuffix = dims.unit;
  const step = stepForUnit(dims.unit);

  const numField = (label: string, key: keyof BoxDimensions, min = 0, customStep?: number) => (
    <Form.Item
      key={key}
      label={<Text style={{ fontSize: 12 }}>{label}</Text>}
      style={{ marginBottom: 8 }}
    >
      <InputNumber
        value={dims[key] as number}
        min={min}
        step={customStep ?? step}
        onChange={v => set(key, v)}
        style={{ width: '100%' }}
        size="small"
        addonAfter={unitSuffix}
      />
    </Form.Item>
  );

  return (
    <div style={{ padding: '10px 12px', overflowY: 'auto', height: '100%' }}>
      <Form layout="vertical" size="small">

        <Form.Item
          label={<Text strong style={{ fontSize: 12 }}>Units</Text>}
          style={{ marginBottom: 6 }}
        >
          <Segmented
            options={['mm', 'cm', 'inch', 'px']}
            value={dims.unit}
            onChange={v => handleUnitChange(v as Unit)}
            size="small"
            style={{ width: '100%' }}
          />
        </Form.Item>

        {dims.unit === 'px' && (
          <Form.Item
            label={
              <span style={{ fontSize: 12 }}>
                Resolution (PPI)&nbsp;
                <Tag color="blue" style={{ fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>
                  {dims.ppi} PPI
                </Tag>
              </span>
            }
            style={{ marginBottom: 8 }}
          >
            <InputNumber
              value={dims.ppi}
              min={36}
              max={600}
              step={36}
              onChange={v => set('ppi', v ?? 72)}
              style={{ width: '100%' }}
              size="small"
              addonAfter="PPI"
            />
          </Form.Item>
        )}

        <Divider style={{ margin: '8px 0' }}>
          <Text style={{ fontSize: 11, color: '#888' }}>Dimensions</Text>
        </Divider>

        {numField('Length', 'length', 0.01)}
        {numField('Width', 'width', 0.01)}
        {numField('Height', 'height', 0.01)}

        <Collapse
          size="small"
          ghost
          style={{ marginTop: 8 }}
          items={[{
            key: '1',
            label: <Text style={{ fontSize: 12 }}>Optional Parameters</Text>,
            children: (
              <>
                {numField('Thumb Hole Diameter', 'thumbHoleDiameter', 0)}
                {numField('Tuck Flap Size', 'tuckFlapSize', 0.01)}
                {numField('Glue Flap Size', 'glueFlapSize', 0.01)}
                {numField('Material Thickness', 'materialThickness', 0, 0.01)}
              </>
            ),
          }]}
        />
      </Form>
    </div>
  );
}
