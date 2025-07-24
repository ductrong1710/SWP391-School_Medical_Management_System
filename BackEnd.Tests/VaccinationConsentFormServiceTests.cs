using NUnit.Framework;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Businessobjects.Models;
using Services.Implements;
using Repositories.Interfaces;

namespace BackEnd.Tests
{
    [TestFixture]
    public class VaccinationConsentFormServiceTests
    {
        private Mock<IVaccinationConsentFormRepository> _consentFormRepoMock;
        private Mock<IVaccinationPlanRepository> _planRepoMock;
        private VaccinationConsentFormService _service;

        [SetUp]
        public void Setup()
        {
            _consentFormRepoMock = new Mock<IVaccinationConsentFormRepository>();
            _planRepoMock = new Mock<IVaccinationPlanRepository>();
            _service = new VaccinationConsentFormService(_consentFormRepoMock.Object, _planRepoMock.Object);
        }

        [Test]
        public async Task GetAllVaccinationConsentFormsAsync_ReturnsList()
        {
            var forms = new List<VaccinationConsentForm> { new VaccinationConsentForm { ID = "1" } };
            _consentFormRepoMock.Setup(r => r.GetAllVaccinationConsentFormsAsync()).ReturnsAsync(forms);
            var result = await _service.GetAllVaccinationConsentFormsAsync();
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.EquivalentTo(forms));
        }

