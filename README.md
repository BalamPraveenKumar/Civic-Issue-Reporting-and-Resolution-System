# Civic Issue Reporting and Resolution System

A full-stack web application that enables citizens to report civic issues to their local administration and track their resolution in real time. The platform streamlines complaint management by allowing district administrators to verify, prioritize, assign, and resolve issues through a centralized dashboard.

---

# Table of Contents

- Overview
- Features
- Technology Stack
- System Architecture
- Project Structure
- Database Collections
- API Modules
- Installation
- Environment Variables
- Running the Project
- User Roles
- Workflow
- Future Enhancements
- Screenshots
- Author

---

# Overview

The Civic Issue Reporting and Resolution System is designed to bridge the communication gap between citizens and local government authorities.

Instead of relying on manual complaint registration or physical visits to government offices, citizens can submit complaints online with supporting images and location details. District administrators receive these complaints through an admin dashboard where they can verify, assign, update, and resolve them efficiently.

The system ensures transparency by allowing users to monitor the progress of their complaints from submission to resolution.

---

# Features

## Citizen Features

- Firebase OTP Authentication
- Secure JWT Authentication
- Register/Login
- Report civic issues
- Upload complaint images
- Add issue location
- Select complaint category
- Track complaint status
- View complaint history
- Receive status updates
- Edit profile

---

## Admin Features

- Secure Admin Login
- Dashboard with statistics
- View complaints district-wise
- Filter complaints
- Search complaints
- Update complaint status
- Assign priority
- Mark complaints as resolved
- Manage users
- Manage administrators
- View reports

---

## Complaint Features

- Road Damage
- Water Supply Issues
- Drainage Problems
- Garbage Collection
- Street Light Issues
- Public Property Damage
- Sewage Problems
- Other Civic Issues

---

# Technology Stack

## Frontend

- React.js
- React Router
- Axios
- CSS
- Bootstrap

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Authentication

- Firebase Phone OTP Authentication
- JSON Web Token (JWT)

## File Upload

- Multer

---

# System Architecture

```
Citizen
     │
     ▼
React Frontend
     │
Axios API Calls
     │
     ▼
Express.js Server
     │
Controllers
     │
Services
     │
MongoDB Database
```

---

# Project Structure

```
backend
│
├── config
├── controllers
├── middleware
├── models
├── routes
├── services
├── uploads
├── utils
├── validations
├── app.js
├── server.js
└── package.json

frontend
│
├── public
├── src
│   ├── components
│   ├── pages
│   ├── services
│   ├── assets
│   ├── utils
│   └── App.js
└── package.json
```

---

# Database Collections

## districts

Stores district information.

Example Fields

```
_id
districtName
state
createdAt
updatedAt
```

---

## admins

Stores administrator details.

Example Fields

```
_id
name
email
password
districtId
role
createdAt
```

---

## users

Stores citizen details.

Example Fields

```
_id
name
phone
districtId
address
createdAt
```

---

## problems

Stores reported civic issues.

Example Fields

```
_id
title
description
category
image
location
districtId
status
priority
reportedBy
assignedTo
createdAt
updatedAt
```

---

# API Modules

## Authentication APIs

### User

- Login
- Generate JWT
- Verify Token

### Admin

- Login
- Generate JWT
- Verify Token

---

## District APIs

- Get Districts
- Get District Details

---

## User APIs

- Register User
- Login User
- Get Profile
- Update Profile

---

## Complaint APIs

- Create Complaint
- Upload Image
- Get My Complaints
- Get Complaint Details
- Update Complaint
- Delete Complaint

---

## Admin Complaint APIs

- Get All Complaints
- Filter Complaints
- Search Complaints
- Change Status
- Assign Priority
- Resolve Complaint

---

## Admin Management APIs

- Create Admin
- Update Admin
- Delete Admin
- Get Admin List

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/civic-issue-reporting-system.git
```

Move into the project directory.

```bash
cd civic-issue-reporting-system
```

---

## Install Backend Dependencies

```bash
cd backend
npm install
```

---

## Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

# Environment Variables

Create a `.env` file inside the backend folder.

```
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

FIREBASE_PROJECT_ID=your_project_id

FIREBASE_CLIENT_EMAIL=your_client_email

FIREBASE_PRIVATE_KEY=your_private_key
```

---

# Running the Project

## Start Backend

```bash
npm run dev
```

---

## Start Frontend

```bash
npm start
```

---

# User Roles

## Citizen

- Register/Login
- Report Issues
- Upload Images
- Track Complaint Status
- View Complaint History

---

## District Administrator

- Login
- View Dashboard
- Manage Complaints
- Assign Priority
- Update Complaint Status
- Resolve Complaints
- Manage Users
- View Reports

---

# Complaint Workflow

```
Citizen Login
      │
      ▼
Submit Complaint
      │
      ▼
Complaint Stored in MongoDB
      │
      ▼
Admin Dashboard
      │
      ▼
Complaint Verification
      │
      ▼
Status Updated
      │
      ▼
Issue Assigned
      │
      ▼
Issue Resolved
      │
      ▼
Citizen Can Track Progress
```

---

# Future Enhancements

- AI-based complaint categorization
- Duplicate complaint detection
- GIS map integration
- SMS notifications
- Push notifications
- Email notifications
- Complaint analytics dashboard
- Mobile application
- Multi-language support
- QR code-based complaint tracking

---

# Screenshots

Add screenshots of:

- Home Page
- User Login
- OTP Verification
- Complaint Registration
- Complaint Tracking
- User Dashboard
- Admin Login
- Admin Dashboard
- Complaint Management
- Reports Page

---

# Security Features

- Firebase OTP Authentication
- JWT Authorization
- Password Encryption
- Protected API Routes
- Role-Based Access Control
- Input Validation
- Secure File Upload
- Error Handling

---

# Key Highlights

- Full-Stack MERN Application
- Secure Authentication using Firebase OTP and JWT
- District-wise Complaint Management
- Real-Time Complaint Tracking
- Image Upload Support
- Responsive User Interface
- RESTful API Architecture
- Modular Backend Structure
- Scalable and Maintainable Codebase

---

# Author

**Praveen Kumar**

Full Stack Developer

---

## License

This project is developed for academic purposes and can be extended for real-world civic governance and smart city applications.
