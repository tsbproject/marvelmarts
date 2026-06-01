export interface SupportReceivedData {
  email: string;
  ticketId: string;
  subject: string;
  priority: string;
}

export interface SupportProgressData {
  email: string;
  ticketId: string;
  subject: string;
  status: string;
  message: string;
}

export interface SupportResolvedData {
  email: string;
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