import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiFillEye, AiFillHeart } from "react-icons/ai";
import { FaCommentDots, FaEdit } from "react-icons/fa";
import "./ActivityTab.css";

function ActivityTab() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyActivity();
  }, []);

  const fetchMyActivity = async () => {
    try {
      const token = localStorage.getItem('accessToken') || 
                    sessionStorage.getItem('accessToken');
      
      const headers = { Authorization: `Bearer ${token}` };

      const postsRes = await axios.get(`${API_BASE_URL}/api/posts/my-posts`, { headers });
      setMyPosts(postsRes.data);

      const commentsRes = await axios.get(`${API_BASE_URL}/api/posts/my-comments`, { headers });
      setMyComments(commentsRes.data);

      setLoading(false);
    } catch (err) {
      console.error('활동 내역 조회 실패:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="activity-tab">로딩 중...</div>;
  }

  return (
    <div className="activity-tab">
      <section className="activity-section">
        <h3>내가 쓴 글 ({myPosts.length})</h3>
        {myPosts.length > 0 ? (
          <ul className="activity-list">
            {myPosts.map(post => (
              <li 
                key={post.id} 
                className="activity-item"
                onClick={() => navigate(`/community/${post.id}`)}
              >
                <div className="activity-content">
                  <h4>{post.title}</h4>
                  <p>{post.content.substring(0, 100)}{post.content.length > 100 ? '...' : ''}</p>
                </div>
                <div className="activity-meta">
                  <span><AiFillEye /> {post.viewCount}</span>
                  <span><AiFillHeart /> {post.likeCount}</span>
                  <span><FaCommentDots /> {post.commentCount}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-message">작성한 글이 없습니다.</p>
        )}
      </section>

      <section className="activity-section">
        <h3>내가 쓴 댓글 ({myComments.length})</h3>
        {myComments.length > 0 ? (
          <ul className="activity-list">
            {myComments.map(comment => (
              <li 
                key={comment.id} 
                className="activity-item"
                onClick={() => navigate(`/community/${comment.postId}`)}
              >
                <div className="activity-content">
                  <h4><FaEdit /> {comment.postTitle}</h4>
                  <p>{comment.content}</p>
                </div>
                <div className="activity-meta">
                  <span><AiFillHeart /> {comment.likeCount}</span>
                  <span>{comment.createdAt}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-message">작성한 댓글이 없습니다.</p>
        )}
      </section>
    </div>
  );
}

export default ActivityTab;