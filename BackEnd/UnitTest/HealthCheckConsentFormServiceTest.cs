using Businessobjects.Models;
using Moq;
using Repositories.Interfaces;
using Services.Implements;

namespace UnitTest.HelcheckServiceTest
{
    [TestFixture]
    public class HealthCheckConsentFormServiceTest
    {
        private Mock<IHealthCheckConsentFormRepository> _mockConsentFormRepository;
        private HealthCheckConsentFormService _service;

        [SetUp]
        public void Setup()
        {
            _mockConsentFormRepository = new Mock<IHealthCheckConsentFormRepository>();
            _service = new HealthCheckConsentFormService(_mockConsentFormRepository.Object);
        }

        [Test]
        public async Task GetAllConsentFormsAsync_WhenConsentFormsExist_ReturnsList()
        {
            // Arrange
            var mockData = new List<HealthCheckConsentForm>
            {
                new HealthCheckConsentForm { ID = "CF001"},
                new HealthCheckConsentForm { ID = "CF002"}
            };

            var mockRepo = new Mock<IHealthCheckConsentFormRepository>();
            mockRepo.Setup(repo => repo.GetAllConsentFormsAsync()).ReturnsAsync(mockData);

            var service = new HealthCheckConsentFormService(mockRepo.Object);

            // Act
            var result = await service.GetAllConsentFormsAsync();

            // Assert
            Assert.That(result.Count(), Is.EqualTo(2));
            Assert.That(result.First().ID, Is.EqualTo("CF001"));
        }

        [Test]
        public async Task GetAllConsentFormsAsync_WhenNoConsentForms_ReturnsEmptyList()
        {
            // Arrange
            var mockRepo = new Mock<IHealthCheckConsentFormRepository>();
            mockRepo.Setup(repo => repo.GetAllConsentFormsAsync()).ReturnsAsync(new List<HealthCheckConsentForm>());

            var service = new HealthCheckConsentFormService(mockRepo.Object);

            // Act
            var result = await service.GetAllConsentFormsAsync();

            // Assert
            Assert.That(result, Is.Empty);
        }

        [Test]
        public void GetAllConsentFormsAsync_WhenRepositoryThrowsException_ThrowsException()
        {
            // Arrange
            var mockRepo = new Mock<IHealthCheckConsentFormRepository>();
            mockRepo.Setup(repo => repo.GetAllConsentFormsAsync())
                    .ThrowsAsync(new InvalidOperationException("Database failed"));

            var service = new HealthCheckConsentFormService(mockRepo.Object);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await service.GetAllConsentFormsAsync());

            Assert.That(ex!.Message, Is.EqualTo("Database failed"));
        }

        [Test]
        public async Task GetConsentFormByIdAsync_WhenExists_ReturnsConsentForm()
        {
            // Arrange
            var id = "form123";
            var expectedForm = new HealthCheckConsentForm { ID = id };
            _mockConsentFormRepository
                .Setup(r => r.GetConsentFormByIdAsync(id))
                .ReturnsAsync(expectedForm);

            // Act
            var result = await _service.GetConsentFormByIdAsync(id);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(id, result.ID);
        }

        [Test]
        public async Task GetConsentFormByIdAsync_WhenNotFound_ReturnsNull()
        {
            // Arrange
            var id = "not-found-id";
            _mockConsentFormRepository
                .Setup(r => r.GetConsentFormByIdAsync(id))
                .ReturnsAsync((HealthCheckConsentForm?)null);

            // Act
            var result = await _service.GetConsentFormByIdAsync(id);

            // Assert
            Assert.IsNull(result);
        }

        [Test]
        public async Task GetConsentFormByIdAsync_CallsRepositoryOnce()
        {
            // Arrange
            var id = "id";
            _mockConsentFormRepository
                .Setup(r => r.GetConsentFormByIdAsync(id))
                .ReturnsAsync(new HealthCheckConsentForm());

            // Act
            await _service.GetConsentFormByIdAsync(id);

            // Assert
            _mockConsentFormRepository.Verify(r => r.GetConsentFormByIdAsync(id), Times.Once);
        }

        [Test]
        public async Task GetConsentFormsByPlanIdAsync_WhenExists_ReturnsForms()
        {
            // Arrange
            var planId = "plan123";
            var expectedForms = new List<HealthCheckConsentForm>
            {
                new HealthCheckConsentForm { ID = "form1", HealthCheckPlanID = planId },
                new HealthCheckConsentForm { ID = "form2", HealthCheckPlanID = planId }
            };

            _mockConsentFormRepository
                .Setup(repo => repo.GetConsentFormsByPlanIdAsync(planId))
                .ReturnsAsync(expectedForms);

            // Act
            var result = await _service.GetConsentFormsByPlanIdAsync(planId);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(2, result.Count());
            Assert.IsTrue(result.All(f => f.HealthCheckPlanID == planId));
        }

