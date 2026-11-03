# Problem Definition

## Background

The client is a laundry chain that currently runs one store, with plans to open more locations. The business offers a pickup and drop-off service, which involves three main groups of people: store managers, drivers and customers. At present, pickups and drop-offs are arranged over the phone or at the counter, and are tracked informally. As the business grows, this way of working will become harder to manage.

## Problem Statement

The current process has no central system for booking, assigning or tracking orders. This causes the following problems:

1. **Booking clashes:** There is no slot system for pickups, so pickup times can clash or get missed.
2. **No overview for managers:** Managers have no single view of which driver is collecting which order.
3. **Informal job allocation:** Drivers get their job details by phone or message, so there is no reliable list of their assigned work.
4. **No order visibility for customers:** Customers have to call the store to find out where their laundry is.
5. **No change history:** There is no record of who changed or cancelled an order.

## Impact on the Business

These problems lead to missed pickups, staff time spent answering phone calls, and orders that get mixed up or lost. Because there is no record of changes, disputes between the store and customers cannot be settled with any evidence.

## Proposed Solution

The Laundry Service Booking System (LSBS) will replace the informal process with one central system. LSBS will provide the following:

- Customers can book a 30-minute pickup slot online.
- Each order gets a single ticket, which is tracked from booking through to completion.
- Managers assign drivers to orders, and each driver can see only their own jobs.
- Anyone can check an order's status using the ticket number plus the email address or phone number on the order.
- Every action in the system is logged, so there is a full history of each order.

## Scope

Payments and notifications (such as SMS or email alerts) are out of scope for this version of LSBS.

## Assumptions

- We assume that pickups and drop-offs are currently arranged by phone or at the counter, and are tracked informally (for example, on paper or in a notebook) rather than in a dedicated system.

### Stackholders, Roles and Users

## User roles

1. System Admin (ideally the chain owner)
2. Manager (the store manager)
3. Customer
4. Driver (has a login)

## Stakeholders

1. Laundry chain owner (project / business owner; 2. System Admin in the app)
3. Store manager
4. Driver
5. Customers
6. Project manager (Zain)
7. Developer (Zain)

## Scrum roles

1. Product Owner: business owner (Zain acts on their behalf)
2. Scrum Master: Zain
3. Developer: Zain
