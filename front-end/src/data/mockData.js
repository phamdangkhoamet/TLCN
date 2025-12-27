// ======================= mockData.js (UPDATED) =======================
// Dùng chung cho toàn bộ dự án DoAnDemo
// - Giữ nguyên dữ liệu genres, novels, posters, chaptersById như bạn cung cấp
// - BỔ SUNG: authors (danh sách tác giả) để trang Authors lấy dữ liệu từ đây
// - KHÔNG dùng TypeScript

export const genres = [
  "Tiểu thuyết",
  "Khoa học viễn tưởng",
  "Trinh thám",
  "Tình cảm",
  "Phiêu lưu",
];

export const novels = {
  "Tiểu thuyết": [
    { id: 1, title: "Bí ẩn hoàng cung", author: "Nguyễn Văn A", cover: "https://picsum.photos/300/400?random=1", description: "Một câu chuyện ly kỳ xoay quanh những bí mật chốn cung đình." },
    { id: 2, title: "Dòng sông ký ức", author: "Trần Thị B", cover: "https://picsum.photos/300/400?random=2", description: "Hành trình tìm lại ký ức và tình yêu đã mất." },
    { id: 3, title: "Ánh trăng mờ", author: "Lê Hoàng C", cover: "https://picsum.photos/300/400?random=3", description: "Một mối tình dang dở dưới ánh trăng bạc." },
    { id: 4, title: "Bóng đêm tĩnh lặng", author: "Phạm D", cover: "https://picsum.photos/300/400?random=4", description: "Truyện tình yêu xen lẫn yếu tố kỳ bí." },
    { id: 5, title: "Giấc mơ phương xa", author: "Ngô E", cover: "https://picsum.photos/300/400?random=5", description: "Hành trình vượt biên giới để tìm lại giấc mơ." },
  ],
  "Khoa học viễn tưởng": [
    { id: 6, title: "Hành tinh lạ", author: "Nguyễn F", cover: "https://picsum.photos/300/400?random=6", description: "Chuyến phiêu lưu đến một hành tinh chưa từng được khám phá." },
    { id: 7, title: "Vũ trụ song song", author: "Trần G", cover: "https://picsum.photos/300/400?random=7", description: "Khám phá sự tồn tại của những thế giới song hành." },
    { id: 8, title: "Chiến tranh giữa các vì sao", author: "Lê H", cover: "https://picsum.photos/300/400?random=8", description: "Cuộc chiến khốc liệt giành quyền kiểm soát vũ trụ." },
    { id: 9, title: "Robot nổi dậy", author: "Phạm I", cover: "https://picsum.photos/300/400?random=9", description: "Con người đối mặt với trí tuệ nhân tạo vượt ngoài tầm kiểm soát." },
    { id: 10, title: "Thời gian lạc lối", author: "Ngô J", cover: "https://picsum.photos/300/400?random=10", description: "Một chuyến du hành thời gian đầy rẫy hiểm nguy." },
  ],
  "Trinh thám": [
    { id: 11, title: "Án mạng đêm khuya", author: "Nguyễn K", cover: "https://picsum.photos/300/400?random=11", description: "Một vụ án bí ẩn xảy ra giữa đêm khuya tĩnh lặng." },
    { id: 12, title: "Vụ cướp bí ẩn", author: "Trần L", cover: "https://picsum.photos/300/400?random=12", description: "Kẻ cướp biến mất không dấu vết cùng kho báu." },
    { id: 13, title: "Bí mật căn phòng kín", author: "Lê M", cover: "https://picsum.photos/300/400?random=13", description: "Ai là hung thủ khi căn phòng luôn khóa kín?" },
    { id: 14, title: "Lời thú tội", author: "Phạm N", cover: "https://picsum.photos/300/400?random=14", description: "Một lời thú nhận làm thay đổi cả cục diện vụ án." },
    { id: 15, title: "Đêm trắng", author: "Ngô O", cover: "https://picsum.photos/300/400?random=15", description: "Thanh tra truy tìm hung thủ trong một đêm không ngủ." },
  ],
  "Tình cảm": [
    { id: 16, title: "Chỉ còn lại yêu thương", author: "Nguyễn P", cover: "https://picsum.photos/300/400?random=16", description: "Một chuyện tình buồn nhưng đầy cảm xúc." },
    { id: 17, title: "Nắng trong tim", author: "Trần Q", cover: "https://picsum.photos/300/400?random=17", description: "Tình yêu ngọt ngào như ánh nắng ban mai." },
    { id: 18, title: "Gió thoảng mùa thu", author: "Lê R", cover: "https://picsum.photos/300/400?random=18", description: "Một mối tình lãng mạn gắn liền với mùa thu." },
    { id: 19, title: "Ngọt ngào bên em", author: "Phạm S", cover: "https://picsum.photos/300/400?random=19", description: "Tình yêu giản dị nhưng đầy ngọt ngào." },
    { id: 20, title: "Trái tim lạc lối", author: "Ngô T", cover: "https://picsum.photos/300/400?random=20", description: "Trái tim ngây dại tìm lại lối đi đúng đắn trong tình yêu." },
  ],
  "Phiêu lưu": [
    { id: 21, title: "Hành trình phương Bắc", author: "Nguyễn U", cover: "https://picsum.photos/300/400?random=21", description: "Cuộc phiêu lưu đầy hiểm nguy về phía Bắc xa xôi." },
    { id: 22, title: "Vượt qua sa mạc", author: "Trần V", cover: "https://picsum.photos/300/400?random=22", description: "Hành trình khốc liệt vượt qua vùng đất khô cằn." },
    { id: 23, title: "Bí ẩn rừng sâu", author: "Lê W", cover: "https://picsum.photos/300/400?random=23", description: "Khám phá những bí mật ẩn sâu trong rừng rậm." },
    { id: 24, title: "Kho báu hải tặc", author: "Phạm X", cover: "https://picsum.photos/300/400?random=24", description: "Cuộc săn tìm kho báu huyền thoại của hải tặc." },
    { id: 25, title: "Đảo hoang kỳ bí", author: "Ngô Y", cover: "https://picsum.photos/300/400?random=25", description: "Một hòn đảo đầy bí ẩn với những điều chưa ai khám phá." },
  ],
};

