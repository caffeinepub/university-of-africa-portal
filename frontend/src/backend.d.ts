import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface HostelApplication {
    id: bigint;
    status: Variant_pending_approved_rejected;
    studentId: string;
    session: string;
    roomType: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface PaymentRecord {
    id: bigint;
    status: Variant_pending_completed;
    paymentMethod: string;
    studentId: string;
    date: bigint;
    feeType: string;
    reference: string;
    amount: bigint;
}
export interface AdmissionApplication {
    id: bigint;
    status: AdmissionStatus;
    documents: Array<string>;
    name: string;
    programmeChoice: string;
    jambNumber: string;
    oLevelResults: Array<string>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Course {
    id: bigint;
    semester: string;
    code: string;
    name: string;
    programme: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface Result {
    studentId: string;
    semester: string;
    score: bigint;
    grade: string;
    courseId: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface FeeType {
    id: bigint;
    name: string;
    session: string;
    amount: bigint;
    programme: string;
}
export interface Announcement {
    id: bigint;
    content: string;
    timestamp: bigint;
    targetRole: string;
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
    idNumber: string;
}
export enum AdmissionStatus {
    pending = "pending",
    admitted = "admitted",
    rejected = "rejected"
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
export enum Variant_pending_completed {
    pending = "pending",
    completed = "completed"
}
export interface backendInterface {
    addCourse(code: string, name: string, semester: string, programme: string): Promise<void>;
    addFeeType(name: string, amount: bigint, programme: string, session: string): Promise<void>;
    addResult(studentId: string, courseIdParam: bigint, semester: string, grade: string, score: bigint): Promise<void>;
    addStudentProfile(name: string, idNumber: string, email: string): Promise<void>;
    applyForHostel(roomType: string, session: string): Promise<bigint>;
    assignAccessRole(user: Principal, role: UserRole__1): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    checkAdmissionStatus(jambNumber: string): Promise<AdmissionStatus | null>;
    checkAdmissionStatusByName(name: string): Promise<AdmissionStatus | null>;
    checkUnpaidFees(): Promise<Array<FeeType>>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deregisterCourse(courseIdParam: bigint): Promise<void>;
    getAggregatedStudentData(): Promise<[Array<Result>, Array<PaymentRecord>]>;
    getAllAdmissionApplications(): Promise<Array<AdmissionApplication>>;
    getAllHostelApplications(): Promise<Array<HostelApplication>>;
    getAllPayments(): Promise<Array<PaymentRecord>>;
    getAllResults(): Promise<Array<Result>>;
    getAllStudents(): Promise<Array<UserProfile>>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getAnnouncements(role: string): Promise<Array<Announcement>>;
    getCallerRole(): Promise<UserRole | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getCourses(): Promise<Array<Course>>;
    getFeeTypes(): Promise<Array<FeeType>>;
    getMyHostelApplication(): Promise<HostelApplication | null>;
    getPaymentHistory(): Promise<Array<PaymentRecord>>;
    getRegisteredCourses(): Promise<Array<bigint>>;
    getResults(): Promise<Array<Result>>;
    getResultsForStudent(studentId: string): Promise<Array<Result>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserDashboard(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    linkParentToStudent(studentId: string): Promise<void>;
    recordPayment(amount: bigint, reference: string | null, feeType: string): Promise<void>;
    recordPaymentByAdmin(studentId: string, amount: bigint, reference: string, feeType: string): Promise<void>;
    registerCourse(courseIdParam: bigint): Promise<void>;
    registerProfile(role: UserRole, name: string, idNumber: string, email: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendAnnouncement(content: string, targetRole: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitApplication(name: string, jambNumber: string, oLevelResults: Array<string>, programmeChoice: string, documents: Array<string>): Promise<bigint>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAdmissionStatus(appId: bigint, status: AdmissionStatus): Promise<void>;
    updateHostelApplicationStatus(appId: bigint, status: Variant_pending_approved_rejected): Promise<void>;
}
