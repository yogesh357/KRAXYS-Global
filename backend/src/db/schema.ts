import {
    pgTable,
    text,
    timestamp,
    varchar,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";

// 1. Customers Table
export const customers = pgTable('customers', {
    id: varchar('id', { length: 50 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    contactPerson: varchar('contact_person', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    email: varchar('email', { length: 255 }),
    address: text('address'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Technicians Table
export const technicians = pgTable('technicians', {
    id: varchar('id', { length: 50 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    skills: text('skills'),
    phone: varchar('phone', { length: 50 }),
    email: varchar('email', { length: 255 }),
    status: varchar('status', { length: 50 }).default('AVAILABLE').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Service Requests Table
export const serviceRequests = pgTable('service_requests', {
    id: varchar('id', { length: 50 }).primaryKey(),
    customerId: varchar('customer_id', { length: 50 })
        .references(() => customers.id, { onDelete: 'restrict' })
        .notNull(),
    channel: varchar('channel', { length: 50 }).notNull(),
    message: text('message').notNull(),
    equipmentId: varchar('equipment_id', { length: 100 }),
    priority: varchar('priority', { length: 50 }).default('NORMAL').notNull(),
    priorityReason: text('priority_reason'),
    status: varchar('status', { length: 50 }).default('NEW').notNull(),
    technicianId: varchar('technician_id', { length: 50 })
        .references(() => technicians.id, { onDelete: 'set null' }),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(),
    duplicateOfId: varchar('duplicate_of_id', { length: 50 }),
    possibleDuplicateId: varchar('possible_duplicate_id', { length: 50 }),
    clarificationNotes: text('clarification_notes'),
    resolutionNotes: text('resolution_notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    index('idx_service_requests_customer_id').on(t.customerId),
    index('idx_service_requests_status').on(t.status),
    index('idx_service_requests_priority').on(t.priority),
    index('idx_service_requests_technician_id').on(t.technicianId),
    index('idx_service_requests_received_at').on(t.receivedAt),
]);

// 4. Request Activities (Audit log / Timeline)
export const requestActivities = pgTable('request_activities', {
    id: varchar('id', { length: 50 }).primaryKey().$default(() => nanoid()),
    requestId: varchar('request_id', { length: 50 })
        .references(() => serviceRequests.id, { onDelete: 'cascade' })
        .notNull(),
    actorRole: varchar('actor_role', { length: 50 }).notNull(),
    actorName: varchar('actor_name', { length: 100 }).notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    details: text('details'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    index('idx_request_activities_request_id').on(t.requestId),
    index('idx_request_activities_created_at').on(t.createdAt),
]);

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
    serviceRequests: many(serviceRequests),
}));

export const techniciansRelations = relations(technicians, ({ many }) => ({
    serviceRequests: many(serviceRequests),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one, many }) => ({
    customer: one(customers, {
        fields: [serviceRequests.customerId],
        references: [customers.id],
    }),
    technician: one(technicians, {
        fields: [serviceRequests.technicianId],
        references: [technicians.id],
    }),
    activities: many(requestActivities),
}));

export const requestActivitiesRelations = relations(requestActivities, ({ one }) => ({
    request: one(serviceRequests, {
        fields: [requestActivities.requestId],
        references: [serviceRequests.id],
    }),
}));