export const posters = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
    title: "Khám phá thế giới tiểu thuyết kỳ ảo",
    link: "/featured/1",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80",
    title: "Top truyện hot trong tuần",
    link: "/featured/2",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
    title: "Câu chuyện tình yêu đầy cảm xúc",
    link: "/featured/3",
  },
];

// Dữ liệu chương theo id truyện (có thể mở rộng dần) ======
export const chaptersById = {
  1: [
    { no: 1, title: "Bức chiếu lạ thường", content: "Hoàng cung đêm đó, gió lạnh xuyên qua những hành lang dài..." },
    { no: 2, title: "Bóng người sau rèm ngọc", content: "Tẩm điện vắng lặng, chỉ còn tiếng bước chân rất khẽ..." },
    { no: 3, title: "Mật lệnh phòng kín", content: "Bức mật lệnh được khắc viền mép quạt, khó ai có thể nhận ra..." },
  ],
  2: [
    { no: 1, title: "Bến sông cũ", content: "Tôi đứng trước dòng sông, như thấy lại ký ức của ngày xưa..." },
    { no: 2, title: "Tấm ảnh phai màu", content: "Trong chiếc hộp gỗ, bức ảnh cũ mờ dần theo thời gian..." },
    { no: 3, title: "Người trở về", content: "Cơn mưa chợt đến, và rồi một bóng hình hiện ra ở đầu ngõ..." },
  ],
  3: [
    { no: 1, title: "Đêm trăng", content: "Ánh trăng rót đầy hiên nhà, phủ lên những nỗi niềm chưa nói..." },
    { no: 2, title: "Bức thư chưa gửi", content: "Lá thư đặt giữa cuốn sổ tay, chưa một lần kịp đề tên người nhận..." },
    { no: 3, title: "Khúc rẽ", content: "Tôi nhận ra, mọi con đường đều quay về nơi bắt đầu..." },
  ],
  6: [
    { no: 1, title: "Tín hiệu lạ", content: "Radar bắt được một chuỗi tần số chưa từng ghi nhận..." },
    { no: 2, title: "Hạ cánh", content: "Bề mặt hành tinh phủ sương tím, trọng lực thấp bất ngờ..." },
    { no: 3, title: "Di tích cổ", content: "Những khối đá sắp xếp theo hình xoắn ốc kéo dài vào lòng đất..." },
  ],
  11: [
    { no: 1, title: "Cuộc gọi lúc 0:17", content: "Tiếng chuông vang lên giữa đêm khuya. Đầu dây bên kia chỉ thở gấp..." },
    { no: 2, title: "Hiện trường", content: "Căn phòng mở hé, không một dấu vân tay rõ ràng nào còn lại..." },
    { no: 3, title: "Manh mối thứ ba", content: "Một vệt bút chì mờ dưới gầm bàn, chỉ ra điều ai đó cố giấu..." },
  ],
  16: [
    { no: 1, title: "Ngày nắng", content: "Em đến cùng nắng, nụ cười làm tan đi cả một mùa đông..." },
    { no: 2, title: "Cây bàng đầu ngõ", content: "Lá bàng đỏ rơi, như đếm từng kỷ niệm giữa hai người..." },
    { no: 3, title: "Tin nhắn chưa gửi", content: "Dòng chữ cứ hiện rồi tắt, tim đập nhanh như lần đầu..." },
  ],
  21: [
    { no: 1, title: "Đường băng giá", content: "Gió buốt quất ngang mặt, bản đồ rung lên vì bão từ phương Bắc..." },
    { no: 2, title: "Ngọn hải đăng", content: "Ánh đèn xoay chậm, báo hiệu một điều gì lạ thường ở phía chân trời..." },
    { no: 3, title: "Dấu chân cổ", content: "Trong lớp băng mỏng, in hằn một dấu chân không thuộc về con người..." },
  ],
};

