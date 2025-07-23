using Businessobjects.Models;
using Repositories.Interfaces;
using Services.Interfaces; // Add this using directive

namespace Services.Implements
{
    public class HealthCheckConsentFormService : IHealthCheckConsentFormService
    {
        private readonly IHealthCheckConsentFormRepository _consentFormRepository;

        public HealthCheckConsentFormService(IHealthCheckConsentFormRepository consentFormRepository)
        {
            _consentFormRepository = consentFormRepository;
        }

        public async Task<IEnumerable<HealthCheckConsentForm>> GetAllConsentFormsAsync()
        {
            return await _consentFormRepository.GetAllConsentFormsAsync();
        }

        public async Task<HealthCheckConsentForm?> GetConsentFormByIdAsync(string id)
        {
            return await _consentFormRepository.GetConsentFormByIdAsync(id);
        }

        public async Task<IEnumerable<HealthCheckConsentForm>> GetConsentFormsByPlanIdAsync(string planId)
        {
            return await _consentFormRepository.GetConsentFormsByPlanIdAsync(planId);
        }

        public async Task<IEnumerable<HealthCheckConsentForm>> GetConsentFormsByStudentIdAsync(string studentId)
        {
            return await _consentFormRepository.GetConsentFormsByStudentIdAsync(studentId);
        }

        public async Task<HealthCheckConsentForm?> GetConsentFormByPlanAndStudentAsync(string planId, string studentId)
        {
            return await _consentFormRepository.GetConsentFormByPlanAndStudentAsync(planId, studentId);
        }

        public async Task<HealthCheckConsentForm> CreateConsentFormAsync(HealthCheckConsentForm form)
        {
            var existingForm = await _consentFormRepository.GetConsentFormByPlanAndStudentAsync(form.HealthCheckPlanID, form.StudentID);
            if (existingForm != null)
                throw new InvalidOperationException("A consent form already exists for this student and plan");

            var allForms = await _consentFormRepository.GetAllConsentFormsAsync();
            int maxNum = 0;
            foreach (var f in allForms)
            {
                if (f.ID != null && f.ID.StartsWith("HC"))
                {
                    if (int.TryParse(f.ID.Substring(2), out int num))
                    {
                        if (num > maxNum) maxNum = num;
                    }
                }
            }
            form.ID = $"HC{(maxNum + 1).ToString("D4")}";
            
            // Set default status to Waiting (3)
            if (!form.StatusID.HasValue)
            {
                form.StatusID = 3;
            }

            await _consentFormRepository.CreateConsentFormAsync(form);
            return form;
        }

        public async Task UpdateConsentFormAsync(string id, HealthCheckConsentForm form)
        {
            if (id != form.ID)
                throw new ArgumentException("ID mismatch");

            if (!await _consentFormRepository.ConsentFormExistsAsync(id))
                throw new KeyNotFoundException("Consent form not found");

            await _consentFormRepository.UpdateConsentFormAsync(form);
        }

        public async Task DeleteConsentFormAsync(string id)
        {
            if (!await _consentFormRepository.ConsentFormExistsAsync(id))
                throw new KeyNotFoundException("Consent form not found");

            await _consentFormRepository.DeleteConsentFormAsync(id);
        }

        public async Task<IEnumerable<User>> GetChildrenByParentIdAsync(string parentId)
        {
            // Giả sử repository có hàm GetChildrenByParentIdAsync
            return await _consentFormRepository.GetChildrenByParentIdAsync(parentId);
        }

        public async Task<IEnumerable<HealthCheckConsentForm>> GetConsentFormsByStudentIdsAsync(IEnumerable<string> studentIds)
        {
            // Giả sử repository có hàm GetConsentFormsByStudentIdsAsync
            return await _consentFormRepository.GetConsentFormsByStudentIdsAsync(studentIds);
        }
    }
}