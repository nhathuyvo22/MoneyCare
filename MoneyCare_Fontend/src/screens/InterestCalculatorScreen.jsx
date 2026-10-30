import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import AnimatedNumber from '../components/AnimatedNumber';
import {
  PiggyBank, Calculator, PieChart, Landmark, DollarSign,
  ChevronDown, ChevronUp, Sparkles, ArrowRight, CheckCircle2,
  Info, ShieldCheck, TrendingUp
} from 'lucide-react';

// Danh sách các tiện ích tài chính trên top bar tham khảo MoMo
const TOOLS_NAV = [
  { id: 'saving', label: 'Lãi tiết kiệm', Icon: PiggyBank, badge: '8%' },
  { id: 'salary', label: 'Tính lương', Icon: Calculator },
  { id: 'allocation', label: 'Phân bổ lương', Icon: PieChart },
  { id: 'loan', label: 'Lãi ngân hàng', Icon: Landmark },
  { id: 'exchange', label: 'Tỷ giá', Icon: DollarSign },
];

// Danh sách kỳ hạn và lãi suất niêm yết
const TENURES = [
  { months: 12, rate: 8.0 },
  { months: 9, rate: 7.9 },
  { months: 6, rate: 7.9 },
  { months: 3, rate: 4.75 },
  { months: 1, rate: 4.75 },
  { months: 24, rate: 7.2 },
];

const QUICK_AMOUNTS = [1000000, 5000000, 10000000, 50000000, 100000000];

