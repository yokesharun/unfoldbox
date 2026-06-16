import { useState, useEffect } from 'react';
import {
  Modal, Form, InputNumber, Select, Switch, Segmented, Button, Space, Divider, Spin, Card,
  Typography, Input,
} from 'antd';
import { FilePdfOutlined, FileImageOutlined, FileOutlined } from '@ant-design/icons';
import { exportSVG } from '../../utils/exportSVG';
import type { DocOptions } from '../../utils/exportSVG';
import { exportPDF } from '../../utils/exportPDF';
import { exportPNG, exportJPEG } from '../../utils/exportRaster';

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const DEFAULT_OPTS: DocOptions = {
  margin: 25,
  pageSize: 'fit',
  resolution: 72,
  perforateFolds: false,
  perforationLength: 5,
  perforationGap: 1,
  pageArrangement: 'horizontal',
};

const PAGE_RATIOS: Record<string, number> = {
  fit: 0,
  A4: 1 / 1.414,
  Letter: 1 / 1.294,
};

const ADJECTIVES = ['dino','neon','cosmic','funky','blazing','turbo','vivid','glitter','solar','pixel','retro','ultra'];
const NOUNS = ['show','craft','pack','wrap','gift','drop','pop','spark','glow','dash','stack','twist'];

function randomName() {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${a}${n}box`;
}

export default function ExportDrawer({ open, onClose, svgRef, containerRef }: Props) {
  const [opts, setOpts] = useState<DocOptions>(DEFAULT_OPTS);
  const [loading, setLoading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>('');
  const [svgAspect, setSvgAspect] = useState(0.6);
  const [projectName, setProjectName] = useState(randomName);

  function set<K extends keyof DocOptions>(k: K, v: DocOptions[K]) {
    setOpts(prev => ({ ...prev, [k]: v }));
  }

  useEffect(() => {
    if (!open || !svgRef.current) return;
    const svg = svgRef.current;
    const vb = svg.viewBox.baseVal;
    if (vb.width && vb.height) setSvgAspect(vb.height / vb.width);
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const str = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    setPreviewSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [open, opts, svgRef]);

  const stem = projectName.trim() || 'unfoldbox';
  const filename = `${stem}-unfoldbox`;

  async function handle(fmt: string) {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg) return;
    setLoading(true);
    try {
      if (fmt === 'svg')    exportSVG(svg, opts, filename);
      else if (fmt === 'cricut') exportSVG(svg, { ...opts, cricut: true }, filename);
      else if (fmt === 'pdf')    await exportPDF(svg, opts, filename);
      else if (fmt === 'png' && container)  await exportPNG(container, opts.resolution, filename);
      else if (fmt === 'jpeg' && container) await exportJPEG(container, opts.resolution, filename);
    } finally {
      setLoading(false);
    }
  }

  const previewW = 220;
  const aspect = opts.pageSize === 'fit' ? svgAspect : PAGE_RATIOS[opts.pageSize];
  const previewH = Math.round(previewW * aspect);
  const innerPad = Math.round((opts.margin / 200) * previewW);
  const isLandscape = opts.pageArrangement === 'horizontal';

  const pageMockStyle: React.CSSProperties = {
    width: isLandscape ? previewH : previewW,
    height: isLandscape ? previewW : previewH,
    background: '#fff',
    border: '1px solid #d0d0d0',
    boxShadow: '2px 3px 8px rgba(0,0,0,0.12)',
    padding: innerPad,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  return (
    <Modal
      title={<span style={{ fontWeight: 700, color: '#FF6B6B' }}>Export</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      styles={{ body: { maxHeight: '80vh', overflowY: 'auto', paddingTop: 8 } }}
    >
      <Spin spinning={loading}>
        {/* Live Preview */}
        {previewSrc && (
          <Card
            size="small"
            style={{ background: '#f5f5f5', marginBottom: 16, textAlign: 'center' }}
            styles={{ body: { padding: 12 } }}
          >
            <Text style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 8 }}>Preview</Text>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={pageMockStyle}>
                <img
                  src={previewSrc}
                  alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
            <Text style={{ fontSize: 10, color: '#aaa', marginTop: 8, display: 'block' }}>
              {opts.pageSize === 'fit' ? 'Fit to drawing' : opts.pageSize}
              {' • '}{opts.resolution} DPI
              {' • '}{isLandscape ? 'Landscape' : 'Portrait'}
            </Text>
          </Card>
        )}

        <Form layout="vertical" size="small">
          <Divider style={{ margin: '0 0 12px' }}>
            <Text style={{ fontSize: 12 }}>Project Name</Text>
          </Divider>

          <Form.Item style={{ marginBottom: 16 }}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="project-name"
                addonAfter="-unfoldbox"
                style={{ flex: 1 }}
              />
              <Button onClick={() => setProjectName(randomName())} title="Random name">🎲</Button>
            </Space.Compact>
            <Text style={{ fontSize: 10, color: '#aaa', marginTop: 3, display: 'block' }}>
              Files will be saved as <em>{filename}.pdf</em>, <em>{filename}.svg</em>, etc.
            </Text>
          </Form.Item>

          <Divider style={{ margin: '0 0 12px' }}>
            <Text style={{ fontSize: 12 }}>Document Options</Text>
          </Divider>

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

          <Divider style={{ margin: '12px 0' }}>
            <Text style={{ fontSize: 12 }}>Export Formats</Text>
          </Divider>

          <Space direction="vertical" style={{ width: '100%' }} size={6}>
            <Button block icon={<FilePdfOutlined />} onClick={() => handle('pdf')} type="primary"
              style={{ background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', border: 'none' }}>
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
    </Modal>
  );
}

export type { DocOptions };
