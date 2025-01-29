function ThreadList({ room, topic, onSelectThread, onBack }) {
  const [showModal, setShowModal] = useState(false);
  const threads = useSyncExternalStore(
    room.collection('thread').filter({ topic_id: topic.id }).subscribe,
    room.collection('thread').filter({ topic_id: topic.id }).getList
  );

  const handleCreate = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const tags = formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean);
    
    await room.collection('thread').create({
      topic_id: topic.id,
      title: formData.get('title'),
      content: formData.get('content'),
      tags
    });
    setShowModal(false);
  };

  return (
    <div>
      <div className="navigation">
        <a onClick={onBack}>← Back to Topics</a>
      </div>

      <h2>{topic.name}</h2>
      
      <button className="button" onClick={() => setShowModal(true)}>
        Create Thread
      </button>

      {threads.map(thread => (
        <div key={thread.id} className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">{thread.title}</h3>
              <div className="post-meta">
                by {thread.username} • {new Date(thread.created_at).toLocaleDateString()}
              </div>
              <div className="tags">
                {thread.tags.map((tag, i) => (
                  <span key={i} className="tag">{tag}</span>
                ))}
              </div>
            </div>
            <button className="button" onClick={() => onSelectThread(thread)}>
              View Thread
            </button>
          </div>
        </div>
      ))}

      {showModal && (
        <Modal title="Create Thread" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Title</label>
              <input name="title" required />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea name="content" required></textarea>
            </div>
            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input name="tags" placeholder="tag1, tag2, tag3" />
            </div>
            <button type="submit" className="button">Create</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function ThreadView({ room, thread, onBack }) {
  const posts = useSyncExternalStore(
    room.collection('post').filter({ thread_id: thread.id }).subscribe,
    room.collection('post').filter({ thread_id: thread.id }).getList
  );

  const handlePost = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    await room.collection('post').create({
      thread_id: thread.id,
      content: formData.get('content')
    });
    event.target.reset();
  };

  const handleDelete = async (postId) => {
    await room.collection('post').delete(postId);
  };

  return (
    <div>
      <div className="navigation">
        <a onClick={onBack}>← Back to Threads</a>
      </div>

      <div className="card">
        <h2>{thread.title}</h2>
        <div className="post">
          <div className="post-header">
            <img 
              src={`https://images.websim.ai/avatar/${thread.username}`}
              alt={`${thread.username}'s avatar`}
              className="avatar"
            />
            <div>
              <strong>{thread.username}</strong>
              <div className="post-meta">
                {new Date(thread.created_at).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="post-content">{thread.content}</div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handlePost}>
          <div className="form-group">
            <label>Reply</label>
            <textarea name="content" required></textarea>
          </div>
          <button type="submit" className="button">Post Reply</button>
        </form>
      </div>

      <div className="card">
        {posts.map(post => (
          <div key={post.id} className="post">
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
            <div className="post-content">{post.content}</div>
            {post.username === room.party.client.username && (
              <button className="button" onClick={() => handleDelete(post.id)}>
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}