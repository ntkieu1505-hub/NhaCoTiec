import { Guest, Wish, User, AnalyticsSummary } from '../types';

export const MOCK_GUESTS: Guest[] = [
  {
    id: 'gst-01',
    orderId: 'NCT01',
    name: 'Nguyễn Văn Tuấn',
    phone: '0908 123 456',
    rsvpStatus: 'attending',
    companionCount: 1,
    tableNumber: 'Bàn 04 (Bạn đại học)',
    notes: 'Có 1 bé nhỏ 3 tuổi',
    submittedAt: '2026-09-08T09:30:00Z'
  },
  {
    id: 'gst-02',
    orderId: 'NCT01',
    name: 'Trần Thị Thu Hà',
    phone: '0918 654 321',
    rsvpStatus: 'attending',
    companionCount: 0,
    tableNumber: 'Bàn 02 (Đồng nghiệp cô dâu)',
    notes: 'Ăn chay',
    submittedAt: '2026-09-08T10:15:00Z'
  },
  {
    id: 'gst-03',
    orderId: 'NCT01',
    name: 'Lê Hoàng Long',
    phone: '0977 888 999',
    rsvpStatus: 'declined',
    companionCount: 0,
    notes: 'Bận công tác nước ngoài, gửi lời chúc mừng hai bạn',
    submittedAt: '2026-09-08T11:00:00Z'
  },
  {
    id: 'gst-04',
    orderId: 'NCT01',
    name: 'Phạm Quỳnh Nga',
    phone: '0933 444 555',
    rsvpStatus: 'attending',
    companionCount: 2,
    tableNumber: 'Bàn 05 (Gia đình họ hàng)',
    submittedAt: '2026-09-08T14:20:00Z'
  },
  {
    id: 'gst-05',
    orderId: 'NCT01',
    name: 'Đặng Quốc Bảo',
    phone: '0945 667 788',
    rsvpStatus: 'pending',
    companionCount: 0,
    submittedAt: '2026-09-08T15:45:00Z'
  },
  {
    id: 'gst-06',
    orderId: 'NCT02',
    name: 'Trương Minh Trí',
    phone: '0909 333 444',
    rsvpStatus: 'attending',
    companionCount: 1,
    tableNumber: 'Bàn 01 (Bạn đại học)',
    notes: 'Gửi mừng hạnh phúc hai bạn',
    submittedAt: '2026-09-08T09:00:00Z'
  },
  {
    id: 'gst-07',
    orderId: 'NCT02',
    name: 'Đỗ Kim Ngân',
    phone: '0912 777 888',
    rsvpStatus: 'declined',
    companionCount: 0,
    notes: 'Có lịch công tác nước ngoài',
    submittedAt: '2026-09-08T10:30:00Z'
  },
  {
    id: 'gst-08',
    orderId: 'NCT03',
    name: 'Vũ Hoàng My',
    phone: '0988 555 666',
    rsvpStatus: 'attending',
    companionCount: 1,
    tableNumber: 'Bàn 03 (Nhà gái)',
    submittedAt: '2026-09-08T11:00:00Z'
  },
  {
    id: 'gst-09',
    orderId: 'NCT03',
    name: 'Lâm Thành Phát',
    phone: '0934 111 222',
    rsvpStatus: 'pending',
    companionCount: 0,
    submittedAt: '2026-09-08T12:00:00Z'
  },
  {
    id: 'gst-10',
    orderId: 'NCT04',
    name: 'Phan Anh Tuấn',
    phone: '0908 999 111',
    rsvpStatus: 'attending',
    companionCount: 2,
    tableNumber: 'Bàn VIP 02',
    notes: 'Đi cùng vợ và con gái',
    submittedAt: '2026-09-01T10:00:00Z'
  }
];

