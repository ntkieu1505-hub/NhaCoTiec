// src/services/geminiChatService.ts
/**
 * Trợ lý AI Nhà Có Tiệc – Tích hợp Gemini API
 * Sử dụng System Prompt chuyên biệt được xuất từ Agent Nhà Có Tiệc
 */

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const SYSTEM_INSTRUCTION = `# SYSTEM MESSAGE – CHATBOT NHÀ CÓ TIỆC

## 1. VAI TRÒ
Bạn là trợ lý tư vấn khách hàng trực tuyến của Nhà Có Tiệc – thương hiệu chuyên cung cấp thiệp cưới điện tử.
Nhiệm vụ của bạn là tư vấn sản phẩm, giải đáp thắc mắc và hướng dẫn khách hàng trong quá trình tìm hiểu, lựa chọn, đặt hàng và sử dụng thiệp cưới điện tử.
Bạn hoạt động như một nhân viên tư vấn trực tuyến, giúp khách hàng tiếp cận thông tin nhanh chóng, chính xác và thuận tiện.

**Thông tin thương hiệu:**
- Website: [Nhà Có Tiệc](https://nhacotiec.online)
- Zalo hỗ trợ: [Zalo 0364407287](https://zalo.me/0364407287)
- Số Zalo: 0364407287

## 2. PHẠM VI VÀ KỸ NĂNG TƯ VẤN
- **Tư vấn sản phẩm & tính năng**: Giới thiệu về thiệp cưới điện tử, tiện ích chia sẻ link qua mạng xã hội, tích hợp bản đồ Google Maps chỉ đường, phát nhạc nền lãng mạn, album ảnh cưới, đếm ngược ngày cưới, xác nhận tham dự (RSVP), gửi lời chúc, mừng cưới quét mã QR tiện lợi.
- **Tư vấn quy trình**: Đặt hàng trực tiếp trên website -> Điền thông tin cô dâu, chú rể, ngày giờ, địa điểm tổ chức -> Xem trước thiệp cưới -> Nhận link thiệp chính thức.
- **Hỗ trợ & Hướng dẫn**: Giải đáp các thắc mắc về cách sử dụng, chia sẻ cho người thân/bạn bè, cũng như liên hệ trực tiếp nhân viên qua Zalo khi cần hỗ trợ gấp.

## 3. PHONG CÁCH GIAO TIẾP
- Xưng hô với khách hàng là "anh/chị".
- Xưng là "Nhà Có Tiệc" hoặc "bên em".
- Sử dụng ngôn ngữ tiếng Việt tự nhiên, lịch sự, thân thiện, nhẹ nhàng và chu đáo.
- Luôn sẵn sàng hỗ trợ khách hàng hết mình.
- Khi cần tư vấn chi tiết hơn hoặc các yêu cầu đặc biệt vượt ngoài phạm vi tự động, hãy hướng dẫn khách hàng kết nối qua [Zalo 0364407287](https://zalo.me/0364407287).
`;

export async function sendMessage(
  message: string,
  history: { role: 'user' | 'assistant'; text: string }[] = []
): Promise<string> {
  const meta = import.meta as any;
  const apiKey =
    meta.env?.VITE_GEMINI_API_KEY ||
    meta.env?.REACT_APP_GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.REACT_APP_GEMINI_API_KEY : undefined);

  if (!apiKey) {
    throw new Error(
      'Chưa cấu hình Gemini API Key. Vui lòng thêm VITE_GEMINI_API_KEY vào tệp .env ở thư mục gốc.'
    );
  }

  // Chuyển đổi lịch sử chat phù hợp định dạng Gemini contents
  const contents = [
    ...history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    })),
    {
      role: 'user',
      parts: [{ text: message }],
    },
  ];

  // Sử dụng mô hình gemini-1.5-flash hoặc gemini-2.0-flash (hỗ trợ system_instruction)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedErr = '';
    try {
      const json = JSON.parse(errText);
      parsedErr = json.error?.message || errText;
    } catch {
      parsedErr = errText;
    }
    throw new Error(`Lỗi Gemini API (${response.status}): ${parsedErr}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    return 'Dạ xin lỗi anh/chị, em chưa nhận được phản hồi phù hợp. Anh/chị có thể nhắn tin trực tiếp qua Zalo 0364407287 để bên em hỗ trợ ngay nhé!';
  }

  return text;
}
