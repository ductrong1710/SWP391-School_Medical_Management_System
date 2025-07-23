using Businessobjects.Models;
using Repositories.Interfaces;
using Services.Interfaces; // Add this using directive

namespace Services.Implements
{
    public class VaccineTypeService : IVaccineTypeService
    {
        private readonly IVaccineTypeRepository _vaccineTypeRepository;

        public VaccineTypeService(IVaccineTypeRepository vaccineTypeRepository)
        {
            _vaccineTypeRepository = vaccineTypeRepository;
        }

        public async Task<IEnumerable<VaccineType>> GetAllVaccineTypesAsync()
        {
            return await _vaccineTypeRepository.GetAllVaccineTypesAsync();
        }

        public async Task<VaccineType?> GetVaccineTypeByIdAsync(string id)
        {
            return await _vaccineTypeRepository.GetVaccineTypeByIdAsync(id);
        }

        public async Task<VaccineType> CreateVaccineTypeAsync(VaccineType vaccineType)
        {
            if (await _vaccineTypeRepository.VaccineTypeExistsByNameAsync(vaccineType.VaccineName))
                throw new InvalidOperationException("A vaccine type with this name already exists");

            // Sinh mã tự động nếu chưa có
            if (string.IsNullOrWhiteSpace(vaccineType.VaccinationID))
            {
                // Lấy mã lớn nhất hiện có
                var all = await _vaccineTypeRepository.GetAllVaccineTypesAsync();
                int max = 0;
                foreach (var v in all)
                {
                    if (v.VaccinationID != null && v.VaccinationID.StartsWith("VC"))
                    {
                        var numPart = v.VaccinationID.Substring(2);
                        if (int.TryParse(numPart, out int n) && n > max)
                            max = n;
                    }
                }
                vaccineType.VaccinationID = $"VC{(max + 1).ToString("D4")}";
            }

            await _vaccineTypeRepository.CreateVaccineTypeAsync(vaccineType);
            return vaccineType;
        }

        public async Task UpdateVaccineTypeAsync(string id, VaccineType vaccineType)
        {
            if (id != vaccineType.VaccinationID)
                throw new ArgumentException("ID mismatch");

            if (!await _vaccineTypeRepository.VaccineTypeExistsAsync(id))
                throw new KeyNotFoundException("Vaccine type not found");

            var existingVaccineType = await _vaccineTypeRepository.GetVaccineTypeByIdAsync(id);
            if (existingVaccineType?.VaccineName != vaccineType.VaccineName &&
                await _vaccineTypeRepository.VaccineTypeExistsByNameAsync(vaccineType.VaccineName))
                throw new InvalidOperationException("A vaccine type with this name already exists");

            await _vaccineTypeRepository.UpdateVaccineTypeAsync(vaccineType);
        }

        public async Task DeleteVaccineTypeAsync(string id)
        {
            if (!await _vaccineTypeRepository.VaccineTypeExistsAsync(id))
                throw new KeyNotFoundException("Vaccine type not found");

            await _vaccineTypeRepository.DeleteVaccineTypeAsync(id);
        }
    }
}