using Businessobjects.Models;
using Repositories.Interfaces;
using Services.Interfaces; // Add this using directive

namespace Services.Implements
{
    public class MedicationService : IMedicationService
    {
        private readonly IMedicationRepository _medicationRepository;

        public MedicationService(IMedicationRepository medicationRepository)
        {
            _medicationRepository = medicationRepository;
        }

        public async Task<IEnumerable<Medication>> GetAllMedicationsAsync()
        {
            return await _medicationRepository.GetAllMedicationsAsync();
        }

        public async Task<Medication?> GetMedicationByIdAsync(string id)
        {
            return await _medicationRepository.GetMedicationByIdAsync(id);
        }

        public async Task<IEnumerable<Medication>> GetExpiredMedicationsAsync()
        {
            return await _medicationRepository.GetExpiredMedicationsAsync();
        }

        public async Task<IEnumerable<Medication>> GetLowStockMedicationsAsync(int threshold = 10)
        {
            return await _medicationRepository.GetLowStockMedicationsAsync(threshold);
        }

        public async Task<Medication> CreateMedicationAsync(Medication medication)
        {
            await _medicationRepository.CreateMedicationAsync(medication);
            return medication;
        }

        public async Task UpdateMedicationAsync(string id, Medication medication)
        {
            if (id != medication.MedicationID)
                throw new ArgumentException("ID mismatch");

            if (!await _medicationRepository.MedicationExistsAsync(id))
                throw new KeyNotFoundException("Medication not found");

            await _medicationRepository.UpdateMedicationAsync(medication);
        }

        public async Task DeleteMedicationAsync(string id)
        {
            if (!await _medicationRepository.MedicationExistsAsync(id))
                throw new KeyNotFoundException("Medication not found");

            await _medicationRepository.DeleteMedicationAsync(id);
        }
    }
}