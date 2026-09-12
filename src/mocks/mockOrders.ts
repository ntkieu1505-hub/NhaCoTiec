import { Order } from '../types/order';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'NCT01',
    customerName: 'Nguyễn Minh Anh & Trần Đức Minh',
    customerPhone: '0982 123 456',
    customerEmail: 'minhanh.wedding@gmail.com',
    templateId: 'tpl-minh-anh',
    templateName: 'Minh Anh & Tuấn Kiệt (Suite Cao Cấp)',
    category: 'premium',
    price: 79000,
    paymentStatus: 'unpaid', // Customer starts at 'unpaid' so user can test full payment flow
    orderStatus: 'pending_payment',
    paymentMethod: 'vietqr',
    currentStage: 1, // 1: Chờ thanh toán
    createdAt: '2026-09-08T19:15:00Z',
    updatedAt: '2026-09-08T22:00:00Z',
    invitationUrl: '',
    slaRemainingHours: 24,
    weddingInfo: {
      groomName: 'Trần Đức Minh',
      brideName: 'Nguyễn Minh Anh',
      groomParents: 'Ông Trần Văn Hùng & Bà Lê Thị Mai',
      brideParents: 'Ông Nguyễn Văn An & Bà Vũ Thị Cúc',
      weddingDate: '2026-12-28',
      weddingTime: '18:00',
      venueName: 'Trung tâm Hội nghị Tiệc cưới GEM Center',
      venueAddress: 'Số 8 Nguyễn Bỉnh Khiêm, P. Đa Kao, Quận 1, TP. Hồ Chí Minh',
      googleMapUrl: 'https://maps.google.com/?q=GEM+Center',
      musicTitle: 'A Thousand Years - Christina Perri',
      albumDriveUrl: 'https://drive.google.com/drive/folders/wedding-minhanh-ducminh'
    },
    revisionRequests: []
  },
  {
    id: 'NCT02',
    customerName: 'Nguyễn Minh Anh & Trần Đức Minh (Tiệc Nhà Gái)',
    customerPhone: '0982 123 456',
    customerEmail: 'minhanh.wedding@gmail.com',
    templateId: 'tpl-thanh-xuan',
    templateName: 'Thanh Xuân & Hoàng Nam (Mẫu Tiệc Nhà Gái)',
    category: 'basic',
    price: 59000,
    paymentStatus: 'paid',
    orderStatus: 'designing',
    paymentMethod: 'vietqr',
    paymentDate: '2026-09-08T08:00:00Z',
    currentStage: 4, // 4: Đang thiết kế
    createdAt: '2026-09-08T07:45:00Z',
    updatedAt: '2026-09-08T11:20:00Z',
    slaRemainingHours: 12
  },
  {
    id: 'NCT03',
    customerName: 'Quang Huy & Ngọc Lan',
    customerPhone: '0903 888 999',
    customerEmail: 'quanghuy.lan@gmail.com',
    templateId: 'tpl-ngoc-lan',
    templateName: 'Ngọc Lan & Quang Huy',
    category: 'premium',
    price: 79000,
    paymentStatus: 'pending_confirmation', // Đang chờ Admin xác nhận
    orderStatus: 'pending_payment', // Vẫn là Chờ thanh toán
    paymentMethod: 'vietqr',
    paymentSubmissionTime: '2026-09-08T22:10:00Z',
    paymentNote: 'Đã chuyển 79.000đ qua Vietcombank với nội dung NCT03',
    paymentProof: 'vietqr_receipt_nct03.jpg',
    currentStage: 1, // 1: Chờ thanh toán
    createdAt: '2026-09-08T21:45:00Z',
    updatedAt: '2026-09-08T22:10:00Z',
    slaRemainingHours: 24
  },
  {
    id: 'NCT04',
    customerName: 'Hải Đăng & Mộc Trà',
    customerPhone: '0938 111 222',
    customerEmail: 'haidang.moctra@gmail.com',
    templateId: 'tpl-moc-tra',
    templateName: 'Mộc Trà & Hải Đăng',
    category: 'basic',
    price: 59000,
    paymentStatus: 'paid',
    orderStatus: 'completed',
    paymentMethod: 'vietqr',
    paymentDate: '2026-09-05T14:30:00Z',
    currentStage: 7, // 7: Hoàn tất
    createdAt: '2026-09-05T14:00:00Z',
    updatedAt: '2026-09-06T16:00:00Z',
    invitationUrl: 'https://nhacotiec.vn/invitation/haidang-moctra'
  }
];
