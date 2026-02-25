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

  // 4. AUTHORIZATION HELPERS

  // Consolidated admin check: reads from the stable userProfiles store.
  // A caller is considered an application-level admin if their stored profile has role = #admin.
  func isAdmin(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.role == #admin };
    };
  };

  // Require that the caller is an authenticated user (not anonymous/guest).
  func requireUser(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can perform this action");
    };
  };

  // Require that the caller is an application-level admin.
  func requireAdmin(caller : Principal) {
    requireUser(caller);
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  // Require that the caller is an admin or staff member.
  func requireAdminOrStaff(caller : Principal) {
    requireUser(caller);
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        if (profile.role != #admin and profile.role != #staff) {
          Runtime.trap("Unauthorized: Only admins or staff can perform this action");
        };
      };
    };
  };

  // 5. USER AUTHENTICATION & PROFILE MANAGEMENT

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    requireUser(caller);
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireUser(caller);
    userProfiles.add(caller, profile);
  };

  // Only allow admin or the user themselves to view another specific profile
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    requireUser(caller);
    if (caller != user and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Register a new profile for the caller
  public shared ({ caller }) func registerProfile(role : UserRole, name : Text, idNumber : Text, email : Text) : async () {
    requireUser(caller);
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
    requireAdmin(caller);

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
    requireUser(caller);
    let profile = userProfiles.get(caller);
    switch (profile) {
      case (null) { null };
      case (?p) { ?p.role };
    };
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfile] {
    requireAdmin(caller);
    userProfiles.values().toArray();
  };

  // 6. ADMISSIONS & APPLICATIONS
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

  public query func checkAdmissionStatus(jambNumber : Text) : async ?AdmissionStatus {
    let iter = admissionApplications.values();
    switch (iter.find(func(app) { app.jambNumber == jambNumber })) {
      case (null) { null };
      case (?application) { ?application.status };
    };
  };

  public query func checkAdmissionStatusByName(name : Text) : async ?AdmissionStatus {
    let iter = admissionApplications.values();
    switch (iter.find(func(app) { app.name == name })) {
      case (null) { null };
      case (?application) { ?application.status };
    };
  };

  public query ({ caller }) func getAllAdmissionApplications() : async [AdmissionApplication] {
    requireAdmin(caller);
    admissionApplications.values().toArray();
  };

  public shared ({ caller }) func updateAdmissionStatus(appId : Nat, status : AdmissionStatus) : async () {
    requireAdmin(caller);
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

  // 7. COURSE MANAGEMENT
  public shared ({ caller }) func addCourse(code : Text, name : Text, semester : Text, programme : Text) : async () {
    requireAdmin(caller);
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

  public query ({ caller }) func getCourses() : async [Course] {
    requireUser(caller);
    courses.values().toArray();
  };

  // 8. FEE MANAGEMENT
  public shared ({ caller }) func addFeeType(name : Text, amount : Nat, programme : Text, session : Text) : async () {
    requireAdmin(caller);
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

  public query ({ caller }) func getFeeTypes() : async [FeeType] {
    requireUser(caller);
    feeTypes.values().toArray();
  };

  // 9. PAYMENT PROCESSING (STRIPE INTEGRATION)
  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    requireAdmin(caller);
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

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    requireUser(caller);
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func recordPayment(amount : Nat, reference : ?Text, feeType : Text) : async () {
    requireUser(caller);
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

  public shared ({ caller }) func recordPaymentByAdmin(studentId : Text, amount : Nat, reference : Text, feeType : Text) : async () {
    requireAdmin(caller);
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

  public query ({ caller }) func getPaymentHistory() : async [PaymentRecord] {
    requireUser(caller);
    let userId = getCurrentUserId(caller);
    payments.values().toArray().filter(func(p) { p.studentId == userId }).sort(
      comparePaymentsByDate
    );
  };

  public query ({ caller }) func getAllPayments() : async [PaymentRecord] {
    requireAdmin(caller);
    payments.values().toArray().sort(comparePaymentsByDate);
  };

  // 10. HOSTEL & ACCOMMODATION MANAGEMENT
  public shared ({ caller }) func applyForHostel(roomType : Text, session : Text) : async Nat {
    requireUser(caller);
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

  public query ({ caller }) func getAllHostelApplications() : async [HostelApplication] {
    requireAdmin(caller);
    hostelApplications.values().toArray();
  };

  public shared ({ caller }) func updateHostelApplicationStatus(appId : Nat, status : { #pending; #approved; #rejected }) : async () {
    requireAdmin(caller);
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

  public query ({ caller }) func getMyHostelApplication() : async ?HostelApplication {
    requireUser(caller);
    let userId = getCurrentUserId(caller);
    hostelApplications.values().find(func(app) { app.studentId == userId });
  };

  // 11. RESULTS MANAGEMENT
  public shared ({ caller }) func addResult(
    studentId : Text,
    courseIdParam : Nat,
    semester : Text,
    grade : Text,
    score : Nat,
  ) : async () {
    requireAdminOrStaff(caller);
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

  public query ({ caller }) func getResults() : async [Result] {
    requireUser(caller);
    let userId = getCurrentUserId(caller);
    switch (results.get(userId)) {
      case (null) { [] };
      case (?r) { r.toArray() };
    };
  };

  public query ({ caller }) func getResultsForStudent(studentId : Text) : async [Result] {
    requireUser(caller);
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        if (profile.role == #admin or profile.role == #staff) {
          // allowed
        } else if (profile.role == #parent) {
          switch (linkedParents.get(profile.idNumber)) {
            case (null) { Runtime.trap("No student linked to this parent account") };
            case (?linkedStudentId) {
              if (studentId != linkedStudentId) {
                Runtime.trap("Unauthorized: Cannot access results for this student");
              };
            };
          };
        } else if (profile.role == #student) {
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

  public query ({ caller }) func getAllResults() : async [Result] {
    requireAdminOrStaff(caller);
    var allResults : [Result] = [];
    for (resultList in results.values()) {
      allResults := allResults.concat(resultList.toArray());
    };
    allResults;
  };

  public shared ({ caller }) func linkParentToStudent(studentId : Text) : async () {
    requireUser(caller);
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

  // 12. DASHBOARD ROLE ROUTING
  public query ({ caller }) func getUserDashboard() : async Text {
    requireUser(caller);
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

  // 13. AGGREGATED DATA QUERIES
  public shared ({ caller }) func getAggregatedStudentData() : async ([Result], [PaymentRecord]) {
    requireUser(caller);
    let userId = getCurrentUserId(caller);
    let resultsData = switch (results.get(userId)) {
      case (null) { [] };
      case (?res) { res.toArray() };
    };
    let paymentsData = payments.values().toArray().filter(func(p) { p.studentId == userId });
    (resultsData, paymentsData);
  };

  public query ({ caller }) func checkUnpaidFees() : async [FeeType] {
    requireUser(caller);
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

  // 14. ADMIN: STUDENT & STAFF MANAGEMENT

  public query ({ caller }) func getAllStudents() : async [UserProfile] {
    requireAdminOrStaff(caller);
    userProfiles.values().toArray().filter(func(p) { p.role == #student });
  };

  public shared ({ caller }) func assignAccessRole(user : Principal, role : AccessControl.UserRole) : async () {
    // AccessControl.assignRole already includes its own admin-only guard internally
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public shared ({ caller }) func registerCourse(courseIdParam : Nat) : async () {
    requireUser(caller);
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
    requireUser(caller);
    let userId = getCurrentUserId(caller);
    let currentCourses = switch (courseRegistrations.get(userId)) {
      case (null) { List.empty<Nat>() };
      case (?c) { c };
    };
    let newCourses = currentCourses.filter(func(id) { id != courseIdParam });
    courseRegistrations.add(userId, newCourses);
  };

  public query ({ caller }) func getRegisteredCourses() : async [Nat] {
    requireUser(caller);
    let userId = getCurrentUserId(caller);
    switch (courseRegistrations.get(userId)) {
      case (null) { [] };
      case (?c) { c.toArray() };
    };
  };

  public shared ({ caller }) func sendAnnouncement(content : Text, targetRole : Text) : async () {
    requireAdmin(caller);
    announcementId += 1;
    let announcement : Announcement = {
      id = announcementId;
      content;
      targetRole;
      timestamp = Time.now();
    };
    announcements.add(announcementId, announcement);
  };

  public query ({ caller }) func getAnnouncements(role : Text) : async [Announcement] {
    requireUser(caller);
    let filteredAnnouncements = Array.fromIter(
      announcements.values().filter(
        func(announcement) { announcement.targetRole == role or announcement.targetRole == "all" }
      )
    );
    filteredAnnouncements.sort(func(a, b) { Int.compare(b.timestamp, a.timestamp) });
  };
};
