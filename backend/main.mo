import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Time "mo:core/Time";
import Array "mo:core/Array";

actor {
  // 1. Include Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // 2. Data Types
  public type UserRole = { #admin; #student; #staff; #parent };

  public type PortalAccessRole = { #student; #staff; #parent; #admin };

  public type PortalAccessApplication = {
    applicantName : Text;
    email : Text;
    role : PortalAccessRole;
    programmeOrDepartment : ?Text;
    submittedAt : Int;
    status : {
      #pending;
      #approved;
      #rejected;
    };
    generatedId : ?Text;
    generatedPassword : ?Text;
  };

  public type UserProfile = {
    principal : Principal;
    name : Text;
    role : UserRole;
    idNumber : Text;
    email : Text;
    department : ?Text;
    level : ?Nat;
  };

  public type GeneratePasswordResponse = {
    #ok : { generatedId : Text; password : Text };
    #err : Text;
  };

  public type AdmissionStatus = { #pending; #admitted; #rejected };

  public type AdmissionApplication = {
    id : Nat;
    name : Text;
    jambNumber : Text;
    oLevelResults : [Text];
    programmeChoice : Text;
    documents : [Text];
    status : AdmissionStatus;
  };

  public type Course = {
    id : Nat;
    code : Text;
    name : Text;
    semester : Text;
    programme : Text;
    department : Text;
    level : Nat;
    creditUnits : Nat;
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

  // 3. Actor State
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
  let results = Map.empty<Text, List.List<Result>>();
  let linkedParents = Map.empty<Text, Text>();
  let announcements = Map.empty<Nat, Announcement>();
  let portalAccessApplications = Map.empty<Text, PortalAccessApplication>();
  let courseRegistrations = Map.empty<Text, List.List<Nat>>();
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // 4. Authorization Helpers

  func isAdminProfile(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.role == #admin };
    };
  };

  func requireUser(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can perform this action");
    };
  };

  func requireAdmin(caller : Principal) {
    requireUser(caller);
    if (not isAdminProfile(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

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

  // 4.1 Portal Access Applications

  func hashPassword(password : Text) : Text {
    // In production, use a proper password hashing mechanism
    password;
  };

  // Open to all callers including guests — anyone can submit an application
  public shared ({ caller }) func submitPortalAccessApplication(
    applicantName : Text,
    email : Text,
    role : PortalAccessRole,
    programmeOrDepartment : ?Text,
  ) : async Text {
    let reference = Time.now().toText();
    let application : PortalAccessApplication = {
      applicantName;
      email;
      role;
      programmeOrDepartment;
      submittedAt = Time.now();
      status = #pending;
      generatedId = null;
      generatedPassword = null;
    };
    portalAccessApplications.add(reference, application);
    reference;
  };

  func generateRoleId(role : PortalAccessRole) : Text {
    let prefix = switch (role) {
      case (#student) { "STU" };
      case (#staff) { "STF" };
      case (#parent) { "PRT" };
      case (#admin) { "ADM" };
    };
    prefix # Time.now().toText();
  };

  func generateRandomPassword() : Text {
    // In production, use a stronger random password generator
    Time.now().toText();
  };

  // Admin-only: approve a portal access application
  public shared ({ caller }) func approvePortalAccessApplication(appId : Text) : async GeneratePasswordResponse {
    requireAdmin(caller);
    switch (portalAccessApplications.get(appId)) {
      case (null) { #err("Application not found") };
      case (?application) {
        let roleId = generateRoleId(application.role);
        let password = generateRandomPassword();
        let hashedPassword = hashPassword(password);

        let updatedApplication : PortalAccessApplication = {
          applicantName = application.applicantName;
          email = application.email;
          role = application.role;
          programmeOrDepartment = application.programmeOrDepartment;
          submittedAt = application.submittedAt;
          status = #approved;
          generatedId = ?roleId;
          generatedPassword = ?hashedPassword;
        };

        portalAccessApplications.add(appId, updatedApplication);
        #ok({
          generatedId = roleId;
          password;
        });
      };
    };
  };

  // Admin-only: reject a portal access application
  public shared ({ caller }) func rejectPortalAccessApplication(appId : Text) : async () {
    requireAdmin(caller);
    switch (portalAccessApplications.get(appId)) {
      case (null) { Runtime.trap("Application not found") };
      case (?application) {
        let updatedApplication : PortalAccessApplication = {
          applicantName = application.applicantName;
          email = application.email;
          role = application.role;
          programmeOrDepartment = application.programmeOrDepartment;
          submittedAt = application.submittedAt;
          status = #rejected;
          generatedId = null;
          generatedPassword = null;
        };
        portalAccessApplications.add(appId, updatedApplication);
      };
    };
  };

  // Admin-only: list all portal access applications
  public query ({ caller }) func getPortalAccessApplications() : async [PortalAccessApplication] {
    requireAdmin(caller);
    portalAccessApplications.values().toArray();
  };

  // Public: anyone can query their own application by email (no auth required)
  public query ({ caller }) func getMyPortalAccessApplication(email : Text) : async ?PortalAccessApplication {
    switch (portalAccessApplications.values().find(func(app : PortalAccessApplication) : Bool { app.email == email })) {
      case (null) { null };
      case (?app) {
        ?{
          applicantName = app.applicantName;
          email = app.email;
          role = app.role;
          programmeOrDepartment = app.programmeOrDepartment;
          submittedAt = app.submittedAt;
          status = app.status;
          generatedId = app.generatedId;
          generatedPassword = null;
        };
      };
    };
  };

  // Public: validate credentials and return the associated profile
  public query ({ caller }) func loginWithIdAndPassword(roleId : Text, password : Text) : async {
    #ok : UserProfile;
    #err : Text;
  } {
    let hashedInput = hashPassword(password);
    let found = portalAccessApplications.values().find(
      func(app : PortalAccessApplication) : Bool {
        switch (app.generatedId, app.generatedPassword) {
          case (?gId, ?gPwd) {
            gId == roleId and gPwd == hashedInput and app.status == #approved
          };
          case (_) { false };
        };
      }
    );
    switch (found) {
      case (null) { #err("Invalid credentials or application not approved") };
      case (?app) {
        // Build a synthetic UserProfile from the application data
        let userRole : UserRole = switch (app.role) {
          case (#student) { #student };
          case (#staff) { #staff };
          case (#parent) { #parent };
          case (#admin) { #admin };
        };
        let profile : UserProfile = {
          principal = Principal.fromText("aaaaa-aa"); // Anonymous placeholder
          name = app.applicantName;
          role = userRole;
          idNumber = switch (app.generatedId) { case (?id) { id }; case (null) { "" } };
          email = app.email;
          department = app.programmeOrDepartment;
          level = null;
        };
        #ok(profile);
      };
    };
  };

  // 5. Stripe Integration

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    requireAdmin(caller);
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be configured first") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
