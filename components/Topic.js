function TopicList({ room, category, isCreator, onSelectTopic, onBack }) {
  const [showModal, setShowModal] = useState(false);
  const topics = useSyncExternalStore(
    room.collection('topic').filter({ category_id: category.id }).subscribe,
    room.collection('topic').filter({ category_id: category.id }).getList
  );

  const handleCreate = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    await room.collection('topic').create({
      category_id: category.id,
      name: formData.get('name'),
      description: formData.get('description')
    });
    setShowModal(false);
  };

  return (
    <div>
      <div className="navigation">
        <a onClick={onBack}>← Back to Categories</a>
      </div>

      <h2>{category.name}</h2>
      
      {isCreator && (
        <button className="button" onClick={() => setShowModal(true)}>
          Create Topic
        </button>
      )}

      {topics.map(topic => (
        <div key={topic.id} className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">{topic.name}</h3>
              <p>{topic.description}</p>
            </div>
            <button className="button" onClick={() => onSelectTopic(topic)}>
              View Threads
            </button>
          </div>
        </div>
      ))}

      {showModal && (
        <Modal title="Create Topic" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Name</label>
              <input name="name" required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" required></textarea>
            </div>
            <button type="submit" className="button">Create</button>
          </form>
        </Modal>
      )}
    </div>
  );
}