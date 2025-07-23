import React, { useState, useEffect } from 'react';
import './DocumentsBlog.css';
import apiClient from '../services/apiClient';

const DocumentsBlog = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const mockDocuments = [
    {
      id: 1,
      title: 'Hướng dẫn khai báo sức khỏe học sinh hàng ngày',
      category: 'hướng dẫn',
      author: 'Phòng Y tế Học đường',
      date: '2025-01-15',
      summary: 'Quy trình và thủ tục khai báo tình trạng sức khỏe học sinh theo quy định mới nhất của Bộ Y tế.',
      content: `<h2>Hướng dẫn khai báo sức khỏe học sinh hàng ngày</h2>
                <p>Khai báo sức khỏe hàng ngày là nghĩa vụ và trách nhiệm của mỗi phụ huynh nhằm đảm bảo an toàn sức khỏe cho toàn thể học sinh.</p>
                <h3>Thời gian khai báo</h3>
                <p>• Hàng ngày trước 7h30 sáng<br>• Cập nhật ngay khi có thay đổi về sức khỏe<br>• Báo cáo khẩn cấp khi xuất hiện triệu chứng bất thường</p>
                <h3>Nội dung cần khai báo</h3>
                <p>• Nhiệt độ cơ thể<br>• Các triệu chứng: ho, sốt, đau họng, khó thở<br>• Tình trạng tiếp xúc với người bệnh<br>• Sử dụng thuốc và vaccine</p>`,
      imageUrl: '/assets/images/health-declaration.jpg',
      tags: ['khai báo', 'sức khỏe', 'quy định', 'hướng dẫn'],
      priority: 'high',
      downloads: 1250
    },
    {
      id: 2,
      title: 'Biện pháp phòng chống dịch bệnh trong trường học',
      category: 'y tế học đường',
      author: 'TS.BS. Nguyễn Văn A',
      date: '2025-01-10',
      summary: 'Tổng hợp các biện pháp phòng chống dịch bệnh hiệu quả trong môi trường giáo dục.',
      content: `<h2>Biện pháp phòng chống dịch bệnh trong trường học</h2>
                <p>Việc phòng chống dịch bệnh trong trường học đòi hỏi sự phối hợp chặt chẽ giữa nhà trường, gia đình và học sinh.</p>
                <h3>5K trong phòng chống dịch</h3>
                <p>• Khẩu trang - Đeo đúng cách và thường xuyên<br>• Khoảng cách - Giữ khoảng cách an toàn 1.5m<br>• Khử khuẩn - Vệ sinh tay và dụng cụ học tập<br>• Không tụ tập đông người<br>• Khai báo y tế trung thực</p>
                <h3>Quy trình xử lý khi có ca nghi nhiễm</h3>
                <p>Khi phát hiện học sinh có triệu chứng nghi nhiễm, cần thực hiện ngay các bước cách ly, thông báo và xử lý theo quy định.</p>`,
      imageUrl: '/assets/images/disease-prevention.jpg',
      tags: ['phòng chống dịch', '5K', 'an toàn', 'quy trình'],
      priority: 'high',
      downloads: 980
    },
    {
      id: 3,
      title: 'Chăm sóc sức khỏe tâm lý học sinh',
      category: 'sức khỏe tâm lý',
      author: 'ThS. Trần Thị B',
      date: '2025-01-05',
      summary: 'Những kiến thức cơ bản về chăm sóc và bảo vệ sức khỏe tâm lý của học sinh trong mùa dịch.',
      content: `<h2>Chăm sóc sức khỏe tâm lý học sinh</h2>
                <p>Sức khỏe tâm lý của học sinh bị ảnh hưởng nghiêm trọng trong thời kỳ học trực tuyến và giãn cách xã hội.</p>
                <h3>Các dấu hiệu cần chú ý</h3>
                <p>• Thay đổi hành vi bất thường<br>• Giảm hứng thú học tập<br>• Lo lắng, căng thẳng thái quá<br>• Rối loạn giấc ngủ và ăn uống</p>
                <h3>Biện pháp hỗ trợ</h3>
                <p>Tạo môi trường học tập tích cực, duy trì kết nối xã hội và có kế hoạch hỗ trợ tâm lý chuyên nghiệp khi cần thiết.</p>`,
      imageUrl: '/assets/images/mental-health.jpg',
      tags: ['tâm lý', 'học sinh', 'hỗ trợ', 'chăm sóc'],
      priority: 'medium',
      downloads: 756
    },
    {
      id: 4,
      title: 'Dinh dưỡng học đường - Bữa ăn an toàn',
      category: 'dinh dưỡng',
      author: 'CN. Lê Thị C',
      date: '2024-12-20',
      summary: 'Hướng dẫn về dinh dưỡng học đường và đảm bảo an toàn thực phẩm trong trường học.',
      content: `<h2>Dinh dưỡng học đường - Bữa ăn an toàn</h2>
                <p>Dinh dưỡng hợp lý là nền tảng cho sự phát triển toàn diện của học sinh.</p>
                <h3>Nguyên tắc dinh dưỡng học đường</h3>
                <p>• Đủ chất, đủ lượng theo độ tuổi<br>• Đảm bảo vệ sinh an toàn thực phẩm<br>• Cân bằng các nhóm chất dinh dưỡng<br>• Phù hợp với điều kiện địa phương</p>
                <h3>Thực đơn mẫu</h3>
                <p>Cung cấp các thực đơn mẫu cho bữa ăn bán trú và các nguyên tắc lựa chọn thực phẩm an toàn.</p>`,
      imageUrl: '/assets/images/school-nutrition.jpg',
      tags: ['dinh dưỡng', 'thực phẩm', 'an toàn', 'thực đơn'],
      priority: 'medium',
      downloads: 645
    },
    {
      id: 5,
      title: 'Quy trình xử lý tai nạn học đường',
      category: 'cấp cứu',
      author: 'BS. CKI Phạm Văn D',
      date: '2024-12-15',
      summary: 'Hướng dẫn các bước sơ cứu và xử lý tai nạn thường gặp trong môi trường học đường.',
      content: `<h2>Quy trình xử lý tai nạn học đường</h2>
                <p>Tai nạn học đường có thể xảy ra bất cứ lúc nào. Việc xử lý kịp thời và đúng cách rất quan trọng.</p>
                <h3>Các loại tai nạn thường gặp</h3>
                <p>• Ngã, va đập<br>• Bỏng, cắt<br>• Dị ứng thực phẩm<br>• Ngạt thở, ngất xỉu</p>
                <h3>Nguyên tắc sơ cứu</h3>
                <p>Luôn đảm bảo an toàn cho người sơ cứu, đánh giá tình trạng nạn nhân và gọi cấp cứu ngay khi cần thiết.</p>`,
      imageUrl: '/assets/images/first-aid.jpg',
      tags: ['sơ cứu', 'tai nạn', 'cấp cứu', 'an toàn'],
      priority: 'high',
      downloads: 1100
    },
    {
      id: 6,
      title: 'Kế hoạch khám sức khỏe định kỳ',
      category: 'khám sức khỏe',
      author: 'Trung tâm Y tế',
      date: '2024-12-01',
      summary: 'Lịch trình và quy trình khám sức khỏe định kỳ cho học sinh các cấp học.',
      content: `<h2>Kế hoạch khám sức khỏe định kỳ</h2>
                <p>Khám sức khỏe định kỳ giúp phát hiện sớm các vấn đề sức khỏe của học sinh.</p>
                <h3>Chu kỳ khám</h3>
                <p>• Học sinh tiểu học: 6 tháng/lần<br>• Học sinh THCS, THPT: 1 năm/lần<br>• Khám chuyên khoa khi có chỉ định</p>
                <h3>Nội dung khám</h3>
                <p>Khám tổng quát, đo chiều cao cân nặng, kiểm tra thị lực, thính lực, răng miệng và các xét nghiệm cần thiết.</p>`,
      imageUrl: '/assets/images/health-checkup.jpg',
      tags: ['khám sức khỏe', 'định kỳ', 'học sinh', 'phát hiện sớm'],
      priority: 'medium',
      downloads: 823
    },
    {
      id: 7,
      title: 'Chương trình tiêm chủng mở rộng trong trường học',
      category: 'tiêm chủng',
      author: 'BS. Nguyễn Thị Thu Hà',
      date: '2025-01-12',
      summary: 'Hướng dẫn triển khai chương trình tiêm chủng mở rộng cho học sinh theo khuyến cáo của Bộ Y tế.',
      content: `<h2>Chương trình tiêm chủng mở rộng trong trường học</h2>
                <p>Tiêm chủng là biện pháp phòng bệnh hiệu quả nhất, giúp bảo vệ sức khỏe cộng đồng học đường.</p>
                <h3>Lịch tiêm chủng theo độ tuổi</h3>
                <p>• Lớp 1: Vaccine DPT, Sởi-Rubella<br>• Lớp 6: Vaccine uốn ván, bạch hầu<br>• Lớp 11: Vaccine viêm gan B bổ sung</p>
                <h3>Quy trình tiêm chủng</h3>
                <p>Thông báo trước, khám sàng lọc, tiêm vaccine và theo dõi sau tiêm theo đúng quy định.</p>
                <h3>Theo dõi tác dụng phụ</h3>
                <p>Ghi nhận và xử lý kịp thời các phản ứng sau tiêm, đảm bảo an toàn tuyệt đối.</p>`,
      imageUrl: '/assets/images/vaccination.jpg',
      tags: ['tiêm chủng', 'vaccine', 'phòng bệnh', 'an toàn'],
      priority: 'high',
      downloads: 1340
    },
    {
      id: 8,
      title: 'Vệ sinh môi trường trường học và phòng chống dịch bệnh',
      category: 'vệ sinh môi trường',
      author: 'KS. Lê Văn Minh',
      date: '2025-01-08',
      summary: 'Các tiêu chuẩn và biện pháp đảm bảo vệ sinh môi trường trường học theo quy định mới.',
      content: `<h2>Vệ sinh môi trường trường học và phòng chống dịch bệnh</h2>
                <p>Môi trường sạch sẽ là yếu tố quan trọng trong việc bảo vệ sức khỏe học sinh.</p>
                <h3>Tiêu chuẩn vệ sinh lớp học</h3>
                <p>• Thông gió tự nhiên đảm bảo<br>• Ánh sáng đủ, không chói mắt<br>• Nhiệt độ phòng học 22-28°C<br>• Diện tích tối thiểu 1.2m²/học sinh</p>
                <h3>Vệ sinh nhà vệ sinh</h3>
                <p>Đảm bảo tỷ lệ nhà vệ sinh/học sinh, có nước sạch, xà phòng và được khử trùng định kỳ.</p>
                <h3>Quản lý chất thải</h3>
                <p>Phân loại rác thải, xử lý chất thải y tế đúng quy định và bảo vệ môi trường.</p>`,
      imageUrl: '/assets/images/school-hygiene.jpg',
      tags: ['vệ sinh', 'môi trường', 'lớp học', 'nhà vệ sinh'],
      priority: 'medium',
      downloads: 890
    },
    {
      id: 9,
      title: 'Phòng chống bệnh truyền nhiễm thường gặp ở học sinh',
      category: 'y tế học đường',
      author: 'TS.BS. Phạm Văn Nam',
      date: '2025-01-06',
      summary: 'Hướng dẫn nhận biết và phòng chống các bệnh truyền nhiễm phổ biến trong môi trường học đường.',
      content: `<h2>Phòng chống bệnh truyền nhiễm thường gặp ở học sinh</h2>
                <p>Học sinh là nhóm đối tượng dễ mắc các bệnh truyền nhiễm do tiếp xúc nhiều với nhau.</p>
                <h3>Các bệnh thường gặp</h3>
                <p>• Cúm, cảm lạnh<br>• Tay chân miệng<br>• Thủy đậu<br>• Viêm kết mạc mắt<br>• Viêm đường hô hấp</p>
                <h3>Biện pháp phòng ngừa</h3>
                <p>Tăng cường vệ sinh cá nhân, rửa tay thường xuyên, đeo khẩu trang khi cần thiết.</p>
                <h3>Xử lý khi có ca bệnh</h3>
                <p>Cách ly tạm thời, thông báo gia đình, khử trùng khu vực và theo dõi các trường hợp tiếp xúc.</p>`,
      imageUrl: '/assets/images/infectious-diseases.jpg',
      tags: ['bệnh truyền nhiễm', 'phòng ngừa', 'cách ly', 'học sinh'],
      priority: 'high',
      downloads: 1150
    },
    {
      id: 10,
      title: 'Chăm sóc sức khỏe răng miệng cho học sinh',
      category: 'răng miệng',
      author: 'BS. Nguyễn Thị Lan',
      date: '2025-01-04',
      summary: 'Chương trình chăm sóc sức khỏe răng miệng toàn diện cho học sinh các cấp học.',
      content: `<h2>Chăm sóc sức khỏe răng miệng cho học sinh</h2>
                <p>Sức khỏe răng miệng ảnh hưởng trực tiếp đến dinh dưỡng và học tập của học sinh.</p>
                <h3>Thói quen vệ sinh răng miệng</h3>
                <p>• Đánh răng 2 lần/ngày<br>• Sử dụng kem đánh răng có fluoride<br>• Súc miệng sau khi ăn<br>• Thay bàn chải 3 tháng/lần</p>
                <h3>Chế độ ăn bảo vệ răng</h3>
                <p>Hạn chế đồ ngọt, nước có gas, tăng cường calcium và vitamin D.</p>
                <h3>Khám răng định kỳ</h3>
                <p>6 tháng/lần để phát hiện sớm sâu răng và các bệnh lý răng miệng khác.</p>`,
      imageUrl: '/assets/images/dental-health.jpg',
      tags: ['răng miệng', 'vệ sinh', 'đánh răng', 'khám định kỳ'],
      priority: 'medium',
      downloads: 670
    },
    {
      id: 11,
      title: 'Hướng dẫn sử dụng máy đo thân nhiệt tự động',
      category: 'thiết bị y tế',
      author: 'Kỹ thuật viên Y tế',
      date: '2025-01-03',
      summary: 'Quy trình vận hành và bảo trì máy đo thân nhiệt tự động tại cổng trường.',
      content: `<h2>Hướng dẫn sử dụng máy đo thân nhiệt tự động</h2>
                <p>Máy đo thân nhiệt tự động là thiết bị quan trọng trong việc sàng lọc sức khỏe hàng ngày.</p>
                <h3>Cách sử dụng</h3>
                <p>• Đặt máy ở vị trí thuận lợi<br>• Hiệu chỉnh độ cao phù hợp<br>• Đảm bảo khoảng cách đo 5-10cm<br>• Kiểm tra pin và độ chính xác</p>
                <h3>Bảo trì định kỳ</h3>
                <p>Vệ sinh bề mặt máy, kiểm tra cảm biến và hiệu chỉnh theo hướng dẫn nhà sản xuất.</p>
                <h3>Xử lý khi có bất thường</h3>
                <p>Thông báo ngay cho bộ phận kỹ thuật và có phương án dự phòng.</p>`,
      imageUrl: '/assets/images/temperature-scanner.jpg',
      tags: ['thiết bị y tế', 'đo thân nhiệt', 'bảo trì', 'hướng dẫn'],
      priority: 'medium',
      downloads: 445
    },
    {
      id: 12,
      title: 'Chương trình giáo dục sức khỏe sinh sản cho học sinh THPT',
      category: 'giáo dục sức khỏe',
      author: 'TS. Trần Thị Mai',
      date: '2024-12-28',
      summary: 'Nội dung và phương pháp giáo dục sức khỏe sinh sản phù hợp với lứa tuổi học sinh THPT.',
      content: `<h2>Chương trình giáo dục sức khỏe sinh sản cho học sinh THPT</h2>
                <p>Giáo dục sức khỏe sinh sản giúp học sinh có kiến thức đúng đắn về sức khỏe và an toàn.</p>
                <h3>Nội dung chính</h3>
                <p>• Sinh lý tuổi dậy thì<br>• Bảo vệ bản thân<br>• Tác hại của tệ nạn xã hội<br>• Kỹ năng sống</p>
                <h3>Phương pháp giảng dạy</h3>
                <p>Sử dụng phương pháp tương tác, thảo luận nhóm và học qua trải nghiệm.</p>
                <h3>Phối hợp với gia đình</h3>
                <p>Tổ chức các buổi tập huấn cho phụ huynh để đồng hành cùng con em.</p>`,
      imageUrl: '/assets/images/reproductive-health.jpg',
      tags: ['giáo dục sức khỏe', 'sinh sản', 'THPT', 'tuổi dậy thì'],
      priority: 'high',
      downloads: 920
    },
    {
      id: 13,
      title: 'Phòng chống tai nạn thương tích học đường',
      category: 'an toàn học đường',
      author: 'ThS. Vũ Thị Hồng',
      date: '2024-12-25',
      summary: 'Các biện pháp phòng ngừa và xử lý tai nạn thương tích trong hoạt động giáo dục.',
      content: `<h2>Phòng chống tai nạn thương tích học đường</h2>
                <p>Tai nạn thương tích học đường có thể được phòng ngừa thông qua các biện pháp phù hợp.</p>
                <h3>Các nguyên nhân chính</h3>
                <p>• Cơ sở vật chất không an toàn<br>• Thiếu ý thức an toàn<br>• Hoạt động thể thao không đúng cách<br>• Thiếu giám sát</p>
                <h3>Biện pháp phòng ngừa</h3>
                <p>Kiểm tra định kỳ cơ sở vật chất, giáo dục ý thức an toàn và tăng cường giám sát.</p>
                <h3>Xử lý tai nạn</h3>
                <p>Sơ cứu kịp thời, thông báo cấp cứu và gia đình, ghi nhận báo cáo chi tiết.</p>`,
      imageUrl: '/assets/images/school-safety.jpg',
      tags: ['tai nạn', 'an toàn', 'phòng ngừa', 'sơ cứu'],
      priority: 'high',
      downloads: 1080
    },
    {
      id: 14,
      title: 'Quản lý và bảo quản thuốc trong nhà trường',
      category: 'quản lý thuốc',
      author: 'Dược sĩ Hoàng Văn Tùng',
      date: '2024-12-22',
      summary: 'Hướng dẫn quản lý, bảo quản và sử dụng thuốc an toàn trong trường học.',
      content: `<h2>Quản lý và bảo quản thuốc trong nhà trường</h2>
                <p>Việc quản lý thuốc đúng cách đảm bảo hiệu quả điều trị và an toàn cho học sinh.</p>
                <h3>Danh mục thuốc cơ bản</h3>
                <p>• Thuốc hạ sốt<br>• Thuốc sát trùng<br>• Băng gạc y tế<br>• Thuốc dị ứng<br>• Dung dịch nước muối sinh lý</p>
                <h3>Nguyên tắc bảo quản</h3>
                <p>Bảo quản ở nơi khô ráo, thoáng mát, tránh ánh sáng trực tiếp và kiểm tra hạn sử dụng.</p>
                <h3>Sử dụng thuốc an toàn</h3>
                <p>Chỉ sử dụng theo chỉ định của bác sĩ và ghi nhận đầy đủ việc sử dụng thuốc.</p>`,
      imageUrl: '/assets/images/medicine-management.jpg',
      tags: ['quản lý thuốc', 'bảo quản', 'an toàn', 'sử dụng'],
      priority: 'medium',
      downloads: 560
    },
    {
      id: 15,
      title: 'Hướng dẫn xử lý tình huống khẩn cấp y tế',
      category: 'cấp cứu',
      author: 'BS. Cấp cứu Nguyễn Văn Hùng',
      date: '2024-12-20',
      summary: 'Quy trình xử lý các tình huống khẩn cấp y tế phổ biến trong trường học.',
      content: `<h2>Hướng dẫn xử lý tình huống khẩn cấp y tế</h2>
                <p>Xử lý đúng tình huống khẩn cấp có thể cứu sống và giảm thiểu hậu quả nghiêm trọng.</p>
                <h3>Các tình huống thường gặp</h3>
                <p>• Ngừng tim đột ngột<br>• Sốc phản vệ<br>• Co giật<br>• Ngạt thở<br>• Chấn thương đầu</p>
                <h3>Nguyên tắc xử lý</h3>
                <p>Đảm bảo an toàn, gọi cấp cứu 115, thực hiện sơ cứu cơ bản và chờ hỗ trợ chuyên nghiệp.</p>
                <h3>Trang thiết bị cấp cứu</h3>
                <p>Túi cấp cứu, máy sốc tim tự động AED và đào tạo nhân viên sử dụng.</p>`,
      imageUrl: '/assets/images/emergency-care.jpg',
      tags: ['cấp cứu', 'khẩn cấp', 'sơ cứu', 'AED'],
      priority: 'high',
      downloads: 1450
    },
    {
      id: 16,
      title: 'Chương trình khuyến khích hoạt động thể chất',
      category: 'thể chất',
      author: 'ThS. Lê Thành Đạt',
      date: '2024-12-18',
      summary: 'Các hoạt động thể chất phù hợp và an toàn cho học sinh các lứa tuổi.',
      content: `<h2>Chương trình khuyến khích hoạt động thể chất</h2>
                <p>Hoạt động thể chất đều đặn giúp học sinh phát triển toàn diện về thể chất và tinh thần.</p>
                <h3>Lợi ích của hoạt động thể chất</h3>
                <p>• Tăng cường thể lực<br>• Cải thiện sức khỏe tim mạch<br>• Phát triển kỹ năng vận động<br>• Giảm stress và lo âu</p>
                <h3>Hoạt động theo độ tuổi</h3>
                <p>Tiểu học: chạy nhảy, trò chơi vận động. THCS-THPT: thể thao đồng đội, gym nhẹ.</p>
                <h3>An toàn khi tập luyện</h3>
                <p>Khởi động đầy đủ, uống nước đủ và dừng ngay khi có dấu hiệu bất thường.</p>`,
      imageUrl: '/assets/images/physical-activity.jpg',
      tags: ['thể chất', 'vận động', 'thể thao', 'sức khỏe'],
      priority: 'medium',
      downloads: 730
    },
    {
      id: 17,
      title: 'Phòng chống cận thị học đường',
      category: 'thị lực',
      author: 'BS. Mắt Đinh Thị Nga',
      date: '2024-12-15',
      summary: 'Các biện pháp phòng ngừa và điều trị cận thị ở học sinh trong thời đại số.',
      content: `<h2>Phòng chống cận thị học đường</h2>
                <p>Tỷ lệ cận thị ở học sinh ngày càng tăng cao do nhiều yếu tố môi trường và sinh hoạt.</p>
                <h3>Nguyên nhân gây cận thị</h3>
                <p>• Sử dụng thiết bị điện tử quá nhiều<br>• Tư thế đọc sách không đúng<br>• Thiếu ánh sáng tự nhiên<br>• Yếu tố di truyền</p>
                <h3>Biện pháp phòng ngừa</h3>
                <p>Nguyên tắc 20-20-20: cứ 20 phút nhìn gần, nhìn xa 20 giây ở khoảng cách 20 feet.</p>
                <h3>Khám mắt định kỳ</h3>
                <p>6 tháng/lần để phát hiện sớm và can thiệp kịp thời các vấn đề về thị lực.</p>`,
      imageUrl: '/assets/images/eye-care.jpg',
      tags: ['thị lực', 'cận thị', 'mắt', 'phòng ngừa'],
      priority: 'high',
      downloads: 1320
    },
    {
      id: 18,
      title: 'Dinh dưỡng thông minh cho học sinh',
      category: 'dinh dưỡng',
      author: 'CN. Nguyễn Thị Hạnh',
      date: '2024-12-12',
      summary: 'Hướng dẫn xây dựng chế độ dinh dưỡng khoa học cho sự phát triển tối ưu của học sinh.',
      content: `<h2>Dinh dưỡng thông minh cho học sinh</h2>
                <p>Dinh dưỡng đúng cách là nền tảng cho sự phát triển trí tuệ và thể chất của học sinh.</p>
                <h3>Nguyên tắc dinh dưỡng</h3>
                <p>• Đa dạng thực phẩm<br>• Cân bằng các nhóm chất<br>• Đủ năng lượng theo độ tuổi<br>• Bổ sung vitamin và khoáng chất</p>
                <h3>Thực phẩm nên ăn</h3>
                <p>Ngũ cốc, rau xanh, trái cây, protein từ thịt cá, sữa và các chế phẩm từ sữa.</p>
                <h3>Thực phẩm hạn chế</h3>
                <p>Đồ ăn nhanh, nước ngọt có gas, thực phẩm chế biến sẵn và đồ chiên rán.</p>`,
      imageUrl: '/assets/images/smart-nutrition.jpg',
      tags: ['dinh dưỡng', 'thông minh', 'thực phẩm', 'phát triển'],
      priority: 'medium',
      downloads: 885
    },
    {
      id: 19,
      title: 'Chăm sóc sức khỏe học sinh khuyết tật',
      category: 'giáo dục đặc biệt',
      author: 'ThS. Phạm Thị Lan Anh',
      date: '2024-12-10',
      summary: 'Hướng dẫn chăm sóc và hỗ trợ y tế cho học sinh có nhu cầu đặc biệt.',
      content: `<h2>Chăm sóc sức khỏe học sinh khuyết tật</h2>
                <p>Học sinh khuyết tật cần được chăm sóc y tế đặc biệt và sự hỗ trợ toàn diện.</p>
                <h3>Các loại khuyết tật thường gặp</h3>
                <p>• Khuyết tật vận động<br>• Khuyết tật thị giác<br>• Khuyết tật thính giác<br>• Rối loạn phổ tự kỷ<br>• Khó khăn học tập</p>
                <h3>Hỗ trợ y tế cần thiết</h3>
                <p>Theo dõi sức khỏe đặc biệt, hỗ trợ vật lý trị liệu và can thiệp sớm.</p>
                <h3>Phối hợp đa ngành</h3>
                <p>Làm việc với bác sĩ chuyên khoa, nhà trị liệu và gia đình để đạt kết quả tốt nhất.</p>`,
      imageUrl: '/assets/images/special-education.jpg',
      tags: ['khuyết tật', 'giáo dục đặc biệt', 'hỗ trợ', 'chăm sóc'],
      priority: 'medium',
      downloads: 420
    },
    {
      id: 20,
      title: 'Y tế học đường trong thời đại số',
      category: 'công nghệ y tế',
      author: 'TS. Nguyễn Minh Khoa',
      date: '2024-12-08',
      summary: 'Ứng dụng công nghệ số trong quản lý và chăm sóc sức khỏe học sinh hiện đại.',
      content: `<h2>Y tế học đường trong thời đại số</h2>
                <p>Công nghệ số đang thay đổi cách chúng ta quản lý và chăm sóc sức khỏe học sinh.</p>
                <h3>Ứng dụng công nghệ</h3>
                <p>• Hồ sơ sức khỏe điện tử<br>• Ứng dụng theo dõi sức khỏe<br>• Telemedicine cho tư vấn từ xa<br>• AI trong chẩn đoán sớm</p>
                <h3>Lợi ích của số hóa</h3>
                <p>Quản lý thông tin hiệu quả, phân tích dữ liệu y tế và cải thiện chất lượng chăm sóc.</p>
                <h3>Thách thức và giải pháp</h3>
                <p>Bảo mật thông tin, đào tạo nhân viên và đầu tư hạ tầng công nghệ phù hợp.</p>`,
      imageUrl: '/assets/images/digital-health.jpg',
      tags: ['công nghệ', 'số hóa', 'telemedicine', 'AI'],
      priority: 'medium',
      downloads: 620
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/BlogDocument');
        // Map dữ liệu từ backend sang định dạng frontend
        const mappedDocs = (response.data || []).map(doc => ({
          id: doc.documentID,
          title: doc.title,
          category: doc.category,
          author: doc.author,
          date: doc.publishDate ? new Date(doc.publishDate).toISOString().split('T')[0] : '',
          summary: doc.summary,
          content: doc.content,
          imageUrl: doc.imageURL,
          tags: doc.category ? [doc.category] : [],
          priority: 'medium',
          downloads: Math.floor(Math.random() * 1000) + 100
        }));
        
        // Nếu có dữ liệu từ API, sử dụng dữ liệu đó, ngược lại dùng mock data
        setDocuments(mappedDocs.length > 0 ? mappedDocs : mockDocuments);
      } catch (error) {
        console.log('API error, fallback to mock data:', error.message);
        // Fallback về mock data khi API lỗi
        setDocuments(mockDocuments);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    // Smooth scroll to top with a slight delay to ensure DOM update
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleBackToList = () => {
    setSelectedDocument(null);
    // Smooth scroll to top when returning to list
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchCategory = activeCategory === 'all' || doc.category === activeCategory;
    const matchSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const categories = [
    { key: 'all', label: 'Tất cả tài liệu', icon: 'fas fa-list' },
    { key: 'hướng dẫn', label: 'Hướng dẫn', icon: 'fas fa-book-open' },
    { key: 'y tế học đường', label: 'Y tế học đường', icon: 'fas fa-hospital' },
    { key: 'sức khỏe tâm lý', label: 'Sức khỏe tâm lý', icon: 'fas fa-brain' },
    { key: 'dinh dưỡng', label: 'Dinh dưỡng', icon: 'fas fa-utensils' },
    { key: 'cấp cứu', label: 'Cấp cứu', icon: 'fas fa-first-aid' },
    { key: 'khám sức khỏe', label: 'Khám sức khỏe', icon: 'fas fa-stethoscope' },
    { key: 'tiêm chủng', label: 'Tiêm chủng', icon: 'fas fa-syringe' },
    { key: 'vệ sinh môi trường', label: 'Vệ sinh môi trường', icon: 'fas fa-leaf' },
    { key: 'răng miệng', label: 'Răng miệng', icon: 'fas fa-tooth' },
    { key: 'thiết bị y tế', label: 'Thiết bị y tế', icon: 'fas fa-heartbeat' },
    { key: 'giáo dục sức khỏe', label: 'Giáo dục sức khỏe', icon: 'fas fa-graduation-cap' },
    { key: 'an toàn học đường', label: 'An toàn học đường', icon: 'fas fa-shield-alt' },
    { key: 'quản lý thuốc', label: 'Quản lý thuốc', icon: 'fas fa-pills' },
    { key: 'thể chất', label: 'Hoạt động thể chất', icon: 'fas fa-running' },
    { key: 'thị lực', label: 'Chăm sóc thị lực', icon: 'fas fa-eye' },
    { key: 'giáo dục đặc biệt', label: 'Giáo dục đặc biệt', icon: 'fas fa-hands-helping' },
    { key: 'công nghệ y tế', label: 'Công nghệ y tế', icon: 'fas fa-laptop-medical' }
  ];

  const renderDocumentsList = () => (
    <div className="documents-layout">
      {/* Header với search và controls */}
      <div className="documents-header mb-4">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="search-container">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm tài liệu, hướng dẫn..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
          <div className="col-lg-6 text-end">
            <div className="view-controls">
              <div className="btn-group me-3" role="group">
                <button 
                  className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                  onClick={() => setViewMode('grid')}
                >
                  <i className="fas fa-th-large"></i>
                </button>
                <button 
                  className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                  onClick={() => setViewMode('list')}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
              <span className="documents-count text-muted">
                {filteredDocuments.length} tài liệu
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Sidebar categories */}
        <div className="col-lg-3">
          <div className="card categories-card sticky-top">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-folder-open me-2"></i>Danh mục
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="categories-list">
                {categories.map(category => (
                  <button 
                    key={category.key}
                    className={`category-item ${activeCategory === category.key ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(category.key)}
                  >
                    <i className={category.icon}></i>
                    <span>{category.label}</span>
                    <span className="category-count">
                      {category.key === 'all' 
                        ? documents.length 
                        : documents.filter(doc => doc.category === category.key).length
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics card */}
          <div className="card stats-card mt-4">
            <div className="card-body">
              <h6 className="card-title">
                <i className="fas fa-chart-bar me-2"></i>Thống kê
              </h6>
              <div className="stats-item">
                <span>Tổng tài liệu:</span>
                <strong>{documents.length}</strong>
              </div>
              <div className="stats-item">
                <span>Lượt tải xuống:</span>
                <strong>{documents.reduce((sum, doc) => sum + (doc.downloads || 0), 0).toLocaleString()}</strong>
              </div>
              <div className="stats-item">
                <span>Cập nhật gần nhất:</span>
                <strong>{documents.length > 0 ? new Date(Math.max(...documents.map(d => new Date(d.date)))).toLocaleDateString('vi-VN') : 'N/A'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Documents content */}
        <div className="col-lg-9">
          {filteredDocuments.length === 0 ? (
            <div className="no-results text-center py-5">
              <i className="fas fa-file-medical fa-3x mb-3 text-muted"></i>
              <h4>Không tìm thấy tài liệu</h4>
              <p className="text-muted">Thử thay đổi từ khóa tìm kiếm hoặc danh mục</p>
            </div>
          ) : (
            <div className={`documents-content ${viewMode}`}>
              {viewMode === 'grid' ? (
                <div className="row g-4">
                  {filteredDocuments.map(document => (
                    <div className="col-lg-6 col-xl-4" key={document.id}>
                      <div className="document-card-modern">
                        <div className="document-priority">
                          {document.priority === 'high' && (
                            <span className="priority-badge high">
                              <i className="fas fa-exclamation-circle"></i>
                            </span>
                          )}
                        </div>
                        <div className="document-header">
                          <div className="document-category">
                            <span className="category-badge">{document.category}</span>
                          </div>
                          <div className="document-date">
                            {new Date(document.date).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <div className="document-content">
                          <h5 
                            className="document-title"
                            onClick={() => handleDocumentSelect(document)}
                            style={{ cursor: 'pointer' }}
                          >
                            {document.title}
                          </h5>
                          <p className="document-summary">{document.summary}</p>
                          <div className="document-meta">
                            <span className="author">
                              <i className="fas fa-user-md"></i>
                              {document.author}
                            </span>
                            <span className="downloads">
                              <i className="fas fa-download"></i>
                              {document.downloads?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>
                        <div className="document-tags">
                          {document.tags.slice(0, 3).map((tag, index) => (
                            <span className="tag" key={index}>{tag}</span>
                          ))}
                        </div>
                        <div className="document-actions">
                          <button 
                            className="btn btn-primary btn-sm w-100"
                            onClick={() => handleDocumentSelect(document)}
                            title="Click để đọc toàn bộ nội dung"
                          >
                            <i className="fas fa-book-open me-2"></i>Đọc đầy đủ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="documents-list-view">
                  {filteredDocuments.map(document => (
                    <div className="document-list-item" key={document.id}>
                      <div className="document-info">
                        <div className="document-main">
                          <h5 
                            className="document-title"
                            onClick={() => handleDocumentSelect(document)}
                            style={{ cursor: 'pointer' }}
                          >
                            {document.title}
                          </h5>
                          <p className="document-summary">{document.summary}</p>
                          <div className="document-meta-list">
                            <span className="author">
                              <i className="fas fa-user-md"></i>
                              {document.author}
                            </span>
                            <span className="date">
                              <i className="fas fa-calendar"></i>
                              {new Date(document.date).toLocaleDateString('vi-VN')}
                            </span>
                            <span className="category">
                              <i className="fas fa-tag"></i>
                              {document.category}
                            </span>
                            <span className="downloads">
                              <i className="fas fa-download"></i>
                              {document.downloads?.toLocaleString() || 0} lượt tải
                            </span>
                          </div>
                        </div>
                        <div className="document-actions-list">
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleDocumentSelect(document)}
                            title="Click để đọc toàn bộ nội dung"
                          >
                            <i className="fas fa-book-open"></i> Đọc đầy đủ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDocumentDetail = () => {
    if (!selectedDocument) return null;

    return (
      <div className="document-detail-container">
        {/* Header navigation */}
        <div className="detail-header mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <button 
              className="btn btn-outline-primary"
              onClick={handleBackToList}
            >
              <i className="fas fa-arrow-left me-2"></i>Quay lại danh sách
            </button>
            <div className="document-actions">
              <button className="btn btn-outline-success me-2">
                <i className="fas fa-download me-2"></i>Tải xuống
              </button>
              <button className="btn btn-outline-info me-2">
                <i className="fas fa-share-alt me-2"></i>Chia sẻ
              </button>
              <button className="btn btn-outline-secondary">
                <i className="fas fa-print me-2"></i>In
              </button>
            </div>
          </div>
        </div>

        {/* Document content */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card document-content-card">
              <div className="card-body">
                {/* Document header */}
                <div className="document-detail-header mb-4">
                  <div className="category-priority-row mb-3">
                    <span className="category-badge-detail">{selectedDocument.category}</span>
                    {selectedDocument.priority === 'high' && (
                      <span className="priority-badge-detail">
                        <i className="fas fa-exclamation-circle me-1"></i>Ưu tiên cao
                      </span>
                    )}
                  </div>
                  <h1 className="document-title-detail">{selectedDocument.title}</h1>
                  <div className="document-meta-detail">
                    <div className="meta-item">
                      <i className="fas fa-user-md"></i>
                      <span><strong>Tác giả:</strong> {selectedDocument.author}</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-calendar"></i>
                      <span><strong>Ngày đăng:</strong> {new Date(selectedDocument.date).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-download"></i>
                      <span><strong>Lượt tải:</strong> {selectedDocument.downloads?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Document body */}
                <div className="document-body">
                  <div className="reading-time mb-3">
                    <small className="text-muted">
                      <i className="fas fa-clock me-1"></i>
                      Thời gian đọc: ~{Math.ceil(selectedDocument.content.replace(/<[^>]*>/g, '').split(' ').length / 200)} phút
                    </small>
                  </div>
                  <div className="document-content" dangerouslySetInnerHTML={{ __html: selectedDocument.content }}></div>
                </div>

                {/* Document footer */}
                <div className="document-footer mt-4">
                  <div className="tags-section">
                    <h6><strong>Từ khóa:</strong></h6>
                    <div className="tags-list">
                      {selectedDocument.tags.map((tag, index) => (
                        <span className="tag-detail" key={index}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Quick info */}
            <div className="card info-sidebar mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>Thông tin tài liệu
                </h5>
              </div>
              <div className="card-body">
                <div className="info-item">
                  <label>Danh mục:</label>
                  <span>{selectedDocument.category}</span>
                </div>
                <div className="info-item">
                  <label>Tác giả:</label>
                  <span>{selectedDocument.author}</span>
                </div>
                <div className="info-item">
                  <label>Ngày xuất bản:</label>
                  <span>{new Date(selectedDocument.date).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="info-item">
                  <label>Lượt tải xuống:</label>
                  <span>{selectedDocument.downloads?.toLocaleString() || 0}</span>
                </div>
                <div className="info-item">
                  <label>Mức độ ưu tiên:</label>
                  <span className={`priority-text ${selectedDocument.priority}`}>
                    {selectedDocument.priority === 'high' ? 'Cao' : 
                     selectedDocument.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                  </span>
                </div>
              </div>
            </div>

            {/* Related documents */}
            <div className="card related-docs mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-file-alt me-2"></i>Tài liệu liên quan
                </h5>
              </div>
              <div className="card-body">
                {documents
                  .filter(doc => doc.id !== selectedDocument.id && doc.category === selectedDocument.category)
                  .slice(0, 3)
                  .map(doc => (
                    <div className="related-doc-item" key={doc.id}>
                      <h6 className="related-title" onClick={() => handleDocumentSelect(doc)}>
                        {doc.title}
                      </h6>
                      <small className="text-muted">{doc.author}</small>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Contact info */}
            <div className="card contact-info">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-phone-alt me-2"></i>Liên hệ hỗ trợ
                </h5>
              </div>
              <div className="card-body">
                <div className="contact-item">
                  <strong>Phòng Y tế Học đường</strong>
                  <p>📞 (024) 3869 4321</p>
                  <p>📧 yte@school.edu.vn</p>
                </div>
                <div className="contact-item">
                  <strong>Hotline hỗ trợ</strong>
                  <p>📞 1900 1234</p>
                  <p>🕒 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="documents-blog-container">
      <div className="container-fluid py-4">
        {/* Main header */}
        <div className="main-header mb-4">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="page-title">
                <i className="fas fa-file-medical me-3"></i>
                Thông tin Y tế & Tài liệu Tham khảo
              </h1>
              <p className="page-subtitle lead">
                Trung tâm thông tin y tế học đường - Tài liệu chính thức và hướng dẫn chuyên nghiệp
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải tài liệu y tế...</p>
          </div>
        ) : (
          selectedDocument ? renderDocumentDetail() : renderDocumentsList()
        )}
      </div>
    </div>
  );
};

export default DocumentsBlog;
