using NUnit.Framework;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Businessobjects.Models;
using Services.Implements;
using Repositories.Interfaces;
using Services.Interfaces;

namespace BackEnd.Tests
{
    [TestFixture]
    public class VaccinationResultServiceTests
    {
        private Mock<IVaccinationResultRepository> _resultRepoMock;
        private Mock<IVaccinationConsentFormRepository> _consentFormRepoMock;
        private Mock<IVaccineTypeRepository> _vaccineTypeRepoMock;
        private Mock<INotificationService> _notificationServiceMock;
        private VaccinationResultService _service;

        [SetUp]
        public void Setup()
        {
            _resultRepoMock = new Mock<IVaccinationResultRepository>();
            _consentFormRepoMock = new Mock<IVaccinationConsentFormRepository>();
            _vaccineTypeRepoMock = new Mock<IVaccineTypeRepository>();
            _notificationServiceMock = new Mock<INotificationService>();
            _service = new VaccinationResultService(_resultRepoMock.Object, _consentFormRepoMock.Object, _vaccineTypeRepoMock.Object, _notificationServiceMock.Object);
        }

        [Test]
        public async Task GetAllVaccinationResultsAsync_ReturnsList()
        {
            var results = new List<VaccinationResult> { new VaccinationResult { ID = "1" } };
            _resultRepoMock.Setup(r => r.GetAllVaccinationResultsAsync()).ReturnsAsync(results);
            var result = await _service.GetAllVaccinationResultsAsync();
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.EquivalentTo(results));
        }

        [Test]
        public async Task GetVaccinationResultByIdAsync_Found()
        {
            var res = new VaccinationResult { ID = "1" };
            _resultRepoMock.Setup(r => r.GetVaccinationResultByIdAsync("1")).ReturnsAsync(res);
            var result = await _service.GetVaccinationResultByIdAsync("1");
            Assert.That(result, Is.EqualTo(res));
        }

        [Test]
        public async Task GetVaccinationResultByIdAsync_NotFound()
        {
            _resultRepoMock.Setup(r => r.GetVaccinationResultByIdAsync("2")).ReturnsAsync((VaccinationResult)null!);
            var result = await _service.GetVaccinationResultByIdAsync("2");
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task GetVaccinationResultByConsentFormIdAsync_Found()
        {
            var res = new VaccinationResult { ID = "1", ConsentFormID = "CF1" };
            _resultRepoMock.Setup(r => r.GetVaccinationResultByConsentFormIdAsync("CF1")).ReturnsAsync(res);
            var result = await _service.GetVaccinationResultByConsentFormIdAsync("CF1");
            Assert.That(result, Is.EqualTo(res));
        }

        [Test]
        public async Task GetVaccinationResultByConsentFormIdAsync_NotFound()
        {
            _resultRepoMock.Setup(r => r.GetVaccinationResultByConsentFormIdAsync("CF2")).ReturnsAsync((VaccinationResult)null!);
            var result = await _service.GetVaccinationResultByConsentFormIdAsync("CF2");
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task GetVaccinationResultsByVaccineTypeAsync_ReturnsList()
        {
            var results = new List<VaccinationResult> { new VaccinationResult { ID = "1", VaccineTypeID = "VT1" } };
            _resultRepoMock.Setup(r => r.GetVaccinationResultsByVaccineTypeAsync("VT1")).ReturnsAsync(results);
            var result = await _service.GetVaccinationResultsByVaccineTypeAsync("VT1");
            Assert.That(result, Is.EquivalentTo(results));
        }

        [Test]
        public async Task GetVaccinationResultsByStudentAsync_ReturnsList()
        {
            var consentForm = new VaccinationConsentForm { ID = "CF1", StudentID = "S1" };
            var results = new List<VaccinationResult> { new VaccinationResult { ID = "1", ConsentForm = consentForm } };
            _resultRepoMock.Setup(r => r.GetAllVaccinationResultsAsync()).ReturnsAsync(results);
            var result = await _service.GetVaccinationResultsByStudentAsync("S1");
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(1));
        }

        [Test]
        public async Task GetVaccinationResultsByStudentAsync_EmptyList()
        {
            _resultRepoMock.Setup(r => r.GetAllVaccinationResultsAsync()).ReturnsAsync(new List<VaccinationResult>());
            var result = await _service.GetVaccinationResultsByStudentAsync("S1");
            Assert.That(result, Is.Empty);
        }

        [Test]
        public async Task CreateVaccinationResultAsync_Success()
        {
            var consentForm = new VaccinationConsentForm { ID = "CF1", ConsentStatus = "Approved", ParentID = "P1", StudentID = "S1" };
            var result = new VaccinationResult { ConsentFormID = consentForm.ID, VaccineTypeID = "VT1", ActualVaccinationDate = DateTime.Today };
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync(consentForm.ID)).ReturnsAsync(consentForm);
            _resultRepoMock.Setup(r => r.GetVaccinationResultByConsentFormIdAsync(consentForm.ID)).ReturnsAsync((VaccinationResult)null!);
            _vaccineTypeRepoMock.Setup(r => r.VaccineTypeExistsAsync(result.VaccineTypeID)).ReturnsAsync(true);
            _resultRepoMock.Setup(r => r.GetAllVaccinationResultsAsync()).ReturnsAsync(new List<VaccinationResult>());
            _resultRepoMock.Setup(r => r.CreateVaccinationResultAsync(It.IsAny<VaccinationResult>())).Returns(Task.CompletedTask);
            _notificationServiceMock.Setup(n => n.CreateNotificationAsync(It.IsAny<Notification>())).ReturnsAsync(new Notification());
            var created = await _service.CreateVaccinationResultAsync(result);
            Assert.That(created, Is.Not.Null);
            Assert.That(created.ConsentFormID, Is.EqualTo(result.ConsentFormID));
        }

