import { Tooltip, Typography } from 'antd';

const { Text } = Typography;

const svgBase = {
  width: 26,
  height: 26,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
};

// Reverse-tuck dieline: panel row with a rounded tuck lid (top) + bottom flap (diagonal)
const ReverseTuckIcon = (
  <svg {...svgBase}>
    <rect x="2.5" y="8.5" width="19" height="7" rx="0.4" />
    <path d="M7 8.5v7M11.5 8.5v7M16 8.5v7" />
    <path d="M2.5 8.5V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2.5" />
    <path d="M16 15.5V18a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2.5" />
  </svg>
);

// Wrap-card envelope: top flap, body w/ middle fold, side wings, rounded bottom flap
const WrapCardIcon = (
  <svg {...svgBase}>
    <path d="M10 3.5h4l-0.6 2.5h-2.8z" />
    <rect x="7.5" y="6" width="9" height="11" />
    <path d="M7.5 11.5h9" />
    <path d="M7.5 12.2l-3 0.7v2.6l3 0.7" />
    <path d="M16.5 12.2l3 0.7v2.6l-3 0.7" />
    <path d="M7.5 17v1.3a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V17" />
  </svg>
);

// Straight-tuck: two tuck lids on the same (top) edge
const StraightTuckIcon = (
  <svg {...svgBase}>
    <rect x="2.5" y="9.5" width="19" height="7" rx="0.4" />
    <path d="M7 9.5v7M11.5 9.5v7M16 9.5v7" />
    <path d="M2.5 9.5V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2.5" />
    <path d="M11.5 9.5V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2.5" />
  </svg>
);

// Tuck-top: single panel with a hinged lid flap
const TuckTopIcon = (
  <svg {...svgBase}>
    <rect x="5" y="9" width="14" height="10" rx="0.6" />
    <path d="M5 9V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
    <path d="M5 13.5h14" />
  </svg>
);

// Sleeve: open band / tube
const SleeveIcon = (
  <svg {...svgBase}>
    <rect x="3" y="8" width="18" height="8" rx="1" />
    <path d="M8 8v8M16 8v8" />
  </svg>
);

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
    label: 'Box',
    shortLabel: 'Box',
    icon: ReverseTuckIcon,
    available: true,
  },
  {
    key: 'wrap-card',
    label: 'Wrap Card',
    shortLabel: 'Wrap\nCard',
    icon: WrapCardIcon,
    available: true,
  },
  {
    key: 'straight-tuck',
    label: 'Straight Tuck End',
    shortLabel: 'Straight\nTuck',
    icon: StraightTuckIcon,
    available: false,
  },
  {
    key: 'tuck-top',
    label: 'Tuck Top Box',
    shortLabel: 'Tuck\nTop',
    icon: TuckTopIcon,
    available: false,
  },
  {
    key: 'sleeve',
    label: 'Sleeve Box',
    shortLabel: 'Sleeve\nBox',
    icon: SleeveIcon,
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
