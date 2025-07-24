using Businessobjects.Models;
using Moq;
using Repositories.Interfaces;
using Services.Implements;

namespace UnitTest.HelcheckServiceTest
{
    [TestFixture]
    public class HealthCheckResultServiceTests
    {
        private Mock<IHealthCheckResultRepository> _mockResultRepo;
        private Mock<IHealthCheckConsentFormRepository> _mockConsentRepo;
        private HealthCheckResultService _service;

        [SetUp]
        public void Setup()
        {
            _mockResultRepo = new Mock<IHealthCheckResultRepository>();
            _mockConsentRepo = new Mock<IHealthCheckConsentFormRepository>();
            _service = new HealthCheckResultService(_mockResultRepo.Object, _mockConsentRepo.Object);
        }

        [Test]
        public async Task GetAllHealthCheckResultsAsync_ReturnsExpectedResults()
        {
            // Arrange
            var expectedResults = new List<HealthCheckResult>
        {
            new HealthCheckResult { ID = "Result1" },
            new HealthCheckResult { ID = "Result2" }
        };

            _mockResultRepo.Setup(r => r.GetAllHealthCheckResultsAsync())
                           .ReturnsAsync(expectedResults);

            // Act
            var results = await _service.GetAllHealthCheckResultsAsync();

            // Assert
            Assert.IsNotNull(results);
            Assert.AreEqual(2, ((List<HealthCheckResult>)results).Count);
            Assert.AreEqual("Result1", ((List<HealthCheckResult>)results)[0].ID);
        }

        [Test]
        public async Task GetAllHealthCheckResultsAsync_WhenNoResults_ReturnsEmptyList()
        {
            // Arrange
            var expectedResults = new List<HealthCheckResult>();
            _mockResultRepo.Setup(r => r.GetAllHealthCheckResultsAsync())
                           .ReturnsAsync(expectedResults);

            // Act
            var results = await _service.GetAllHealthCheckResultsAsync();

            // Assert
            Assert.IsNotNull(results);
            Assert.IsEmpty(results);
        }

        [Test]
        public async Task GetHealthCheckResultByIdAsync_WhenIdExists_ReturnsHealthCheckResult()
        {
            // Arrange
            var id = "Result1";
            var expectedResult = new HealthCheckResult { ID = id };

            _mockResultRepo.Setup(r => r.GetHealthCheckResultByIdAsync(id))
                           .ReturnsAsync(expectedResult);

            // Act
            var result = await _service.GetHealthCheckResultByIdAsync(id);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(id, result!.ID);
        }

        [Test]
        public async Task GetHealthCheckResultByIdAsync_WhenIdDoesNotExist_ReturnsNull()
        {
            // Arrange
            var id = "not-existed-id";

            _mockResultRepo.Setup(r => r.GetHealthCheckResultByIdAsync(id))
                           .ReturnsAsync((HealthCheckResult?)null);

            // Act
            var result = await _service.GetHealthCheckResultByIdAsync(id);

            // Assert
            Assert.IsNull(result);
        }

        [Test]
        public void GetHealthCheckResultByIdAsync_WhenRepositoryThrows_ExceptionIsPropagated()
        {
            // Arrange
            var id = "error-id";

            _mockResultRepo.Setup(r => r.GetHealthCheckResultByIdAsync(id))
                           .ThrowsAsync(new Exception("Database failure"));

            // Act & Assert
            Assert.ThrowsAsync<Exception>(async () =>
            {
                await _service.GetHealthCheckResultByIdAsync(id);
            });
        }

        [Test]
        public async Task GetHealthCheckResultByConsentIdAsync_WhenConsentIdExists_ReturnsHealthCheckResult()
        {
            // Arrange
            var consentId = "consent1";
            var expectedResult = new HealthCheckResult { ID = "result1", HealthCheckConsentID = consentId };

            _mockResultRepo.Setup(r => r.GetHealthCheckResultByConsentIdAsync(consentId))
                           .ReturnsAsync(expectedResult);

            // Act
            var result = await _service.GetHealthCheckResultByConsentIdAsync(consentId);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(consentId, result!.HealthCheckConsentID);
        }

