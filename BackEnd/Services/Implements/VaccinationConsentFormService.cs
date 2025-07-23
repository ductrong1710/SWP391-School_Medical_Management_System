using Businessobjects.Models;
using Repositories.Interfaces;
using Services.Interfaces; // Add this using directive

namespace Services.Implements
{
    public class VaccinationConsentFormService : IVaccinationConsentFormService
    {
        private readonly IVaccinationConsentFormRepository _consentFormRepository;
        private readonly IVaccinationPlanRepository _planRepository;

        public VaccinationConsentFormService(
            IVaccinationConsentFormRepository consentFormRepository,
            IVaccinationPlanRepository planRepository)
        {
            _consentFormRepository = consentFormRepository;
            _planRepository = planRepository;
        }

        public async Task<IEnumerable<VaccinationConsentForm>> GetAllVaccinationConsentFormsAsync()
        {
            return await _consentFormRepository.GetAllVaccinationConsentFormsAsync();
        }

        public async Task<VaccinationConsentForm?> GetVaccinationConsentFormByIdAsync(string id)
        {
            return await _consentFormRepository.GetVaccinationConsentFormByIdAsync(id);
        }

        public async Task<IEnumerable<VaccinationConsentForm>> GetConsentFormsByPlanIdAsync(string planId)
        {
            return await _consentFormRepository.GetConsentFormsByPlanIdAsync(planId);
        }

        public async Task<IEnumerable<VaccinationConsentForm>> GetConsentFormsByStudentIdAsync(string studentId)
        {
            return await _consentFormRepository.GetConsentFormsByStudentIdAsync(studentId);
        }

        public async Task<VaccinationConsentForm?> GetConsentFormByPlanAndStudentAsync(string planId, string studentId)
        {
            return await _consentFormRepository.GetConsentFormByPlanAndStudentAsync(planId, studentId);
        }

        public async Task<VaccinationConsentForm> CreateVaccinationConsentFormAsync(VaccinationConsentForm form)
        {
            var plan = await _planRepository.GetVaccinationPlanByIdAsync(form.VaccinationPlanID);
            if (plan == null)
                throw new KeyNotFoundException("Vaccination plan not found");

            if (plan.ScheduledDate < DateTime.Today)
                throw new InvalidOperationException("Cannot submit consent form for a past vaccination plan");

            var existingForm = await _consentFormRepository.GetConsentFormByPlanAndStudentAsync(form.VaccinationPlanID, form.StudentID);
            if (existingForm != null)
                throw new InvalidOperationException("A consent form already exists for this student and vaccination plan");

            if (string.IsNullOrEmpty(form.ID))
            {
                var allForms = await _consentFormRepository.GetAllVaccinationConsentFormsAsync();
                int maxNum = 0;
                foreach (var f in allForms)
                {
                    if (f.ID != null && f.ID.StartsWith("VCF") && f.ID.Length == 6)
                    {
                        if (int.TryParse(f.ID.Substring(3), out int num))
                        {
                            if (num > maxNum) maxNum = num;
                        }
                    }
                }
                form.ID = $"VCF{(maxNum + 1).ToString("D3")}";
            }

            await _consentFormRepository.CreateVaccinationConsentFormAsync(form);
            return form;
        }

        public async Task UpdateVaccinationConsentFormAsync(string id, VaccinationConsentForm form)
        {
            if (id != form.ID)
                throw new ArgumentException("ID mismatch");

            if (!await _consentFormRepository.VaccinationConsentFormExistsAsync(id))
                throw new KeyNotFoundException("Vaccination consent form not found");

            var plan = await _planRepository.GetVaccinationPlanByIdAsync(form.VaccinationPlanID);
            if (plan == null)
                throw new KeyNotFoundException("Vaccination plan not found");

            if (plan.ScheduledDate < DateTime.Today)
                throw new InvalidOperationException("Cannot update consent form for a past vaccination plan");

            await _consentFormRepository.UpdateVaccinationConsentFormAsync(form);
        }

        public async Task DeleteVaccinationConsentFormAsync(string id)
        {
            var form = await _consentFormRepository.GetVaccinationConsentFormByIdAsync(id);
            if (form == null)
                throw new KeyNotFoundException("Vaccination consent form not found");

            if (form.VaccinationResult != null)
                throw new InvalidOperationException("Cannot delete a consent form that has an associated vaccination result");

            await _consentFormRepository.DeleteVaccinationConsentFormAsync(id);
        }
    }
}