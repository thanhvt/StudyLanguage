/**
 * topic-data.ts - Full 140 scenarios data for Listening module
 * 
 * Purpose: Provide comprehensive topic scenarios organized by categories
 * Categories:
 *   - IT & Technology: 40 scenarios
 *   - Daily Survival: 60 scenarios
 *   - Personal Life: 40 scenarios
 */

import { TopicCategory } from '@/types/listening-types'

export const TOPIC_CATEGORIES: TopicCategory[] = [
  // ============================================
  // 💻 IT - CÔNG NGHỆ (40 scenarios)
  // ============================================
  {
    id: 'it',
    name: 'IT & Technology',
    icon: '💻',
    description: 'Tech meetings, product development, system architecture',
    subCategories: [
      {
        id: 'agile',
        name: 'Agile Ceremonies',
        scenarios: [
          { id: 'it-1', name: 'Daily Stand-up Update', description: 'Quick report on yesterday, today, and blockers' },
          { id: 'it-2', name: 'Sprint Planning - Estimation', description: 'Debating story points, boss pushing for faster delivery' },
          { id: 'it-3', name: 'Sprint Retrospective', description: 'Discussing production incident, finding root cause' },
          { id: 'it-4', name: 'Backlog Grooming', description: 'Clarifying requirements for incomplete user stories' },
          { id: 'it-5', name: 'Demo Day Presentation', description: 'Showcasing new features to stakeholders' },
        ],
      },
      {
        id: 'technical',
        name: 'Technical Discussions',
        scenarios: [
          { id: 'it-6', name: 'Database Schema Review', description: 'Debating table relationships and index placement' },
          { id: 'it-7', name: 'API Contract Negotiation', description: 'Frontend needs more fields, Backend defends performance' },
          { id: 'it-8', name: 'Third-party Integration', description: 'Discussing Stripe/PayPal payment gateway integration' },
          { id: 'it-9', name: 'Handling Technical Debt', description: 'Convincing PM to allocate time for refactoring' },
          { id: 'it-10', name: 'Fixing a Critical Bug', description: 'Emergency war room meeting to fix critical issue' },
        ],
      },
      {
        id: 'features',
        name: 'Specific Features',
        scenarios: [
          { id: 'it-11', name: 'Implementing RBAC', description: 'Role-based access control: Admin, Editor, Viewer' },
          { id: 'it-12', name: 'Real-time Notification System', description: 'Designing WebSocket vs Polling notifications' },
          { id: 'it-13', name: 'Search Optimization', description: 'Improving search speed: Elasticsearch vs SQL' },
          { id: 'it-14', name: 'File Upload & Processing', description: 'Handling image uploads, resizing, S3 storage' },
          { id: 'it-15', name: 'Offline Mode Support', description: 'Mobile app solutions for network loss' },
          { id: 'it-16', name: 'Multi-language Support (i18n)', description: 'Planning system internationalization' },
        ],
      },
      {
        id: 'performance',
        name: 'Performance & Security',
        scenarios: [
          { id: 'it-17', name: 'Performance Bottleneck', description: 'Slow API, discussing Redis caching or query optimization' },
          { id: 'it-18', name: 'Security Audit Response', description: 'Fixing vulnerabilities after penetration test report' },
          { id: 'it-19', name: 'Black Friday Scalability', description: 'Preparing system for traffic surge' },
          { id: 'it-20', name: 'Legacy Code Migration', description: 'Planning PHP to Node.js module migration' },
        ],
      },
      {
        id: 'architecture',
        name: 'Architecture Patterns',
        scenarios: [
          { id: 'it-21', name: 'Monolith vs Microservices', description: 'Should we break the system into microservices?' },
          { id: 'it-22', name: 'Event-Driven Architecture', description: 'Async processing with Kafka/RabbitMQ' },
          { id: 'it-23', name: 'Serverless vs Containers', description: 'Choosing AWS Lambda or Kubernetes' },
          { id: 'it-24', name: 'GraphQL vs REST API', description: 'Mobile team wants GraphQL, Backend prefers REST' },
          { id: 'it-25', name: 'Multi-tenant Architecture', description: 'SaaS database design: shared or separate DBs' },
        ],
      },
      {
        id: 'database',
        name: 'Database & Data',
        scenarios: [
          { id: 'it-26', name: 'SQL vs NoSQL', description: 'Choosing Postgres or MongoDB for the project' },
          { id: 'it-27', name: 'Caching Strategy', description: 'Write-through vs Write-back with Redis/Memcached' },
          { id: 'it-28', name: 'Data Warehousing', description: 'Data pipeline from app to Snowflake/BigQuery' },
          { id: 'it-29', name: 'Database Sharding', description: '10TB+ database, how to shard effectively' },
          { id: 'it-30', name: 'Disaster Recovery Plan', description: 'Recovery plan when data center goes down' },
        ],
      },
      {
        id: 'devops',
        name: 'Cloud & DevOps',
        scenarios: [
          { id: 'it-31', name: 'CI/CD Pipeline Design', description: 'Blue-Green vs Canary deployment strategies' },
          { id: 'it-32', name: 'Container Orchestration', description: 'Discussing Kubernetes operational challenges' },
          { id: 'it-33', name: 'Cloud Cost Optimization', description: 'AWS bill too high, finding ways to reduce costs' },
          { id: 'it-34', name: 'Infrastructure as Code', description: 'Converting manual setup to Terraform/Ansible' },
          { id: 'it-35', name: 'Monitoring & Observability', description: 'Choosing ELK Stack or Prometheus/Grafana' },
        ],
      },
      {
        id: 'advanced',
        name: 'Advanced Topics',
        scenarios: [
          { id: 'it-36', name: 'Authentication System', description: 'Build custom or use Auth0/Cognito/Keycloak' },
          { id: 'it-37', name: 'Real-time Chat Architecture', description: 'Designing chat backend for millions of users' },
          { id: 'it-38', name: 'Video Streaming Architecture', description: 'CDN, transcoding, video delivery system' },
          { id: 'it-39', name: 'Rate Limiting & Anti-DDoS', description: 'Designing gateway to block spam requests' },
          { id: 'it-40', name: 'AI/ML Integration', description: 'Integrating AI modules, latency concerns' },
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
    description: 'Airport, supermarket, street, travel, business trips',
    subCategories: [
      {
        id: 'airport',
        name: 'Airport & Flight',
        scenarios: [
          { id: 'daily-1', name: 'Check-in & Seat Selection', description: 'Requesting window or aisle seat' },
          { id: 'daily-2', name: 'Overweight Baggage', description: 'Luggage over limit, negotiating or asking fees' },
          { id: 'daily-3', name: 'Security Check', description: 'Held by security for water bottle or metal object' },
          { id: 'daily-4', name: 'Lost Gate/Gate Change', description: 'Cannot find gate, hearing gate change announcement' },
          { id: 'daily-5', name: 'Missed Connection', description: 'Missed connecting flight due to delay' },
          { id: 'daily-6', name: 'Lost Luggage Report', description: 'Reporting missing baggage at Lost & Found' },
          { id: 'daily-7', name: 'Visa & Immigration', description: 'Answering customs questions about trip purpose' },
          { id: 'daily-8', name: 'Customs Declaration', description: 'Declaring goods, carrying too much cash/wine/tobacco' },
          { id: 'daily-9', name: 'Buying a SIM Card', description: 'Purchasing 4G SIM at airport' },
          { id: 'daily-10', name: 'Currency Exchange', description: 'Exchanging money, asking about exchange rate' },
          { id: 'daily-11', name: 'Flight Delayed/Cancelled', description: 'Requesting hotel or meal voucher for delay' },
          { id: 'daily-12', name: 'Upgrading Class', description: 'Asking price to upgrade to business class' },
          { id: 'daily-13', name: 'Asking for Amenities', description: 'Requesting blanket, pillow, headphones on plane' },
          { id: 'daily-14', name: 'Sick Passenger', description: 'Reporting feeling unwell/stomach ache on flight' },
          { id: 'daily-15', name: 'Taxi Queue', description: 'Asking where to catch Taxi/Uber at arrivals' },
          { id: 'daily-16', name: 'Lounge Access', description: 'Asking directions to VIP lounge' },
          { id: 'daily-17', name: 'Duty Free Shopping', description: 'Buying duty-free, asking carry-on regulations' },
          { id: 'daily-18', name: 'Helping Someone', description: 'Helping elderly person put luggage in overhead cabin' },
          { id: 'daily-19', name: 'Complaining about Service', description: 'Complaining about broken seat or screen' },
          { id: 'daily-20', name: 'Final Boarding Call', description: 'Running to gate after hearing final call' },
        ],
      },
      {
        id: 'shopping',
        name: 'Supermarket & Shopping',
        scenarios: [
          { id: 'daily-21', name: 'Asking for Location', description: 'Asking which aisle an item is in' },
          { id: 'daily-22', name: 'Checking Freshness', description: 'Asking staff if fruit/meat is fresh' },
          { id: 'daily-23', name: 'Weighing Produce', description: 'Self-weighing vegetables and getting price tag' },
          { id: 'daily-24', name: 'Asking about Ingredients', description: 'Asking if cake contains peanuts (allergy)' },
          { id: 'daily-25', name: 'Out of Stock Items', description: 'Asking when new stock will arrive' },
          { id: 'daily-26', name: 'Price Check', description: 'Shelf price differs from scanned price' },
          { id: 'daily-27', name: 'Using Coupons/Vouchers', description: 'Using discount codes, membership cards' },
          { id: 'daily-28', name: 'Payment Method', description: 'Card machine error, asking about cash or Apple Pay' },
          { id: 'daily-29', name: 'Return & Refund', description: 'Returning shirt that does not fit, requesting refund' },
          { id: 'daily-30', name: 'Fitting Room', description: 'Asking to use the fitting room' },
          { id: 'daily-31', name: 'Bargaining at Market', description: 'Negotiating price at street market' },
          { id: 'daily-32', name: 'Buying Electronics', description: 'Asking about warranty and return policy' },
          { id: 'daily-33', name: 'Buying Souvenirs', description: 'Asking for local specialty gift recommendations' },
          { id: 'daily-34', name: 'Self-Checkout', description: 'Getting error at self-checkout machine' },
          { id: 'daily-35', name: 'Asking for a Bag', description: 'Requesting plastic bag (usually extra charge)' },
          { id: 'daily-36', name: 'Sampling Food', description: 'Asking to taste food samples in supermarket' },
          { id: 'daily-37', name: 'Buying Medicine', description: 'Buying headache/cold medicine at pharmacy' },
          { id: 'daily-38', name: 'Ordering Delivery', description: 'Requesting home delivery for bulky items' },
          { id: 'daily-39', name: 'Tax Refund for Tourists', description: 'Processing tax refund when shopping' },
          { id: 'daily-40', name: 'Reporting Theft', description: 'Reporting pickpocket to mall security' },
        ],
      },
      {
        id: 'street',
        name: 'Street & Getting Around',
        scenarios: [
          { id: 'daily-41', name: 'Asking for Directions', description: 'Asking way to famous landmark' },
          { id: 'daily-42', name: 'Taking the Bus', description: 'Asking bus route, fare, and stops' },
          { id: 'daily-43', name: 'Taking the Subway', description: 'Buying subway ticket, asking for map' },
          { id: 'daily-44', name: 'Hailing a Taxi', description: 'Getting taxi, giving directions to driver' },
          { id: 'daily-45', name: 'Renting a Car/Bike', description: 'Renting self-drive car, asking about insurance' },
          { id: 'daily-46', name: 'Asking for a Photo', description: 'Asking stranger to take your photo' },
          { id: 'daily-47', name: 'Finding a Restroom', description: 'Asking for nearest public restroom' },
          { id: 'daily-48', name: 'Finding an ATM', description: 'Asking for nearest bank/ATM' },
          { id: 'daily-49', name: 'Reporting an Accident', description: 'Reporting traffic accident to police' },
          { id: 'daily-50', name: 'Asking for Recommendations', description: 'Asking locals for good restaurant nearby' },
          { id: 'daily-51', name: 'Lost & Confused', description: 'Lost, phone dead, asking for help' },
          { id: 'daily-52', name: 'Dealing with Scams', description: 'Politely declining pushy vendors' },
          { id: 'daily-53', name: 'Buying Street Food', description: 'Asking what dish is, if it is spicy' },
          { id: 'daily-54', name: 'Crossing the Street', description: 'Asking traffic officer how to cross safely' },
          { id: 'daily-55', name: 'Using Public Wifi', description: 'Asking for cafe wifi password' },
          { id: 'daily-56', name: 'Booking a Tour', description: 'Buying city tour at information desk' },
          { id: 'daily-57', name: 'Hotel Check-in', description: 'Checking in, complaining about dirty/noisy room' },
          { id: 'daily-58', name: 'Hotel Concierge', description: 'Asking concierge to book restaurant reservation' },
          { id: 'daily-59', name: 'Emergency Call', description: 'Calling 911 for emergency or fire' },
          { id: 'daily-60', name: 'Making Friends', description: 'Small talk with stranger on park bench' },
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
    description: 'Friends, family, relationships, personal matters',
    subCategories: [
      {
        id: 'friends',
        name: 'Socializing & Friends',
        scenarios: [
          { id: 'personal-1', name: 'Catching Up', description: 'Meeting old friend after 5 years' },
          { id: 'personal-2', name: 'Venting about Work', description: 'Complaining about boss, overtime, salary' },
          { id: 'personal-3', name: 'Planning a Trip', description: 'Planning road trip, discussing itinerary and budget' },
          { id: 'personal-4', name: 'Discussing Movies', description: 'Reviewing Netflix show (spoiler alert!)' },
          { id: 'personal-5', name: 'Giving Advice', description: 'Friend got cheated on, giving advice' },
          { id: 'personal-6', name: 'Borrowing Money', description: 'Tactfully asking to borrow money' },
          { id: 'personal-7', name: 'Inviting to a Party', description: 'Inviting friend to housewarming or birthday' },
          { id: 'personal-8', name: 'Declining an Invitation', description: 'Politely declining drinks due to health/busy' },
          { id: 'personal-9', name: 'Talking about Hobbies', description: 'Showing off new PC build or gaming setup' },
          { id: 'personal-10', name: 'Gossip', description: 'Chatting about mutual friend getting married' },
          { id: 'personal-11', name: 'Sports Talk', description: 'Discussing last night football match' },
          { id: 'personal-12', name: 'Tech Talk (Casual)', description: 'Debating iPhone vs Samsung, Mac vs Windows' },
          { id: 'personal-13', name: 'Talking about Food', description: 'Reviewing newly opened restaurant' },
          { id: 'personal-14', name: 'Fitness & Health', description: 'Inviting to gym, discussing diet/keto' },
          { id: 'personal-15', name: 'Sharing a Secret', description: 'Telling secret and warning not to spill beans' },
          { id: 'personal-16', name: 'Apologizing', description: 'Apologizing for being late or breaking something' },
          { id: 'personal-17', name: 'Complimenting', description: 'Complimenting friend on new clothes or haircut' },
          { id: 'personal-18', name: 'Discussing News', description: 'Discussing trending social media topics' },
          { id: 'personal-19', name: 'Asking for a Favor', description: 'Asking friend to watch dog for few days' },
          { id: 'personal-20', name: 'Saying Goodbye', description: 'Seeing off friend moving abroad (emotional)' },
        ],
      },
      {
        id: 'family',
        name: 'Personal & Family',
        scenarios: [
          { id: 'personal-21', name: 'First Date', description: 'First date, asking about interests and family' },
          { id: 'personal-22', name: 'Confessing Feelings', description: 'Confessing to crush (nervous, excited)' },
          { id: 'personal-23', name: 'Breakup Conversation', description: 'Breaking up peacefully or with argument' },
          { id: 'personal-24', name: 'Meeting the Parents', description: 'Meeting partner\'s parents for first time' },
          { id: 'personal-25', name: 'Marriage Proposal', description: 'Romantic marriage proposal' },
          { id: 'personal-26', name: 'Couple Fight', description: 'Arguing about who does dishes/cleaning' },
          { id: 'personal-27', name: 'Making Up', description: 'Making up after an argument' },
          { id: 'personal-28', name: 'Talking to Parents', description: 'Phone call checking in with parents' },
          { id: 'personal-29', name: 'Teaching a Child', description: 'Helping kid with homework or explaining why sky is blue' },
          { id: 'personal-30', name: 'Talking to Sibling', description: 'Arguing with or confiding in sibling' },
          { id: 'personal-31', name: 'Dealing with Neighbors', description: 'Complaining about noisy neighbor or borrowing sugar' },
          { id: 'personal-32', name: 'Medical Appointment', description: 'Visiting doctor, describing symptoms' },
          { id: 'personal-33', name: 'Opening Bank Account', description: 'Opening bank account, asking about interest rates' },
          { id: 'personal-34', name: 'Haircut Salon', description: 'Explaining desired hairstyle to barber (undercut/fade)' },
          { id: 'personal-35', name: 'Renting an Apartment', description: 'Viewing apartment, asking landlord about utilities' },
          { id: 'personal-36', name: 'Job Interview', description: 'HR interview, introducing yourself' },
          { id: 'personal-37', name: 'Salary Negotiation', description: 'Negotiating salary with HR' },
          { id: 'personal-38', name: 'Resignation', description: 'Resigning from job, talking to boss' },
          { id: 'personal-39', name: 'Buying a House', description: 'Discussing with real estate agent' },
          { id: 'personal-40', name: 'Mid-life Crisis', description: 'Discussing mid-life crisis and future direction' },
        ],
      },
    ],
  },
]

/**
 * Search scenarios by keyword
 */
export function searchScenarios(keyword: string) {
  const lowerKeyword = keyword.toLowerCase()
  const results: { 
    category: TopicCategory
    subCategory: TopicCategory['subCategories'][0]
    scenario: TopicCategory['subCategories'][0]['scenarios'][0] 
  }[] = []

  for (const category of TOPIC_CATEGORIES) {
    for (const subCategory of category.subCategories) {
      for (const scenario of subCategory.scenarios) {
        if (
          scenario.name.toLowerCase().includes(lowerKeyword) ||
          scenario.description.toLowerCase().includes(lowerKeyword)
        ) {
          results.push({ category, subCategory, scenario })
        }
      }
    }
  }

  return results
}

/**
 * Get total number of scenarios
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
  )
}

/**
 * Get scenarios for a specific category
 */
export function getScenariosByCategory(categoryId: string) {
  return TOPIC_CATEGORIES.find(c => c.id === categoryId)
}

/**
 * Get a random scenario
 */
export function getRandomScenario() {
  const allScenarios: { 
    category: TopicCategory
    subCategory: TopicCategory['subCategories'][0]
    scenario: TopicCategory['subCategories'][0]['scenarios'][0] 
  }[] = []

  for (const category of TOPIC_CATEGORIES) {
    for (const subCategory of category.subCategories) {
      for (const scenario of subCategory.scenarios) {
        allScenarios.push({ category, subCategory, scenario })
      }
    }
  }

  return allScenarios[Math.floor(Math.random() * allScenarios.length)]
}