        [Test]
        public async Task GetHealthCheckResultByConsentIdAsync_WhenConsentIdDoesNotExist_ReturnsNull()
        {
            // Arrange
            var consentId = "invalid-id";

            _mockResultRepo.Setup(r => r.GetHealthCheckResultByConsentIdAsync(consentId))
                           .ReturnsAsync((HealthCheckResult?)null);

            // Act
            var result = await _service.GetHealthCheckResultByConsentIdAsync(consentId);

            // Assert
            Assert.IsNull(result);
        }

        [Test]
        public async Task GetHealthCheckResultsByCheckerAsync_WhenCheckerExists_ReturnsResultsList()
        {
            // Arrange
            var checker = "doctor001";
            var expectedResults = new List<HealthCheckResult>
            {
                new HealthCheckResult { ID = "r1", Checker = checker},
                new HealthCheckResult { ID = "r2", Checker = checker}
            };

            _mockResultRepo.Setup(r => r.GetHealthCheckResultsByCheckerAsync(checker))
                           .ReturnsAsync(expectedResults);

            // Act
            var results = await _service.GetHealthCheckResultsByCheckerAsync(checker);

            // Assert
            Assert.IsNotNull(results);
            var resultList = results.ToList();
            Assert.AreEqual(2, resultList.Count);
            Assert.IsTrue(resultList.All(r => r.Checker == checker));
        }

        [Test]
        public async Task GetHealthCheckResultsByCheckerAsync_WhenCheckerHasNoResults_ReturnsEmptyList()
        {
            // Arrange
            var checker = "invalid-checker";
            _mockResultRepo.Setup(r => r.GetHealthCheckResultsByCheckerAsync(checker))
                           .ReturnsAsync(new List<HealthCheckResult>());

            // Act
            var results = await _service.GetHealthCheckResultsByCheckerAsync(checker);

            // Assert
            Assert.IsNotNull(results);
            Assert.IsEmpty(results);
        }

        [Test]
        public void GetHealthCheckResultsByCheckerAsync_WhenRepositoryThrows_ExceptionIsPropagated()
        {
            // Arrange
            var checker = "invalid-checker";
            _mockResultRepo.Setup(r => r.GetHealthCheckResultsByCheckerAsync(checker))
                           .ThrowsAsync(new Exception("Database failure"));

            // Act & Assert
            Assert.ThrowsAsync<Exception>(async () =>
            {
                await _service.GetHealthCheckResultsByCheckerAsync(checker);
            });
        }

        [Test]
        public async Task GetHealthCheckResultsByDateRangeAsync_ValidRange_ReturnsResults()
        {
            // Arrange
            var startDate = new DateTime(2024, 1, 1);
            var endDate = new DateTime(2024, 1, 31);
            var expectedResults = new List<HealthCheckResult>
            {
                new HealthCheckResult { ID = "r1", CheckUpDate = new DateTime(2024, 1, 5) },
                new HealthCheckResult { ID = "r2", CheckUpDate = new DateTime(2024, 1, 15) }
            };

            _mockResultRepo.Setup(r => r.GetHealthCheckResultsByDateRangeAsync(startDate, endDate))
                           .ReturnsAsync(expectedResults);

            // Act
            var results = await _service.GetHealthCheckResultsByDateRangeAsync(startDate, endDate);

            // Assert
            Assert.IsNotNull(results);
            var resultList = results.ToList();
            Assert.AreEqual(2, resultList.Count);
            Assert.IsTrue(resultList.All(r => r.CheckUpDate >= startDate && r.CheckUpDate <= endDate));
        }

