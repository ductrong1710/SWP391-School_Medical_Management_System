using Microsoft.EntityFrameworkCore;
using Businessobjects.Models;

namespace Businessobjects.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<HealthRecord> HealthRecords { get; set; }
        public DbSet<MedicalSupply> MedicalSupplies { get; set; }
        public DbSet<Medication> Medications { get; set; }
        public DbSet<Role> Role { get; set; }
        public DbSet<MedicationSubmissionForm> MedicationSubmissionForms { get; set; }
        public DbSet<PeriodicHealthCheckPlan> PeriodicHealthCheckPlans { get; set; }
        public DbSet<HealthCheckConsentForm> HealthCheckConsentForms { get; set; }
        public DbSet<HealthCheckResult> HealthCheckResults { get; set; }
        public DbSet<VaccineType> VaccinationTypes { get; set; }
        public DbSet<VaccinationPlan> VaccinationPlans { get; set; }
        public DbSet<VaccinationConsentForm> VaccinationConsentForms { get; set; }
        public DbSet<VaccinationResult> VaccinationResults { get; set; }
        public DbSet<MedicationReceipt> MedicationReceipts { get; set; }
        public DbSet<VaccinationConsultation> VaccinationConsultations { get; set; }
        public DbSet<VaccinationHealthCheck> VaccinationHealthChecks { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<SchoolClass> SchoolClasses { get; set; }
        public DbSet<Status> Statuses { get; set; }
        public DbSet<MedicalIncident> MedicalIncidents { get; set; }
        public DbSet<IncidentInvolvement> IncidentInvolvements { get; set; }
        public DbSet<SupplyMedUsage> SupplyMedUsages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Map entity to correct table names in database
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Profile>().ToTable("Profile");
            modelBuilder.Entity<HealthRecord>().ToTable("Health_Record");
            modelBuilder.Entity<MedicalSupply>().ToTable("Medical_Supply");
            modelBuilder.Entity<Medication>().ToTable("Medication");
            modelBuilder.Entity<Role>().ToTable("Role");
            modelBuilder.Entity<MedicationSubmissionForm>().ToTable("Medication_Submission_Form");
            modelBuilder.Entity<PeriodicHealthCheckPlan>().ToTable("Periodic_Health_Check_Plan");
            modelBuilder.Entity<HealthCheckConsentForm>().ToTable("Health_Check_Consent_Form");
            modelBuilder.Entity<HealthCheckResult>().ToTable("Health_Check_Result");
            modelBuilder.Entity<VaccineType>().ToTable("Vaccine_Type");
            modelBuilder.Entity<VaccinationPlan>().ToTable("Vaccination_Plan");
            modelBuilder.Entity<VaccinationConsentForm>().ToTable("Vaccination_Consent_Form");
            modelBuilder.Entity<VaccinationResult>().ToTable("Vaccination_Result");
            modelBuilder.Entity<MedicationReceipt>().ToTable("Medication_Receipt");
            modelBuilder.Entity<VaccinationConsultation>().ToTable("Vaccination_Consultation");
            modelBuilder.Entity<VaccinationHealthCheck>().ToTable("Vaccination_Health_Check");
            modelBuilder.Entity<Notification>().ToTable("Notification");
            modelBuilder.Entity<Status>().ToTable("Status");

            base.OnModelCreating(modelBuilder);

            // Configure existing relationships
            ConfigureExistingRelationships(modelBuilder);

            // Configure vaccination-related relationships
            ConfigureVaccinationRelationships(modelBuilder);

            // Configure health check result relationships
            ConfigureHealthCheckResultRelationships(modelBuilder);

            // Cấu hình mối quan hệ VaccinationConsultation - User (Student, Parent, MedicalStaff)
            modelBuilder.Entity<VaccinationConsultation>()
                .HasOne(vc => vc.Student)
                .WithMany(u => u.StudentVaccinationConsultations)
                .HasForeignKey(vc => vc.StudentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VaccinationConsultation>()
                .HasOne(vc => vc.Parent)
                .WithMany(u => u.ParentVaccinationConsultations)
                .HasForeignKey(vc => vc.ParentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VaccinationConsultation>()
                .HasOne(vc => vc.MedicalStaff)
                .WithMany(u => u.MedicalStaffVaccinationConsultations)
                .HasForeignKey(vc => vc.MedicalStaffID)
                .OnDelete(DeleteBehavior.Restrict);

            // Cấu hình mối quan hệ MedicationReceipt - User (MedicalStaff, Parent)
            modelBuilder.Entity<MedicationReceipt>()
                .HasOne(m => m.MedicalStaff)
                .WithMany(u => u.MedicalStaffMedicationReceipts)
                .HasForeignKey(m => m.MedicalStaffID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MedicationReceipt>()
                .HasOne(m => m.Parent)
                .WithMany(u => u.ParentMedicationReceipts)
                .HasForeignKey(m => m.ParentID)
                .OnDelete(DeleteBehavior.Restrict);

            // Cấu hình mối quan hệ VaccinationHealthCheck - User (Parent, Student)
            modelBuilder.Entity<VaccinationHealthCheck>()
                .HasOne(vh => vh.Parent)
                .WithMany(u => u.ParentVaccinationHealthChecks)
                .HasForeignKey(vh => vh.ParentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VaccinationHealthCheck>()
                .HasOne(vh => vh.Student)
                .WithMany(u => u.StudentVaccinationHealthChecks)
                .HasForeignKey(vh => vh.StudentID)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed data
            SeedData(modelBuilder);
        }

        private void ConfigureExistingRelationships(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Profile>()
                .HasOne(p => p.User)
                .WithOne()
                .HasForeignKey<Profile>(p => p.UserID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<HealthRecord>()
                .HasOne(h => h.Student)
                .WithMany()
                .HasForeignKey(h => h.StudentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MedicationSubmissionForm>()
                .HasOne(m => m.Student)
                .WithMany()
                .HasForeignKey(m => m.StudentID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PeriodicHealthCheckPlan>()
                .HasOne(p => p.Creator)
                .WithMany()
                .HasForeignKey(p => p.CreatorID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HealthCheckConsentForm>()
                .HasOne(h => h.HealthCheckPlan)
                .WithMany(p => p.ConsentForms)
                .HasForeignKey(h => h.HealthCheckPlanID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<HealthCheckConsentForm>()
                .HasOne(h => h.Student)
                .WithMany()
                .HasForeignKey(h => h.StudentID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<HealthCheckConsentForm>()
                .HasOne(h => h.Status)
                .WithMany(s => s.HealthCheckConsentForms)
                .HasForeignKey(h => h.StatusID)
                .OnDelete(DeleteBehavior.Restrict);
        }

        private void ConfigureVaccinationRelationships(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<VaccinationPlan>()
                .HasOne(p => p.Creator)
                .WithMany()
                .HasForeignKey(p => p.CreatorID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VaccinationConsentForm>()
                .HasOne(f => f.VaccinationPlan)
                .WithMany(p => p.ConsentForms)
                .HasForeignKey(f => f.VaccinationPlanID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<VaccinationConsentForm>()
                .HasOne(f => f.Student)
                .WithMany()
                .HasForeignKey(f => f.StudentID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<VaccinationResult>()
                .HasOne(r => r.ConsentForm)
                .WithOne(f => f.VaccinationResult)
                .HasForeignKey<VaccinationResult>(r => r.ConsentFormID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<VaccinationResult>()
                .HasOne(r => r.VaccineType)
                .WithMany(t => t.VaccinationResults)
                .HasForeignKey(r => r.VaccineTypeID)
                .OnDelete(DeleteBehavior.Restrict);
        }

        private void ConfigureHealthCheckResultRelationships(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<HealthCheckResult>()
                .HasOne(r => r.HealthCheckConsent)
                .WithOne()
                .HasForeignKey<HealthCheckResult>(r => r.HealthCheckConsentID)
                .OnDelete(DeleteBehavior.Cascade);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Status seed data
            modelBuilder.Entity<Status>().HasData(
                new Status { StatusID = 1, StatusName = "Accept" },
                new Status { StatusID = 2, StatusName = "Deny" },
                new Status { StatusID = 3, StatusName = "Waiting" }
            );

            // Role seed data
            modelBuilder.Entity<Role>().HasData(
                new Role { RoleID = "1", RoleType = "Admin" },
                new Role { RoleID = "2", RoleType = "User" },
                new Role { RoleID = "3", RoleType = "Nurse" },
                new Role { RoleID = "4", RoleType = "Teacher" }
            );

            // Example seed data with fixed GUIDs
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    UserID = "c9d4c053-49b6-410c-bc78-2d54a9991870",
                    Username = "admin",
                    Password = "admin123",
                    RoleID = "1"
                },
                new User
                {
                    UserID = "d8663e5e-7494-4f81-8739-6e0de1bea7ee",
                    Username = "user",
                    Password = "user123",
                    RoleID = "2"
                },
                new User
                {
                    UserID = "b9e7d454-99df-4506-8c0f-3b2c33c21d12",
                    Username = "nurse",
                    Password = "nurse123",
                    RoleID = "3"
                }
            );

            // Profile seed data
            modelBuilder.Entity<Profile>().HasData(
    new
    {
        ProfileID = "f5b7824f-5e35-4682-98d1-0e98f8dd6b31",
        Name = "Admin User",
        DateOfBirth = new DateTime(1990, 1, 1),
        Sex = "Male",
        Class = "Admin Class",
        Phone = "1234567890",
        UserID = "c9d4c053-49b6-410c-bc78-2d54a9991870",
        Note = "Admin profile"
    }
);

            // Example health record seed data
            modelBuilder.Entity<HealthRecord>().HasData(
                new
                {
                    HealthRecordID = "a2b4c6d8-e0f2-4681-9314-123456789012",
                    StudentID = "f5b7824f-5e35-4682-98d1-0e98f8dd6b31",
                    ParentID = "P12345",
                    Allergies = "None",
                    ChronicDiseases = "None",
                    TreatmentHistory = "No major treatments",
                    Eyesight = 20,
                    Hearing = 20,
                    VaccinationHistory = "Up to date",
                    Note = "Healthy student",
                    ParentContact = "0987654321"
                }
            );
        }
    }
}