// ====== THÊM: hàm tạo chương mặc định nếu chưa định nghĩa chi tiết ======
export function generateDefaultChapters(count = 10) {
  return Array.from({ length: count }, (_, i) => ({
    no: i + 1,
    title: `Chương ${i + 1}`,
    content: `Nội dung chương ${i + 1}. Đây là dữ liệu mô phỏng (mock) để hiển thị trước khi tích hợp backend.`,
  }));
}

// Thêm field `chapters` vào từng book, KHÔNG đổi các trường cũ ======
for (const genre in novels) {
  novels[genre].forEach((book) => {
    if (!book.chapters) {
      book.chapters = chaptersById[book.id] || generateDefaultChapters(10);
    }
  });
}

// ======================= AUTHORS DATA (NEW) =======================
// Mỗi tác giả gắn với các thể loại trong `genres`, có quốc gia, avatar, điểm rating, số lượng sách, mô tả ngắn và topBooks.
export const authors = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=author_1",
    country: "Việt Nam",
    genres: ["Tiểu thuyết", "Trinh thám"],
    booksCount: 12,
    rating: 4.5,
    followers: 12800,
    bio: "Tác giả chú trọng chiều sâu tâm lý và những nút thắt bất ngờ.",
    topBooks: ["Bí ẩn hoàng cung", "Án mạng đêm khuya", "Đêm trắng"],
  },
  {
    id: "2",
    name: "Trần Thị B",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=author_2",
    country: "Việt Nam",
    genres: ["Tiểu thuyết", "Tình cảm"],
    booksCount: 9,
    rating: 4.2,
    followers: 9400,
    bio: "Văn phong nhẹ nhàng, giàu cảm xúc, bối cảnh đời thường gần gũi.",
    topBooks: ["Dòng sông ký ức", "Nắng trong tim", "Chỉ còn lại yêu thương"],
  },
  {
    id: "3",
    name: "Lê Hoàng C",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=author_3",
    country: "Việt Nam",
    genres: ["Tiểu thuyết", "Phiêu lưu"],
    booksCount: 7,
    rating: 4.0,
    followers: 6100,
    bio: "Pha trộn giữa lãng mạn và khám phá, giàu hình ảnh.",
    topBooks: ["Ánh trăng mờ", "Hành trình phương Bắc"],
  },
  {
    id: "4",
    name: "Phạm D",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=author_4",
    country: "Việt Nam",
    genres: ["Trinh thám", "Khoa học viễn tưởng"],
    booksCount: 11,
    rating: 4.4,
    followers: 11350,
    bio: "Đề cao logic điều tra và các mô-típ công nghệ tương lai.",
    topBooks: ["Bí mật căn phòng kín", "Vũ trụ song song"],
  },
  {
    id: "5",
    name: "Ngô E",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=author_5",
    country: "Nhật Bản",
    genres: ["Phiêu lưu", "Khoa học viễn tưởng"],
    booksCount: 14,
    rating: 4.6,
    followers: 15200,
    bio: "Các chuyến phiêu lưu tốc độ cao, khắc họa thế giới sci-fi độc đáo.",
    topBooks: ["Giấc mơ phương xa", "Hành tinh lạ", "Robot nổi dậy"],
  },
  {
    id: "6",
    name: "Trần G",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=author_6",
    country: "Hàn Quốc",
    genres: ["Khoa học viễn tưởng"],
    booksCount: 6,
    rating: 3.9,
    followers: 4800,
    bio: "Khai thác ý tưởng thế giới song hành và nghịch lý thời gian.",
    topBooks: ["Vũ trụ song song", "Thời gian lạc lối"],
  },
  {
    id: "7",
    name: "Lê H",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=author_7",
    country: "Mỹ",
    genres: ["Khoa học viễn tưởng", "Phiêu lưu"],
    booksCount: 10,
    rating: 4.1,
    followers: 7300,
    bio: "Vũ trụ rộng lớn với những trận chiến khốc liệt và các bí ẩn cổ.",
    topBooks: ["Chiến tranh giữa các vì sao", "Di tích cổ"],
  },
  {
    id: "8",
    name: "Phạm I",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=author_8",
    country: "Anh",
    genres: ["Khoa học viễn tưởng"],
    booksCount: 8,
    rating: 4.3,
    followers: 6800,
    bio: "Đào sâu xung đột con người – AI và hệ quả xã hội.",
    topBooks: ["Robot nổi dậy"],
  },
  {
    id: "9",
    name: "Ngô J",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=author_9",
    country: "Pháp",
    genres: ["Khoa học viễn tưởng", "Tiểu thuyết"],
    booksCount: 5,
    rating: 3.8,
    followers: 3900,
    bio: "Kể chuyện có chiều sâu, tiết tấu chậm, chú trọng bầu không khí.",
    topBooks: ["Thời gian lạc lối"],
  },
  {
    id: "10",
    name: "Nguyễn K",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=author_10",
    country: "Việt Nam",
    genres: ["Trinh thám"],
    booksCount: 13,
    rating: 4.7,
    followers: 17100,
    bio: "Các vụ án nhiều lớp lang, manh mối tinh tế.",
    topBooks: ["Án mạng đêm khuya", "Vụ cướp bí ẩn"],
  },
];