        [Test]
        public async Task GetVaccinationConsentFormByIdAsync_Found()
        {
            var form = new VaccinationConsentForm { ID = "1" };
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync("1")).ReturnsAsync(form);
            var result = await _service.GetVaccinationConsentFormByIdAsync("1");
            Assert.That(result, Is.EqualTo(form));
        }

        [Test]
        public async Task GetVaccinationConsentFormByIdAsync_NotFound()
        {
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync("2")).ReturnsAsync((VaccinationConsentForm)null!);
            var result = await _service.GetVaccinationConsentFormByIdAsync("2");
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task GetConsentFormsByPlanIdAsync_ReturnsList()
        {
            var forms = new List<VaccinationConsentForm> { new VaccinationConsentForm { ID = "1" } };
            _consentFormRepoMock.Setup(r => r.GetConsentFormsByPlanIdAsync("plan1")).ReturnsAsync(forms);
            var result = await _service.GetConsentFormsByPlanIdAsync("plan1");
            Assert.That(result, Is.EquivalentTo(forms));
        }

        [Test]
        public async Task GetConsentFormsByStudentIdAsync_ReturnsList()
        {
            var forms = new List<VaccinationConsentForm> { new VaccinationConsentForm { ID = "1" } };
            _consentFormRepoMock.Setup(r => r.GetConsentFormsByStudentIdAsync("student1")).ReturnsAsync(forms);
            var result = await _service.GetConsentFormsByStudentIdAsync("student1");
            Assert.That(result, Is.EquivalentTo(forms));
        }

        [Test]
        public async Task GetConsentFormByPlanAndStudentAsync_ReturnsForm()
        {
            var form = new VaccinationConsentForm { ID = "1" };
            _consentFormRepoMock.Setup(r => r.GetConsentFormByPlanAndStudentAsync("plan1", "student1")).ReturnsAsync(form);
            var result = await _service.GetConsentFormByPlanAndStudentAsync("plan1", "student1");
            Assert.That(result, Is.EqualTo(form));
        }

        [Test]
        public async Task CreateVaccinationConsentFormAsync_Success()
        {
            var plan = new VaccinationPlan { ID = "P1", ScheduledDate = DateTime.Today.AddDays(1) };
            var form = new VaccinationConsentForm { VaccinationPlanID = plan.ID, StudentID = "S1", ParentID = "PARENT1" };
            _planRepoMock.Setup(r => r.GetVaccinationPlanByIdAsync(plan.ID)).ReturnsAsync(plan);
            _consentFormRepoMock.Setup(r => r.GetConsentFormByPlanAndStudentAsync(plan.ID, form.StudentID)).ReturnsAsync((VaccinationConsentForm)null!);
            _consentFormRepoMock.Setup(r => r.GetAllVaccinationConsentFormsAsync()).ReturnsAsync(new List<VaccinationConsentForm>());
            _consentFormRepoMock.Setup(r => r.CreateVaccinationConsentFormAsync(It.IsAny<VaccinationConsentForm>())).Returns(Task.CompletedTask);
            var result = await _service.CreateVaccinationConsentFormAsync(form);
            Assert.That(result, Is.Not.Null);
            Assert.That(result.VaccinationPlanID, Is.EqualTo(form.VaccinationPlanID));
        }

        [Test]
        public async Task CreateVaccinationConsentFormAsync_AutoIdGeneration_CoversLoop()
        {
            var plan = new VaccinationPlan { ID = "P1", ScheduledDate = DateTime.Today.AddDays(1) };
            var form = new VaccinationConsentForm { VaccinationPlanID = plan.ID, StudentID = "S1", ParentID = "PARENT1", ID = "" };
            var allForms = new List<VaccinationConsentForm>
            {
                new VaccinationConsentForm { ID = "VCF001" },
                new VaccinationConsentForm { ID = "VCF002" },
                new VaccinationConsentForm { ID = "VCF010" }
            };
            _planRepoMock.Setup(r => r.GetVaccinationPlanByIdAsync(plan.ID)).ReturnsAsync(plan);
            _consentFormRepoMock.Setup(r => r.GetConsentFormByPlanAndStudentAsync(plan.ID, form.StudentID)).ReturnsAsync((VaccinationConsentForm)null!);
            _consentFormRepoMock.Setup(r => r.GetAllVaccinationConsentFormsAsync()).ReturnsAsync(allForms);
            _consentFormRepoMock.Setup(r => r.CreateVaccinationConsentFormAsync(It.IsAny<VaccinationConsentForm>())).Returns(Task.CompletedTask);
            var result = await _service.CreateVaccinationConsentFormAsync(form);
            Assert.That(result.ID, Is.EqualTo("VCF011"));
        }

        [Test]
        public void CreateVaccinationConsentFormAsync_PlanNotFound_Throws()
        {
            var form = new VaccinationConsentForm { VaccinationPlanID = "P2", StudentID = "S1", ParentID = "PARENT1" };
            _planRepoMock.Setup(r => r.GetVaccinationPlanByIdAsync(form.VaccinationPlanID)).ReturnsAsync((VaccinationPlan)null!);
            Assert.ThrowsAsync<KeyNotFoundException>(async () => await _service.CreateVaccinationConsentFormAsync(form));
        }

        [Test]
        public void CreateVaccinationConsentFormAsync_PastPlan_Throws()
        {
            var plan = new VaccinationPlan { ID = "P3", ScheduledDate = DateTime.Today.AddDays(-1) };
            var form = new VaccinationConsentForm { VaccinationPlanID = plan.ID, StudentID = "S1", ParentID = "PARENT1" };
            _planRepoMock.Setup(r => r.GetVaccinationPlanByIdAsync(plan.ID)).ReturnsAsync(plan);
            Assert.ThrowsAsync<InvalidOperationException>(async () => await _service.CreateVaccinationConsentFormAsync(form));
        }

        [Test]
        public void CreateVaccinationConsentFormAsync_AlreadyExists_Throws()
        {
            var plan = new VaccinationPlan { ID = "P4", ScheduledDate = DateTime.Today.AddDays(1) };
            var form = new VaccinationConsentForm { VaccinationPlanID = plan.ID, StudentID = "S1", ParentID = "PARENT1" };
            _planRepoMock.Setup(r => r.GetVaccinationPlanByIdAsync(plan.ID)).ReturnsAsync(plan);
            _consentFormRepoMock.Setup(r => r.GetConsentFormByPlanAndStudentAsync(plan.ID, form.StudentID)).ReturnsAsync(new VaccinationConsentForm());
            Assert.ThrowsAsync<InvalidOperationException>(async () => await _service.CreateVaccinationConsentFormAsync(form));
        }

        [Test]
        public async Task UpdateVaccinationConsentFormAsync_Success()
        {
            var plan = new VaccinationPlan { ID = "P5", ScheduledDate = DateTime.Today.AddDays(1) };
            var form = new VaccinationConsentForm { ID = "F1", VaccinationPlanID = plan.ID, StudentID = "S1", ParentID = "PARENT1" };
            _consentFormRepoMock.Setup(r => r.VaccinationConsentFormExistsAsync(form.ID)).ReturnsAsync(true);
            _planRepoMock.Setup(r => r.GetVaccinationPlanByIdAsync(plan.ID)).ReturnsAsync(plan);
            _consentFormRepoMock.Setup(r => r.UpdateVaccinationConsentFormAsync(form)).Returns(Task.CompletedTask);
            await _service.UpdateVaccinationConsentFormAsync(form.ID, form);
            Assert.Pass();
        }

        [Test]
        public void UpdateVaccinationConsentFormAsync_IdMismatch_Throws()
        {
            var form = new VaccinationConsentForm { ID = "F2", VaccinationPlanID = "P6", StudentID = "S1", ParentID = "PARENT1" };
            Assert.ThrowsAsync<ArgumentException>(async () => await _service.UpdateVaccinationConsentFormAsync("DIFFERENT", form));
        }

        [Test]
        public void UpdateVaccinationConsentFormAsync_NotFound_Throws()
        {
            var form = new VaccinationConsentForm { ID = "F3", VaccinationPlanID = "P7", StudentID = "S1", ParentID = "PARENT1" };
            _consentFormRepoMock.Setup(r => r.VaccinationConsentFormExistsAsync(form.ID)).ReturnsAsync(false);
            Assert.ThrowsAsync<KeyNotFoundException>(async () => await _service.UpdateVaccinationConsentFormAsync(form.ID, form));
        }

        [Test]
        public void UpdateVaccinationConsentFormAsync_PlanNotFound_Throws()
        {
            var form = new VaccinationConsentForm { ID = "F4", VaccinationPlanID = "P8", StudentID = "S1", ParentID = "PARENT1" };
            _consentFormRepoMock.Setup(r => r.VaccinationConsentFormExistsAsync(form.ID)).ReturnsAsync(true);
            _planRepoMock.Setup(r => r.GetVaccinationPlanByIdAsync(form.VaccinationPlanID)).ReturnsAsync((VaccinationPlan)null!);
            Assert.ThrowsAsync<KeyNotFoundException>(async () => await _service.UpdateVaccinationConsentFormAsync(form.ID, form));
        }

        [Test]
        public void UpdateVaccinationConsentFormAsync_PastPlan_Throws()
        {
            var plan = new VaccinationPlan { ID = "P9", ScheduledDate = DateTime.Today.AddDays(-1) };
            var form = new VaccinationConsentForm { ID = "F5", VaccinationPlanID = plan.ID, StudentID = "S1", ParentID = "PARENT1" };
            _consentFormRepoMock.Setup(r => r.VaccinationConsentFormExistsAsync(form.ID)).ReturnsAsync(true);
            _planRepoMock.Setup(r => r.GetVaccinationPlanByIdAsync(plan.ID)).ReturnsAsync(plan);
            Assert.ThrowsAsync<InvalidOperationException>(async () => await _service.UpdateVaccinationConsentFormAsync(form.ID, form));
        }

        [Test]
        public async Task DeleteVaccinationConsentFormAsync_Success()
        {
            var form = new VaccinationConsentForm { ID = "F6", VaccinationPlanID = "P10", StudentID = "S1", ParentID = "PARENT1" };
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync(form.ID)).ReturnsAsync(form);
            _consentFormRepoMock.Setup(r => r.DeleteVaccinationConsentFormAsync(form.ID)).Returns(Task.CompletedTask);
            await _service.DeleteVaccinationConsentFormAsync(form.ID);
            Assert.Pass();
        }

        [Test]
        public void DeleteVaccinationConsentFormAsync_NotFound_Throws()
        {
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync("F7")).ReturnsAsync((VaccinationConsentForm)null!);
            Assert.ThrowsAsync<KeyNotFoundException>(async () => await _service.DeleteVaccinationConsentFormAsync("F7"));
        }

        [Test]
        public void DeleteVaccinationConsentFormAsync_HasResult_Throws()
        {
            var form = new VaccinationConsentForm { ID = "F8", VaccinationPlanID = "P11", StudentID = "S1", ParentID = "PARENT1", VaccinationResult = new VaccinationResult() };
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync(form.ID)).ReturnsAsync(form);
            Assert.ThrowsAsync<InvalidOperationException>(async () => await _service.DeleteVaccinationConsentFormAsync(form.ID));
        }
    }
} 