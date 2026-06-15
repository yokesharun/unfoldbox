import { useRef, useState } from 'react';
import { ConfigProvider, Layout, Tabs, Button, Typography, theme, Tooltip } from 'antd';
import { ExportOutlined, BoxPlotOutlined } from '@ant-design/icons';
import InputPanel from './components/InputPanel/InputPanel';
import DielineCanvas from './components/Dieline/DielineCanvas';
import Box3DViewer from './components/Box3D/Box3DViewer';
import PanelCustomiser from './components/PanelCustomiser/PanelCustomiser';
import ExportDrawer, { DEFAULT_OPTS } from './components/ExportDrawer/ExportDrawer';
import type { DocOptions } from './components/ExportDrawer/ExportDrawer';
import { DEFAULT_DIMS } from './utils/geometry';
import type { BoxDimensions } from './utils/geometry';
import { useBoxGeometry } from './hooks/useBoxGeometry';
import { usePanelThemes } from './hooks/usePanelThemes';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function App() {
  const [dims, setDims] = useState<BoxDimensions>(DEFAULT_DIMS);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [docOpts] = useState<DocOptions>(DEFAULT_OPTS);
  const layout = useBoxGeometry(dims);
  const { themes, setColor, setImage, resetPanel } = usePanelThemes();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        <Header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#0d1b2a', padding: '0 20px', height: 52,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BoxPlotOutlined style={{ color: '#a8d5dc', fontSize: 22 }} />
            <Title level={4} style={{ color: '#fff', margin: 0, lineHeight: 1 }}>UnfoldBox</Title>
          </div>
          <Tooltip title="Export">
            <Button
              type="primary"
              icon={<ExportOutlined />}
              onClick={() => setExportOpen(true)}
              size="small"
            >
              Export
            </Button>
          </Tooltip>
        </Header>

        <Layout style={{ height: 'calc(100vh - 52px)' }}>
          <Sider width={240} style={{ background: '#fafafa', borderRight: '1px solid #e8e8e8', overflow: 'auto' }}>
            <div style={{ padding: '8px 0 4px 12px' }}>
              <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                Dimensions
              </Typography.Text>
            </div>
            <InputPanel dims={dims} onChange={setDims} />
          </Sider>

          <Content style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <Tabs
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              tabBarStyle={{ margin: 0, padding: '0 16px', background: '#fff', borderBottom: '1px solid #e8e8e8' }}
              items={[
                {
                  key: '3d',
                  label: '3D View',
                  children: (
                    <div style={{ height: 'calc(100vh - 105px)', padding: 16 }}>
                      <Box3DViewer dims={dims} themes={themes} />
                    </div>
                  ),
                },
                {
                  key: 'dieline',
                  label: 'Flat Dieline',
                  children: (
                    <div
                      ref={containerRef}
                      style={{
                        height: 'calc(100vh - 105px)',
                        overflow: 'auto',
                        padding: 16,
                        background: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                      }}
                    >
                      <DielineCanvas
                        ref={svgRef}
                        layout={layout}
                        themes={themes}
                        selectedPanel={selectedPanel}
                        onSelectPanel={setSelectedPanel}
                        docOpts={docOpts}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </Content>

          <Sider width={240} style={{ background: '#fafafa', borderLeft: '1px solid #e8e8e8', overflow: 'auto' }}>
            <div style={{ padding: '8px 0 4px 12px' }}>
              <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                Customise
              </Typography.Text>
            </div>
            <PanelCustomiser
              layout={layout}
              themes={themes}
              selectedPanel={selectedPanel}
              onSelectPanel={setSelectedPanel}
              setColor={setColor}
              setImage={setImage}
              resetPanel={resetPanel}
            />
          </Sider>
        </Layout>
      </Layout>

      <ExportDrawer
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        svgRef={svgRef}
        containerRef={containerRef}
      />
    </ConfigProvider>
  );
}