// Trích danh sách quốc gia từ authors (không cố định)
export const authorCountries = Array.from(new Set(authors.map((a) => a.country)));
// ======================= ADMIN DASHBOARD DATA =======================
// Trends 7 ngày (demo)
export const adminTrends = {
  dailyReads: [320, 410, 390, 540, 610, 580, 720],
  newUsers: [12, 18, 15, 20, 26, 23, 31],
};

// Hàng chờ duyệt truyện
export const adminPending = [
  { id: 101, title: "Hải trình cuối đông", author: "Lê Khang", genre: "Phiêu lưu", submittedAt: "2025-10-06 10:21" },
  { id: 102, title: "Những mảnh đời", author: "Nguyễn An", genre: "Tiểu thuyết", submittedAt: "2025-10-07 08:03" },
  { id: 103, title: "Cổng thời gian", author: "Trần Vy", genre: "Khoa học viễn tưởng", submittedAt: "2025-10-08 21:15" },
];

// Báo cáo vi phạm mới
export const adminReports = [
  { id: "R-8890", type: "Nội dung truyện", target: '"Án mạng đêm khuya" (ID: 11)', reason: "Bạo lực mô tả chi tiết", createdAt: "2025-10-08 14:32" },
  { id: "R-8897", type: "Tác giả", target: "Tác giả Nguyễn K", reason: "Hành vi spam", createdAt: "2025-10-08 20:12" },
  { id: "R-8901", type: "Bình luận", target: "Bình luận #55421", reason: "Từ ngữ xúc phạm", createdAt: "2025-10-09 09:05" },
];

// Từ khóa nhạy cảm (ẩn bình luận khi match)
export const commentKeywords = ["bạo lực", "kích động", "thuốc phiện", "***", "xúc phạm"];

// Tổng hợp thống kê (tính từ dữ liệu hiện có)
function totalNovelsCount() {
  return Object.values(novels).reduce((acc, arr) => acc + arr.length, 0);
}
function totalChaptersCount() {
  const idSet = new Set();
  Object.values(novels).forEach((arr) => arr.forEach((b) => idSet.add(b.id)));
  let sum = 0;
  idSet.forEach((id) => {
    const list = chaptersById[id] || [];
    sum += list.length || 10; // fallback 10 chương/mock nếu chưa định nghĩa chi tiết
  });
  return sum;
}

