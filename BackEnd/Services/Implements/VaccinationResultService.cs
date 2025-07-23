using Businessobjects.Models;
using Repositories.Interfaces;
using Services.Interfaces; // Add this using directive

namespace Services.Implements
{
    public class VaccinationResultService : IVaccinationResultService
    {
        private readonly IVaccinationResultRepository _resultRepository;
        private readonly IVaccinationConsentFormRepository _consentFormRepository;
        private readonly IVaccineTypeRepository _vaccineTypeRepository;
        private readonly INotificationService _notificationService;

        public VaccinationResultService(
            IVaccinationResultRepository resultRepository,
            IVaccinationConsentFormRepository consentFormRepository,
            IVaccineTypeRepository vaccineTypeRepository,
            INotificationService notificationService)
        {
            _resultRepository = resultRepository;
            _consentFormRepository = consentFormRepository;
            _vaccineTypeRepository = vaccineTypeRepository;
            _notificationService = notificationService;
        }

        public async Task<IEnumerable<VaccinationResult>> GetAllVaccinationResultsAsync()
        {
            return await _resultRepository.GetAllVaccinationResultsAsync();
        }

        public async Task<VaccinationResult?> GetVaccinationResultByIdAsync(string id)
        {
            return await _resultRepository.GetVaccinationResultByIdAsync(id);
        }

        public async Task<VaccinationResult?> GetVaccinationResultByConsentFormIdAsync(string consentFormId)
        {
            return await _resultRepository.GetVaccinationResultByConsentFormIdAsync(consentFormId);
        }

        public async Task<IEnumerable<VaccinationResult>> GetVaccinationResultsByVaccineTypeAsync(string vaccineTypeId)
        {
            return await _resultRepository.GetVaccinationResultsByVaccineTypeAsync(vaccineTypeId);
        }

        public async Task<IEnumerable<VaccinationResult>> GetVaccinationResultsByStudentAsync(string studentId)
        {
            var allResults = await _resultRepository.GetAllVaccinationResultsAsync();
            Console.WriteLine($"[LOG] Tổng số VaccinationResult: {allResults.Count()}");
            foreach (var r in allResults)
            {
                var consentFormId = r.ConsentForm != null ? r.ConsentForm.ID : "null";
                var student = r.ConsentForm != null ? r.ConsentForm.StudentID : "null";
                Console.WriteLine($"[LOG] ResultID: {r.ID}, ConsentFormID: {consentFormId}, StudentID: {student}");
            }
            var filtered = allResults.Where(r => r.ConsentForm != null && r.ConsentForm.StudentID == studentId).ToList();
            Console.WriteLine($"[LOG] Số bản ghi sau khi lọc theo studentId={studentId}: {filtered.Count}");
            return filtered;
        }

        public async Task<VaccinationResult> CreateVaccinationResultAsync(VaccinationResult result)
        {
            var consentForm = await _consentFormRepository.GetVaccinationConsentFormByIdAsync(result.ConsentFormID);
            if (consentForm == null)
                throw new KeyNotFoundException("Vaccination consent form not found");

            if (consentForm.ConsentStatus != "Approved")
                throw new InvalidOperationException("Cannot create vaccination result for a non-approved consent form");

            if (await _resultRepository.GetVaccinationResultByConsentFormIdAsync(result.ConsentFormID) != null)
                throw new InvalidOperationException("A vaccination result already exists for this consent form");

            if (!await _vaccineTypeRepository.VaccineTypeExistsAsync(result.VaccineTypeID))
                throw new KeyNotFoundException("Vaccine type not found");

            if (result.ActualVaccinationDate.Value.Date > DateTime.Today)
                throw new InvalidOperationException("Cannot set future date for actual vaccination date");

            if (string.IsNullOrEmpty(result.ID))
            {
                var allResults = await _resultRepository.GetAllVaccinationResultsAsync();
                var last = allResults.OrderByDescending(r => r.ID).FirstOrDefault();
                int nextNum = 1;
                if (last != null && last.ID.Length == 6 && last.ID.StartsWith("VR"))
                {
                    if (int.TryParse(last.ID.Substring(2), out int lastNum))
                    {
                        nextNum = lastNum + 1;
                    }
                }
                result.ID = $"VR{nextNum.ToString("D4")}";
            }

            await _resultRepository.CreateVaccinationResultAsync(result);

            // Gửi notification cho parent
            if (!string.IsNullOrEmpty(consentForm.ParentID))
            {
                var notification = new Notification
                {
                    UserID = consentForm.ParentID,
                    Title = "Kết quả tiêm chủng của con bạn",
                    Message = $"Kết quả tiêm chủng đã được ghi nhận cho học sinh mã {consentForm.StudentID}. Vui lòng kiểm tra chi tiết trong hệ thống.",
                    ConsentFormID = consentForm.ID
                };
                await _notificationService.CreateNotificationAsync(notification);
            }

            return result;
        }

        public async Task UpdateVaccinationResultAsync(string id, VaccinationResult result)
        {
            if (id != result.ID)
                throw new ArgumentException("ID mismatch");

            if (!await _resultRepository.VaccinationResultExistsAsync(id))
                throw new KeyNotFoundException("Vaccination result not found");

            var consentForm = await _consentFormRepository.GetVaccinationConsentFormByIdAsync(result.ConsentFormID);
            if (consentForm == null)
                throw new KeyNotFoundException("Vaccination consent form not found");

            if (!await _vaccineTypeRepository.VaccineTypeExistsAsync(result.VaccineTypeID))
                throw new KeyNotFoundException("Vaccine type not found");

            if (result.ActualVaccinationDate.Value.Date > DateTime.Today)
                throw new InvalidOperationException("Cannot set future date for actual vaccination date");

            await _resultRepository.UpdateVaccinationResultAsync(result);
        }

        public async Task DeleteVaccinationResultAsync(string id)
        {
            if (!await _resultRepository.VaccinationResultExistsAsync(id))
                throw new KeyNotFoundException("Vaccination result not found");

            await _resultRepository.DeleteVaccinationResultAsync(id);
        }
    }
}