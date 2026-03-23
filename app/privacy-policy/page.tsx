// import React from 'react';
// import { ShieldCheck, Eye, Lock, RefreshCw, Mail, Globe, Cpu } from 'lucide-react';

// export default function PrivacyPolicy() {
//   const sections = [
//     { id: 'who-we-are', title: '1. Who We Are', icon: <Globe size={18} /> },
//     { id: 'automatic-collection', title: '2. Auto-Collection', icon: <Cpu size={18} /> },
//     { id: 'personal-info', title: '3. Personal Data', icon: <Eye size={18} /> },
//     { id: 'processing', title: '4. Data Processing', icon: <RefreshCw size={18} /> },
//     { id: 'security', title: '5. Information Security', icon: <Lock size={18} /> },
//   ];

//   return (
//     <div className="bg-[#fcfcfc] min-h-screen pb-20">
//       {/* --- HERO SECTION --- */}
//       <div className="bg-white border-b border-gray-100 py-16 px-6">
//         <div className="max-w-5xl mx-auto text-center">
//           <span className="inline-block px-4 py-1.5 mb-4 text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 rounded-full">
//             Updated: March 23, 2026
//           </span>
//           <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-gray-900 mb-4">
//             Privacy <span className="text-blue-600">Protocol</span>
//           </h1>
//           <p className="text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
//             At MarvelMarts, we treat your data with the same precision we apply to our logistics. 
//             No dark patterns. No hidden tracking. Just transparency.
//           </p>
//         </div>
//       </div>

//       {/* --- EXECUTIVE SUMMARY (The TL;DR) --- */}
//       <div className="max-w-6xl mx-auto -mt-8 px-6 grid grid-cols-1 md:grid-cols-4 gap-4">
//         {[
//           { label: "Data Usage", value: "Strictly Functional", icon: <ShieldCheck className="text-blue-600" /> },
//           { label: "Retention", value: "Only as Needed", icon: <RefreshCw className="text-blue-600" /> },
//           { label: "Security", value: "Encryption-First", icon: <Lock className="text-blue-600" /> },
//           { label: "Control", value: "100% User Rights", icon: <Eye className="text-blue-600" /> },
//         ].map((item, idx) => (
//           <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
//             <div className="mb-3 p-3 bg-blue-50 rounded-2xl">{item.icon}</div>
//             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
//             <p className="text-xs font-bold text-gray-800 uppercase italic">{item.value}</p>
//           </div>
//         ))}
//       </div>

//       {/* --- MAIN CONTENT AREA --- */}
//       <main className="max-w-6xl mx-auto mt-16 px-6 flex flex-col lg:flex-row gap-12">
        
//         {/* STICKY NAVIGATION (Desktop Only) */}
//         <aside className="hidden lg:block w-64 shrink-0">
//           <div className="sticky top-24 space-y-2">
//             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-4">Navigation</p>
//             {sections.map((section) => (
//               <a 
//                 key={section.id}
//                 href={`#${section.id}`}
//                 className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all border border-transparent hover:border-blue-50"
//               >
//                 {section.icon}
//                 {section.title}
//               </a>
//             ))}
//           </div>
//         </aside>

//         {/* POLICY CONTENT */}
//         <article className="flex-1 space-y-12 text-gray-700 leading-relaxed max-w-2xl">
          
//           <section id="who-we-are" className="scroll-mt-24">
//             <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 mb-6">1. Who We Are</h2>
//             <div className="space-y-4 font-medium text-[15px]">
//               <p>
//                 Our website address is: <strong className="text-blue-600">MarvelMarts.com</strong>.
//               </p>
//               <p>
//                 MarvelMarts.com is Nigeria’s best and foremost online store and marketplace established in 2019. 
//                 Our mission is to become the powerhouse of E-commerce and online trading in Africa.
//               </p>
//               <p>
//                 We are an online retail-based company dealing in products ranging from Phones and Computers 
//                 to Healthcare and Baby Products. By using our Services, you acknowledge that you have read and understood this Policy.
//               </p>
//             </div>
//           </section>

