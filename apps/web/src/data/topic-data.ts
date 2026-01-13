/**
 * topic-data.ts - Static data cho các chủ đề gợi ý trong Listening
 * 
 * Mục đích: Cung cấp 140 scenarios được chia theo 3 categories lớn
 * Tham số đầu ra: TOPIC_CATEGORIES array với đầy đủ scenarios
 * Khi nào sử dụng: Import vào TopicPicker component
 */

import { TopicCategory } from '@/types/listening-types';

/**
 * Danh sách các chủ đề gợi ý - 140 scenarios
 * 
 * Categories:
 * - IT: 40 scenarios (Feature Dev + Architecture)
 * - Daily: 60 scenarios (Airport + Shopping + Street)
 * - Personal: 40 scenarios (Friends + Family)
 */
export const TOPIC_CATEGORIES: TopicCategory[] = [
  // ============================================
  // 💻 IT - CÔNG NGHỆ (40 scenarios)
  // ============================================
  {
    id: 'it',
    name: 'IT & Technology',
    icon: '💻',
    description: 'Họp kỹ thuật, phát triển sản phẩm, kiến trúc hệ thống',
    subCategories: [
      // Feature Development (20 scenarios)
      {
        id: 'agile',
        name: 'Agile Ceremonies',
        scenarios: [
          { id: 'it-1', name: 'Daily Stand-up Update', description: 'Báo cáo nhanh việc hôm qua, hôm nay và blocker' },
          { id: 'it-2', name: 'Sprint Planning - Estimation', description: 'Tranh luận về Story Points, sếp ép làm nhanh' },
          { id: 'it-3', name: 'Sprint Retrospective', description: 'Thảo luận về production incident, tìm root cause' },
          { id: 'it-4', name: 'Backlog Grooming/Refinement', description: 'Làm rõ yêu cầu của User Story thiếu chi tiết' },
          { id: 'it-5', name: 'Demo Day Presentation', description: 'Show tính năng mới cho Stakeholders' },
        ],
      },
      {
        id: 'technical',
        name: 'Technical Discussions',
        scenarios: [
          { id: 'it-6', name: 'Database Schema Review', description: 'Tranh luận về quan hệ bảng, đặt Index ở đâu' },
          { id: 'it-7', name: 'API Contract Negotiation', description: 'Frontend chê API thiếu field, Backend bảo vệ performance' },
          { id: 'it-8', name: 'Third-party Integration', description: 'Bàn về tích hợp cổng thanh toán Stripe/PayPal' },
          { id: 'it-9', name: 'Handling Technical Debt', description: 'Thuyết phục PM cho thời gian Refactor code cũ' },
          { id: 'it-10', name: 'Fixing a Critical Bug', description: 'Họp khẩn cấp War room để fix lỗi nghiêm trọng' },
        ],
      },
      {
        id: 'features',
        name: 'Specific Features',
        scenarios: [
          { id: 'it-11', name: 'Implementing RBAC', description: 'Phân quyền Admin, Editor, Viewer' },
          { id: 'it-12', name: 'Real-time Notification System', description: 'Thiết kế tính năng thông báo Websocket vs Polling' },
          { id: 'it-13', name: 'Search Functionality Optimization', description: 'Cải thiện tốc độ tìm kiếm Elasticsearch vs SQL' },
          { id: 'it-14', name: 'File Upload & Processing', description: 'Xử lý upload ảnh, resize ảnh, lưu vào S3' },
          { id: 'it-15', name: 'Offline Mode Support', description: 'Giải pháp cho Mobile App khi mất mạng' },
          { id: 'it-16', name: 'Multi-language Support (i18n)', description: 'Kế hoạch hỗ trợ đa ngôn ngữ cho hệ thống' },
        ],
      },
      {
        id: 'performance',
        name: 'Performance & Security',
        scenarios: [
          { id: 'it-17', name: 'Performance Bottleneck Analysis', description: 'API bị chậm, bàn Caching Redis hoặc Optimize query' },
          { id: 'it-18', name: 'Security Audit Response', description: 'Fix các lỗ hổng bảo mật sau report từ Pentester' },
          { id: 'it-19', name: 'Scalability Planning for Black Friday', description: 'Chuẩn bị hệ thống cho lượng traffic tăng đột biến' },
          { id: 'it-20', name: 'Legacy Code Migration', description: 'Kế hoạch chuyển đổi module cũ từ PHP sang Node.js' },
        ],
      },
      // Architecture (20 scenarios)
      {
        id: 'architecture',
        name: 'Architecture Patterns',
        scenarios: [
          { id: 'it-21', name: 'Monolith vs Microservices', description: 'Có nên đập hệ thống ra Microservices không' },
          { id: 'it-22', name: 'Event-Driven Architecture', description: 'Xử lý bất đồng bộ dùng Kafka/RabbitMQ' },
          { id: 'it-23', name: 'Serverless vs Containers', description: 'Chọn AWS Lambda hay Kubernetes (K8s)' },
          { id: 'it-24', name: 'GraphQL vs REST API', description: 'Team Mobile đòi GraphQL, Team Backend muốn giữ REST' },
          { id: 'it-25', name: 'Multi-tenant Architecture', description: 'Thiết kế Database cho SaaS, chung hay tách DB' },
        ],
      },
      {
        id: 'database',
        name: 'Database & Data',
        scenarios: [
          { id: 'it-26', name: 'SQL vs NoSQL', description: 'Chọn Postgres hay MongoDB cho dự án' },
          { id: 'it-27', name: 'Caching Strategy', description: 'Write-through vs Write-back với Redis/Memcached' },
          { id: 'it-28', name: 'Data Warehousing', description: 'Luồng Data Pipeline từ App sang Snowflake/BigQuery' },
          { id: 'it-29', name: 'Database Sharding', description: 'Database quá lớn 10TB+, chia shard như thế nào' },
          { id: 'it-30', name: 'Disaster Recovery (DR) Plan', description: 'Kế hoạch khôi phục khi Data Center bị cháy/sập' },
        ],
      },
      {
        id: 'devops',
        name: 'Cloud & DevOps',
        scenarios: [
          { id: 'it-31', name: 'CI/CD Pipeline Design', description: 'Blue-Green Deployment vs Canary Release' },
          { id: 'it-32', name: 'Container Orchestration', description: 'Thảo luận về khó khăn khi vận hành Kubernetes' },
          { id: 'it-33', name: 'Cloud Cost Optimization', description: 'Sếp chửi vì bill AWS cao quá, tìm cách giảm' },
          { id: 'it-34', name: 'Infrastructure as Code (IaC)', description: 'Chuyển đổi manual setup sang Terraform/Ansible' },
          { id: 'it-35', name: 'Monitoring & Observability', description: 'Chọn ELK Stack hay Prometheus/Grafana' },
        ],
      },
      {
        id: 'advanced',
        name: 'Advanced Topics',
        scenarios: [
          { id: 'it-36', name: 'Authentication System (OAuth2/OIDC)', description: 'Tự build hay dùng Auth0/Cognito/Keycloak' },
          { id: 'it-37', name: 'Real-time Chat Architecture', description: 'Thiết kế backend cho chat hàng triệu user' },
          { id: 'it-38', name: 'Video Streaming Architecture', description: 'Hệ thống stream video CDN, Transcoding' },
          { id: 'it-39', name: 'Rate Limiting & Anti-DDoS', description: 'Thiết kế Gateway để chặn spam request' },
          { id: 'it-40', name: 'AI/ML Integration', description: 'Tích hợp module AI vào hệ thống, latency concerns' },
        ],
      },
    ],
  },

  // ============================================
  // 🌍 DAILY - SINH TỒN HÀNG NGÀY (60 scenarios)
  // ============================================
  {
    id: 'daily',
    name: 'Daily Survival',
    icon: '🌍',
    description: 'Sân bay, siêu thị, đường phố, du lịch, công tác',
    subCategories: [
      // Airport & Flight (20 scenarios)
      {
        id: 'airport',
        name: 'Airport & Flight',
        scenarios: [
          { id: 'daily-1', name: 'Check-in & Seat Selection', description: 'Xin ghế cạnh cửa sổ hoặc lối đi' },
          { id: 'daily-2', name: 'Overweight Baggage', description: 'Hành lý quá cân, xin xỏ hoặc hỏi phí phạt' },
          { id: 'daily-3', name: 'Security Check', description: 'Bị an ninh giữ lại vì có chai nước hoặc vật kim loại' },
          { id: 'daily-4', name: 'Lost Gate/Gate Change', description: 'Không tìm thấy cổng ra máy bay, nghe loa đổi cổng' },
          { id: 'daily-5', name: 'Missed Connection', description: 'Bị trễ chuyến bay nối chuyến do chuyến trước đến muộn' },
          { id: 'daily-6', name: 'Lost Luggage Report', description: 'Báo mất hành lý tại quầy Lost & Found' },
          { id: 'daily-7', name: 'Visa & Immigration', description: 'Trả lời câu hỏi của hải quan về mục đích chuyến đi' },
          { id: 'daily-8', name: 'Customs Declaration', description: 'Khai báo hàng hóa, mang quá nhiều tiền/rượu/thuốc lá' },
          { id: 'daily-9', name: 'Buying a SIM Card', description: 'Mua SIM 4G tại sân bay' },
          { id: 'daily-10', name: 'Currency Exchange', description: 'Đổi tiền, hỏi tỷ giá (Exchange rate)' },
          { id: 'daily-11', name: 'Flight Delayed/Cancelled', description: 'Yêu cầu khách sạn hoặc phiếu ăn khi hoãn chuyến' },
          { id: 'daily-12', name: 'Upgrading Class', description: 'Hỏi giá nâng hạng thương gia (Business class)' },
          { id: 'daily-13', name: 'Asking for Amenities', description: 'Xin chăn, gối, tai nghe trên máy bay' },
          { id: 'daily-14', name: 'Sick Passenger', description: 'Báo viên mình bị mệt/đau bụng trên chuyến bay' },
          { id: 'daily-15', name: 'Taxi Queue', description: 'Hỏi chỗ bắt Taxi/Uber tại sảnh đến' },
          { id: 'daily-16', name: 'Lounge Access', description: 'Hỏi đường vào phòng chờ VIP' },
          { id: 'daily-17', name: 'Duty Free Shopping', description: 'Mua hàng miễn thuế, hỏi quy định mang lên máy bay' },
          { id: 'daily-18', name: 'Helping Someone', description: 'Giúp người già cất hành lý lên Kabin' },
          { id: 'daily-19', name: 'Complaining about Service', description: 'Phàn nàn ghế bị hỏng, màn hình không lên' },
          { id: 'daily-20', name: 'Final Boarding Call', description: 'Chạy vội ra cửa máy bay khi nghe gọi tên lần cuối' },
        ],
      },
      // Supermarket & Shopping (20 scenarios)
      {
        id: 'shopping',
        name: 'Supermarket & Shopping',
        scenarios: [
          { id: 'daily-21', name: 'Asking for Location', description: 'Hỏi món đồ nằm ở gian hàng nào (Aisle)' },
          { id: 'daily-22', name: 'Checking Freshness', description: 'Hỏi nhân viên xem trái cây/thịt này có tươi không' },
          { id: 'daily-23', name: 'Weighing Produce', description: 'Cân rau quả tự chọn và dán tem' },
          { id: 'daily-24', name: 'Asking about Ingredients', description: 'Hỏi xem bánh này có chứa đậu phộng (dị ứng) không' },
          { id: 'daily-25', name: 'Out of Stock Items', description: 'Hỏi khi nào hàng mới về' },
          { id: 'daily-26', name: 'Price Check', description: 'Giá trên kệ và giá khi quét mã vạch khác nhau' },
          { id: 'daily-27', name: 'Using Coupons/Vouchers', description: 'Dùng mã giảm giá, thẻ thành viên' },
          { id: 'daily-28', name: 'Payment Method', description: 'Máy thẻ bị lỗi, hỏi trả tiền mặt hoặc Apple Pay' },
          { id: 'daily-29', name: 'Return & Refund', description: 'Trả lại áo bị chật, đòi hoàn tiền' },
          { id: 'daily-30', name: 'Fitting Room', description: 'Xin vào phòng thử đồ' },
          { id: 'daily-31', name: 'Bargaining (Street Market)', description: 'Mặc cả ở chợ trời, give me a better price' },
          { id: 'daily-32', name: 'Buying Electronics', description: 'Hỏi về bảo hành (Warranty) và chính sách đổi trả' },
          { id: 'daily-33', name: 'Buying Souvenirs', description: 'Nhờ tư vấn quà lưu niệm đặc sản' },
          { id: 'daily-34', name: 'Self-Checkout', description: 'Gặp lỗi khi dùng máy tự thanh toán' },
          { id: 'daily-35', name: 'Asking for a Bag', description: 'Xin túi ni-lông (thường phải trả tiền thêm)' },
          { id: 'daily-36', name: 'Sampling Food', description: 'Xin ăn thử đồ ăn trong siêu thị' },
          { id: 'daily-37', name: 'Buying Medicine (Pharmacy)', description: 'Mua thuốc đau đầu, cảm cúm tại hiệu thuốc' },
          { id: 'daily-38', name: 'Ordering Delivery', description: 'Yêu cầu giao hàng cồng kềnh về nhà' },
          { id: 'daily-39', name: 'Tax Refund for Tourists', description: 'Làm thủ tục hoàn thuế khi mua sắm' },
          { id: 'daily-40', name: 'Reporting Theft', description: 'Báo bảo vệ bị móc túi trong trung tâm thương mại' },
        ],
      },
      // Street & Getting Around (20 scenarios)
      {
        id: 'street',
        name: 'Street & Getting Around',
        scenarios: [
          { id: 'daily-41', name: 'Asking for Directions', description: 'Hỏi đường đến địa điểm nổi tiếng (Landmark)' },
          { id: 'daily-42', name: 'Taking the Bus', description: 'Hỏi tuyến xe bus, giá vé, trạm dừng' },
          { id: 'daily-43', name: 'Taking the Subway/Metro', description: 'Mua vé tàu điện ngầm, hỏi bản đồ' },
          { id: 'daily-44', name: 'Hailing a Taxi', description: 'Gọi taxi, chỉ đường cho tài xế' },
          { id: 'daily-45', name: 'Renting a Car/Bike', description: 'Thuê xe tự lái, hỏi về bảo hiểm' },
          { id: 'daily-46', name: 'Asking for a Photo', description: 'Nhờ người lạ chụp hộ kiểu ảnh' },
          { id: 'daily-47', name: 'Finding a Restroom', description: 'Hỏi nhà vệ sinh công cộng gần nhất' },
          { id: 'daily-48', name: 'Finding an ATM', description: 'Hỏi ngân hàng/cây ATM gần nhất' },
          { id: 'daily-49', name: 'Reporting an Accident', description: 'Báo cảnh sát về tai nạn giao thông' },
          { id: 'daily-50', name: 'Asking for Recommendations', description: 'Hỏi người dân địa phương quán ăn ngon' },
          { id: 'daily-51', name: 'Lost & Confused', description: 'Bị lạc, điện thoại hết pin, nhờ giúp đỡ' },
          { id: 'daily-52', name: 'Dealing with Beggars/Scams', description: 'Từ chối lịch sự khi bị chèo kéo' },
          { id: 'daily-53', name: 'Buying Street Food', description: 'Hỏi món này là gì, có cay không' },
          { id: 'daily-54', name: 'Crossing the Street', description: 'Hỏi cảnh sát giao thông cách qua đường an toàn' },
          { id: 'daily-55', name: 'Using Public Wifi', description: 'Hỏi pass wifi quán cafe ven đường' },
          { id: 'daily-56', name: 'Booking a Tour', description: 'Mua tour tham quan thành phố tại quầy thông tin' },
          { id: 'daily-57', name: 'Hotel Check-in', description: 'Nhận phòng, phàn nàn phòng bẩn/ồn' },
          { id: 'daily-58', name: 'Hotel Concierge', description: 'Nhờ lễ tân đặt bàn nhà hàng' },
          { id: 'daily-59', name: 'Emergency (911)', description: 'Gọi cấp cứu hoặc cứu hỏa' },
          { id: 'daily-60', name: 'Making Friends', description: 'Bắt chuyện xã giao với người ngồi cùng băng ghế công viên' },
        ],
      },
    ],
  },

  // ============================================
  // 👤 PERSONAL - ĐỜI SỐNG CÁ NHÂN (40 scenarios)
  // ============================================
  {
    id: 'personal',
    name: 'Personal Life',
    icon: '👤',
    description: 'Bạn bè, gia đình, tình cảm, công việc cá nhân',
    subCategories: [
      // Socializing & Friends (20 scenarios)
      {
        id: 'friends',
        name: 'Socializing & Friends',
        scenarios: [
          { id: 'personal-1', name: 'Catching Up', description: 'Gặp lại bạn cũ sau 5 năm' },
          { id: 'personal-2', name: 'Venting about Work', description: 'Than thở về sếp, OT, lương thưởng' },
          { id: 'personal-3', name: 'Planning a Trip', description: 'Rủ bạn đi phượt, bàn lịch trình, budget' },
          { id: 'personal-4', name: 'Discussing Movies/Series', description: 'Review phim mới xem trên Netflix (Spoilers alert!)' },
          { id: 'personal-5', name: 'Giving Advice', description: 'Bạn thân bị "cắm sừng" (cheated on), đưa lời khuyên' },
          { id: 'personal-6', name: 'Borrowing Money', description: 'Hỏi vay tiền khéo léo và hứa trả' },
          { id: 'personal-7', name: 'Inviting to a Party', description: 'Mời bạn đến tân gia (Housewarming) hoặc sinh nhật' },
          { id: 'personal-8', name: 'Declining an Invitation', description: 'Từ chối đi nhậu khéo léo vì lý do sức khỏe/bận' },
          { id: 'personal-9', name: 'Talking about Hobbies', description: 'Khoe bộ PC mới build, hoặc bàn về game thủ' },
          { id: 'personal-10', name: 'Gossip', description: '"Tám" chuyện về một người bạn chung sắp cưới' },
          { id: 'personal-11', name: 'Sports Talk', description: 'Bình luận trận bóng đá tối qua (Manchester vs Liverpool)' },
          { id: 'personal-12', name: 'Tech Talk (Casual)', description: 'Tranh luận iPhone vs Samsung, Mac vs Windows' },
          { id: 'personal-13', name: 'Talking about Food', description: 'Khen/Chê quán ăn mới mở' },
          { id: 'personal-14', name: 'Fitness & Health', description: 'Rủ đi tập Gym, bàn về chế độ Diet/Keto' },
          { id: 'personal-15', name: 'Sharing a Secret', description: 'Kể một bí mật và dặn "Don\'t spill the beans"' },
          { id: 'personal-16', name: 'Apologizing', description: 'Xin lỗi vì đến muộn hoặc lỡ làm hỏng đồ của bạn' },
          { id: 'personal-17', name: 'Complimenting', description: 'Khen bạn có áo mới, tóc mới' },
          { id: 'personal-18', name: 'Discussing News', description: 'Bàn về sự kiện nóng hổi trên mạng xã hội' },
          { id: 'personal-19', name: 'Asking for a Favor', description: 'Nhờ bạn trông hộ con chó vài ngày' },
          { id: 'personal-20', name: 'Saying Goodbye', description: 'Tiễn bạn đi định cư nước ngoài (Xúc động)' },
        ],
      },
      // Personal & Family (20 scenarios)
      {
        id: 'family',
        name: 'Personal & Family',
        scenarios: [
          { id: 'personal-21', name: 'First Date', description: 'Buổi hẹn hò đầu tiên, hỏi về sở thích, gia đình' },
          { id: 'personal-22', name: 'Confessing Feelings', description: 'Tỏ tình với Crush (Hồi hộp, lo lắng)' },
          { id: 'personal-23', name: 'Breakup Conversation', description: 'Chia tay êm đẹp hoặc cãi vã' },
          { id: 'personal-24', name: 'Meeting the Parents', description: 'Ra mắt bố mẹ người yêu' },
          { id: 'personal-25', name: 'Marriage Proposal', description: 'Cầu hôn lãng mạn' },
          { id: 'personal-26', name: 'Couple Fight', description: 'Cãi nhau về việc ai rửa bát/dọn nhà' },
          { id: 'personal-27', name: 'Making Up', description: 'Làm hòa sau khi cãi nhau' },
          { id: 'personal-28', name: 'Talking to Parents', description: 'Gọi điện về thăm nhà' },
          { id: 'personal-29', name: 'Teaching a Child', description: 'Dạy con học bài hoặc giải thích vì sao bầu trời màu xanh' },
          { id: 'personal-30', name: 'Talking to a Sibling', description: 'Cãi nhau với anh/chị em ruột hoặc tâm sự' },
          { id: 'personal-31', name: 'Dealing with Neighbors', description: 'Phàn nàn hàng xóm ồn ào hoặc xin chút đường' },
          { id: 'personal-32', name: 'Medical Appointment', description: 'Đi khám bác sĩ, mô tả triệu chứng bệnh' },
          { id: 'personal-33', name: 'Opening a Bank Account', description: 'Ra ngân hàng mở thẻ, hỏi lãi suất' },
          { id: 'personal-34', name: 'Haircut Salon', description: 'Chỉ dẫn thợ cắt tóc kiểu mình muốn (Undercut/Fade)' },
          { id: 'personal-35', name: 'Renting an Apartment', description: 'Xem nhà, hỏi chủ nhà về điện nước, hợp đồng' },
          { id: 'personal-36', name: 'Job Interview (HR Round)', description: 'Phỏng vấn xin việc, giới thiệu bản thân' },
          { id: 'personal-37', name: 'Salary Negotiation', description: 'Đàm phán lương với HR' },
          { id: 'personal-38', name: 'Resignation', description: 'Xin nghỉ việc, nói chuyện với sếp' },
          { id: 'personal-39', name: 'Buying a House', description: 'Bàn với môi giới bất động sản' },
          { id: 'personal-40', name: 'Mid-life Crisis', description: 'Tâm sự về khủng hoảng tuổi trung niên, định hướng tương lai' },
        ],
      },
    ],
  },
];

/**
 * Tìm kiếm scenarios theo keyword
 * 
 * @param keyword - Từ khóa tìm kiếm
 * @returns Danh sách scenarios match với keyword
 */
export function searchScenarios(keyword: string) {
  const lowerKeyword = keyword.toLowerCase();
  const results: { category: TopicCategory; subCategory: typeof TOPIC_CATEGORIES[0]['subCategories'][0]; scenario: typeof TOPIC_CATEGORIES[0]['subCategories'][0]['scenarios'][0] }[] = [];

  for (const category of TOPIC_CATEGORIES) {
    for (const subCategory of category.subCategories) {
      for (const scenario of subCategory.scenarios) {
        if (
          scenario.name.toLowerCase().includes(lowerKeyword) ||
          scenario.description.toLowerCase().includes(lowerKeyword)
        ) {
          results.push({ category, subCategory, scenario });
        }
      }
    }
  }

  return results;
}

/**
 * Lấy tổng số scenarios
 */
export function getTotalScenarios(): number {
  return TOPIC_CATEGORIES.reduce(
    (total, category) =>
      total +
      category.subCategories.reduce(
        (subTotal, sub) => subTotal + sub.scenarios.length,
        0
      ),
    0
  );
}