        [Test]
        public void GetHealthCheckResultsByDateRangeAsync_StartDateAfterEndDate_ThrowsArgumentException()
        {
            // Arrange
            var startDate = new DateTime(2024, 2, 1);
            var endDate = new DateTime(2024, 1, 1);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ArgumentException>(async () =>
            {
                await _service.GetHealthCheckResultsByDateRangeAsync(startDate, endDate);
            });

            Assert.AreEqual("Start date must be before end date", ex!.Message);
        }

        [Test]
        public async Task GetPendingConsultationsAsync_WhenPendingResultsExist_ReturnsList()
        {
            // Arrange
            var expectedResults = new List<HealthCheckResult>
            {
                new HealthCheckResult { ID = "r1", Status = "Pending" },
                new HealthCheckResult { ID = "r2", Status = "Pending" }
            };

            _mockResultRepo.Setup(r => r.GetPendingConsultationsAsync())
                           .ReturnsAsync(expectedResults);

            // Act
            var results = await _service.GetPendingConsultationsAsync();

            // Assert
            Assert.IsNotNull(results);
            var resultList = results.ToList();
            Assert.AreEqual(2, resultList.Count);
            Assert.IsTrue(resultList.All(r => r.Status == "Pending"));
        }

        [Test]
        public void GetPendingConsultationsAsync_WhenRepositoryThrows_ExceptionIsPropagated()
        {
            // Arrange
            _mockResultRepo.Setup(r => r.GetPendingConsultationsAsync())
                           .ThrowsAsync(new Exception("Database failure"));

            // Act & Assert
            Assert.ThrowsAsync<Exception>(async () =>
            {
                await _service.GetPendingConsultationsAsync();
            });
        }

        [Test]
        public async Task GetHealthCheckResultsByConsentIdsAsync_ValidConsentIds_ReturnsMatchingResults()
        {
            // Arrange
            var consentIds = new List<string> { "cid1", "cid2" };
            var expectedResults = new List<HealthCheckResult>
            {
                new HealthCheckResult { ID = "r1", HealthCheckConsentID = "cid1" },
                new HealthCheckResult { ID = "r2", HealthCheckConsentID = "cid2" }
            };

            _mockResultRepo.Setup(r => r.GetHealthCheckResultsByConsentIdsAsync(consentIds))
                           .ReturnsAsync(expectedResults);

            // Act
            var results = await _service.GetHealthCheckResultsByConsentIdsAsync(consentIds);

            // Assert
            Assert.IsNotNull(results);
            var resultList = results.ToList();
            Assert.AreEqual(2, resultList.Count);
            CollectionAssert.AreEquivalent(consentIds, resultList.Select(r => r.HealthCheckConsentID));
        }

        [Test]
        public async Task GetHealthCheckResultsByConsentIdsAsync_EmptyConsentIds_ReturnsEmptyList()
        {
            // Arrange
            var consentIds = new List<string>();

            _mockResultRepo.Setup(r => r.GetHealthCheckResultsByConsentIdsAsync(consentIds))
                           .ReturnsAsync(new List<HealthCheckResult>());

            // Act
            var results = await _service.GetHealthCheckResultsByConsentIdsAsync(consentIds);

            // Assert
            Assert.IsNotNull(results);
            Assert.IsEmpty(results);
        }

        [Test]
        public void GetHealthCheckResultsByConsentIdsAsync_RepositoryThrows_ExceptionIsPropagated()
        {
            // Arrange
            var consentIds = new List<string> { "cid1", "cid2" };

            _mockResultRepo.Setup(r => r.GetHealthCheckResultsByConsentIdsAsync(consentIds))
                           .ThrowsAsync(new Exception("Database error"));

            // Act & Assert
            Assert.ThrowsAsync<Exception>(async () =>
            {
                await _service.GetHealthCheckResultsByConsentIdsAsync(consentIds);
            });
        }


        [Test]
        public async Task GetPendingConsultationsAsync_WhenNoPendingResults_ReturnsEmptyList()
        {
            // Arrange
            _mockResultRepo.Setup(r => r.GetPendingConsultationsAsync())
                           .ReturnsAsync(new List<HealthCheckResult>());

            // Act
            var results = await _service.GetPendingConsultationsAsync();

            // Assert
            Assert.IsNotNull(results);
            Assert.IsEmpty(results);
        }

