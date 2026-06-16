import { Tooltip, Typography } from 'antd';
import { BoxPlotOutlined, AppstoreOutlined, GoldOutlined, BorderOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface BoxType {
  key: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  available: boolean;
}

const BOX_TYPES: BoxType[] = [
  {
    key: 'reverse-tuck',
    label: 'Reverse Tuck End',
    shortLabel: 'Reverse\nTuck',
    icon: <BoxPlotOutlined style={{ fontSize: 22 }} />,
    available: true,
  },
  {
    key: 'straight-tuck',
    label: 'Straight Tuck End',
    shortLabel: 'Straight\nTuck',
    icon: <AppstoreOutlined style={{ fontSize: 22 }} />,
    available: false,
  },
  {
    key: 'tuck-top',
    label: 'Tuck Top Box',
    shortLabel: 'Tuck\nTop',
    icon: <GoldOutlined style={{ fontSize: 22 }} />,
    available: false,
  },
  {
    key: 'sleeve',
    label: 'Sleeve Box',
    shortLabel: 'Sleeve\nBox',
    icon: <BorderOutlined style={{ fontSize: 22 }} />,
    available: false,
  },
];

interface Props {
  active: string;
  onSelect: (key: string) => void;
}

export default function NavRail({ active, onSelect }: Props) {
  return (
    <div style={{
      width: 72,
      minWidth: 72,
      background: '#1a1033',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 8,
      gap: 4,
      borderRight: '1px solid #2d1f5e',
      overflow: 'hidden',
    }}>
      {/* Section header */}
      <div style={{
        fontSize: 9,
        color: '#7a6aaa',
        textAlign: 'center',
        letterSpacing: 2,
        padding: '4px 0 8px',
        textTransform: 'uppercase',
        userSelect: 'none',
        borderBottom: '1px solid #2d1f5e',
        width: '100%',
        paddingLeft: 0,
        paddingRight: 0,
      }}>
        BOX
      </div>

      {BOX_TYPES.map(bt => {
        const isActive = bt.key === active;
        const item = (
          <div
            key={bt.key}
            onClick={() => bt.available && onSelect(bt.key)}
            style={{
              width: 60,
              paddingTop: 10,
              paddingBottom: 10,
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              cursor: bt.available ? 'pointer' : 'default',
              background: isActive
                ? 'linear-gradient(135deg, #FF6B6B44, #FFC94744)'
                : 'transparent',
              border: isActive ? '1px solid #FF6B6B88' : '1px solid transparent',
              transition: 'all 0.2s',
              opacity: bt.available ? 1 : 0.4,
            }}
          >
            <span style={{ color: isActive ? '#FFC947' : '#8a7fc0' }}>
              {bt.icon}
            </span>
            <Text style={{
              fontSize: 9,
              color: isActive ? '#fff' : '#7a7090',
              textAlign: 'center',
              lineHeight: 1.2,
              whiteSpace: 'pre-line',
              userSelect: 'none',
            }}>
              {bt.shortLabel}
            </Text>
          </div>
        );

        if (!bt.available) {
          return (
            <Tooltip key={bt.key} title={`${bt.label} — Coming soon`} placement="right">
              {item}
            </Tooltip>
          );
        }
        return item;
      })}
    </div>
  );
}
