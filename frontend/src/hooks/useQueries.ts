import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  UserProfile,
  UserRole,
  AdmissionStatus,
  Variant_pending_approved_rejected,
  ShoppingItem,
  UserRole__1,
} from '../backend';

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Extract a human-readable message from any thrown value */
export function extractErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';
  if (typeof error === 'string') return error;
  if (error instanceof Error) {
    const msg = error.message;
    // ICP canister traps embed the message inside the rejection string
    const trapMatch = msg.match(/Canister trapped explicitly: (.+)/);
    if (trapMatch) return trapMatch[1];
    const rejectMatch = msg.match(/Reject text: (.+)/);
    if (rejectMatch) return rejectMatch[1];
    return msg;
  }
  return String(error);
}

/** Returns true if the error looks like an authorization / admin-only rejection */
export function isAuthorizationError(error: unknown): boolean {
  const msg = extractErrorMessage(error).toLowerCase();
  return (
    msg.includes('unauthorized') ||
    msg.includes('admin') ||
    msg.includes('not authorized') ||
    msg.includes('permission') ||
    msg.includes('access denied') ||
    msg.includes('only admin') ||
    msg.includes('only authenticated')
  );
}

/** Standard message shown to the user when an admin action is rejected */
export const ADMIN_AUTH_ERROR_MSG =
  'Action failed: you must be logged in as an Admin. Please log out and log back in, then try again.';

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      // Save the application-level profile
      await actor.saveCallerUserProfile(profile);
      // Also ensure the caller has the #user access-control role so that
      // requireUser() passes for all subsequent backend calls.
      try {
        await actor.assignCallerUserRole(profile.principal, UserRole__1.user);
      } catch {
        // Best-effort: if this fails (e.g. already assigned) we continue.
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useRegisterProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      role: UserRole;
      name: string;
      idNumber: string;
      email: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.registerProfile(params.role, params.name, params.idNumber, params.email);
      // Ensure the caller has the #user access-control role
      try {
        const profile = await actor.getCallerUserProfile();
        if (profile) {
          await actor.assignCallerUserRole(profile.principal, UserRole__1.user);
        }
      } catch {
        // Best-effort
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Admissions ───────────────────────────────────────────────────────────────

export function useGetAllAdmissionApplications() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['admissionApplications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAdmissionApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateAdmissionStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { appId: bigint; status: AdmissionStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAdmissionStatus(params.appId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionApplications'] });
    },
  });
}

export function useSubmitApplication() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      jambNumber: string;
      oLevelResults: string[];
      programmeChoice: string;
      documents: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitApplication(
        params.name,
        params.jambNumber,
        params.oLevelResults,
        params.programmeChoice,
        params.documents
      );
    },
  });
}

export function useCheckAdmissionStatus() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (jambNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkAdmissionStatus(jambNumber);
    },
  });
}

export function useCheckAdmissionStatusByName() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkAdmissionStatusByName(name);
    },
  });
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export function useGetCourses() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCourses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      code: string;
      name: string;
      semester: string;
      programme: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCourse(params.code, params.name, params.semester, params.programme);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// ─── Fee Types ────────────────────────────────────────────────────────────────

export function useGetFeeTypes() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['feeTypes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeeTypes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddFeeType() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      amount: bigint;
      programme: string;
      session: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addFeeType(params.name, params.amount, params.programme, params.session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeTypes'] });
    },
  });
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export function useGetPaymentHistory() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['paymentHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPaymentHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPayments() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['allPayments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      amount: bigint;
      reference: string | null;
      feeType: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordPayment(params.amount, params.reference, params.feeType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
    },
  });
}

// ─── Hostel ───────────────────────────────────────────────────────────────────

export function useGetAllHostelApplications() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['hostelApplications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllHostelApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateHostelApplicationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      appId: bigint;
      status: Variant_pending_approved_rejected;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHostelApplicationStatus(params.appId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostelApplications'] });
    },
  });
}

export function useApplyForHostel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { roomType: string; session: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.applyForHostel(params.roomType, params.session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myHostelApplication'] });
    },
  });
}

export function useGetMyHostelApplication() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['myHostelApplication'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyHostelApplication();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Results ──────────────────────────────────────────────────────────────────

export function useGetResults() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['results'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getResults();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllResults() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['allResults'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllResults();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetResultsForStudent(studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['resultsForStudent', studentId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getResultsForStudent(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useAddResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      studentId: string;
      courseId: bigint;
      semester: string;
      grade: string;
      score: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addResult(
        params.studentId,
        params.courseId,
        params.semester,
        params.grade,
        params.score
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allResults'] });
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });
}

// ─── Students ─────────────────────────────────────────────────────────────────

export function useGetAllStudents() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['allStudents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { name: string; idNumber: string; email: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addStudentProfile(params.name, params.idNumber, params.email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStudents'] });
    },
  });
}

// Alias for backward compatibility
export const useAddStudentProfile = useAddStudent;

// ─── Announcements ────────────────────────────────────────────────────────────

export function useGetAnnouncements(role: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['announcements', role],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAnnouncements(role);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { content: string; targetRole: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendAnnouncement(params.content, params.targetRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

// ─── Stripe / Checkout ────────────────────────────────────────────────────────

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}

export function useGetStripeSessionStatus() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStripeSessionStatus(sessionId);
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: { secretKey: string; allowedCountries: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

// ─── Course Registration ──────────────────────────────────────────────────────

export function useGetRegisteredCourses() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['registeredCourses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRegisteredCourses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerCourse(courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registeredCourses'] });
    },
  });
}

export function useDeregisterCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deregisterCourse(courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registeredCourses'] });
    },
  });
}

// ─── Parent ───────────────────────────────────────────────────────────────────

export function useLinkParentToStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.linkParentToStudent(studentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedStudent'] });
    },
  });
}

// ─── Aggregated ───────────────────────────────────────────────────────────────

export function useGetAggregatedStudentData() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['aggregatedStudentData'],
    queryFn: async () => {
      if (!actor) return [[], []] as [never[], never[]];
      return actor.getAggregatedStudentData();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCheckUnpaidFees() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['unpaidFees'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.checkUnpaidFees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUserProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUserProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}
