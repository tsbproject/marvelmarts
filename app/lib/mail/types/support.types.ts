export interface SupportReceivedData {
  ticketId: string;
  subject: string;
  priority: string;
}

export interface SupportProgressData {
  ticketId: string;
  subject: string;
  status: string;
  message: string;
}

export interface SupportResolvedData {
  ticketId: string;
  subject: string;
  message: string;
}

export interface AdminTicketData {
  ticketId: string;
  subject: string;
  category: string;
  priority: string;
  email: string;
}