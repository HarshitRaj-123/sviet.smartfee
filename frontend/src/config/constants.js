export const ENCRYPTION_KEY = import.meta.env.VITE_CRYPTO_SECRET
export const TOKEN_VERSION = 'v1'
export const REFRESH_TOKEN_KEY = 'refresh_token'
export const ACCESS_TOKEN_KEY = 'access_token'
export const SESSION_TIMEOUT = 900000 // 15 minutes in milliseconds

export const ROLES = {
  ADMIN: 'admin',
  ACCOUNTANT: 'accountant',
  STUDENT: 'student'
}

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.ACCOUNTANT]: 2,
  [ROLES.STUDENT]: 1
}

// Detailed permission mapping
export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    dashboard: ["view_stats", "view_notifications", "view_logs"],
    institute_profile: ["view", "edit", "upload_logo", "update_bank_details"],
    users: {
      students: ["view", "add", "edit", "delete", "import_bulk", "export_data"],
      accountants: ["view", "add", "edit", "delete"],
      admins: ["view"], // admins can only view other admins, not modify them
    },
    fee_management: {
      fee_structures: ["create", "edit", "delete", "view", "assign_to_class"],
      fee_collections: ["view", "generate_invoice", "mark_paid", "mark_unpaid", "refund", "partial_payment"],
      discounts: ["create", "edit", "assign", "remove"],
      fine_management: ["add", "edit", "remove"],
      payment_modes: ["configure", "disable", "enable"]
    },
    transactions: ["view_all", "filter_by_class", "download_report", "view_receipt", "edit_transaction", "delete_transaction"],
    announcements: ["create", "edit", "delete", "send_to_roles"],
    reports: ["generate_fee_report", "generate_student_report", "export_csv", "export_pdf"],
    notifications: ["send_sms", "send_email", "send_inapp", "configure_templates"],
    settings: {
      general: ["edit_institute_info", "change_logo", "enable_payment_gateways"],
      security: ["manage_roles", "view_activity_logs"],
      integrations: ["configure_smtp", "configure_sms", "configure_payment_gateways"],
      audit: ["view", "download"]
    }
  },
  [ROLES.ACCOUNTANT]: {
    dashboard: ["view_stats", "view_notifications"],
    fee_management: {
      fee_structures: ["view"],
      fee_collections: ["view", "generate_invoice", "mark_paid", "mark_unpaid", "refund", "partial_payment"],
      discounts: ["assign"],
      fine_management: ["add", "edit", "remove"],
      payment_modes: ["view"]
    },
    transactions: ["view_own", "download_own_reports", "view_receipt"],
    students: ["view_basic_info", "view_fee_info"],
    announcements: ["view"],
    notifications: ["send_sms", "send_email", "send_inapp"],
    settings: {
      payment: ["view_gateway_status"]
    },
    profile: ["view", "edit"] // for self
  },
  [ROLES.STUDENT]: {
    dashboard: ["view_stats", "view_announcements"],
    profile: ["view", "edit_contact_info"],
    fee: {
      view_fee_structure: true,
      view_due_fees: true,
      pay_online: true,
      view_payment_history: true,
      download_receipts: true
    },
    notifications: ["receive_sms", "receive_email", "receive_inapp"],
    announcements: ["view"],
    support: ["create_ticket", "view_ticket_status"]
  }
}