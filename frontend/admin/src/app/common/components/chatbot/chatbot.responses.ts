export interface ChatIntent {
  keywords: string[];
  response: string;
  quickReplies?: string[];
}


export const CHAT_INTENTS: ChatIntent[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greet', 'start', 'help'],
    response: '👋 Hello! I\'m the HomeCare Support Assistant. I can help you navigate the admin panel, manage bookings, customers, service partners, and more. What would you like to know?',
    quickReplies: ['How do I manage bookings?', 'How do I handle support tickets?', 'How do I approve a service partner?', 'Where can I see payments?'],
  },
  {
    keywords: ['booking', 'bookings', 'book', 'reservation', 'appointment', 'schedule'],
    response: '📅 **Booking Management** allows you to view and manage all bookings.\n\n• Go to **Booking Management** in the sidebar\n• You can view booking details, assign service experts, cancel bookings, or mark them as complete\n• Use the filter panel to search by date, status, or customer',
    quickReplies: ['How do I cancel a booking?', 'How do I change the expert?', 'How do I complete a booking?'],
  },
  {
    keywords: ['cancel booking', 'cancel a booking', 'cancel appointment', 'cancellation'],
    response: '❌ **To cancel a booking:**\n\n1. Go to **Booking Management** in the sidebar\n2. Find the booking you want to cancel\n3. Click on the booking to open its details\n4. Click the **Cancel Booking** button\n5. Confirm the cancellation in the dialog\n\nThe customer will be notified automatically.',
    quickReplies: ['How do I view booking details?', 'How do I assign an expert?', 'Go back to bookings'],
  },
  {
    keywords: ['change expert', 'assign expert', 'reassign', 'expert'],
    response: '🔄 **To change or assign a service expert:**\n\n1. Go to **Booking Management**\n2. Open the specific booking\n3. Click **Change Expert**\n4. Select an available expert from the list\n5. Confirm the change\n\nThe new expert will be assigned immediately.',
    quickReplies: ['How do I cancel a booking?', 'How do I complete a booking?'],
  },
  {
    keywords: ['complete booking', 'mark complete', 'finish booking'],
    response: '✅ **To mark a booking as complete:**\n\n1. Go to **Booking Management**\n2. Find the booking\n3. Open booking details\n4. Click **Mark as Complete**\n\nThis will update the booking status and trigger payment processing.',
    quickReplies: ['Where can I see payments?', 'How do I view booking details?'],
  },
  {
    keywords: ['customer', 'customers', 'client', 'clients', 'user', 'users'],
    response: '👥 **Customer Management** lets you manage all registered customers.\n\n• Navigate to **User Management → Customers** in the sidebar\n• View customer profiles, booking history, and contact details\n• Activate or deactivate customer accounts\n• Delete customer accounts if needed',
    quickReplies: ['How do I deactivate a customer?', 'How do I view customer bookings?', 'How do I delete a customer?'],
  },
  {
    keywords: ['deactivate customer', 'block customer', 'disable customer', 'customer status'],
    response: '🚫 **To deactivate a customer account:**\n\n1. Go to **User Management → Customers**\n2. Find the customer in the list\n3. Click on the customer to view their profile\n4. Toggle the **Active Status** switch to deactivate\n\nDeactivated customers cannot log in until reactivated.',
    quickReplies: ['How do I view customer bookings?', 'How do I delete a customer?'],
  },
  {
    keywords: ['service partner', 'service partners', 'partner', 'partners', 'expert', 'technician', 'approve partner', 'reject partner'],
    response: '🤝 **Service Partner Management** is under **User Management → Service Partners**.\n\n• View all registered service partners\n• **Approve** or **Reject** new partner applications\n• View partner details, assigned services, and attachments\n• Toggle partner active/inactive status\n• Delete partner accounts',
    quickReplies: ['How do I approve a service partner?', 'How do I reject a partner?', 'How do I assign services to a partner?'],
  },
  {
    keywords: ['approve service partner', 'approve partner', 'approve application'],
    response: '✅ **To approve a service partner:**\n\n1. Go to **User Management → Service Partners**\n2. Find the partner with **Pending** status\n3. Open their profile\n4. Review their details and attachments\n5. Click **Approve**\n\nThe partner will receive a confirmation notification.',
    quickReplies: ['How do I reject a partner?', 'How do I view partner details?'],
  },
  {
    keywords: ['reject partner', 'reject service partner', 'decline partner'],
    response: '❌ **To reject a service partner application:**\n\n1. Go to **User Management → Service Partners**\n2. Find the partner with **Pending** status\n3. Open their profile\n4. Click **Reject**\n5. Provide a reason for rejection\n\nThe applicant will be notified with your reason.',
    quickReplies: ['How do I approve a service partner?', 'How do I view all partners?'],
  },
  {
    keywords: ['payment', 'payments', 'transaction', 'transactions', 'revenue', 'money', 'invoice', 'billing'],
    response: '💳 **Payments & Transactions** are available in the **Payment & Transaction** section.\n\n• View all payment records with status\n• Filter by date range, amount, or payment method\n• Click any transaction to view full details\n• The Dashboard also shows revenue overview charts',
    quickReplies: ['How do I see total revenue?', 'How do I view a specific transaction?', 'Where is the revenue chart?'],
  },
  {
    keywords: ['support', 'support ticket', 'support tickets', 'contact us', 'complaint', 'issue', 'ticket'],
    response: '🎧 **Support Tickets** are managed in the **Support** section.\n\n• All customer contact-us submissions appear here\n• You can view the message, customer details, and submission date\n• Respond to tickets and update their status\n• Filter tickets by date or status',
    quickReplies: ['How do I respond to a ticket?', 'How do I filter tickets?', 'Where is the Support section?'],
  },
  {
    keywords: ['offer', 'offers', 'discount', 'promo', 'coupon', 'voucher', 'promotion'],
    response: '🏷️ **Offers** can be managed in the **Offers** section of the sidebar.\n\n• Create new discount offers\n• Set offer codes, discount percentages, and validity dates\n• View all active and expired offers\n• Edit or delete existing offers\n• Offers are automatically applied during customer checkout',
    quickReplies: ['How do I create an offer?', 'How do I delete an offer?', 'How do I edit an offer?'],
  },
  {
    keywords: ['create offer', 'add offer', 'new offer', 'add discount'],
    response: '➕ **To create a new offer:**\n\n1. Go to **Offers** in the sidebar\n2. Click **Add Offer** button\n3. Fill in the offer code, discount %, start & end dates\n4. Click **Save**\n\nThe offer will be immediately available for customers at checkout.',
    quickReplies: ['How do I edit an offer?', 'How do I delete an offer?'],
  },
  {
    keywords: ['service', 'services', 'service management', 'add service', 'create service'],
    response: '🔧 **Service Management** lets you manage all HomeCare services.\n\n• View all services listed on the platform\n• Add new services with descriptions, prices, and images\n• Edit or delete existing services\n• Manage service availability by time slots\n• Organize services by **Service Type** and **Category**',
    quickReplies: ['How do I add a new service?', 'How do I manage service types?', 'How do I set availability?'],
  },
  {
    keywords: ['master data', 'category', 'categories', 'subcategory', 'service type'],
    response: '🗂️ **Master Data** manages the core data structures:\n\n• **Service Types** — Top-level service groupings (e.g., Cleaning, Plumbing)\n• **Categories** — Sub-groupings under each service type\n• **Sub-categories** — Further breakdowns within categories\n\nAccess it via **Master Data** in the sidebar.',
    quickReplies: ['How do I add a service type?', 'How do I add a category?'],
  },
  {
    keywords: ['dashboard', 'home', 'overview', 'stats', 'statistics', 'analytics', 'report'],
    response: '📊 **Dashboard** gives you a real-time overview of HomeCare\'s performance:\n\n• **Total Services Booked** — All-time booking count\n• **Active Users** — Currently active customers\n• **Active Service Partners** — Available experts\n• **Total Revenue** — Earnings overview\n• **Revenue Chart** — Monthly revenue trend\n• **City Bookings** — Bookings by location\n• **Top Services** & **Top Partners** — Performance leaders',
    quickReplies: ['Where are payment details?', 'How do I manage bookings?'],
  },
  {
    keywords: ['admin user', 'admin users', 'create admin', 'add admin', 'admin account'],
    response: '👨‍💼 **Admin Users** are managed under **User Management → Admin Users**.\n\n• View all admin accounts\n• Create new admin users\n• Edit admin details\n• Change passwords\n• Delete admin accounts\n\nOnly super admins can create or delete other admin accounts.',
    quickReplies: ['How do I create an admin user?', 'How do I change a password?'],
  },
  {
    keywords: ['profile', 'my profile', 'account', 'settings', 'change password', 'update profile'],
    response: '⚙️ **Your Profile** is accessible from the top-right corner of the navbar.\n\n• Update your name and contact information\n• Change your password\n• Upload a profile picture\n\nAll changes are saved immediately.',
    quickReplies: ['How do I change my password?', 'How do I update my name?'],
  },
  {
    keywords: ['notification', 'notifications', 'bell', 'new booking', 'alert'],
    response: '🔔 **Notifications** appear in real-time via SignalR.\n\n• You\'ll see a notification bell in the top navbar\n• New bookings trigger instant notifications\n• Click the bell to view recent notifications\n\nThis uses a real-time connection — no page refresh needed.',
    quickReplies: ['How do I manage bookings?', 'How do I view booking details?'],
  },
  {
    keywords: ['logout', 'log out', 'sign out', 'signout'],
    response: '🚪 **To log out:**\n\n1. Click your **profile icon** in the top-right of the navbar\n2. Select **Logout** from the dropdown menu\n\nYou\'ll be redirected to the login page.',
    quickReplies: ['How do I update my profile?', 'How do I change my password?'],
  },
  {
    keywords: ['navigate', 'navigation', 'where', 'find', 'go to', 'how to get'],
    response: '🧭 **Navigation Guide:**\n\n• **Dashboard** — Home overview\n• **Service Management** — Manage services\n• **User Management** — Customers, Partners, Admin Users\n• **Booking Management** — All bookings\n• **Offers** — Discount codes\n• **Payment & Transaction** — Financial records\n• **Master Data** — Service types & categories\n• **Support** — Customer support tickets\n\nAll sections are accessible from the **left sidebar**.',
    quickReplies: ['How do I manage bookings?', 'Where is Support?', 'Where are Payments?'],
  },
  {
    keywords: ['thank', 'thanks', 'thank you', 'great', 'awesome', 'perfect', 'helpful', 'good'],
    response: '😊 You\'re welcome! I\'m always here if you need more help. Is there anything else I can assist you with?',
    quickReplies: ['How do I manage bookings?', 'Show me navigation guide', 'How do I handle support tickets?'],
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'exit', 'close'],
    response: '👋 Goodbye! Have a great day managing HomeCare. Feel free to come back anytime you need help!',
    quickReplies: [],
  },
  {
    keywords: ['refund', 'refunds', 'money back', 'return money', 'reimburse'],
    response: '💰 **Refund Process:**\n\nRefunds are handled through the **Payment & Transaction** section:\n\n1. Go to **Payment & Transaction** in the sidebar\n2. Find the relevant transaction\n3. Click on it to view full details\n4. If eligible, contact the customer and process the refund manually\n\nNote: Ensure the booking is cancelled before initiating any refund.',
    quickReplies: ['Where can I see payments?', 'How do I cancel a booking?', 'How do I view transactions?'],
  },
  {
    keywords: ['notification', 'notify customer', 'send notification', 'alert customer', 'message customer'],
    response: '🔔 **Sending Notifications to Customers:**\n\nCurrently, notifications are sent automatically by the system when:\n\n• A booking is **confirmed or cancelled**\n• A **service expert is assigned or changed**\n• A booking is **marked as complete**\n• An **offer** is applicable\n\nReal-time notifications for admins are delivered via **SignalR** (the bell icon in the navbar).',
    quickReplies: ['How do I manage bookings?', 'How do I change the expert?'],
  },
  {
    keywords: ['report', 'reports', 'generate report', 'export', 'analytics', 'download data'],
    response: '📊 **Reports & Analytics:**\n\nYou can view performance data from the **Dashboard**:\n\n• **Revenue Overview** — Monthly revenue chart\n• **Top Performing Services** — Most booked services\n• **City Bookings Chart** — Geographic booking distribution\n• **Top Service Partners** — Best-rated experts\n\nFor detailed transaction data, visit **Payment & Transaction** where you can view and filter all records.',
    quickReplies: ['Where is the Dashboard?', 'Where can I see payments?', 'How do I view top services?'],
  },
  {
    keywords: ['reset password', 'forgot password', 'customer password', 'change customer password', 'unlock account'],
    response: '🔑 **Password Reset:**\n\n**For your own admin password:**\n1. Click your **Profile** in the top-right navbar\n2. Go to **Profile Settings**\n3. Click **Change Password**\n\n**For customer accounts:**\nCustomers can reset their own password from the customer app login page using **Forgot Password**. Admins cannot directly reset customer passwords from the admin panel.',
    quickReplies: ['How do I update my profile?', 'How do I manage customers?'],
  },
];

export const FALLBACK_RESPONSE = '🤔 I\'m not sure about that. Here are some things I can help you with:';

export const FALLBACK_QUICK_REPLIES = [
  'How do I manage bookings?',
  'How do I handle support tickets?',
  'How do I approve a service partner?',
  'Where can I see payments?',
  'Show me navigation guide',
];

export const WELCOME_MESSAGE = '🏠 Welcome to HomeCare Admin! I\'m your smart support assistant. Ask me anything about managing bookings, customers, partners, payments, and more!';

export const SUGGESTED_QUESTIONS = [
  'How do I manage bookings?',
  'How do I approve a service partner?',
  'How do I process a refund?',
  'How do I handle support tickets?',
];
