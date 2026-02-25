import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface PortalAccessApplication {
    status: Variant_pending_approved_rejected;
    applicantName: string;
    generatedId?: string;
    role: PortalAccessRole;
    submittedAt: bigint;
    email: string;
    generatedPassword?: string;
    programmeOrDepartment?: string;
}
export type GeneratePasswordResponse = {
    __kind__: "ok";
    ok: {
        generatedId: string;
        password: string;
    };
} | {
    __kind__: "err";
    err: string;
};
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    principal: Principal;
    name: string;
    role: UserRole;
    email: string;
    level?: bigint;
    idNumber: string;
    department?: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    staff = "staff",
    student = "student",
    parent = "parent"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_approved_rejected {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    approvePortalAccessApplication(appId: string): Promise<GeneratePasswordResponse>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    getCallerUserRole(): Promise<UserRole__1>;
    getMyPortalAccessApplication(email: string): Promise<PortalAccessApplication | null>;
    getPortalAccessApplications(): Promise<Array<PortalAccessApplication>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    loginWithIdAndPassword(roleId: string, password: string): Promise<{
        __kind__: "ok";
        ok: UserProfile;
    } | {
        __kind__: "err";
        err: string;
    }>;
    rejectPortalAccessApplication(appId: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitPortalAccessApplication(applicantName: string, email: string, role: PortalAccessRole, programmeOrDepartment: string | null): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
