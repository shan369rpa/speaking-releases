# Speaking — bản phát hành

Học tiếng Anh từ video bạn thích. Dán link YouTube, vài phút sau có bài học: chữ sáng lên
đúng lúc người nói, nghĩa tiếng Việt dưới từng từ, phiên âm IPA, ghi âm giọng bạn để so với
câu gốc. Dành cho người mới bắt đầu (A0/A1).

- **Trang cài đặt:** https://shan369rpa.github.io/speaking-releases/
- **Bản Android mới nhất:** [Releases](https://github.com/shan369rpa/speaking-releases/releases/latest)

Repo này chỉ chứa bản phát hành và trang cài. Mã nguồn nằm ở một repo riêng.

## Cài

- **Android 7 trở lên** (máy tính bảng, điện thoại): tải `Speaking-<phiên bản>-android.apk`
  ở Releases, mở file, cho phép Chrome cài ứng dụng từ nguồn này một lần.
- **iPhone và máy tính:** dùng bản web, địa chỉ có trên trang cài đặt.

## Kiểm file tải về

Trang Releases ghi mã sha256 của từng file. So với file trong máy:

```bash
shasum -a 256 Speaking-*-android.apk
```

Bản Android ký bằng khoá riêng, không qua Play Store. Android chỉ nhận bản cập nhật ký cùng
khoá với bản đang cài.

## Nhật ký thay đổi

Ghi chú của từng bản nằm ở trang [Releases](https://github.com/shan369rpa/speaking-releases/releases)
và trong nút **Phiên bản** của trang cài đặt.