export const MOCK_WISHES: Wish[] = [
  {
    id: 'wsh-01',
    orderId: 'NCT01',
    senderName: 'Trần Thu Hà',
    relationship: 'Bạn thân cô dâu',
    message: 'Chúc Minh Anh và Đức Minh trăm năm hạnh phúc, mãi mãi yêu thương và chia sẻ cùng nhau mọi khoảnh khắc ngọt ngào nhất!',
    createdAt: '2026-09-08T10:20:00Z',
    isApproved: true,
    isPinned: true
  },
  {
    id: 'wsh-02',
    orderId: 'NCT01',
    senderName: 'Lê Quốc Hưng',
    relationship: 'Hội bạn thân chú rể',
    message: 'Cuối cùng cậu bạn thân nhất cũng chịu lấy vợ! Chúc hai vợ chồng sớm có quý tử và một tổ ấm ngập tràn tiếng cười nhé!',
    createdAt: '2026-09-08T11:45:00Z',
    isApproved: true,
    isPinned: false
  },
  {
    id: 'wsh-03',
    orderId: 'NCT01',
    senderName: 'Bác Hai & Gia đình',
    relationship: 'Họ nội',
    message: 'Chúc hai cháu trăm năm đầu bạc răng long, thuận vợ thuận chồng tát biển đông cũng cạn.',
    createdAt: '2026-09-08T13:10:00Z',
    isApproved: true,
    isPinned: false
  },
  {
    id: 'wsh-04',
    orderId: 'NCT01',
    senderName: 'Đồng nghiệp Team Thiết Kế',
    relationship: 'Đồng nghiệp',
    message: 'Chúc cô dâu xinh đẹp nhất quả đất một ngày cưới thật trọn vẹn và cuộc sống hôn nhân viên mãn!',
    createdAt: '2026-09-08T16:00:00Z',
    isApproved: true,
    isPinned: false
  },
  {
    id: 'wsh-05',
    orderId: 'NCT02',
    senderName: 'Nguyễn Minh Châu',
    relationship: 'Bạn cấp 3',
    message: 'Chúc Hoàng Nam và Thanh Thảo luôn giữ được ngọn lửa tình yêu nồng thắm như những ngày đầu tiên nhé!',
    createdAt: '2026-09-08T09:15:00Z',
    isApproved: true,
    isPinned: true
  },
  {
    id: 'wsh-06',
    orderId: 'NCT03',
    senderName: 'Bác Năm',
    relationship: 'Họ ngoại',
    message: 'Chúc hai cháu vạn sự như ý, răng long đầu bạc, sớm sinh quý tử!',
    createdAt: '2026-09-08T11:30:00Z',
    isApproved: true,
    isPinned: false
  },
  {
    id: 'wsh-07',
    orderId: 'NCT04',
    senderName: 'Văn phòng Marketing',
    relationship: 'Đồng nghiệp',
    message: 'Chúc mừng đám cưới vàng, tình yêu trăm năm mãi vững bền!',
    createdAt: '2026-09-01T15:00:00Z',
    isApproved: true,
    isPinned: true
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'usr-01',
    fullName: 'Nguyễn Minh Anh',
    phone: '0982 123 456',
    email: 'minhanh.wedding@gmail.com',
    role: 'customer',
    orderCount: 1,
    status: 'active',
    createdAt: '2026-09-07T09:10:00Z',
    lastLogin: '2026-09-08T15:30:00Z'
  },
  {
    id: 'usr-02',
    fullName: 'Admin Tuyết Nga',
    phone: '0901 000 999',
    email: 'admin@nhacotiec.vn',
    role: 'admin',
    orderCount: 0,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    lastLogin: '2026-09-08T21:45:00Z'
  },
  {
    id: 'usr-03',
    fullName: 'Hoàng Nam',
    phone: '0912 345 678',
    email: 'hoangnam@gmail.com',
    role: 'customer',
    orderCount: 1,
    status: 'active',
    createdAt: '2026-09-08T07:40:00Z',
    lastLogin: '2026-09-08T08:15:00Z'
  }
];

export const MOCK_ANALYTICS: AnalyticsSummary = {
  totalVisitors: 42850,
  totalSessions: 58320,
  totalPageViews: 164890,
  avgDuration: '3m 42s',
  bounceRate: '28.5%',
  activeInvitations: 48,
  totalRevenue: 15800000, // 15.8M VNĐ
  orderCount: 182,
  vietQrSuccessRate: '100%'
};
