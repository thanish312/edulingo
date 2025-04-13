import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizGenerator } from '../hooks/useQuizGenerator'; // Adjust path if needed
import { useApp } from '../context/AppContext'; // Import useApp context hook

// --- Curriculum Data (Keep this structure updated) ---
const curriculumData = {
    '11': { // Grade 11
        label: "Class 11",
        exams: {
            'Boards': {
                label: "Boards (Class 11)",
                subjects: {
                    'Physics': ['Units & Measurement', 'Motion in a Straight Line', 'Laws of Motion', 'Work, Energy & Power', 'System of Particles & Rotational Motion', 'Gravitation'],
                    'Chemistry': ['Some Basic Concepts', 'Structure of Atom', 'Classification of Elements', 'Chemical Bonding', 'States of Matter', 'Thermodynamics', 'Equilibrium'],
                    'Math': ['Sets', 'Relations & Functions', 'Trigonometric Functions', 'Mathematical Induction', 'Complex Numbers', 'Linear Inequalities', 'Permutations & Combinations', 'Binomial Theorem', 'Sequences & Series'],
                }
            },
            'JEE Prep': {
                label: "JEE Foundation",
                subjects: {
                    'Physics': ['Kinematics 1D/2D', 'Vectors', 'Newton\'s Laws', 'Work, Power, Energy (Intro)', 'Rotational Motion (Intro)', 'Gravitation (Intro)'],
                    'Chemistry': ['Mole Concept & Stoichiometry', 'Atomic Structure', 'Periodic Table & Properties', 'Chemical Bonding (Intro)', 'Gaseous State', 'Thermodynamics (Basic)'],
                    'Math': ['Sets, Relations, Functions', 'Basic Algebra & Logarithms', 'Trigonometry Ratios & Identities', 'Sequences & Series', 'Straight Lines (Intro)', 'Circles (Intro)'],
                }
            },
            'NEET Prep': {
                label: "NEET Foundation",
                subjects: {
                    'Physics': ['Physical World & Measurement', 'Kinematics', 'Laws of Motion', 'Work, Energy & Power', 'Motion of System of Particles', 'Gravitation (Intro)'],
                    'Chemistry': ['Basic Concepts', 'Atomic Structure', 'Classification & Periodicity', 'Chemical Bonding', 'States of Matter', 'Thermodynamics (Intro)'],
                    'Biology': ['Diversity in Living World', 'Structural Organisation in Animals & Plants', 'Cell Structure & Function', 'Plant Physiology (Intro)', 'Human Physiology (Intro)'],
                }
            },
            // Add CET or other exams as needed
        }
    },
    '12': { // Grade 12
        label: "Class 12",
        exams: {
            'Boards': {
                label: "Boards (Class 12)",
                 subjects: {
                    'Physics': ['Electrostatics', 'Current Electricity', 'Magnetism & Matter', 'EM Induction', 'Alternating Current', 'EM Waves', 'Optics', 'Dual Nature', 'Atoms & Nuclei'],
                    'Chemistry': ['Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'p-Block Elements', 'd&f Block', 'Coordination Compounds', 'Haloalkanes/Haloarenes', 'Alcohols, Phenols, Ethers', 'Aldehydes, Ketones, Carboxylic Acids', 'Amines', 'Biomolecules'],
                    'Math': ['Relations & Functions (Adv)', 'Inverse Trigonometry', 'Matrices & Determinants', 'Continuity & Differentiability', 'Application of Derivatives', 'Integrals', 'Application of Integrals', 'Differential Equations', 'Vector Algebra', '3D Geometry', 'Linear Programming', 'Probability'],
                 }
            },
            'JEE': {
                label: "JEE (Main & Advanced)",
                 subjects: {
                    'Physics': ['Electrostatics & Capacitors', 'Current Electricity', 'Magnetic Effects of Current & Magnetism', 'EMI & AC', 'Optics (Ray & Wave)', 'Modern Physics', 'Semiconductors'],
                    'Chemistry': ['Solid State & Solutions', 'Electrochemistry & Kinetics', 'Surface Chemistry', 'General Principles of Extraction', 'P-Block Elements', 'D&F Block Elements', 'Coordination Compounds', 'Organic Chemistry Basics & Hydrocarbons', 'Organic Compounds Containing Halogens/Oxygen/Nitrogen', 'Biomolecules, Polymers, Chemistry in Everyday Life'],
                    'Math': ['Matrices & Determinants', 'Calculus (Differential & Integral)', 'Differential Equations', 'Vector Algebra & 3D Geometry', 'Probability & Statistics', 'Complex Numbers & Quadratic Equations', 'Permutations, Combinations & Binomial Theorem', 'Sequences & Series', 'Coordinate Geometry (Straight Lines, Circles, Conics)'],
                 }
            },
            'NEET': {
                label: "NEET",
                subjects: {
                    'Physics': ['Electrostatics', 'Current Electricity', 'Magnetic Effects', 'EMI & AC', 'Optics', 'Dual Nature of Radiation & Matter', 'Atoms & Nuclei', 'Electronic Devices'],
                    'Chemistry': ['Solid State', 'Solutions', 'Electrochemistry', 'Kinetics', 'Surface Chemistry', 'Isolation of Elements', 'p-Block', 'd&f Block', 'Coordination Compounds', 'Organic Chemistry', 'Biomolecules', 'Polymers', 'Chemistry in Everyday Life'],
                    'Biology': ['Reproduction', 'Genetics & Evolution', 'Biology & Human Welfare', 'Biotechnology & Its Applications', 'Ecology & Environment'],
                 }
            },
             // Add CET or other exams as needed
        }
    }
};


export default function Learn() {
    const navigate = useNavigate();
    const { questions, isLoading, error, generateQuiz, clearQuiz } = useQuizGenerator();
    const { recordLastPractice } = useApp(); // Get context function

    // --- State for Selection ---
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [selectedExamType, setSelectedExamType] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);

    // --- State for Loading/Error Feedback ---
    const [loadingDetails, setLoadingDetails] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    // --- Get Available Options Based on Selections ---
    const availableExamTypes = selectedGrade ? Object.keys(curriculumData[selectedGrade]?.exams || {}) : [];
    const availableSubjects = selectedGrade && selectedExamType
        ? Object.keys(curriculumData[selectedGrade]?.exams[selectedExamType]?.subjects || {})
        : [];
    const availableTopics = selectedGrade && selectedExamType && selectedSubject
        ? curriculumData[selectedGrade]?.exams[selectedExamType]?.subjects[selectedSubject] || []
        : [];

    // --- Handlers for Selection ---
    const handleGradeSelect = (gradeKey) => {
        setSelectedGrade(gradeKey);
        setSelectedExamType(null);
        setSelectedSubject(null);
        setFetchError(null);
    };

    const handleExamTypeSelect = (examKey) => {
        setSelectedExamType(examKey);
        setSelectedSubject(null);
        setFetchError(null);
    };

    const handleSubjectSelect = (subjectKey) => {
        setSelectedSubject(subjectKey);
        setFetchError(null);
    };

    // --- Handle Starting the Quiz ---
    const handleStartQuiz = async (topic) => {
        if (!selectedGrade || !selectedExamType || !selectedSubject || !topic) {
            console.error("Cannot start quiz: Missing selections.");
            setFetchError("Please select Grade, Exam Type, and Subject first.");
            return;
        }
        if (isLoading) {
            console.log("Already loading a quiz, please wait.");
            return;
        }

        const details = {
            grade: curriculumData[selectedGrade].label,
            examType: curriculumData[selectedGrade].exams[selectedExamType].label,
            subject: selectedSubject,
            topic: topic
        };
        console.log(`Attempting to start quiz for:`, details);
        setLoadingDetails(details);
        setFetchError(null);

        // <<< Record last practice details using context >>>
        recordLastPractice(details);

        try {
            await generateQuiz(details.grade, details.examType, details.subject, details.topic, 5); // Request 5 questions
        } catch (err) {
            console.error(`Error caught in handleStartQuiz for ${topic}:`, err);
            setLoadingDetails(null); // Reset loading state on immediate failure in handler
            // Error state is set in the hook, useEffect handles fetchError update.
        }
    };


    // --- Effect for Navigation and Error Handling after Fetch ---
    useEffect(() => {
        if (!isLoading && loadingDetails) {
            if (questions && !error) {
                console.log("Questions fetched, navigating to quiz:", questions);
                navigate('/quiz', {
                    state: {
                        questions: questions,
                        grade: loadingDetails.grade,
                        examType: loadingDetails.examType,
                        subject: loadingDetails.subject,
                        topic: loadingDetails.topic,
                    }
                });
                setLoadingDetails(null);
                // clearQuiz(); // Optional
            } else if (error) {
                console.error("Fetch error detected by useEffect:", error);
                setFetchError(`Failed to load quiz for ${loadingDetails.topic} (${loadingDetails.subject}): ${error}`);
                setLoadingDetails(null);
            }
        }
    }, [questions, isLoading, error, navigate, loadingDetails, clearQuiz]);


    // --- Helper to render selection buttons ---
    const renderButtons = (items, selectedItem, handler, disabled = false, isTopic = false) => {
        const itemKeys = Array.isArray(items) ? items : Object.keys(items);

        return itemKeys.map((key) => {
            const label = Array.isArray(items) ? key : (items[key]?.label || key);
            const isSelected = selectedItem === key;
            const clickHandler = isTopic ? () => handleStartQuiz(key) : () => handler(key);
            const buttonDisabled = disabled || (isLoading && !isTopic) || (isLoading && isTopic && loadingDetails?.topic !== key);
            const buttonLoading = isTopic && isLoading && loadingDetails?.topic === key;

            return (
                <button
                    key={key}
                    onClick={clickHandler}
                    disabled={buttonDisabled}
                    className={`w-full text-left px-4 py-2 rounded-lg transition duration-150 ease-in-out border-2 text-sm
                        ${isSelected ? 'bg-blue-600 border-blue-700 text-white font-semibold ring-2 ring-blue-400 ring-offset-2 ring-offset-zinc-900' : 'bg-zinc-700 border-zinc-600 hover:bg-zinc-600 hover:border-zinc-500 text-zinc-300'}
                        ${buttonDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        ${buttonLoading ? 'animate-pulse bg-blue-700' : ''}
                    `}
                >
                    {buttonLoading ? 'Loading...' : label}
                </button>
            );
        });
    };


    // --- Main Component Return ---
    return (
        <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8 font-sans">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-300">Start Your Practice Session</h1>

            {/* General Loading/Error Area */}
            {isLoading && loadingDetails && (
                <div className="bg-blue-900 border border-blue-700 text-blue-200 px-4 py-2 rounded-md mb-4 text-center text-sm">
                    Generating {loadingDetails.topic} questions for {loadingDetails.subject} ({loadingDetails.examType}, {loadingDetails.grade})...
                </div>
            )}
            {fetchError && !isLoading && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-2 rounded-md mb-4 text-center text-sm">
                    Error: {fetchError}
                </div>
            )}

            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* --- Grade Selection --- */}
                <div className="bg-zinc-800 p-4 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-3 border-b border-zinc-700 pb-2 text-blue-400">1. Select Grade</h2>
                    <div className="space-y-2">
                        {renderButtons(curriculumData, selectedGrade, handleGradeSelect)}
                    </div>
                </div>

                {/* --- Exam Type Selection --- */}
                <div className={`bg-zinc-800 p-4 rounded-xl shadow-lg ${!selectedGrade ? 'opacity-50' : ''}`}>
                    <h2 className="text-xl font-semibold mb-3 border-b border-zinc-700 pb-2 text-blue-400">2. Select Exam Type</h2>
                    <div className="space-y-2">
                        {selectedGrade
                            ? renderButtons(curriculumData[selectedGrade].exams, selectedExamType, handleExamTypeSelect, !selectedGrade)
                            : <p className="text-zinc-500 text-sm px-1 pt-2">Select a grade first.</p>}
                    </div>
                </div>

                {/* --- Subject Selection --- */}
                <div className={`bg-zinc-800 p-4 rounded-xl shadow-lg ${!selectedExamType ? 'opacity-50' : ''}`}>
                    <h2 className="text-xl font-semibold mb-3 border-b border-zinc-700 pb-2 text-blue-400">3. Select Subject</h2>
                    <div className="space-y-2">
                        {selectedExamType && availableSubjects.length > 0
                            ? renderButtons(curriculumData[selectedGrade].exams[selectedExamType].subjects, selectedSubject, handleSubjectSelect, !selectedExamType)
                            : <p className="text-zinc-500 text-sm px-1 pt-2">Select grade and exam type.</p>}
                    </div>
                </div>

                {/* --- Topic Selection --- */}
                <div className={`bg-zinc-800 p-4 rounded-xl shadow-lg ${!selectedSubject ? 'opacity-50' : ''}`}>
                    <h2 className="text-xl font-semibold mb-3 border-b border-zinc-700 pb-2 text-blue-400">4. Select Topic & Start</h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2"> {/* Added scroll for long topic lists */}
                        {selectedSubject && availableTopics.length > 0
                            ? renderButtons(availableTopics, null, handleStartQuiz, !selectedSubject || isLoading, true) // isTopic=true
                            : <p className="text-zinc-500 text-sm px-1 pt-2">Select grade, exam, and subject.</p>}
                     </div>
                </div>
            </div>
        </div>
    );
}