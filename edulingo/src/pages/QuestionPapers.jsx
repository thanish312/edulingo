// filepath: /workspaces/edulingo/edulingo/src/pages/QuestionPapers.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const QuestionPapers = () => {
  const [grade, setGrade] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState("");
  const [papers, setPapers] = useState([]);

  const fetchPapers = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/question-papers?grade=${grade}&year=${year}&type=${type}`);
      setPapers(response.data);
    } catch (error) {
      console.error("Error fetching question papers:", error);
    }
  };

  return (
    <div>
      <h1>Question Papers</h1>
      <select onChange={(e) => setGrade(e.target.value)}>
        <option value="">Select Grade</option>
        <option value="10">Grade 10</option>
        <option value="11">Grade 11</option>
        <option value="12">Grade 12</option>
      </select>
      <select onChange={(e) => setYear(e.target.value)}>
        <option value="">Select Year</option>
        <option value="2021">2021</option>
        <option value="2022">2022</option>
      </select>
      <select onChange={(e) => setType(e.target.value)}>
        <option value="">Select Type</option>
        <option value="sample">Sample Paper</option>
        <option value="previous">Previous Year Paper</option>
      </select>
      <button onClick={fetchPapers}>Fetch Papers</button>
      <ul>
        {papers.map((paper, index) => (
          <li key={index}>
            <a href={paper.link} target="_blank" rel="noopener noreferrer">{paper.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionPapers;