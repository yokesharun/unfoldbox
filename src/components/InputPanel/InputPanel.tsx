import { Form, InputNumber, Segmented, Divider, Collapse, Typography } from 'antd';
import type { BoxDimensions, Unit } from '../../utils/geometry';

const { Text } = Typography;

interface Props {
  dims: BoxDimensions;
  onChange: (d: BoxDimensions) => void;
}

export default function InputPanel({ dims, onChange }: Props) {
  function set(key: keyof BoxDimensions, value: number | string | null) {
    if (value === null) return;
    onChange({ ...dims, [key]: value });
  }

  const numField = (
    label: string,
    key: keyof BoxDimensions,
    min = 0,
    step = 1
  ) => (
    <Form.Item label={<Text style={{ fontSize: 12 }}>{label}</Text>} style={{ marginBottom: 8 }}>
      <InputNumber
        value={dims[key] as number}
        min={min}
        step={step}
        onChange={v => set(key, v)}
        style={{ width: '100%' }}
        size="small"
        addonAfter={dims.unit}
      />
    </Form.Item>
  );

  return (
    <div style={{ padding: '12px 12px', overflowY: 'auto', height: '100%' }}>
      <Form layout="vertical" size="small">
        <Form.Item label={<Text strong style={{ fontSize: 12 }}>Units</Text>} style={{ marginBottom: 8 }}>
          <Segmented
            options={['mm', 'cm', 'inch']}
            value={dims.unit}
            onChange={v => set('unit', v as Unit)}
            size="small"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Divider style={{ margin: '8px 0', fontSize: 11 }}>Dimensions</Divider>

        {numField('Length', 'length', 1)}
        {numField('Width', 'width', 1)}
        {numField('Height', 'height', 1)}

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
                {numField('Tuck Flap Size', 'tuckFlapSize', 1)}
                {numField('Glue Flap Size', 'glueFlapSize', 1)}
                <Form.Item label={<Text style={{ fontSize: 12 }}>Glue Flap Angle</Text>} style={{ marginBottom: 8 }}>
                  <InputNumber
                    value={dims.glueFlapAngle}
                    min={30} max={89} step={1}
                    onChange={v => set('glueFlapAngle', v)}
                    style={{ width: '100%' }}
                    size="small"
                    addonAfter="°"
                  />
                </Form.Item>
                {numField('Material Thickness', 'materialThickness', 0, 0.1)}
                {numField('Rounded Corners Radius', 'roundedCornersRadius', 0)}
              </>
            ),
          }]}
        />
      </Form>
    </div>
  );
}