//           <section id="automatic-collection" className="scroll-mt-24">
//             <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 mb-6">2. Automatic Collection</h2>
//             <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2rem] mb-4">
//               <p className="text-sm font-bold text-blue-800 uppercase italic mb-2">Internal Protocol: No-Logs Policy</p>
//               <p className="text-[13px] text-blue-700 font-medium">
//                 Our top priority is customer data security. We exercise a strict no-logs policy, processing 
//                 only minimal data absolutely necessary to maintain the health and safety of our Services.
//               </p>
//             </div>
//           </section>

//           <section id="personal-info" className="scroll-mt-24">
//             <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 mb-6">3. Personal Information</h2>
//             <p className="mb-4 font-medium">We receive and store information you knowingly provide when you create an account or make a purchase:</p>
//             <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               {[
//                 "Personal details (Name, Residency)",
//                 "Contact (Email, Physical Address)",
//                 "Verification (Govt ID as required)",
//                 "Billing (Bank/Card details via SSL)",
//                 "Geolocation (Device Longitude/Latitude)",
//                 "Mobile Features (Contacts, Calendar)"
//               ].map((text, i) => (
//                 <li key={i} className="flex items-center gap-2 p-4 bg-white border border-gray-100 rounded-2xl text-[12px] font-bold text-gray-600 uppercase tracking-tight">
//                   <ShieldCheck size={14} className="text-blue-500" />
//                   {text}
//                 </li>
//               ))}
//             </ul>
//           </section>

//           <section id="security" className="scroll-mt-24">
//             <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 mb-6">5. Information Security</h2>
//             <p className="font-medium">
//               We secure information on computer servers in a controlled, secure environment protected from 
//               unauthorized access. While we maintain technical and physical safeguards, please be aware that 
//               no data transmission over the Internet can be guaranteed as 100% secure.
//             </p>
//           </section>

//           {/* --- CONTACT FOOTER --- */}
//           <section className="pt-12 border-t border-gray-100">
//             <div className="bg-gray-900 p-8 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6">
//               <div>
//                 <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">Have Questions?</h3>
//                 <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Contact our Data Protection Officer</p>
//               </div>
//               <a 
//                 href="mailto:contact@marvelmarts.com"
//                 className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all"
//               >
//                 <Mail size={16} />
//                 Email Support
//               </a>
//             </div>
//           </section>

//         </article>
//       </main>
//     </div>
//   );
// }





