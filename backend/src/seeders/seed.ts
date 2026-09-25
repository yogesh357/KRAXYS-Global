import "dotenv/config";
import { db } from "../db/index.js";
import {
    customers,
    technicians,
    serviceRequests,
    requestActivities,
    users,
} from "../db/schema.js";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function seedDatabase() {
    console.log("Starting Atlas Industrial Services database seed...");

    // Create tables if they don't exist
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS customers (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            contact_person VARCHAR(255),
            phone VARCHAR(50),
            email VARCHAR(255),
            address TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS technicians (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            skills TEXT,
            phone VARCHAR(50),
            email VARCHAR(255),
            status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS service_requests (
            id VARCHAR(50) PRIMARY KEY,
            customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
            channel VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            equipment_id VARCHAR(100),
            priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL',
            priority_reason TEXT,
            status VARCHAR(50) NOT NULL DEFAULT 'NEW',
            technician_id VARCHAR(50) REFERENCES technicians(id) ON DELETE SET NULL,
            scheduled_at TIMESTAMPTZ,
            received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            duplicate_of_id VARCHAR(50),
            possible_duplicate_id VARCHAR(50),
            clarification_notes TEXT,
            resolution_notes TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS request_activities (
            id VARCHAR(50) PRIMARY KEY,
            request_id VARCHAR(50) NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
            actor_role VARCHAR(50) NOT NULL,
            actor_name VARCHAR(100) NOT NULL,
            action VARCHAR(100) NOT NULL,
            details TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            role VARCHAR(50) NOT NULL,
            technician_id VARCHAR(50) REFERENCES technicians(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);

    // Clean existing seed data
    await db.execute(sql`
        TRUNCATE TABLE request_activities CASCADE;
        TRUNCATE TABLE service_requests CASCADE;
        TRUNCATE TABLE technicians CASCADE;
        TRUNCATE TABLE customers CASCADE;
        TRUNCATE TABLE users CASCADE;
    `);

    console.log("Seeding Customers C01 - C07...");
    await db.insert(customers).values([
        {
            id: "C01",
            name: "Apex Cold Storage",
            contactPerson: "Arthur Campbell",
            phone: "+1-555-0101",
            email: "ops@apexcold.com",
            address: "Unit 4, Polar Logistics Park, North Docks",
        },
        {
            id: "C02",
            name: "Blue Star Logistics",
            contactPerson: "Sarah Jenkins",
            phone: "+1-555-0102",
            email: "dispatch@bluestar.com",
            address: "Bay 12, Harbour Terminal Way",
        },
        {
            id: "C03",
            name: "Crestline Manufacturing",
            contactPerson: "Robert Vance",
            phone: "+1-555-0103",
            email: "plant@crestline.com",
            address: "Building 3, Crestline Industrial Zone",
        },
        {
            id: "C04",
            name: "Delta Processing",
            contactPerson: "Michael Zhang",
            phone: "+1-555-0104",
            email: "facility@deltaproc.com",
            address: "Sector 7, Central Processing Park",
        },
        {
            id: "C05",
            name: "Echo Pharmaceuticals",
            contactPerson: "Dr. Rachel Green",
            phone: "+1-555-0105",
            email: "maintenance@echopharm.com",
            address: "Cleanroom Wing B, Echo Pharma Campus",
        },
        {
            id: "C06",
            name: "Falcon Foods",
            contactPerson: "David Miller",
            phone: "+1-555-0106",
            email: "site@falconfoods.com",
            address: "Factory 2, Valley Food Processing Hub",
        },
        {
            id: "C07",
            name: "Global Warehouse Co.",
            contactPerson: "Emily Ross",
            phone: "+1-555-0107",
            email: "support@globalwarehouse.com",
            address: "Gate 5, Global Freight Terminal",
        },
    ]);

    console.log("Seeding Technicians T1 - T3...");
    await db.insert(technicians).values([
        {
            id: "T1",
            name: "Marcus Vance",
            skills: "Commercial Refrigeration, Cryogenics, Cold Storage HVAC",
            phone: "+1-555-0201",
            email: "marcus.vance@atlasindustrial.internal",
            status: "ON_JOB",
        },
        {
            id: "T2",
            name: "Elena Rostova",
            skills: "Heavy Machinery, Hydraulics, Pump Assemblies & Valves",
            phone: "+1-555-0202",
            email: "elena.rostova@atlasindustrial.internal",
            status: "ON_JOB",
        },
        {
            id: "T3",
            name: "David Chen",
            skills: "Electrical Controls, Pressure Systems, PLC Automation",
            phone: "+1-555-0203",
            email: "david.chen@atlasindustrial.internal",
            status: "ON_JOB",
        },
    ]);

    console.log("Seeding Users...");
    await db.insert(users).values([
        {
            id: "U1",
            name: "Alex Morgan",
            email: "alex.coordinator@atlasindustrial.internal",
            role: "COORDINATOR",
        },
        {
            id: "U2",
            name: "Samantha Wright",
            email: "samantha.ops@atlasindustrial.internal",
            role: "OPERATIONS_MANAGER",
        },
        {
            id: "U3",
            name: "Marcus Vance",
            email: "marcus.t1@atlasindustrial.internal",
            role: "TECHNICIAN",
            technicianId: "T1",
        },
        {
            id: "U4",
            name: "Elena Rostova",
            email: "elena.t2@atlasindustrial.internal",
            role: "TECHNICIAN",
            technicianId: "T2",
        },
        {
            id: "U5",
            name: "David Chen",
            email: "david.t3@atlasindustrial.internal",
            role: "TECHNICIAN",
            technicianId: "T3",
        },
    ]);

    console.log("Seeding Service Requests R101 - R108...");
    await db.insert(serviceRequests).values([
        {
            id: "R101",
            customerId: "C01",
            channel: "EMAIL",
            message: "Cold-room unit keeps stopping. Stored goods could be affected.",
            equipmentId: "CRU-402",
            priority: "URGENT",
            priorityReason: "Potential stored-goods impact",
            status: "NEW",
            technicianId: null,
            scheduledAt: null,
            receivedAt: new Date("2026-09-30T16:10:00.000Z"),
            clarificationNotes: null,
            resolutionNotes: null,
            createdAt: new Date("2026-09-30T16:10:00.000Z"),
            updatedAt: new Date("2026-09-30T16:10:00.000Z"),
        },
        {
            id: "R102",
            customerId: "C02",
            channel: "WHATSAPP",
            message: "Can you confirm when someone is coming for yesterday's pump request?",
            equipmentId: "PMP-108",
            priority: "HIGH",
            priorityReason: "Operational pump disruption follow-up",
            status: "ASSIGNED",
            technicianId: "T1",
            scheduledAt: null, // No visit time recorded yet
            receivedAt: new Date("2026-10-01T08:20:00.000Z"),
            clarificationNotes: null,
            resolutionNotes: null,
            createdAt: new Date("2026-10-01T08:20:00.000Z"),
            updatedAt: new Date("2026-10-01T08:20:00.000Z"),
        },
        {
            id: "R103",
            customerId: "C03",
            channel: "PHONE",
            message: "Routine inspection request for next week.",
            equipmentId: "GEN-901",
            priority: "NORMAL",
            priorityReason: "Routine preventative maintenance",
            status: "NEW",
            technicianId: null,
            scheduledAt: null,
            receivedAt: new Date("2026-09-30T11:00:00.000Z"),
            clarificationNotes: null,
            resolutionNotes: null,
            createdAt: new Date("2026-09-30T11:00:00.000Z"),
            updatedAt: new Date("2026-09-30T11:00:00.000Z"),
        },
        {
            id: "R104",
            customerId: "C01",
            channel: "EMAIL",
            message: "Following up on the cold-room fault reported yesterday.",
            equipmentId: "CRU-402",
            priority: "URGENT",
            priorityReason: "Potential stored-goods impact (Possible duplicate of R101)",
            status: "NEW",
            technicianId: null,
            scheduledAt: null,
            receivedAt: new Date("2026-10-01T08:25:00.000Z"),
            possibleDuplicateId: "R101",
            clarificationNotes: null,
            resolutionNotes: null,
            createdAt: new Date("2026-10-01T08:25:00.000Z"),
            updatedAt: new Date("2026-10-01T08:25:00.000Z"),
        },
        {
            id: "R105",
            customerId: "C04",
            channel: "PHONE",
            message: "Machine not working. Please call us.",
            equipmentId: null,
            priority: "NORMAL",
            priorityReason: "Needs technical specification and urgency context",
            status: "NEEDS_CLARIFICATION",
            technicianId: null,
            scheduledAt: null,
            receivedAt: new Date("2026-10-01T08:30:00.000Z"),
            clarificationNotes: "Missing equipment identifier, specific error symptoms, and business impact.",
            resolutionNotes: null,
            createdAt: new Date("2026-10-01T08:30:00.000Z"),
            updatedAt: new Date("2026-10-01T08:30:00.000Z"),
        },
        {
            id: "R106",
            customerId: "C05",
            channel: "EMAIL",
            message: "We are waiting for the replacement part and an update.",
            equipmentId: "VLV-330",
            priority: "HIGH",
            priorityReason: "Awaiting critical valve replacement part",
            status: "WAITING_PART",
            technicianId: "T2",
            scheduledAt: null,
            receivedAt: new Date("2026-09-29T14:00:00.000Z"),
            clarificationNotes: "Hydraulic actuator valve on backorder from supplier; tracking reference #HW-8821.",
            resolutionNotes: null,
            createdAt: new Date("2026-09-29T14:00:00.000Z"),
            updatedAt: new Date("2026-09-29T14:00:00.000Z"),
        },
        {
            id: "R107",
            customerId: "C06",
            channel: "WHATSAPP",
            message: "Thanks, the unit is running again.",
            equipmentId: "HVAC-012",
            priority: "HIGH",
            priorityReason: "Unit restarted, awaiting final resolution sign-off",
            status: "IN_PROGRESS",
            technicianId: "T3",
            scheduledAt: new Date("2026-09-30T15:30:00.000Z"),
            receivedAt: new Date("2026-09-30T15:00:00.000Z"),
            clarificationNotes: null,
            resolutionNotes: null,
            createdAt: new Date("2026-09-30T15:00:00.000Z"),
            updatedAt: new Date("2026-09-30T15:00:00.000Z"),
        },
        {
            id: "R108",
            customerId: "C07",
            channel: "EMAIL",
            message: "Please send someone today for a pressure warning. Details need clarification.",
            equipmentId: "PRS-55",
            priority: "HIGH",
            priorityReason: "Pressure alert with incomplete sensor telemetry",
            status: "NEEDS_CLARIFICATION",
            technicianId: null,
            scheduledAt: null,
            receivedAt: new Date("2026-10-01T08:40:00.000Z"),
            clarificationNotes: "Sensor telemetry reading fluctuated beyond safe threshold; customer to verify line 2 isolation.",
            resolutionNotes: null,
            createdAt: new Date("2026-10-01T08:40:00.000Z"),
            updatedAt: new Date("2026-10-01T08:40:00.000Z"),
        },
    ]);

    console.log("Seeding Activity Timelines...");
    await db.insert(requestActivities).values([
        // R101 timeline
        {
            id: nanoid(),
            requestId: "R101",
            actorRole: "SYSTEM",
            actorName: "Email Gateway",
            action: "CREATED",
            details: "Service request captured from email ops@apexcold.com. Priority flagged URGENT due to stored goods impact.",
            createdAt: new Date("2026-09-30T16:10:00.000Z"),
        },
        // R102 timeline
        {
            id: nanoid(),
            requestId: "R102",
            actorRole: "SYSTEM",
            actorName: "WhatsApp Dispatch",
            action: "CREATED",
            details: "Service request captured from WhatsApp +1-555-0102.",
            createdAt: new Date("2026-10-01T08:20:00.000Z"),
        },
        {
            id: nanoid(),
            requestId: "R102",
            actorRole: "COORDINATOR",
            actorName: "Alex Morgan",
            action: "ASSIGNED",
            details: "Assigned to technician Marcus Vance (T1). Visit time pending scheduling.",
            createdAt: new Date("2026-10-01T08:22:00.000Z"),
        },
        // R103 timeline
        {
            id: nanoid(),
            requestId: "R103",
            actorRole: "COORDINATOR",
            actorName: "Alex Morgan",
            action: "CREATED",
            details: "Phone intake recorded for routine preventative inspection next week.",
            createdAt: new Date("2026-09-30T11:00:00.000Z"),
        },
        // R104 timeline
        {
            id: nanoid(),
            requestId: "R104",
            actorRole: "SYSTEM",
            actorName: "Email Gateway",
            action: "CREATED",
            details: "Service request captured from email. System flagged possible duplicate of active ticket R101 (Apex Cold Storage).",
            createdAt: new Date("2026-10-01T08:25:00.000Z"),
        },
        // R105 timeline
        {
            id: nanoid(),
            requestId: "R105",
            actorRole: "COORDINATOR",
            actorName: "Alex Morgan",
            action: "CLARIFICATION_REQUESTED",
            details: "Customer called with insufficient details. Marked NEEDS_CLARIFICATION for missing equipment ID and symptoms.",
            createdAt: new Date("2026-10-01T08:30:00.000Z"),
        },
        // R106 timeline
        {
            id: nanoid(),
            requestId: "R106",
            actorRole: "COORDINATOR",
            actorName: "Alex Morgan",
            action: "ASSIGNED",
            details: "Assigned to Elena Rostova (T2).",
            createdAt: new Date("2026-09-29T14:15:00.000Z"),
        },
        {
            id: nanoid(),
            requestId: "R106",
            actorRole: "TECHNICIAN",
            actorName: "Elena Rostova",
            action: "WAITING_PART",
            details: "Inspected valve VLV-330 on site. Internal seals compromised. Part ordered from supplier; status set to WAITING_PART.",
            createdAt: new Date("2026-09-29T16:45:00.000Z"),
        },
        // R107 timeline
        {
            id: nanoid(),
            requestId: "R107",
            actorRole: "COORDINATOR",
            actorName: "Alex Morgan",
            action: "ASSIGNED",
            details: "Assigned to David Chen (T3). Visit scheduled for 15:30.",
            createdAt: new Date("2026-09-30T15:05:00.000Z"),
        },
        {
            id: nanoid(),
            requestId: "R107",
            actorRole: "TECHNICIAN",
            actorName: "David Chen",
            action: "JOB_STARTED",
            details: "Started diagnostic on HVAC-012. Unit successfully restarted and running smoothly. Ready to mark resolved.",
            createdAt: new Date("2026-09-30T15:35:00.000Z"),
        },
        // R108 timeline
        {
            id: nanoid(),
            requestId: "R108",
            actorRole: "COORDINATOR",
            actorName: "Alex Morgan",
            action: "CLARIFICATION_REQUESTED",
            details: "Clarification requested for pressure warning sensor reading and line numbers.",
            createdAt: new Date("2026-10-01T08:40:00.000Z"),
        },
    ]);

    console.log("Database seeded successfully with all 8 requests, customers, technicians, and timelines!");
}

// Allow direct CLI execution: `npx tsx src/seeders/seed.ts`
if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('adminSeeder.ts')) {
    seedDatabase()
        .then(() => {
            console.log("Seed script finished successfully.");
            process.exit(0);
        })
        .catch(err => {
            console.error("Seed script failed:", err);
            process.exit(1);
        });
}
