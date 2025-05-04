import React, { useState } from 'react';
import '../styles/course.css';

function Course() {
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  const handleUnitClick = (subject, unit) => {
    const searchTerm = `${subject} ${unit.name}`;
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`, '_blank');
  };

  const subjects = {
    probabilityQueueing: {
      name: 'Probability and Queueing Theory - 21MAB204T',
      units: [
        {
          name: 'Unit 1: Probability',
          links: [
            { title: 'Random Variables', url: '#' },
            { title: 'Probability Axioms', url: '#' },
            { title: 'Conditional Probability', url: '#' }
          ]
        },
        {
          name: 'Unit 2: Random Variables',
          links: [
            { title: 'Discrete Random Variables', url: '#' },
            { title: 'Continuous Random Variables', url: '#' },
            { title: 'Expected Values', url: '#' }
          ]
        },
        {
          name: 'Unit 3: Queueing Systems',
          links: [
            { title: 'Introduction to Queueing Theory', url: '#' },
            { title: 'Birth-Death Process', url: '#' },
            { title: 'M/M/1 Queue Model', url: '#' }
          ]
        },
        {
          name: 'Unit 4: Queueing Models',
          links: [
            { title: 'M/M/c Queue Model', url: '#' },
            { title: 'M/G/1 Queue Model', url: '#' },
            { title: 'Network of Queues', url: '#' }
          ]
        },
        {
          name: 'Unit 5: Applications',
          links: [
            { title: 'Performance Analysis', url: '#' },
            { title: 'System Optimization', url: '#' },
            { title: 'Case Studies', url: '#' }
          ]
        }
      ]
    },
    probabilityStats: {
      name: 'Probability and Statistics - 21MAB301T',
      units: [
        {
          name: 'Unit 1: Basic Probability',
          links: [
            { title: 'Sample Space and Events', url: '#' },
            { title: 'Probability Laws', url: '#' },
            { title: 'Bayes Theorem', url: '#' }
          ]
        },
        {
          name: 'Unit 2: Probability Distributions',
          links: [
            { title: 'Discrete Distributions', url: '#' },
            { title: 'Continuous Distributions', url: '#' },
            { title: 'Normal Distribution', url: '#' }
          ]
        },
        {
          name: 'Unit 3: Sampling Theory',
          links: [
            { title: 'Sampling Distributions', url: '#' },
            { title: 'Central Limit Theorem', url: '#' },
            { title: 'Point Estimation', url: '#' }
          ]
        },
        {
          name: 'Unit 4: Statistical Inference',
          links: [
            { title: 'Interval Estimation', url: '#' },
            { title: 'Hypothesis Testing', url: '#' },
            { title: 'Test of Significance', url: '#' }
          ]
        },
        {
          name: 'Unit 5: Applied Statistics',
          links: [
            { title: 'Correlation Analysis', url: '#' },
            { title: 'Regression Analysis', url: '#' },
            { title: 'Chi-Square Tests', url: '#' }
          ]
        }
      ]
    }
  };

  return (
    <div className="course-container">
      <div className="course-header">
        <h1>Courses</h1>
        <form onSubmit={handleSearch} className="search-wrapper">
          <div className="search-container">
            <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search for video tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="search-button">
            Search YouTube
          </button>
        </form>
      </div>

      <div className="subjects-container">
        {Object.entries(subjects).map(([key, subject]) => (
          <div key={key} className="subject-section">
            <div 
              className={`subject-header ${expandedSubject === key ? 'expanded' : ''}`}
              onClick={() => setExpandedSubject(expandedSubject === key ? null : key)}
            >
              <div className="subject-title">
                <h2>{subject.name.split(' - ')[0]}</h2>
                <span className="subject-code">{subject.name.split(' - ')[1]}</span>
              </div>
              <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {expandedSubject === key && (
              <div className="units-grid">
                {subject.units.map((unit, index) => (
                  <div 
                    key={index} 
                    className="unit-card"
                    onClick={() => handleUnitClick(subject.name, unit)}
                  >
                    <div className="unit-content">
                      <span className="unit-badge">Unit {index + 1}</span>
                      <h3>{unit.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Course;
