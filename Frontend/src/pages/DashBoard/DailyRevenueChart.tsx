import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

type DailyRevenueChartProps = {
    data: { DayName: string, Revenue: number }[];
};

// Hàm custom tooltip để hiển thị tiền tệ
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ 
                backgroundColor: '#fff', 
                border: '1px solid #ccc', 
                padding: '10px', 
                borderRadius: '5px' 
            }}>
                <p className="label">{`Day: ${label}`}</p>
                <p className="intro" style={{ color: '#2563EB' }}>
                    {`Revenue: $${payload[0].value.toLocaleString()}`}
                </p>
            </div>
        );
    }
    return null;
};

export default function DailyRevenueChart({ data }: DailyRevenueChartProps) {
    
    // Tìm giá trị max để đặt domain trục Y hợp lý
    const maxRevenue = Math.max(...data.map(d => d.Revenue));
    const upperDomain = maxRevenue > 0 ? maxRevenue * 1.1 : 100000;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                
                {/* Lưới trục Y (Màu xám nhạt) */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                
                {/* Trục X: Hiển thị tên ngày (Mon, Tue, ...) */}
                <XAxis dataKey="DayName" axisLine={false} tickLine={false} />
                
                {/* Trục Y: Hiển thị giá trị (Tick formatter để hiển thị đơn vị triệu) */}
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    domain={[0, upperDomain]}
                    tickCount={6} // <<< THÊM DÒNG NÀY: Ép buộc chia thành 6 mốc
    
    tickFormatter={(value) => {
        // ... (hàm định dạng giữ nguyên)
        if (value === 0) return '0';
        if (value >= 1000000) {
            return `${(value / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}`; 
        }
        return value.toLocaleString('vi-VN', { maximumFractionDigits: 0 }); 
    }}
                />
                
                {/* Tooltip hiển thị chi tiết khi hover */}
                <Tooltip content={<CustomTooltip />} />
                
                {/* Đường biểu diễn Doanh thu */}
                <Line 
                    type="monotone" 
                    dataKey="Revenue" 
                    stroke="#2563EB" 
                    strokeWidth={3} 
                    dot={{ fill: '#2563EB', r: 4 }} 
                    activeDot={{ r: 8 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}