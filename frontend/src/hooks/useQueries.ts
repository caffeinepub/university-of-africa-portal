import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import {
  UserProfile,
  UserRole,
  AdmissionStatus,
  Variant_pending_approved_rejected,
  UserRole__1,
} from '../backend';

// ─── helpers ────────────────────────────────────────────────────────────────

export function extractErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes('Unauthorized') || msg.includes('unauthorized')) {
    if (msg.includes('admin')) return 'Unauthorized — admin only. Please ensure your account has admin role.';
    if (msg.includes('authenticated')) return 'Unauthorized — please log in first.';
    return 'Unauthorized — you do not have permission to perform this action.';
  }
  if (msg.includes('already exists') || msg.includes('re-bootstrap')) return 'An admin account already exists. Only one admin account is allowed.';
  if (msg.includes('not found') || msg.includes('Not found')) return 'Record not found.';
  if (msg.includes('Profile not found')) return 'User profile not found. Please complete your profile setup.';
  return msg;
}

// ─── profile ────────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 2,
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
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
      // Also assign the #user access-control role so requireUser() passes
      try {
        if (identity) {
          await actor.assignCallerUserRole(identity.getPrincipal(), UserRole__1.user);
        }
      } catch {
        // May already be assigned; ignore
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── bootstrap admin ─────────────────────────────────────────────────────────

export function useBootstrapAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; idNumber: string; email: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bootstrapAdmin(data.name, data.idNumber, data.email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

// ─── admissions ─────────────────────────────────────────────────────────────

export function useSubmitApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      jambNumber: string;
      oLevelResults: string[];
      programmeChoice: string;
      documents: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitApplication(
        data.name,
        data.jambNumber,
        data.oLevelResults,
        data.programmeChoice,
        data.documents,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAdmissionApplications'] });
    },
  });
}

export function useGetAllAdmissionApplications() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allAdmissionApplications'],
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
    mutationFn: async ({ appId, status }: { appId: bigint; status: AdmissionStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAdmissionStatus(appId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAdmissionApplications'] });
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

// ─── courses ─────────────────────────────────────────────────────────────────

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
    mutationFn: async (data: {
      code: string;
      name: string;
      semester: string;
      programme: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCourse(data.code, data.name, data.semester, data.programme);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// ─── fee types ───────────────────────────────────────────────────────────────

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
    mutationFn: async (data: {
      name: string;
      amount: bigint;
      programme: string;
      session: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addFeeType(data.name, data.amount, data.programme, data.session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeTypes'] });
    },
  });
}

// ─── payments ────────────────────────────────────────────────────────────────

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
    mutationFn: async (data: {
      amount: bigint;
      reference: string | null;
      feeType: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordPayment(data.amount, data.reference, data.feeType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
    },
  });
}

export function useRecordPaymentByAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      studentId: string;
      amount: bigint;
      reference: string;
      feeType: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordPaymentByAdmin(data.studentId, data.amount, data.reference, data.feeType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (data: {
      items: Array<{
        productName: string;
        currency: string;
        quantity: bigint;
        priceInCents: bigint;
        productDescription: string;
      }>;
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createCheckoutSession(data.items, data.successUrl, data.cancelUrl);
      const session = JSON.parse(result) as { id: string; url: string };
      if (!session?.url) throw new Error('Stripe session missing url');
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

// ─── hostel ──────────────────────────────────────────────────────────────────

export function useGetAllHostelApplications() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allHostelApplications'],
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
    mutationFn: async ({
      appId,
      status,
    }: {
      appId: bigint;
      status: Variant_pending_approved_rejected;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHostelApplicationStatus(appId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allHostelApplications'] });
    },
  });
}

export function useApplyForHostel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { roomType: string; session: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.applyForHostel(data.roomType, data.session);
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

// ─── results ─────────────────────────────────────────────────────────────────

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

export function useAddResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      studentId: string;
      courseId: bigint;
      semester: string;
      grade: string;
      score: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addResult(data.studentId, data.courseId, data.semester, data.grade, data.score);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allResults'] });
    },
  });
}

export function useGetResultsForStudent() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (studentId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getResultsForStudent(studentId);
    },
  });
}

// ─── students ────────────────────────────────────────────────────────────────

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

export function useAddStudentProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; idNumber: string; email: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addStudentProfile(data.name, data.idNumber, data.email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStudents'] });
    },
  });
}

// ─── announcements ───────────────────────────────────────────────────────────

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
    mutationFn: async (data: { content: string; targetRole: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendAnnouncement(data.content, data.targetRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

// ─── course registration ─────────────────────────────────────────────────────

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

// ─── stripe config ───────────────────────────────────────────────────────────

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

// ─── user management ─────────────────────────────────────────────────────────

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

export function useAssignAccessRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { user: import('@dfinity/principal').Principal; role: UserRole__1 }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignAccessRole(data.user, data.role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

// ─── aggregated data ─────────────────────────────────────────────────────────

export function useGetAggregatedStudentData() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['aggregatedStudentData'],
    queryFn: async () => {
      if (!actor) return [[], []] as [import('../backend').Result[], import('../backend').PaymentRecord[]];
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

export function useLinkParentToStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.linkParentToStudent(studentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
