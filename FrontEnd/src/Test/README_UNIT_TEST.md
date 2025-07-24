# Hướng dẫn Unit Test Frontend (React + Jest + React Testing Library)

## 1. Cài đặt môi trường test



### 1.1. Cài đặt các package cần thiết
Mở PowerShell tại thư mục gốc dự án (chứa package.json), chạy:
```powershell
npm install --save-dev jest @testing-library/react @testing-library/jest-dom babel-jest @babel/preset-env @babel/preset-react identity-obj-proxy
```


### 1.2. Tạo file cấu hình Babel
Tạo file `.babelrc` ở thư mục gốc (cùng cấp package.json) với nội dung:
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
    '/node_modules/(?!axios)'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  // Thêm dòng này để tự động import jest-dom cho toàn bộ test
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};
```

### 1.4. Tạo file cấu hình matcher cho Jest (bắt buộc)
Tạo file `src/setupTests.js` với nội dung:
```js
// Import jest-dom để có các matcher như toBeRequired, toBeInTheDocument, v.v.
import '@testing-library/jest-dom';
```

Nhờ đó, bạn có thể sử dụng các matcher như `toBeRequired`, `toBeInTheDocument`,... trong mọi file test mà không cần import lại từng file.

### 1.5. Xóa node_modules nếu gặp lỗi
Trên Windows PowerShell:
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force package-lock.json
npm install
```





## 2. Cấu trúc file test
- Đặt file test cùng thư mục với component hoặc page, tên file có dạng: `TênComponent.test.js`
- Ví dụ: `src/Test/HealthCheckResultForm.test.js`


## 3. Chạy unit test

Chạy toàn bộ test:
```powershell
npm test
```

Hoặc để xem báo cáo coverage:
```powershell
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


  **Cách 1: Dùng npm test với đường dẫn file**
  ```powershell
  npm test src/Test/HealthCheckResultForm.test.js
  ```

  **Cách 2: Dùng npx jest với đường dẫn file**
  ```powershell
  npx jest src/Test/HealthCheckResultForm.test.js
  ```

  **Cách 3: Dùng pattern tên file (chạy các file có tên chứa chuỗi đó)**
  ```powershell
  npm test -- HealthCheckResultForm
  npx jest HealthCheckResultForm
  ```

  **Cách 4: Chạy test bằng giao diện VSCode (nếu cài extension Jest)**
  - Click chuột phải vào file test → Chọn "Run Jest" hoặc "Run Test".

- Xem chi tiết coverage:

  ```powershell
  npx jest --coverage
  ```
  Chạy test với cấu hình cụ thể:
  ```powershell
  npx jest --coverage --config jest.config.js
  ```

## 7. Tài liệu tham khảo
- [Jest](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---
Nếu gặp lỗi hoặc cần hỗ trợ, hãy kiểm tra lại các bước cài đặt hoặc liên hệ nhóm phát triển.


