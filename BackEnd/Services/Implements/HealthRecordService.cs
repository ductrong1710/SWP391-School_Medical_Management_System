using Businessobjects.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Services.Implements
{
    public class HealthRecordService : IHealthRecordService
    {
        private readonly IHealthRecordRepository _healthRecordRepository;
        private readonly Businessobjects.Data.ApplicationDbContext _context;

        public HealthRecordService(IHealthRecordRepository healthRecordRepository, Businessobjects.Data.ApplicationDbContext context)
        {
            _healthRecordRepository = healthRecordRepository;
            _context = context;
        }

        public async Task<IEnumerable<HealthRecord>> GetAllHealthRecordsAsync()
        {
            return await _healthRecordRepository.GetAllHealthRecordsAsync();
        }

        public async Task<HealthRecord?> GetHealthRecordByIdAsync(string id)
        {
            return await _healthRecordRepository.GetHealthRecordByIdAsync(id);
        }

        public async Task<HealthRecord?> GetHealthRecordByStudentIdAsync(string studentId)
        {
            return await _healthRecordRepository.GetHealthRecordByStudentIdAsync(studentId);
        }

        public async Task<string> GenerateNextHealthRecordIDAsync()
        {
            var lastRecord = await _context.HealthRecords
                .OrderByDescending(r => r.HealthRecordID)
                .FirstOrDefaultAsync();
            if (lastRecord == null)
                return "HR00001";
            var lastId = lastRecord.HealthRecordID;
            int lastNumber = 1;
            if (lastId.Length > 2 && int.TryParse(lastId.Substring(2), out int parsed))
                lastNumber = parsed;
            var nextNumber = lastNumber + 1;
            return "HR" + nextNumber.ToString("D5");
        }

        public async Task<HealthRecord> CreateHealthRecordAsync(HealthRecord healthRecord)
        {
            healthRecord.HealthRecordID = await GenerateNextHealthRecordIDAsync();
            await _healthRecordRepository.CreateHealthRecordAsync(healthRecord);
            return healthRecord;
        }

        public async Task UpdateHealthRecordAsync(string id, HealthRecord healthRecord)
        {
            if (id != healthRecord.HealthRecordID)
                throw new ArgumentException("ID mismatch");

            if (!await _healthRecordRepository.HealthRecordExistsAsync(id))
                throw new KeyNotFoundException("Health record not found");

            await _healthRecordRepository.UpdateHealthRecordAsync(healthRecord);
        }

        public async Task DeleteHealthRecordAsync(string id)
        {
            if (!await _healthRecordRepository.HealthRecordExistsAsync(id))
                throw new KeyNotFoundException("Health record not found");

            await _healthRecordRepository.DeleteHealthRecordAsync(id);
        }
    }
}