export const adminStats = {
  users: 12450,
  authors: authors.length,
  novels: totalNovelsCount(),
  chapters: totalChaptersCount(),
  pending: adminPending.length,
  reports: adminReports.length,
};
// ======================= ADMIN USERS DATA =======================
export const adminUsers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "a.nguyen@example.com",
    role: "author",
    status: "active",
    novels: 12,
    joinedAt: "2024-11-02",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "b.tran@example.com",
    role: "user",
    status: "active",
    novels: 0,
    joinedAt: "2025-01-15",
  },
  {
    id: 3,
    name: "Lê C",
    email: "c.le@example.com",
    role: "author",
    status: "suspended",
    novels: 5,
    joinedAt: "2023-08-09",
  },
  {
    id: 4,
    name: "Admin Demo",
    email: "admin@system.vn",
    role: "admin",
    status: "active",
    novels: 0,
    joinedAt: "2022-06-10",
  },
];


// Option cho form (dùng chung, KHÔNG tạo tại page)
export const adminRoles = ["user", "author", "admin"];
export const adminStatusList = ["active", "suspended"];
// ==================== KIỂM DUYỆT TRUYỆN ====================

export const moderationPending = [
  { id: 11, title: "Ánh Dương Tàn", author: "Trần Minh Phúc", genre: "Tình cảm", submittedAt: "2025-10-02" },
  { id: 12, title: "Huyết Nguyệt", author: "Lê Khánh Vy", genre: "Kỳ ảo", submittedAt: "2025-10-01" },
];

export const moderationApproved = [
  { id: 21, title: "Bước Chân Mùa Thu", author: "Nguyễn Minh Khang", genre: "Tình cảm", submittedAt: "2025-09-30" },
  { id: 22, title: "Thiên Mệnh", author: "Lê Ngọc Hân", genre: "Huyền huyễn", submittedAt: "2025-09-29" },
];

export const moderationRejected = [
  { id: 31, title: "Ngã Ba Đời", author: "Phan Tấn Tài", genre: "Tâm lý", submittedAt: "2025-09-15" },
];
// ======================= NOTIFICATIONS (GLOBAL + PER-USER) =======================
// Thông báo chung cho toàn hệ thống
export const notificationsGlobal = [
  {
    id: "g-101",
    type: "system",
    title: "Cập nhật giao diện",
    content: "DKStory nâng cấp giao diện trang chủ và cải thiện tốc độ tải.",
    createdAt: "2025-10-10 09:00",
  },
  {
    id: "g-102",
    type: "event",
    title: "Sự kiện đọc truyện nhận quà",
    content: "Đọc 50 chương trong tuần này để nhận huy hiệu đặc biệt!",
    createdAt: "2025-10-09 18:30",
  },
];

// ======================= AUTHOR REPORTS (NEW) =======================
// Báo cáo vi phạm liên quan trực tiếp đến tác giả (gỏn gàng, dùng cho trang Authors)
export const authorReports = [
  {
    id: "AR-1001",
    authorId: "10", // trỏ tới authors.id
    reason: "Spam quảng cáo trong phần bình luận và mô tả tác giả.",
    createdAt: "2025-10-09 09:45",
    status: "pending", // pending | resolved
  },
  {
    id: "AR-1002",
    authorId: "2",
    reason: "Sao chép nội dung từ nguồn khác mà chưa trích dẫn.",
    createdAt: "2025-10-10 13:02",
    status: "resolved",
  },
  {
    id: "AR-1003",
    authorId: "5",
    reason: "Ngôn từ không phù hợp trong trao đổi với độc giả.",
    createdAt: "2025-10-12 19:27",
    status: "pending",
  },
];
// ================== BÌNH LUẬN MẪU CHO TRUYỆN ==================
export const commentsByNovel = {
  1: [
    {
      id: "cmt-1001",
      user: "linh.ng",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=linh",
      content: "Truyện mở đầu cuốn thật sự! ❤️",
      createdAt: "2025-10-10 09:15",
    },
    {
      id: "cmt-1002",
      user: "thanhvu",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=thanhvu",
      content: "Tình tiết khá lôi cuốn, hóng chương sau!",
      createdAt: "2025-10-10 11:02",
    },
  ],
  2: [
    {
      id: "cmt-2001",
      user: "tien.tr",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=tien",
      content: "Cảm động ghê, đọc mà rưng rưng 🥲",
      createdAt: "2025-10-09 20:05",
    },
  ],
  // nếu muốn có dữ liệu cho các truyện khác, thêm key (id truyện) tương tự
};
// ======================= NOTIFICATIONS (NEW) =======================
// Lưu ý: Header và trang Notifications đang đọc currentUserId từ localStorage (mặc định "1").
// Bạn có thể đổi currentUserId ở localStorage để xem giao diện cho user khác.