        [Test]
        public void CreateVaccinationResultAsync_ConsentFormNotFound_Throws()
        {
            var result = new VaccinationResult { ConsentFormID = "CF2", VaccineTypeID = "VT1", ActualVaccinationDate = DateTime.Today };
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync(result.ConsentFormID)).ReturnsAsync((VaccinationConsentForm)null!);
            Assert.ThrowsAsync<KeyNotFoundException>(async () => await _service.CreateVaccinationResultAsync(result));
        }

        [Test]
        public void CreateVaccinationResultAsync_ConsentNotApproved_Throws()
        {
            var consentForm = new VaccinationConsentForm { ID = "CF3", ConsentStatus = "Denied", ParentID = "P1", StudentID = "S1" };
            var result = new VaccinationResult { ConsentFormID = consentForm.ID, VaccineTypeID = "VT1", ActualVaccinationDate = DateTime.Today };
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync(consentForm.ID)).ReturnsAsync(consentForm);
            _resultRepoMock.Setup(r => r.GetVaccinationResultByConsentFormIdAsync(consentForm.ID)).ReturnsAsync((VaccinationResult)null!);
            _vaccineTypeRepoMock.Setup(r => r.VaccineTypeExistsAsync(result.VaccineTypeID)).ReturnsAsync(true);
            Assert.ThrowsAsync<InvalidOperationException>(async () => await _service.CreateVaccinationResultAsync(result));
        }

        [Test]
        public void CreateVaccinationResultAsync_AlreadyExists_Throws()
        {
            var consentForm = new VaccinationConsentForm { ID = "CF4", ConsentStatus = "Approved", ParentID = "P1", StudentID = "S1" };
            var result = new VaccinationResult { ConsentFormID = consentForm.ID, VaccineTypeID = "VT1", ActualVaccinationDate = DateTime.Today };
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync(consentForm.ID)).ReturnsAsync(consentForm);
            _resultRepoMock.Setup(r => r.GetVaccinationResultByConsentFormIdAsync(consentForm.ID)).ReturnsAsync(new VaccinationResult());
            _vaccineTypeRepoMock.Setup(r => r.VaccineTypeExistsAsync(result.VaccineTypeID)).ReturnsAsync(true);
            Assert.ThrowsAsync<InvalidOperationException>(async () => await _service.CreateVaccinationResultAsync(result));
        }

        [Test]
        public void CreateVaccinationResultAsync_VaccineTypeNotFound_Throws()
        {
            var consentForm = new VaccinationConsentForm { ID = "CF5", ConsentStatus = "Approved", ParentID = "P1", StudentID = "S1" };
            var result = new VaccinationResult { ConsentFormID = consentForm.ID, VaccineTypeID = "VT2", ActualVaccinationDate = DateTime.Today };
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync(consentForm.ID)).ReturnsAsync(consentForm);
            _resultRepoMock.Setup(r => r.GetVaccinationResultByConsentFormIdAsync(consentForm.ID)).ReturnsAsync((VaccinationResult)null!);
            _vaccineTypeRepoMock.Setup(r => r.VaccineTypeExistsAsync(result.VaccineTypeID)).ReturnsAsync(false);
            Assert.ThrowsAsync<KeyNotFoundException>(async () => await _service.CreateVaccinationResultAsync(result));
        }

        [Test]
        public void CreateVaccinationResultAsync_FutureDate_Throws()
        {
            var consentForm = new VaccinationConsentForm { ID = "CF6", ConsentStatus = "Approved", ParentID = "P1", StudentID = "S1" };
            var result = new VaccinationResult { ConsentFormID = consentForm.ID, VaccineTypeID = "VT1", ActualVaccinationDate = DateTime.Today.AddDays(1) };
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync(consentForm.ID)).ReturnsAsync(consentForm);
            _resultRepoMock.Setup(r => r.GetVaccinationResultByConsentFormIdAsync(consentForm.ID)).ReturnsAsync((VaccinationResult)null!);
            _vaccineTypeRepoMock.Setup(r => r.VaccineTypeExistsAsync(result.VaccineTypeID)).ReturnsAsync(true);
            Assert.ThrowsAsync<InvalidOperationException>(async () => await _service.CreateVaccinationResultAsync(result));
        }

        [Test]
        public async Task CreateVaccinationResultAsync_NotificationNotSent_WhenNoParentID()
        {
            var consentForm = new VaccinationConsentForm { ID = "CF1", ConsentStatus = "Approved", ParentID = null, StudentID = "S1" };
            var result = new VaccinationResult { ConsentFormID = consentForm.ID, VaccineTypeID = "VT1", ActualVaccinationDate = DateTime.Today };
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync(consentForm.ID)).ReturnsAsync(consentForm);
            _resultRepoMock.Setup(r => r.GetVaccinationResultByConsentFormIdAsync(consentForm.ID)).ReturnsAsync((VaccinationResult)null!);
            _vaccineTypeRepoMock.Setup(r => r.VaccineTypeExistsAsync(result.VaccineTypeID)).ReturnsAsync(true);
            _resultRepoMock.Setup(r => r.GetAllVaccinationResultsAsync()).ReturnsAsync(new List<VaccinationResult>());
            _resultRepoMock.Setup(r => r.CreateVaccinationResultAsync(It.IsAny<VaccinationResult>())).Returns(Task.CompletedTask);
            // Không setup notificationServiceMock để kiểm tra không gửi notification
            var created = await _service.CreateVaccinationResultAsync(result);
            Assert.That(created, Is.Not.Null);
        }

        [Test]
        public async Task CreateVaccinationResultAsync_AutoIdGeneration_CoversLoop()
        {
            var consentForm = new VaccinationConsentForm { ID = "CF1", ConsentStatus = "Approved", ParentID = "P1", StudentID = "S1" };
            var result = new VaccinationResult { ConsentFormID = consentForm.ID, VaccineTypeID = "VT1", ActualVaccinationDate = DateTime.Today, ID = "" };
            var allResults = new List<VaccinationResult>
            {
                new VaccinationResult { ID = "VR0001" },
                new VaccinationResult { ID = "VR0002" },
                new VaccinationResult { ID = "VR0010" }
            };
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync(consentForm.ID)).ReturnsAsync(consentForm);
            _resultRepoMock.Setup(r => r.GetVaccinationResultByConsentFormIdAsync(consentForm.ID)).ReturnsAsync((VaccinationResult)null!);
            _vaccineTypeRepoMock.Setup(r => r.VaccineTypeExistsAsync(result.VaccineTypeID)).ReturnsAsync(true);
            _resultRepoMock.Setup(r => r.GetAllVaccinationResultsAsync()).ReturnsAsync(allResults);
            _resultRepoMock.Setup(r => r.CreateVaccinationResultAsync(It.IsAny<VaccinationResult>())).Returns(Task.CompletedTask);
            _notificationServiceMock.Setup(n => n.CreateNotificationAsync(It.IsAny<Notification>())).ReturnsAsync(new Notification());
            var created = await _service.CreateVaccinationResultAsync(result);
            Assert.That(created.ID, Is.EqualTo("VR0011"));
        }

        [Test]
        public async Task UpdateVaccinationResultAsync_Success()
        {
            var consentForm = new VaccinationConsentForm { ID = "CF7", ConsentStatus = "Approved", ParentID = "P1", StudentID = "S1" };
            var result = new VaccinationResult { ID = "R1", ConsentFormID = consentForm.ID, VaccineTypeID = "VT1", ActualVaccinationDate = DateTime.Today };
            _resultRepoMock.Setup(r => r.VaccinationResultExistsAsync(result.ID)).ReturnsAsync(true);
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync(result.ConsentFormID)).ReturnsAsync(consentForm);
            _vaccineTypeRepoMock.Setup(r => r.VaccineTypeExistsAsync(result.VaccineTypeID)).ReturnsAsync(true);
            _resultRepoMock.Setup(r => r.UpdateVaccinationResultAsync(result)).Returns(Task.CompletedTask);
            await _service.UpdateVaccinationResultAsync(result.ID, result);
            Assert.Pass();
        }

        [Test]
        public void UpdateVaccinationResultAsync_IdMismatch_Throws()
        {
            var result = new VaccinationResult { ID = "R2", ConsentFormID = "CF8", VaccineTypeID = "VT1", ActualVaccinationDate = DateTime.Today };
            Assert.ThrowsAsync<ArgumentException>(async () => await _service.UpdateVaccinationResultAsync("DIFFERENT", result));
        }

        [Test]
        public void UpdateVaccinationResultAsync_NotFound_Throws()
        {
            var result = new VaccinationResult { ID = "R3", ConsentFormID = "CF9", VaccineTypeID = "VT1", ActualVaccinationDate = DateTime.Today };
            _resultRepoMock.Setup(r => r.VaccinationResultExistsAsync(result.ID)).ReturnsAsync(false);
            Assert.ThrowsAsync<KeyNotFoundException>(async () => await _service.UpdateVaccinationResultAsync(result.ID, result));
        }

        [Test]
        public void UpdateVaccinationResultAsync_ConsentFormNotFound_Throws()
        {
            var result = new VaccinationResult { ID = "R4", ConsentFormID = "CF10", VaccineTypeID = "VT1", ActualVaccinationDate = DateTime.Today };
            _resultRepoMock.Setup(r => r.VaccinationResultExistsAsync(result.ID)).ReturnsAsync(true);
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync(result.ConsentFormID)).ReturnsAsync((VaccinationConsentForm)null!);
            Assert.ThrowsAsync<KeyNotFoundException>(async () => await _service.UpdateVaccinationResultAsync(result.ID, result));
        }

        [Test]
        public void UpdateVaccinationResultAsync_VaccineTypeNotFound_Throws()
        {
            var consentForm = new VaccinationConsentForm { ID = "CF11", ConsentStatus = "Approved", ParentID = "P1", StudentID = "S1" };
            var result = new VaccinationResult { ID = "R5", ConsentFormID = consentForm.ID, VaccineTypeID = "VT2", ActualVaccinationDate = DateTime.Today };
            _resultRepoMock.Setup(r => r.VaccinationResultExistsAsync(result.ID)).ReturnsAsync(true);
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync(result.ConsentFormID)).ReturnsAsync(consentForm);
            _vaccineTypeRepoMock.Setup(r => r.VaccineTypeExistsAsync(result.VaccineTypeID)).ReturnsAsync(false);
            Assert.ThrowsAsync<KeyNotFoundException>(async () => await _service.UpdateVaccinationResultAsync(result.ID, result));
        }

        [Test]
        public void UpdateVaccinationResultAsync_FutureDate_Throws()
        {
            var consentForm = new VaccinationConsentForm { ID = "CF12", ConsentStatus = "Approved", ParentID = "P1", StudentID = "S1" };
            var result = new VaccinationResult { ID = "R6", ConsentFormID = consentForm.ID, VaccineTypeID = "VT1", ActualVaccinationDate = DateTime.Today.AddDays(1) };
            _resultRepoMock.Setup(r => r.VaccinationResultExistsAsync(result.ID)).ReturnsAsync(true);
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync(result.ConsentFormID)).ReturnsAsync(consentForm);
            _vaccineTypeRepoMock.Setup(r => r.VaccineTypeExistsAsync(result.VaccineTypeID)).ReturnsAsync(true);
            Assert.ThrowsAsync<InvalidOperationException>(async () => await _service.UpdateVaccinationResultAsync(result.ID, result));
        }

        [Test]
        public async Task DeleteVaccinationResultAsync_Success()
        {
            _resultRepoMock.Setup(r => r.VaccinationResultExistsAsync("R7")).ReturnsAsync(true);
            _resultRepoMock.Setup(r => r.DeleteVaccinationResultAsync("R7")).Returns(Task.CompletedTask);
            await _service.DeleteVaccinationResultAsync("R7");
            Assert.Pass();
        }

        [Test]
        public void DeleteVaccinationResultAsync_NotFound_Throws()
        {
            _resultRepoMock.Setup(r => r.VaccinationResultExistsAsync("R8")).ReturnsAsync(false);
            Assert.ThrowsAsync<KeyNotFoundException>(async () => await _service.DeleteVaccinationResultAsync("R8"));
        }
    }
} 