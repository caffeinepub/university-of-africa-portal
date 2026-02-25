import Map "mo:core/Map";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // 1. INCLUDE AUTHORIZATION
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // 2. DATA TYPES
  public type UserRole = { #admin; #student; #staff; #parent };

  public type UserProfile = {
    principal : Principal;
    name : Text;
    role : UserRole;
    idNumber : Text; // JAMB number, staff ID, etc.
    email : Text;
  };

  public type AdmissionStatus = { #pending; #admitted; #rejected };

  public type AdmissionApplication = {
    id : Nat;
    name : Text;
    jambNumber : Text;
    oLevelResults : [Text];
    programmeChoice : Text;
    documents : [Text]; // Base64 encoded file references
    status : AdmissionStatus;
  };

  public type Course = {
    id : Nat;
    code : Text;
    name : Text;
    semester : Text;
    programme : Text;
  };

  public type FeeType = {
    id : Nat;
    name : Text;
    amount : Nat;
    programme : Text;
    session : Text;
  };

  public type PaymentRecord = {
    id : Nat;
    studentId : Text;
    amount : Nat;
    date : Int;
    reference : Text;
    feeType : Text;
    status : { #pending; #completed };
    paymentMethod : Text;
  };

  public type HostelApplication = {
    id : Nat;
    studentId : Text;
    roomType : Text;
    session : Text;
    status : { #pending; #approved; #rejected };
  };

  public type Result = {
    studentId : Text;
    courseId : Nat;
    semester : Text;
    grade : Text;
    score : Nat;
  };

  public type Announcement = {
    id : Nat;
    content : Text;
    targetRole : Text;
    timestamp : Int;
  };

  // 3. ACTOR STATE
  var admissionAppId = 0;
  var courseId = 0;
  var feeTypeId = 0;
  var paymentId = 0;
  var hostelAppId = 0;
  var announcementId = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let admissionApplications = Map.empty<Nat, AdmissionApplication>();
  let courses = Map.empty<Nat, Course>();
  let feeTypes = Map.empty<Nat, FeeType>();
  let payments = Map.empty<Nat, PaymentRecord>();
  let hostelApplications = Map.empty<Nat, HostelApplication>();
  let results = Map.empty<Text, List.List<Result>>(); // indexed by studentId
  let linkedParents = Map.empty<Text, Text>(); // parentId => studentId
  let announcements = Map.empty<Nat, Announcement>();

  let courseRegistrations = Map.empty<Text, List.List<Nat>>();
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // 4. USER AUTHENTICATION & PROFILE MANAGEMENT

  // Required by instructions: get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get their profile");
    };
    userProfiles.get(caller);
  };

  // Required by instructions: save caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Required by instructions: get another user's profile (own profile or admin can view any)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Register a new profile for the caller
  public shared ({ caller }) func registerProfile(role : UserRole, name : Text, idNumber : Text, email : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register a profile");
    };
    let profile : UserProfile = {
      principal = caller;
      name;
      email;
      role;
      idNumber;
    };
    userProfiles.add(caller, profile);
  };

  // Admin: add a new student profile directly (bypass caller validation)
  public shared ({ caller }) func addStudentProfile(name : Text, idNumber : Text, email : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add student profiles");
    };

    let dummyPrincipal = Principal.fromText("aaaaa-aa"); // Placeholder principal

    let profile : UserProfile = {
      principal = dummyPrincipal;
      name;
      email;
      role = #student;
      idNumber;
    };
    userProfiles.add(dummyPrincipal, profile);
  };

  // Get the caller's role
  public query ({ caller }) func getCallerRole() : async ?UserRole {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get their role");
    };
    let profile = userProfiles.get(caller);
    switch (profile) {
      case (null) { null };
      case (?p) { ?p.role };
    };
  };

  // 5. ADMISSIONS & APPLICATIONS
  // Submitting an application is public (applicants may not be registered users yet)
  public shared ({ caller }) func submitApplication(
    name : Text,
    jambNumber : Text,
    oLevelResults : [Text],
    programmeChoice : Text,
    documents : [Text],
  ) : async Nat {
    admissionAppId += 1;
    let application : AdmissionApplication = {
      id = admissionAppId;
      name;
      jambNumber;
      oLevelResults;
      programmeChoice;
      documents;
      status = #pending;
    };
    admissionApplications.add(admissionAppId, application);
    admissionAppId;
  };

  // Public admission status checker (no auth required - public-facing feature)
  public query func checkAdmissionStatus(jambNumber : Text) : async ?AdmissionStatus {
    let iter = admissionApplications.values();
    switch (iter.find(func(app) { app.jambNumber == jambNumber })) {
      case (null) { null };
      case (?application) { ?application.status };
    };
  };

  // Public admission status checker by name (no auth required - public-facing feature)
  public query func checkAdmissionStatusByName(name : Text) : async ?AdmissionStatus {
    let iter = admissionApplications.values();
    switch (iter.find(func(app) { app.name == name })) {
      case (null) { null };
      case (?application) { ?application.status };
    };
  };

  // Admin: view all admission applications
  public query ({ caller }) func getAllAdmissionApplications() : async [AdmissionApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all admission applications");
    };
    admissionApplications.values().toArray();
  };

  // Admin: approve or reject an admission application
  public shared ({ caller }) func updateAdmissionStatus(appId : Nat, status : AdmissionStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update admission status");
    };
    switch (admissionApplications.get(appId)) {
      case (null) { Runtime.trap("Application not found") };
      case (?app) {
        let updated : AdmissionApplication = {
          id = app.id;
          name = app.name;
          jambNumber = app.jambNumber;
          oLevelResults = app.oLevelResults;
          programmeChoice = app.programmeChoice;
          documents = app.documents;
          status;
        };
        admissionApplications.add(appId, updated);
      };
    };
  };

  // 6. COURSE MANAGEMENT
  public shared ({ caller }) func addCourse(code : Text, name : Text, semester : Text, programme : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add courses");
    };
    courseId += 1;
    let course : Course = {
      id = courseId;
      code;
      name;
      semester;
      programme;
    };
    courses.add(courseId, course);
  };

  // Courses are viewable by any authenticated user
  public query ({ caller }) func getCourses() : async [Course] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view courses");
    };
    courses.values().toArray();
  };

  // 7. FEE MANAGEMENT
  public shared ({ caller }) func addFeeType(name : Text, amount : Nat, programme : Text, session : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add fee types");
    };
    feeTypeId += 1;
    let feeType : FeeType = {
      id = feeTypeId;
      name;
      amount;
      programme;
      session;
    };
    feeTypes.add(feeTypeId, feeType);
  };

  // Fee types viewable by authenticated users
  public query ({ caller }) func getFeeTypes() : async [FeeType] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view fee types");
    };
    feeTypes.values().toArray();
  };

  // 8. PAYMENT PROCESSING (STRIPE INTEGRATION)
  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func getCurrentUserId(caller : Principal) : Text {
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?userProfile) { userProfile.idNumber };
    };
  };

  // Only authenticated users can create checkout sessions
  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // Stripe session status is public (needed for redirect callback handling)
  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  // Only authenticated users can record their own payments
  public shared ({ caller }) func recordPayment(amount : Nat, reference : ?Text, feeType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record payments");
    };
    paymentId += 1;
    let payment : PaymentRecord = {
      id = paymentId;
      studentId = getCurrentUserId(caller);
      amount;
      date = Time.now();
      reference = switch (reference) {
        case (null) { "" };
        case (?ref) { ref };
      };
      feeType;
      status = #completed;
      paymentMethod = "stripe";
    };
    payments.add(paymentId, payment);
  };

  // Admin-only: record payment on behalf of a student
  public shared ({ caller }) func recordPaymentByAdmin(studentId : Text, amount : Nat, reference : Text, feeType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can record payments for others");
    };
    paymentId += 1;
    let payment : PaymentRecord = {
      id = paymentId;
      studentId;
      amount;
      date = Time.now();
      reference;
      feeType;
      status = #completed;
      paymentMethod = "manual";
    };
    payments.add(paymentId, payment);
  };

  func comparePaymentsByDate(p1 : PaymentRecord, p2 : PaymentRecord) : Order.Order {
    Int.compare(p2.date, p1.date);
  };

  // Only authenticated users can view their own payment history
  public query ({ caller }) func getPaymentHistory() : async [PaymentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view payment history");
    };
    let userId = getCurrentUserId(caller);
    payments.values().toArray().filter(func(p) { p.studentId == userId }).sort(
      comparePaymentsByDate
    );
  };

  // Admin: view all payments
  public query ({ caller }) func getAllPayments() : async [PaymentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all payments");
    };
    payments.values().toArray().sort(comparePaymentsByDate);
  };

  // 9. HOSTEL & ACCOMMODATION MANAGEMENT
  // Only authenticated users can apply for hostel
  public shared ({ caller }) func applyForHostel(roomType : Text, session : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can apply for hostel");
    };
    hostelAppId += 1;
    let application : HostelApplication = {
      id = hostelAppId;
      studentId = getCurrentUserId(caller);
      roomType;
      session;
      status = #pending;
    };
    hostelApplications.add(hostelAppId, application);
    hostelAppId;
  };

  // Admin: view all hostel applications
  public query ({ caller }) func getAllHostelApplications() : async [HostelApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all hostel applications");
    };
    hostelApplications.values().toArray();
  };

  // Admin: approve or reject hostel application
  public shared ({ caller }) func updateHostelApplicationStatus(appId : Nat, status : { #pending; #approved; #rejected }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update hostel application status");
    };
    switch (hostelApplications.get(appId)) {
      case (null) { Runtime.trap("Hostel application not found") };
      case (?app) {
        let updated : HostelApplication = {
          id = app.id;
          studentId = app.studentId;
          roomType = app.roomType;
          session = app.session;
          status;
        };
        hostelApplications.add(appId, updated);
      };
    };
  };

  // Authenticated user: view their own hostel application status
  public query ({ caller }) func getMyHostelApplication() : async ?HostelApplication {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their hostel application");
    };
    let userId = getCurrentUserId(caller);
    hostelApplications.values().find(func(app) { app.studentId == userId });
  };

  // 10. RESULTS MANAGEMENT
  // Admin or staff can post results for a student
  public shared ({ caller }) func addResult(
    studentId : Text,
    courseIdParam : Nat,
    semester : Text,
    grade : Text,
    score : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can post results");
    };
    // Only admin or staff may post results
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        if (profile.role != #admin and profile.role != #staff) {
          Runtime.trap("Unauthorized: Only admins or staff can post results");
        };
      };
    };
    let result = {
      studentId;
      courseId = courseIdParam;
      semester;
      grade;
      score;
    };
    let existingList = switch (results.get(studentId)) {
      case (null) { List.empty<Result>() };
      case (?lst) { lst };
    };
    existingList.add(result);
    results.add(studentId, existingList);
  };

  // Authenticated user: view their own results
  public query ({ caller }) func getResults() : async [Result] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view results");
    };
    let userId = getCurrentUserId(caller);
    switch (results.get(userId)) {
      case (null) { [] };
      case (?r) { r.toArray() };
    };
  };

  // View results for a specific student (admin, staff, or linked parent only)
  public query ({ caller }) func getResultsForStudent(studentId : Text) : async [Result] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view results");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        if (profile.role == #admin or profile.role == #staff) {
          // Admin and staff can view any student's results
        } else if (profile.role == #parent) {
          // Parents can only view their linked student's results
          switch (linkedParents.get(profile.idNumber)) {
            case (null) { Runtime.trap("No student linked to this parent account") };
            case (?linkedStudentId) {
              if (studentId != linkedStudentId) {
                Runtime.trap("Unauthorized: Cannot access results for this student");
              };
            };
          };
        } else if (profile.role == #student) {
          // Students can only view their own results
          if (studentId != profile.idNumber) {
            Runtime.trap("Unauthorized: Students can only view their own results");
          };
        } else {
          Runtime.trap("Unauthorized: Insufficient permissions to view results");
        };
      };
    };
    switch (results.get(studentId)) {
      case (null) { [] };
      case (?r) { r.toArray() };
    };
  };

  // Admin or staff: get all results across all students (for Exams and Records portal)
  public query ({ caller }) func getAllResults() : async [Result] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view all results");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        if (profile.role != #admin and profile.role != #staff) {
          Runtime.trap("Unauthorized: Only admins or staff can view all results");
        };
      };
    };
    var allResults : [Result] = [];
    for (resultList in results.values()) {
      allResults := allResults.concat(resultList.toArray());
    };
    allResults;
  };

  // Only authenticated users (parents) can link to a student
  public shared ({ caller }) func linkParentToStudent(studentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can link accounts");
    };
    // Verify caller is a parent
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        if (profile.role != #parent) {
          Runtime.trap("Unauthorized: Only parents can link to a student");
        };
        linkedParents.add(profile.idNumber, studentId);
      };
    };
  };

  // 11. DASHBOARD ROLE ROUTING
  public query ({ caller }) func getUserDashboard() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access dashboards");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        switch (profile.role) {
          case (#admin) { "Admin Panel" };
          case (#student) { "Student Dashboard" };
          case (#staff) { "Staff Dashboard" };
          case (#parent) { "Parent Dashboard" };
        };
      };
    };
  };

  // 12. AGGREGATED DATA QUERIES
  // Only authenticated users can get their own aggregated data
  public shared ({ caller }) func getAggregatedStudentData() : async ([Result], [PaymentRecord]) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access their data");
    };
    let userId = getCurrentUserId(caller);
    let resultsData = switch (results.get(userId)) {
      case (null) { [] };
      case (?res) { res.toArray() };
    };
    let paymentsData = payments.values().toArray().filter(func(p) { p.studentId == userId });
    (resultsData, paymentsData);
  };

  // Only authenticated users can check their unpaid fees
  public query ({ caller }) func checkUnpaidFees() : async [FeeType] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check unpaid fees");
    };
    let userProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    let feeTypesFiltered = Array.fromIter(
      feeTypes.values().filter(
        func(_x) {
          true;
        }
      )
    );

    let unpaidFeeTypes = feeTypesFiltered.filter(
      func(feeType) {
        payments.values().toArray().find(func(payment) { payment.studentId == userProfile.idNumber and payment.feeType == feeType.name }) == null;
      }
    );

    unpaidFeeTypes;
  };

  // 13. ADMIN: STUDENT & STAFF MANAGEMENT
  // Admin: view all user profiles
  public query ({ caller }) func getAllUserProfiles() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all user profiles");
    };
    userProfiles.values().toArray();
  };

  // Admin or staff: get all students (for result posting dropdowns)
  public query ({ caller }) func getAllStudents() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view student list");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        if (profile.role != #admin and profile.role != #staff) {
          Runtime.trap("Unauthorized: Only admins or staff can view the student list");
        };
      };
    };
    userProfiles.values().toArray().filter(func(p) { p.role == #student });
  };

  // Admin: assign access control role to a user
  public shared ({ caller }) func assignAccessRole(user : Principal, role : AccessControl.UserRole) : async () {
    // AccessControl.assignRole includes its own admin-only guard
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  // Course Registration
  public shared ({ caller }) func registerCourse(courseIdParam : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register courses");
    };
    let userId = getCurrentUserId(caller);
    let currentCourses = switch (courseRegistrations.get(userId)) {
      case (null) { List.empty<Nat>() };
      case (?c) { c };
    };
    if (currentCourses.any(func(id) { id == courseIdParam })) {
      Runtime.trap("You are already registered for this course");
    };
    currentCourses.add(courseIdParam);
    courseRegistrations.add(userId, currentCourses);
  };

  public shared ({ caller }) func deregisterCourse(courseIdParam : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can deregister courses");
    };
    let userId = getCurrentUserId(caller);
    let currentCourses = switch (courseRegistrations.get(userId)) {
      case (null) { List.empty<Nat>() };
      case (?c) { c };
    };
    let newCourses = currentCourses.filter(func(id) { id != courseIdParam });
    courseRegistrations.add(userId, newCourses);
  };

  public query ({ caller }) func getRegisteredCourses() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get registered courses");
    };
    let userId = getCurrentUserId(caller);
    switch (courseRegistrations.get(userId)) {
      case (null) { [] };
      case (?c) { c.toArray() };
    };
  };

  // Announcements
  public shared ({ caller }) func sendAnnouncement(content : Text, targetRole : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can send announcements");
    };
    announcementId += 1;
    let announcement : Announcement = {
      id = announcementId;
      content;
      targetRole;
      timestamp = Time.now();
    };
    announcements.add(announcementId, announcement);
  };

  // Announcements are viewable by authenticated users only
  public query ({ caller }) func getAnnouncements(role : Text) : async [Announcement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view announcements");
    };
    let filteredAnnouncements = Array.fromIter(
      announcements.values().filter(
        func(announcement) { announcement.targetRole == role or announcement.targetRole == "all" }
      )
    );
    filteredAnnouncements.sort(func(a, b) { Int.compare(b.timestamp, a.timestamp) });
  };
};
