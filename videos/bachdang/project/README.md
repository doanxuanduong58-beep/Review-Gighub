# Cái bẫy dưới sông Bạch Đằng — render trên máy của bạn

Cần: **Node.js 20+** (bản LTS). Git là tuỳ chọn (có thể tải ZIP từ GitHub).
Lời đọc + nhạc + hiệu ứng đã trộn sẵn trong `public/bachdang/mix.wav`, video ra kèm tiếng luôn.

```bash
npm install
npm run render
```

- Video ra ở `out/bachdang_1080.mp4` (1080x1920, có tiếng).
- `npm run render:2k` — bản 1440x2560.
- `npm run render:cpu` — nếu máy không có card đồ họa / bản thường báo lỗi WebGL (chậm hơn nhiều).
- `npm run preview` — mở Remotion Studio xem trước trong trình duyệt.

Lần đầu Remotion sẽ tự tải Chrome Headless Shell (~100 MB).