        [Test]
        public async Task GetConsentFormsByPlanIdAsync_WhenNoneFound_ReturnsEmptyList()
        {
            // Arrange
            var planId = "nonexistent-plan";
            _mockConsentFormRepository
                .Setup(repo => repo.GetConsentFormsByPlanIdAsync(planId))
                .ReturnsAsync(new List<HealthCheckConsentForm>());

            // Act
            var result = await _service.GetConsentFormsByPlanIdAsync(planId);

            // Assert
            Assert.IsNotNull(result);
            Assert.IsEmpty(result);
        }

        [Test]
        public async Task GetConsentFormsByPlanIdAsync_CallsRepositoryOnce()
        {
            // Arrange
            var planId = "check-call";
            _mockConsentFormRepository
                .Setup(repo => repo.GetConsentFormsByPlanIdAsync(planId))
                .ReturnsAsync(new List<HealthCheckConsentForm>());

            // Act
            await _service.GetConsentFormsByPlanIdAsync(planId);

            // Assert
            _mockConsentFormRepository.Verify(repo => repo.GetConsentFormsByPlanIdAsync(planId), Times.Once);
        }

        [Test]
        public async Task GetConsentFormsByStudentIdAsync_WhenFormsExist_ReturnsList()
        {
            // Arrange
            var studentId = "student001";
            var expectedForms = new List<HealthCheckConsentForm>
            {
                new HealthCheckConsentForm { ID = "formA", StudentID = studentId },
                new HealthCheckConsentForm { ID = "formB", StudentID = studentId }
            };

            _mockConsentFormRepository
                .Setup(repo => repo.GetConsentFormsByStudentIdAsync(studentId))
                .ReturnsAsync(expectedForms);

            // Act
            var result = await _service.GetConsentFormsByStudentIdAsync(studentId);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(2, result.Count());
            Assert.IsTrue(result.All(f => f.StudentID == studentId));
        }

        [Test]
        public async Task GetConsentFormsByStudentIdAsync_WhenNoneExist_ReturnsEmptyList()
        {
            // Arrange
            var studentId = "no-forms";
            _mockConsentFormRepository
                .Setup(repo => repo.GetConsentFormsByStudentIdAsync(studentId))
                .ReturnsAsync(new List<HealthCheckConsentForm>());

            // Act
            var result = await _service.GetConsentFormsByStudentIdAsync(studentId);

            // Assert
            Assert.IsNotNull(result);
            Assert.IsEmpty(result);
        }

        [Test]
        public async Task GetConsentFormsByStudentIdAsync_CallsRepositoryOnce()
        {
            // Arrange
            var studentId = "verify-call";
            _mockConsentFormRepository
                .Setup(repo => repo.GetConsentFormsByStudentIdAsync(studentId))
                .ReturnsAsync(new List<HealthCheckConsentForm>());

            // Act
            await _service.GetConsentFormsByStudentIdAsync(studentId);

            // Assert
            _mockConsentFormRepository.Verify(repo => repo.GetConsentFormsByStudentIdAsync(studentId), Times.Once);
        }

        [Test]
        public async Task GetConsentFormByPlanAndStudentAsync_WhenFound_ReturnsConsentForm()
        {
            // Arrange
            var planId = "plan001";
            var studentId = "student001";
            var expectedForm = new HealthCheckConsentForm { ID = "form123", HealthCheckPlanID = planId, StudentID = studentId };

            _mockConsentFormRepository
                .Setup(repo => repo.GetConsentFormByPlanAndStudentAsync(planId, studentId))
                .ReturnsAsync(expectedForm);

            // Act
            var result = await _service.GetConsentFormByPlanAndStudentAsync(planId, studentId);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(expectedForm.ID, result!.ID);
            Assert.AreEqual(planId, result.HealthCheckPlanID);
            Assert.AreEqual(studentId, result.StudentID);
        }

        [Test]
        public async Task GetConsentFormByPlanAndStudentAsync_WhenNotFound_ReturnsNull()
        {
            // Arrange
            var planId = "plan999";
            var studentId = "student999";

            _mockConsentFormRepository
                .Setup(repo => repo.GetConsentFormByPlanAndStudentAsync(planId, studentId))
                .ReturnsAsync((HealthCheckConsentForm?)null);

            // Act
            var result = await _service.GetConsentFormByPlanAndStudentAsync(planId, studentId);

            // Assert
            Assert.IsNull(result);
        }

