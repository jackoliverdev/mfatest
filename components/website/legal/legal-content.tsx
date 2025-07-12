import React from "react";
import ReactMarkdown from "react-markdown";

// Custom components for react-markdown to ensure proper spacing and font weights
const markdownComponents = {
  h1: (props: any) => <h1 className="text-2xl font-bold mt-2 mb-4" {...props} />,
  h2: (props: any) => <h2 className="text-xl font-semibold mt-6 mb-3" {...props} />,
  h3: (props: any) => <h3 className="text-lg font-semibold mt-5 mb-2" {...props} />,
  p: (props: any) => <p className="mb-4 leading-relaxed" {...props} />,
  ul: (props: any) => <ul className="list-disc ml-6 mb-4" {...props} />,
  ol: (props: any) => <ol className="list-decimal ml-6 mb-4" {...props} />,
  li: (props: any) => <li className="mb-1" {...props} />,
  a: (props: any) => <a className="underline text-primary font-medium" {...props} />,
};

type LegalContentProps = {
  type: "terms" | "privacy" | "cookie";
};

const content = {
  terms: `
# Terms & Conditions

Welcome to Example Ltd. By accessing and using this website, you agree to comply with the following terms and conditions. Please read these terms carefully before using our services.

## 1. Use of Services
Our services are provided exclusively for business use. You must not use our website or services for any unlawful, fraudulent, or unauthorised purpose. Users are responsible for ensuring that their use of our services complies with all applicable laws and regulations.

- You agree not to misuse, disrupt, or attempt to gain unauthorised access to any part of our website or systems.
- We reserve the right to suspend or terminate your access to our services at our discretion, without notice, for any breach of these terms.

## 2. Intellectual Property
All content, trademarks, and intellectual property on this website are owned by Example Ltd or our licensors. You may not reproduce, distribute, or create derivative works without our express written consent.

## 3. Amendments
We may update or amend these terms at any time. Changes will be effective immediately upon posting. Continued use of the site constitutes acceptance of any changes. Please review these terms regularly.

## 4. Limitation of Liability
To the fullest extent permitted by law, Example Ltd shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of this website or our services. Our liability is limited to the amount paid by you for the relevant service, if any.

## 5. Governing Law
These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the English courts.

For bespoke agreements or further details, please contact our legal team at [legal@example.com](mailto:legal@example.com).
`,
  privacy: `
# Privacy Policy

At Example Ltd, we are committed to protecting your privacy and handling your data responsibly. This policy explains how we collect, use, and safeguard your personal information in accordance with the UK GDPR and Data Protection Act 2018.

## 1. Data Collection
We collect business contact details, usage data, and technical information to deliver and enhance our services. Data is collected when you:

- Register for an account or use our services
- Contact us for support or enquiries
- Visit our website (via cookies and analytics tools)

## 2. Use of Data
We use your data to:

- Provide and improve our services
- Communicate with you about your account or service updates
- Comply with legal obligations

## 3. Data Sharing & Security
We do not sell or rent your personal data. Your information may be shared with trusted third parties only as required to deliver our services or comply with the law. We implement robust technical and organisational measures to protect your data against unauthorised access, alteration, or loss.

## 4. Data Retention
We retain your data only as long as necessary to fulfil contractual and legal obligations. You may request deletion of your data at any time, subject to legal requirements.

## 5. Your Rights
You have the right to access, correct, or request deletion of your personal data. You may also object to or restrict certain processing activities. For any privacy-related queries, please contact our Data Protection Officer at [privacy@example.com](mailto:privacy@example.com).
`,
  cookie: `
# Cookie Policy

This website uses cookies to enhance your experience, analyse site usage, and support essential site functionality. Cookies are small text files stored on your device and may be managed through your browser settings.

## 1. Types of Cookies We Use
- **Essential cookies**: Required for core site functionality and security.
- **Analytics cookies**: Help us understand how our site is used and improve our services.
- **Preference cookies**: Remember your settings and preferences for future visits.

## 2. Managing Cookies
You may disable cookies at any time via your browser settings. Please note that disabling certain cookies may affect the functionality and performance of the site.

## 3. Third-Party Cookies
Some cookies may be set by third-party services integrated into our site (e.g., analytics providers). We recommend reviewing the privacy policies of these providers for further information.

## 4. Further Information
For more information about our use of cookies or to review your preferences, please consult our full cookie policy or contact our support team at [support@example.com](mailto:support@example.com).
`
};

export default function LegalContent({ type }: LegalContentProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none pb-2">
      <ReactMarkdown components={markdownComponents}>
        {content[type]}
      </ReactMarkdown>
    </div>
  );
} 