import React from 'react';
import { ShieldCheck, Info, UserCheck, Lock, CreditCard, Users, Settings, Bell, Mail, ExternalLink, AlertTriangle, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    { id: 'who-we-are', title: 'Who We Are', icon: <Info size={18} /> },
    { id: 'policy-agreement', title: 'Privacy Policy Agreement', icon: <FileText size={18} /> },
    { id: 'auto-collection', title: 'Automatic Collection', icon: <Settings size={18} /> },
    { id: 'personal-info', title: 'Collection of Personal Information', icon: <UserCheck size={18} /> },
    { id: 'processing', title: 'Use and Processing', icon: <ShieldCheck size={18} /> },
    { id: 'billing', title: 'Billing and Payments', icon: <CreditCard size={18} /> },
    { id: 'managing', title: 'Managing Information', icon: <Settings size={18} /> },
    { id: 'disclosure', title: 'Disclosure of Information', icon: <ExternalLink size={18} /> },
    { id: 'retention', title: 'Retention of Information', icon: <Lock size={18} /> },
    { id: 'rights', title: 'The Rights of Users', icon: <Users size={18} /> },
    { id: 'children', title: 'Privacy of Children', icon: <Users size={18} /> },
    { id: 'cookies', title: 'Cookies & Tracking', icon: <Bell size={18} /> },
    { id: 'marketing', title: 'Ads & Email Marketing', icon: <Mail size={18} /> },
    { id: 'security', title: 'Information Security', icon: <Lock size={18} /> },
    { id: 'breach', title: 'Data Breach', icon: <AlertTriangle size={18} /> },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-gray-900 mb-4">
            Privacy <span className="text-[#002B5B]">Policy</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
            MarvelMarts Inc. / Legal Documentation
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Last Updated: March 23, 2026
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        {/* Sticky Sidebar Navigation */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4 px-3">On this page</p>
            {sections.map((s) => (
              <a 
                key={s.id} 
                href={`#${s.id}`} 
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:bg-white hover:text-[#002B5B] hover:shadow-sm transition-all border border-transparent hover:border-gray-100"
              >
                {s.icon}
                {s.title}
              </a>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded-[2.5rem] p-8 md:p-16 shadow-sm border border-gray-100 prose prose-slate prose-sm max-w-none">
          
          <section id="who-we-are" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">WHO WE ARE</h2>
            <p className="font-bold">Our website address is: MarvelMarts.com</p>
            <p>MarvelMarts.com is a Nigeria’s best and foremost online store and marketplace established 2019 with the aim of becoming powerhouse of E-commerce and online trading in Africa.</p>
            <p>We are online retail base company dealing in customer’s friendly products and goods categories ranging from Phones, Computers, Clothing, Shoes, Home Appliances, Books, healthcare, Baby Products, personal care e.t.c.</p>
            <p className="bg-blue-50 p-4 rounded-2xl text-[13px] font-medium text-blue-900">Please read this Privacy Policy, providing consent to document in order to have permission to use our services.</p>
          </section>

          <section id="policy-agreement" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Privacy policy</h2>
            <p>This privacy policy (“Policy”) describes how the personally identifiable information (“Personal Information”) you may provide on the marvelmarts.com website (“Website”), “MarvelMarts” mobile application (“Mobile Application”) and any of their related products and services (collectively, “Services”) is collected, protected and used. It also describes the choices available to you regarding our use of your Personal Information and how you can access and update this information. This Policy is a legally binding agreement between you (“User”, “you” or “your”) and Marvel Marts Inc. (“Marvel Marts Inc.”, “we”, “us” or “our”). By accessing and using the Services, you acknowledge that you have read, understood, and agree to be bound by the terms of this Policy. This Policy does not apply to the practices of companies that we do not own or control, or to individuals that we do not employ or manage.</p>
          </section>

          <section id="auto-collection" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Automatic collection of information</h2>
            <p>Our top priority is customer data security and, as such, we exercise the no logs policy. We may process only minimal user data, only as much as it is absolutely necessary to maintain the Services. Information collected automatically is used only to identify potential cases of abuse and establish statistical information regarding the usage and traffic of the Services. This statistical information is not otherwise aggregated in such a way that would identify any particular user of the system.</p>
          </section>

          <section id="personal-info" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Collection of personal information</h2>
            <p>You can access and use the Services without telling us who you are or revealing any information by which someone could identify you as a specific, identifiable individual. If, however, you wish to use some of the features on the Services, you may be asked to provide certain Personal Information (for example, your name and e-mail address). We receive and store any information you knowingly provide to us when you create an account, publish content, make a purchase, or fill any online forms on the Services. When required, this information may include the following:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none pl-0">
              {[
                "Personal details such as name, country of residence, etc.",
                "Contact information such as email address, address, etc.",
                "Proof of identity such as photocopy of a government ID.",
                "Payment information such as credit card details, bank details, etc.",
                "Geolocation data such as latitude and longitude.",
                "Certain features on the mobile device such as contacts, calendar, gallery, etc.",
                "Information about other individuals such as your family members, friends, etc.",
                "Any other materials you willingly submit to us such as articles, images, feedback, etc."
              ].map((item, i) => (
                <li key={i} className="flex gap-3 p-4 bg-gray-50 rounded-2xl text-[12px] font-semibold border border-gray-100">
                  <div className="w-1.5 h-1.5 bg-[#F7931E] rounded-full mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-gray-600">Some of the information we collect is directly from you via the Services. However, we may also collect Personal Information about you from other sources such as public databases, social media platforms, third-party data providers, and our joint marketing partners. Personal Information we collect from other sources may include demographic information, such as age and gender, device information, such as IP addresses, location, such as city and state, and online behavioral data, such as information about your use of social media websites, page view information and search results and links. You can choose not to provide us with your Personal Information, but then you may not be able to take advantage of some of the features on the Services. Users who are uncertain about what information is mandatory are welcome to contact us.</p>
          </section>

          <section id="processing" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Use and processing of collected information</h2>
            <p>In order to make the Services available to you, or to meet a legal obligation, we may need to collect and use certain Personal Information. If you do not provide the information that we request, we may not be able to provide you with the requested products or services. Any of the information we collect from you may be used for the following purposes:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 list-none pl-0 mb-6">
              {[
                "Create and manage user accounts", "Fulfill and manage orders", "Deliver products or services",
                "Improve products and services", "Send administrative information", "Send marketing/promotional communications",
                "Respond to inquiries and offer support", "Request user feedback", "Improve user experience",
                "Post customer testimonials", "Deliver targeted advertising", "Enforce terms and policies",
                "Protect from abuse/malicious users", "Respond to legal requests", "Run and operate the Services"
              ].map((purpose, i) => (
                <li key={i} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-bold uppercase tracking-tight text-gray-600">{purpose}</li>
              ))}
            </ul>
            <p>Processing your Personal Information depends on how you interact with the Services, where you are located in the world and if one of the following applies: (i) you have given your consent for one or more specific purposes; this, however, does not apply, whenever the processing of Personal Information is subject to European data protection law; (ii) provision of information is necessary for the performance of an agreement with you and/or for any pre-contractual obligations thereof; (iii) processing is necessary for compliance with a legal obligation to which you are subject; (iv) processing is related to a task that is carried out in the public interest or in the exercise of official authority vested in us; (v) processing is necessary for the purposes of the legitimate interests pursued by us or by a third party.</p>
            <p>Note that under some legislations we may be allowed to process information until you object to such processing (by opting out), without having to rely on consent or any other of the following legal bases below. In any case, we will be happy to clarify the specific legal basis that applies to the processing, and in particular whether the provision of Personal Information is a statutory or contractual requirement, or a requirement necessary to enter into a contract.</p>
          </section>

          <section id="billing" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Billing and payments</h2>
            <p>We use third party payment processors to assist us in processing your payment information securely. Such third party processors’ use of your Personal Information is governed by their respective privacy policies which may or may not contain privacy protections as protective as this Policy. We suggest that you review their respective privacy policies.</p>
          </section>

          <section id="managing" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Managing information</h2>
            <p>You are able to delete certain Personal Information we have about you. The Personal Information you can delete may change as the Services change. When you delete Personal Information, however, we may maintain a copy of the unrevised Personal Information in our records for the duration necessary to comply with our obligations to our affiliates and partners, and for the purposes described below. If you would like to delete your Personal Information or permanently delete your account, you can do so on the settings page of your account on the Services or simply by contacting us.</p>
          </section>

          <section id="disclosure" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Disclosure of information</h2>
            <p>Depending on the requested Services or as necessary to complete any transaction or provide any service you have requested, we may contract with other companies and share your information with your consent with our trusted third parties that work with us, any other affiliates and subsidiaries we rely upon to assist in the operation of the Services available to you. We do not share Personal Information with unaffiliated third parties. These service providers are not authorized to use or disclose your information except as necessary to perform services on our behalf or comply with legal requirements. We may share your Personal Information for these purposes only with third parties whose privacy policies are consistent with ours or who agree to abide by our policies with respect to Personal Information. These third parties are given Personal Information they need only in order to perform their designated functions, and we do not authorize them to use or disclose Personal Information for their own marketing or other purposes.</p>
            <p>We will disclose any Personal Information we collect, use or receive if required or permitted by law, such as to comply with a subpoena, or similar legal process, and when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request.</p>
            <p>In the event we go through a business transition, such as a merger or acquisition by another company, or sale of all or a portion of its assets, your user account, and Personal Information will likely be among the assets transferred.</p>
          </section>

          <section id="retention" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Retention of information</h2>
            <p>We will retain and use your Personal Information for the period necessary to comply with our legal obligations, resolve disputes, and enforce our agreements unless a longer retention period is required or permitted by law. We may use any aggregated data derived from or incorporating your Personal Information after you update or delete it, but not in a manner that would identify you personally. Once the retention period expires, Personal Information shall be deleted. Therefore, the right to access, the right to erasure, the right to rectification and the right to data portability cannot be enforced after the expiration of the retention period.</p>
          </section>

          <section id="rights" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">The rights of users</h2>
            <p>You may exercise certain rights regarding your information processed by us. In particular, you have the right to do the following:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {[
                { i: "i", t: "Withdraw consent where you have previously given consent to processing." },
                { i: "ii", t: "Object to the processing of your information on a legal basis other than consent." },
                { i: "iii", t: "Learn if information is being processed, obtain disclosure, and obtain a copy." },
                { i: "iv", t: "Verify accuracy of your information and ask for it to be updated or corrected." },
                { i: "v", t: "Restrict processing (we will only store the information in this case)." },
                { i: "vi", t: "Obtain the erasure of your Personal Information from us." },
                { i: "vii", t: "Receive your information in a structured, machine readable format." }
              ].map((item) => (
                <div key={item.i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4">
                  <span className="font-black text-[#F7931E] text-xs">({item.i})</span>
                  <p className="text-[12px] font-bold text-gray-700 leading-snug uppercase tracking-tight">{item.t}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] font-medium text-gray-500 italic">This provision is applicable provided that your information is processed by automated means and that the processing is based on your consent, on a contract which you are part of or on pre-contractual obligations thereof.</p>
          </section>

          <section id="children" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Privacy of children</h2>
            <p>We do not knowingly collect any Personal Information from children under the age of 13. If you are under the age of 13, please do not submit any Personal Information through the Services. We encourage parents and legal guardians to monitor their children’s Internet usage and to help enforce this Policy by instructing their children never to provide Personal Information through the Services without their permission. If you have reason to believe that a child under the age of 13 has provided Personal Information to us through the Services, please contact us. You must also be old enough to consent to the processing of your Personal Information in your country (in some countries we may allow your parent or guardian to do so on your behalf).</p>
          </section>

          <section id="cookies" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Cookies</h2>
            <p>The Services use “cookies” to help personalize your online experience. A cookie is a text file that is placed on your hard disk by a web page server. Cookies cannot be used to run programs or deliver viruses to your computer. Cookies are uniquely assigned to you, and can only be read by a web server in the domain that issued the cookie to you.</p>
            <p>We may use cookies to collect, store, and track information for statistical purposes to operate the Services. You have the ability to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. You may learn more about cookies and how they work in this guide.</p>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#002B5B] mt-6 mb-2">Do Not Track signals</h3>
            <p>Some browsers incorporate a Do Not Track feature that signals to websites you visit that you do not want to have your online activity tracked. Tracking is not the same as using or collecting information in connection with a website. For these purposes, tracking refers to collecting personally identifiable information from consumers who use or visit a website or online service as they move across different websites over time. How browsers communicate the Do Not Track signal is not yet uniform. As a result, the Services are not yet set up to interpret or respond to Do Not Track signals communicated by your browser. Even so, as described in more detail throughout this Policy, we limit our use and collection of your personal information.</p>
          </section>

          <section id="marketing" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Advertisements & Email</h2>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Advertisements</h3>
            <p>We may display online advertisements and we may share aggregated and non-identifying information about our customers that we or our advertisers collect through your use of the Services. We do not share personally identifiable information about individual customers with advertisers. In some instances, we may use this aggregated and non-identifying information to deliver tailored advertisements to the intended audience.</p>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4">Affiliates</h3>
            <p>We may engage in affiliate marketing and have affiliate links present on the Services. If you click on an affiliate link, a cookie will be placed on your browser to track any sales for purposes of commissions.</p>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4">Email marketing</h3>
            <p>We offer electronic newsletters to which you may voluntarily subscribe at any time. We are committed to keeping your e-mail address confidential and will not disclose your email address to any third parties except as allowed in the information use and processing section or for the purposes of utilizing a third party provider to send such emails. We will maintain the information sent via e-mail in accordance with applicable laws and regulations.</p>
            <p>In compliance with the CAN-SPAM Act, all e-mails sent from us will clearly state who the e-mail is from and provide clear information on how to contact the sender. You may choose to stop receiving our newsletter or marketing emails by following the unsubscribe instructions included in these emails or by contacting us. However, you will continue to receive essential transactional emails.</p>
          </section>

          <section id="security" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Information security</h2>
            <p>We secure information you provide on computer servers in a controlled, secure environment, protected from unauthorized access, use, or disclosure. We maintain reasonable administrative, technical, and physical safeguards in an effort to protect against unauthorized access, use, modification, and disclosure of Personal Information in its control and custody. However, no data transmission over the Internet or wireless network can be guaranteed. Therefore, while we strive to protect your Personal Information, you acknowledge that (i) there are security and privacy limitations of the Internet which are beyond our control; (ii) the security, integrity, and privacy of any and all information and data exchanged between you and the Services cannot be guaranteed; and (iii) any such information and data may be viewed or tampered with in transit by a third party, despite best efforts.</p>
          </section>

          <section id="breach" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#002B5B] border-l-4 border-[#F7931E] pl-4 mb-6">Data breach</h2>
            <p>In the event we become aware that the security of the Services has been compromised or users Personal Information has been disclosed to unrelated third parties as a result of external activity, including, but not limited to, security attacks or fraud, we reserve the right to take reasonably appropriate measures, including, but not limited to, investigation and reporting, as well as notification to and cooperation with law enforcement authorities. In the event of a data breach, we will make reasonable efforts to notify affected individuals if we believe that there is a reasonable risk of harm to the user as a result of the breach or if notice is otherwise required by law. When we do, we will post a notice on the Services, send you an email.</p>
          </section>

          <section id="footer-clauses" className="pt-12 border-t border-gray-100">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">Changes and amendments</h3>
            <p>We reserve the right to modify this Policy or its terms relating to the Services from time to time in our discretion and will notify you of any material changes to the way in which we treat Personal Information. When we do, we will send you an email to notify you. We may also provide notice to you in other ways in our discretion, such as through contact information you have provided. Any updated version of this Policy will be effective immediately upon the posting of the revised Policy unless otherwise specified. Your continued use of the Services after the effective date of the revised Policy (or such other act specified at that time) will constitute your consent to those changes. However, we will not, without your consent, use your Personal Information in a manner materially different than what was stated at the time your Personal Information was collected.</p>
            
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mt-8 mb-4">Acceptance of this policy</h3>
            <p>You acknowledge that you have read this Policy and agree to all its terms and conditions. By accessing and using the Services you agree to be bound by this Policy. If you do not agree to abide by the terms of this Policy, you are not authorized to access or use the Services.</p>
            
            <div className="mt-12 p-8 bg-gray-900 rounded-[3rem] text-white">
               <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Contacting us</h3>
               <p className="text-gray-400 text-xs font-bold leading-relaxed mb-6">If you would like to contact us to understand more about this Policy or wish to contact us concerning any matter relating to individual rights and your Personal Information, you may do so via the contact form or send an email to <span className="text-[#F7931E]">contact@marvelmarts.com</span>.</p>
               <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">This document was last updated on June 1, 2021</p>
               </div>
            </div>
          </section>
          
        </main>
      </div>
    </div>
  );
}