        [Test]
        public async Task GetConsentFormByPlanAndStudentAsync_CallsRepositoryOnceWithCorrectParams()
        {
            // Arrange
            var planId = "planABC";
            var studentId = "studentXYZ";

            _mockConsentFormRepository
                .Setup(repo => repo.GetConsentFormByPlanAndStudentAsync(planId, studentId))
                .ReturnsAsync((HealthCheckConsentForm?)null);

            // Act
            await _service.GetConsentFormByPlanAndStudentAsync(planId, studentId);

            // Assert
            _mockConsentFormRepository.Verify(
                repo => repo.GetConsentFormByPlanAndStudentAsync(planId, studentId),
                Times.Once);
        }

        [Test]
        public void CreateConsentFormAsync_WhenFormAlreadyExists_ThrowsInvalidOperationException()
        {
            // Arrange
            var inputForm = new HealthCheckConsentForm { HealthCheckPlanID = "plan1", StudentID = "student1" };
            var existingForm = new HealthCheckConsentForm { ID = "HC0001" };

            _mockConsentFormRepository
                .Setup(repo => repo.GetConsentFormByPlanAndStudentAsync("plan1", "student1"))
                .ReturnsAsync(existingForm);

            // Act & Assert
            Assert.ThrowsAsync<InvalidOperationException>(async () =>
            {
                await _service.CreateConsentFormAsync(inputForm);
            });
        }

        [Test]
        public async Task CreateConsentFormAsync_AssignsNextIncrementedID()
        {
            // Arrange
            var inputForm = new HealthCheckConsentForm { HealthCheckPlanID = "plan1", StudentID = "student2" };

            _mockConsentFormRepository.Setup(repo => repo.GetConsentFormByPlanAndStudentAsync("plan1", "student2"))
                     .ReturnsAsync((HealthCheckConsentForm?)null);

            var allForms = new List<HealthCheckConsentForm>
            {
                new HealthCheckConsentForm { ID = "HC0001" },
                new HealthCheckConsentForm { ID = "HC0007" },
                new HealthCheckConsentForm { ID = "HC0003" }
            };

            _mockConsentFormRepository.Setup(repo => repo.GetAllConsentFormsAsync())
                     .ReturnsAsync(allForms);

            _mockConsentFormRepository.Setup(repo => repo.CreateConsentFormAsync(It.IsAny<HealthCheckConsentForm>()))
                     .Returns(Task.CompletedTask);

            // Act
            var result = await _service.CreateConsentFormAsync(inputForm);

            // Assert
            Assert.AreEqual("HC0008", result.ID);
        }

        [Test]
        public async Task CreateConsentFormAsync_WhenStatusIdNull_SetsDefaultToWaiting()
        {
            // Arrange
            var inputForm = new HealthCheckConsentForm { HealthCheckPlanID = "plan2", StudentID = "studentX", StatusID = null };

            _mockConsentFormRepository.Setup(r => r.GetConsentFormByPlanAndStudentAsync("plan2", "studentX"))
                     .ReturnsAsync((HealthCheckConsentForm?)null);

            _mockConsentFormRepository.Setup(r => r.GetAllConsentFormsAsync())
                     .ReturnsAsync(new List<HealthCheckConsentForm>());

            _mockConsentFormRepository.Setup(r => r.CreateConsentFormAsync(It.IsAny<HealthCheckConsentForm>()))
                     .Returns(Task.CompletedTask);

            // Act
            var result = await _service.CreateConsentFormAsync(inputForm);

            // Assert
            Assert.AreEqual(3, result.StatusID);
            Assert.AreEqual("HC0001", result.ID); // Vì danh sách rỗng
        }

        [Test]
        public async Task CreateConsentFormAsync_CallsRepositoryCreateOnce()
        {
            // Arrange
            var inputForm = new HealthCheckConsentForm { HealthCheckPlanID = "plan3", StudentID = "student3" };

            _mockConsentFormRepository.Setup(r => r.GetConsentFormByPlanAndStudentAsync("plan3", "student3"))
                     .ReturnsAsync((HealthCheckConsentForm?)null);

            _mockConsentFormRepository.Setup(r => r.GetAllConsentFormsAsync())
                     .ReturnsAsync(new List<HealthCheckConsentForm>());

            _mockConsentFormRepository.Setup(r => r.CreateConsentFormAsync(It.IsAny<HealthCheckConsentForm>()))
                     .Returns(Task.CompletedTask);

            // Act
            await _service.CreateConsentFormAsync(inputForm);

            // Assert
            _mockConsentFormRepository.Verify(r => r.CreateConsentFormAsync(It.IsAny<HealthCheckConsentForm>()), Times.Once);
        }

        [Test]
        public void UpdateConsentFormAsync_WhenIdMismatch_ThrowsArgumentException()
        {
            // Arrange
            var inputForm = new HealthCheckConsentForm { ID = "HC2" };

            // Act & Assert
            Assert.ThrowsAsync<ArgumentException>(async () =>
            {
                await _service.UpdateConsentFormAsync("HC9999", inputForm);
            });
        }

