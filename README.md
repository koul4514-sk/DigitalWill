🛡️ Digital Legacy Guard
Securely organize, protect, and transfer your digital legacy.

Digital Legacy Guard is a digital estate management platform designed to help individuals securely organize important documents, digital assets, personal instructions, and other information that may need to be accessed by trusted nominees in the future.

As more of our lives move online, important information is increasingly scattered across cloud services, financial platforms, social accounts, subscriptions, personal documents, and digital assets. Digital Legacy Guard provides a centralized place to organize this information and control who can access it.

Built as a full-stack web application with a privacy-first approach.

✨ Features
👤 Owner Dashboard

Users can manage their digital estate from a centralized dashboard.

Secure user authentication
Digital estate overview
Recent activity
Digital estate health/status overview
Quick actions
Profile and security settings
🔐 Digital Vault

A centralized space for important documents and information.

Upload and manage documents
Organize documents by category
Search and filter documents
Document metadata
Secure access controls

Supported categories include:

Identity
Financial
Legal
Medical
Insurance
Property
Other important records
💻 Digital Assets

Keep track of important online and digital assets.

Examples include:

Social media accounts
Developer accounts
Cloud storage
Subscriptions
Financial accounts
Insurance
Digital services

Users can add, update, categorize, and manage their digital assets.

👥 Nominee Management

Users can designate trusted nominees who may need access to selected information.

Add nominees
Edit nominee information
Remove nominees
Define access permissions
Control which areas a nominee can access

The permission model is designed so that nominees only receive the access explicitly granted to them.

📜 Digital Instructions

Users can create instructions for their nominees or executors.

Instructions can contain:

Title
Description
Priority
Important actions
Additional information

This helps ensure that important wishes and procedures are documented rather than relying entirely on memory or verbal instructions.

✅ Executor Checklist

A structured checklist helps nominees organize the actions they may need to take when executing the owner's instructions.

📊 Estate Overview

The dashboard provides an overview of the digital estate, including relevant assets, nominees, activity, and completion/status indicators.

🔑 Access Control

Digital Legacy Guard is designed around two primary roles:

Owner

The owner has complete control over their digital estate.

They can:

Manage documents
Manage digital assets
Manage nominees
Configure permissions
Create instructions
Review estate information
Manage account/security settings
Nominee

A nominee receives only the permissions granted by the owner.

The nominee:

Cannot modify the owner's estate
Cannot access restricted information
Only sees permitted sections
Can access assigned instructions and resources

For example, if financial access is disabled for a nominee, the financial section should not be exposed to that nominee.

🏗️ Technology Stack
Frontend
React 19
TypeScript
Vite
TanStack Router
TanStack React Query
Tailwind CSS
Radix UI
React Hook Form
Zod
Lucide React
Recharts
Sonner
Backend / Services

The current project includes infrastructure for:

Node.js
Express 5
MySQL
mysql2
Nodemailer
bcryptjs
Helmet
CORS
Rate limiting
Development
ESLint
Prettier
TypeScript
Vite
Lovable development integration

The dependency configuration in the current repository confirms the React 19, TypeScript, Vite, Tailwind, TanStack, Express, MySQL, authentication/security, email, and validation tooling.

🧩 Architecture

The application is structured as a modular web application with reusable UI components, routing, state/data management, validation, and backend/service integrations.

High-level architecture:

┌──────────────────────────────────────┐
│              Frontend                │
│                                      │
│ React + TypeScript + Vite            │
│ TanStack Router + React Query        │
│ Tailwind CSS + Radix UI              │
└──────────────────┬───────────────────┘
                   │
                   │ API / Service Layer
                   ▼
┌──────────────────────────────────────┐
│             Application              │
│                                      │
│ Authentication                       │
│ Authorization / Permissions           │
│ Validation                           │
│ Document Management                  │
│ Digital Assets                       │
│ Nominee Management                   │
│ Digital Instructions                 │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│             Data Layer               │
│                                      │
│ MySQL                                │
│ File / Document Storage              │
│ Email Services                       │
│ Audit / Activity Data                │
└──────────────────────────────────────┘
📁 Project Structure
DigitalWill/
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── context/
│   ├── services/
│   ├── utils/
│   ├── assets/
│   └── styles/
│
├── .lovable/
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── components.json
└── README.md
🚀 Getting Started
Prerequisites

Make sure you have installed:

Node.js
npm
Clone the repository
git clone https://github.com/koul4514-sk/DigitalWill.git
cd DigitalWill
Install dependencies
npm install
Start the development server
npm run dev

The Vite development server will provide the local URL in your terminal.

🛠️ Available Scripts
Command	Description
npm run dev	Start development server
npm run build	Create production build
npm run build:dev	Create development-mode build
npm run preview	Preview production build
npm run lint	Run ESLint
npm run format	Format the project with Prettier

These scripts correspond to the current package.json.

🔒 Security

Digital Legacy Guard handles potentially sensitive personal and digital-estate information, so security is a core design consideration.

The project includes tooling for:

Password hashing
Authentication
Authorization
Role-based access
Request validation
Input validation
CORS configuration
HTTP security headers
Rate limiting
Environment-based configuration
Controlled nominee permissions
⚠️ Important

This project is currently a development/hackathon application.

Do not treat the current implementation as a production-grade digital estate or legal-will system without independently auditing:

Encryption at rest
Key management
Authentication flows
Authorization boundaries
File-storage security
Database security
Backup and recovery
Audit logging
Account recovery
Email security
Data retention/deletion
Legal requirements surrounding wills and inheritance

Security claims should only be made for mechanisms that are actually implemented and tested.

🔮 Future Improvements

Planned or potential improvements include:

End-to-end encryption for sensitive information
Stronger document encryption and key management
Multi-factor authentication
OTP-based nominee verification
Advanced audit logs
Automated estate health checks
Secure cloud document storage
Scheduled reminders
Emergency access workflows
Dead-man-switch style activation mechanisms
Multi-nominee approval workflows
Legal-document integrations
AI-assisted estate organization and execution planning
AI Integration

AI-assisted execution planning is considered a future feature.

The current application does not rely on AI for its core functionality.

🎯 Project Goals

Digital Legacy Guard aims to solve a simple but increasingly important problem:

What happens to your digital life when you can no longer manage it yourself?

The project focuses on three principles:

1. Organization
Bring important digital information into one structured system.

2. Control
Give the owner explicit control over what each nominee can access.

3. Continuity
Make important instructions and digital assets easier for trusted people to manage when necessary.

🤝 Contributing

Contributions, ideas, bug reports, and improvements are welcome.

If you find a bug or have an idea for a feature:

Open an issue.
Describe the problem or proposed improvement.
Provide reproduction steps where applicable.
Submit a pull request for approved changes.
📄 License

License information will be added as the project is finalized.

👨‍💻 Project

Digital Legacy Guard

A privacy-focused digital estate management platform for organizing digital assets, documents, nominees, and post-access instructions.

Repository:
https://github.com/koul4514-sk/DigitalWill
