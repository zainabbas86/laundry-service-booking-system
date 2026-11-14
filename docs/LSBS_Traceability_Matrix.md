# LSBS Traceability Matrix

Must requirements for Workflow A (one store), plus the other Must account rules. Commit and deployment evidence are filled in as each story is merged and deployed.

| Req. | Story / issue | Design element | Figma frame | Commit | Deployment evidence |
| --- | --- | --- | --- | --- | --- |
| R001 Register and log in | LSBS-67 | User (name, email, role); /api/auth; JWT bearer token | Registration; Login | 57a59ba, 40835ee, eb3ed51, ace56b3, 70003ce | |
| R002 Role-based access | LSBS-67 | User.role; role check per endpoint | Customer, Manager and Driver views | 40835ee, 6e79993, a9382b7, 1dd195d, 70003ce | |
| R003 Promote users | To create | User.role; /api/users | | 40835ee | |
| R004 Admin protection | To create | /api/users admin rules | | 40835ee | |
| R005 Create accounts | To create | /api/users; seed script for Workflow A users | | 40835ee | |
| R006 Book a pickup | LSBS-69 | Ticket; Slot (start, 30 min); Store 1 to * Slot; /api/tickets | Customer mobile view: Book a pickup | 40835ee, eb3ed51, ace56b3, 6e79993, 63b8163, 70003ce | |
| R007 Choose return method | LSBS-69 | Ticket.returnMethod; Ticket to Slot "delivery 0..1" | Customer mobile view: Book a pickup | 40835ee, eb3ed51, ace56b3, 6e79993, 70003ce | |
| R008 Issue ticket number | LSBS-69 | Ticket.ticketNo (UUID); Ticket.status | Customer mobile view: Booking received | 40835ee, eb3ed51, ace56b3, 6e79993, 63b8163, 70003ce | |
| R009 Assign driver | LSBS-73 | User 0..1 "driver" to * Ticket; Ticket.subStatus; assign-or-cancel decision | Manager dashboard: Booking, Confirmed | 40835ee, eb3ed51, ace56b3, a9382b7, 70003ce | |
| R010 View own tickets | LSBS-69 | Customer 1 to * Ticket; /api/tickets | Customer mobile view: My bookings | 40835ee, eb3ed51, ace56b3, 70003ce | |
| R011 Driver job list | LSBS-76 | /api/tickets filtered by driver; Ticket.pickupAddress; Slot | Driver dashboard: My jobs, Pickup details | 40835ee, eb3ed51, ace56b3, 1dd195d, 70003ce | |
| R012 Pickup status updates | LSBS-76 | Ticket.status, subStatus; ActionLog; driver swimlane | Driver dashboard: Update job, Job complete | 40835ee, eb3ed51, ace56b3, 1dd195d, 63b8163, 70003ce | |
| R013 Cancel rules | LSBS-69, LSBS-73 | Ticket.status; ActionLog (action, at); User 1 to * ActionLog | Manager dashboard: Cancelled | 40835ee, eb3ed51, ace56b3, a9382b7, 70003ce | |
| R014 Login required to book | LSBS-69 | JWT auth on /api/tickets | Login; Customer mobile view | 57a59ba, eb3ed51, ace56b3, 70003ce | |
| R015 Choose one service | LSBS-69 | Ticket.service | Customer mobile view: Book a pickup | 40835ee, eb3ed51, ace56b3, 6e79993, 63b8163, 70003ce | |
| R016 Booking validation | LSBS-69 | Booking validation; slot-taken path | Customer mobile view: Slot taken | eb3ed51, ace56b3, 6e79993, 63b8163, 70003ce | |
| R017 Manager booking list | LSBS-73 | /api/tickets, all Awaiting pickup tickets | Manager dashboard: Awaiting pickup | 40835ee, eb3ed51, ace56b3, a9382b7, 63b8163, 70003ce | |
| R018 Store assignment | LSBS-67 | Store (name, address); one store seeded for Workflow A | Customer mobile view: Book a pickup (store) | 40835ee, eb3ed51, 6e79993, 70003ce | |

### Commit key

| Commit | PR | Work |
| --- | --- | --- |
| 57a59ba | | LSBS-1: starter app with register, log in and JWT auth middleware |
| 40835ee | #3 | LSBS-8: block definition diagram |
| eb3ed51 | #2 | LSBS-9: Workflow A activity diagram |
| ace56b3 | #5 | LSBS-14: low-fi wireframes |
| 63b8163 | #9 | LSBS-15: hi-fi reusable components |
| 6e79993 | #6 | LSBS-16: customer hi-fi screen |
| a9382b7 | #8 | LSBS-17: manager hi-fi screen |
| 1dd195d | #7 | LSBS-18: driver hi-fi screen |
| 70003ce | #10 | LSBS-19: Figma prototype exports |

All requirements and test cases come from the SysML requirement diagram (LSBS-7, PR #1).
