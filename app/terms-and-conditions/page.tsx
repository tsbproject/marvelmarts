import React from 'react';
import { 
  Scale, UserCheck, Database, Ban, CreditCard, ShieldAlert, 
  ExternalLink, RotateCcw, HelpCircle, FileText, Globe, Gavel 
} from 'lucide-react';

export default function TermsAndConditions() {
  const sections = [
    { id: 'agreement', title: 'Terms & Conditions Agreement', icon: <FileText size={18} /> },
    { id: 'accounts', title: 'Accounts & Membership', icon: <UserCheck size={18} /> },
    { id: 'user-content', title: 'User Content', icon: <Database size={18} /> },
    { id: 'adult-content', title: 'Adult Content', icon: <Ban size={18} /> },
    { id: 'billing', title: 'Billing & Payments', icon: <CreditCard size={18} /> },
    { id: 'accuracy', title: 'Accuracy of Information', icon: <HelpCircle size={18} /> },
    { id: 'third-party', title: 'Third Party Services', icon: <ExternalLink size={18} /> },
    { id: 'backups', title: 'Backups & Liability', icon: <RotateCcw size={18} /> },
    { id: 'returns', title: 'Returns & Refunds', icon: <RotateCcw size={18} /> },
    { id: 'marketplace-role', title: 'Marketplace Role', icon: <Globe size={18} /> },
    { id: 'prohibited', title: 'Prohibited Uses', icon: <Ban size={18} /> },
    { id: 'liability', title: 'Limitation of Liability', icon: <ShieldAlert size={18} /> },
    { id: 'dispute', title: 'Dispute Resolution', icon: <Gavel size={18} /> },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Hero Header */}
      <header className="bg-white border-b border-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100 mb-6">
            <Scale size={14} className="text-[#F7931E]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F7931E]">
              Legal Governance Framework
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-gray-900 mb-4">
            Terms of <span className="text-[#002B5B]">Service</span>
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 max-w-xl mx-auto leading-relaxed">
            This document governs the relationship between you and MarvelMarts Inc. 
            Last Protocol Update: March 23, 2026.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        {/* Sticky Legal Navigation */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24 space-y-1 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4 px-3 italic">Index of Clauses</p>
            {sections.map((s) => (
              <a 
                key={s.id} 
                href={`#${s.id}`} 
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-50 hover:text-[#002B5B] transition-all"
              >
                {s.icon}
                <span className="truncate">{s.title}</span>
              </a>
            ))}
          </div>
        </aside>

        {/* Main Terms Content */}
        <main className="flex-1 bg-white rounded-[2.5rem] p-8 md:p-16 shadow-sm border border-gray-100 prose prose-slate prose-sm max-w-none">
          
          <section id="agreement" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Terms and conditions</h2>
            <p>These terms and conditions (“Agreement”) set forth the general terms and conditions of your use of the marvelmarts.com website (“Website”), “MarvelMarts” mobile application (“Mobile Application”) and any of their related products and services (collectively, “Services”). This Agreement is legally binding between you (“User”, “you” or “your”) and Marvel Marts Inc. (“Marvel Marts Inc.”, “we”, “us” or “our”).</p>
            <p>By accessing and using the Services, you acknowledge that you have read, understood, and agree to be bound by the terms of this Agreement. If you are entering into this Agreement on behalf of a business or other legal entity, you represent that you have the authority to bind such entity to this Agreement, in which case the terms “User”, “you” or “your” shall refer to such entity. If you do not have such authority, or if you do not agree with the terms of this Agreement, you must not accept this Agreement and may not access and use the Services. You acknowledge that this Agreement is a contract between you and Marvel Marts Inc., even though it is electronic and is not physically signed by you, and it governs your use of the Services.</p>
          </section>

          <section id="accounts" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Accounts and membership</h2>
            <p className="font-bold">You must be at least 18 years of age to use the Services.</p>
            <p>By using the Services and by agreeing to this Agreement you warrant and represent that you are at least 18 years of age. If you create an account on the Services, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account and any other actions taken in connection with it.</p>
            <p>We may, but have no obligation to, monitor and review new accounts before you may sign in and start using the Services. Providing false contact information of any kind may result in the termination of your account. You must immediately notify us of any unauthorized uses of your account or any other breaches of security. We will not be liable for any acts or omissions by you, including any damages of any kind incurred as a result of such acts or omissions. We may suspend, disable, or delete your account (or any part thereof) if we determine that you have violated any provision of this Agreement or that your conduct or content would tend to damage our reputation and goodwill. If we delete your account for the foregoing reasons, you may not re-register for our Services. We may block your email address and Internet protocol address to prevent further registration.</p>
          </section>

          <section id="user-content" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">User content</h2>
            <p>We do not own any data, information or material (collectively, “Content”) that you submit on the Services in the course of using the Service. You shall have sole responsibility for the accuracy, quality, integrity, legality, reliability, appropriateness, and intellectual property ownership or right to use of all submitted Content. We may, but have no obligation to, monitor and review the Content on the Services submitted or created using our Services by you.</p>
            <p>You grant us permission to access, copy, distribute, store, transmit, reformat, display and perform the Content of your user account solely as required for the purpose of providing the Services to you. Without limiting any of those representations or warranties, we have the right, though not the obligation to, in our own sole discretion, refuse or remove any Content that, in our reasonable opinion, violates any of our policies or is in any way harmful or objectionable. You also grant us the license to use, reproduce, adapt, modify, publish or distribute the Content created by you or stored in your user account for commercial, marketing or any similar purpose.</p>
          </section>

          <section id="adult-content" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Adult content</h2>
            <p>Please be aware that there may be certain adult or mature content available on the Services. Where there is mature or adult content, individuals who are less than 18 years of age or are not permitted to access such content under the laws of any applicable jurisdiction may not access such content. If we learn that anyone under the age of 18 seeks to conduct a transaction through the Services, we will require verified parental consent, in accordance with the Children’s Online Privacy Protection Act of 1998 (“COPPA”). Certain areas of the Services may not be available to children under 18 under any circumstances.</p>
          </section>

          <section id="billing" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Billing and payments</h2>
            <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 mb-4">
              <p>You shall pay all fees or charges to your account in accordance with the fees, charges, and billing terms in effect at the time a fee or charge is due and payable. If, in our judgment, your purchase constitutes a high-risk transaction, we will require you to provide us with a copy of your valid government-issued photo identification, and possibly a copy of a recent bank statement for the credit or debit card used for the purchase.</p>
            </div>
            <p>We reserve the right to change products and product pricing at any time. We also reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/phone number provided at the time the order was made.</p>
          </section>

          <section id="accuracy" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Accuracy of information</h2>
            <p>Occasionally there may be information on the Services that contains typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, availability, promotions and offers. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders if any information on the Services or Services is inaccurate at any time without prior notice (including after you have submitted your order).</p>
          </section>

          <section id="returns" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Returns and Refunds</h2>
            <div className="space-y-4">
              <p><strong>1.</strong> Returns of products by buyers and acceptance of returned products by sellers shall be managed by us in accordance with the returns page on the marketplace, as may be amended from time to time. Acceptance of returns shall be in our discretion, subject to compliance with applicable laws of the territory.</p>
              <p><strong>2.</strong> Refunds in respect of returned products shall be managed in accordance with the refunds page on the marketplace, as may be amended from time to time. Our rules on refunds shall be exercised in our discretion, subject to applicable laws of the territory. We may offer refunds, in our discretion:</p>
              <ul className="list-disc pl-8 text-[12px] font-bold uppercase tracking-tight text-gray-600">
                <li>in respect of the product price;</li>
                <li>local and/or international shipping fees (as stated on the refunds page); and</li>
                <li>by way of store credits, wallet refunds, vouchers, mobile money transfer, bank transfers or such other method as we may determine from time to time.</li>
              </ul>
              <p><strong>3.</strong> Returned products shall be accepted and refunds issued by Marvelmarts, for and on behalf of the seller.</p>
              <p><strong>4.</strong> Changes to our returns page or refunds page shall be effective in respect of all purchases made from the date of publication of the change on our website.</p>
            </div>
          </section>

          <section id="marketplace-role" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">MarvelMarts.com role as a marketplace</h2>
            <p className="mb-4">You acknowledge that we do not confirm the identity of all marketplace users, check their credit worthiness, or otherwise vet them. We are not party to any contract for the sale or purchase of products advertised on the marketplace.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100">
                <p className="text-[11px] font-black text-orange-800 uppercase italic">Limited Warranty Disclaimer</p>
                <p className="text-[12px] mt-2">We do not warrant the completeness or accuracy of information published on our marketplace; that the material is up to date; or that the marketplace will operate without fault.</p>
              </div>
              <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[11px] font-black text-blue-800 uppercase italic">Service Availability</p>
                <p className="text-[12px] mt-2">We reserve the right to discontinue or alter any or all of our services at any time in our sole discretion without notice or explanation.</p>
              </div>
            </div>
          </section>

          <section id="prohibited" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Prohibited uses</h2>
            <p>You are prohibited from using the Services or Content: (a) for any unlawful purpose; (b) to solicit others to perform unlawful acts; (c) to violate regulations; (d) to infringe upon intellectual property; (e) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability; (f) to submit false information; (g) to upload viruses; (h) to spam, phish, or scrape; (i) for obscene or immoral purposes; or (j) to interfere with security features.</p>
          </section>

          <section id="liability" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Limitation of liability</h2>
            <p className="uppercase font-bold text-red-700 text-xs tracking-tight">To the fullest extent permitted by applicable law, in no event will Marvel Marts Inc. be liable for indirect, incidental, special, punitive, cover or consequential damages.</p>
            <p>The aggregate liability of Marvel Marts Inc. and its affiliates relating to the services will be limited to an amount greater of one dollar or any amounts actually paid in cash by you to Marvel Marts Inc. for the prior one month period prior to the first event or occurrence giving rise to such liability.</p>
          </section>

          <section id="dispute" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Dispute resolution</h2>
            <p>The formation, interpretation, and performance of this Agreement and any disputes arising out of it shall be governed by the substantive and procedural laws of **Nigeria**. The exclusive jurisdiction and venue for actions related to the subject matter hereof shall be the courts located in Nigeria, and you hereby submit to the personal jurisdiction of such courts. You hereby waive any right to a jury trial in any proceeding arising out of or related to this Agreement.</p>
          </section>

          {/* Final Clauses and Contact */}
          <section className="pt-12 border-t border-gray-100">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">Acceptance of these terms</h3>
            <p>You acknowledge that you have read this Agreement and agree to all its terms and conditions. By accessing and using the Services you agree to be bound by this Agreement. If you do not agree to abide by the terms of this Agreement, you are not authorized to access or use the Services.</p>
            
            <div className="mt-12 p-8 bg-[#002B5B] rounded-[3rem] text-white">
               <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                   <h3 className="text-2xl text-brand-primary font-black uppercase italic tracking-tighter mb-2">Legal Support</h3>
                   <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Inquiries regarding this Agreement: contact@marvelmarts.com</p>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/30 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                   This document was last updated on March 23, 2026
                 </p>
               </div>
            </div>
          </section>
          
        </main>
      </div>
    </div>
  );
}