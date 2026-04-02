const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');

// ─── Helpers ────────────────────────────────────────────────────────────────

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Life Event Knowledge Base ──────────────────────────────────────────────

const LIFE_EVENTS = {
  marriage: {
    id: 'marriage',
    label: 'Marriage',
    emoji: '💍',
    description: 'Getting married or recently married',
    keywords: ['married', 'marriage', 'wedding', 'wed', 'spouse', 'husband', 'wife', 'nikah', 'vivah', 'shaadi'],
    checklist: [
      {
        id: 'marriage-cert',
        title: 'Register marriage certificate',
        description: 'Obtain an official marriage certificate from the local registrar office.',
        priority: 'high',
        category: 'Legal',
        steps: [
          'Visit the Sub-Register office in your district within 30 days of marriage',
          'Fill the marriage registration form',
          'Submit the form along with required documents',
          'Both spouses and 2 witnesses must be present for verification',
          'Pay the registration fee (varies by state, ₹100–₹500)',
          'Collect the marriage certificate within 7–15 working days',
        ],
        documents: [
          'Aadhaar card of both spouses',
          'Address proof of both spouses',
          'Passport-size photographs (4 each)',
          'Date of birth proof (birth certificate / 10th mark sheet)',
          'Wedding invitation card or marriage photos',
          'Affidavit of marriage on stamp paper',
          'Identity proof of two witnesses with photographs',
        ],
      },
      {
        id: 'marriage-aadhaar',
        title: 'Update name/address on Aadhaar',
        description: 'Update your name (if changed) and address on your Aadhaar card.',
        priority: 'high',
        category: 'Identity',
        steps: [
          'Visit the official UIDAI portal or nearest Aadhaar enrollment center',
          'Select "Update Aadhaar" and choose Name / Address correction',
          'Upload marriage certificate as proof of name change',
          'Upload new address proof if address has changed',
          'Submit biometric verification at the center',
          'Collect the updated Aadhaar within 15–30 days',
        ],
        documents: [
          'Marriage certificate',
          'Current Aadhaar card',
          'New address proof (rental agreement, utility bill, etc.)',
          'Passport-size photograph',
        ],
      },
      {
        id: 'marriage-pan',
        title: 'Update PAN card details',
        description: 'Update your name on PAN card after marriage if name has changed.',
        priority: 'high',
        category: 'Identity',
        steps: [
          'Visit the NSDL or UTIITSL PAN portal',
          'Fill form for "Changes or Correction in PAN Data"',
          'Upload supporting documents online or submit physically',
          'Pay the processing fee (₹110 for Indian address)',
          'New PAN card will be dispatched within 15–20 working days',
        ],
        documents: [
          'Existing PAN card copy',
          'Marriage certificate',
          'Updated Aadhaar card',
          'Passport-size photograph',
        ],
      },
      {
        id: 'marriage-bank-nominee',
        title: 'Update bank account nominee',
        description: 'Add or change the nominee on your bank accounts to your spouse.',
        priority: 'medium',
        category: 'Finance',
        steps: [
          'Visit your bank branch or log into net banking',
          'Fill the Nomination Form (DA1)',
          'Provide nominee details (spouse\'s name, relationship, Aadhaar)',
          'Submit the form with your signature',
          'Optionally add a joint account with your spouse',
        ],
        documents: [
          'Marriage certificate',
          'Bank account passbook or statement',
          'Spouse\'s Aadhaar card',
          'Spouse\'s PAN card',
        ],
      },
      {
        id: 'marriage-insurance',
        title: 'Update insurance beneficiary',
        description: 'Update the beneficiary on your life and health insurance policies.',
        priority: 'medium',
        category: 'Finance',
        steps: [
          'Contact your insurance provider or log into their portal',
          'Request a beneficiary/nominee change form',
          'Fill in your spouse\'s details as the new beneficiary',
          'Submit along with marriage certificate copy',
          'Receive confirmation of updated policy details',
        ],
        documents: [
          'Existing insurance policy document',
          'Marriage certificate',
          'Spouse\'s ID proof (Aadhaar / PAN)',
          'Filled nomination change form',
        ],
      },
      {
        id: 'marriage-passport',
        title: 'Update passport details',
        description: 'Apply for a reissue of passport if your name or address has changed after marriage.',
        priority: 'medium',
        category: 'Identity',
        steps: [
          'Visit the Passport Seva portal (passportindia.gov.in)',
          'Select "Re-issue of Passport" and fill the application',
          'Upload marriage certificate and updated Aadhaar',
          'Book an appointment at the nearest Passport Seva Kendra',
          'Visit on the appointment date with original documents',
          'Updated passport will be dispatched after police verification',
        ],
        documents: [
          'Existing passport',
          'Marriage certificate',
          'Updated Aadhaar card',
          'Address proof',
          'Passport-size photographs (as per specification)',
        ],
      },
      {
        id: 'marriage-address',
        title: 'Update address if relocated',
        description: 'If you moved to a new address after marriage, update it across all documents.',
        priority: 'low',
        category: 'Identity',
        steps: [
          'Update address on Aadhaar card (see Aadhaar update task)',
          'Update address on voter ID card via NVSP portal',
          'Inform your employer\'s HR department',
          'Update address on driving license via RTO',
          'Update address on bank records',
          'Transfer utility connections if applicable',
        ],
        documents: [
          'New address proof (rental agreement, utility bill, property papers)',
          'Marriage certificate',
          'Aadhaar card',
        ],
      },
      {
        id: 'marriage-joint-tax',
        title: 'Plan for updated tax filing',
        description: 'Understand how marriage affects your income tax filing and plan accordingly.',
        priority: 'low',
        category: 'Finance',
        steps: [
          'Decide whether to file ITR jointly or individually (India does not allow joint filing but deductions may change)',
          'Update your PAN records with new name/address',
          'Claim relevant deductions (e.g., home loan joint benefit, HRA)',
          'Add spouse as joint applicant in home loans for tax benefits',
          'Consult a tax advisor if both spouses have income',
        ],
        documents: [
          'PAN cards of both spouses',
          'Salary slips or income proof',
          'Home loan statements (if applicable)',
          'Investment proof for deductions',
        ],
      },
    ],
  },

  childbirth: {
    id: 'childbirth',
    label: 'Childbirth',
    emoji: '👶',
    description: 'Expecting or recently had a baby',
    keywords: ['baby', 'birth', 'child', 'newborn', 'born', 'pregnancy', 'pregnant', 'delivery', 'maternity'],
    checklist: [
      {
        id: 'birth-cert',
        title: 'Obtain birth certificate',
        description: 'Register the birth and obtain an official birth certificate.',
        priority: 'high',
        category: 'Legal',
        steps: [
          'Hospital will provide a birth report — collect it before discharge',
          'Visit the local Municipal Corporation / Gram Panchayat within 21 days',
          'Fill the birth registration form',
          'Submit required documents',
          'Collect the birth certificate within 7–14 days',
          'Apply online through your state\'s birth registration portal if available',
        ],
        documents: [
          'Hospital birth report / discharge summary',
          'Parents\' Aadhaar cards',
          'Parents\' marriage certificate',
          'Address proof',
          'Identity proof of informant (if not parent)',
        ],
      },
      {
        id: 'birth-aadhaar',
        title: 'Enroll child for Aadhaar (Baal Aadhaar)',
        description: 'Get a Baal Aadhaar card for the newborn (blue card, no biometrics till age 5).',
        priority: 'high',
        category: 'Identity',
        steps: [
          'Visit the nearest Aadhaar enrollment center',
          'Fill the enrollment form for the child',
          'Provide one parent\'s Aadhaar for linking',
          'Child\'s photo will be taken (no fingerprints/iris till age 5)',
          'Baal Aadhaar card will be mailed within 30–60 days',
        ],
        documents: [
          'Birth certificate of the child',
          'Parent\'s Aadhaar card (at least one parent)',
          'Address proof',
        ],
      },
      {
        id: 'birth-sukanya',
        title: 'Open Sukanya Samriddhi Yojana account (for girl child)',
        description: 'Open a tax-saving account for your daughter\'s education and marriage.',
        priority: 'medium',
        category: 'Finance',
        steps: [
          'Visit any authorized bank or post office',
          'Fill the Sukanya Samriddhi Yojana account opening form',
          'Make the initial deposit (minimum ₹250)',
          'Account earns government-backed interest (currently ~8%)',
          'Partial withdrawal allowed after age 18 for education',
        ],
        documents: [
          'Girl child\'s birth certificate',
          'Parent/guardian\'s Aadhaar and PAN',
          'Address proof',
          'Passport-size photos of parent and child',
        ],
      },
      {
        id: 'birth-maternity',
        title: 'Claim maternity benefits (PMMVY)',
        description: 'Apply for Pradhan Mantri Matru Vandana Yojana — ₹5,000 benefit for first child.',
        priority: 'high',
        category: 'Finance',
        steps: [
          'Register at the nearest Anganwadi centre or health facility',
          'Fill the PMMVY application form (Form 1A)',
          'Submit after the first trimester, after delivery, and after vaccination',
          'Benefits are paid in 3 installments directly to your bank account',
          'Total benefit: ₹5,000 for the first living child',
        ],
        documents: [
          'Mother\'s Aadhaar card',
          'Bank account passbook (mother\'s)',
          'MCP (Mother and Child Protection) card',
          'Last menstrual period (LMP) date proof',
          'Child\'s birth certificate (for final installment)',
        ],
      },
      {
        id: 'birth-insurance',
        title: 'Add child to health insurance',
        description: 'Add the newborn as a dependent in your health insurance policy.',
        priority: 'medium',
        category: 'Finance',
        steps: [
          'Contact your health insurance provider within 90 days of birth',
          'Request the addition of newborn as a dependent',
          'Fill the endorsement form',
          'Some policies auto-cover newborns for the first 90 days',
          'Pay any additional premium if applicable',
        ],
        documents: [
          'Birth certificate of the child',
          'Existing health insurance policy',
          'Parent\'s ID proof',
          'Hospital discharge summary',
        ],
      },
      {
        id: 'birth-vaccination',
        title: 'Register for immunization schedule',
        description: 'Enroll the child in the national immunization program.',
        priority: 'high',
        category: 'Health',
        steps: [
          'Register at the nearest Primary Health Centre or hospital',
          'Get an immunization card from the hospital at birth',
          'Follow the recommended vaccination schedule (BCG, OPV, Hepatitis B, etc.)',
          'Keep the immunization card safe — it\'s needed for school admission',
          'Optional: track via the government\'s eVIN or CoWIN platform',
        ],
        documents: [
          'Birth certificate',
          'Hospital discharge card',
          'Parent\'s Aadhaar card',
        ],
      },
    ],
  },

  business: {
    id: 'business',
    label: 'Starting a Business',
    emoji: '🏢',
    description: 'Starting a new business or registering a startup',
    keywords: ['business', 'startup', 'company', 'enterprise', 'entrepreneur', 'shop', 'venture', 'register', 'gst', 'msme', 'firm'],
    checklist: [
      {
        id: 'biz-register',
        title: 'Register your business entity',
        description: 'Register as a Proprietorship, Partnership, LLP, or Private Limited Company.',
        priority: 'high',
        category: 'Legal',
        steps: [
          'Choose your business structure (Proprietorship, Partnership, LLP, Pvt Ltd)',
          'For Pvt Ltd / LLP: Apply on the MCA portal (mca.gov.in)',
          'Obtain Director Identification Number (DIN) and Digital Signature Certificate (DSC)',
          'File the incorporation form (SPICe+ for companies)',
          'Receive Certificate of Incorporation with CIN number',
          'For Proprietorship: No formal registration needed but get GSTIN and Shop Act license',
        ],
        documents: [
          'PAN card of all directors/partners',
          'Aadhaar card of all directors/partners',
          'Address proof of registered office',
          'Utility bill (not older than 2 months)',
          'NOC from property owner',
          'Passport-size photographs',
          'Board resolution / Subscribers\' consent',
        ],
      },
      {
        id: 'biz-gst',
        title: 'Obtain GST registration',
        description: 'Register for Goods and Services Tax if turnover exceeds ₹20 lakh (₹10 lakh for special states).',
        priority: 'high',
        category: 'Tax',
        steps: [
          'Visit the GST portal (gst.gov.in)',
          'Fill GST REG-01 form with business details',
          'Upload required documents',
          'Verify with Aadhaar OTP or Digital Signature',
          'GST certificate (GSTIN) issued within 3–7 working days',
        ],
        documents: [
          'PAN card of business / proprietor',
          'Aadhaar card',
          'Proof of business registration',
          'Bank account statement / cancelled cheque',
          'Address proof of business premises',
          'Photograph of the proprietor / partners',
        ],
      },
      {
        id: 'biz-msme',
        title: 'Register as MSME (Udyam Registration)',
        description: 'Get Udyam Registration for MSME benefits — subsidies, easier credit, and government scheme eligibility.',
        priority: 'high',
        category: 'Legal',
        steps: [
          'Visit the Udyam Registration portal (udyamregistration.gov.in)',
          'Enter Aadhaar number and verify with OTP',
          'Fill the business details (type, NIC code, investment, turnover)',
          'Submit — registration is free and instant',
          'Download the Udyam Registration Certificate',
        ],
        documents: [
          'Aadhaar card of the proprietor / authorized partner',
          'PAN card of the business',
          'Business address proof',
          'Bank account details',
        ],
      },
      {
        id: 'biz-bank',
        title: 'Open a current/business bank account',
        description: 'Open a dedicated bank account for business transactions.',
        priority: 'high',
        category: 'Finance',
        steps: [
          'Choose a bank with good business banking features',
          'Visit the branch with required documents',
          'Fill the account opening form for Current Account',
          'Some banks offer online account opening',
          'Link the account with GST portal and payment gateways',
        ],
        documents: [
          'Certificate of Incorporation / PAN of the business',
          'GST Registration Certificate',
          'Udyam Registration Certificate',
          'Identity proof of all signatories',
          'Address proof of business and signatories',
          'Board resolution (for companies)',
        ],
      },
      {
        id: 'biz-startup-india',
        title: 'Register on Startup India',
        description: 'Get recognized as a startup for tax benefits and government support.',
        priority: 'medium',
        category: 'Legal',
        steps: [
          'Visit the Startup India portal (startupindia.gov.in)',
          'Register your entity with DPIIT',
          'Submit incorporation certificate and a brief about your innovation',
          'Get DPIIT recognition number',
          'Avail benefits: tax exemptions (80-IAC), easier compliance, fund access',
        ],
        documents: [
          'Certificate of Incorporation',
          'Description of business innovation',
          'PAN card',
          'Authorization letter',
        ],
      },
      {
        id: 'biz-license',
        title: 'Obtain local trade/shop license',
        description: 'Get a Shop and Establishment Act license from the local municipal body.',
        priority: 'medium',
        category: 'Legal',
        steps: [
          'Visit the local Municipal Corporation / Gram Panchayat office',
          'Or apply online on your state\'s e-services portal',
          'Fill the application form with shop/establishment details',
          'Pay the licensing fee (varies by state and area)',
          'License is usually issued within 15–30 days',
        ],
        documents: [
          'Identity proof of the owner',
          'Address proof of the shop/establishment',
          'Rent agreement or ownership proof',
          'Passport-size photograph',
          'PAN card',
        ],
      },
    ],
  },

  relocation: {
    id: 'relocation',
    label: 'Relocation',
    emoji: '🏠',
    description: 'Moving to a new city or state',
    keywords: ['relocat', 'moving', 'moved', 'new city', 'new state', 'shifted', 'transfer', 'migration', 'new address', 'new house', 'new home'],
    checklist: [
      {
        id: 'reloc-aadhaar',
        title: 'Update address on Aadhaar',
        description: 'Update your new address on Aadhaar immediately — it\'s needed for most services.',
        priority: 'high',
        category: 'Identity',
        steps: [
          'Visit the UIDAI portal (uidai.gov.in) or nearest enrollment center',
          'Select "Update Aadhaar" → "Address Update"',
          'Choose online (if you have valid proof digitally) or visit center',
          'Upload or submit new address proof',
          'Updated Aadhaar letter will be available in 15–30 days',
        ],
        documents: [
          'Current Aadhaar card',
          'New address proof (rental agreement, utility bill, bank statement, property registration)',
          'Mobile number linked to Aadhaar',
        ],
      },
      {
        id: 'reloc-voter',
        title: 'Transfer voter ID to new address',
        description: 'Shift your voter registration to the new constituency.',
        priority: 'medium',
        category: 'Identity',
        steps: [
          'Visit the National Voter Service Portal (nvsp.in)',
          'Fill Form 6 for new voter registration at your new address',
          'Or fill Form 8A for transposition within the same constituency',
          'Upload ID proof and new address proof',
          'Your name will be added to the new electoral roll after verification',
        ],
        documents: [
          'Current voter ID card (EPIC)',
          'Aadhaar card with new address',
          'New address proof',
          'Passport-size photograph',
        ],
      },
      {
        id: 'reloc-driving',
        title: 'Update driving license address',
        description: 'Get your driving license updated with the new address via RTO.',
        priority: 'medium',
        category: 'Identity',
        steps: [
          'Visit the Parivahan portal (parivahan.gov.in)',
          'Select "Online Services" → "Driving License" → "Change of Address"',
          'Fill the application form (Form 1)',
          'Upload new address proof',
          'Pay the applicable fee (₹200–₹500)',
          'Visit the RTO for biometric verification if required',
        ],
        documents: [
          'Current driving license',
          'Aadhaar card with new address',
          'New address proof',
          'Passport-size photograph',
        ],
      },
      {
        id: 'reloc-bank',
        title: 'Update bank account address',
        description: 'Update your address across all bank accounts.',
        priority: 'high',
        category: 'Finance',
        steps: [
          'Visit your bank branch or use net banking',
          'Submit an address change request',
          'Some banks allow online address update via KYC update',
          'Update linked address for credit cards too',
          'Get a new cheque book if needed',
        ],
        documents: [
          'Updated Aadhaar card',
          'Passport or voter ID with new address',
          'Bank passbook or account number',
          'Utility bill of new address (optional)',
        ],
      },
      {
        id: 'reloc-utilities',
        title: 'Set up utility connections',
        description: 'Arrange electricity, water, gas, and internet connections at your new home.',
        priority: 'high',
        category: 'Utilities',
        steps: [
          'Apply for electricity connection from the local DISCOM',
          'Apply for water connection from the local municipal body',
          'Transfer or get new LPG (gas) connection — visit your nearest distributor',
          'Set up broadband/internet — choose a local ISP or national provider',
          'Update your mobile number address with your telecom provider',
        ],
        documents: [
          'Aadhaar card',
          'Rental agreement or property ownership proof',
          'Identity proof',
          'Previous connection transfer papers (for LPG)',
        ],
      },
      {
        id: 'reloc-school',
        title: 'Transfer school/college records (if applicable)',
        description: 'Get transfer certificates and admission in the new city.',
        priority: 'medium',
        category: 'Education',
        steps: [
          'Obtain Transfer Certificate (TC) from the current school',
          'Get migration certificate if moving across state boards',
          'Research and apply to schools in the new area',
          'Submit TC and other documents for admission',
          'Apply for any state-specific scholarships if eligible',
        ],
        documents: [
          'Transfer Certificate from previous school',
          'Migration Certificate (if inter-state)',
          'Previous report cards / mark sheets',
          'Aadhaar card of the student',
          'Address proof of new residence',
        ],
      },
      {
        id: 'reloc-ration',
        title: 'Transfer ration card',
        description: 'Transfer or apply for a new ration card at your new location.',
        priority: 'low',
        category: 'Government',
        steps: [
          'Surrender your existing ration card at the old FPS/office',
          'Apply for a new ration card at the destination via the PDS portal',
          'With One Nation One Ration Card (ONORC), ration can be drawn anywhere using Aadhaar',
          'Log into the state food & civil supplies portal for application',
        ],
        documents: [
          'Old ration card (or surrender acknowledgment)',
          'Aadhaar cards of all family members',
          'New address proof',
          'Income certificate (if applying for BPL/AAY card)',
        ],
      },
    ],
  },

  retirement: {
    id: 'retirement',
    label: 'Retirement',
    emoji: '🎯',
    description: 'Planning for or entering retirement',
    keywords: ['retire', 'retirement', 'retired', 'pension', 'senior', 'old age', 'superannuation', 'provident fund', 'epf', 'nps'],
    checklist: [
      {
        id: 'retire-pf',
        title: 'Withdraw or transfer EPF/PPF',
        description: 'Claim your Employee Provident Fund or transfer it.',
        priority: 'high',
        category: 'Finance',
        steps: [
          'Log into the EPFO portal (unifiedportal-mem.epfindia.gov.in)',
          'Submit Form 19 (PF Final Settlement) or Form 10C (Pension)',
          'You can also claim via Umang app or EPFO helpdesk',
          'If EPF is \u003e ₹50,000 and service \u003c 5 years, TDS may apply',
          'Amount is credited to your bank account within 15–20 days',
        ],
        documents: [
          'UAN (Universal Account Number)',
          'Aadhaar linked to UAN',
          'Bank account linked to UAN',
          'Form 15G/15H to avoid TDS (if applicable)',
        ],
      },
      {
        id: 'retire-pension',
        title: 'Activate pension benefits',
        description: 'Start receiving your pension from previous employer or government.',
        priority: 'high',
        category: 'Finance',
        steps: [
          'Submit Form 10D to EPFO for EPS (Employee Pension Scheme)',
          'For government employees: submit pension application to the Pay & Accounts Office',
          'For NPS: submit withdrawal form to the POP (Point of Presence)',
          'Choose between lump sum, annuity, or partial withdrawal',
          'Pension is credited monthly to your bank account',
        ],
        documents: [
          'Retirement/superannuation order from employer',
          'Bank account details',
          'Aadhaar card',
          'PAN card',
          'PPO (Pension Payment Order) if government employee',
        ],
      },
      {
        id: 'retire-senior-card',
        title: 'Apply for Senior Citizen Card',
        description: 'Get a Senior Citizen Identity Card for various discounts and benefits.',
        priority: 'medium',
        category: 'Identity',
        steps: [
          'Visit the District Social Welfare Office',
          'Or apply online through your state\'s citizen services portal',
          'Fill the application form',
          'Submit age proof and photograph',
          'Card enables discounts on transport, banking, and healthcare',
        ],
        documents: [
          'Aadhaar card',
          'Age proof (birth certificate, 10th marksheet, or passport)',
          'Address proof',
          'Passport-size photographs',
        ],
      },
      {
        id: 'retire-health',
        title: 'Enroll in senior health insurance',
        description: 'Get specialized health insurance or Ayushman Bharat coverage.',
        priority: 'high',
        category: 'Health',
        steps: [
          'Check eligibility for Ayushman Bharat (PMJAY) at pmjay.gov.in',
          'Visit the nearest Ayushman Bharat centre or CSC for enrollment',
          'For private insurance: compare senior citizen health plans',
          'Choose a plan with no waiting period for pre-existing conditions',
          'Ensure cashless facility at nearby hospitals',
        ],
        documents: [
          'Aadhaar card',
          'Age proof',
          'Ration card (for PMJAY eligibility check)',
          'Previous medical records (for private insurance)',
          'Bank account details',
        ],
      },
      {
        id: 'retire-scss',
        title: 'Open Senior Citizens Savings Scheme (SCSS)',
        description: 'Invest in SCSS for guaranteed returns and tax benefits.',
        priority: 'medium',
        category: 'Finance',
        steps: [
          'Visit any authorized bank or post office',
          'Fill the SCSS account opening form',
          'Deposit between ₹1,000 and ₹30 lakh',
          'Tenure is 5 years (extendable by 3 years)',
          'Interest is paid quarterly — currently ~8.2% p.a.',
          'Tax benefit under Section 80C (up to ₹1.5 lakh)',
        ],
        documents: [
          'Age proof (60+ years)',
          'Aadhaar card',
          'PAN card',
          'Retirement proof / superannuation order',
          'Passport-size photographs',
          'Cheque or demand draft for deposit amount',
        ],
      },
      {
        id: 'retire-will',
        title: 'Draft or update your will',
        description: 'Create or update your legal will to ensure smooth succession.',
        priority: 'medium',
        category: 'Legal',
        steps: [
          'List all your assets (property, bank accounts, investments, insurance)',
          'Decide on beneficiaries and their shares',
          'Draft the will — ideally with a legal advisor',
          'Sign in the presence of two witnesses',
          'Get it registered at the Sub-Registrar office (optional but recommended)',
          'Keep a copy with your lawyer and family',
        ],
        documents: [
          'Identity proof',
          'List of assets and investments',
          'Beneficiary details with their ID proof',
          'Stamp paper (for registration)',
        ],
      },
    ],
  },

  death_in_family: {
    id: 'death_in_family',
    label: 'Death in Family',
    emoji: '🕊️',
    description: 'Dealing with the loss of a family member',
    keywords: ['death', 'died', 'passed away', 'funeral', 'bereave', 'loss', 'demise', 'expired', 'deceased'],
    checklist: [
      {
        id: 'death-cert',
        title: 'Obtain death certificate',
        description: 'Register the death and obtain an official death certificate.',
        priority: 'high',
        category: 'Legal',
        steps: [
          'If death occurred in a hospital, collect the medical certificate of cause of death',
          'Visit the local Municipal Corporation / Gram Panchayat within 21 days',
          'Fill the death registration form (Form 2)',
          'Submit required documents',
          'Death certificate is issued within 7–14 days',
        ],
        documents: [
          'Medical certificate of cause of death (from hospital)',
          'Deceased\'s Aadhaar card',
          'Informant\'s identity proof',
          'Address proof',
          'Proof of cremation / burial (if available)',
        ],
      },
      {
        id: 'death-nominee',
        title: 'Claim bank deposits and nominee funds',
        description: 'Claim bank account balance, FDs, and any investments held by the deceased.',
        priority: 'high',
        category: 'Finance',
        steps: [
          'Visit the deceased\'s bank with the death certificate',
          'If nominee is registered, submit nominee claim form',
          'If no nominee, submit legal heir certificate or succession certificate',
          'Bank may release the funds after verification',
          'For FDs, PPF, and other investments, contact respective institutions',
        ],
        documents: [
          'Death certificate',
          'Nominee\'s ID proof (Aadhaar, PAN)',
          'Bank passbook / account details of the deceased',
          'Legal heir certificate or succession certificate (if no nominee)',
          'Relationship proof with the deceased',
        ],
      },
      {
        id: 'death-insurance',
        title: 'File insurance claims',
        description: 'Claim life insurance, accidental insurance, and other policy benefits.',
        priority: 'high',
        category: 'Finance',
        steps: [
          'Intimate the insurance company about the death',
          'Obtain and fill the claim form from the insurer',
          'Submit required documents within the claim window',
          'Insurance company will process and verify the claim',
          'Claim amount is credited to nominee\'s bank account',
        ],
        documents: [
          'Death certificate',
          'Original insurance policy document',
          'Claimant\'s (nominee) ID proof and bank details',
          'FIR (if accidental death)',
          'Post-mortem report (if applicable)',
          'Hospital records (if applicable)',
        ],
      },
      {
        id: 'death-succession',
        title: 'Obtain legal heir / succession certificate',
        description: 'Get a legal heir certificate for property and asset transfer.',
        priority: 'high',
        category: 'Legal',
        steps: [
          'Apply at the local Tahsildar / Revenue Department office',
          'Or apply through your state\'s online services portal',
          'Fill the application form with details of all legal heirs',
          'Verification by revenue officials may take 15–30 days',
          'For succession certificate, apply at the Civil Court',
        ],
        documents: [
          'Death certificate',
          'Aadhaar card of all legal heirs',
          'Relationship proof (ration card, family register)',
          'Property documents (if applicable)',
          'Application on stamp paper',
        ],
      },
      {
        id: 'death-pension',
        title: 'Apply for family pension / survivor benefits',
        description: 'If the deceased was a pensioner or government employee, apply for family pension.',
        priority: 'medium',
        category: 'Finance',
        steps: [
          'For government employees: submit Form 14 to the respective Pay & Accounts Office',
          'For EPF members: submit Form 10D to EPFO for family pension',
          'For private pension: contact the pension fund manager',
          'Family pension is usually 50% of the last drawn pension',
          'Some state governments also offer ex-gratia payments',
        ],
        documents: [
          'Death certificate',
          'Pensioner\'s PPO (Pension Payment Order)',
          'Spouse / dependent\'s Aadhaar, PAN, bank details',
          'Marriage certificate or family proof',
        ],
      },
      {
        id: 'death-property',
        title: 'Initiate property mutation / transfer',
        description: 'Transfer property ownership to legal heirs.',
        priority: 'medium',
        category: 'Legal',
        steps: [
          'Apply at the local Sub-Registrar or Tehsildar office',
          'Submit mutation application with legal heir certificate',
          'Land / property records will be updated after verification',
          'For urban property: apply at the local municipal corporation',
          'For joint ownership: surviving owner\'s name will be retained',
        ],
        documents: [
          'Death certificate',
          'Legal heir / succession certificate',
          'Property documents (sale deed, registry)',
          'Aadhaar card of legal heirs',
          'Property tax receipts',
        ],
      },
    ],
  },

  education: {
    id: 'education',
    label: 'Higher Education',
    emoji: '🎓',
    description: 'Starting college or advanced studies',
    keywords: ['college', 'university', 'education', 'higher studies', 'degree', 'admission', 'scholarship', 'student', 'study abroad', 'masters', 'engineering', 'medical'],
    checklist: [
      {
        id: 'edu-admission',
        title: 'Complete admission formalities',
        description: 'Gather and submit all documents required for college admission.',
        priority: 'high',
        category: 'Education',
        steps: [
          'Check the admission portal of your chosen institution',
          'Fill the application form online',
          'Pay the application fee',
          'Appear for entrance exams if required',
          'Report for document verification and counseling',
          'Pay the admission fee and confirm your seat',
        ],
        documents: [
          '10th and 12th mark sheets and certificates',
          'Transfer Certificate from previous institution',
          'Migration Certificate (if inter-state)',
          'Aadhaar card',
          'Passport-size photographs',
          'Category/caste certificate (if applicable)',
          'Income certificate',
          'Entrance exam scorecard (if applicable)',
        ],
      },
      {
        id: 'edu-scholarship',
        title: 'Apply for government scholarships',
        description: 'Check and apply for Central and State government scholarships.',
        priority: 'high',
        category: 'Finance',
        steps: [
          'Visit the National Scholarship Portal (scholarships.gov.in)',
          'Check eligibility for various scholarships based on category, income, and merit',
          'Register and fill the online application form',
          'Get the application verified by your institution',
          'Track the status online — scholarships are credited to your bank account',
        ],
        documents: [
          'Aadhaar card',
          'Bank passbook (student\'s own account)',
          'Income certificate of parent/guardian',
          'Caste/category certificate (if applicable)',
          'Previous year mark sheets',
          'Admission letter / bonafide certificate',
          'Fee receipt',
        ],
      },
      {
        id: 'edu-loan',
        title: 'Apply for education loan',
        description: 'Get an education loan from banks for tuition, hostel, and other expenses.',
        priority: 'high',
        category: 'Finance',
        steps: [
          'Compare education loan options from PSU and private banks',
          'For loans up to ₹7.5 lakh: no collateral needed',
          'Check eligibility for Vidya Lakshmi Portal integrated loans',
          'Apply online or visit the bank branch with documents',
          'Loan is disbursed directly to the institution',
          'Repayment starts 1 year after course completion',
        ],
        documents: [
          'Admission letter from the institution',
          'Fee structure details',
          'Student\'s Aadhaar card and PAN',
          'Co-applicant\'s (parent) income proof',
          'Bank statements (last 6 months)',
          'Collateral papers (for loans above ₹7.5 lakh)',
          'Mark sheets of previous exams',
        ],
      },
      {
        id: 'edu-id',
        title: 'Get student ID and academic cards',
        description: 'Obtain your student identity card, library card, and bus pass.',
        priority: 'medium',
        category: 'Education',
        steps: [
          'Visit the institution\'s admin/registration desk',
          'Submit photographs and ID details',
          'Get student ID card, library card, and lab access card',
          'Apply for a concessional bus/metro pass using student ID',
          'Register on the institution\'s ERP/portal for online services',
        ],
        documents: [
          'Admission receipt',
          'Passport-size photographs',
          'Aadhaar card',
          'Fee payment receipt',
        ],
      },
      {
        id: 'edu-hostel',
        title: 'Apply for hostel accommodation',
        description: 'Apply for on-campus hostel or verify private accommodation.',
        priority: 'medium',
        category: 'Education',
        steps: [
          'Check the hostel availability on the institution\'s portal',
          'Fill the hostel application form',
          'Pay the hostel fee and mess charges',
          'Complete hostel check-in formalities on the allotted date',
          'For private accommodation: get a rental agreement and inform the institution',
        ],
        documents: [
          'Admission letter',
          'Aadhaar card',
          'Parent/guardian\'s contact details',
          'Medical fitness certificate (some institutions require this)',
          'Passport-size photographs',
        ],
      },
    ],
  },
};

