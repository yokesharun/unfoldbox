import { useRef, useState, useEffect } from 'react';
import {
  ConfigProvider, Layout, Tabs, Button, Typography, theme, Tooltip, Space, Drawer,
} from 'antd';
import {
  ExportOutlined, BoxPlotOutlined, TagsOutlined, ColumnWidthOutlined, CalculatorOutlined,
  ControlOutlined, BgColorsOutlined, AppstoreOutlined, GoldOutlined, BorderOutlined,
} from '@ant-design/icons';
import InputPanel from './components/InputPanel/InputPanel';
import DielineCanvas from './components/Dieline/DielineCanvas';
import Box3DViewer from './components/Box3D/Box3DViewer';
import PanelCustomiser from './components/PanelCustomiser/PanelCustomiser';
import ExportDrawer, { DEFAULT_OPTS } from './components/ExportDrawer/ExportDrawer';
import NavRail from './components/NavRail/NavRail';
import BoxCalculator from './components/BoxCalculator/BoxCalculator';
import type { DocOptions } from './components/ExportDrawer/ExportDrawer';
import { DEFAULT_DIMS } from './utils/geometry';
import type { BoxDimensions } from './utils/geometry';
import { useBoxGeometry } from './hooks/useBoxGeometry';
import { usePanelThemes } from './hooks/usePanelThemes';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

const BOX_TYPES = [
  { key: 'reverse-tuck', label: 'Reverse Tuck', icon: <BoxPlotOutlined />, available: true },
  { key: 'straight-tuck', label: 'Straight Tuck', icon: <AppstoreOutlined />, available: false },
  { key: 'tuck-top', label: 'Tuck Top', icon: <GoldOutlined />, available: false },
  { key: 'sleeve', label: 'Sleeve', icon: <BorderOutlined />, available: false },
];

const HEADER_H = 52;
const BOTTOM_BAR_H = 56;

