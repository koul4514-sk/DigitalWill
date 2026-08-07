# Digital Legacy Guard

Here's a polished, hackathon-ready project description you can use in your documentation or presentation:

LegacyVault AI is a secure Digital Estate Management platform designed to help individuals organize, protect, and transfer their digital legacy to trusted nominees. In today's digital world, important documents, online accounts, financial records, subscriptions, and digital assets are often scattered across multiple platforms, making them difficult for family members or legal executors to access when needed. LegacyVault AI provides a centralized platform where users can securely store encrypted documents, register one or more nominees, manage digital assets, and define access permissions for each nominee. The platform follows a privacy-first approach by encrypting sensitive information before storage, ensuring that only authorized users can access it. A dedicated nominee portal displays only the resources and permissions granted by the owner, preventing unauthorized access to confidential information. The system includes secure authentication, role-based access control, document management, digital instructions, executor checklists, and audit logs to help nominees carry out the owner's wishes in an organized and transparent manner. By combining modern web technologies with strong cybersecurity principles, LegacyVault AI offers a reliable and user-friendly solution for preserving and securely managing a person's digital legacy.

You are a Senior Software Engineer, Senior Full Stack Developer, Cybersecurity Engineer, UI/UX Designer and System Architect.

You are my technical co-founder.

Your responsibility is to build this project from scratch with production-quality architecture.

Do NOT generate everything at once.

Think before coding.

Follow industry best practices.

Always explain architecture before implementation.

Generate modular, reusable, maintainable code.

====================================================

PROJECT NAME

====================================================

LegacyVault AI

====================================================

PROJECT DESCRIPTION

====================================================

LegacyVault AI is a Digital Estate Management Platform.

The platform allows users to securely organize their digital legacy.

Users can:

• Create a Digital Estate

• Store important digital asset information

• Upload encrypted documents

• Register one or more nominees

• Assign permissions to nominees

• Create digital instructions

• Generate AI-based execution plans (future integration)

The first version will NOT include AI integration.

The focus is on creating a professional Full Stack Web Application.

====================================================

TECH STACK

====================================================

Frontend

React.js

JavaScript

Tailwind CSS

React Router DOM

Axios

Framer Motion

React Hook Form

Lucide React Icons

Backend

Node.js

Express.js

JavaScript

MySQL

JWT Authentication

bcrypt

Multer

Helmet

CORS

dotenv

Morgan

File Upload

Database

MySQL

Storage

Local Storage (development)

Encryption layer prepared for future implementation.

Deployment

Frontend

Vercel

Backend

Render / Railway

Database

MySQL

====================================================

PROJECT STRUCTURE

====================================================

Frontend

client/

src/

components/

pages/

layouts/

hooks/

context/

services/

utils/

assets/

styles/

Backend

server/

controllers/

routes/

middleware/

models/

config/

services/

uploads/

utils/

database/

====================================================

DESIGN STYLE

====================================================

Professional

Modern

Dark Theme

Apple Inspired

Glassmorphism

Blue Accent

Responsive

Minimal

Premium Dashboard

Smooth animations

====================================================

ROLES

====================================================

Owner

Nominee

====================================================

OWNER FEATURES

====================================================

Authentication

Signup

Login

Logout

Forgot Password

Dashboard

View Estate Summary

View Nominee Status

Recent Activity

Digital Health Score

Quick Actions

Digital Vault

Upload Documents

View Documents

Search Documents

Filter Documents

Delete Documents

Document Categories

Insurance

Identity

Property

Medical

Legal

Financial

Digital Assets

Add Asset

Edit Asset

Delete Asset

Asset Categories

Subscriptions

Social Accounts

Developer Accounts

Cloud Storage

Financial Accounts

Insurance

Property

Nominee Management

Add Nominee

Edit Nominee

Delete Nominee

Grant Permissions

Permission Toggles

Encrypted Vault

Digital Instructions

Financial Overview

Executor Checklist

Settings

Profile

Security

Notifications

Appearance

====================================================

NOMINEE FEATURES

====================================================

Separate Login

OTP Placeholder

Dashboard

Only display permissions granted by owner.

Nominee can NEVER edit owner data.

Pages

Dashboard

My Access

Encrypted Vault

Digital Instructions

Financial Overview

Executor Checklist

Estate Timeline

Security

Permissions should dynamically control visible pages.

If owner disables Financial Access

Nominee should never see Financial Overview.

Hide the navigation completely.

====================================================

AUTHENTICATION

====================================================

Use JWT Authentication.

Passwords must be hashed using bcrypt.

Implement

Signup

Login

Logout

Protected Routes

Role Based Access

Owner

Nominee

Store JWT securely.

====================================================

DATABASE

====================================================

Create MySQL Schema.

Tables

users

id

full_name

email

password

phone

role

created_at

nominees

id

owner_id

nominee_name

email

phone

relationship

permissions_json

documents

id

owner_id

file_name

file_path

category

uploaded_at

digital_assets

id

owner_id

asset_name

category

status

digital_instructions

id

owner_id

title

description

priority

audit_logs

id

user_id

action

created_at

====================================================

API ENDPOINTS

====================================================

Authentication

POST /api/auth/signup

POST /api/auth/login

POST /api/auth/logout

Owner

GET /api/dashboard

POST /api/assets

PUT /api/assets/:id

DELETE /api/assets/:id

GET /api/assets

POST /api/documents

DELETE /api/documents/:id

GET /api/documents

POST /api/nominees

PUT /api/nominees/:id

DELETE /api/nominees/:id

GET /api/nominees

Nominee

GET /api/nominee/dashboard

GET /api/nominee/access

GET /api/nominee/instructions

GET /api/nominee/checklist

====================================================

SECURITY

====================================================

Use Helmet.

Use CORS.

Validate every request.

Use Express Validator.

Hash passwords using bcrypt.

Sanitize inputs.

Rate limit authentication.

Store environment variables in .env.

Never expose secrets.

Prepare architecture for future AES Encryption.

====================================================

UI REQUIREMENTS

====================================================

Use reusable components.

Sidebar

Navbar

Cards

Buttons

Inputs

Tables

Dialogs

Modals

Empty States

Loading Skeletons

Responsive Design

Maintain consistent spacing.

====================================================

ROUTING

====================================================

/

/login

/signup

/dashboard

/vault

/assets

/nominees

/instructions

/settings

Nominee

/nominee/login

/nominee/dashboard

/nominee/access

/nominee/vault

/nominee/instructions

/nominee/checklist

/nominee/security

====================================================

WORKFLOW

====================================================

DO NOT generate everything together.

Build step-by-step.

Phase 1

Project Structure

Phase 2

React Frontend

Phase 3

Express Backend

Phase 4

MySQL Database

Phase 5

Authentication

Phase 6

CRUD APIs

Phase 7

Frontend Integration

Phase 8

Testing

====================================================

IMPORTANT

====================================================

Do not skip architecture.

Before generating code:

Explain why each folder exists.

Explain why each package is used.

Explain every API.

Explain every database table.

Explain every React component.

Explain every Express middleware.

After each module:

Wait for my confirmation before continuing.

Act like a Senior Software Architect mentoring a junior developer.

Do not move to the next phase until I approve the current one.

Generate production-quality code only.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c39ba82e-1f46-4cd2-a28d-d5418823fb99).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
