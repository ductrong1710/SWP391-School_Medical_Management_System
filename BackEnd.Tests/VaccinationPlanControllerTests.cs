using NUnit.Framework;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Businessobjects.Models;
using BackEnd.Controllers;
using Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Tests
{
    [TestFixture]
    public class VaccinationPlanControllerTests
    {
        private Mock<IVaccinationPlanService> _planServiceMock;
        private Mock<IVaccinationConsentFormService> _consentFormServiceMock;
        private Mock<INotificationService> _notificationServiceMock;
        private VaccinationPlanController _controller;

        [SetUp]
        public void Setup()
        {
            _planServiceMock = new Mock<IVaccinationPlanService>();
            _consentFormServiceMock = new Mock<IVaccinationConsentFormService>();
            _notificationServiceMock = new Mock<INotificationService>();
            _controller = new VaccinationPlanController(_planServiceMock.Object, _consentFormServiceMock.Object, _notificationServiceMock.Object);
        }

        [Test]
        public async Task GetVaccinationPlans_ReturnsOk()
        {
            var plans = new List<VaccinationPlan> { new VaccinationPlan { ID = "1" } };
            _planServiceMock.Setup(s => s.GetAllVaccinationPlansAsync()).ReturnsAsync(plans);
            var result = await _controller.GetVaccinationPlans();
            Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task GetVaccinationPlan_Found()
        {
            var plan = new VaccinationPlan { ID = "1" };
            _planServiceMock.Setup(s => s.GetVaccinationPlanByIdAsync("1")).ReturnsAsync(plan);
            var result = await _controller.GetVaccinationPlan("1");
            Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task GetVaccinationPlan_NotFound()
        {
            _planServiceMock.Setup(s => s.GetVaccinationPlanByIdAsync("2")).ReturnsAsync((VaccinationPlan)null!);
            var result = await _controller.GetVaccinationPlan("2");
            Assert.That(result.Result, Is.TypeOf<NotFoundResult>());
        }

        [Test]
        public async Task CreateVaccinationPlan_Success()
        {
            var plan = new VaccinationPlan { ID = "3" };
            _planServiceMock.Setup(s => s.CreateVaccinationPlanAsync(plan)).ReturnsAsync(plan);
            _consentFormServiceMock.Setup(s => s.GetConsentFormsByPlanIdAsync(plan.ID)).ReturnsAsync(new List<VaccinationConsentForm>());
            var result = await _controller.CreateVaccinationPlan(plan);
            Assert.That(result.Result, Is.TypeOf<CreatedAtActionResult>());
        }

        [Test]
        public async Task CreateVaccinationPlan_InvalidOperationException()
        {
            var plan = new VaccinationPlan { ID = "4" };
            _planServiceMock.Setup(s => s.CreateVaccinationPlanAsync(plan)).ThrowsAsync(new System.InvalidOperationException("bad request"));
            var result = await _controller.CreateVaccinationPlan(plan);
            Assert.That(result.Result, Is.TypeOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task UpdateVaccinationPlan_Success()
        {
            var plan = new VaccinationPlan { ID = "5" };
            _planServiceMock.Setup(s => s.UpdateVaccinationPlanAsync(plan.ID, plan)).Returns(Task.CompletedTask);
            var result = await _controller.UpdateVaccinationPlan(plan.ID, plan);
            Assert.That(result, Is.TypeOf<NoContentResult>());
        }

        [Test]
        public async Task UpdateVaccinationPlan_BadRequest()
        {
            var plan = new VaccinationPlan { ID = "6" };
            var result = await _controller.UpdateVaccinationPlan("DIFFERENT", plan);
            Assert.That(result, Is.TypeOf<BadRequestResult>());
        }

        [Test]
        public async Task DeleteVaccinationPlan_Success()
        {
            _planServiceMock.Setup(s => s.DeleteVaccinationPlanAsync("7")).Returns(Task.CompletedTask);
            var result = await _controller.DeleteVaccinationPlan("7");
            Assert.That(result, Is.TypeOf<NoContentResult>());
        }

        [Test]
        public async Task GetVaccinationPlansByCreator_ReturnsOk()
        {
            var plans = new List<VaccinationPlan> { new VaccinationPlan { ID = "1" } };
            _planServiceMock.Setup(s => s.GetVaccinationPlansByCreatorIdAsync("creator1")).ReturnsAsync(plans);
            var result = await _controller.GetVaccinationPlansByCreator("creator1");
            Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        }

        [Test]
        public async Task GetUpcomingVaccinationPlans_ReturnsOk()
        {
            var plans = new List<VaccinationPlan> { new VaccinationPlan { ID = "1" } };
            _planServiceMock.Setup(s => s.GetUpcomingVaccinationPlansAsync()).ReturnsAsync(plans);
            var result = await _controller.GetUpcomingVaccinationPlans();
            Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        }

        // [Test]
        // public async Task SendNotifications_Success()
        // {
        //     // Bỏ test này vì không thể mock property DbSet trên ApplicationDbContext với Moq
        // }

        // Helper method to mock DbSet<T>
        private static Microsoft.EntityFrameworkCore.DbSet<T> MockDbSet<T>(IEnumerable<T> data) where T : class
        {
            var queryable = data.AsQueryable();
            var dbSet = new Mock<Microsoft.EntityFrameworkCore.DbSet<T>>();
            dbSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
            dbSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
            dbSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
            dbSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());
            return dbSet.Object;
        }
    }
} 