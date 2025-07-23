using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Businessobjects.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Medical_Supply",
                columns: table => new
                {
                    SupplyID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    SupplyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CurrentStock = table.Column<int>(type: "int", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medical_Supply", x => x.SupplyID);
                });

            migrationBuilder.CreateTable(
                name: "Medication",
                columns: table => new
                {
                    MedicationID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MedicationName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CurrentStock = table.Column<int>(type: "int", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medication", x => x.MedicationID);
                });

            migrationBuilder.CreateTable(
                name: "Notification",
                columns: table => new
                {
                    NotificationID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UserID = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    HealthCheckConsentFormId = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notification", x => x.NotificationID);
                });

            migrationBuilder.CreateTable(
                name: "Role",
                columns: table => new
                {
                    RoleID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleType = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Role", x => x.RoleID);
                });

            migrationBuilder.CreateTable(
                name: "Vaccine_Type",
                columns: table => new
                {
                    VaccinationID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    VaccineName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vaccine_Type", x => x.VaccinationID);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RoleID = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserID);
                    table.ForeignKey(
                        name: "FK_Users_Role_RoleID",
                        column: x => x.RoleID,
                        principalTable: "Role",
                        principalColumn: "RoleID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Health_Record",
                columns: table => new
                {
                    HealthRecordID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    StudentID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ParentID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Allergies = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Chronic_Diseases = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Treatment_History = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Eyesight = table.Column<int>(type: "int", nullable: true),
                    Hearing = table.Column<int>(type: "int", nullable: true),
                    Vaccination_History = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentContact = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Health_Record", x => x.HealthRecordID);
                    table.ForeignKey(
                        name: "FK_Health_Record_Users_ParentID",
                        column: x => x.ParentID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Health_Record_Users_StudentID",
                        column: x => x.StudentID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicalIncident",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MedicalStaffID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    IncidentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IncidentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Severity = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActionTaken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FollowUpRequired = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FollowUpDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalIncident", x => x.ID);
                    table.ForeignKey(
                        name: "FK_MedicalIncident_Users_MedicalStaffID",
                        column: x => x.MedicalStaffID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "Medication_Submission_Form",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    StudentID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ParentID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Medication_Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dosage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Instructions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Consumption_Time = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Parents_Note = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medication_Submission_Form", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Medication_Submission_Form_Users_ParentID",
                        column: x => x.ParentID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Medication_Submission_Form_Users_StudentID",
                        column: x => x.StudentID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Periodic_Health_Check_Plan",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PlanName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ScheduleDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CheckupContent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatorID = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Periodic_Health_Check_Plan", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Periodic_Health_Check_Plan_Users_CreatorID",
                        column: x => x.CreatorID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Profile",
                columns: table => new
                {
                    ProfileID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Date_Of_Birth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Sex = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Class = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Profile", x => x.ProfileID);
                    table.ForeignKey(
                        name: "FK_Profile_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Vaccination_Plan",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    PlanName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ScheduledDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatorID = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vaccination_Plan", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Vaccination_Plan_Users_CreatorID",
                        column: x => x.CreatorID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "IncidentInvolvement",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MedicalIncidentID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    StudentID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    InvolvementType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Injuries = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TreatmentRequired = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TreatmentDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IncidentInvolvement", x => x.ID);
                    table.ForeignKey(
                        name: "FK_IncidentInvolvement_MedicalIncident_MedicalIncidentID",
                        column: x => x.MedicalIncidentID,
                        principalTable: "MedicalIncident",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_IncidentInvolvement_Users_StudentID",
                        column: x => x.StudentID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "Medication_Receipt",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MedicationSubmissionFormID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ParentID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    MedicalStaffID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ReceiptDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MedicationName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dosage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Frequency = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Instructions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StorageInstructions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SideEffects = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medication_Receipt", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Medication_Receipt_Medication_Submission_Form_MedicationSubmissionFormID",
                        column: x => x.MedicationSubmissionFormID,
                        principalTable: "Medication_Submission_Form",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Medication_Receipt_Users_MedicalStaffID",
                        column: x => x.MedicalStaffID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Medication_Receipt_Users_ParentID",
                        column: x => x.ParentID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Health_Check_Consent_Form",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    HealthCheckPlanID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    StudentID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ParentID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ConsentStatus = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResponseTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReasonForDenial = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Health_Check_Consent_Form", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Health_Check_Consent_Form_Periodic_Health_Check_Plan_HealthCheckPlanID",
                        column: x => x.HealthCheckPlanID,
                        principalTable: "Periodic_Health_Check_Plan",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Health_Check_Consent_Form_Users_ParentID",
                        column: x => x.ParentID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Health_Check_Consent_Form_Users_StudentID",
                        column: x => x.StudentID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Vaccination_Consent_Form",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    VaccinationPlanID = table.Column<string>(type: "nvarchar(6)", nullable: false),
                    StudentID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ParentID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ConsentStatus = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResponseTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReasonForDenial = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vaccination_Consent_Form", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Vaccination_Consent_Form_Users_ParentID",
                        column: x => x.ParentID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Vaccination_Consent_Form_Users_StudentID",
                        column: x => x.StudentID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Vaccination_Consent_Form_Vaccination_Plan_VaccinationPlanID",
                        column: x => x.VaccinationPlanID,
                        principalTable: "Vaccination_Plan",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Vaccination_Health_Check",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    VaccinationPlanID = table.Column<string>(type: "nvarchar(6)", nullable: true),
                    StudentID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ParentID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    NotificationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResponseDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MedicalStaffNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HasAllergies = table.Column<bool>(type: "bit", nullable: true),
                    AllergyDetails = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HasChronicConditions = table.Column<bool>(type: "bit", nullable: true),
                    ChronicConditionDetails = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HasRecentIllness = table.Column<bool>(type: "bit", nullable: true),
                    RecentIllnessDetails = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsEligibleForVaccination = table.Column<bool>(type: "bit", nullable: true),
                    IneligibilityReason = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vaccination_Health_Check", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Vaccination_Health_Check_Users_ParentID",
                        column: x => x.ParentID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Vaccination_Health_Check_Users_StudentID",
                        column: x => x.StudentID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Vaccination_Health_Check_Vaccination_Plan_VaccinationPlanID",
                        column: x => x.VaccinationPlanID,
                        principalTable: "Vaccination_Plan",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Health_Check_Result",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    HealthCheckConsentID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Height = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    Weight = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    BloodPressure = table.Column<int>(type: "int", nullable: true),
                    HeartRate = table.Column<int>(type: "int", nullable: true),
                    Eyesight = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Hearing = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OralHealth = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Spine = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Conclusion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CheckUpDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Checker = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NeedToContactParent = table.Column<bool>(type: "bit", nullable: true),
                    FollowUpDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HealthFacility = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CheckupType = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Health_Check_Result", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Health_Check_Result_Health_Check_Consent_Form_HealthCheckConsentID",
                        column: x => x.HealthCheckConsentID,
                        principalTable: "Health_Check_Consent_Form",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Vaccination_Result",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ConsentFormID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    VaccineTypeID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ActualVaccinationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Performer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PostVaccinationReaction = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vaccination_Result", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Vaccination_Result_Vaccination_Consent_Form_ConsentFormID",
                        column: x => x.ConsentFormID,
                        principalTable: "Vaccination_Consent_Form",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Vaccination_Result_Vaccine_Type_VaccineTypeID",
                        column: x => x.VaccineTypeID,
                        principalTable: "Vaccine_Type",
                        principalColumn: "VaccinationID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Vaccination_Consultation",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    VaccinationHealthCheckID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    StudentID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ParentID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    MedicalStaffID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ConsultationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ConsultationType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConsultationNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Recommendations = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ScheduledDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Duration = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vaccination_Consultation", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Vaccination_Consultation_Users_MedicalStaffID",
                        column: x => x.MedicalStaffID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Vaccination_Consultation_Users_ParentID",
                        column: x => x.ParentID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Vaccination_Consultation_Users_StudentID",
                        column: x => x.StudentID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Vaccination_Consultation_Vaccination_Health_Check_VaccinationHealthCheckID",
                        column: x => x.VaccinationHealthCheckID,
                        principalTable: "Vaccination_Health_Check",
                        principalColumn: "ID");
                });

            migrationBuilder.InsertData(
                table: "Health_Record",
                columns: new[] { "HealthRecordID", "Allergies", "Chronic_Diseases", "Eyesight", "Hearing", "Note", "ParentContact", "ParentID", "StudentID", "Treatment_History", "Vaccination_History" },
                values: new object[] { "a2b4c6d8-e0f2-4681-9314-123456789012", "None", "None", 20, 20, "Healthy student", "0987654321", "P12345", "f5b7824f-5e35-4682-98d1-0e98f8dd6b31", "No major treatments", "Up to date" });

            migrationBuilder.InsertData(
                table: "Role",
                columns: new[] { "RoleID", "RoleType" },
                values: new object[,]
                {
                    { "1", "Admin" },
                    { "2", "User" },
                    { "3", "Nurse" },
                    { "4", "Teacher" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserID", "Password", "RoleID", "Username" },
                values: new object[,]
                {
                    { "b9e7d454-99df-4506-8c0f-3b2c33c21d12", "nurse123", "3", "nurse" },
                    { "c9d4c053-49b6-410c-bc78-2d54a9991870", "admin123", "1", "admin" },
                    { "d8663e5e-7494-4f81-8739-6e0de1bea7ee", "user123", "2", "user" }
                });

            migrationBuilder.InsertData(
                table: "Profile",
                columns: new[] { "ProfileID", "Class", "Date_Of_Birth", "Name", "Note", "Phone", "Sex", "UserID" },
                values: new object[] { "f5b7824f-5e35-4682-98d1-0e98f8dd6b31", "Admin Class", new DateTime(1990, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Admin User", "Admin profile", "1234567890", "Male", "c9d4c053-49b6-410c-bc78-2d54a9991870" });

            migrationBuilder.CreateIndex(
                name: "IX_Health_Check_Consent_Form_HealthCheckPlanID",
                table: "Health_Check_Consent_Form",
                column: "HealthCheckPlanID");

            migrationBuilder.CreateIndex(
                name: "IX_Health_Check_Consent_Form_ParentID",
                table: "Health_Check_Consent_Form",
                column: "ParentID");

            migrationBuilder.CreateIndex(
                name: "IX_Health_Check_Consent_Form_StudentID",
                table: "Health_Check_Consent_Form",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_Health_Check_Result_HealthCheckConsentID",
                table: "Health_Check_Result",
                column: "HealthCheckConsentID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Health_Record_ParentID",
                table: "Health_Record",
                column: "ParentID");

            migrationBuilder.CreateIndex(
                name: "IX_Health_Record_StudentID",
                table: "Health_Record",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentInvolvement_MedicalIncidentID",
                table: "IncidentInvolvement",
                column: "MedicalIncidentID");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentInvolvement_StudentID",
                table: "IncidentInvolvement",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalIncident_MedicalStaffID",
                table: "MedicalIncident",
                column: "MedicalStaffID");

            migrationBuilder.CreateIndex(
                name: "IX_Medication_Receipt_MedicalStaffID",
                table: "Medication_Receipt",
                column: "MedicalStaffID");

            migrationBuilder.CreateIndex(
                name: "IX_Medication_Receipt_MedicationSubmissionFormID",
                table: "Medication_Receipt",
                column: "MedicationSubmissionFormID");

            migrationBuilder.CreateIndex(
                name: "IX_Medication_Receipt_ParentID",
                table: "Medication_Receipt",
                column: "ParentID");

            migrationBuilder.CreateIndex(
                name: "IX_Medication_Submission_Form_ParentID",
                table: "Medication_Submission_Form",
                column: "ParentID");

            migrationBuilder.CreateIndex(
                name: "IX_Medication_Submission_Form_StudentID",
                table: "Medication_Submission_Form",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_Periodic_Health_Check_Plan_CreatorID",
                table: "Periodic_Health_Check_Plan",
                column: "CreatorID");

            migrationBuilder.CreateIndex(
                name: "IX_Profile_UserID",
                table: "Profile",
                column: "UserID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleID",
                table: "Users",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_Vaccination_Consent_Form_ParentID",
                table: "Vaccination_Consent_Form",
                column: "ParentID");

            migrationBuilder.CreateIndex(
                name: "IX_Vaccination_Consent_Form_StudentID",
                table: "Vaccination_Consent_Form",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_Vaccination_Consent_Form_VaccinationPlanID",
                table: "Vaccination_Consent_Form",
                column: "VaccinationPlanID");

            migrationBuilder.CreateIndex(
                name: "IX_Vaccination_Consultation_MedicalStaffID",
                table: "Vaccination_Consultation",
                column: "MedicalStaffID");

            migrationBuilder.CreateIndex(
                name: "IX_Vaccination_Consultation_ParentID",
                table: "Vaccination_Consultation",
                column: "ParentID");

            migrationBuilder.CreateIndex(
                name: "IX_Vaccination_Consultation_StudentID",
                table: "Vaccination_Consultation",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_Vaccination_Consultation_VaccinationHealthCheckID",
                table: "Vaccination_Consultation",
                column: "VaccinationHealthCheckID");

            migrationBuilder.CreateIndex(
                name: "IX_Vaccination_Health_Check_ParentID",
                table: "Vaccination_Health_Check",
                column: "ParentID");

            migrationBuilder.CreateIndex(
                name: "IX_Vaccination_Health_Check_StudentID",
                table: "Vaccination_Health_Check",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_Vaccination_Health_Check_VaccinationPlanID",
                table: "Vaccination_Health_Check",
                column: "VaccinationPlanID");

            migrationBuilder.CreateIndex(
                name: "IX_Vaccination_Plan_CreatorID",
                table: "Vaccination_Plan",
                column: "CreatorID");

            migrationBuilder.CreateIndex(
                name: "IX_Vaccination_Result_ConsentFormID",
                table: "Vaccination_Result",
                column: "ConsentFormID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vaccination_Result_VaccineTypeID",
                table: "Vaccination_Result",
                column: "VaccineTypeID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Health_Check_Result");

            migrationBuilder.DropTable(
                name: "Health_Record");

            migrationBuilder.DropTable(
                name: "IncidentInvolvement");

            migrationBuilder.DropTable(
                name: "Medical_Supply");

            migrationBuilder.DropTable(
                name: "Medication");

            migrationBuilder.DropTable(
                name: "Medication_Receipt");

            migrationBuilder.DropTable(
                name: "Notification");

            migrationBuilder.DropTable(
                name: "Profile");

            migrationBuilder.DropTable(
                name: "Vaccination_Consultation");

            migrationBuilder.DropTable(
                name: "Vaccination_Result");

            migrationBuilder.DropTable(
                name: "Health_Check_Consent_Form");

            migrationBuilder.DropTable(
                name: "MedicalIncident");

            migrationBuilder.DropTable(
                name: "Medication_Submission_Form");

            migrationBuilder.DropTable(
                name: "Vaccination_Health_Check");

            migrationBuilder.DropTable(
                name: "Vaccination_Consent_Form");

            migrationBuilder.DropTable(
                name: "Vaccine_Type");

            migrationBuilder.DropTable(
                name: "Periodic_Health_Check_Plan");

            migrationBuilder.DropTable(
                name: "Vaccination_Plan");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Role");
        }
    }
}
