import logging
import re
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class CVAnalysisService:
    def extract_skills(self, cv_text):
        skill_keywords = ['Python', 'JavaScript', 'React', 'Node.js', 'TypeScript', 'Java',
            'SQL', 'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS',
            'Machine Learning', 'Deep Learning', 'NLP', 'Data Analysis',
            'Project Management', 'Agile', 'Scrum', 'JIRA', 'Git',
            'Communication', 'Team Leadership', 'Problem Solving']
        cv_lower = cv_text.lower()
        return [skill for skill in skill_keywords if skill.lower() in cv_lower]
    
    def analyze_cv(self, cv_text, job_description=None):
        skills = self.extract_skills(cv_text)
        match_results = {}
        if job_description:
            job_skills = self.extract_skills(job_description)
            cv_skills_lower = [s.lower() for s in skills]
            job_skills_lower = [s.lower() for s in job_skills]
            common = list(set(cv_skills_lower) & set(job_skills_lower))
            missing = list(set(job_skills_lower) - set(cv_skills_lower))
            match_score = len(common) / max(len(job_skills_lower), 1) * 100
            match_results = {"match_score": round(match_score, 1), "common_skills": common, "missing_skills": missing}
        return {"skills": skills, "match_results": match_results}