export default function InterestCalculatorScreen() {
  const { addSavingsGoal, setScreen, toast, fmt } = useApp();

  const [activeTool, setActiveTool] = useState('saving');
  const [depositType, setDepositType] = useState('one_time'); // 'one_time' | 'monthly'
  const [depositAmount, setDepositAmount] = useState(100000); // 100.000 đ như trong ảnh
  const [selectedTenure, setSelectedTenure] = useState(TENURES[1]); // 9 tháng mặc định
  const [showComparison, setShowComparison] = useState(false);

  // Tính toán lãi suất
  const calculation = useMemo(() => {
    const P = Number(depositAmount) || 0;
    const r = selectedTenure.rate / 100;
    const t = selectedTenure.months;

    let totalInterest = 0;
    let totalReceive = 0;
    let totalDeposit = P;

    if (depositType === 'one_time') {
      // Gửi 1 lần: Lãi = P * (r / 12) * t
      totalInterest = P * (r / 12) * t;
      totalReceive = P + totalInterest;
    } else {
      // Gửi đều hàng tháng (lãi kép tích lũy từng tháng)
      // Mỗi tháng gửi P
      totalDeposit = P * t;
      let balance = 0;
      for (let i = 0; i < t; i++) {
        balance += P;
        const monthInterest = balance * (r / 12);
        balance += monthInterest;
        totalInterest += monthInterest;
      }
      totalReceive = balance;
    }

    return {
      principal: totalDeposit,
      interest: Math.round(totalInterest),
      total: Math.round(totalReceive),
      rate: selectedTenure.rate,
      months: selectedTenure.months,
    };
  }, [depositAmount, selectedTenure, depositType]);

  // Bảng so sánh giữa các kỳ hạn
  const comparisonData = useMemo(() => {
    const P = Number(depositAmount) || 0;
    return TENURES.map(item => {
      const r = item.rate / 100;
      const t = item.months;
      let interest = 0;
      let total = 0;

      if (depositType === 'one_time') {
        interest = Math.round(P * (r / 12) * t);
        total = P + interest;
      } else {
        let b = 0;
        let totInt = 0;
        for (let i = 0; i < t; i++) {
          b += P;
          const mi = b * (r / 12);
          b += mi;
          totInt += mi;
        }
        interest = Math.round(totInt);
        total = Math.round(b);
      }

      return {
        ...item,
        interest,
        total,
      };
    });
  }, [depositAmount, depositType]);

  // Tạo mục tiêu tiết kiệm từ kết quả tính
  const handleOpenGoal = async () => {
    const goalTitle = `Tiết kiệm ${calculation.months} tháng (${calculation.rate}%)`;
    await addSavingsGoal({
      name: goalTitle,
      goalName: goalTitle,
      targetAmount: calculation.total,
      currentAmount: depositAmount,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: new Date(Date.now() + calculation.months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      icon: 'PiggyBank',
      color: '#E83E8C',
    });
    setTimeout(() => setScreen('goals'), 600);
  };

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setDepositAmount(raw ? parseInt(raw, 10) : 0);
  };

  const addQuick = (val) => {
    setDepositAmount(prev => (prev || 0) + val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 1. TOP NAV TIỆN ÍCH TÀI CHÍNH (THAM KHẢO MOMO) */}
      <div className="card" style={{ padding: '8px 12px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
          {TOOLS_NAV.map(({ id, label, Icon, badge }) => {
            const active = activeTool === id;
            return (
              <button
                key={id}
                type="button"
                className="tool-tab-btn"
                onClick={() => setActiveTool(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${active ? '#E83E8C' : 'var(--border)'}`,
                  background: active ? 'rgba(232, 62, 140, 0.08)' : 'var(--surface)',
                  color: active ? '#E83E8C' : 'var(--text-primary)',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? 'rgba(232, 62, 140, 0.15)' : 'var(--elevated)',
                  color: active ? '#E83E8C' : 'var(--text-muted)'
                }}>
                  <Icon size={16} />
                </div>
                <span>{label}</span>
                {badge && (
                  <span style={{
                    position: 'absolute',
                    top: -6,
                    right: 6,
                    background: '#FF3366',
                    color: '#FFF',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 6px rgba(255,51,102,0.4)',
                  }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN TOOL CONTENT: LÃI TIẾT KIỆM */}
      {activeTool === 'saving' && (
        <div className="card animate-fade-in" style={{ padding: '24px 28px' }}>
          {/* Header Title */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#E83E8C',
              letterSpacing: '-0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>Ước tính tiền gửi tiết kiệm</span>
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Tính toán lợi nhuận và lập kế hoạch sinh lời từ tiền nhàn rỗi
            </p>
          </div>

          {/* 2 COLUMNS GRID */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 28,
            alignItems: 'start'
          }}>
            {/* CỘT TRÁI: FORM NHẬP THAM SỐ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Hình thức gửi */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: 8, display: 'block' }}>
                  Hình thức gửi
                </label>
                <div style={{
                  display: 'flex',
                  background: 'var(--elevated)',
                  borderRadius: 'var(--radius-md)',
                  padding: 4,
                  border: '1px solid var(--border)'
                }}>
                  <button
                    type="button"
                    className="flex-1"
                    onClick={() => setDepositType('one_time')}
                    style={{
                      padding: '9px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: depositType === 'one_time' ? 'var(--surface)' : 'transparent',
                      color: depositType === 'one_time' ? '#E83E8C' : 'var(--text-muted)',
                      fontWeight: depositType === 'one_time' ? 700 : 500,
                      boxShadow: depositType === 'one_time' ? 'var(--shadow-sm)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 180ms ease'
                    }}
                  >
                    Gửi 1 lần
                  </button>
                  <button
                    type="button"
                    className="flex-1"
                    onClick={() => setDepositType('monthly')}
                    style={{
                      padding: '9px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: depositType === 'monthly' ? 'var(--surface)' : 'transparent',
                      color: depositType === 'monthly' ? '#E83E8C' : 'var(--text-muted)',
                      fontWeight: depositType === 'monthly' ? 700 : 500,
                      boxShadow: depositType === 'monthly' ? 'var(--shadow-sm)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 180ms ease'
                    }}
                  >
                    Gửi đều hàng tháng
                  </button>
                </div>
              </div>

              {/* Nhập số tiền gửi */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: 8, display: 'block' }}>
                  {depositType === 'one_time' ? 'Nhập số tiền bạn muốn gửi' : 'Số tiền gửi mỗi tháng'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={depositAmount ? depositAmount.toLocaleString('vi-VN') : ''}
                    onChange={handleAmountChange}
                    className="form-control"
                    placeholder="0"
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      paddingRight: 60,
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border)',
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem'
                  }}>
                    VNĐ
                  </span>
                </div>

                {/* Quick Chips */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {QUICK_AMOUNTS.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      className="chip"
                      onClick={() => addQuick(amt)}
                      style={{ fontSize: '0.76rem' }}
                    >
                      +{amt >= 1000000 ? `${amt / 1000000}tr` : `${amt / 1000}k`}
                    </button>
                  ))}
                  {depositAmount > 0 && (
                    <button
                      type="button"
                      className="chip"
                      onClick={() => setDepositAmount(0)}
                      style={{ color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.76rem' }}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>

              {/* Kỳ hạn gửi và Lãi suất */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                    Kỳ hạn gửi và Lãi suất
                  </label>
                  <Info size={14} style={{ color: 'var(--text-muted)' }} />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10
                }}>
                  {TENURES.map(t => {
                    const active = selectedTenure.months === t.months;
                    return (
                      <button
                        key={t.months}
                        type="button"
                        onClick={() => setSelectedTenure(t)}
                        style={{
                          padding: '12px 8px',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${active ? '#E83E8C' : 'var(--border)'}`,
                          background: active ? 'rgba(232, 62, 140, 0.05)' : 'var(--bg)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                          transform: active ? 'scale(1.02)' : 'none',
                        }}
                      >
                        <div style={{
                          fontWeight: active ? 800 : 600,
                          fontSize: '0.86rem',
                          color: active ? '#E83E8C' : 'var(--text-primary)'
                        }}>
                          {t.months} tháng
                        </div>
                        <div style={{
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          color: active ? '#E83E8C' : 'var(--text-muted)'
                        }}>
                          {t.rate}%
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nút xem bảng so sánh */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowComparison(p => !p)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#E83E8C',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: 0
                  }}
                >
                  <span>Xem bảng so sánh lãi suất giữa các kỳ hạn</span>
                  {showComparison ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

            </div>

            {/* CỘT PHẢI: KẾT QUẢ DỰ TÍNH (THAM KHẢO MOMO CARD HỒNG) */}
            <div style={{
              background: 'linear-gradient(145deg, #FFF0F6 0%, #FCE4EC 50%, #F8BBD0 100%)',
              border: '1.5px solid rgba(232, 62, 140, 0.25)',
              borderRadius: 'var(--radius-xl)',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(232, 62, 140, 0.12)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Watermark icon */}
              <div style={{
                position: 'absolute',
                right: -20,
                bottom: -20,
                opacity: 0.08,
                color: '#E83E8C',
                pointerEvents: 'none'
              }}>
                <PiggyBank size={180} />
              </div>

              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Tổng nhận sau {calculation.months} tháng
              </div>

              {/* SỐ TIỀN COUNT-UP ANIMATION LỚN */}
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: '#E83E8C',
                letterSpacing: '-1px',
                marginBottom: 12
              }}>
                <AnimatedNumber value={calculation.total} duration={1000} suffix="đ" />
              </div>

              {/* Chi tiết tiền lãi & lãi suất */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  Tiền lãi:{' '}
                  <strong style={{ color: '#E83E8C' }}>
                    +<AnimatedNumber value={calculation.interest} duration={1000} suffix="đ" />
                  </strong>
                </div>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)' }} />
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  Lãi suất: <strong style={{ color: 'var(--text-primary)' }}>{calculation.rate}%/năm</strong>
                </div>
              </div>

              {/* Khối AI Advice */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                border: '1px solid rgba(232, 62, 140, 0.2)',
                textAlign: 'left',
                display: 'flex',
                gap: 10,
                marginBottom: 22,
                width: '100%'
              }}>
                <Sparkles size={18} style={{ color: '#E83E8C', flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#E83E8C' }}>Trợ lý MoneyCare AI:</strong> Gửi tiết kiệm kỳ hạn <strong>{calculation.months} tháng</strong> giúp sinh lời ổn định{' '}
                  <strong style={{ color: 'var(--success)' }}>+{calculation.interest.toLocaleString('vi-VN')}đ</strong> tiền lãi an toàn với lãi suất {calculation.rate}%/năm.
                </div>
              </div>

              {/* Nút hành động Gửi tiết kiệm Online */}
              <button
                type="button"
                className="btn btn-full"
                onClick={handleOpenGoal}
                style={{
                  background: 'linear-gradient(135deg, #E83E8C 0%, #D81B60 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '13px 20px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  boxShadow: '0 6px 20px rgba(232, 62, 140, 0.35)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 200ms ease',
                }}
              >
                <span>Gửi tiết kiệm Online</span>
                <ArrowRight size={16} />
              </button>

              <div style={{
                fontSize: '0.72rem',
                fontStyle: 'italic',
                color: 'var(--text-muted)',
                marginTop: 14
              }}>
                Tham khảo lãi suất được niêm yết ngày hôm nay.
              </div>
            </div>
          </div>

          {/* 3. BẢNG SO SÁNH LÃI SUẤT KỲ HẠN (EXPANDABLE) */}
          {showComparison && (
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }} className="animate-fade-in">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 12 }}>
                Bảng so sánh lợi nhuận giữa các kỳ hạn
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--elevated)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '10px 14px' }}>Kỳ hạn</th>
                      <th style={{ padding: '10px 14px' }}>Lãi suất</th>
                      <th style={{ padding: '10px 14px' }}>Tiền gửi</th>
                      <th style={{ padding: '10px 14px' }}>Tiền lãi nhận được</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Tổng nhận sau kỳ hạn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row) => {
                      const isCur = row.months === selectedTenure.months;
                      return (
                        <tr
                          key={row.months}
                          onClick={() => setSelectedTenure(row)}
                          style={{
                            borderBottom: '1px solid var(--border)',
                            background: isCur ? 'rgba(232, 62, 140, 0.05)' : 'transparent',
                            fontWeight: isCur ? 700 : 500,
                            cursor: 'pointer'
                          }}
                        >
                          <td style={{ padding: '10px 14px', color: isCur ? '#E83E8C' : 'var(--text-primary)' }}>
                            {row.months} tháng {isCur && '✓'}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#E83E8C', fontWeight: 700 }}>
                            {row.rate}%/năm
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            {fmt(depositType === 'one_time' ? depositAmount : depositAmount * row.months)}
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--success)' }}>
                            +{fmt(row.interest)}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800 }}>
                            {fmt(row.total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TIỆN ÍCH PHÂN BỔ LƯƠNG (50/30/20) */}
      {activeTool === 'allocation' && (
        <div className="card animate-fade-in" style={{ padding: '24px 28px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>
            Phân bổ ngân sách theo Quy tắc 50/30/20
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            Phương pháp quản lý tài chính chuẩn quốc tế: 50% Nhu cầu thiết yếu, 30% Chi tiêu linh hoạt, 20% Tiết kiệm & Tích lũy.
          </p>

          <div style={{ maxWidth: 440, marginBottom: 24 }}>
            <label className="form-label">Thu nhập hàng tháng của bạn</label>
            <input
              type="text"
              value={depositAmount ? depositAmount.toLocaleString('vi-VN') : ''}
              onChange={handleAmountChange}
              className="form-control"
              style={{ fontSize: '1.2rem', fontWeight: 800 }}
              placeholder="VD: 15.000.000"
            />
          </div>

          <div className="grid-3" style={{ gap: 16 }}>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', padding: 18, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6339DB', textTransform: 'uppercase' }}>50% Thiết yếu</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, margin: '8px 0' }}>
                <AnimatedNumber value={Math.round(depositAmount * 0.5)} duration={900} />
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Tiền nhà, ăn uống cơ bản, điện nước, xăng xe, bảo hiểm.</div>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', padding: 18, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#E89B3B', textTransform: 'uppercase' }}>30% Sở thích & Linh hoạt</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, margin: '8px 0' }}>
                <AnimatedNumber value={Math.round(depositAmount * 0.3)} duration={900} />
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Mua sắm, cà phê, du lịch, xem phim, giải trí.</div>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', padding: 18, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16A085', textTransform: 'uppercase' }}>20% Tiết kiệm & Đầu tư</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, margin: '8px 0' }}>
                <AnimatedNumber value={Math.round(depositAmount * 0.2)} duration={900} />
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Quỹ khẩn cấp, gửi tiết kiệm sinh lời, đầu tư tài chính.</div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TIỆN ÍCH TỶ GIÁ NGOẠI TỆ */}
      {activeTool === 'exchange' && (
        <div className="card animate-fade-in" style={{ padding: '24px 28px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 16 }}>
            Bảng tỷ giá ngoại tệ tham khảo
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--elevated)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 14px' }}>Mã ngoại tệ</th>
                  <th style={{ padding: '10px 14px' }}>Tên tiền tệ</th>
                  <th style={{ padding: '10px 14px' }}>Mua tiền mặt</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Bán ra (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { code: 'USD', name: 'Đô la Mỹ', buy: '25.120', sell: '25.480' },
                  { code: 'EUR', name: 'Euro', buy: '27.150', sell: '27.600' },
                  { code: 'JPY', name: 'Yên Nhật', buy: '163.5', sell: '168.2' },
                  { code: 'GBP', name: 'Bảng Anh', buy: '32.400', sell: '33.100' },
                  { code: 'SGD', name: 'Đô la Singapore', buy: '18.950', sell: '19.400' },
                ].map(c => (
                  <tr key={c.code} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--primary)' }}>{c.code}</td>
                    <td style={{ padding: '12px 14px' }}>{c.name}</td>
                    <td style={{ padding: '12px 14px' }}>{c.buy} đ</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>{c.sell} đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TIỆN ÍCH TÍNH LƯƠNG & LÃI NGÂN HÀNG (QUICK PLACEHOLDER TIỆN ÍCH) */}
      {(activeTool === 'salary' || activeTool === 'loan') && (
        <div className="card animate-fade-in" style={{ padding: '24px 28px', textAlign: 'center' }}>
          <Calculator size={42} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
          <h3 style={{ margin: 0, fontWeight: 800 }}>Tiện ích {activeTool === 'salary' ? 'Tính Lương Gross - Net' : 'Lãi Vay Ngân Hàng'}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 460, margin: '8px auto 16px' }}>
            Hệ thống hỗ trợ tính toán mức lương thực nhận sau thuế và lịch trả nợ vay theo dư nợ giảm dần.
          </p>
          <button className="btn btn-outline btn-sm" onClick={() => setActiveTool('saving')}>
            Quay lại Lãi tiết kiệm
          </button>
        </div>
      )}
    </div>
  );
}
