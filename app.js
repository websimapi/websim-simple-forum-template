const { useState, useEffect, useSyncExternalStore } = React;

function ForumApp() {
  const room = new WebsimSocket();
  
  const posts = useSyncExternalStore(
    room.collection('post').filter({ parent_id: null }).subscribe,
    room.collection('post').filter({ parent_id: null }).getList
  );

  return (
    <div className="container">
      <header className="header">
        <h1>Simple Forum</h1>
      </header>
      
      <PostForm room={room} />
      
      <div className="posts">
        {posts.map(post => (
          <Post key={post.id} post={post} room={room} />
        ))}
      </div>
    </div>
  );
}

function PostForm({ room, parentId = null }) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await room.collection('post').create({
        content: content.trim(),
        parent_id: parentId
      });
      setContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <form className={parentId ? 'reply-form' : 'post-form'} onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "Write a reply..." : "What's on your mind?"}
      />
      <button type="submit" className="button">
        {parentId ? 'Reply' : 'Post'}
      </button>
    </form>
  );
}

function Post({ post, room }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  const replies = useSyncExternalStore(
    room.collection('post').filter({ parent_id: post.id }).subscribe,
    room.collection('post').filter({ parent_id: post.id }).getList
  );

  const handleDelete = async () => {
    try {
      await room.collection('post').delete(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="post">
      <div className="post-header">
        <img 
          src={`https://images.websim.ai/avatar/${post.username}`}
          alt={`${post.username}'s avatar`}
          className="avatar"
        />
        <div>
          <strong>{post.username}</strong>
          <div className="post-meta">
            {new Date(post.created_at).toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="post-content">
        {post.content}
      </div>
      
      <div className="post-actions">
        <button onClick={() => setShowReplyForm(!showReplyForm)}>
          💬 Reply
        </button>
        {post.username === room.party.client.username && (
          <button onClick={handleDelete}>
            🗑️ Delete
          </button>
        )}
      </div>

      {showReplyForm && (
        <PostForm room={room} parentId={post.id} />
      )}

      {replies.length > 0 && (
        <div className="replies">
          {replies.map(reply => (
            <Post key={reply.id} post={reply} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}

ReactDOM.render(<ForumApp />, document.getElementById('root'));