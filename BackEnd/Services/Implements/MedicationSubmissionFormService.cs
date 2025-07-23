using Businessobjects.Models;
using Repositories.Interfaces;
using Services.Interfaces; // Add this using directive

namespace Services.Implements
{
    public class MedicationSubmissionFormService : IMedicationSubmissionFormService
    {
        private readonly IMedicationSubmissionFormRepository _repository;

        public MedicationSubmissionFormService(IMedicationSubmissionFormRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<MedicationSubmissionForm>> GetAllFormsAsync()
        {
            return await _repository.GetAllFormsAsync();
        }

        public async Task<MedicationSubmissionForm?> GetFormByIdAsync(string id)
        {
            return await _repository.GetFormByIdAsync(id);
        }

        public async Task<IEnumerable<MedicationSubmissionForm>> GetFormsByStudentIdAsync(string studentId)
        {
            return await _repository.GetFormsByStudentIdAsync(studentId);
        }

        public async Task<MedicationSubmissionForm> CreateFormAsync(MedicationSubmissionForm form)
        {
            await _repository.CreateFormAsync(form);
            return form;
        }

        public async Task UpdateFormAsync(string id, MedicationSubmissionForm form)
        {
            if (id != form.ID)
                throw new ArgumentException("ID mismatch");

            if (!await _repository.FormExistsAsync(id))
                throw new KeyNotFoundException("Medication submission form not found");

            await _repository.UpdateFormAsync(form);
        }

        public async Task DeleteFormAsync(string id)
        {
            if (!await _repository.FormExistsAsync(id))
                throw new KeyNotFoundException("Medication submission form not found");

            await _repository.DeleteFormAsync(id);
        }
    }
}