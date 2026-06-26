/**
 * Seed Script — Populates the Pinecone index with Sri Lankan legal knowledge
 * and lawyer profiles from the database.
 *
 * Usage: npx tsx src/scripts/seedPinecone.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import {
  upsertKnowledge,
  upsertLawyerProfiles,
  LegalDocument,
  LawyerProfile,
} from '../services/pineconeService';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// Sri Lankan Legal Knowledge Base
// ─────────────────────────────────────────────

const legalKnowledge: LegalDocument[] = [
  // ── Penal Code ──
  {
    id: 'penal-001',
    title: 'Sri Lanka Penal Code - Theft (Section 366)',
    content:
      'Whoever, intending to take dishonestly any movable property out of the possession of any person without that person\'s consent, moves that property in order to such taking, is said to commit theft. Punishment: Imprisonment up to 3 years, or fine, or both. Under Sri Lankan law, theft is a cognizable and non-bailable offence when the value exceeds a certain threshold.',
    category: 'Criminal Law',
    source: 'Sri Lanka Penal Code, Section 366',
    type: 'law',
  },
  {
    id: 'penal-002',
    title: 'Sri Lanka Penal Code - Criminal Breach of Trust (Section 388)',
    content:
      'Whoever, being in any manner entrusted with property, or with any dominion over property, dishonestly misappropriates or converts to his own use that property, or dishonestly uses or disposes of that property in violation of any direction of law prescribing the mode in which such trust is to be discharged, commits criminal breach of trust. Punishment: Imprisonment up to 3 years, or fine, or both.',
    category: 'Criminal Law',
    source: 'Sri Lanka Penal Code, Section 388',
    type: 'law',
  },
  {
    id: 'penal-003',
    title: 'Sri Lanka Penal Code - Hurt and Grievous Hurt (Sections 310-315)',
    content:
      'Whoever causes bodily pain, disease, or infirmity to any person is said to cause hurt. Grievous hurt includes emasculation, permanent privation of sight or hearing, privation of any member or joint, destruction or permanent impairing of any member or joint, permanent disfiguration, fracture or dislocation of a bone or tooth, or any hurt which endangers life. Punishment for voluntarily causing hurt: Imprisonment up to 1 year, or fine up to Rs. 1,000, or both. Punishment for grievous hurt: Imprisonment up to 7 years and fine.',
    category: 'Criminal Law',
    source: 'Sri Lanka Penal Code, Sections 310-315',
    type: 'law',
  },
  {
    id: 'penal-004',
    title: 'Sri Lanka Penal Code - Cheating (Section 398)',
    content:
      'Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person, or to consent that any person shall retain any property, or intentionally induces the person so deceived to do or omit to do anything which he would not do or omit if he were not so deceived, is said to cheat. Punishment: Imprisonment up to 3 years, or fine, or both.',
    category: 'Criminal Law',
    source: 'Sri Lanka Penal Code, Section 398',
    type: 'law',
  },
  {
    id: 'penal-005',
    title: 'Sri Lanka Penal Code - Defamation (Section 479)',
    content:
      'Whoever, by words either spoken or intended to be read, or by signs or by visible representations, makes or publishes any imputation concerning any person intending to harm the reputation of such person, is said to defame that person. Defamation is punishable by imprisonment of either description for a term which may extend to two years, or with fine, or with both. Truth is a defense if it was for public good.',
    category: 'Criminal Law',
    source: 'Sri Lanka Penal Code, Section 479',
    type: 'law',
  },

  // ── Family Law ──
  {
    id: 'family-001',
    title: 'Marriage Registration in Sri Lanka',
    content:
      'In Sri Lanka, marriage is governed by several laws depending on the community: the General Marriage Registration Ordinance (for all communities), the Kandyan Marriage and Divorce Act (for Kandyan Sinhalese), the Muslim Marriage and Divorce Act (for Muslims), and the Thesawalamai (for Jaffna Tamils). Under the General Marriage Registration Ordinance, both parties must be at least 18 years old. A marriage notice must be published, and the marriage must be solemnized by a registered Marriage Registrar.',
    category: 'Family Law',
    source: 'General Marriage Registration Ordinance No. 19 of 1907',
    type: 'law',
  },
  {
    id: 'family-002',
    title: 'Grounds for Divorce in Sri Lanka (General Law)',
    content:
      'Under the Civil Procedure Code and the Marriage Registration Ordinance (General Law applicable to non-Kandyan, non-Muslim citizens), divorce can be obtained on the following grounds: (1) Adultery committed after marriage. (2) Malicious desertion. (3) Incurable impotency at the time of marriage. Under Kandyan Law, divorce is simpler and can be by mutual consent. Under Muslim Law, the husband can pronounce talaq. The District Court has jurisdiction over divorce cases.',
    category: 'Family Law',
    source: 'Civil Procedure Code & Marriage Registration Ordinance',
    type: 'law',
  },
  {
    id: 'family-003',
    title: 'Child Custody Laws in Sri Lanka',
    content:
      'In Sri Lanka, child custody matters are decided based on the best interests of the child. Under general law, the father is considered the natural guardian. However, courts typically grant custody of children under the age of 5 to the mother unless there are exceptional circumstances. The Guardianship of Minors Ordinance governs custody disputes. Factors considered include the child\'s age, health, emotional ties with each parent, and the ability of each parent to provide for the child\'s needs.',
    category: 'Family Law',
    source: 'Guardianship of Minors Ordinance',
    type: 'law',
  },
  {
    id: 'family-004',
    title: 'Maintenance and Alimony in Sri Lanka',
    content:
      'Under the Maintenance Ordinance No. 2 of 1999, a spouse (typically the wife) can claim maintenance from the other spouse. The Magistrate\'s Court can order maintenance. Factors considered include: the income and assets of both parties, the standard of living during the marriage, the duration of the marriage, and the needs of any dependent children. Failure to pay maintenance can result in imprisonment. Children are entitled to maintenance from both parents until they reach the age of 18.',
    category: 'Family Law',
    source: 'Maintenance Ordinance No. 2 of 1999',
    type: 'law',
  },

  // ── Property Law ──
  {
    id: 'property-001',
    title: 'Land Ownership and Registration in Sri Lanka',
    content:
      'Land ownership in Sri Lanka is governed by the Registration of Documents Ordinance and the Land Registration Ordinance. All transfers of land must be by way of a notarially executed deed. The deed must be registered at the relevant Land Registry office. The Bim Saviya (Title Registration) program aims to convert the deed-based system to a title-based system for greater security. Key documents include: the survey plan, title report, valuation report, and the deed of transfer.',
    category: 'Property Law',
    source: 'Registration of Documents Ordinance & Land Registration Ordinance',
    type: 'law',
  },
  {
    id: 'property-002',
    title: 'Partition Actions in Sri Lanka',
    content:
      'The Partition Law No. 21 of 1977 governs the division of co-owned property in Sri Lanka. Any co-owner can file a partition action in the District Court to have the property divided among the co-owners. If physical division is not possible, the court may order a sale and division of proceeds. The process involves filing a plaint, serving summons on all co-owners, conducting a commission survey, and obtaining a final decree. Interlocutory decrees determine the shares of each co-owner.',
    category: 'Property Law',
    source: 'Partition Law No. 21 of 1977',
    type: 'law',
  },
  {
    id: 'property-003',
    title: 'Landlord and Tenant Law in Sri Lanka',
    content:
      'The Rent Act No. 7 of 1972 (as amended) governs residential tenancies in Sri Lanka. Key provisions: Landlords cannot evict tenants without a court order except under specific grounds (non-payment of rent, damage to property, need for personal occupation). Rent increases are regulated. Tenants have the right to quiet enjoyment. Commercial tenancies are governed by common law and the terms of the lease agreement. Security deposits and lease registration requirements apply.',
    category: 'Property Law',
    source: 'Rent Act No. 7 of 1972',
    type: 'law',
  },

  // ── Labor Law ──
  {
    id: 'labor-001',
    title: 'Employment Rights in Sri Lanka',
    content:
      'The Shop and Office Employees Act No. 19 of 1954 and the Wages Board Ordinance govern employment rights. Key rights include: maximum working hours (8 hours/day, 45 hours/week for shop and office workers), overtime pay (1.5x normal rate), annual leave (14 days), sick leave (7 days with half pay, then 7 more with no pay), maternity leave (84 working days for first two children). The EPF (Employees\' Provident Fund) requires employer contributions of 15% and employee contributions of 10% of wages.',
    category: 'Labor Law',
    source: 'Shop and Office Employees Act No. 19 of 1954',
    type: 'law',
  },
  {
    id: 'labor-002',
    title: 'Termination of Employment in Sri Lanka',
    content:
      'The Termination of Employment of Workmen Act No. 45 of 1971 (TEWA) applies to workmen employed for 180 days or more. Employers must obtain prior written consent of the workman or approval from the Commissioner of Labour before termination. Compensation for termination is typically calculated based on the period of service. Exceptions include: termination on disciplinary grounds (after proper inquiry), redundancy, and expiry of fixed-term contracts. Unfair dismissal claims can be filed with the Labour Tribunal.',
    category: 'Labor Law',
    source: 'Termination of Employment of Workmen Act No. 45 of 1971',
    type: 'law',
  },
  {
    id: 'labor-003',
    title: 'Workmen\'s Compensation in Sri Lanka',
    content:
      'The Workmen\'s Compensation Ordinance No. 19 of 1934 provides compensation for workers who suffer injuries or death arising out of and in the course of employment. Compensation is calculated based on the worker\'s monthly earnings and the nature of the injury. For death: the equivalent of 5 years\' earnings. For permanent total disablement: the equivalent of 5 years\' earnings. The employer is liable regardless of fault. Claims must be filed within one year of the accident.',
    category: 'Labor Law',
    source: 'Workmen\'s Compensation Ordinance No. 19 of 1934',
    type: 'law',
  },

  // ── Civil Procedure ──
  {
    id: 'civil-001',
    title: 'Filing a Civil Suit in Sri Lanka',
    content:
      'Civil suits in Sri Lanka are filed under the Civil Procedure Code. The process involves: (1) Drafting a plaint stating the cause of action, relief sought, and supporting facts. (2) Filing the plaint in the appropriate court (Primary Court for claims up to Rs. 3 million, District Court for higher amounts and certain matters). (3) Payment of court fees based on the value of the claim. (4) Service of summons on the defendant. (5) Filing of answer by the defendant within 14 days. (6) Trial, evidence, and judgment.',
    category: 'Civil Procedure',
    source: 'Civil Procedure Code of Sri Lanka',
    type: 'procedure',
  },
  {
    id: 'civil-002',
    title: 'Appeals Process in Sri Lanka',
    content:
      'The appeals process in Sri Lanka follows this hierarchy: Primary Court → District Court/Magistrate\'s Court → High Court → Court of Appeal → Supreme Court. Leave to appeal to the Supreme Court must be obtained. Time limits: Appeal from Primary/Magistrate\'s Court — 14 days. Appeal from District Court — 60 days. Appeal to Court of Appeal — 42 days. Special leave to appeal to Supreme Court — 42 days. Grounds for appeal include errors of law, errors of fact, and procedural irregularities.',
    category: 'Civil Procedure',
    source: 'Civil Procedure Code & Judicature Act',
    type: 'procedure',
  },

  // ── Consumer Protection ──
  {
    id: 'consumer-001',
    title: 'Consumer Protection Laws in Sri Lanka',
    content:
      'The Consumer Affairs Authority Act No. 09 of 2003 established the Consumer Affairs Authority (CAA) to protect consumers. Key provisions: prohibition of unfair trade practices, control of prices of essential goods, regulation of weights and measures, and prohibition of misleading advertisements. Consumers can file complaints with the CAA. The Fair Trading Commission Act also provides remedies against anti-competitive practices. Consumers have the right to safe products, accurate information, and fair dealing.',
    category: 'Consumer Protection',
    source: 'Consumer Affairs Authority Act No. 09 of 2003',
    type: 'law',
  },

  // ── Frequently Asked Questions ──
  {
    id: 'faq-001',
    title: 'How to file a police complaint in Sri Lanka?',
    content:
      'To file a police complaint in Sri Lanka: (1) Visit the nearest police station to where the incident occurred. (2) Provide your full name, NIC number, and address. (3) Give a detailed statement about the incident to the Officer-in-Charge (OIC). (4) The police will record your complaint in the Information Book (IB). (5) Request a copy of the entry number for your records. (6) For serious offences, the police will investigate and file a case in court. You can also file complaints online through the Sri Lanka Police website.',
    category: 'FAQ',
    source: 'Sri Lanka Police Procedures',
    type: 'faq',
  },
  {
    id: 'faq-002',
    title: 'How to obtain a birth certificate in Sri Lanka?',
    content:
      'Birth certificates in Sri Lanka are issued by the Registrar General\'s Department. Process: (1) Births must be registered within 42 days at the Divisional Secretariat where the birth occurred. (2) Required documents: hospital notification of birth, parents\' NIC copies, parents\' marriage certificate. (3) If registration is late (after 42 days but within 1 year), a declaration must be made. (4) After 1 year, a District Court order is required. (5) Copies can be obtained from the Registrar General\'s Department in Battaramulla. Fee: Rs. 100 for normal service, Rs. 500 for urgent service.',
    category: 'FAQ',
    source: 'Registrar General\'s Department',
    type: 'faq',
  },
  {
    id: 'faq-003',
    title: 'How to register a business in Sri Lanka?',
    content:
      'Business registration in Sri Lanka: (1) Sole Proprietorship: Register at the Divisional Secretariat under the Business Names Ordinance. Fee: Rs. 200. (2) Partnership: Register under the Business Names Ordinance. A partnership deed is recommended. (3) Private Limited Company: Register with the Registrar of Companies. Required: minimum 1 shareholder, 1 director (who can be the same person), registered office address, Articles of Association. Online registration available through the ROC website. Fee: Rs. 36,500 for companies with up to Rs. 100,000 share capital.',
    category: 'FAQ',
    source: 'Department of Registrar of Companies',
    type: 'faq',
  },
  {
    id: 'faq-004',
    title: 'What are the steps to obtain a restraining order in Sri Lanka?',
    content:
      'To obtain a restraining order (enjoining order) in Sri Lanka: (1) File a complaint at the nearest Magistrate\'s Court. (2) Provide evidence of the threat or harassment (medical reports, witness statements, photos). (3) The Magistrate can issue an interim order immediately if there is imminent danger. (4) Both parties will be summoned for a hearing. (5) Under the Prevention of Domestic Violence Act No. 34 of 2005, victims of domestic violence can obtain a protection order. The court may order the respondent to stay away, vacate the shared residence, or refrain from contacting the victim.',
    category: 'FAQ',
    source: 'Prevention of Domestic Violence Act No. 34 of 2005',
    type: 'faq',
  },
  {
    id: 'faq-005',
    title: 'How to resolve a land dispute in Sri Lanka?',
    content:
      'Land disputes in Sri Lanka can be resolved through: (1) Mediation: Contact the nearest Mediation Board. Free service, and agreements are legally binding. (2) Conciliation at the Divisional Secretariat with the Grama Niladhari. (3) Filing a case in the District Court for ownership disputes. (4) Partition actions under the Partition Law for co-owned property. (5) Prescriptive rights claims (10 years of uninterrupted possession under Prescription Ordinance). Key evidence needed: survey plans, deeds, tax receipts, and witness testimony. Legal aid is available for those who cannot afford a lawyer.',
    category: 'FAQ',
    source: 'Mediation Boards Commission & Partition Law',
    type: 'faq',
  },
  {
    id: 'faq-006',
    title: 'What are the fundamental rights in the Sri Lankan Constitution?',
    content:
      'Chapter III of the Constitution of Sri Lanka (1978) guarantees the following fundamental rights: (1) Freedom of thought, conscience, and religion (Art. 10). (2) Freedom from torture (Art. 11). (3) Right to equality and non-discrimination (Art. 12). (4) Freedom from arbitrary arrest and detention (Art. 13). (5) Freedom of speech, assembly, association, occupation, and movement (Art. 14). (6) Right to access information (Art. 14A). Fundamental rights petitions can be filed in the Supreme Court within one month of the violation.',
    category: 'Constitutional Law',
    source: 'Constitution of Sri Lanka, Chapter III',
    type: 'law',
  },
];

// ─────────────────────────────────────────────
// Main Seed Function
// ─────────────────────────────────────────────
async function seed() {
  console.log('🌱 Starting Pinecone seed...\n');

  // 1. Seed legal knowledge
  console.log(`📚 Seeding ${legalKnowledge.length} legal documents...`);
  const legalCount = await upsertKnowledge(legalKnowledge);
  console.log(`✅ Seeded ${legalCount} legal documents.\n`);

  // 2. Seed lawyer profiles from database
  console.log('👨‍⚖️ Fetching verified lawyers from database...');
  const lawyers = await prisma.lawyer.findMany({
    where: { isVerified: true },
    include: { user: { select: { name: true } } },
  });

  if (lawyers.length > 0) {
    const lawyerProfiles: LawyerProfile[] = lawyers.map((l) => ({
      id: l.id,
      name: l.user.name,
      specializations: l.specialization,
      location: l.location || 'Sri Lanka',
      bio: l.bio || '',
      hourlyRate: l.hourlyRate,
    }));

    console.log(`📤 Seeding ${lawyerProfiles.length} lawyer profiles...`);
    const lawyerCount = await upsertLawyerProfiles(lawyerProfiles);
    console.log(`✅ Seeded ${lawyerCount} lawyer profiles.\n`);
  } else {
    console.log('⚠️  No verified lawyers found in database. Skipping lawyer seeding.\n');
  }

  console.log('🎉 Pinecone seed complete!');
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