        [Test]
        public async Task CreateHealthCheckResultAsync_ValidInput_CreatesResultSuccessfully()
        {
            // Arrange
            var result = new HealthCheckResult
            {
                ID = "r1",
                HealthCheckConsentID = "c1",
                CheckUpDate = DateTime.Today,
                NeedToContactParent = false
            };

            var consentForm = new HealthCheckConsentForm
            {
                ID = "c1",
                StatusID = 1
            };

            _mockConsentRepo.Setup(r => r.GetConsentFormByIdAsync(result.HealthCheckConsentID))
                            .ReturnsAsync(consentForm);

            _mockResultRepo.Setup(r => r.HasResultForConsentAsync(result.HealthCheckConsentID))
                           .ReturnsAsync(false);

            _mockResultRepo.Setup(r => r.CreateHealthCheckResultAsync(result))
                           .Returns(Task.CompletedTask);

            // Act
            var createdResult = await _service.CreateHealthCheckResultAsync(result);

            // Assert
            Assert.AreEqual(result, createdResult);
            _mockResultRepo.Verify(r => r.CreateHealthCheckResultAsync(result), Times.Once);
        }

        [Test]
        public void CreateHealthCheckResultAsync_ConsentFormNotFound_ThrowsKeyNotFoundException()
        {
            // Arrange
            var result = new HealthCheckResult
            {
                ID = "r1",
                HealthCheckConsentID = "invalid-id",
                CheckUpDate = DateTime.Today
            };

            _mockConsentRepo.Setup(r => r.GetConsentFormByIdAsync(result.HealthCheckConsentID))
                            .ReturnsAsync((HealthCheckConsentForm?)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _service.CreateHealthCheckResultAsync(result));

            Assert.AreEqual("Health check consent form not found", ex!.Message);
        }

        [Test]
        public void CreateHealthCheckResultAsync_ParentContactRequiredWithoutFollowUpDate_ThrowsInvalidOperationException()
        {
            // Arrange
            var result = new HealthCheckResult
            {
                ID = "r1",
                HealthCheckConsentID = "c1",
                CheckUpDate = DateTime.Today,
                NeedToContactParent = true,
                FollowUpDate = null
            };

            var consentForm = new HealthCheckConsentForm
            {
                ID = "c1",
                StatusID = 1
            };

            _mockConsentRepo.Setup(r => r.GetConsentFormByIdAsync(result.HealthCheckConsentID))
                            .ReturnsAsync(consentForm);

            _mockResultRepo.Setup(r => r.HasResultForConsentAsync(result.HealthCheckConsentID))
                           .ReturnsAsync(false);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.CreateHealthCheckResultAsync(result));

            Assert.AreEqual("Follow-up date is required when parent contact is needed", ex!.Message);
        }

        [Test]
        public async Task UpdateHealthCheckResultAsync_ValidInput_UpdatesSuccessfully()
        {
            // Arrange
            var id = "r1";
            var result = new HealthCheckResult
            {
                ID = id,
                HealthCheckConsentID = "c1",
                CheckUpDate = DateTime.Today,
                NeedToContactParent = false
            };

            var consentForm = new HealthCheckConsentForm { ID = "c1" };

            _mockResultRepo.Setup(r => r.HealthCheckResultExistsAsync(id)).ReturnsAsync(true);
            _mockConsentRepo.Setup(c => c.GetConsentFormByIdAsync(result.HealthCheckConsentID)).ReturnsAsync(consentForm);
            _mockResultRepo.Setup(r => r.UpdateHealthCheckResultAsync(result)).Returns(Task.CompletedTask);

            // Act
            await _service.UpdateHealthCheckResultAsync(id, result);

            // Assert
            _mockResultRepo.Verify(r => r.UpdateHealthCheckResultAsync(result), Times.Once);
        }


