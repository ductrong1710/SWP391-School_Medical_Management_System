# Hướng dẫn Unit Test Frontend (React + Jest + React Testing Library)

## 1. Cài đặt môi trường test


### 1.1. Cài đặt các package cần thiết
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom babel-jest @babel/preset-env @babel/preset-react identity-obj-proxy
```

### 1.2. Tạo file cấu hình Babel
Tạo file `.babelrc` ở thư mục gốc với nội dung:
```json
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

### 1.3. Tạo file cấu hình Jest
Tạo file `jest.config.js` ở thư mục gốc với nội dung:
```javascript
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

### 1.4. Xóa node_modules nếu gặp lỗi
Trên Windows PowerShell:
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

## 2. Cấu trúc file test
- Đặt file test cùng thư mục với component hoặc page, tên file có dạng: `TênComponent.test.js`
- Ví dụ: `src/pages/HealthCheckManagement.test.js`

## 3. Chạy unit test

Chạy toàn bộ test:
```bash
npm test
```

Hoặc để xem báo cáo coverage:
```bash
npm test -- --coverage
```

## 4. Quy tắc viết test
- Sử dụng Jest và React Testing Library.
- Mock các API call, context, hook khi cần.
- Kiểm thử các luồng chính: UI render, state, sự kiện, xử lý API call, cả thành công và lỗi.
- Đảm bảo coverage ≥ 80%.

## 5. Ví dụ test
```js
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders button', () => {
  render(<MyComponent />);
  expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
});
```

## 6. Một số lệnh hữu ích
- Chạy test một file cụ thể:

- Chạy test một file cụ thể:
  ```bash
  npx jest src/pages/HealthCheckManagement.test.js
  ```
- Xem chi tiết coverage:
  ```bash
  npx jest --coverage
  ```
- Chạy test với cấu hình cụ thể:
  ```bash
  npx jest --coverage --config jest.config.js
  ```

## 7. Tài liệu tham khảo
- [Jest](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---
Nếu gặp lỗi hoặc cần hỗ trợ, hãy kiểm tra lại các bước cài đặt hoặc liên hệ nhóm phát triển.


