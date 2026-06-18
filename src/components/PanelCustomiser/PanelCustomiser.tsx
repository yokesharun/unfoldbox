import { useState } from 'react';
import { ColorPicker, Upload, Button, Typography, Tooltip, Collapse, Tag, Space } from 'antd';
import { UploadOutlined, DeleteOutlined, PictureOutlined, BgColorsOutlined } from '@ant-design/icons';
import type { PanelTheme, ImgTransform } from '../../hooks/usePanelThemes';
import { DEFAULT_IMG } from '../../hooks/usePanelThemes';
import type { DieleineLayout, BoxDimensions } from '../../utils/geometry';
import { pxToMm } from '../../utils/geometry';

const { Text } = Typography;

interface Props {
  layout: DieleineLayout;
  themes: Record<string, PanelTheme>;
  selectedPanel: string | null;
  onSelectPanel: (id: string) => void;
  setColor: (id: string, c: string) => void;
  setImage: (id: string, url: string | undefined) => void;
  setImageTransform: (id: string, t: Partial<ImgTransform>) => void;
  resetPanel: (id: string) => void;
  dims: BoxDimensions;
}

function suggestSize(pxW: number, pxH: number, ppi: number) {
  const mmW = pxToMm(pxW);
  const mmH = pxToMm(pxH);
  const imgPxW = Math.round((mmW / 25.4) * ppi);
  const imgPxH = Math.round((mmH / 25.4) * ppi);
  const cmW = (mmW / 10).toFixed(1);
  const cmH = (mmH / 10).toFixed(1);
  const inW = (mmW / 25.4).toFixed(2);
  const inH = (mmH / 25.4).toFixed(2);
  return { imgPxW, imgPxH, cmW, cmH, inW, inH };
}

export default function PanelCustomiser({
  layout, themes, selectedPanel, onSelectPanel,
  setColor, setImage, setImageTransform, resetPanel, dims,
}: Props) {
  const [activeKeys, setActiveKeys] = useState<string[]>(
    selectedPanel ? [selectedPanel] : layout.panels[0] ? [layout.panels[0].id] : []
  );

  function handleSelect(panelId: string) {
    onSelectPanel(panelId);
    setActiveKeys(prev =>
      prev.includes(panelId) ? prev.filter(k => k !== panelId) : [...prev, panelId]
    );
  }

  function handleImageUpload(panelId: string, file: File) {
    // Read as data URL so the image embeds in exports and survives reloads.
    const reader = new FileReader();
    reader.onload = () => setImage(panelId, reader.result as string);
    reader.readAsDataURL(file);
    return false;
  }

  const collapseItems = layout.panels.map(panel => {
    const theme = themes[panel.id] ?? { color: '#a8d5dc' };
    const isSelected = panel.id === selectedPanel;
    const { imgPxW, imgPxH, cmW, cmH, inW, inH } = suggestSize(panel.w, panel.h, dims.ppi);

    const thumbnail = (
      <div style={{ position: 'relative', width: 32, height: 32, borderRadius: 6, overflow: 'hidden', border: '1px solid #e0e0e0', flexShrink: 0 }}>
        {/* Colour half */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', background: theme.color }} />
        {/* Image half or full */}
        {theme.imageUrl
          ? <img src={theme.imageUrl} style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', objectFit: 'cover' }} alt="" />
          : <div style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', background: theme.color }} />
        }
      </div>
    );

    return {
      key: panel.id,
      label: (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '2px 0',
          }}
          onClick={() => handleSelect(panel.id)}
        >
          {thumbnail}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 12, fontWeight: isSelected ? 600 : 400, display: 'block', lineHeight: 1.3 }}>
              {panel.label}
            </Text>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 2 }}>
              {theme.imageUrl && (
                <Tag color="purple" style={{ fontSize: 9, padding: '0 3px', margin: 0 }}>
                  <PictureOutlined /> Image
                </Tag>
              )}
              <Tag color="default" style={{ fontSize: 9, padding: '0 3px', margin: 0 }}>
                <BgColorsOutlined /> {theme.color}
              </Tag>
            </div>
          </div>
        </div>
      ),
      children: (
        <div style={{ padding: '4px 0' }}>
          {/* Colour picker */}
          <div style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>
              Background Colour
            </Text>
            <ColorPicker
              value={theme.color}
              onChange={(_, hex) => setColor(panel.id, hex)}
              showText
              size="small"
              style={{ width: '100%' }}
            />
            <Text style={{ fontSize: 10, color: '#aaa', marginTop: 3, display: 'block' }}>
              Shows behind transparent areas of uploaded image
            </Text>
          </div>

          {/* Image upload */}
          <div style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>
              Panel Image
            </Text>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={file => handleImageUpload(panel.id, file)}
            >
              <Button
                size="small"
                icon={<UploadOutlined />}
                style={{
                  width: '100%',
                  borderStyle: 'dashed',
                  background: '#fafafa',
                }}
              >
                Upload Image (PNG / JPG)
              </Button>
            </Upload>

            {theme.imageUrl && (
              <div style={{ marginTop: 6 }}>
                <img
                  src={theme.imageUrl}
                  alt="panel"
                  style={{
                    width: '100%', height: 90,
                    objectFit: 'contain',
                    borderRadius: 4,
                    border: '1px solid #eee',
                    background: theme.color,
                    display: 'block',
                  }}
                />
                <Text style={{ fontSize: 10, color: '#aaa', display: 'block', marginTop: 4 }}>
                  Drag the image / handles on the canvas to move, resize & rotate.
                </Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    size="small"
                    type="link"
                    onClick={() => setImageTransform(panel.id, { ...DEFAULT_IMG })}
                    style={{ padding: '2px 0', height: 'auto', fontSize: 11 }}
                  >
                    Reset position
                  </Button>
                  <Button
                    size="small"
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setImage(panel.id, undefined)}
                    style={{ padding: '2px 0', height: 'auto', fontSize: 11 }}
                  >
                    Remove image
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Image size suggestion */}
          <div style={{
            background: 'linear-gradient(135deg, #f0f9ff, #e6f4ea)',
            borderRadius: 6,
            padding: '8px 10px',
            marginBottom: 8,
          }}>
            <Text style={{ fontSize: 10, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>
              Suggested Image Size @ {dims.ppi} PPI
            </Text>
            <Space direction="vertical" size={2}>
              <Text style={{ fontSize: 11, color: '#1677ff' }}>
                🖼 {imgPxW} × {imgPxH} px
              </Text>
              <Text style={{ fontSize: 11, color: '#555' }}>
                📐 {cmW} × {cmH} cm
              </Text>
              <Text style={{ fontSize: 11, color: '#555' }}>
                📏 {inW}" × {inH}"
              </Text>
            </Space>
          </div>

          <Tooltip title="Reset colour to default and remove image">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => resetPanel(panel.id)}
              style={{ width: '100%' }}
            >
              Reset Panel
            </Button>
          </Tooltip>
        </div>
      ),
    };
  });

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      <Collapse
        activeKey={activeKeys}
        onChange={keys => setActiveKeys(typeof keys === 'string' ? [keys] : keys)}
        size="small"
        style={{ borderRadius: 0, border: 'none', borderTop: '1px solid #f0f0f0' }}
        items={collapseItems}
      />
    </div>
  );
}
