import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/studypdf.css';

function StudyPDF() {
  const [materials, setMaterials] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('all');

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchMaterials();
    }
  }, [selectedSubject, selectedUnit]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('http://localhost:5001/studypdf/subjects');
      setSubjects([...new Set(response.data.map(item => item.subject_code))]);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const url = selectedUnit === 'all' 
        ? `http://localhost:5001/studypdf/${selectedSubject}`
        : `http://localhost:5001/studypdf/${selectedSubject}/${selectedUnit}`;
      
      const response = await axios.get(url);
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const openPDF = (driveFileId) => {
    window.open(`https://drive.google.com/file/d/${driveFileId}/preview`, '_blank');
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'notes': return '📝';
      case 'slides': return '📊';
      case 'question_bank': return '📚';
      default: return '📄';
    }
  };

  return (
    <div className="studypdf-container">
      <div className="studypdf-header">
        <h1>Study Materials</h1>
        <div className="filters">
          <div className="select-wrapper">
            <label>Subject</label>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="subject-select"
            >
              <option value="">Select Subject</option>
              {subjects.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>

          <div className="select-wrapper">
            <label>Unit</label>
            <select 
              value={selectedUnit} 
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="unit-select"
            >
              <option value="all">All Units</option>
              {[1, 2, 3, 4, 5].map(unit => (
                <option key={unit} value={unit}>Unit {unit}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="materials-grid">
        {materials.length === 0 ? (
          <div className="no-materials">
            <p>{selectedSubject ? 'No materials found' : 'Select a subject to view materials'}</p>
          </div>
        ) : (
          materials.map(material => (
            <div 
              key={material.id} 
              className="material-card"
              onClick={() => openPDF(material.drive_file_id)}
            >
              <div className="material-icon">
                {getIconForType(material.material_type)}
              </div>
              <div className="material-content">
                <div className={`material-type ${material.material_type}`}>
                  {material.material_type}
                </div>
                <h3>{material.title}</h3>
                <p>{material.description}</p>
                <div className="unit-badge">Unit {material.unit_number}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StudyPDF;
