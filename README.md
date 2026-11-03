# Laundry Service Booking System (LSBS)

A full-stack MERN application (MongoDB, Express, React, Node.js) for booking, assigning and tracking laundry pickups and drop-offs.

## About this assignment

**Assessment 1**

Assignment: **Software requirements analysis and design (Full-Stack CRUD Application Development with DevOps Practices)**

### Objective

For this assessment, you have already been assigned a project. Your task is to develop a system that implements CRUD (Create, Read, Update, Delete) operations based on the selected project. The system should include both a user panel and an admin panel. Depending on the nature of your chosen project, you may decide how many CRUD operations are required to support the functionality of the system. You have been provided with a starter project that includes user authentication using Node.js, React.js, and MongoDB. You should extend this application based on your assigned project requirements, and ensure that the implemented features are appropriate and meaningful for your selected project.

In this assignment you will complete the following tasks:

- Basic version control using GitHub
- Development, CI/CD integration for automated deployment
- Project report

---

## Problem definition

### Background

The client is a laundry chain that currently runs one store, with plans to open more locations. The business offers a pickup and drop-off service, which involves three main groups of people: store managers, drivers and customers. At present, pickups and drop-offs are arranged over the phone or at the counter, and are tracked informally. As the business grows, this way of working will become harder to manage.

### Problem statement

The current process has no central system for booking, assigning or tracking orders. This causes the following problems:

1. **Booking clashes:** There is no slot system for pickups, so pickup times can clash or get missed.
2. **No overview for managers:** Managers have no single view of which driver is collecting which order.
3. **Informal job allocation:** Drivers get their job details by phone or message, so there is no reliable list of their assigned work.
4. **No order visibility for customers:** Customers have to call the store to find out where their laundry is.
5. **No change history:** There is no record of who changed or cancelled an order.

### Impact on the business

These problems lead to missed pickups, staff time spent answering phone calls, and orders that get mixed up or lost. Because there is no record of changes, disputes between the store and customers cannot be settled with any evidence.

### Proposed solution

LSBS replaces the informal process with one central system:

- Customers can book a 30-minute pickup slot online.
- Each order gets a single ticket, which is tracked from booking through to completion.
- Managers assign drivers to orders, and each driver can see only their own jobs.
- Anyone can check an order's status using the ticket number plus the email address or phone number on the order.
- Every action in the system is logged, so there is a full history of each order.

### Scope

Payments and notifications (such as SMS or email alerts) are out of scope for this version of LSBS.

### Assumptions

- Pickups and drop-offs are currently arranged by phone or at the counter, and are tracked informally (for example, on paper or in a notebook) rather than in a dedicated system.

---

## Roles and stakeholders

### User roles

| Role | Description |
| --- | --- |
| System Admin | Ideally the chain owner |
| Manager | The store manager |
| Driver | Has a login and sees only their assigned jobs |
| Customer | Books pickups and tracks orders |

### Stakeholders

- Laundry chain owner (project / business owner; System Admin in the app)
- Store manager
- Driver
- Customers
- Project manager (Zain)
- Developer (Zain)

### Scrum roles

| Scrum role | Person |
| --- | --- |
| Product Owner | Business owner (Zain acts on their behalf) |
| Scrum Master | Zain |
| Developer | Zain |

---

## Getting started

### Prerequisites

- Node.js and npm
- A MongoDB connection string (for example, MongoDB Atlas)

### Setup

1. Install dependencies for the root, backend and frontend:

   ```bash
   npm run install-all
   ```

2. Copy `backend/.env.example` to `backend/.env` and fill in the values:

   ```
   MONGO_URI=<your MongoDB connection string>
   JWT_SECRET=<a long random secret>
   PORT=5001
   ```

3. Run the backend and frontend together in development mode:

   ```bash
   npm run dev
   ```

### Project structure

```
backend/    Express API (config, controllers, middleware, models, routes)
frontend/   React app (Tailwind CSS)
docs/       Project documentation, including the problem definition
```

See [docs/LSBS_Problem_Definition.md](docs/LSBS_Problem_Definition.md) for the full problem definition.
