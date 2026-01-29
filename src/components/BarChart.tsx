import React from 'react';

interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  title?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, color = '#F2C744', title }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
      {title && <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#aaa', textTransform: 'uppercase' }}>{title}</h3>}
      <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '8px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
               <div 
                 style={{ 
                   width: '100%', 
                   height: `${(d.value / maxValue) * 100}%`, 
                   background: color, 
                   borderRadius: '4px 4px 0 0',
                   opacity: 0.8,
                   transition: 'height 0.5s ease',
                   position: 'relative',
                   minHeight: '4px'
                 }}
               >
                 <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#fff' }}>
                    {d.value}
                 </span>
               </div>
            </div>
            <span style={{ marginTop: '5px', fontSize: '10px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
