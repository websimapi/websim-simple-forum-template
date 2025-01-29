const { useState, useEffect, useSyncExternalStore } = React;

function Forum() {
  const [room] = useState(() => new WebsimSocket());
  const [view, setView] = useState('categories');
  const [category, setCategory] = useState(null);
  const [topic, setTopic] = useState(null);
  const [thread, setThread] = useState(null);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    async function checkCreator() {
      const creator = await window.websim.getCreatedBy();
      setIsCreator(creator.username === room.party.client.username);
    }
    checkCreator();
  }, []);

  const renderContent = () => {
    switch (view) {
      case 'categories':
        return (
          <CategoryList
            room={room}
            isCreator={isCreator}
            onSelectCategory={category => {
              setCategory(category);
              setView('topics');
            }}
          />
        );
      case 'topics':
        return (
          <TopicList
            room={room}
            category={category}
            isCreator={isCreator}
            onSelectTopic={topic => {
              setTopic(topic);
              setView('threads');
            }}
            onBack={() => {
              setCategory(null);
              setView('categories');
            }}
          />
        );
      case 'threads':
        return (
          <ThreadList
            room={room}
            topic={topic}
            onSelectThread={thread => {
              setThread(thread);
              setView('thread');
            }}
            onBack={() => {
              setTopic(null);
              setView('topics');
            }}
          />
        );
      case 'thread':
        return (
          <ThreadView
            room={room}
            thread={thread}
            onBack={() => {
              setThread(null);
              setView('threads');
            }}
          />
        );
      default:
        return <div>Invalid view</div>;
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Forum</h1>
      </header>
      {renderContent()}
    </div>
  );
}

function CategoryList({ room, isCreator, onSelectCategory }) {
  const [showModal, setShowModal] = useState(false);
  
  const categories = useSyncExternalStore(
    room.collection('category').subscribe,
    room.collection('category').getList
  );

  const handleCreateCategory = async (data) => {
    await room.collection('category').create({
      name: data.name,
      description: data.description
    });
    setShowModal(false);
  };

  return (
    <div>
      {isCreator && (
        <button className="button" onClick={() => setShowModal(true)}>
          Create Category
        </button>
      )}

      {categories.map(category => (
        <div key={category.id} className="category">
          <div className="category-header">
            <div>
              <h2>{category.name}</h2>
              <p>{category.description}</p>
            </div>
            <button 
              className="button"
              onClick={() => onSelectCategory(category)}
            >
              View Topics
            </button>
          </div>
        </div>
      ))}

      {showModal && (
        <CreateModal
          title="Create Category"
          onSubmit={handleCreateCategory}
          onClose={() => setShowModal(false)}
          fields={[
            { name: 'name', label: 'Category Name', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' }
          ]}
        />
      )}
    </div>
  );
}

function TopicList({ room, category, isCreator, onSelectTopic, onBack }) {
  const [showModal, setShowModal] = useState(false);
  
  const topics = useSyncExternalStore(
    room.collection('topic').filter({ category_id: category.id }).subscribe,
    room.collection('topic').filter({ category_id: category.id }).getList
  );

  const handleCreateTopic = async (data) => {
    await room.collection('topic').create({
      category_id: category.id,
      name: data.name,
      description: data.description
    });
    setShowModal(false);
  };

  return (
    <div>
      <div className="breadcrumb">
        <a href="#" onClick={onBack}>Categories</a>
        <span>›</span>
        <span>Topics</span>
      </div>

      {isCreator && (
        <button className="button" onClick={() => setShowModal(true)}>
          Create Topic
        </button>
      )}

      <div className="topic-list">
        {topics.map(topic => (
          <div key={topic.id} className="topic-item">
            <div>
              <h3>{topic.name}</h3>
              <p>{topic.description}</p>
            </div>
            <button 
              className="button"
              onClick={() => onSelectTopic(topic)}
            >
              View Threads
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <CreateModal
          title="Create Topic"
          onSubmit={handleCreateTopic}
          onClose={() => setShowModal(false)}
          fields={[
            { name: 'name', label: 'Topic Name', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' }
          ]}
        />
      )}
    </div>
  );
}

function ThreadList({ room, topic, onSelectThread, onBack }) {
  const [showModal, setShowModal] = useState(false);
  
  const threads = useSyncExternalStore(
    room.collection('thread').filter({ topic_id: topic.id }).subscribe,
    room.collection('thread').filter({ topic_id: topic.id }).getList
  );

  const handleCreateThread = async (data) => {
    await room.collection('thread').create({
      topic_id: topic.id,
      title: data.title,
      content: data.content,
      tags: data.tags.split(',').map(tag => tag.trim())
    });
    setShowModal(false);
  };

  return (
    <div>
      <div className="breadcrumb">
        <a href="#" onClick={onBack}>Topics</a>
        <span>›</span>
        <span>Threads</span>
      </div>

      <button className="button" onClick={() => setShowModal(true)}>
        Create Thread
      </button>

      <div className="thread-list">
        {threads.map(thread => (
          <div key={thread.id} className="thread-item">
            <div className="thread-header">
              <h3 className="thread-title">{thread.title}</h3>
              <div className="thread-meta">
                <span>by {thread.username}</span>
                <span>{new Date(thread.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="tags">
              {thread.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
            <button 
              className="button"
              onClick={() => onSelectThread(thread)}
            >
              View Thread
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <CreateModal
          title="Create Thread"
          onSubmit={handleCreateThread}
          onClose={() => setShowModal(false)}
          fields={[
            { name: 'title', label: 'Thread Title', type: 'text' },
            { name: 'content', label: 'Content', type: 'textarea' },
            { name: 'tags', label: 'Tags (comma-separated)', type: 'text' }
          ]}
        />
      )}
    </div>
  );
}

function ThreadView({ room, thread, onBack }) {
  const posts = useSyncExternalStore(
    room.collection('post').filter({ thread_id: thread.id }).subscribe,
    room.collection('post').filter({ thread_id: thread.id }).getList
  );

  return (
    <div>
      <div className="breadcrumb">
        <a href="#" onClick={onBack}>Threads</a>
        <span>›</span>
        <span>{thread.title}</span>
      </div>

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
        <div className="post-content">
          {thread.content}
        </div>
      </div>

      <PostForm room={room} threadId={thread.id} />

      <div className="posts">
        {posts.map(post => (
          <Post key={post.id} post={post} room={room} />
        ))}
      </div>
    </div>
  );
}

function CreateModal({ title, onSubmit, onClose, fields }) {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.name] || ''}
                  onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                />
              ) : (
                <input
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                />
              )}
            </div>
          ))}
          <div className="button-group">
            <button type="submit" className="button">Create</button>
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PostForm({ room, threadId }) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await room.collection('post').create({
        content: content.trim(),
        thread_id: threadId
      });
      setContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
      />
      <button type="submit" className="button">Post Reply</button>
    </form>
  );
}

function Post({ post, room }) {
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
        {post.username === room.party.client.username && (
          <button onClick={handleDelete}>
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Forum />);