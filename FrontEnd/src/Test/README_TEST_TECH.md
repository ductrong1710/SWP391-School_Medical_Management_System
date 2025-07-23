# Giới thiệu về Unit Test Frontend

## Công nghệ sử dụng

- **Jest**: Framework kiểm thử JavaScript phổ biến, hỗ trợ viết test, chạy test, kiểm tra coverage, mock function và module.
- **React Testing Library**: Thư viện kiểm thử UI cho React, tập trung kiểm thử hành vi người dùng (user-centric), giúp kiểm tra render, sự kiện, trạng thái, và tương tác thực tế.
- **@testing-library/jest-dom**: Cung cấp các matcher bổ sung cho Jest, ví dụ: `toBeInTheDocument`, `toHaveTextContent`, giúp kiểm tra sự xuất hiện và nội dung của phần tử trong DOM.

## Cách hoạt động
### Cấu hình Jest nâng cao (nếu cần)
**Lưu ý:**
- Nếu bạn dùng create-react-app (CRA) hoặc react-scripts, KHÔNG nên cấu hình Jest nâng cao hoặc dùng import/export cho các file service (như apiClient.js). Hãy dùng cú pháp CommonJS (`require`, `module.exports`) để tránh lỗi khi test.
- Chỉ dùng hướng dẫn cấu hình nâng cao bên dưới nếu bạn đã eject hoặc tự cấu hình Jest/Babel cho dự án.

Nếu dự án dùng cú pháp hiện đại (import/export, JSX, ES6+), hoặc cần custom transform cho các thư viện như axios, bạn nên cấu hình thêm:

- **jest.config.js**: File cấu hình cho Jest, ví dụ:
  ```js
  module.exports = {
    testEnvironment: 'jsdom',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    testPathIgnorePatterns: ['/node_modules/'],
    verbose: true,
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
      "/node_modules/(?!axios)"
    ],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
  };
  ```
  - `transformIgnorePatterns` cho phép Jest transform các thư viện ESM như axios.
  - `moduleNameMapper` giúp mock các file CSS khi test.

- **.babelrc**: File cấu hình Babel để Jest hiểu cú pháp mới:
  ```json
  { "presets": ["@babel/preset-env", "@babel/preset-react"] }
  ```

Sau khi cấu hình, có thể chạy test với:
```bash
npx jest --coverage --config jest.config.js
```
hoặc với CRA:
```bash
npm test -- --coverage
```

1. **Viết test**
   - Đặt file test cùng thư mục với component/page, tên file có dạng `TênComponent.test.js`.
   - Sử dụng các hàm của React Testing Library để render component, tìm kiếm phần tử, mô phỏng sự kiện, kiểm tra kết quả.
   - Mock các API call, context, hook để kiểm thử logic mà không phụ thuộc backend.

2. **Chạy test**
   - Chạy lệnh:
     ```bash
     npm test
     ```
   - Jest sẽ tự động tìm và chạy các file test (`*.test.js`).
   - Kết quả test hiển thị trên terminal: số lượng test pass/fail, chi tiết lỗi nếu có.

3. **Xem kết quả và coverage**
   - Để xem báo cáo coverage (tỉ lệ mã nguồn được kiểm thử):
     ```bash
     npx jest --coverage --config jest.config.js
     ```
   - Coverage report sẽ hiển thị các file, dòng code đã/không được kiểm thử, giúp đánh giá chất lượng test.
   - Có thể mở file `coverage/lcov-report/index.html` để xem báo cáo coverage dạng web.

## Ý nghĩa
- Đảm bảo các chức năng UI, logic, xử lý API đều hoạt động đúng.
- Phát hiện lỗi sớm, giảm rủi ro khi phát triển và bảo trì.
- Đảm bảo coverage ≥ 80% giúp mã nguồn được kiểm thử đầy đủ.

## Tài liệu tham khảo
- [Jest](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [@testing-library/jest-dom](https://github.com/testing-library/jest-dom)

---
Nếu gặp lỗi hoặc cần hỗ trợ, hãy kiểm tra lại các bước cài đặt hoặc liên hệ nhóm phát triển.
// 1. Kiểm thử render UI chính
// - Kiểm tra tiêu đề trang "Khám sức khỏe định kỳ" có hiển thị.
// - Kiểm tra nút "Tạo lịch cá nhân" xuất hiện.

test('renders main UI elements', async () => {
  // ... kiểm tra tiêu đề và nút tạo lịch cá nhân ...
});

// 2. Kiểm thử điều hướng về trang đăng nhập khi chưa xác thực
// - Khi user chưa đăng nhập, kiểm tra trang login xuất hiện (text "Đăng nhập").

test('redirects to login if not authenticated', async () => {
  // ... kiểm tra xuất hiện text "Đăng nhập" ...
});

// 3. Kiểm thử gọi API lấy danh sách lớp và người tạo
// - Đảm bảo component gọi đúng API để lấy danh sách lớp và người tạo.

test('shows class and creator options from API', async () => {
  // ... kiểm tra apiClient.get được gọi với '/SchoolClass' và '/User' ...
});

// 4. Kiểm thử xử lý khi API trả lỗi
// - Khi API trả lỗi, kiểm tra UI không hiển thị dữ liệu lớp (không có text "1A").

test('handles API error gracefully', async () => {
  // ... kiểm tra không có text "1A" khi API lỗi ...
});

// 5. (Comment) Kiểm thử sự kiện xem chi tiết kế hoạch và load consent form
// - Đã comment, chưa thực hiện do thiếu UI hoặc event.
// - Nếu có UI, sẽ kiểm tra click nút "Xem chi tiết" và gọi API lấy consent form.