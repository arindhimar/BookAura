import PropTypes from "prop-types"

function Sidebar({ currentPage, totalPages }) {
  return (
    <div className="w-64 bg-gray-100 p-4 mr-4">
      <h2 className="text-xl font-bold mb-4">Sidebar</h2>
      <p>Current Page: {currentPage}</p>
      <p>Total Pages: {totalPages}</p>
      {/* Add thumbnails and bookmarks here */}
    </div>
  )
}

Sidebar.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
}

export default Sidebar

