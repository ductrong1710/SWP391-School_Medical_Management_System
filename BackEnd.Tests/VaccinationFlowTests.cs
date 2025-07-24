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
    public class VaccinationFlowTests
    {
        private Mock<IVaccinationConsentFormRepository> _consentFormRepoMock;
        private Mock<IVaccinationPlanRepository> _planRepoMock;
        private Mock<IVaccinationResultRepository> _resultRepoMock;
        private Mock<IVaccineTypeRepository> _vaccineTypeRepoMock;
        private Mock<INotificationService> _notificationServiceMock;
        private VaccinationConsentFormService _consentFormService;
        private VaccinationPlanService _planService;
        private VaccinationResultService _resultService;

        [SetUp]
        public void Setup()
        {
            _consentFormRepoMock = new Mock<IVaccinationConsentFormRepository>();
            _planRepoMock = new Mock<IVaccinationPlanRepository>();
            _resultRepoMock = new Mock<IVaccinationResultRepository>();
            _vaccineTypeRepoMock = new Mock<IVaccineTypeRepository>();
            _notificationServiceMock = new Mock<INotificationService>();
            _consentFormService = new VaccinationConsentFormService(_consentFormRepoMock.Object, _planRepoMock.Object);
            _planService = new VaccinationPlanService(_planRepoMock.Object, null!); // null DbContext for simplicity
            _resultService = new VaccinationResultService(_resultRepoMock.Object, _consentFormRepoMock.Object, _vaccineTypeRepoMock.Object, _notificationServiceMock.Object);
        }

        [Test]
        public async Task CreateConsentForm_Success()
        {
            var plan = new VaccinationPlan { ID = "VP0001", ScheduledDate = DateTime.Today.AddDays(1) };
            var form = new VaccinationConsentForm { VaccinationPlanID = plan.ID, StudentID = "STU001", ParentID = "PAR001" };
            _planRepoMock.Setup(r => r.GetVaccinationPlanByIdAsync(plan.ID)).ReturnsAsync(plan);
            _consentFormRepoMock.Setup(r => r.GetConsentFormByPlanAndStudentAsync(plan.ID, form.StudentID)).ReturnsAsync((VaccinationConsentForm)null!);
            _consentFormRepoMock.Setup(r => r.GetAllVaccinationConsentFormsAsync()).ReturnsAsync(new List<VaccinationConsentForm>());
            _consentFormRepoMock.Setup(r => r.CreateVaccinationConsentFormAsync(It.IsAny<VaccinationConsentForm>())).Returns(Task.CompletedTask);

            var result = await _consentFormService.CreateVaccinationConsentFormAsync(form);
            NUnit.Framework.Assert.That(result, NUnit.Framework.Is.Not.Null);
            NUnit.Framework.Assert.That(result.VaccinationPlanID, NUnit.Framework.Is.EqualTo(form.VaccinationPlanID));
        }

        [Test]
        public void CreateConsentForm_Fail_PlanNotFound()
        {
            var form = new VaccinationConsentForm { VaccinationPlanID = "VP9999", StudentID = "STU001", ParentID = "PAR001" };
            _planRepoMock.Setup(r => r.GetVaccinationPlanByIdAsync(form.VaccinationPlanID)).ReturnsAsync((VaccinationPlan)null!);
            Assert.ThrowsAsync<KeyNotFoundException>(async () => await _consentFormService.CreateVaccinationConsentFormAsync(form));
        }

        [Test]
        public async Task CreateVaccinationResult_Success()
        {
            var consentForm = new VaccinationConsentForm { ID = "VCF001", ConsentStatus = "Approved", ParentID = "PAR001", StudentID = "STU001" };
            var result = new VaccinationResult { ConsentFormID = consentForm.ID, VaccineTypeID = "VAC001", ActualVaccinationDate = DateTime.Today };
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync(consentForm.ID)).ReturnsAsync(consentForm);
            _resultRepoMock.Setup(r => r.GetVaccinationResultByConsentFormIdAsync(consentForm.ID)).ReturnsAsync((VaccinationResult)null!);
            _vaccineTypeRepoMock.Setup(r => r.VaccineTypeExistsAsync(result.VaccineTypeID)).ReturnsAsync(true);
            _resultRepoMock.Setup(r => r.GetAllVaccinationResultsAsync()).ReturnsAsync(new List<VaccinationResult>());
            _resultRepoMock.Setup(r => r.CreateVaccinationResultAsync(It.IsAny<VaccinationResult>())).Returns(Task.CompletedTask);
            _notificationServiceMock.Setup(n => n.CreateNotificationAsync(It.IsAny<Notification>())).ReturnsAsync(new Notification());

            var created = await _resultService.CreateVaccinationResultAsync(result);
            NUnit.Framework.Assert.That(created, NUnit.Framework.Is.Not.Null);
            NUnit.Framework.Assert.That(created.ConsentFormID, NUnit.Framework.Is.EqualTo(result.ConsentFormID));
        }

        [Test]
        public void CreateVaccinationResult_Fail_ConsentNotApproved()
        {
            var consentForm = new VaccinationConsentForm { ID = "VCF001", ConsentStatus = "Denied", ParentID = "PAR001", StudentID = "STU001" };
            var result = new VaccinationResult { ConsentFormID = consentForm.ID, VaccineTypeID = "VAC001", ActualVaccinationDate = DateTime.Today };
            _consentFormRepoMock.Setup(r => r.GetVaccinationConsentFormByIdAsync(consentForm.ID)).ReturnsAsync(consentForm);
            _resultRepoMock.Setup(r => r.GetVaccinationResultByConsentFormIdAsync(consentForm.ID)).ReturnsAsync((VaccinationResult)null!);
            _vaccineTypeRepoMock.Setup(r => r.VaccineTypeExistsAsync(result.VaccineTypeID)).ReturnsAsync(true);
            Assert.ThrowsAsync<InvalidOperationException>(async () => await _resultService.CreateVaccinationResultAsync(result));
        }
    }
} 