        [Test]
        public void UpdateConsentFormAsync_WhenFormDoesNotExist_ThrowsKeyNotFoundException()
        {
            // Arrange
            var form = new HealthCheckConsentForm { ID = "HC5" };

            _mockConsentFormRepository.Setup(r => r.ConsentFormExistsAsync("HC5"))
                     .ReturnsAsync(false);

            // Act & Assert
            Assert.ThrowsAsync<KeyNotFoundException>(async () =>
            {
                await _service.UpdateConsentFormAsync("HC5", form);
            });
        }

        [Test]
        public async Task UpdateConsentFormAsync_WhenValid_CallsUpdateOnce()
        {
            // Arrange
            var form = new HealthCheckConsentForm { ID = "HC5" };

            _mockConsentFormRepository.Setup(r => r.ConsentFormExistsAsync("HC5"))
                     .ReturnsAsync(true);

            _mockConsentFormRepository.Setup(r => r.UpdateConsentFormAsync(form))
                     .Returns(Task.CompletedTask);

            // Act
            await _service.UpdateConsentFormAsync("HC5", form);

            // Assert
            _mockConsentFormRepository.Verify(r => r.UpdateConsentFormAsync(form), Times.Once);
        }

        [Test]
        public void DeleteConsentFormAsync_WhenFormDoesNotExist_ThrowsKeyNotFoundException()
        {
            // Arrange
            var id = "HC5";
            _mockConsentFormRepository.Setup(r => r.ConsentFormExistsAsync(id)).ReturnsAsync(false);

            // Act & Assert
            Assert.ThrowsAsync<KeyNotFoundException>(async () =>
            {
                await _service.DeleteConsentFormAsync(id);
            });
        }

        [Test]
        public async Task DeleteConsentFormAsync_WhenFormExists_CallsDeleteOnce()
        {
            // Arrange
            var id = "HC5";
            _mockConsentFormRepository.Setup(r => r.ConsentFormExistsAsync(id)).ReturnsAsync(true);
            _mockConsentFormRepository.Setup(r => r.DeleteConsentFormAsync(id)).Returns(Task.CompletedTask);

            // Act
            await _service.DeleteConsentFormAsync(id);

            // Assert
            _mockConsentFormRepository.Verify(r => r.DeleteConsentFormAsync(id), Times.Once);
        }

        [Test]
        public async Task GetChildrenByParentIdAsync_WithValidParentId_ReturnsChildrenList()
        {
            // Arrange
            string parentId = "P1";
            var expectedChildren = new List<User>
            {
                new User { UserID = "S1"},
                new User { UserID = "S2"}
            };

            _mockConsentFormRepository.Setup(r => r.GetChildrenByParentIdAsync(parentId))
                     .ReturnsAsync(expectedChildren);

            // Act
            var result = await _service.GetChildrenByParentIdAsync(parentId);

            // Assert
            Assert.That(result, Is.EqualTo(expectedChildren));
        }

        [Test]
        public async Task GetChildrenByParentIdAsync_WithNoChildren_ReturnsEmptyList()
        {
            // Arrange
            string parentId = "P2";
            _mockConsentFormRepository.Setup(r => r.GetChildrenByParentIdAsync(parentId))
                     .ReturnsAsync(new List<User>());

            // Act
            var result = await _service.GetChildrenByParentIdAsync(parentId);

            // Assert
            Assert.IsEmpty(result);
        }

        [Test]
        public async Task GetConsentFormsByStudentIdsAsync_WithValidIds_ReturnsForms()
        {
            // Arrange
            var studentIds = new List<string> { "S1", "S2" };
            var expectedForms = new List<HealthCheckConsentForm>
            {
                new HealthCheckConsentForm { ID = "HC1", StudentID = "S1" },
                new HealthCheckConsentForm { ID = "HC2", StudentID = "S2" }
            };

            _mockConsentFormRepository.Setup(r => r.GetConsentFormsByStudentIdsAsync(studentIds))
                     .ReturnsAsync(expectedForms);

            // Act
            var result = await _service.GetConsentFormsByStudentIdsAsync(studentIds);

            // Assert
            Assert.That(result, Is.EqualTo(expectedForms));
        }

        [Test]
        public async Task GetConsentFormsByStudentIdsAsync_WithInvalidIds_ReturnsEmpty()
        {
            // Arrange
            var studentIds = new List<string> { "S86", "S68" };

            _mockConsentFormRepository.Setup(r => r.GetConsentFormsByStudentIdsAsync(studentIds))
                     .ReturnsAsync(new List<HealthCheckConsentForm>());

            // Act
            var result = await _service.GetConsentFormsByStudentIdsAsync(studentIds);

            // Assert
            Assert.IsEmpty(result);
        }

    }
}
