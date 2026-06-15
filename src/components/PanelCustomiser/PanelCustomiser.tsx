import { useState } from 'react';
import { ColorPicker, Upload, Button, List, Typography, Tooltip, Space, Divider } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import type { PanelTheme } from '../../hooks/usePanelThemes';
import type { DieleineLayout } from '../../utils/geometry';

const { Text } = Typography;

interface Props {
  layout: DieleineLayout;
  themes: Record<string, PanelTheme>;
  selectedPanel: string | null;
  onSelectPanel: (id: string) => void;
  setColor: (id: string, c: string) => void;
  setImage: (id: string, url: string | undefined) => void;
  resetPanel: (id: string) => void;
}

export default function PanelCustomiser({
  layout, themes, selectedPanel, onSelectPanel, setColor, setImage, resetPanel,
}: Props) {
  const [fileList, setFileList] = useState<Record<string, UploadFile[]>>({});

  const active = selectedPanel ?? layout.panels[0]?.id;

  function handleImageUpload(panelId: string, file: File) {
    const url = URL.createObjectURL(file);
    setImage(panelId, url);
    return false; // prevent auto-upload
  }

  return (
    <div style={{ padding: '12px', overflowY: 'auto', height: '100%' }}>
      <Typography.Title level={5} style={{ marginTop: 0, fontSize: 13 }}>Panels</Typography.Title>

      <List
        size="small"
        dataSource={layout.panels}
        renderItem={panel => {
          const theme = themes[panel.id] ?? { color: '#a8d5dc' };
          const isSelected = panel.id === active;
          return (
            <List.Item
              key={panel.id}
              onClick={() => onSelectPanel(panel.id)}
              style={{
                cursor: 'pointer',
                background: isSelected ? '#e6f4ff' : 'transparent',
                borderRadius: 6,
                padding: '4px 8px',
                marginBottom: 2,
                border: isSelected ? '1px solid #1677ff' : '1px solid transparent',
              }}
            >
              <Space>
                <div style={{
                  width: 16, height: 16, borderRadius: 3,
                  background: theme.imageUrl ? `url(${theme.imageUrl}) center/cover` : theme.color,
                  border: '1px solid #ccc',
                  flexShrink: 0,
                }} />
                <Text style={{ fontSize: 12 }}>{panel.label}</Text>
              </Space>
            </List.Item>
          );
        }}
      />

      {active && (
        <>
          <Divider style={{ margin: '10px 0', fontSize: 11 }}>
            Edit: {layout.panels.find(p => p.id === active)?.label}
          </Divider>

          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            <div>
              <Text style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Colour</Text>
              <ColorPicker
                value={themes[active]?.color ?? '#a8d5dc'}
                onChange={(_, hex) => setColor(active, hex)}
                showText
                size="small"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <Text style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Image</Text>
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={file => handleImageUpload(active, file)}
                fileList={fileList[active] ?? []}
                onChange={({ fileList: fl }) => setFileList(prev => ({ ...prev, [active]: fl }))}
              >
                <Button size="small" icon={<UploadOutlined />} style={{ width: '100%' }}>
                  Upload Image
                </Button>
              </Upload>
              {themes[active]?.imageUrl && (
                <div style={{ marginTop: 6 }}>
                  <img
                    src={themes[active].imageUrl}
                    alt="panel"
                    style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }}
                  />
                </div>
              )}
            </div>

            <Tooltip title="Reset to default colour">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => resetPanel(active)}
                style={{ width: '100%' }}
              >
                Reset Panel
              </Button>
            </Tooltip>
          </Space>
        </>
      )}
    </div>
  );
}
