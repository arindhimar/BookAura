import PropTypes from "prop-types"

function SettingsPanel({ darkMode, setDarkMode }) {
  return (
    <div className="settings-panel">
      <label className="flex items-center">
        <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} className="mr-2" />
        Dark Mode
      </label>
    </div>
  )
}

SettingsPanel.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  setDarkMode: PropTypes.func.isRequired,
}

export default SettingsPanel