        [Test]
        public async Task GetHealthCheckResultsByDateRangeAsync_ValidRangeNoResults_ReturnsEmptyList()
        {
            // Arrange
            var startDate = new DateTime(2024, 3, 1);
            var endDate = new DateTime(2024, 3, 31);

            _mockResultRepo.Setup(r => r.GetHealthCheckResultsByDateRangeAsync(startDate, endDate))
                           .ReturnsAsync(new List<HealthCheckResult>());

            // Act
            var results = await _service.GetHealthCheckResultsByDateRangeAsync(startDate, endDate);

            // Assert
            Assert.IsNotNull(results);
            Assert.IsEmpty(results);
        }

        [Test]
        public void UpdateHealthCheckResultAsync_IdMismatch_ThrowsArgumentException()
        {
            // Arrange
            var id = "r1";
            var result = new HealthCheckResult { ID = "r2" }; // Mismatched ID

            // Act & Assert
            var ex = Assert.ThrowsAsync<ArgumentException>(async () =>
                await _service.UpdateHealthCheckResultAsync(id, result));

            Assert.AreEqual("ID mismatch", ex!.Message);
        }

        [Test]
        public void UpdateHealthCheckResultAsync_NeedContactParentWithoutFollowUp_ThrowsInvalidOperationException()
        {
            // Arrange
            var id = "r1";
            var result = new HealthCheckResult
            {
                ID = id,
                HealthCheckConsentID = "c1",
                CheckUpDate = DateTime.Today,
                NeedToContactParent = true,
                FollowUpDate = null
            };

            var consentForm = new HealthCheckConsentForm { ID = "c1" };

            _mockResultRepo.Setup(r => r.HealthCheckResultExistsAsync(id)).ReturnsAsync(true);
            _mockConsentRepo.Setup(c => c.GetConsentFormByIdAsync(result.HealthCheckConsentID)).ReturnsAsync(consentForm);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.UpdateHealthCheckResultAsync(id, result));