export default function App() {
  const [dims, setDims] = useState<BoxDimensions>(DEFAULT_DIMS);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showBleed, setShowBleed] = useState(false);
  const [docOpts] = useState<DocOptions>(DEFAULT_OPTS);
  const [activeBoxType, setActiveBoxType] = useState('reverse-tuck');
  const [dimsDrawerOpen, setDimsDrawerOpen] = useState(false);
  const [customiseDrawerOpen, setCustomiseDrawerOpen] = useState(false);

  const layout = useBoxGeometry(dims);
  const { themes, setColor, setImage, resetPanel } = usePanelThemes();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const contentH = isMobile
    ? `calc(100vh - ${HEADER_H}px - ${BOTTOM_BAR_H}px)`
    : `calc(100vh - ${HEADER_H}px)`;

  const tabContentH = isMobile
    ? `calc(100vh - ${HEADER_H}px - ${BOTTOM_BAR_H}px - 80px)`
    : 'calc(100vh - 105px)';

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#FF6B6B',
          colorSuccess: '#06D6A0',
          borderRadius: 8,
        },
      }}
    >
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Header */}
        <Header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 30%, #FFC947 65%, #06D6A0 100%)',
          padding: '0 16px',
          height: HEADER_H,
          boxShadow: '0 2px 12px rgba(255,107,107,0.35)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BoxPlotOutlined style={{ color: '#fff', fontSize: 22 }} />
            <Title level={4} style={{ color: '#fff', margin: 0, lineHeight: 1, textShadow: '0 1px 3px rgba(0,0,0,0.2)', letterSpacing: 0.5, fontSize: isMobile ? 16 : 18 }}>
              UnfoldBox
            </Title>
          </div>
          {!isMobile && (
            <Tooltip title="Export your box design">
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={() => setExportOpen(true)}
                size="small"
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  border: '1.5px solid rgba(255,255,255,0.7)',
                  color: '#fff',
                  fontWeight: 600,
                  backdropFilter: 'blur(4px)',
                }}
              >
                Export
              </Button>
            </Tooltip>
          )}
        </Header>

        {/* Mobile: box type horizontal strip */}
        {isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: '#1a1033',
            overflowX: 'auto',
            flexShrink: 0,
            WebkitOverflowScrolling: 'touch',
          }}>
            {BOX_TYPES.map(bt => {
              const isActive = bt.key === activeBoxType;
              return (
                <button
                  key={bt.key}
                  onClick={() => bt.available && setActiveBoxType(bt.key)}
                  disabled={!bt.available}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 10px',
                    borderRadius: 20,
                    border: isActive ? '1px solid #FF6B6B88' : '1px solid #2d1f5e',
                    background: isActive ? 'linear-gradient(135deg,#FF6B6B44,#FFC94744)' : 'transparent',
                    color: isActive ? '#FFC947' : '#8a7fc0',
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 400,
                    cursor: bt.available ? 'pointer' : 'default',
                    opacity: bt.available ? 1 : 0.4,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {bt.icon}
                  <span style={{ color: isActive ? '#fff' : '#8a7fc0' }}>{bt.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <Layout style={{ height: contentH, overflow: 'hidden' }}>
          {/* Desktop Nav Rail */}
          {!isMobile && (
            <NavRail active={activeBoxType} onSelect={setActiveBoxType} />
          )}

          {/* Desktop Left Sider — Dimensions */}
          {!isMobile && (
            <Sider
              width={220}
              style={{
                background: '#fff',
                borderRight: '1px solid #f0f0f0',
                overflow: 'auto',
                boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{
                padding: '8px 12px 4px',
                background: 'linear-gradient(90deg,#fff5f5,#fff)',
                borderBottom: '1px solid #fde8e8',
              }}>
                <Typography.Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FF6B6B', fontWeight: 700 }}>
                  📦 Dimensions
                </Typography.Text>
              </div>
              <InputPanel dims={dims} onChange={setDims} />
            </Sider>
          )}

          {/* Centre — Preview */}
          <Content style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <Tabs
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              tabBarStyle={{
                margin: 0,
                padding: '0 12px',
                background: '#fff',
                borderBottom: '2px solid #fff1f0',
                flexShrink: 0,
              }}
              items={[
                {
                  key: 'dieline',
                  label: <span style={{ fontWeight: 600, fontSize: isMobile ? 12 : 14 }}>📐 Flat Dieline</span>,
                  children: (
                    <div style={{ display: 'flex', flexDirection: 'column', height: tabContentH }}>
                      {/* Toolbar */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '5px 10px',
                        background: '#fff',
                        borderBottom: '1px solid #f0f0f0',
                        flexShrink: 0,
                        overflowX: 'auto',
                      }}>
                        <Space size={4} wrap={false}>
                          <Button
                            size="small"
                            icon={<TagsOutlined />}
                            type={showLabels ? 'primary' : 'default'}
                            onClick={() => setShowLabels(v => !v)}
                            style={showLabels ? { background: '#FF6B6B', border: 'none' } : {}}
                          >
                            {!isMobile && 'Labels'}
                          </Button>
                          <Button
                            size="small"
                            icon={<ColumnWidthOutlined />}
                            type={showBleed ? 'primary' : 'default'}
                            onClick={() => setShowBleed(v => !v)}
                            style={showBleed ? { background: '#06D6A0', border: 'none' } : {}}
                          >
                            {!isMobile && 'Bleed'}
                          </Button>
                          <Button
                            size="small"
                            icon={<CalculatorOutlined />}
                            onClick={() => setCalcOpen(true)}
                          >
                            {!isMobile && 'Size Calculator'}
                          </Button>
                        </Space>
                      </div>

                      {/* Dieline SVG */}
                      <div
                        ref={containerRef}
                        style={{
                          flex: 1,
                          overflow: 'auto',
                          padding: isMobile ? 10 : 20,
                          background: 'linear-gradient(135deg, #f8f9ff 0%, #fff5f5 100%)',
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
                          showLabels={showLabels}
                          showBleed={showBleed}
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  key: '3d',
                  label: <span style={{ fontWeight: 600, fontSize: isMobile ? 12 : 14 }}>🧊 3D View</span>,
                  children: (
                    <div style={{ height: tabContentH, padding: isMobile ? 8 : 16, background: '#fafafa' }}>
                      <Box3DViewer dims={dims} themes={themes} />
                    </div>
                  ),
                },
              ]}
            />
          </Content>

          {/* Desktop Right Sider — Panel Customiser */}
          {!isMobile && (
            <Sider
              width={260}
              style={{
                background: '#fff',
                borderLeft: '1px solid #f0f0f0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-2px 0 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{
                padding: '8px 12px 4px',
                background: 'linear-gradient(90deg,#fff,#f5fff9)',
                borderBottom: '1px solid #e6f9f2',
                flexShrink: 0,
              }}>
                <Typography.Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.2, color: '#06D6A0', fontWeight: 700 }}>
                  🎨 Customise Panels
                </Typography.Text>
              </div>
              <div style={{ flex: 1, overflow: 'auto' }}>
                <PanelCustomiser
                  layout={layout}
                  themes={themes}
                  selectedPanel={selectedPanel}
                  onSelectPanel={setSelectedPanel}
                  setColor={setColor}
                  setImage={setImage}
                  resetPanel={resetPanel}
                  dims={dims}
                />
              </div>
            </Sider>
          )}
        </Layout>

        {/* Mobile Bottom Bar */}
        {isMobile && (
          <div style={{
            height: BOTTOM_BAR_H,
            display: 'flex',
            alignItems: 'stretch',
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
            boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
            flexShrink: 0,
          }}>
            {[
              { icon: <ControlOutlined style={{ fontSize: 20 }} />, label: 'Dimensions', color: '#FF6B6B', action: () => setDimsDrawerOpen(true) },
              { icon: <BgColorsOutlined style={{ fontSize: 20 }} />, label: 'Customise', color: '#06D6A0', action: () => setCustomiseDrawerOpen(true) },
              { icon: <ExportOutlined style={{ fontSize: 20 }} />, label: 'Export', color: '#1677ff', action: () => setExportOpen(true) },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: item.color,
                  padding: '6px 0',
                }}
              >
                {item.icon}
                <Text style={{ fontSize: 10, color: item.color, fontWeight: 600 }}>{item.label}</Text>
              </button>
            ))}
          </div>
        )}
      </Layout>

      {/* Mobile Drawers */}
      <Drawer
        title={<span style={{ color: '#FF6B6B', fontWeight: 700 }}>📦 Dimensions</span>}
        placement="bottom"
        height="80vh"
        open={isMobile && dimsDrawerOpen}
        onClose={() => setDimsDrawerOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        <InputPanel dims={dims} onChange={setDims} />
      </Drawer>

      <Drawer
        title={<span style={{ color: '#06D6A0', fontWeight: 700 }}>🎨 Customise Panels</span>}
        placement="bottom"
        height="80vh"
        open={isMobile && customiseDrawerOpen}
        onClose={() => setCustomiseDrawerOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        <PanelCustomiser
          layout={layout}
          themes={themes}
          selectedPanel={selectedPanel}
          onSelectPanel={setSelectedPanel}
          setColor={setColor}
          setImage={setImage}
          resetPanel={resetPanel}
          dims={dims}
        />
      </Drawer>

      <ExportDrawer
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        svgRef={svgRef}
        containerRef={containerRef}
      />

      <BoxCalculator
        open={calcOpen}
        onClose={() => setCalcOpen(false)}
        onApply={partial => setDims(prev => ({ ...prev, ...partial, unit: 'mm' }))}
        materialThickness={dims.materialThickness}
      />
    </ConfigProvider>
  );
}
