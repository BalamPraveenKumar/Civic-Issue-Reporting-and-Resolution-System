import React, { useState } from "react";
import { 
  HelpCircle, 
  ChevronDown, 
  Clock, 
  PhoneCall, 
  MapPin, 
  Mail, 
  FileText 
} from "lucide-react";
import styles from "./Helpdesk.module.css";

const SLA_DATA = [
  { category: "Sanitation & Garbage", target: "24 Hours", priority: "High" },
  { category: "Water Supply Leakage", target: "24 Hours", priority: "High" },
  { category: "Street Lighting Failures", target: "48 Hours", priority: "Medium" },
  { category: "Drainage Overflow", target: "48 Hours", priority: "High" },
  { category: "Road Damage & Potholes", target: "7-10 Days", priority: "Medium" },
  { category: "Public Safety Hazards", target: "Immediate", priority: "Critical" },
  { category: "Parks & Recreation", target: "14 Days", priority: "Low" }
];

const FAQ_DATA = [
  {
    question: "How does the civic issue resolution process work?",
    answer: "Once you submit a complaint, it is automatically routed to the nodal officer of your district based on your Aadhaar registration. The officer performs an audit (updating status to 'In Progress') and dispatches ground maintenance crews. Once resolved, the officer updates the status to 'Resolved' and provides remarks detailing the action taken."
  },
  {
    question: "What media file types can I upload as evidence?",
    answer: "You can upload up to 5 files containing images (.jpg, .png, .webp) or videos (.mp4, .mov). These media files act as evidence to help nodal officers pinpoint and assess the severity of the problem."
  },
  {
    question: "What is the 'Public Feed' and what are upvotes/endorsements?",
    answer: "The Public Feed lists reported civic issues in your district. If another resident has already reported an issue you care about (e.g., a pothole in your street), you can upvote it rather than submitting a duplicate ticket. High upvote counts raise the priority flag for district collectors to expedite resolutions."
  },
  {
    question: "Are my personal details exposed on the Public Feed?",
    answer: "No. Your Aadhaar number and phone number are hidden for security and privacy. The public feed only displays the title, description, category, media, status, and upvote counts."
  },
  {
    question: "What happens if a complaint is rejected?",
    answer: "Nodal officers audit complaints to ensure they are actionable, within jurisdiction, and not spam. If a complaint does not meet actionable criteria (e.g., private property disputes or duplicate issues), it is marked as 'Rejected' with detailed explanatory remarks."
  }
];

const Helpdesk = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h2>e-Governance Helpdesk</h2>
          <p>Find service resolution timelines (SLAs), contact local officials, and review frequently asked questions.</p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left Side: SLA Timelines & Nodal Contacts */}
        <div className={styles.leftCol}>
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <Clock size={18} />
              <span>Service Level Agreements (SLAs)</span>
            </div>
            <p className={styles.sectionDesc}>
              The state e-Governance board defines clear targets for resolution of complaints. Ground departments are monitored against these timelines.
            </p>

            <div className={styles.slaList}>
              {SLA_DATA.map((sla, idx) => {
                const priorityClass = 
                  sla.priority === "Critical" ? styles.slaCrit :
                  sla.priority === "High" ? styles.slaHigh :
                  sla.priority === "Medium" ? styles.slaMed : styles.slaLow;

                return (
                  <div key={idx} className={styles.slaItem}>
                    <div className={styles.slaInfo}>
                      <span className={styles.slaCategory}>{sla.category}</span>
                      <span className={`${styles.slaPriority} ${priorityClass}`}>{sla.priority} Priority</span>
                    </div>
                    <span className={styles.slaTarget}>{sla.target}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <PhoneCall size={18} />
              <span>District Jurisdiction Directory</span>
            </div>
            <p className={styles.sectionDesc}>
              Reach out to local administrative divisions for escalated grievances or queries.
            </p>

            <div className={styles.directoryGrid}>
              <div className={styles.directoryItem}>
                <h5>East Godavari District Collectorate</h5>
                <div className={styles.dirRow}>
                  <MapPin size={12} />
                  <span>Kakinada, Andhra Pradesh, India</span>
                </div>
                <div className={styles.dirRow}>
                  <PhoneCall size={12} />
                  <span>0884-2361234 (Mon-Sat, 10 AM - 5 PM)</span>
                </div>
                <div className={styles.dirRow}>
                  <Mail size={12} />
                  <span>collector-eg@ap.gov.in</span>
                </div>
              </div>

              <div className={styles.directoryItem}>
                <h5>e-Governance Central Helpdesk</h5>
                <div className={styles.dirRow}>
                  <MapPin size={12} />
                  <span>State Secretariat, Vijayawada</span>
                </div>
                <div className={styles.dirRow}>
                  <PhoneCall size={12} />
                  <span>Toll-Free Helpline: 1800-425-2900</span>
                </div>
                <div className={styles.dirRow}>
                  <Mail size={12} />
                  <span>support-egov@ap.gov.in</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: FAQ Accordions */}
        <div className={styles.rightCol}>
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <HelpCircle size={18} />
              <span>Frequently Asked Questions</span>
            </div>
            <p className={styles.sectionDesc}>
              Click on a question to expand the resolution guidelines.
            </p>

            <div className={styles.faqList}>
              {FAQ_DATA.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div 
                    key={idx} 
                    className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}
                  >
                    <button 
                      className={styles.faqQuestionBtn} 
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown size={16} className={styles.faqChevron} />
                    </button>
                    <div className={styles.faqAnswerBox}>
                      <div className={styles.faqAnswerContent}>
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Helpdesk;
