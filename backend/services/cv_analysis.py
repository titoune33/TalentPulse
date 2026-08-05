from transformers import pipeline
import os
from typing import List

class CVAnalysisService:
    def __init__(self):
        self._skill_extractor = None
        self._text_classifier = None

    @property
    def skill_extractor(self):
        if self._skill_extractor is None:
            self._skill_extractor = pipeline(
                "feature-extraction",
                model="sentence-transformers/all-MiniLM-L6-v2",
                device=-1  # CPU
            )
        return self._skill_extractor

    @property
    def text_classifier(self):
        if self._text_classifier is None:
            self._text_classifier = pipeline(
                "text-classification",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                device=-1
            )
        return self._text_classifier

    def extract_skills(self, cv_text: str) -> List[str]:
        """Extraire les compétences d'un CV."""
        skills_keywords = [
            "Python", "JavaScript", "React", "Next.js", "FastAPI", "SQL",
            "Machine Learning", "Data Analysis", "Project Management",
            "Communication", "Team Leadership", "Problem Solving",
            "HTML", "CSS", "TypeScript", "Node.js", "Express", "MongoDB",
            "PostgreSQL", "Docker", "AWS", "Git", "GitHub", "CI/CD"
        ]
        found_skills = []
        for skill in skills_keywords:
            if skill.lower() in cv_text.lower():
                found_skills.append(skill)
        return found_skills

    def match_cv_job(self, cv_text: str, job_description: str) -> float:
        """Calculer un score de matching entre un CV et une offre."""
        try:
            cv_embedding = self.skill_extractor(cv_text)[0][0]
            job_embedding = self.skill_extractor(job_description)[0][0]
            dot_product = sum(a * b for a, b in zip(cv_embedding, job_embedding))
            norm_cv = sum(a ** 2 for a in cv_embedding) ** 0.5
            norm_job = sum(b ** 2 for b in job_embedding) ** 0.5
            similarity = dot_product / (norm_cv * norm_job) if norm_cv * norm_job != 0 else 0
            return float(similarity * 100)
        except Exception as e:
            print(f"Error in CV matching: {e}")
            return 0.0
