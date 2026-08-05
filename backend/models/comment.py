from pydantic import BaseModel
from typing import Optional

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: str
    user_id: str
    post_id: str
    created_at: str