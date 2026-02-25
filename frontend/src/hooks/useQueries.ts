import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfile,
  PortalAccessApplication,
  GeneratePasswordResponse,
} from '../backend';

// ─── Helper ────────────────────────────────────────────────────────────────

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

// ─── Portal Access Application Hooks ───────────────────────────────────────

export function useSubmitPortalAccessApplication() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      applicantName,
      email,
      role,
      programmeOrDepartment,
    }: {
      applicantName: string;
      email: string;
      role: string;
      programmeOrDepartment: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const roleVariant = { __kind__: role } as any;
      return actor.submitPortalAccessApplication(applicantName, email, roleVariant, programmeOrDepartment);
    },
  });
}

export function useGetPortalAccessApplications() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<PortalAccessApplication[]>({
    queryKey: ['portalAccessApplications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPortalAccessApplications();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useApprovePortalAccessApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appId: string): Promise<GeneratePasswordResponse> => {
      if (!actor) throw new Error('Actor not available');
      return actor.approvePortalAccessApplication(appId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalAccessApplications'] });
    },
  });
}

export function useRejectPortalAccessApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appId: string): Promise<void> => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectPortalAccessApplication(appId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalAccessApplications'] });
    },
  });
}

export function useGetMyPortalAccessApplication(email: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<PortalAccessApplication | null>({
    queryKey: ['myPortalAccessApplication', email],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyPortalAccessApplication(email);
    },
    enabled: !!actor && !actorFetching && !!email,
  });
}

export function useLoginWithIdAndPassword() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      roleId,
      password,
    }: {
      roleId: string;
      password: string;
    }): Promise<UserProfile> => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.loginWithIdAndPassword(roleId, password);
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
      return result.ok;
    },
  });
}

// ─── User Profile Hooks ─────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await (actor as any).getCallerUserProfile();
      return result ?? null;
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
      return (actor as any).saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Admission Hooks ────────────────────────────────────────────────────────

export function useGetAdmissionApplications() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['admissionApplications'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAdmissionApplications();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias for backward compat
export const useGetAllAdmissionApplications = useGetAdmissionApplications;

export function useSubmitAdmissionApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).submitAdmissionApplication(
        data.name,
        data.jambNumber,
        data.oLevelResults,
        data.programmeChoice,
        data.documents,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionApplications'] });
    },
  });
}

// Alias used by ApplicationFormPage
export const useSubmitApplication = useSubmitAdmissionApplication;

export function useAdmitApplicant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).admitApplicant(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionApplications'] });
    },
  });
}

export function useRejectAdmissionApplicant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).rejectAdmissionApplicant(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionApplications'] });
    },
  });
}

// Combined update status alias used by AdmissionsManagementPage
export function useUpdateAdmissionStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      if (status === 'admitted') {
        return (actor as any).admitApplicant(id);
      } else {
        return (actor as any).rejectAdmissionApplicant(id);
      }
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
      return (actor as any).checkAdmissionStatus(jambNumber);
    },
  });
}

export function useCheckAdmissionStatusByName() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).checkAdmissionStatusByName(name);
    },
  });
}

// ─── Course Hooks ───────────────────────────────────────────────────────────

export function useGetCourses() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getCourses();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCoursesByDepartmentAndLevel(department: string, level: number) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['courses', department, level],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getCoursesByDepartmentAndLevel(department, level);
    },
    enabled: !!actor && !actorFetching && !!department && !!level,
  });
}

// Alias used by CourseRegistrationPage
export const useGetCoursesForDepartmentAndLevel = useGetCoursesByDepartmentAndLevel;

export function useAddCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addCourse(
        data.code,
        data.name,
        data.semester,
        data.programme,
        data.department,
        data.level,
        data.creditUnits,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// ─── Fee Hooks ──────────────────────────────────────────────────────────────

export function useGetFeeTypes() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['feeTypes'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getFeeTypes();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddFeeType() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addFeeType(data.name, data.amount, data.programme, data.session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeTypes'] });
    },
  });
}

// ─── Payment Hooks ──────────────────────────────────────────────────────────

export function useGetPayments() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getPayments();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias used by FeeStatementPage, PaymentHistoryPage, ReceiptPage
export const useGetPaymentHistory = useGetPayments;

export function useGetStudentPayments(studentId: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['payments', studentId],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getStudentPayments(studentId);
    },
    enabled: !!actor && !actorFetching && !!studentId,
  });
}

export function useGetPaymentById(paymentId: number) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getPaymentById(paymentId);
    },
    enabled: !!actor && !actorFetching && paymentId !== undefined,
  });
}

