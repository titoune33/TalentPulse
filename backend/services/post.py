import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class PostService:
    def __init__(self):
        self.posts = {}
        self.comments = {}
    
    def create_post(self, post_data, user_id):
        post_id = f"post_{len(self.posts) + 1}"
        post = {
            "id": post_id,
            "user_id": user_id,
            "title": post_data.get("title"),
            "content": post_data.get("content"),
            "tags": post_data.get("tags", []),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "comments": [],
            "likes": [],
        }
        self.posts[post_id] = post
        return post
    
    def get_posts(self, user_id=None):
        posts = list(self.posts.values())
        if user_id:
            posts = [p for p in posts if p["user_id"] == user_id]
        return sorted(posts, key=lambda x: x["created_at"], reverse=True)