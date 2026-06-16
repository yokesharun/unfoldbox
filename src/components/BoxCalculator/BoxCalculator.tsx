import { useState } from 'react';
import { Modal, Form, InputNumber, Button, Typography, Space, Divider, Alert } from 'antd';
import { CalculatorOutlined } from '@ant-design/icons';
import type { BoxDimensions } from '../../utils/geometry';

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (partial: Pick<BoxDimensions, 'length' | 'width' | 'height'>) => void;
  materialThickness: number;
}

interface ProductDims {
  length: number;
  width: number;
  height: number;
  tolerance: number;
}

const DEFAULT_PRODUCT: ProductDims = {
  length: 50,
  width: 20,
  height: 80,
  tolerance: 5,
};

export default function BoxCalculator({ open, onClose, onApply, materialThickness }: Props) {
  const [product, setProduct] = useState<ProductDims>(DEFAULT_PRODUCT);
  const [result, setResult] = useState<Pick<BoxDimensions, 'length' | 'width' | 'height'> | null>(null);

  function set(key: keyof ProductDims, val: number | null) {
    setProduct(prev => ({ ...prev, [key]: val ?? prev[key] }));
    setResult(null);
  }

  function calculate() {
    const mt = materialThickness;
    const { length, width, height, tolerance } = product;
    setResult({
      length: Math.ceil(length + 2 * tolerance + 2 * mt),
      width:  Math.ceil(width  + 2 * tolerance + 2 * mt),
      height: Math.ceil(height + tolerance + mt),
    });
  }

  function applyAndClose() {
    if (!result) return;
    onApply(result);
    onClose();
  }

  return (
    <Modal
      title={<span style={{ fontWeight: 700, color: '#FF6B6B' }}>📦 Box Size Calculator</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={360}
    >
      <Alert
        message="Enter your product dimensions and we'll suggest the optimal box size."
        type="info"
        showIcon
        style={{ marginBottom: 16, fontSize: 12 }}
      />

      <Form layout="vertical" size="small">
        <Divider style={{ margin: '0 0 12px' }}>
          <Text style={{ fontSize: 12 }}>Product Dimensions (mm)</Text>
        </Divider>

        <Space style={{ width: '100%' }} direction="vertical" size={4}>
          <Form.Item label="Product Length" style={{ marginBottom: 8 }}>
            <InputNumber value={product.length} min={1} onChange={v => set('length', v)} style={{ width: '100%' }} addonAfter="mm" />
          </Form.Item>
          <Form.Item label="Product Width" style={{ marginBottom: 8 }}>
            <InputNumber value={product.width} min={1} onChange={v => set('width', v)} style={{ width: '100%' }} addonAfter="mm" />
          </Form.Item>
          <Form.Item label="Product Height" style={{ marginBottom: 8 }}>
            <InputNumber value={product.height} min={1} onChange={v => set('height', v)} style={{ width: '100%' }} addonAfter="mm" />
          </Form.Item>
          <Form.Item label="Tolerance (clearance each side)" style={{ marginBottom: 8 }}>
            <InputNumber value={product.tolerance} min={0} max={30} onChange={v => set('tolerance', v)} style={{ width: '100%' }} addonAfter="mm" />
          </Form.Item>
        </Space>

        <Button
          block
          type="primary"
          icon={<CalculatorOutlined />}
          onClick={calculate}
          style={{ marginTop: 8, background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', border: 'none' }}
        >
          Calculate Box Size
        </Button>

        {result && (
          <>
            <Divider style={{ margin: '16px 0 12px' }}>
              <Text style={{ fontSize: 12, color: '#06D6A0' }}>Suggested Box Size</Text>
            </Divider>

            <div style={{
              background: 'linear-gradient(135deg, #f0fff9, #f5fff5)',
              border: '1px solid #b7ebd4',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 12,
            }}>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>Length</Text>
                  <Text strong style={{ fontSize: 14, color: '#06D6A0' }}>{result.length} mm</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>Width</Text>
                  <Text strong style={{ fontSize: 14, color: '#06D6A0' }}>{result.width} mm</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>Height</Text>
                  <Text strong style={{ fontSize: 14, color: '#06D6A0' }}>{result.height} mm</Text>
                </div>
              </Space>
              <Text style={{ fontSize: 10, color: '#999', display: 'block', marginTop: 8 }}>
                Includes {product.tolerance}mm tolerance + {materialThickness}mm material thickness
              </Text>
            </div>

            <Button block type="default" onClick={applyAndClose} style={{ borderColor: '#06D6A0', color: '#06D6A0' }}>
              Apply to Box Dimensions
            </Button>
          </>
        )}
      </Form>
    </Modal>
  );
}
