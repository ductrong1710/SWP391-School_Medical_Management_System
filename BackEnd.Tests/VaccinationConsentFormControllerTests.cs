using NUnit.Framework;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Businessobjects.Models;
using BackEnd.Controllers;
using Services.Interfaces;

namespace BackEnd.Tests
{
    [TestFixture]
    public class VaccinationConsentFormControllerTests
    {
        private Mock<IVaccinationConsentFormService> _serviceMock;
        private VaccinationConsentFormController _controller;

        [SetUp]
        public void Setup()
        {
            _serviceMock = new Mock<IVaccinationConsentFormService>();
            _controller = new VaccinationConsentFormController(_serviceMock.Object);
        }

        [Test]
        public async Task GetConsentForms_ReturnsOk()
        {
            var forms = new List<VaccinationConsentForm> { new VaccinationConsentForm { ID = "1" } };
            _serviceMock.Setup(s => s.GetAllVaccinationConsentFormsAsync()).ReturnsAsync(forms);
            var result = await _controller.GetConsentForms();
            Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task GetVaccinationConsentForm_Found()
        {
            var form = new VaccinationConsentForm { ID = "1" };
            _serviceMock.Setup(s => s.GetVaccinationConsentFormByIdAsync("1")).ReturnsAsync(form);
            var result = await _controller.GetVaccinationConsentForm("1");
            Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task GetVaccinationConsentForm_NotFound()
        {
            _serviceMock.Setup(s => s.GetVaccinationConsentFormByIdAsync("2")).ReturnsAsync((VaccinationConsentForm)null!);
            var result = await _controller.GetVaccinationConsentForm("2");
            Assert.That(result.Result, Is.TypeOf<NotFoundResult>());
        }

        [Test]
        public async Task CreateConsentForm_Success()
        {
            var form = new VaccinationConsentForm { ID = "3" };
            _serviceMock.Setup(s => s.CreateVaccinationConsentFormAsync(form)).ReturnsAsync(form);
            var result = await _controller.CreateConsentForm(form);
            Assert.That(result.Result, Is.TypeOf<CreatedAtActionResult>());
        }

        [Test]
        public async Task CreateConsentForm_KeyNotFoundException()
        {
            var form = new VaccinationConsentForm { ID = "4" };
            _serviceMock.Setup(s => s.CreateVaccinationConsentFormAsync(form)).ThrowsAsync(new KeyNotFoundException("not found"));
            var result = await _controller.CreateConsentForm(form);
            Assert.That(result.Result, Is.TypeOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task CreateConsentForm_InvalidOperationException()
        {
            var form = new VaccinationConsentForm { ID = "5" };
            _serviceMock.Setup(s => s.CreateVaccinationConsentFormAsync(form)).ThrowsAsync(new System.InvalidOperationException("bad request"));
            var result = await _controller.CreateConsentForm(form);
            Assert.That(result.Result, Is.TypeOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task UpdateConsentForm_Success()
        {
            var form = new VaccinationConsentForm { ID = "6" };
            _serviceMock.Setup(s => s.UpdateVaccinationConsentFormAsync(form.ID, form)).Returns(Task.CompletedTask);
            var result = await _controller.UpdateConsentForm(form.ID, form);
            Assert.That(result, Is.TypeOf<NoContentResult>());
        }

        [Test]
        public async Task UpdateConsentForm_BadRequest()
        {
            var form = new VaccinationConsentForm { ID = "7" };
            var result = await _controller.UpdateConsentForm("DIFFERENT", form);
            Assert.That(result, Is.TypeOf<BadRequestResult>());
        }

        [Test]
        public async Task DeleteConsentForm_Success()
        {
            _serviceMock.Setup(s => s.DeleteVaccinationConsentFormAsync("8")).Returns(Task.CompletedTask);
            var result = await _controller.DeleteConsentForm("8");
            Assert.That(result, Is.TypeOf<NoContentResult>());
        }
    }
} 