from pydantic import BaseModel
from typing import Optional, List

class PostBase(BaseModel):
    title: Optional[str] = None
    content: str
    tags: Optional[List[str]] = []

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: str
    user_id: str
    created_at: str
    updated_at: str
    comments: List[str] = []
    likes: List[str] = []