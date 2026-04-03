import { createContext, useContext, useState, useCallback } from 'react';

const AssessmentContext = createContext(null);

export function AssessmentProvider({ children }) {
  const [userInfo, setUserInfo] = useState({
    name: '',
    organization: '',
    department: '',
    job_level: '',
    experience_years: '',
  });

  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [result, setResult] = useState(null);

  const updateSurveyAnswer = useCallback((questionId, value) => {
    setSurveyAnswers(prev => ({ ...prev, [`q${questionId}`]: value }));
  }, []);

  const updateQuizAnswer = useCallback((questionId, value) => {
    setQuizAnswers(prev => ({ ...prev, [`q${questionId}`]: value }));
  }, []);

  const resetAll = useCallback(() => {
    setUserInfo({ name: '', organization: '', department: '', job_level: '', experience_years: '' });
    setSurveyAnswers({});
    setQuizAnswers({});
    setResult(null);
  }, []);

  return (
    <AssessmentContext.Provider value={{
      userInfo, setUserInfo,
      surveyAnswers, setSurveyAnswers, updateSurveyAnswer,
      quizAnswers, setQuizAnswers, updateQuizAnswer,
      result, setResult,
      resetAll,
    }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error('useAssessment must be used within AssessmentProvider');
  return ctx;
}
