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
    public class VaccineTypeControllerTests
    {
        private Mock<IVaccineTypeService> _serviceMock;
        private VaccineTypeController _controller;

        [SetUp]
        public void Setup()
        {
            _serviceMock = new Mock<IVaccineTypeService>();
            _controller = new VaccineTypeController(_serviceMock.Object);
        }

        [Test]
        public async Task GetVaccineTypes_ReturnsOk()
        {
            var types = new List<VaccineType> { new VaccineType { VaccinationID = "1" } };
            _serviceMock.Setup(s => s.GetAllVaccineTypesAsync()).ReturnsAsync(types);
            var result = await _controller.GetVaccineTypes();
            Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task GetVaccineType_Found()
        {
            var type = new VaccineType { VaccinationID = "1" };
            _serviceMock.Setup(s => s.GetVaccineTypeByIdAsync("1")).ReturnsAsync(type);
            var result = await _controller.GetVaccineType("1");
            Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task GetVaccineType_NotFound()
        {
            _serviceMock.Setup(s => s.GetVaccineTypeByIdAsync("2")).ReturnsAsync((VaccineType)null!);
            var result = await _controller.GetVaccineType("2");
            Assert.That(result.Result, Is.TypeOf<NotFoundResult>());
        }

        [Test]
        public async Task CreateVaccineType_Success()
        {
            var type = new VaccineType { VaccinationID = "3", VaccineName = "TypeA" };
            _serviceMock.Setup(s => s.CreateVaccineTypeAsync(type)).ReturnsAsync(type);
            var result = await _controller.CreateVaccineType(type);
            Assert.That(result.Result, Is.TypeOf<CreatedAtActionResult>());
        }

        [Test]
        public async Task CreateVaccineType_Conflict()
        {
            var type = new VaccineType { VaccinationID = "4", VaccineName = "TypeA" };
            _serviceMock.Setup(s => s.CreateVaccineTypeAsync(type)).ThrowsAsync(new System.InvalidOperationException("conflict"));
            var result = await _controller.CreateVaccineType(type);
            Assert.That(result.Result, Is.TypeOf<ConflictObjectResult>());
        }

        [Test]
        public async Task UpdateVaccineType_Success()
        {
            var type = new VaccineType { VaccinationID = "5", VaccineName = "TypeB" };
            _serviceMock.Setup(s => s.UpdateVaccineTypeAsync(type.VaccinationID, type)).Returns(Task.CompletedTask);
            var result = await _controller.UpdateVaccineType(type.VaccinationID, type);
            Assert.That(result, Is.TypeOf<NoContentResult>());
        }

        [Test]
        public async Task UpdateVaccineType_BadRequest()
        {
            var type = new VaccineType { VaccinationID = "6", VaccineName = "TypeC" };
            var result = await _controller.UpdateVaccineType("DIFFERENT", type);
            Assert.That(result, Is.TypeOf<BadRequestResult>());
        }

        [Test]
        public async Task DeleteVaccineType_Success()
        {
            _serviceMock.Setup(s => s.DeleteVaccineTypeAsync("7")).Returns(Task.CompletedTask);
            var result = await _controller.DeleteVaccineType("7");
            Assert.That(result, Is.TypeOf<NoContentResult>());
        }
    }
} 