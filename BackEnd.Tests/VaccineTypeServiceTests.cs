using NUnit.Framework;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Businessobjects.Models;
using Services.Implements;
using Repositories.Interfaces;

namespace BackEnd.Tests
{
    [TestFixture]
    public class VaccineTypeServiceTests
    {
        private Mock<IVaccineTypeRepository> _vaccineTypeRepoMock;
        private VaccineTypeService _service;

        [SetUp]
        public void Setup()
        {
            _vaccineTypeRepoMock = new Mock<IVaccineTypeRepository>();
            _service = new VaccineTypeService(_vaccineTypeRepoMock.Object);
        }

        [Test]
        public async Task GetAllVaccineTypesAsync_ReturnsList()
        {
            var types = new List<VaccineType> { new VaccineType { VaccinationID = "1" } };
            _vaccineTypeRepoMock.Setup(r => r.GetAllVaccineTypesAsync()).ReturnsAsync(types);
            var result = await _service.GetAllVaccineTypesAsync();
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.EquivalentTo(types));
        }

        [Test]
        public async Task GetVaccineTypeByIdAsync_Found()
        {
            var type = new VaccineType { VaccinationID = "1" };
            _vaccineTypeRepoMock.Setup(r => r.GetVaccineTypeByIdAsync("1")).ReturnsAsync(type);
            var result = await _service.GetVaccineTypeByIdAsync("1");
            Assert.That(result, Is.EqualTo(type));
        }

        [Test]
        public async Task GetVaccineTypeByIdAsync_NotFound()
        {
            _vaccineTypeRepoMock.Setup(r => r.GetVaccineTypeByIdAsync("2")).ReturnsAsync((VaccineType)null!);
            var result = await _service.GetVaccineTypeByIdAsync("2");
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task CreateVaccineTypeAsync_Success()
        {
            var type = new VaccineType { VaccinationID = "3", VaccineName = "TypeA" };
            _vaccineTypeRepoMock.Setup(r => r.GetAllVaccineTypesAsync()).ReturnsAsync(new List<VaccineType>());
            _vaccineTypeRepoMock.Setup(r => r.VaccineTypeExistsByNameAsync(type.VaccineName)).ReturnsAsync(false);
            _vaccineTypeRepoMock.Setup(r => r.CreateVaccineTypeAsync(type)).Returns(Task.CompletedTask);
            var result = await _service.CreateVaccineTypeAsync(type);
            Assert.That(result, Is.Not.Null);
            Assert.That(result.VaccineName, Is.EqualTo(type.VaccineName));
        }

        [Test]
        public async Task UpdateVaccineTypeAsync_Success()
        {
            var type = new VaccineType { VaccinationID = "4", VaccineName = "TypeB" };
            _vaccineTypeRepoMock.Setup(r => r.VaccineTypeExistsAsync(type.VaccinationID)).ReturnsAsync(true);
            _vaccineTypeRepoMock.Setup(r => r.GetVaccineTypeByIdAsync(type.VaccinationID)).ReturnsAsync(type);
            _vaccineTypeRepoMock.Setup(r => r.UpdateVaccineTypeAsync(type)).Returns(Task.CompletedTask);
            await _service.UpdateVaccineTypeAsync(type.VaccinationID, type);
            Assert.Pass();
        }

        [Test]
        public async Task DeleteVaccineTypeAsync_Success()
        {
            _vaccineTypeRepoMock.Setup(r => r.VaccineTypeExistsAsync("5")).ReturnsAsync(true);
            _vaccineTypeRepoMock.Setup(r => r.DeleteVaccineTypeAsync("5")).Returns(Task.CompletedTask);
            await _service.DeleteVaccineTypeAsync("5");
            Assert.Pass();
        }
    }
} 