// Cấu trúc 1 item:
// { id: string|number, title: string, content: string, createdAt: "YYYY-MM-DD HH:mm", type?: "Hệ thống" | "Tác giả" | "Truyện" | ... , link?: "/duong-dan-noi-bo" }

export const notificationsByUser = {
  // ===== User #1: Nguyễn Văn A (demo) =====
  1: [
    {
      id: 1001,
      title: "Chào mừng bạn đến DKStory!",
      content: "Khám phá hàng ngàn câu chuyện mới mỗi ngày. Bắt đầu từ thể loại bạn yêu thích nhé.",
      createdAt: "2025-10-07 09:15",
      type: "Hệ thống",
      link: "/home",
    },
    {
      id: 1002,
      title: "Tác giả bạn theo dõi vừa ra chương mới",
      content: "“Án mạng đêm khuya” đã có Chương 4 từ Nguyễn Văn A.",
      createdAt: "2025-10-08 20:45",
      type: "Tác giả",
      link: "/novel/11/chuong/4",
    },
    {
      id: 1003,
      title: "Bình luận của bạn nhận được phản hồi",
      content: "Có 2 phản hồi mới trong bình luận ở “Dòng sông ký ức”.",
      createdAt: "2025-10-09 08:10",
      type: "Cộng đồng",
      link: "/novel/2", // điều hướng về trang chi tiết truyện
    },
    {
      id: 1004,
      title: "Đề xuất hôm nay cho bạn",
      content: "Thử đọc “Vũ trụ song song” và “Bí mật căn phòng kín” dựa trên lịch sử đọc.",
      createdAt: "2025-10-09 11:32",
      type: "Gợi ý",
      link: "/genres", // tới trang thể loại để khám phá
    },
    {
      id: 1005,
      title: "Thông báo hệ thống",
      content: "Bảo trì máy chủ 00:00–01:00 ngày 2025-10-12. Cảm ơn bạn đã thông cảm.",
      createdAt: "2025-10-10 16:20",
      type: "Hệ thống",
    },
  ],

  // ===== User #2: demo khác =====
  2: [
    {
      id: 2001,
      title: "Chào mừng bạn!",
      content: "Theo dõi tác giả yêu thích để nhận thông báo chương mới.",
      createdAt: "2025-10-06 10:05",
      type: "Hệ thống",
      link: "/authors",
    },
    {
      id: 2002,
      title: "Truyện đã thêm vào yêu thích",
      content: "Bạn vừa thêm “Hành tinh lạ” vào danh sách yêu thích.",
      createdAt: "2025-10-08 21:02",
      type: "Truyện",
      link: "/novel/6",
    },
  ],
};

// Hàm tiện ích: lấy thông báo theo userId
export function getNotificationsForUser(userId) {
  const id = Number(userId);
  return (notificationsByUser[id] || []).slice().sort((a, b) => {
    // Sắp xếp mới nhất trước
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });
}

// (Tuỳ chọn) Hàm thêm thông báo động — hữu ích khi demo tạo noti mới
export function pushNotificationForUser(userId, noti) {
  const id = Number(userId);
  if (!notificationsByUser[id]) notificationsByUser[id] = [];
  // tự tạo id nếu chưa có
  const newId = noti?.id || Math.floor(Math.random() * 1e9);
  const item = {
    id: newId,
    title: noti?.title || "Thông báo mới",
    content: noti?.content || "",
    createdAt:
      noti?.createdAt ||
      new Date().toISOString().slice(0, 16).replace("T", " "),
    type: noti?.type || "Hệ thống",
    link: noti?.link,
  };
  notificationsByUser[id].unshift(item);
  return item;
}
