import { useState } from 'react';
import {
  Drawer, Form, InputNumber, Select, Switch, Segmented, Button, Space, Divider, Spin,
} from 'antd';
import { FilePdfOutlined, FileImageOutlined, FileOutlined } from '@ant-design/icons';
import { exportSVG } from '../../utils/exportSVG';
import type { DocOptions } from '../../utils/exportSVG';
import { exportPDF } from '../../utils/exportPDF';
import { exportPNG, exportJPEG } from '../../utils/exportRaster';


interface Props {
  open: boolean;
  onClose: () => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const DEFAULT_OPTS: DocOptions = {
  margin: 25,
  pageSize: 'fit',
  resolution: 72,
  perforateFolds: false,
  perforationLength: 5,
  perforationGap: 1,
  pageArrangement: 'vertical',
};

export default function ExportDrawer({ open, onClose, svgRef, containerRef }: Props) {
  const [opts, setOpts] = useState<DocOptions>(DEFAULT_OPTS);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof DocOptions>(k: K, v: DocOptions[K]) {
    setOpts(prev => ({ ...prev, [k]: v }));
  }

  async function handle(fmt: string) {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg) return;
    setLoading(true);
    try {
      if (fmt === 'svg') exportSVG(svg, opts);
      else if (fmt === 'cricut') exportSVG(svg, { ...opts, cricut: true });
      else if (fmt === 'pdf') await exportPDF(svg, opts);
      else if (fmt === 'png' && container) await exportPNG(container, opts.resolution);
      else if (fmt === 'jpeg' && container) await exportJPEG(container, opts.resolution);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Drawer title="Export" open={open} onClose={onClose} width={320}>
      <Spin spinning={loading}>
        <Form layout="vertical" size="small">
          <Divider style={{ margin: '4px 0 12px' }}>Document Options</Divider>

          <Form.Item label="Margin (px)">
            <InputNumber value={opts.margin} min={0} onChange={v => set('margin', v ?? 0)} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Page Size">
            <Select
              value={opts.pageSize}
              onChange={v => set('pageSize', v)}
              options={[
                { value: 'fit', label: 'Fit page to drawing' },
                { value: 'A4', label: 'A4' },
                { value: 'Letter', label: 'Letter' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Resolution (DPI)">
            <InputNumber value={opts.resolution} min={36} max={600} onChange={v => set('resolution', v ?? 72)} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Perforate Folds">
            <Switch checked={opts.perforateFolds} onChange={v => set('perforateFolds', v)} />
          </Form.Item>

          {opts.perforateFolds && (
            <>
              <Form.Item label="Perforation Length">
                <InputNumber value={opts.perforationLength} min={1} onChange={v => set('perforationLength', v ?? 5)} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Perforation Gap">
                <InputNumber value={opts.perforationGap} min={0.5} step={0.5} onChange={v => set('perforationGap', v ?? 1)} style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}

          <Form.Item label="Page Arrangement">
            <Segmented
              options={['Vertical', 'Horizontal']}
              value={opts.pageArrangement === 'vertical' ? 'Vertical' : 'Horizontal'}
              onChange={v => set('pageArrangement', v === 'Vertical' ? 'vertical' : 'horizontal')}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Divider style={{ margin: '12px 0' }}>Export Formats</Divider>

          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            <Button block icon={<FilePdfOutlined />} onClick={() => handle('pdf')} type="primary">
              Export PDF
            </Button>
            <Button block icon={<FileOutlined />} onClick={() => handle('svg')}>
              Export SVG
            </Button>
            <Button block icon={<FileOutlined />} onClick={() => handle('cricut')}>
              Export Cricut SVG
            </Button>
            <Button block icon={<FileImageOutlined />} onClick={() => handle('png')}>
              Export PNG
            </Button>
            <Button block icon={<FileImageOutlined />} onClick={() => handle('jpeg')}>
              Export JPEG
            </Button>
          </Space>
        </Form>
      </Spin>
    </Drawer>
  );
}

export { DEFAULT_OPTS };
export type { DocOptions };
