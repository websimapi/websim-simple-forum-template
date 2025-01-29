function CategoryList({ room, isCreator, onSelectCategory }) {
  const [showModal, setShowModal] = useState(false);
  const categories = useSyncExternalStore(
    room.collection('category').subscribe,
    room.collection('category').getList
  );

  const handleCreate = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    await room.collection('category').create({
      name: formData.get('name'),
      description: formData.get('description')
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
        <div key={category.id} className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">{category.name}</h3>
              <p>{category.description}</p>
            </div>
            <button className="button" onClick={() => onSelectCategory(category)}>
              View Topics
            </button>
          </div>
        </div>
      ))}

      {showModal && (
        <Modal title="Create Category" onClose={() => setShowModal(false)}>
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