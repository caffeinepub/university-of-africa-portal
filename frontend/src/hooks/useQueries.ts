import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfile,
  Course,
  FeeType,
  PaymentRecord,
  Result,
  AdmissionApplication,
  HostelApplication,
  Announcement,
  AdmissionStatus,
  UserRole,
  Variant_pending_approved_rejected,
  ShoppingItem,
  StripeConfiguration,
} from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

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

export function useRegisterProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      role,
      name,
      idNumber,
      email,
    }: {
      role: UserRole;
      name: string;
      idNumber: string;
      email: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerProfile(role, name, idNumber, email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Students ────────────────────────────────────────────────────────────────

export function useGetAllStudents() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['allStudents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUserProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUserProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      idNumber,
      email,
    }: {
      name: string;
      idNumber: string;
      email: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addStudentProfile(name, idNumber, email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStudents'] });
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export function useGetCourses() {
  const { actor, isFetching } = useActor();

  return useQuery<Course[]>({
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
    mutationFn: async ({
      code,
      name,
      semester,
      programme,
    }: {
      code: string;
      name: string;
      semester: string;
      programme: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCourse(code, name, semester, programme);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// ─── Fee Types ────────────────────────────────────────────────────────────────

export function useGetFeeTypes() {
  const { actor, isFetching } = useActor();

  return useQuery<FeeType[]>({
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
    mutationFn: async ({
      name,
      amount,
      programme,
      session,
    }: {
      name: string;
      amount: bigint;
      programme: string;
      session: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addFeeType(name, amount, programme, session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeTypes'] });
    },
  });
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export function useGetPaymentHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentRecord[]>({
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

  return useQuery<PaymentRecord[]>({
    queryKey: ['allPayments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCheckUnpaidFees() {
  const { actor, isFetching } = useActor();

  return useQuery<FeeType[]>({
    queryKey: ['unpaidFees'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.checkUnpaidFees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      reference,
      feeType,
    }: {
      amount: bigint;
      reference: string | null;
      feeType: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordPayment(amount, reference, feeType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
      queryClient.invalidateQueries({ queryKey: ['unpaidFees'] });
    },
  });
}

// ─── Results ──────────────────────────────────────────────────────────────────

export function useGetResults() {
  const { actor, isFetching } = useActor();

  return useQuery<Result[]>({
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

  return useQuery<Result[]>({
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

  return useQuery<Result[]>({
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
    mutationFn: async ({
      studentId,
      courseId,
      semester,
      grade,
      score,
    }: {
      studentId: string;
      courseId: bigint;
      semester: string;
      grade: string;
      score: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addResult(studentId, courseId, semester, grade, score);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allResults'] });
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });
}

// ─── Admissions ───────────────────────────────────────────────────────────────

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
        data.documents
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionApplications'] });
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

export function useGetAllAdmissionApplications() {
  const { actor, isFetching } = useActor();

  return useQuery<AdmissionApplication[]>({
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
    mutationFn: async ({
      appId,
      status,
    }: {
      appId: bigint;
      status: AdmissionStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAdmissionStatus(appId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionApplications'] });
    },
  });
}

// ─── Hostel ───────────────────────────────────────────────────────────────────

export function useGetAllHostelApplications() {
  const { actor, isFetching } = useActor();

  return useQuery<HostelApplication[]>({
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
      queryClient.invalidateQueries({ queryKey: ['hostelApplications'] });
    },
  });
}

export function useGetMyHostelApplication() {
  const { actor, isFetching } = useActor();

  return useQuery<HostelApplication | null>({
    queryKey: ['myHostelApplication'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyHostelApplication();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApplyForHostel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomType, session }: { roomType: string; session: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.applyForHostel(roomType, session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myHostelApplication'] });
    },
  });
}

// ─── Announcements ────────────────────────────────────────────────────────────

export function useGetAnnouncements(role: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Announcement[]>({
    queryKey: ['announcements', role],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAnnouncements(role);
    },
    enabled: !!actor && !isFetching && !!role,
  });
}

export function useSendAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      targetRole,
    }: {
      content: string;
      targetRole: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendAnnouncement(content, targetRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

// ─── Course Registration ──────────────────────────────────────────────────────

export function useGetRegisteredCourses() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint[]>({
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

// ─── Aggregated Data ──────────────────────────────────────────────────────────

export function useGetAggregatedStudentData() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['aggregatedStudentData'],
    queryFn: async () => {
      if (!actor) return [[], []] as [Result[], PaymentRecord[]];
      return actor.getAggregatedStudentData();
    },
    enabled: !!actor && !isFetching,
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
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Stripe ───────────────────────────────────────────────────────────────────

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
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
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

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
