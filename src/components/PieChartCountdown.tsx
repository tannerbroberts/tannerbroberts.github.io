interface PieChartCountdownProps {
  /** Progress percentage (0-100) */
  readonly progress: number;
  /** Size of the pie chart in pixels */
  readonly size?: number;
  /** Color of the completed portion */
  readonly completedColor?: string;
  /** Color of the remaining portion */
  readonly remainingColor?: string;
  /** Stroke width of the pie chart */
  readonly strokeWidth?: number;
  /** Whether to show percentage text in the center */
  readonly showPercentage?: boolean;
}

export default function PieChartCountdown({
  progress,
  size = 60,
  completedColor = '#4CAF50',
  remainingColor = '#e0e0e0',
  strokeWidth = 4,
  showPercentage = true
}: PieChartCountdownProps) {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  // Calculate the circumference and stroke dash values
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div style={{
      position: 'relative',
      width: size,
      height: size,
      display: 'inline-block'
    }}>
      <svg
        width={size}
        height={size}
        style={{
          transform: 'rotate(-90deg)' // Start from top instead of right
        }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={remainingColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={completedColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
      </svg>

      {/* Percentage text */}
      {showPercentage && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: `${size * 0.2}px`,
          fontWeight: 'bold',
          color: '#333',
          textAlign: 'center',
          lineHeight: '1'
        }}>
          {Math.round(normalizedProgress)}%
        </div>
      )}
    </div>
  );
}