// ─── Event detection ────────────────────────────────────────────────────────

function detectEvent(input) {
  const normalized = norm(input);
  let bestMatch = null;
  let bestScore = 0;

  for (const [eventId, event] of Object.entries(LIFE_EVENTS)) {
    let score = 0;
    for (const keyword of event.keywords) {
      if (normalized.includes(keyword)) {
        score += keyword.length; // longer keyword matches are more specific
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = eventId;
    }
  }

  return bestMatch;
}

// ─── Routes ─────────────────────────────────────────────────────────────────

/**
 * GET /api/life-events
 * Returns the list of available life event categories.
 */
router.get('/', auth, (req, res) => {
  const events = Object.values(LIFE_EVENTS).map((e) => ({
    id: e.id,
    label: e.label,
    emoji: e.emoji,
    description: e.description,
    taskCount: e.checklist.length,
  }));
  res.json({ events });
});

/**
 * POST /api/life-events/checklist
 * Accepts { event: string } — either a category ID or free-form text.
 * Returns the matched checklist.
 */
router.post('/checklist', auth, (req, res) => {
  const { event } = req.body;
  if (!event || typeof event !== 'string' || event.trim().length === 0) {
    return res.status(400).json({ message: 'Event description is required.' });
  }

  const input = event.trim();

  // Try exact ID match first
  let eventData = LIFE_EVENTS[input];

  // Try keyword-based detection
  if (!eventData) {
    const detected = detectEvent(input);
    if (detected) {
      eventData = LIFE_EVENTS[detected];
    }
  }

  if (!eventData) {
    return res.status(200).json({
      matched: false,
      message: 'We could not match your input to a specific life event. Try selecting one from the list or describe your situation (e.g., "I just got married", "starting a business", "relocating to a new city").',
      availableEvents: Object.values(LIFE_EVENTS).map((e) => ({
        id: e.id,
        label: e.label,
        emoji: e.emoji,
      })),
    });
  }

  return res.json({
    matched: true,
    event: {
      id: eventData.id,
      label: eventData.label,
      emoji: eventData.emoji,
      description: eventData.description,
    },
    checklist: eventData.checklist,
    totalTasks: eventData.checklist.length,
  });
});

module.exports = router;
