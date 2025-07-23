import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HealthTips.css';
import apiClient from '../services/apiClient';

const HealthTips = () => {
  const navigate = useNavigate();
  const { getUserRole } = useAuth();
  const [healthTips, setHealthTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTip, setSelectedTip] = useState(null);
  const [showTipModal, setShowTipModal] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchHealthTips = async () => {
      setLoading(true);
      try {
        const userRole = getUserRole();
        if (userRole !== 'Student' && userRole !== 'Parent' && userRole !== 'MedicalStaff') {
          navigate('/dashboard');
          return;
        }
        
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        if (searchTerm) params.append('search', searchTerm);

        const response = await apiClient.get(`/Blog?${params.toString()}`);
        setHealthTips(response.data);

        // Dynamically create categories from fetched data
        const fetchedCategories = ['all', ...new Set(response.data.map(tip => tip.category || 'Chung'))];
        setCategories(fetchedCategories);

      } catch (error) {
        console.error("Lỗi khi tải mẹo sức khỏe:", error);
        setHealthTips([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHealthTips();
  }, [selectedCategory, searchTerm, getUserRole, navigate]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return '#38a169';
      case 'Medium':
        return '#d69e2e';
      case 'Hard':
        return '#e53e3e';
      default:
        return '#718096';
    }
  };

  const handleTipClick = (tip) => {
    setSelectedTip(tip);
    setShowTipModal(true);
  };

  if (loading) {
    return (
      <div className="health-tips-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="health-tips-container">
      <div className="tips-header">
        <h1>Mẹo sức khỏe</h1>
        <p>Khám phá các mẹo và lời khuyên để duy trì sức khỏe tốt</p>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm mẹo sức khỏe..."
            value={searchTerm ?? ""}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={selectedCategory ?? ""}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Tất cả danh mục' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tips Grid */}
      <div className="tips-grid">
        {healthTips.map((tip) => (
          <div key={tip.id} className="tip-card" onClick={() => handleTipClick(tip)}>
            <div className="tip-image">
              <img src={tip.imageUrl || '/assets/default-tip.jpg'} alt={tip.title} />
              <div className="tip-category">{tip.category}</div>
            </div>
            
            <div className="tip-content">
              <h3>{tip.title}</h3>
              <p>{tip.content ? tip.content.substring(0, 150) : ''}...</p>
              
              <div className="tip-meta">
                <div className="meta-row">
                  <span className="author">
                    <i className="fas fa-user"></i>
                    {tip.author}
                  </span>
                  <span className="date">
                    <i className="fas fa-calendar"></i>
                    {new Date(tip.publishDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                
                <div className="meta-row">
                  <span className="reads">
                    <i className="fas fa-eye"></i>
                    {tip.readCount} lượt đọc
                  </span>
                  <span className="time">
                    <i className="fas fa-clock"></i>
                    {tip.timeToRead}
                  </span>
                </div>
                
                <div className="meta-row">
                  <span 
                    className="difficulty"
                    style={{ color: getDifficultyColor(tip.difficulty) }}
                  >
                    <i className="fas fa-star"></i>
                    {tip.difficulty}
                  </span>
                </div>
              </div>

              <div className="tip-tags">
                {tip.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {healthTips.length === 0 && !loading && (
        <div className="no-results">
          <i className="fas fa-lightbulb"></i>
          <h3>Không tìm thấy mẹo sức khỏe phù hợp</h3>
          <p>Vui lòng thử lại với từ khóa hoặc danh mục khác.</p>
        </div>
      )}

      {/* Tip Details Modal */}
      {showTipModal && selectedTip && (
        <div className="modal-overlay" onClick={() => setShowTipModal(false)}>
          <div className="tip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedTip.title}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowTipModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="tip-header">
                <div className="tip-image-large">
                  <img src={selectedTip.imageUrl || '/assets/default-tip.jpg'} alt={selectedTip.title} />
                </div>
                
                <div className="tip-info">
                  <div className="info-row">
                    <span className="info-label">Tác giả:</span>
                    <span className="info-value">{selectedTip.author}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Danh mục:</span>
                    <span className="info-value">{selectedTip.category}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ngày đăng:</span>
                    <span className="info-value">{new Date(selectedTip.publishDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Thời gian đọc:</span>
                    <span className="info-value">{selectedTip.timeToRead}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Độ khó:</span>
                    <span 
                      className="info-value"
                      style={{ color: getDifficultyColor(selectedTip.difficulty) }}
                    >
                      {selectedTip.difficulty}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Lượt đọc:</span>
                    <span className="info-value">{selectedTip.readCount}</span>
                  </div>
                </div>
              </div>

              <div className="tip-content-full">
                <h4>Nội dung chi tiết</h4>
                <div className="content-text">
                  {selectedTip.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="tip-tags-full">
                <h4>Tags</h4>
                <div className="tags-container">
                  {selectedTip.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="tip-actions">
                <button className="save-btn">
                  <i className="fas fa-bookmark"></i>
                  Lưu mẹo
                </button>
                <button className="share-btn">
                  <i className="fas fa-share"></i>
                  Chia sẻ
                </button>
                <button className="print-btn">
                  <i className="fas fa-print"></i>
                  In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthTips; 