            Assert.AreEqual("Follow-up date is required when parent contact is needed", ex!.Message);
        }

        [Test]
        public void UpdateHealthCheckResultAsync_ResultNotFound_ThrowsKeyNotFoundException()
        {
            var id = "r1";
            var result = new HealthCheckResult { ID = id };

            _mockResultRepo.Setup(r => r.HealthCheckResultExistsAsync(id)).ReturnsAsync(false);

            var ex = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _service.UpdateHealthCheckResultAsync(id, result));

            Assert.That(ex!.Message, Is.EqualTo("Health check result not found"));
        }

        [Test]
        public void UpdateHealthCheckResultAsync_ConsentFormNotFound_ThrowsKeyNotFoundException()
        {
            var id = "r1";
            var result = new HealthCheckResult
            {
                ID = id,
                HealthCheckConsentID = "c1"
            };

            _mockResultRepo.Setup(r => r.HealthCheckResultExistsAsync(id)).ReturnsAsync(true);
            _mockConsentRepo.Setup(c => c.GetConsentFormByIdAsync("c1")).ReturnsAsync((HealthCheckConsentForm?)null);

            var ex = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _service.UpdateHealthCheckResultAsync(id, result));

            Assert.That(ex!.Message, Is.EqualTo("Health check consent form not found"));
        }

        [Test]
        public void UpdateHealthCheckResultAsync_CheckUpDateInFuture_ThrowsInvalidOperationException()
        {
            var id = "r1";
            var result = new HealthCheckResult
            {
                ID = id,
                HealthCheckConsentID = "c1",
                CheckUpDate = DateTime.Today.AddDays(1)
            };

            _mockResultRepo.Setup(r => r.HealthCheckResultExistsAsync(id)).ReturnsAsync(true);
            _mockConsentRepo.Setup(c => c.GetConsentFormByIdAsync("c1")).ReturnsAsync(new HealthCheckConsentForm());

            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.UpdateHealthCheckResultAsync(id, result));

            Assert.That(ex!.Message, Is.EqualTo("Cannot set future date for check-up date"));
        }

        [Test]
        public async Task DeleteHealthCheckResultAsync_WithValidId_ShouldCallDelete()
        {
            // Arrange
            var id = "123";
            _mockResultRepo.Setup(r => r.HealthCheckResultExistsAsync(id)).ReturnsAsync(true);

            // Act
            await _service.DeleteHealthCheckResultAsync(id);

            // Assert
            _mockResultRepo.Verify(r => r.DeleteHealthCheckResultAsync(id), Times.Once);
        }

        [Test]
        public void DeleteHealthCheckResultAsync_WithInvalidId_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var id = "not-found";
            _mockResultRepo.Setup(r => r.HealthCheckResultExistsAsync(id)).ReturnsAsync(false);

            // Act & Assert
            var ex = Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteHealthCheckResultAsync(id));
            Assert.That(ex!.Message, Is.EqualTo("Health check result not found"));
            _mockResultRepo.Verify(r => r.DeleteHealthCheckResultAsync(It.IsAny<string>()), Times.Never);
        }

        [Test]
        public async Task DeleteHealthCheckResultAsync_IdDoesNotExist_ShouldNotCallDeleteMethod()
        {
            // Arrange
            var id = "456";
            _mockResultRepo.Setup(r => r.HealthCheckResultExistsAsync(id)).ReturnsAsync(false);

            // Act
            try
            {
                await _service.DeleteHealthCheckResultAsync(id);
            }
            catch
            {

            }

            // Assert
            _mockResultRepo.Verify(r => r.DeleteHealthCheckResultAsync(It.IsAny<string>()), Times.Never);
        }

        [Test]
        public void UpdateHealthCheckResultAsync_NeedContactButNoFollowUp_ThrowsInvalidOperationException()
        {
            var id = "r1";
            var result = new HealthCheckResult
            {
                ID = id,
                HealthCheckConsentID = "c1",
                CheckUpDate = DateTime.Today,
                NeedToContactParent = true,
                FollowUpDate = null
            };

            _mockResultRepo.Setup(r => r.HealthCheckResultExistsAsync(id)).ReturnsAsync(true);
            _mockConsentRepo.Setup(c => c.GetConsentFormByIdAsync("c1")).ReturnsAsync(new HealthCheckConsentForm());

            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.UpdateHealthCheckResultAsync(id, result));

            Assert.That(ex!.Message, Is.EqualTo("Follow-up date is required when parent contact is needed"));
        }

        [Test]
        public void GetHealthCheckResultByConsentIdAsync_WhenRepositoryThrows_ExceptionDatabase()
        {
            // Arrange
            var consentId = "invalid-id";

            _mockResultRepo.Setup(r => r.GetHealthCheckResultByConsentIdAsync(consentId))
                           .ThrowsAsync(new Exception("Database error"));

            // Act & Assert
            Assert.ThrowsAsync<Exception>(async () =>
            {
                await _service.GetHealthCheckResultByConsentIdAsync(consentId);
            });
        }

        [Test]
        public void GetAllHealthCheckResultsAsync_WhenRepositoryThrows_ExceptionDatabase()
        {
            // Arrange
            _mockResultRepo.Setup(r => r.GetAllHealthCheckResultsAsync())
                           .ThrowsAsync(new System.Exception("Database error"));

            // Act & Assert
            Assert.ThrowsAsync<System.Exception>(async () =>
            {
                await _service.GetAllHealthCheckResultsAsync();
            });
        }

        [Test]
        public async Task GetAllHealthCheckResultsAsync_WhenRepositoryReturnsNull_ReturnsNull()
        {
            // Arrange
            _mockResultRepo.Setup(r => r.GetAllHealthCheckResultsAsync())
                           .ReturnsAsync((IEnumerable<HealthCheckResult>)null);

            // Act
            var results = await _service.GetAllHealthCheckResultsAsync();

            // Assert
            Assert.IsNull(results);
        }
    }
}
