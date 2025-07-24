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
    public class VaccinationResultControllerTests
    {
        private Mock<IVaccinationResultService> _serviceMock;
        private VaccinationResultController _controller;

        [SetUp]
        public void Setup()
        {
            _serviceMock = new Mock<IVaccinationResultService>();
            _controller = new VaccinationResultController(_serviceMock.Object);
        }

        [Test]
        public async Task GetVaccinationResults_ReturnsOk()
        {
            var results = new List<VaccinationResult> { new VaccinationResult { ID = "1" } };
            _serviceMock.Setup(s => s.GetAllVaccinationResultsAsync()).ReturnsAsync(results);
            var result = await _controller.GetVaccinationResults();
            Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task GetVaccinationResult_Found()
        {
            var res = new VaccinationResult { ID = "1" };
            _serviceMock.Setup(s => s.GetVaccinationResultByIdAsync("1")).ReturnsAsync(res);
            var result = await _controller.GetVaccinationResult("1");
            Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task GetVaccinationResult_NotFound()
        {
            _serviceMock.Setup(s => s.GetVaccinationResultByIdAsync("2")).ReturnsAsync((VaccinationResult)null!);
            var result = await _controller.GetVaccinationResult("2");
            Assert.That(result.Result, Is.TypeOf<NotFoundResult>());
        }

        [Test]
        public async Task CreateVaccinationResult_Success()
        {
            var res = new VaccinationResult { ID = "3" };
            _serviceMock.Setup(s => s.CreateVaccinationResultAsync(res)).ReturnsAsync(res);
            var result = await _controller.CreateVaccinationResult(res);
            Assert.That(result.Result, Is.TypeOf<CreatedAtActionResult>());
        }

        [Test]
        public async Task CreateVaccinationResult_KeyNotFoundException()
        {
            var res = new VaccinationResult { ID = "4" };
            _serviceMock.Setup(s => s.CreateVaccinationResultAsync(res)).ThrowsAsync(new KeyNotFoundException("not found"));
            var result = await _controller.CreateVaccinationResult(res);
            Assert.That(result.Result, Is.TypeOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task CreateVaccinationResult_InvalidOperationException()
        {
            var res = new VaccinationResult { ID = "5" };
            _serviceMock.Setup(s => s.CreateVaccinationResultAsync(res)).ThrowsAsync(new System.InvalidOperationException("bad request"));
            var result = await _controller.CreateVaccinationResult(res);
            Assert.That(result.Result, Is.TypeOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task UpdateVaccinationResult_Success()
        {
            var res = new VaccinationResult { ID = "6" };
            _serviceMock.Setup(s => s.UpdateVaccinationResultAsync(res.ID, res)).Returns(Task.CompletedTask);
            var result = await _controller.UpdateVaccinationResult(res.ID, res);
            Assert.That(result, Is.TypeOf<NoContentResult>());
        }

        [Test]
        public async Task UpdateVaccinationResult_BadRequest()
        {
            var res = new VaccinationResult { ID = "7" };
            var result = await _controller.UpdateVaccinationResult("DIFFERENT", res);
            Assert.That(result, Is.TypeOf<BadRequestResult>());
        }

        [Test]
        public async Task DeleteVaccinationResult_Success()
        {
            _serviceMock.Setup(s => s.DeleteVaccinationResultAsync("8")).Returns(Task.CompletedTask);
            var result = await _controller.DeleteVaccinationResult("8");
            Assert.That(result, Is.TypeOf<NoContentResult>());
        }
    }
} 