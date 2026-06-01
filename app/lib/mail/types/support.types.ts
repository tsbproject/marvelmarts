export interface SupportReceivedData {
  to: string;

  ticketId: string;
  subject: string;
  priority: string;
}

export interface SupportProgressData {
  to: string;

  ticketId: string;
  subject: string;
  status: string;
  message: string;
}

export interface SupportResolvedData {
  to: string;

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