export function useRecordPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).recordPayment(
        data.studentId,
        data.amount,
        data.reference,
        data.feeType,
        data.paymentMethod,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

// ─── Hostel Hooks ───────────────────────────────────────────────────────────

export function useGetHostelApplications() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['hostelApplications'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getHostelApplications();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias used by HostelManagementPage
export const useGetAllHostelApplications = useGetHostelApplications;

export function useGetMyHostelApplication(studentId: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['myHostelApplication', studentId],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getMyHostelApplication(studentId);
    },
    enabled: !!actor && !actorFetching && !!studentId,
  });
}

export function useSubmitHostelApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).submitHostelApplication(data.studentId, data.roomType, data.session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostelApplications'] });
    },
  });
}

// Alias used by HostelApplicationPage
export const useApplyForHostel = useSubmitHostelApplication;

export function useApproveHostelApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).approveHostelApplication(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostelApplications'] });
    },
  });
}

export function useRejectHostelApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).rejectHostelApplication(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostelApplications'] });
    },
  });
}

// Combined update status alias used by HostelManagementPage
export function useUpdateHostelApplicationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      if (status === 'approved') {
        return (actor as any).approveHostelApplication(id);
      } else {
        return (actor as any).rejectHostelApplication(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostelApplications'] });
    },
  });
}

// ─── Results Hooks ──────────────────────────────────────────────────────────

export function useGetResults() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['results'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getResults();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias used by ResultsManagementPage, StaffDashboard
export const useGetAllResults = useGetResults;

export function useGetStudentResults(studentId: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['results', studentId],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getStudentResults(studentId);
    },
    enabled: !!actor && !actorFetching && !!studentId,
  });
}

export function useGetResultsForStudent() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (studentId: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getStudentResults(studentId);
    },
  });
}

export function usePostResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).postResult(data.studentId, data.courseId, data.semester, data.grade, data.score);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });
}

// Alias used by ResultsManagementPage
export const useAddResult = usePostResult;

// ─── Announcement Hooks ─────────────────────────────────────────────────────

export function useGetAnnouncements() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAnnouncements();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSendAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).sendAnnouncement(data.content, data.targetRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

// ─── Student Profile Hooks ──────────────────────────────────────────────────

export function useGetStudentProfiles() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['studentProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getStudentProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias used by StudentManagementPage, ResultsManagementPage, StaffDashboard
export const useGetAllStudents = useGetStudentProfiles;

export function useAddStudentProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addStudentProfile(
        data.name,
        data.idNumber,
        data.email,
        data.programme,
        null,
        null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfiles'] });
    },
  });
}

// ─── Admin Hooks ────────────────────────────────────────────────────────────

export function useBootstrapAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).bootstrapAdmin(data.name, data.staffId, data.email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Parent Hooks ───────────────────────────────────────────────────────────

export function useLinkParentToStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ parentId, studentId }: { parentId: string; studentId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).linkParentToStudent(parentId, studentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Fee Check Hooks ────────────────────────────────────────────────────────

export function useCheckUnpaidFees(studentId: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['unpaidFees', studentId],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).checkUnpaidFees(studentId);
    },
    enabled: !!actor && !actorFetching && !!studentId,
  });
}

// ─── Course Registration Hooks ──────────────────────────────────────────────

export function useGetRegisteredCourses(studentId: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['registeredCourses', studentId],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getRegisteredCourses(studentId);
    },
    enabled: !!actor && !actorFetching && !!studentId,
  });
}

export function useRegisterCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, courseId }: { studentId: string; courseId: number }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).registerCourse(studentId, courseId);
    },
    onSuccess: (_data: any, variables: { studentId: string; courseId: number }) => {
      queryClient.invalidateQueries({ queryKey: ['registeredCourses', variables.studentId] });
    },
  });
}

// Alias used by CourseRegistrationPage
export const useDeregisterCourse = function useDeregisterCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, courseId }: { studentId: string; courseId: number }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).unregisterCourse(studentId, courseId);
    },
    onSuccess: (_data: any, variables: { studentId: string; courseId: number }) => {
      queryClient.invalidateQueries({ queryKey: ['registeredCourses', variables.studentId] });
    },
  });
};

export function useUnregisterCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, courseId }: { studentId: string; courseId: number }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).unregisterCourse(studentId, courseId);
    },
    onSuccess: (_data: any, variables: { studentId: string; courseId: number }) => {
      queryClient.invalidateQueries({ queryKey: ['registeredCourses', variables.studentId] });
    },
  });
}

// ─── Stripe Hooks ───────────────────────────────────────────────────────────

export function useIsStripeConfigured() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !actorFetching,
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

export function useGetStripeSessionStatus() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStripeSessionStatus(sessionId);
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      items,
      successUrl,
      cancelUrl,
    }: {
      items: any[];
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result);
      if (!session?.url) throw new Error('Stripe session missing url');
      return session;
    },
  });
}
